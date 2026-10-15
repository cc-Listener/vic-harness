import { lstat, realpath, readFile, readdir, mkdtemp, writeFile, rm, open } from 'node:fs/promises';
import { resolve, join, dirname, isAbsolute, delimiter } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { observeProcess, processVerdict } from './git-check-process.mjs';

const MAX_TIMEOUT = 120000;
const forbidden = /(^|\/)(\.git|\.codex|\.claude|\.agents|\.ua|\.understand-anything)(\/|$)|^(topology\.yaml|(?:roles|bridges)\/[^/]+\.md)$/i;
const base = ['--no-pager', '-c', 'core.fsmonitor=false', '-c', 'core.untrackedCache=false', '-c', 'core.pager=cat', '-c', 'core.attributesFile=/dev/null'];
const limitations = [
  '仅检查列出的 tracked 文件的 index→worktree 差异；staged-only 差异、untracked 文件及未选路径未检查。',
  '路径合法不代表读取授权或修改所有权；调用者须事先允许所列文件、Git 元数据及相关 .gitattributes 的读取。',
  '调用方须选用当前宿主已信任的 Git/RTK；入口核验及有限探针不证明供应链或全部行为，不隔离并发写入或恶意进程，无法强制上层如实复述。',
];
function fail(reason) { throw new Error(reason); }
async function exists(path) { try { return await lstat(path); } catch (e) { if (e.code === 'ENOENT') return null; throw e; } }
async function plain(path, kind = 'file') {
  const stat = await lstat(path);
  if (stat.isSymbolicLink() || (kind === 'file' ? !stat.isFile() : !stat.isDirectory())) fail('symlink_or_wrong_type');
  return stat;
}
async function safeFile(root, path) {
  let current = root;
  const parts = path.split('/');
  for (let i = 0; i < parts.length; i++) {
    current = join(current, parts[i]);
    await plain(current, i === parts.length - 1 ? 'file' : 'directory');
  }
  return current;
}
function validPath(path) {
  return typeof path === 'string' && path.length > 0 && !isAbsolute(path) && !/[\0\r\n\\*?\[\]]/.test(path)
    && !path.startsWith(':') && !path.split('/').some(p => !p || p === '.' || p === '..') && !forbidden.test(path);
}
async function nativeTool(requested, name) {
  if (process.platform === 'win32') fail('unsupported_native_tool_platform');
  let candidate = requested;
  if (!candidate) {
    for (const dir of (process.env.PATH || '').split(delimiter).filter(Boolean)) {
      const path = resolve(dir, name), s = await exists(path);
      if (s && (s.mode & 0o111)) { candidate = path; break; }
    }
  }
  if (!candidate || !isAbsolute(candidate)) fail(`unqualified_${name}_executable`);
  const target = await realpath(candidate);
  const s = await plain(target);
  if (!(s.mode & 0o111)) fail(`unqualified_${name}_executable`);
  const file = await open(target, 'r'), header = Buffer.alloc(4);
  try { await file.read(header, 0, 4, 0); } finally { await file.close(); }
  const magic = header.toString('hex');
  if (!['7f454c46', 'cffaedfe', 'feedfacf', 'cafebabe', 'bebafeca'].includes(magic)) fail(`unqualified_${name}_executable`);
  return { entry: candidate, realpath: target };
}

