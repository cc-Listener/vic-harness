import test from 'node:test';
import assert from 'node:assert/strict';
import { contract, fixture, put, inspect, componentDoc } from './support/fixtures.mjs';
import { mkdir, symlink, rm, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

test('C01：有效 M1 合同通过，非法版本被识别为合同错误', async t => {
  const root = await fixture(t);
  assert.equal(inspect(root).report.summary.error, 0);
  const value = contract();
  value.schema_version = 9;
  await put(root, 'contracts/project-context.yaml', value);
  const result = inspect(root);
  assert.equal(result.status, 1);
  assert.ok(result.report.findings.some(f => f.id === 'C01' && f.message.includes('schema_version')));
});

test('C01：跨根和子合同的事实 ID 唯一，重复时指出原始合同', async t => {
  const value = contract();
  value.project_map.guarded_paths = [{ id: 'GP-001', path: 'AGENTS.md', reason: '导航入口', evidence: ['AGENTS.md:1'], confidence: 'verified' }];
  const root = await fixture(t, value);
  const child = { schema_version: 2, parent: 'contracts/project-context.yaml', project_map: contract().project_map,
    conventions: contract().conventions, component_contract: contract().component_contract, uncertainty: contract().uncertainty };
  child.project_map.guarded_paths = [{ ...value.project_map.guarded_paths[0], id: 'GP-web-001' }];
  await put(root, 'contracts/apps/web-project-context.yaml', child);
  assert.equal(inspect(root).report.summary.error, 0);
  child.project_map.guarded_paths[0].id = 'GP-001';
  await put(root, 'contracts/apps/web-project-context.yaml', child);
  const result = inspect(root);
  assert.equal(result.status, 1);
  assert.ok(result.report.findings.some(f => f.id === 'C01' && /重复 ID.*GP-001/.test(f.message)));
});

test('C01：新旧导航和命令别名必须一致，旧命令仅在 strict 下提示迁移', async t => {
  const value = contract();
  value.conventions.validation_gates = [{ id: 'VG-1', name: 'lint', command_hint: 'npm run lint', evidence: ['AGENTS.md'], confidence: 'inferred' }];
  const root = await fixture(t, value);
  assert.equal(inspect(root).report.summary.error, 0);
  const strict = inspect(root, '--strict');
  assert.equal(strict.status, 1);
  assert.ok(strict.report.findings.some(f => /command_hint.*迁移/.test(f.message)));
  value.conventions.validation_gates[0].command = 'npm test';
  value.navigation_layer.effective_guidance_entry.kind = 'agents_override_md';
  await put(root, 'contracts/project-context.yaml', value);
  const messages = inspect(root).report.findings.filter(f => f.id === 'C01').map(f => f.message).join('\n');
  assert.match(messages, /command.*不一致/);
  assert.match(messages, /kind.*不一致/);
});

test('C02：目录与证据范围有效；缺失路径是 error，越界行号是 warn', async t => {
  const value = contract();
  value.project_map.top_level_modules = [{ name: 'docs', path: 'docs/', role: '文档' }];
  value.project_map.guarded_paths = [{ id: 'GP-1', path: 'AGENTS.md', reason: '导航', evidence: ['AGENTS.md:1-1'], confidence: 'verified' }];
  const root = await fixture(t, value);
  assert.equal(inspect(root).report.summary.error, 0);
  value.project_map.guarded_paths[0].evidence = ['AGENTS.md:2-3'];
  await put(root, 'contracts/project-context.yaml', value);
  const warning = inspect(root);
  assert.equal(warning.status, 0);
  assert.ok(warning.report.findings.some(f => f.id === 'C02' && f.severity === 'warn'));
  value.project_map.top_level_modules[0].path = 'missing/';
  await put(root, 'contracts/project-context.yaml', value);
  assert.ok(inspect(root).report.findings.some(f => f.id === 'C02' && f.severity === 'error' && /missing/.test(f.message)));
});

test('C02：明确缺失指针免存在检查，但路径不能逃逸仓库，glob 仅用于 watch_paths', async t => {
  const value = contract();
  value.navigation_layer.agent_index = { path: 'absent.md', optional: true };
  value.navigation_layer.claude_md_bridge = { path: 'absent-claude.md', present: false };
  value.integrations = { knowledge_graph: { detected: false, path: '.ua/missing.json', owner: 'ua' } };
  value.watch_paths = ['src/*.ts'];
  const root = await fixture(t, value);
  await put(root, 'src/index.ts', '// 入口\n');
  assert.equal(inspect(root).report.summary.error, 0);
  value.project_map.top_level_modules = [{ name: 'wrong-glob', path: 'src/*.ts', role: '非 glob 字段' }];
  value.navigation_layer.agent_index.path = '../outside.md';
  await put(root, 'contracts/project-context.yaml', value);
  const messages = inspect(root).report.findings.filter(f => f.id === 'C02').map(f => f.message).join('\n');
  assert.match(messages, /src\/\*\.ts/);
  assert.match(messages, /仓库边界/);
  await mkdir(join(root, 'links'));
  await symlink('../../', join(root, 'links/outside'));
  value.project_map.top_level_modules[0].path = 'links/outside';
  await put(root, 'contracts/project-context.yaml', value);
  assert.ok(inspect(root).report.findings.some(f => f.id === 'C02' && /软链.*仓库边界/.test(f.message)));
});

test('C01：真实合同拒绝多文档、重复 key、自定义 tag、循环 alias 和坏 YAML', async t => {
  const root = await fixture(t);
  for (const input of ['a: 1\na: 2\n', 'a: !unknown x\n', 'a: &self { b: *self }\n', 'a: [1,2\n', JSON.stringify(contract()) + '\n---\n' + JSON.stringify(contract())]) {
    await put(root, 'contracts/project-context.yaml', input);
    const result = inspect(root);
    assert.equal(result.status, 1, result.stdout);
    assert.equal(result.stderr, '');
    assert.ok(result.report.findings.some(f => f.id === 'C01' && /YAML/.test(f.message)));
  }
});

test('C01：必填、枚举、类型、未知属性和非空 evidence 均实际生效', async t => {
  const root = await fixture(t);
  const changes = [value => delete value.version, value => value.bootstrap_status.level = 'unknown',
    value => value.project_map.top_level_modules = {}, value => value.agent_context.use_multi_agent = true,
    value => value.navigation_layer.agents_md.line_count = -1,
    value => value.non_goals = [''],
    value => value.project_map.guarded_paths = [{ id: 'GP-1', path: 'AGENTS.md', reason: '导航', evidence: [], confidence: 'verified' }]];
  for (const change of changes) {
    const value = contract();
    change(value);
    await put(root, 'contracts/project-context.yaml', value);
    assert.ok(inspect(root).report.findings.some(f => f.id === 'C01'));
  }
});

test('C01/C02：根声明的非默认子合同路径也参与验证和 ID 查重', async t => {
  const value = contract();
  value.apps = [{ name: 'web', path: 'web', contract: 'web/facts.yaml', docs: 'web/docs' }];
  const root = await fixture(t, value);
  await mkdir(join(root, 'web/docs'), { recursive: true });
  await put(root, 'web/docs/component-contract.md', componentDoc);
  const child = { schema_version: 2, parent: 'contracts/project-context.yaml', project_map: contract().project_map,
    conventions: contract().conventions, component_contract: contract().component_contract, uncertainty: contract().uncertainty };
  child.schema_version = 9;
  await put(root, 'web/facts.yaml', child);
  assert.ok(inspect(root).report.findings.some(f => f.id === 'C01' && f.file === 'web/facts.yaml'));
});

test('目录软链逃逸不会读取仓库外合同；边界错误不会误报为 YAML 内容错误', async t => {
  const root = await fixture(t);
  const outside = await mkdtemp(join(tmpdir(), 'vic-check-outside-'));
  t.after(() => rm(outside, { recursive: true, force: true }));
  await put(outside, 'project-context.yaml', 'SECRET_OUTSIDE: !unknown content\n');
  await rm(join(root, 'contracts'), { recursive: true });
  await symlink(outside, join(root, 'contracts'));
  const result = inspect(root);
  assert.equal(result.status, 1);
  assert.ok(result.report.findings.some(f => f.id === 'C02' && /仓库边界/.test(f.message)));
  assert.doesNotMatch(result.stdout, /SECRET_OUTSIDE/);
});
