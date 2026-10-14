#!/usr/bin/env node
// Node >=18；只读断言，无 npm 依赖。snapshot 唯一写入点是仓库外的快照。
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, readdir, lstat, readlink, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { load, JSON_SCHEMA } from '../scripts/vendor/js-yaml.mjs';

const HELP = `用法（快照路径必须在目标仓库之外，父目录须已存在）：
  node evals/assert.mjs snapshot --root <repo> --expected <yaml> --out <before.json>
  # 第一次运行 skill 后，检查首轮并记录 first 快照：
  node evals/assert.mjs check --root <repo> --expected <yaml> --before <before.json> --phase first --json
  node evals/assert.mjs snapshot --root <repo> --expected <yaml> --out <first.json>
  # 第二次运行 skill 后，用 first 比较幂等性，before 比较外部内容保留：
  node evals/assert.mjs check --root <repo> --expected <yaml> --before <before.json> --first <first.json> --phase final --json
first 阶段的 idempotent 是 pending，只有 final 通过才算完整验收。
快照扫描整个真实文件树（含未跟踪、忽略和空目录），仅排除根 .git。
不跟随软链；外部段落按原始字节比较，忽略 fenced code 中的假标题。
yaml_paths 支持点号、[*]，操作为 contains/excludes（值精确匹配）、contains_any（非空候选数组）、equals、not_empty。
forbidden_text.pattern 为 JavaScript 正则；glob 支持 *、?、**，**/ 允许零层目录。
退出码：0=当前阶段通过，1=断言失败，2=参数、配置或基线错误。`;
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const fail = (message) => { throw new Error(message); };
const sectionKey = ({ file, heading }) => JSON.stringify([file, heading]);
const TOP_KEYS = new Set(['files_exist', 'files_unchanged', 'sections_unchanged', 'files_absent', 'max_lines', 'vic_check', 'yaml_paths', 'forbidden_text', 'idempotent', 'git_diff_only']);

function relativePath(value) {
  if (typeof value !== 'string' || !value || value.includes('\\') || path.posix.isAbsolute(value) || /^[A-Za-z]:/.test(value) || value.split('/').some((part) => !part || part === '.' || part === '..') || value === '.git' || value.startsWith('.git/')) fail(`路径须为非 .git 的规范相对路径：${value}`);
  return value;
}