async function qualifyProxy(git, rtk, runAt) {
  const root = await mkdtemp(join(tmpdir(), 'vic-git-proxy-qualification-'));
  const evidence = [];
  const run = (executable, argv) => runAt(executable, argv, root);
  try {
    for (const argv of [['init', '-q'], ['add', '--', 'probe.txt']]) {
      if (argv[0] === 'add') await writeFile(join(root, 'probe.txt'), 'base\n');
      const setup = await run(git, [...base, ...argv]);
      if (processVerdict(setup) !== 'passed') return { confirmed: false, probes: [{ kind: `setup-${argv[0]}`, direct: setup, confirmed: false }] };
    }
    const argv = [...base, 'diff', '--check', '--no-ext-diff', '--no-textconv', '--ignore-submodules=all', '--', ':(literal)probe.txt'];
    for (const [kind, text, expected] of [['clean', 'base\n', 0], ['whitespace-error', 'base\n\n', 2]]) {
      await writeFile(join(root, 'probe.txt'), text);
      const direct = await run(git, argv), proxy = await run(rtk, ['proxy', git, ...argv]);
      const confirmed = direct.capture_complete && proxy.capture_complete && !direct.signal && !proxy.signal
        && direct.exit_code === expected && proxy.exit_code === direct.exit_code && direct.stdout === proxy.stdout && direct.stderr === proxy.stderr;
      evidence.push({ kind, direct, proxy, confirmed });
      if (!confirmed) return { confirmed: false, probes: evidence };
    }
    return { confirmed: true, probes: evidence };
  } finally { await rm(root, { recursive: true, force: true }); }
}
function qualifyConfig(text) {
  // 有意只接受普通仓库配置的小子集；未知语法和 include 不交给 Git 求值。
  let section = '', bare = false, format = false;
  const keys = {
    core: new Set(['repositoryformatversion', 'filemode', 'bare', 'logallrefupdates', 'ignorecase', 'precomposeunicode', 'symlinks', 'whitespace', 'autocrlf', 'safecrlf', 'eol', 'quotepath']),
    user: new Set(['name', 'email']), remote: new Set(['url', 'fetch']), branch: new Set(['remote', 'merge']),
  };
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || /^\s*[#;]/.test(line)) continue;
    const header = /^\s*\[(core|user|remote|branch)(?: "[^"\\\r\n]+")?\]\s*$/i.exec(line);
    if (header) { section = header[1].toLowerCase(); continue; }
    const item = /^\s*([a-z][a-z0-9-]*)\s*=\s*([^\\\x00-\x08\x0b\x0c\x0e-\x1f]*)$/i.exec(line);
    if (!item || !keys[section]?.has(item[1].toLowerCase())) fail('unqualified_repository_config');
    const key = item[1].toLowerCase(), value = item[2].trim();
    if ((value.match(/"/g)?.length ?? 0) % 2) fail('unqualified_repository_config');
    if (section === 'core' && key === 'bare') { if (value !== 'false') fail('unqualified_repository_config'); bare = true; }
    if (section === 'core' && key === 'repositoryformatversion') { if (value !== '0') fail('unqualified_repository_config'); format = true; }
    if (section === 'core' && ['filemode', 'logallrefupdates', 'ignorecase', 'precomposeunicode', 'symlinks', 'safecrlf', 'quotepath'].includes(key)
      && !['true', 'false', ...(key === 'safecrlf' ? ['warn'] : [])].includes(value)) fail('unqualified_repository_config');
    if (section === 'core' && key === 'autocrlf' && !['true', 'false', 'input'].includes(value)) fail('unqualified_repository_config');
    if (section === 'core' && key === 'eol' && !['lf', 'crlf', 'native'].includes(value)) fail('unqualified_repository_config');
    if (section === 'core' && key === 'whitespace' && !value.split(',').every(v => /^-?(blank-at-eol|blank-at-eof|space-before-tab|indent-with-non-tab|tab-in-indent|cr-at-eol|trailing-space|tabwidth=[1-9][0-9]?)$/.test(v.trim()))) fail('unqualified_repository_config');
  }
  if (!bare || !format) fail('unqualified_repository_config');
}
async function metadata(root, paths, reads) {
  reads.push('.git', '.git/config', '.git/index', '.git/objects', '.git/HEAD', '.git/refs', '.git/packed-refs');
  const gitdir = join(root, '.git'); await plain(gitdir, 'directory');
  const config = await plain(join(gitdir, 'config'));
  if (config.size > 65536) fail('unqualified_repository_config');
  qualifyConfig(await readFile(join(gitdir, 'config'), 'utf8'));
  await plain(join(gitdir, 'index'));
  await plain(join(gitdir, 'HEAD'));
  const packed = await exists(join(gitdir, 'packed-refs'));
  if (packed) await plain(join(gitdir, 'packed-refs'));
  // 先核验父目录，再探测其下可选元数据，避免 lstat 穿越中间软链。
  if (await exists(join(gitdir, 'info'))) await plain(join(gitdir, 'info'), 'directory');
  await plain(join(gitdir, 'objects'), 'directory');
  if (await exists(join(gitdir, 'objects/info'))) await plain(join(gitdir, 'objects/info'), 'directory');
  for (const path of ['commondir', 'config.worktree', 'info/attributes', 'objects/info/alternates', 'objects/info/http-alternates']) {
    if (await exists(join(gitdir, path))) fail('unqualified_repository_metadata');
  }
  if ((await readdir(gitdir)).some(p => p.startsWith('sharedindex.'))) fail('unqualified_repository_metadata');
  let count = 0;
  async function inspectObjects(path) {
    if (++count > 10000) fail('repository_metadata_limit');
    const s = await lstat(path);
    if (s.isSymbolicLink() || (!s.isFile() && !s.isDirectory())) fail('unqualified_repository_metadata');
    if (s.isDirectory()) for (const name of await readdir(path)) await inspectObjects(join(path, name));
  }
  await inspectObjects(join(gitdir, 'objects'));
  await inspectObjects(join(gitdir, 'refs'));
  const attributes = new Set(['.gitattributes']);
  for (const path of paths) {
    let dir = dirname(path);
    while (dir !== '.') { attributes.add(`${dir}/.gitattributes`); dir = dirname(dir); }
  }
  for (const path of attributes) {
    reads.push(path); // 工作树不存在时，Git 也可能从 index 读取属性；这是可能读取范围。
    if (await exists(join(root, path))) await safeFile(root, path);
  }
  return reads;
}
function notRun(reason) {
  return { status: 'not-run', exit_code: null, signal: null, stdout: '', stderr: '', capture_complete: false,
    timed_out: false, truncated: false, startup_error: null, reason };
}
function summarize(result) {
  const words = { passed: '通过', failed: '失败', unknown: '未确认' };
  return `Git 空白检查${words[result.verdict]}；比较 index→worktree；已检查文件 ${JSON.stringify(result.scope.checked_paths)}；直接观察 ${result.execution.observed_process}；阶段 ${result.execution.phase ?? '未启动'}；退出码 ${result.execution.exit_code ?? '未知'}；原因 ${result.execution.reason ?? '正常结束'}；资格拒绝 ${result.scope.rejection_reason ?? '无'}。staged-only、untracked 及未选路径未检查。`;
}

export async function checkGitWhitespace(options) {
  const result = { version: 1, scope: { root: null, comparison: 'index-to-worktree', requested_paths: [], checked_paths: [], untracked_paths: [], metadata_reads: [], rejection_reason: null },
    command_form: null, execution: { ...notRun('invalid_options'), observed_process: 'none' }, verdict: 'unknown', report: '', limitations: [...limitations] };
  try {
    if (!options || typeof options !== 'object' || Array.isArray(options)) fail('invalid_options');
    if (Object.keys(options).some(k => !['root', 'paths', 'comparison', 'proxy', 'gitExecutable', 'rtkExecutable', 'timeoutMs'].includes(k))) fail('invalid_options');
    const { root, paths, comparison, proxy, timeoutMs = 30000 } = options;
    if (typeof root !== 'string' || !root || comparison !== 'index-to-worktree' || !['none', 'rtk'].includes(proxy)
      || !Array.isArray(paths) || paths.length === 0 || paths.some(p => !validPath(p))
      || !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > MAX_TIMEOUT) fail('invalid_scope_or_options');
    const deadline = Date.now() + timeoutMs;
    result.scope.requested_paths = [...new Set(paths)];
    const target = await realpath(resolve(root)); await plain(target, 'directory'); result.scope.root = target;
    for (const path of result.scope.requested_paths) await safeFile(target, path);
    result.scope.discarded_git_environment = Object.keys(process.env).filter(k => /^GIT_/i.test(k));
    const gitTool = await nativeTool(options.gitExecutable, 'git'), git = gitTool.realpath;
    result.tools = { git: gitTool };
    const env = { PATH: '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_SYSTEM: '/dev/null', GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0', GIT_ATTR_NOSYSTEM: '1' };
    const runAt = (executable, argv, cwd) => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) return Promise.resolve({ ...notRun('deadline_elapsed_before_launch'), status: 'timeout', timed_out: true, not_started: true });
      return observeProcess({ executable, argv, cwd, env, timeoutMs: remaining });
    };
    let rtk;
    if (proxy === 'rtk') {
      const rtkTool = await nativeTool(options.rtkExecutable, 'rtk'); rtk = rtkTool.realpath; result.tools.rtk = rtkTool;
      result.proxy_qualification = await qualifyProxy(git, rtk, runAt);
      result.limitations.push('只直接观察 RTK proxy 进程；退出传播仅由本轮自有临时仓库的两个固定 Git 正反例支持，不是目标内部 Git 退出码的直接观察或全部代理行为证明。');
      if (!result.proxy_qualification.confirmed) fail('unconfirmed_proxy_propagation');
    }
    await metadata(target, result.scope.requested_paths, result.scope.metadata_reads);
    const observe = argv => runAt(rtk ?? git, rtk ? ['proxy', git, ...argv] : argv, target);
    const literals = result.scope.requested_paths.map(p => `:(literal)${p}`);
    const listing = await observe([...base, 'ls-files', '--stage', '-v', '-z', '--', ...literals]);
    result.execution = { ...listing, observed_process: listing.not_started ? 'none' : rtk ? 'rtk-proxy' : 'git', phase: 'scope' };
    if (processVerdict(listing) !== 'passed') {
      result.execution.reason ??= 'scope_listing_failed'; fail('scope_listing_failed');
    }
    const tracked = new Set();
    for (const record of listing.stdout.split('\0').filter(Boolean)) {
      const match = /^H (100644|100755) [a-f0-9]+ 0\t([\s\S]+)$/.exec(record);
      if (!match || !result.scope.requested_paths.includes(match[2])) fail('unqualified_index_entry');
      tracked.add(match[2]);
    }
    result.scope.untracked_paths = result.scope.requested_paths.filter(p => !tracked.has(p));
    if (tracked.size === 0) fail('no_tracked_paths');
    const selected = result.scope.requested_paths.filter(p => tracked.has(p));
    const argv = [...base, 'diff', '--check', '--no-ext-diff', '--no-textconv', '--ignore-submodules=all', '--', ...selected.map(p => `:(literal)${p}`)];
    result.command_form = { executable: rtk ?? git, argv: rtk ? ['proxy', git, ...argv] : argv, shell: false, proxy };
    result.execution = { ...await observe(argv), observed_process: rtk ? 'rtk-proxy' : 'git', phase: 'check' };
    if (result.execution.not_started) result.execution.observed_process = 'none';
    result.scope.checked_paths = selected;
    result.verdict = processVerdict(result.execution);
  } catch (error) {
    result.scope.rejection_reason = ['ENOENT', 'EACCES', 'ENOTDIR'].includes(error.code) ? error.code : error.message;
    if (result.execution.status === 'not-run') result.execution.reason = result.scope.rejection_reason;
  }
  result.report = summarize(result); return result;
}

function parseCli(argv) {
  const result = { paths: [] }, names = { '--root': 'root', '--comparison': 'comparison', '--proxy': 'proxy' };
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i], value = argv[i + 1];
    if (!value) fail('invalid_cli');
    if (flag === '--path') result.paths.push(value);
    else if (names[flag] && result[names[flag]] === undefined) result[names[flag]] = value;
    else fail('invalid_cli');
  }
  return result;
}
// Node 模块 URL 使用规范路径；argv 也先解析宿主现有的目录别名。
let isMain = false;
try {
  if (process.argv[1]) isMain = import.meta.url === pathToFileURL(await realpath(process.argv[1])).href;
} catch { /* stdin/eval 或不存在的入口只导出 API。 */ }
if (isMain) {
  let options;
  try { options = parseCli(process.argv.slice(2)); } catch { options = null; }
  const result = await checkGitWhitespace(options);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exitCode = { passed: 0, failed: 1, unknown: 2 }[result.verdict];
}
