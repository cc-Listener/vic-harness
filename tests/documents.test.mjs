import test from 'node:test';
import assert from 'node:assert/strict';
import { contract, fixture, put, inspect, componentDoc } from './support/fixtures.mjs';
import { rm, symlink } from 'node:fs/promises';
import { join } from 'node:path';

async function appFixture(t, docs = 'apps/web/docs') {
  const value = contract();
  value.apps = [{ name: 'web', path: 'apps/web', contract: 'contracts/apps/web-project-context.yaml', docs }];
  const root = await fixture(t, value);
  await put(root, 'apps/web/docs/component-contract.md', componentDoc);
  await put(root, 'contracts/apps/web-project-context.yaml', {
    schema_version: 2, parent: 'contracts/project-context.yaml',
    project_map: value.project_map, conventions: value.conventions,
    component_contract: { ...value.component_contract, sources: [{ kind: 'component-contract', path: 'apps/web/docs/component-contract.md' }] },
    uncertainty: value.uncertainty,
  });
  return root;
}

test('C04/C06：显式 app-local 项目映射文档通过，坏链接与绝对路径均报告', async t => {
  const root = await appFixture(t, 'apps/web/./docs');
  const file = 'apps/web/docs/project-map.md';
  await put(root, file, '[组件](component-contract.md)\n[导航](../../../AGENTS.md)\n');
  assert.equal(inspect(root).report.summary.error, 0);
  await put(root, file, '[损坏链接](missing.md)\n/' + ['Users', 'alice', 'private'].join('/') + '\n');
  const result = inspect(root);
  assert.equal(result.status, 1);
  assert.deepEqual(result.report.findings.filter(f => f.file === file).map(f => f.id).sort(), ['C04', 'C06']);
});

test('C04/C06：应用文档和根 docs 重叠时不重复报告，非 Markdown 也检查绝对路径', async t => {
  const root = await appFixture(t, 'docs/./');
  await put(root, 'docs/project-map.md', '[损坏](missing.md)\n');
  await put(root, 'docs/notes.txt', '/' + ['home', 'alice', 'private'].join('/'));
  const findings = inspect(root).report.findings;
  assert.equal(findings.filter(f => f.id === 'C04' && f.file === 'docs/project-map.md').length, 1);
  assert.equal(findings.filter(f => f.id === 'C06' && f.file === 'docs/notes.txt').length, 1);
  await put(root, 'contracts/project-context.yaml', { ...contract(), apps: [{ name: 'web', path: 'apps/web', contract: 'contracts/apps/web-project-context.yaml', docs: 'apps/web/docs' }] });
  await put(root, 'apps/web/docs/notes.txt', '/' + ['home', 'alice', 'private'].join('/'));
  assert.equal(inspect(root).report.findings.filter(f => f.id === 'C06' && f.file === 'apps/web/docs/notes.txt').length, 1);
});

test('C04/C06：应用文档越界目录与外部软链不读取', async t => {
  const outside = await fixture(t);
  await put(outside, 'project-map.md', '[损坏](missing.md)\n/' + ['Users', 'alice', 'private'].join('/'));
  for (const docs of ['../' + outside.split('/').at(-1), 'apps/web/external-docs']) {
    const root = await appFixture(t, docs);
    if (docs === 'apps/web/external-docs') await symlink(outside, join(root, docs));
    const findings = inspect(root).report.findings;
    assert.ok(findings.some(f => f.id === 'C02' && /边界/.test(f.message)));
    assert.ok(!findings.some(f => ['C04', 'C06'].includes(f.id)));
  }
});

test('C03：120/121/200/201 行阈值准确，末尾换行不多算一行', async t => {
  const root = await fixture(t);
  for (const [count, severity] of [[120, null], [121, 'warn'], [200, 'warn'], [201, 'error']]) {
    await put(root, 'AGENTS.md', '导航\n'.repeat(count));
    const findings = inspect(root).report.findings.filter(f => f.id === 'C03');
    assert.equal(findings.length, severity ? 1 : 0);
    if (severity) assert.equal(findings[0].severity, severity);
  }
});