function globRegex(glob) {
  relativePath(glob);
  let source = '^';
  for (let i = 0; i < glob.length; i++) {
    const ch = glob[i];
    if (ch === '*' && glob[i + 1] === '*') {
      if (glob[i + 2] === '/') { source += '(?:.*/)?'; i += 2; }
      else { source += '.*'; i++; }
    } else if (ch === '*') source += '[^/]*';
    else if (ch === '?') source += '[^/]';
    else source += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(source + '$');
}

function pathTokens(pointer) {
  if (typeof pointer !== 'string' || !/^[A-Za-z0-9_-]+(?:\[\*\])?(?:\.[A-Za-z0-9_-]+(?:\[\*\])?)*$/.test(pointer)) fail(`不支持的 YAML 路径：${pointer}`);
  return pointer.split('.').flatMap((token) => token.endsWith('[*]') ? [token.slice(0, -3), '*'] : [token]);
}

function yamlValues(data, pointer) {
  return pathTokens(pointer).reduce((values, token) => values.flatMap((value) => token === '*' ? (Array.isArray(value) ? value : []) : (object(value) && Object.hasOwn(value, token) ? [value[token]] : [])), [data]);
}

function validateExpected(expected) {
  if (!object(expected)) fail('expected.yaml 必须是单个对象');
  for (const key of Object.keys(expected)) if (!TOP_KEYS.has(key)) fail(`未知断言类型：${key}`);
  for (const key of ['files_exist', 'files_unchanged', 'files_absent', 'git_diff_only']) {
    if (expected[key] === undefined) continue;
    if (!Array.isArray(expected[key])) fail(`${key} 必须为数组`);
    expected[key].forEach(relativePath);
  }
  if (expected.idempotent !== undefined && typeof expected.idempotent !== 'boolean') fail('idempotent 必须为布尔值');
  if (expected.git_diff_only !== undefined && expected.idempotent !== true) fail('git_diff_only 仅可与 idempotent:true 一起使用');
  if (expected.max_lines !== undefined) {
    if (!object(expected.max_lines)) fail('max_lines 必须为对象');
    for (const [file, limit] of Object.entries(expected.max_lines)) {
      relativePath(file);
      if (!Number.isInteger(limit) || limit < 0) fail(`max_lines 的行数无效：${file}`);
    }
  }
  if (expected.vic_check !== undefined && (!object(expected.vic_check) || Object.keys(expected.vic_check).some((key) => key !== 'error') || !Number.isInteger(expected.vic_check.error) || expected.vic_check.error < 0)) fail('vic_check 仅支持非负整数 error');
  for (const key of ['sections_unchanged', 'yaml_paths', 'forbidden_text']) {
    if (expected[key] === undefined) continue;
    if (!Array.isArray(expected[key])) fail(`${key} 必须为数组`);
    for (const item of expected[key]) {
      if (!object(item)) fail(`${key} 条目必须为对象`);
      const allowed = key === 'sections_unchanged' ? ['file', 'heading'] : key === 'yaml_paths' ? ['file', 'path', 'contains', 'contains_any', 'excludes', 'equals', 'not_empty'] : ['glob', 'pattern', 'flags'];
      if (Object.keys(item).some((field) => !allowed.includes(field))) fail(`${key} 条目含未知字段`);
      if (key === 'sections_unchanged') {
        relativePath(item.file);
        if (typeof item.heading !== 'string' || !/^#{1,6} +\S/.test(item.heading) || /[\r\n]/.test(item.heading)) fail('sections_unchanged.heading 必须是 ATX 标题');
      } else if (key === 'yaml_paths') {
        relativePath(item.file ?? 'contracts/project-context.yaml');
        pathTokens(item.path);
        const ops = ['contains', 'contains_any', 'excludes', 'equals', 'not_empty'].filter((op) => Object.hasOwn(item, op));
        if (ops.length !== 1 || (ops[0] === 'not_empty' && item.not_empty !== true)) fail(`YAML 路径必须且只能指定一个操作：${item.path}`);
        if (ops[0] === 'contains_any' && (!Array.isArray(item.contains_any) || item.contains_any.length === 0)) fail(`contains_any 必须为非空候选数组：${item.path}`);
      } else {
        globRegex(item.glob);
        if (typeof item.pattern !== 'string' || !item.pattern) fail('forbidden_text.pattern 不可为空');
        if (item.flags !== undefined && (typeof item.flags !== 'string' || /[^imsu]/.test(item.flags))) fail('正则 flags 仅支持 i/m/s/u');
        new RegExp(item.pattern, item.flags ?? 'u');
      }
    }
  }
  return expected;
}

// 每一级都用 lstat；拒绝把软链文件或软链目录作为需要读取的内容。
async function bytesAt(root, file) {
  relativePath(file);
  let current = root;
  for (const segment of file.split('/')) {
    current = path.join(current, segment);
    try {
      if ((await lstat(current)).isSymbolicLink()) return null;
    } catch (error) { if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return null; throw error; }
  }
  const info = await lstat(current);
  return info.isFile() ? readFile(current) : null;
}

function sectionBytes(bytes, wanted) {
  if (bytes === null) return null;
  // latin1 是一字节一字符，切片 offset 不会被 UTF-8 中文或 CRLF 改变。
  const lines = bytes.toString('latin1').match(/[^\n]*\n|[^\n]+$/g) ?? [];
  let offset = 0, start = null, level = null, fence = null, matches = 0, end = null;
  for (const raw of lines) {
    const text = Buffer.from(raw.replace(/\r?\n$/, ''), 'latin1').toString('utf8');
    const fenceLine = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(text);
    if (fence) {
      if (fenceLine && fenceLine[1][0] === fence.char && fenceLine[1].length >= fence.length && !fenceLine[2].trim()) fence = null;
    } else if (fenceLine && !(fenceLine[1][0] === '`' && fenceLine[2].includes('`'))) {
      fence = { char: fenceLine[1][0], length: fenceLine[1].length };
    } else {
      const heading = /^ {0,3}(#{1,6})[ \t]+(.+?)\s*$/.exec(text);
      if (heading) {
        if (start !== null && end === null && heading[1].length <= level) end = offset;
        if (text.trim() === wanted) {
          matches++;
          if (start === null) { start = offset; level = heading[1].length; }
        }
      }
    }
    offset += Buffer.byteLength(raw, 'latin1');
  }
  if (start === null || matches !== 1) return null;
  return bytes.subarray(start, end ?? bytes.length);
}

async function snapshot(root, expected, expectedHash) {
  const entries = Object.create(null);
  async function walk(dir, prefix = '') {
    for (const name of (await readdir(dir)).sort()) {
      const file = prefix ? `${prefix}/${name}` : name;
      if (file === '.git') continue;
      const full = path.join(dir, name), info = await lstat(full);
      if (info.isSymbolicLink()) entries[file] = { kind: 'symlink', target: await readlink(full) };
      else if (info.isDirectory()) { entries[file] = { kind: 'directory', mode: info.mode & 0o777 }; await walk(full, file); }
      else if (info.isFile()) entries[file] = { kind: 'file', size: info.size, mode: info.mode & 0o777, executable: Boolean(info.mode & 0o111), sha256: hash(await readFile(full)) };
      else fail(`不支持的文件树条目：${file}`);
    }
  }
  await walk(root);
  const sections = {};
  for (const item of expected.sections_unchanged ?? []) {
    const bytes = sectionBytes(await bytesAt(root, item.file), item.heading);
    sections[sectionKey(item)] = bytes === null ? null : { size: bytes.length, sha256: hash(bytes) };
  }
  return { version: 1, expected_sha256: expectedHash, entries, sections };
}

async function readSnapshot(file, expectedHash, expected) {
  const value = JSON.parse(await readFile(file, 'utf8'));
  if (!object(value) || value.version !== 1 || value.expected_sha256 !== expectedHash || !object(value.entries) || !object(value.sections)) fail(`快照格式或 expected.yaml 摘要不匹配：${file}`);
  // JSON.parse 会还原普通对象；读取路径时也只允许字典自有属性。
  Object.setPrototypeOf(value.entries, null);
  for (const [name, entry] of Object.entries(value.entries)) {
    relativePath(name);
    if (!object(entry) || !['file', 'directory', 'symlink'].includes(entry.kind) || (entry.kind !== 'symlink' && (!Number.isInteger(entry.mode) || entry.mode < 0 || entry.mode > 0o777)) || (entry.kind === 'file' && (!/^[a-f0-9]{64}$/.test(entry.sha256) || !Number.isInteger(entry.size) || entry.size < 0 || typeof entry.executable !== 'boolean')) || (entry.kind === 'symlink' && typeof entry.target !== 'string')) fail(`快照条目无效：${name}`);
  }
  for (const item of expected.sections_unchanged ?? []) {
    const section = value.sections[sectionKey(item)];
    if (section !== null && (!object(section) || !/^[a-f0-9]{64}$/.test(section.sha256) || !Number.isInteger(section.size) || section.size < 0)) fail(`快照缺少合法段落记录：${item.file} ${item.heading}`);
  }
  return value;
}

function diffTrees(first, current) {
  const result = { added: [], deleted: [], changed: [] };
  for (const name of [...new Set([...Object.keys(first.entries), ...Object.keys(current.entries)])].sort()) {
    if (!Object.hasOwn(first.entries, name)) result.added.push(name);
    else if (!Object.hasOwn(current.entries, name)) result.deleted.push(name);
    else if (!isDeepStrictEqual(first.entries[name], current.entries[name])) result.changed.push(name);
  }
  return result;
}

async function check(root, expected, current, before, first, phase) {
  const assertions = [], pending = [];
  const add = (id, passed, detail) => assertions.push({ id, pass: Boolean(passed), ...detail });
  for (const file of expected.files_exist ?? []) add(`files_exist:${file}`, current.entries[file]?.kind === 'file', { file, expected: '普通文件存在', actual: current.entries[file]?.kind ?? '缺失' });
  for (const file of expected.files_absent ?? []) add(`files_absent:${file}`, !Object.hasOwn(current.entries, file), { file, expected: '路径不存在', actual: current.entries[file]?.kind ?? '缺失' });
  for (const file of expected.files_unchanged ?? []) add(`files_unchanged:${file}`, before.entries[file]?.kind === 'file' && current.entries[file]?.kind === 'file' && isDeepStrictEqual(before.entries[file], current.entries[file]), { file, expected: before.entries[file] ?? '运行前文件缺失', actual: current.entries[file] ?? '运行后文件缺失' });
  for (const item of expected.sections_unchanged ?? []) {
    const key = sectionKey(item);
    add(`sections_unchanged:${item.file}:${item.heading}`, before.sections[key] !== null && isDeepStrictEqual(before.sections[key], current.sections[key]), { ...item, expected: before.sections[key] ?? '运行前唯一段落缺失', actual: current.sections[key] ?? '运行后唯一段落缺失' });
  }
  for (const [file, limit] of Object.entries(expected.max_lines ?? {})) {
    const bytes = await bytesAt(root, file);
    const count = bytes === null ? null : (bytes.length === 0 ? 0 : bytes.toString('utf8').split('\n').length - (bytes.at(-1) === 10 ? 1 : 0));
    add(`max_lines:${file}`, count !== null && count <= limit, { file, expected: limit, actual: count });
  }
  const yamlCache = new Map();
  for (const item of expected.yaml_paths ?? []) {
    const file = item.file ?? 'contracts/project-context.yaml';
    if (!yamlCache.has(file)) {
      try {
        const bytes = await bytesAt(root, file);
        if (bytes === null) fail('普通 YAML 文件缺失');
        yamlCache.set(file, { data: load(bytes.toString('utf8'), { schema: JSON_SCHEMA, filename: file }) });
      } catch (error) { yamlCache.set(file, { error: error.message }); }
    }
    const parsed = yamlCache.get(file), values = parsed.error ? [] : yamlValues(parsed.data, item.path);
    const op = ['contains', 'contains_any', 'excludes', 'equals', 'not_empty'].find((key) => Object.hasOwn(item, key));
    const matches = values.some((value) => op === 'contains_any'
      ? item.contains_any.some((candidate) => isDeepStrictEqual(value, candidate))
      : isDeepStrictEqual(value, item[op]));
    const passed = !parsed.error && (op === 'excludes' ? !matches : op === 'not_empty' ? values.some((value) => (typeof value === 'string' || Array.isArray(value)) && value.length > 0) : matches);
    add(`yaml_paths:${file}:${item.path}:${op}`, passed, { file, path: item.path, operation: op, expected: item[op], actual: parsed.error ?? values });
  }
  for (const item of expected.forbidden_text ?? []) {
    const glob = globRegex(item.glob), regex = new RegExp(item.pattern, item.flags ?? 'u');
    const files = Object.keys(current.entries).filter((file) => glob.test(file) && current.entries[file].kind === 'file');
    const matches = [];
    for (const file of files) {
      const match = regex.exec((await bytesAt(root, file)).toString('utf8'));
      if (match) matches.push({ file, match: match[0] });
    }
    add(`forbidden_text:${item.glob}:${item.pattern}`, matches.length === 0, { glob: item.glob, expected: '没有匹配的虚构事实', actual: matches, files_scanned: files.length });
  }
  if (expected.vic_check) {
    const checker = fileURLToPath(new URL('../scripts/vic-check.mjs', import.meta.url));
    let output, exitCode = 0, error;
    try { output = execFileSync(process.execPath, [checker, '--all', '--json', '--root', root], { encoding: 'utf8', timeout: 10000, maxBuffer: 4 * 1024 * 1024 }); }
    catch (caught) { output = caught.stdout; exitCode = caught.status; error = caught.message; }
    try {
      const report = JSON.parse(output);
      if (!object(report.summary) || !Number.isInteger(report.summary.error) || report.summary.error < 0 || !Array.isArray(report.findings) || exitCode !== (report.summary.error > 0 ? 1 : 0)) fail(error ?? '检查器返回无效报告');
      add('vic_check:error', report.summary.error === expected.vic_check.error, { expected: expected.vic_check.error, actual: report.summary.error, exit_code: exitCode, findings: report.findings });
    } catch (caught) { add('vic_check:error', false, { expected: expected.vic_check.error, actual: `检查器未成功完成：${caught.message}`, exit_code: exitCode }); }
  }
  let treeChanges = null;
  if (expected.idempotent) {
    if (phase === 'first') pending.push('idempotent');
    else {
      treeChanges = diffTrees(first, current);
      const allowed = new Set(expected.git_diff_only ?? []);
      for (const [kind, files] of Object.entries(treeChanges)) {
        for (const file of files) add(`idempotent:${kind}:${file}`, allowed.has(file), { file, operation: kind, expected: [...allowed], actual: '第二次运行改变了文件树' });
      }
      add('idempotent', Object.values(treeChanges).flat().every((file) => allowed.has(file)), { expected: [...allowed], actual: treeChanges });
    }
  }
  const failed = assertions.filter((item) => !item.pass).length;
  return { version: 1, phase, pass: failed === 0, summary: { pass: assertions.length - failed, fail: failed, pending: pending.length }, pending, tree_changes: treeChanges, assertions };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) { console.log(HELP); return; }
  const mode = args.shift(), options = {};
  if (!['snapshot', 'check'].includes(mode)) fail('须指定 snapshot 或 check；用 --help 查看接口');
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (!['--root', '--expected', '--out', '--before', '--first', '--phase', '--json'].includes(key) || Object.hasOwn(options, key)) fail(`未知或重复参数：${key}`);
    if (key === '--json') options[key] = true;
    else if (args[i + 1] && !args[i + 1].startsWith('--')) options[key] = args[++i];
    else fail(`参数缺少值：${key}`);
  }
  for (const key of ['--root', '--expected']) if (!options[key]) fail(`缺少参数：${key}`);
  const root = await realpath(options['--root']);
  if (!(await lstat(root)).isDirectory()) fail('--root 必须为目录');
  const expectedBytes = await readFile(options['--expected']);
  const expected = validateExpected(load(expectedBytes.toString('utf8'), { schema: JSON_SCHEMA, filename: options['--expected'] }));
  const expectedHash = hash(expectedBytes);
  if (mode === 'snapshot') {
    if (!options['--out'] || options['--before'] || options['--first'] || options['--phase']) fail('snapshot 只接受 --root、--expected、--out、--json');
    const requested = path.resolve(options['--out']);
    const out = path.join(await realpath(path.dirname(requested)), path.basename(requested));
    const rel = path.relative(root, out);
    if (!rel || (!rel.startsWith('..' + path.sep) && rel !== '..' && !path.isAbsolute(rel))) fail('snapshot 输出必须位于目标根之外');
    try { if ((await lstat(out)).isSymbolicLink()) fail('snapshot 输出不可为软链'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    const current = await snapshot(root, expected, expectedHash);
    await writeFile(out, JSON.stringify(current, null, 2) + '\n');
    console.log(options['--json'] ? JSON.stringify({ version: 1, mode, entries: Object.keys(current.entries).length }) : `已保存快照：${Object.keys(current.entries).length} 个文件树条目`);
    return;
  }
  const phase = options['--phase'] ?? 'final';
  if (!options['--before'] || options['--out'] || !['first', 'final'].includes(phase) || (phase === 'first' && options['--first'])) fail('check 需要 --before，--phase 仅为 first/final；first 阶段不可传 --first');
  if (expected.idempotent && phase === 'final' && !options['--first']) fail('幂等性 final 验收必须传第一次运行后的 --first 快照');
  if (options['--first'] && await realpath(options['--first']) === await realpath(options['--before'])) fail('--first 和 --before 必须是两个不同的基线文件');
  const before = await readSnapshot(options['--before'], expectedHash, expected);
  const first = options['--first'] ? await readSnapshot(options['--first'], expectedHash, expected) : null;
  const current = await snapshot(root, expected, expectedHash);
  const result = await check(root, expected, current, before, first, phase);
  if (options['--json']) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`断言${result.pass ? '通过' : '失败'}（${phase}）：通过 ${result.summary.pass}，失败 ${result.summary.fail}，待验 ${result.summary.pending}`);
    for (const item of result.assertions.filter((entry) => !entry.pass)) console.log(`失败 ${item.id}：期望 ${JSON.stringify(item.expected)}；实际 ${JSON.stringify(item.actual)}`);
    if (result.pending.length) console.log('幂等性尚未验收：第二次运行后须执行 final 检查。');
  }
  process.exitCode = result.pass ? 0 : 1;
}

main().catch((error) => {
  console.error(JSON.stringify({ pass: false, error: '参数、配置或基线错误', message: error.message }));
  process.exitCode = 2;
});
