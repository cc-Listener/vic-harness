import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm, mkdir, symlink, chmod, access, copyFile, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { checkGitWhitespace } from '../skills/vic-bootstrap/scripts/git-check.mjs';
import { observeProcess, processVerdict } from '../skills/vic-bootstrap/scripts/git-check-process.mjs';

test('实际子进程非零且双流为空仍失败；完整零退出才通过', async () => {
  for (const code of [0, 2]) {
    const execution = await observeProcess({ executable: process.execPath, argv: ['-e', `process.exit(${code})`], timeoutMs: 1000 });
    assert.equal(execution.exit_code, code);
    assert.equal(execution.stdout, '');
    assert.equal(execution.stderr, '');
    assert.equal(execution.capture_complete, true);
    assert.equal(processVerdict(execution), code === 0 ? 'passed' : 'failed');
  }
});

async function repository(t) {
  const root = await mkdtemp(join(tmpdir(), 'git-check-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  function git(...argv) {
    const r = spawnSync('/usr/bin/git', argv, { cwd: root, encoding: 'utf8', env: { PATH: '/usr/bin:/bin', HOME: root, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' } });
    assert.equal(r.status, 0, r.stderr); return r.stdout;
  }
  git('init', '-q'); await writeFile(join(root, 'AGENTS.md'), '导航\n'); git('add', '--', 'AGENTS.md');
  return { root, git, run: extra => checkGitWhitespace({ root, paths: ['AGENTS.md'], comparison: 'index-to-worktree', proxy: 'none', ...extra }) };
}

test('真实 Git 检查范围和中文摘要一致，保护尾空行原字节', async t => {
  const {root, run} = await repository(t);
  const good = await run();
  assert.equal(good.version, 1); assert.equal(good.verdict, 'passed', JSON.stringify(good));
  assert.deepEqual(good.scope.checked_paths, ['AGENTS.md']);
  assert.match(good.report, /index→worktree/); assert.match(good.report, /AGENTS.md/);
  await writeFile(join(root, 'AGENTS.md'), '导航\n\n');
  const before = await readFile(join(root, 'AGENTS.md'));
  const bad = await run();
  assert.equal(bad.verdict, 'failed'); assert.equal(bad.execution.exit_code, 2);
  assert.match(bad.execution.stdout, /new blank line at EOF/);
  assert.match(bad.report, /失败/);
  assert.deepEqual(await readFile(join(root, 'AGENTS.md')), before);
});

test('staged-only、untracked 和未选文件不会扩大通过范围', async t => {
  const {root, git, run} = await repository(t);
  await writeFile(join(root, 'AGENTS.md'), '新导航\n'); git('add', '--', 'AGENTS.md');
  await writeFile(join(root, 'untracked.md'), '未跟踪  \n');
  await writeFile(join(root, 'outside.md'), '基线\n'); git('add', '--', 'outside.md');
  await writeFile(join(root, 'outside.md'), '错误  \n');
  const result = await run({paths: ['AGENTS.md', 'untracked.md']});
  assert.equal(result.verdict, 'passed');
  assert.deepEqual(result.scope.checked_paths, ['AGENTS.md']);
  assert.deepEqual(result.scope.untracked_paths, ['untracked.md']);
  assert.match(result.report, /staged-only、untracked 及未选路径未检查/);
  const none = await run({paths: ['untracked.md']});
  assert.equal(none.verdict, 'unknown'); assert.equal(none.execution.status, 'completed');
  assert.equal(none.execution.phase, 'scope'); assert.equal(none.scope.rejection_reason, 'no_tracked_paths');
  assert.equal(none.execution.exit_code, 0); assert.equal(none.execution.capture_complete, true);
  assert.equal(none.execution.observed_process, 'git'); assert.equal(none.execution.stdout, '');
  assert.equal(none.execution.reason, null); assert.deepEqual(none.scope.checked_paths, []);
  assert.equal(none.command_form, null); assert.match(none.report, /no_tracked_paths/);
});

test('index 忽略工作树的标志不能被误报为该文件已经比较通过', async t => {
  for (const flag of ['--assume-unchanged', '--skip-worktree']) {
    const {root, git, run} = await repository(t);
    git('update-index', flag, '--', 'AGENTS.md');
    await writeFile(join(root, 'AGENTS.md'), '错误  \n');
    const r = await run(); assert.equal(r.verdict, 'unknown', flag);
    assert.deepEqual(r.scope.checked_paths, []);
    assert.equal(r.execution.status, 'completed'); assert.equal(r.execution.phase, 'scope');
    assert.equal(r.scope.rejection_reason, 'unqualified_index_entry');
    assert.equal(r.execution.exit_code, 0); assert.equal(r.execution.capture_complete, true);
    assert.equal(r.execution.observed_process, 'git'); assert.equal(r.execution.reason, null);
    assert.equal(r.execution.stdout, git('ls-files', '--stage', '-v', '-z', '--', 'AGENTS.md'));
    assert.equal(r.command_form, null); assert.match(r.report, /unqualified_index_entry/);
  }
});

test('RTK 范围资格拒绝保留外层成功列表观察，不冒称空白检查已执行', async t => {
  if (spawnSync('rtk', ['--version']).status !== 0) { t.skip('宿主没有 RTK，不添加依赖'); return; }
  const {git, run} = await repository(t);
  git('update-index', '--assume-unchanged', '--', 'AGENTS.md');
  const r = await run({proxy: 'rtk'});
  assert.equal(r.verdict, 'unknown'); assert.equal(r.execution.status, 'completed');
  assert.equal(r.execution.phase, 'scope'); assert.equal(r.scope.rejection_reason, 'unqualified_index_entry');
  assert.equal(r.execution.exit_code, 0); assert.equal(r.execution.capture_complete, true);
  assert.equal(r.execution.observed_process, 'rtk-proxy'); assert.equal(r.execution.reason, null);
  assert.equal(r.execution.stdout, git('ls-files', '--stage', '-v', '-z', '--', 'AGENTS.md'));
  assert.deepEqual(r.scope.checked_paths, []); assert.equal(r.command_form, null);
});

test('特殊文件名逐文件 literal 比较，不能变成 shell 或选项', async t => {
  const {root, git, run} = await repository(t);
  const paths = ['空 格.md', '--dash.md', "quote'\";$`file.md", 'tab\tfile.md'];
  for (const path of paths) await writeFile(join(root, path), '基线\n');
  git('add', '--', ...paths);
  await writeFile(join(root, paths[2]), '错误  \n');
  const good = await run({paths: [paths[0], paths[1], paths[3]]});
  assert.equal(good.verdict, 'passed');
  const bad = await run({paths}); assert.equal(bad.verdict, 'failed');
  assert.deepEqual(bad.scope.checked_paths, paths);
  assert.ok(bad.command_form.argv.includes(`:(literal)${paths[2]}`));
});

test('普通业务 roles 目录不因名称被误归代理配置禁区', async t => {
  const {root, git, run} = await repository(t);
  await mkdir(join(root, 'src/roles'), {recursive: true});
  await writeFile(join(root, 'src/roles/member.ts'), 'export const member = 1;\n');
  git('add', '--', 'src/roles/member.ts');
  assert.equal((await run({paths: ['src/roles/member.ts']})).verdict, 'passed');
});

test('空范围、目录、glob、pathspec、越界、缺文件与禁读配置均不执行', async t => {
  const {root, git, run} = await repository(t);
  await mkdir(join(root, 'folder')); await mkdir(join(root, '.codex'));
  await writeFile(join(root, '.codex/config.toml'), '秘密标记');
  for (const dir of ['.ua', '.understand-anything']) {
    await mkdir(join(root, dir)); await writeFile(join(root, dir, 'graph.json'), '秘密标记'); git('add', '--', `${dir}/graph.json`);
  }
  for (const paths of [[], ['folder'], ['*.md'], [':(glob)*'], ['../outside'], [root], ['missing.md'], ['.codex/config.toml'], ['.ua/graph.json'], ['.understand-anything/graph.json']]) {
    const r = await run({paths}); assert.equal(r.verdict, 'unknown', JSON.stringify(paths));
    assert.equal(r.execution.status, 'not-run'); assert.equal(r.command_form, null);
    assert.deepEqual(r.scope.metadata_reads, []);
    assert.doesNotMatch(JSON.stringify(r), /秘密标记/);
  }
  assert.equal((await run({timeoutMs: 120001})).verdict, 'unknown');
  assert.equal((await run({reviewed: true})).verdict, 'unknown');
});

test('文件和中间目录软链拒绝；gitfile 不是受支持仓库形状', async t => {
  const {root, run} = await repository(t);
  await mkdir(join(root, 'real')); await writeFile(join(root, 'real/file.md'), '内容\n');
  await symlink('AGENTS.md', join(root, 'link.md')); await symlink('real', join(root, 'linked'));
  for (const path of ['link.md', 'linked/file.md']) assert.equal((await run({paths: [path]})).verdict, 'unknown');
  await rm(join(root, '.git'), {recursive: true}); await writeFile(join(root, '.git'), 'gitdir: elsewhere\n');
  const result = await run(); assert.equal(result.verdict, 'unknown'); assert.equal(result.execution.status, 'not-run');
});

test('环境仓库/索引/配置注入被丢弃，真实比较仍属于指定根', async t => {
  const {root, run} = await repository(t), other = await repository(t);
  await writeFile(join(root, 'AGENTS.md'), '错误  \n');
  const changes = {GIT_DIR: join(other.root, '.git'), GIT_WORK_TREE: other.root, GIT_INDEX_FILE: join(other.root, '.git/index'), GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'include.path', GIT_CONFIG_VALUE_0: '秘密路径'};
  const saved = Object.fromEntries(Object.keys(changes).map(k => [k, process.env[k]]));
  try {
    Object.assign(process.env, changes);
    const r = await run(); assert.equal(r.verdict, 'failed');
    assert.ok(r.scope.discarded_git_environment.includes('GIT_DIR'));
    assert.doesNotMatch(JSON.stringify(r), /秘密路径/);
  } finally { for (const [k,v] of Object.entries(saved)) if (v === undefined) delete process.env[k]; else process.env[k] = v; }
});

test('include、clean/process filter、fsmonitor 与未知配置不执行且不泄露内容', async t => {
  const {root, run} = await repository(t), config = join(root, '.git/config'), initial = await readFile(config, 'utf8');
  const marker = join(root, 'must-not-exist');
  for (const extra of ['[include]\n path = 秘密路径\n', '[includeIf "gitdir:*"]\n path = 秘密路径\n', `[filter "evil"]\n clean = touch ${marker}\n process = touch ${marker}\n`, `[core]\n fsmonitor = touch ${marker}\n`, '[core]\n autocrlf = 秘密值\n']) {
    await writeFile(config, initial + extra);
    await writeFile(join(root, '.gitattributes'), '*.md filter=evil\n');
    const r = await run(); assert.equal(r.verdict, 'unknown'); assert.equal(r.execution.status, 'not-run');
    assert.doesNotMatch(JSON.stringify(r), /秘密路径|秘密值/);
    await assert.rejects(access(marker));
  }
});

test('元数据软链、对象重定向和外部属性文件不被当作普通仓库', async t => {
  for (const kind of ['config-symlink', 'objects-symlink', 'alternates', 'attributes', 'sharedindex']) {
    const {root, run} = await repository(t);
    if (kind === 'config-symlink') { await rm(join(root, '.git/config')); await symlink('../AGENTS.md', join(root, '.git/config')); }
    if (kind === 'objects-symlink') { await rm(join(root, '.git/objects'), {recursive: true}); await symlink('refs', join(root, '.git/objects')); }
    if (kind === 'alternates') await writeFile(join(root, '.git/objects/info/alternates'), '秘密路径\n');
    if (kind === 'attributes') await writeFile(join(root, '.git/info/attributes'), '*.md filter=evil\n');
    if (kind === 'sharedindex') await writeFile(join(root, '.git/sharedindex.abc'), '');
    const r = await run(); assert.equal(r.verdict, 'unknown', kind); assert.equal(r.execution.status, 'not-run');
    assert.doesNotMatch(JSON.stringify(r), /秘密路径/);
  }
});

test('复合元数据探测前拒绝 info、objects 和 objects/info 中间软链', async t => {
  for (const path of ['info', 'objects', 'objects/info']) {
    for (const targetKind of ['directory', 'file']) {
      await t.test(`${path} → 外部${targetKind}`, async t => {
        const {root, run} = await repository(t);
        const external = await mkdtemp(join(tmpdir(), 'git-check-external-metadata-'));
        t.after(() => rm(external, {recursive: true, force: true}));
        const target = targetKind === 'file' ? join(external, 'plain-file') : external;
        if (targetKind === 'file') await writeFile(target, '外部内容不应读取\n');
        await rm(join(root, '.git', path), {recursive: true});
        await symlink(target, join(root, '.git', path));
        const r = await run();
        assert.equal(r.verdict, 'unknown'); assert.equal(r.execution.status, 'not-run');
        assert.equal(r.execution.observed_process, 'none'); assert.equal(r.command_form, null);
        assert.equal(r.execution.reason, 'symlink_or_wrong_type');
        assert.deepEqual(r.scope.checked_paths, []); assert.doesNotMatch(JSON.stringify(r), /外部内容不应读取/);
      });
    }
  }
});

test('保留项目 core.whitespace 语义；属性读取范围显式列出', async t => {
  const {root, git, run} = await repository(t);
  git('config', 'core.whitespace', 'trailing-space,-blank-at-eof');
  await writeFile(join(root, 'AGENTS.md'), '导航\n\n');
  const r = await run(); assert.equal(r.verdict, 'passed');
  assert.ok(r.scope.metadata_reads.includes('.git/index'));
  assert.ok(r.scope.metadata_reads.includes('.gitattributes'));
});

test('缺工具、非仓库和未知脚本 shim 保持 unknown，脚本不被执行', async t => {
  const {root, run} = await repository(t), shim = join(root, 'git-shim'), marker = join(root, 'marker');
  await writeFile(shim, `#!/bin/sh\ntouch '${marker}'\nexit 0\n`); await chmod(shim, 0o755);
  for (const extra of [{gitExecutable: join(root, 'missing')}, {gitExecutable: shim}, {proxy: 'rtk', rtkExecutable: shim}]) {
    const r = await run(extra); assert.equal(r.verdict, 'unknown'); assert.equal(r.execution.status, 'not-run');
  }
  await assert.rejects(access(marker));
  await rm(join(root, '.git'), {recursive: true});
  assert.equal((await run()).verdict, 'unknown');
});

test('公共 API 总预算耗尽时保持 unknown，不把未启动写成已观察 Git', async t => {
  const {run} = await repository(t);
  const r = await run({timeoutMs: 1});
  assert.equal(r.verdict, 'unknown'); assert.equal(r.execution.timed_out, true);
  if (r.execution.not_started) assert.equal(r.execution.observed_process, 'none');
});

test('真实 RTK proxy 经有限正反例核验，报告只观察外层进程', async t => {
  if (spawnSync('rtk', ['--version']).status !== 0) { t.skip('宿主没有 RTK，不添加依赖'); return; }
  const {root, run} = await repository(t);
  const good = await run({proxy: 'rtk'}); assert.equal(good.verdict, 'passed', JSON.stringify(good));
  assert.equal(good.execution.observed_process, 'rtk-proxy');
  assert.equal(good.proxy_qualification.confirmed, true);
  await writeFile(join(root, 'AGENTS.md'), '导航\n\n');
  const bad = await run({proxy: 'rtk'}); assert.equal(bad.verdict, 'failed');
  assert.equal(bad.execution.exit_code, 2); assert.match(bad.limitations.join(' '), /不是目标内部 Git 退出码的直接观察/);
});

test('真实启动失败、信号、超时、双流超限均 unknown；捕获保留分流', async () => {
  const run = (code, timeoutMs = 1000) => observeProcess({executable: process.execPath, argv: ['-e', code], timeoutMs});
  const streams = await run("process.stdout.write('out');process.stderr.write('err')");
  assert.equal(streams.stdout, 'out'); assert.equal(streams.stderr, 'err');
  const missing = await observeProcess({executable: join(tmpdir(), 'missing-vic-git-tool'), argv: [], timeoutMs: 1000});
  assert.equal(missing.status, 'error'); assert.equal(processVerdict(missing), 'unknown');
  const signal = await run("process.kill(process.pid,'SIGTERM')");
  assert.equal(signal.signal, 'SIGTERM'); assert.equal(processVerdict(signal), 'unknown');
  const timeout = await run('setInterval(()=>{},1000)', 100);
  assert.equal(timeout.status, 'timeout'); assert.equal(timeout.timed_out, true); assert.equal(processVerdict(timeout), 'unknown');
  for (const stream of ['stdout', 'stderr']) {
    const large = await run(`process.${stream}.write(Buffer.alloc(1024*1024+1,65));setInterval(()=>{},1000)`);
    assert.equal(large.truncated, true); assert.equal(processVerdict(large), 'unknown');
    assert.equal(Buffer.byteLength(large[stream]), 1024*1024);
  }
});

test('父进程已退出但后代占管道时仍超时并终止同组后代', async () => {
  const e = await observeProcess({executable: process.execPath, argv: ['-e', `const {spawn}=require('child_process');const c=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:['ignore',process.stdout,process.stderr]});console.log(c.pid);process.exit(0)`], timeoutMs: 300});
  assert.equal(e.status, 'timeout'); assert.equal(e.exit_code, 0); assert.equal(processVerdict(e), 'unknown');
  const pid = Number(e.stdout.trim()); assert.ok(pid > 0);
  await new Promise(resolve => setTimeout(resolve, 50));
  assert.throws(() => process.kill(pid, 0), {code: 'ESRCH'});
});

const script = fileURLToPath(new URL('../skills/vic-bootstrap/scripts/git-check.mjs', import.meta.url));
test('CLI 退出0/1/2与固定参数和真实结果一致；纯导入无副作用', async t => {
  const {root} = await repository(t);
  function cli(extra = []) { return spawnSync(process.execPath, [script, '--root', root, '--comparison', 'index-to-worktree', '--path', 'AGENTS.md', '--proxy', 'none', ...extra], {encoding: 'utf8'}); }
  const good = cli(); assert.equal(good.status, 0); assert.equal(JSON.parse(good.stdout).verdict, 'passed'); assert.equal(good.stderr, '');
  await writeFile(join(root, 'AGENTS.md'), '导航\n\n');
  const bad = cli(); assert.equal(bad.status, 1); assert.equal(JSON.parse(bad.stdout).execution.exit_code, 2);
  for (const extra of [['--exit', '0'], ['--verified', 'true'], ['--command', 'echo'], ['--root', root]]) {
    const invalid = cli(extra); assert.equal(invalid.status, 2); assert.equal(JSON.parse(invalid.stdout).verdict, 'unknown');
  }
  const imported = spawnSync(process.execPath, ['--input-type=module', '-e', `await import(${JSON.stringify(new URL('../skills/vic-bootstrap/scripts/git-check.mjs', import.meta.url).href)})`], {input: '不应读取的stdin', encoding: 'utf8'});
  assert.equal(imported.status, 0); assert.equal(imported.stdout, ''); assert.equal(imported.stderr, '');
});

test('真实发布位置的规范路径与现有系统别名均执行 CLI；纯导入无副作用', async t => {
  // 使用宿主现有 /tmp 别名；其他平台只验证实际可用路径，不创建软链。
  const parent = await mkdtemp(join(process.platform === 'darwin' ? '/tmp' : tmpdir(), 'git-check-bundle-'));
  t.after(() => rm(parent, {recursive: true, force: true}));
  const directory = join(parent, 'bundle/skills/vic-bootstrap/scripts');
  await mkdir(directory, {recursive: true});
  for (const name of ['git-check.mjs', 'git-check-process.mjs']) {
    await copyFile(new URL(`../skills/vic-bootstrap/scripts/${name}`, import.meta.url), join(directory, name));
  }
  const alias = join(directory, 'git-check.mjs'), canonical = await realpath(alias);
  if (process.platform === 'darwin') assert.notEqual(alias, canonical, '现有 /tmp 系统别名应覆盖不同 argv 路径');
  if (alias === canonical) t.diagnostic('宿主临时路径没有系统别名，仅验证实际规范路径');
  const {root} = await repository(t);
  for (const entry of [...new Set([canonical, alias])]) {
    await t.test(entry === canonical ? '规范路径' : '系统别名', async () => {
      const cli = extra => spawnSync(process.execPath, [entry, '--root', root, '--comparison', 'index-to-worktree', '--path', 'AGENTS.md', '--proxy', 'none', ...extra], {encoding: 'utf8', timeout: 5000});
      for (const [text, extra, code, verdict] of [
        ['导航\n', [], 0, 'passed'],
        ['导航\n\n', [], 1, 'failed'],
        ['导航\n', ['--invalid', 'x'], 2, 'unknown'],
      ]) {
        await writeFile(join(root, 'AGENTS.md'), text);
        const result = cli(extra);
        assert.equal(result.error, undefined); assert.equal(result.signal, null);
        assert.equal(result.status, code); assert.equal(result.stderr, '');
        const feedback = JSON.parse(result.stdout);
        assert.equal(feedback.verdict, verdict); assert.ok(feedback.report.length > 0);
        if (verdict !== 'unknown') {
          assert.deepEqual(feedback.scope.checked_paths, ['AGENTS.md']);
          assert.equal(feedback.execution.exit_code, code === 0 ? 0 : 2);
        }
        assert.equal(await readFile(join(root, 'AGENTS.md'), 'utf8'), text);
      }
      const program = `await import(${JSON.stringify(pathToFileURL(entry).href)});`;
      const importer = join(parent, 'importer.mjs'); await writeFile(importer, program);
      for (const [argv, input] of [
        [['--input-type=module', '--eval', program], '不应读取的stdin'],
        [['--input-type=module', '-'], program],
        [['--input-type=module', '--eval', `process.argv[1] = 'missing-entry.mjs'; ${program}`], '不应读取的stdin'],
        [[importer], '不应读取的stdin'],
      ]) {
        const imported = spawnSync(process.execPath, argv, {input, encoding: 'utf8', timeout: 5000});
        assert.equal(imported.error, undefined); assert.equal(imported.signal, null);
        assert.equal(imported.status, 0); assert.equal(imported.stdout, ''); assert.equal(imported.stderr, '');
      }
    });
  }
});