test('C04：按 Markdown 所在目录解析相对、图片、引用式链接，忽略示例代码', async t => {
  const root = await fixture(t);
  await put(root, 'docs/space name.md', '# 带空格\n');
  await put(root, 'docs/file(one).md', '# 括号\n');
  await put(root, 'docs/image.svg', '<svg/>');
  await put(root, 'AGENTS.md', '[指南](docs/guide.md)\n');
  await put(root, 'docs/guide.md', `[返回](../AGENTS.md#导航)
[带空格][target]
[target]: <space%20name.md> "标题"
[括号](file(one).md)
![图片](image.svg)
[站点](https://example.invalid) [邮箱](mailto:hello@example.invalid) [锚点](#本地)
\`[代码](missing-inline.md)\`
~~~md
[示例](missing-fenced.md)
~~~
`);
  assert.equal(inspect(root).report.summary.error, 0);
  await put(root, 'docs/image.svg', '<svg/>');
  await put(root, 'docs/guide.md', '[缺失][lost]\n[lost]: absent.md\n![图](missing.svg)\n');
  const failures = inspect(root).report.findings.filter(f => f.id === 'C04');
  assert.equal(failures.length, 2);
  assert.ok(failures.every(f => f.file === 'docs/guide.md'));
});

test('C04：../ 可以指向仓库内文件，逃逸仓库及坏 URL 编码会报告错误', async t => {
  const root = await fixture(t);
  await put(root, 'docs/deep/guide.md', '[根](../../AGENTS.md)\n');
  assert.equal(inspect(root).report.summary.error, 0);
  await put(root, 'docs/deep/guide.md', '[逃逸](../../../outside.md) [坏编码](%ZZ.md)\n');
  const findings = inspect(root).report.findings.filter(f => f.id === 'C04');
  assert.equal(findings.length, 2);
  assert.match(findings.map(f => f.message).join('\n'), /仓库边界/);
});

test('C06：扫描合同、导航、docs 和 codex 配置中的用户绝对路径', async t => {
  const root = await fixture(t);
  assert.equal(inspect(root).report.summary.error, 0);
  const unix = '/' + ['Users', 'alice', 'notes.md'].join('/');
  const linux = '/' + ['home', 'bob', 'work'].join('/');
  const windows = ['C:', 'Users', 'carol', 'project'].join('\\');
  await put(root, 'docs/guide.md', unix);
  await put(root, 'AGENTS.md', `# 导航\n${linux}\n`);
  await put(root, '.codex/config.toml', `notes = '${windows}'\n`);
  const value = contract();
  value.uncertainty.missing_information = [linux];
  await put(root, 'contracts/project-context.yaml', value);
  const findings = inspect(root).report.findings.filter(f => f.id === 'C06');
  assert.deepEqual(findings.map(f => f.file).sort(), ['.codex/config.toml', 'AGENTS.md', 'contracts/project-context.yaml', 'docs/guide.md']);
});

test('C06：只有插件仓库自身排除 docs/plan 和 reference，明确缺失指针仍检查绝对路径', async t => {
  const root = await fixture(t);
  const absolute = '/' + ['Users', 'alice', 'notes.md'].join('/');
  await put(root, 'docs/plan/example.md', absolute);
  assert.ok(inspect(root).report.findings.some(f => f.id === 'C06'));
  await put(root, '.codex-plugin/plugin.json', { name: 'vic-harness' });
  await put(root, 'reference/old.md', absolute);
  assert.ok(!inspect(root).report.findings.some(f => f.id === 'C06'));
  const value = contract();
  value.navigation_layer.agent_index = { path: absolute, optional: true };
  await put(root, 'contracts/project-context.yaml', value);
  assert.ok(inspect(root).report.findings.some(f => f.id === 'C06' && f.file.startsWith('contracts/')));
});

test('C09：组件文档有定位表、定位顺序和 rg 命令；缺少任一内容均失败', async t => {
  const root = await fixture(t);
  assert.equal(inspect(root).report.summary.error, 0);
  for (const broken of [componentDoc.replace('| 按钮 |', '| |'), componentDoc.replace('## 定位顺序\n1. 先查共享包入口，再查应用组件目录。', ''), componentDoc.replace('rg -n "Button" src', 'echo rg')]) {
    await put(root, 'docs/component-contract.md', broken);
    assert.ok(inspect(root).report.findings.some(f => f.id === 'C09'));
  }
});

test('C09：显式 component-contract 来源复用已有等价文档，不强制生成默认路径', async t => {
  const value = contract();
  value.component_contract.sources = [{ path: 'docs/ui-guide.md', kind: 'component-contract' }];
  const root = await fixture(t, value);
  await rm(join(root, 'docs/component-contract.md'));
  await put(root, 'docs/ui-guide.md', componentDoc);
  assert.equal(inspect(root).report.summary.error, 0);
  await put(root, 'docs/ui-guide.md', '# 只有抽象原则\n');
  assert.ok(inspect(root).report.findings.some(f => f.id === 'C09' && f.file === 'docs/ui-guide.md'));
});
