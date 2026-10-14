import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, symlink, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fixture, put, inspect, invoke } from './support/fixtures.mjs';

async function agentFixture(t, config = '[agents]\nenabled = true\n') {
  const root = await mkdtemp(join(tmpdir(), 'vic-check-agents-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await put(root, '.codex/config.toml', config);
  return root;
}
const role = (name = 'reviewer') => `name = ${JSON.stringify(name)}\ndescription = "审查角色"\ndeveloper_instructions = "先阅读项目导航"\n`;
const checks = root => inspect(root, '--agents');
const findings = (root, id) => checks(root).report.findings.filter(f => f.id === id);

test('A01：合法主配置与 standalone 可解析，非法 TOML 分别按文件报告', async t => {
  const root = await agentFixture(t);
  await put(root, '.codex/agents/reviewer.toml', role());
  assert.equal(checks(root).status, 0);
  assert.deepEqual(findings(root, 'A01'), []);
  for (const file of ['.codex/config.toml', '.codex/agents/reviewer.toml']) {
    const original = await readFile(join(root, file), 'utf8');
    await put(root, file, 'name = "broken"\nname = "duplicate"\n');
    const result = checks(root);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, '');
    assert.ok(result.report.findings.some(f => f.id === 'A01' && f.severity === 'error' && f.file === file));
    assert.ok(!result.report.findings.some(f => f.id === 'A02' && f.file === file));
    await put(root, file, original);
  }
});

test('A02：standalone 三个必填非空字符串，文件名不一致仅警告', async t => {
  const root = await agentFixture(t);
  await put(root, '.codex/agents/reviewer.toml', role());
  assert.deepEqual(findings(root, 'A02'), []);
  for (const field of ['name', 'description', 'developer_instructions']) {
    for (const replacement of ['', `${field} = "   "\n`, `${field} = 1\n`]) {
      await put(root, '.codex/agents/reviewer.toml', role().replace(new RegExp(`^${field} = .*\\n`, 'm'), replacement));
      assert.ok(findings(root, 'A02').some(f => f.severity === 'error' && f.message.includes(field)));
    }
  }
  await put(root, '.codex/agents/reviewer.toml', role('other'));
  assert.equal(checks(root).status, 0);
  assert.ok(findings(root, 'A02').some(f => f.severity === 'warn' && /文件名/.test(f.message)));
});

test('A03：已核验全局字段及旧角色子表通过，未知 scalar 与 max_depth 仅警告', async t => {
  const root = await agentFixture(t, `[agents]\nenabled = true\nmax_concurrent_threads_per_session = 2\ndefault_subagent_model = "model"\ndefault_subagent_reasoning_effort = "high"\ninterrupt_message = true\n[agents.legacy]\ndescription = "历史注册"\nnickname_candidates = ["老角色"]\n`);
  assert.deepEqual(findings(root, 'A03'), []);
  for (const field of ['max_depth', 'unknown_limit']) {
    await put(root, '.codex/config.toml', `[agents]\n${field} = 2\n`);
    assert.equal(checks(root).status, 0);
    assert.ok(findings(root, 'A03').some(f => f.severity === 'warn' && f.message.includes(field)));
  }
  assert.match(findings(root, 'A03')[0].hint, /核验|兼容/);
});

test('A04：canonical 字段单独通过；旧别名警告，同时声明则错误', async t => {
  const root = await agentFixture(t, '[agents]\nmax_concurrent_threads_per_session = 2\n');
  assert.deepEqual(findings(root, 'A04'), []);
  await put(root, '.codex/config.toml', '[agents]\nmax_threads = 2\n');
  assert.equal(checks(root).status, 0);
  assert.ok(findings(root, 'A04').some(f => f.severity === 'warn'));
  assert.deepEqual(findings(root, 'A03'), []);
  await put(root, '.codex/config.toml', '[agents]\nmax_threads = 2\nmax_concurrent_threads_per_session = 2\n');
  assert.equal(checks(root).status, 1);
  assert.ok(findings(root, 'A04').some(f => f.severity === 'error'));
});

test('A05：旧注册自身无 name 片段通过，真正同身份 standalone 冲突', async t => {
  const root = await agentFixture(t, '[agents.legacy]\nconfig_file = "agents/legacy.toml"\n');
  await put(root, '.codex/agents/legacy.toml', 'developer_instructions = "历史角色片段"\n');
  await put(root, '.codex/agents/reviewer.toml', role());
  assert.equal(checks(root).status, 0);
  assert.deepEqual(findings(root, 'A02'), []);
  assert.deepEqual(findings(root, 'A05'), []);
  await put(root, '.codex/config.toml', '[agents.reviewer]\nconfig_file = "agents/legacy.toml"\n');
  assert.equal(checks(root).status, 1);
  assert.ok(findings(root, 'A05').some(f => f.severity === 'error' && /reviewer/.test(f.message)));
});

test('A02/A05：注册片段有 name 则按 standalone，未注册无 name 仍错误', async t => {
  const root = await agentFixture(t, '[agents.reviewer]\nconfig_file = "agents/reviewer.toml"\n');
  await put(root, '.codex/agents/reviewer.toml', role());
  assert.ok(findings(root, 'A05').some(f => f.severity === 'error'));
  await put(root, '.codex/config.toml', '[agents]\nenabled = true\n');
  await put(root, '.codex/agents/reviewer.toml', 'developer_instructions = "没有注册的片段"\n');
  assert.ok(findings(root, 'A02').some(f => f.severity === 'error' && /name/.test(f.message)));
});

test('A05：角色身份使用 name，只有 description 的旧子表不构成重复注册', async t => {
  const root = await agentFixture(t, '[agents.reviewer]\ndescription = "仅描述"\n');
  await put(root, '.codex/agents/other.toml', role());
  assert.deepEqual(findings(root, 'A05'), []);
  await put(root, 'legacy/review.toml', 'developer_instructions = "旧配置"\n');
  await put(root, '.codex/config.toml', '[agents.reviewer]\nconfig_file = "../legacy/review.toml"\n');
  assert.ok(findings(root, 'A05').some(f => f.severity === 'error' && /reviewer/.test(f.message)));
});

test('A06：无平行层通过，四种 v1 遗留分别警告', async t => {
  const root = await agentFixture(t);
  await put(root, '.codex/unrelated/README.md', '# 用户文档\n');
  assert.deepEqual(findings(root, 'A06'), []);
  for (const file of ['topology.yaml', 'roles/reviewer.md', 'bridges/reviewer.md', 'README.md']) {
    await put(root, `.codex/agents/${file}`, '# v1 遗留\n');
    assert.equal(checks(root).status, 0);
    assert.ok(findings(root, 'A06').some(f => f.severity === 'warn' && f.file === `.codex/agents/${file}`));
  }
});

test('A07：正文和注释提及摘要词合法，每个实际 TOML 键均错误', async t => {
  const root = await agentFixture(t);
  await put(root, '.codex/agents/reviewer.toml', role().replace('"先阅读项目导航"', '"""\nallowed_tools、forbidden_tools、write_scope、runtime_class 只是指令说明。\n"""') + '# write_scope = "并非字段"\n');
  assert.deepEqual(findings(root, 'A07'), []);
  for (const key of ['allowed_tools', 'forbidden_tools', 'write_scope', 'runtime_class']) {
    await put(root, '.codex/config.toml', `${key} = "摘要"\n`);
    assert.equal(checks(root).status, 1);
    assert.ok(findings(root, 'A07').some(f => f.severity === 'error' && f.message.includes(key)));
  }
});

test('A07：quoted、dotted、inline、nested 和 array table 按结构键检查', async t => {
  const root = await agentFixture(t);
  for (const text of ['"write_scope" = "src"\n', 'role.write_scope = "src"\n', 'role = { write_scope = "src" }\n', '[role]\nwrite_scope = "src"\n', '[[roles]]\nwrite_scope = "src"\n']) {
    await put(root, '.codex/config.toml', text);
    assert.ok(findings(root, 'A07').some(f => f.message.includes('write_scope')));
  }
});

test('A01：旧 config_file 缺失与路径越界安全报告，不泄漏外部 TOML 内容', async t => {
  const root = await agentFixture(t);
  const outside = await mkdtemp(join(tmpdir(), 'vic-check-agent-outside-'));
  t.after(() => rm(outside, { recursive: true, force: true }));
  await put(outside, 'secret.toml', 'SECRET_OUTSIDE = "绝不读取"\nname = broken\n');
  await symlink(outside, join(root, 'outside'));
  for (const path of ['agents/missing.toml', '../../outside.toml', 'C:\\outside\\secret.toml', '../outside/secret.toml']) {
    await put(root, '.codex/config.toml', `[agents.legacy]\nconfig_file = ${JSON.stringify(path)}\n`);
    const result = checks(root);
    assert.equal(result.status, 1);
    assert.ok(result.report.findings.some(f => f.id === 'A01' && f.severity === 'error'));
    assert.doesNotMatch(result.stdout, /SECRET_OUTSIDE/);
  }
  await put(root, '.codex/config.toml', '[agents.legacy]\nconfig_file = "agents"\n');
  await mkdir(join(root, '.codex/agents'), { recursive: true });
  assert.ok(findings(root, 'A01').some(f => /不是文件/.test(f.message)));
});

test('A01：角色文件与 agents 目录软链越界均不读取外部内容', async t => {
  const root = await agentFixture(t);
  const outside = await mkdtemp(join(tmpdir(), 'vic-check-agent-link-'));
  t.after(() => rm(outside, { recursive: true, force: true }));
  await put(outside, 'secret.toml', 'SECRET_OUTSIDE = broken\n');
  await mkdir(join(root, '.codex/agents'));
  await symlink(join(outside, 'secret.toml'), join(root, '.codex/agents/reviewer.toml'));
  assert.ok(findings(root, 'A01').some(f => /仓库边界/.test(f.message)));
  assert.doesNotMatch(checks(root).stdout, /SECRET_OUTSIDE/);
  await rm(join(root, '.codex/agents'), { recursive: true });
  await symlink(outside, join(root, '.codex/agents'));
  assert.ok(findings(root, 'A01').some(f => /仓库边界/.test(f.message)));
  assert.doesNotMatch(checks(root).stdout, /SECRET_OUTSIDE/);
});

test('--agents 跳过合同规则，--all 合并两类，--contract 不报告代理错误', async t => {
  const root = await fixture(t);
  await put(root, '.codex/config.toml', 'write_scope = "摘要"\n');
  await put(root, 'contracts/project-context.yaml', 'broken: [\n');
  const agents = checks(root);
  assert.equal(agents.status, 1);
  assert.ok(agents.report.findings.every(f => f.id.startsWith('A')));
  const all = inspect(root, '--all');
  assert.ok(all.report.findings.some(f => f.id === 'C01'));
  assert.ok(all.report.findings.some(f => f.id === 'A07'));
  assert.ok(inspect(root, '--contract').report.findings.every(f => f.id.startsWith('C')));
});

test('检查器只读；旧注册、无关配置与注释逐字节保留', async t => {
  const root = await agentFixture(t, '# 保留用户注释\nmodel = "parent"\n[agents.legacy]\nconfig_file = "agents/legacy.toml"\n[mcp_servers.local]\ncommand = "custom"\n');
  await put(root, '.codex/agents/legacy.toml', '# 保留片段\ndeveloper_instructions = "write_scope 仅为描述"\n');
  const files = ['.codex/config.toml', '.codex/agents/legacy.toml'];
  const before = await Promise.all(files.map(file => readFile(join(root, file))));
  assert.equal(checks(root).status, 0);
  assert.equal(invoke(root, '--agents', '--quiet').stdout, '');
  for (const [index, file] of files.entries()) assert.deepEqual(await readFile(join(root, file)), before[index]);
});

test('--agents 与其他范围互斥，未初始化仓库 quiet 保持无输出', async t => {
  const root = await mkdtemp(join(tmpdir(), 'vic-check-agent-empty-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  assert.equal(invoke(root, '--agents', '--quiet').status, 0);
  assert.equal(invoke(root, '--agents', '--quiet').stdout, '');
  for (const other of ['--all', '--contract', '--agents']) assert.equal(invoke(root, '--agents', other).status, 2);
});
