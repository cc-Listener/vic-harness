#!/usr/bin/env node
// T04 确定性验收：手写理想产物和破坏用例，不调用 LLM、不运行 fixture 业务代码。
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, cp, readFile, writeFile, rm, symlink, chmod } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const temp = await mkdtemp(path.join(tmpdir(), 'vic-t04-'));
const results = [];
const record = (name) => { results.push(name); console.log(`通过 ${name}`); };
const write = async (root, name, data) => {
  const target = path.join(root, name);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, typeof data === 'string' || Buffer.isBuffer(data) ? data : JSON.stringify(data, null, 2) + '\n');
};
const rootContract = (map, conventions, components, missing = []) => ({
  version: 1, schema_version: 2, bootstrap_status: { level: 'bootstrap_complete' },
  navigation_layer: { agents_md: { path: 'AGENTS.md' }, effective_guidance_entry: { path: 'AGENTS.md', kind: 'agents_md' }, effective_guidance_kind: { value: 'agents_md' } },
  project_map: map, conventions, component_contract: components,
  agent_context: { canonical_agent_contracts: [], multi_agent_readiness: { ownership_boundaries_clear: true, guarded_paths_defined: map.guarded_paths.length > 0, bootstrap_layer_complete: true } },
  uncertainty: { missing_information: missing, inferred_but_unverified: [] }, non_goals: ['不定义代理配置或单次执行决策'],
});
const map = (type, mode, modules, guarded = []) => ({ repo_type: type, workspace_mode: mode, top_level_modules: modules, guarded_paths: guarded });
const module = (name, source, role) => ({ name, path: source, role });
const guard = (id, source) => ({ id, path: source, reason: '统一配置或请求边界，修改前核对调用影响', evidence: [source], confidence: 'verified' });
const gates = (source, prefix) => ({ sources: [{ path: source, kind: 'scripts' }], validation_gates: [
  { id: 'VG-001', name: 'lint', command: `${prefix}lint`, verified: false, evidence: [source], confidence: 'verified' },
  { id: 'VG-002', name: 'typecheck', command: `${prefix}typecheck`, verified: false, evidence: [source], confidence: 'verified' },
] });
const emptyConventions = { sources: [], validation_gates: [] };
const emptyComponents = { sources: [], systems: [], preferred_abstractions: [], locate_index: [], locate_order: [], search_commands: [] };
const abstraction = (id, name, entry, source, importPath, instead) => ({ id, name, path: source, import: importPath, entry, source, exports: [name], use_instead_of: [instead], evidence: [entry, source], confidence: 'verified' });
const locate = (id, name, entry, source, importPath) => ({ id, scenario: name, import: importPath, entry, source, exports: [name], evidence: [entry, source], confidence: 'verified' });
const docs = (source, importPath, symbol) => `# 组件合同\n\n## 封装层定位索引\n\n| 场景 | 优先 import | 包入口 | 关键源码 | 代表导出 |\n| --- | --- | --- | --- | --- |\n${symbol ? `| 提交按钮 | ${importPath} | ${source.entry} | ${source.file} | ${symbol} |` : '| 尚未发现封装 | 无法确认 | 无法确认 | 无法确认 | 无法确认 |'}\n\n## 定位顺序\n\n1. 先查 ${source.entry}。\n2. 再查 ${source.file}，证据不足时记录 uncertainty。\n\n## 组件与符号可检索索引\n\n${symbol ?? '当前没有已证实的共享组件。'}\n\n检索命令：\n\n\`\`\`sh\nrg -n "export|function|def " ${source.search}\n\`\`\`\n`;

async function ideal(root, fixture) {
  let contract, componentDoc, extraNavigation = '';
  if (fixture === 'f1-single-app') {
    const entry = 'src/ui/index.ts';
    const components = { sources: [{ path: entry, kind: 'barrel' }], systems: [{ name: '项目 UI', path: 'src/ui', preferred: true }],
      preferred_abstractions: [abstraction('PA-001', 'AppButton', entry, 'src/ui/AppButton.tsx', '@/ui', 'antd/Button'), abstraction('PA-002', 'AppModal', entry, 'src/ui/AppModal.tsx', '@/ui', 'antd/Modal')],
      locate_index: [locate('LI-001', 'AppButton', entry, 'src/ui/AppButton.tsx', '@/ui'), locate('LI-002', 'AppModal', entry, 'src/ui/AppModal.tsx', '@/ui')],
      locate_order: [entry, 'src/ui'], search_commands: ['rg -n "export" src/ui'] };
    contract = rootContract(map('single-app', 'npm', [module('前端', 'src', '单应用源码')], [guard('GP-001', 'src/request/interceptors.ts'), guard('GP-002', '.env.production')]), gates('package.json', 'npm run '), components);
    componentDoc = docs({ entry, file: 'src/ui/AppButton.tsx', search: 'src/ui' }, '@/ui', 'AppButton');
    componentDoc += '\n模态框同样从 `@/ui` 导入 `AppModal`，源码为 `src/ui/AppModal.tsx`。\n';
  } else if (fixture === 'f2-monorepo') {
    const entry = 'packages/ui/src/index.ts', source = 'packages/ui/src/button/AcmeButton.tsx';
    const components = { sources: [{ path: entry, kind: 'barrel' }], systems: [{ name: 'acme-ui', path: 'packages/ui', preferred: true }],
      preferred_abstractions: [abstraction('PA-001', 'AcmeButton', entry, source, '@acme/ui', 'antd/Button')],
      locate_index: [locate('LI-001', 'AcmeButton', entry, source, '@acme/ui')], locate_order: [entry, 'packages/ui/src'], search_commands: ['rg -n "export" packages/ui/src'] };
    contract = rootContract(map('monorepo', 'pnpm-workspace', [module('web', 'apps/web', '主应用'), module('admin', 'apps/admin', '管理应用'), module('ui', 'packages/ui', '共享 UI')]), gates('package.json', 'pnpm '), components);
    contract.apps = [{ name: 'web', path: 'apps/web', contract: 'contracts/apps/web-project-context.yaml', docs: 'docs/apps/web' }];
    contract.navigation_layer.scoped_guidance = [{ path: 'apps/web/AGENTS.md', scope: 'apps/web' }];
    const appMap = map('app', 'pnpm-workspace', [module('web 源码', 'apps/web/src', '主应用源码')], [guard('GP-WEB-001', 'apps/web/src/request/interceptors.ts'), guard('GP-WEB-002', 'apps/web/.env.production')]);
    appMap.entry_chain = ['apps/web/src/main.tsx', 'apps/web/src/bootstrap.tsx', 'apps/web/src/router/index.tsx'];
    await write(root, 'contracts/apps/web-project-context.yaml', { parent: 'contracts/project-context.yaml', schema_version: 2, project_map: appMap,
      conventions: { sources: [{ path: 'apps/web/package.json', kind: 'scripts' }], validation_gates: [] },
      component_contract: { ...emptyComponents, locate_index: [locate('LI-WEB-001', 'AcmeButton', entry, source, '@acme/ui')], locate_order: [entry, 'apps/web/src'], search_commands: ['rg -n "AcmeButton" apps/web/src'] },
      uncertainty: { missing_information: [], inferred_but_unverified: ['子应用静态检查尚未运行'] } });
    await write(root, 'apps/web/AGENTS.md', '# web 导航\n\n读取 [项目地图](../../docs/apps/web/project-map.md)、[约定](../../docs/apps/web/conventions.md)、[组件](../../docs/apps/web/component-contract.md) 和 [子合同](../../contracts/apps/web-project-context.yaml)。\n');
    await write(root, 'docs/apps/web/project-map.md', '# web 项目地图\n\n入口链是 `apps/web/src/main.tsx` → `apps/web/src/bootstrap.tsx` → `apps/web/src/router/index.tsx`。\n请求统一鉴权在 `apps/web/src/request/interceptors.ts`；生产 API 配置在 `apps/web/.env.production`。\n');
    await write(root, 'docs/apps/web/conventions.md', '# web 约定\n\n应用命令在 `apps/web/package.json`，尚未运行验证。跨仓检查读取 [根约定](../../conventions.md)。\n');
    await write(root, 'docs/apps/web/component-contract.md', docs({ entry, file: source, search: 'apps/web/src' }, '@acme/ui', 'AcmeButton') + '\n共享封装的定义读取 [根组件合同](../../component-contract.md)。\n');
    extraNavigation = '\n主应用深层事实读取 [web 导航](apps/web/AGENTS.md)。\n';
    componentDoc = docs({ entry, file: source, search: 'packages/ui/src' }, '@acme/ui', 'AcmeButton');
  } else {
    const entry = fixture === 'f3-legacy-layers' ? 'src/main.py' : 'main.py';
    contract = rootContract(map('python', 'none', [module('程序入口', fixture === 'f3-legacy-layers' ? 'src' : entry, 'Python 入口')]), emptyConventions, emptyComponents, ['无法确认静态检查命令或框架，仓库没有相关配置证据']);
    componentDoc = docs({ entry, file: entry, search: entry });
    if (fixture === 'f3-legacy-layers') {
      // 手工保留原段落的全部字节，含代码块中的假标题与子标题。
      const old = await readFile(path.join(root, 'AGENTS.md'), 'utf8');
      extraNavigation = '\n' + old.slice(old.indexOf('## Agent skills\n'), old.indexOf('## 旧治理手册\n'));
      extraNavigation += '## 分层说明\n\n已有代理目录索引只报告迁移建议，不修改外部所有者内容。\n';
    }
  }
  await write(root, 'contracts/project-context.yaml', contract);
  await write(root, 'AGENTS.md', '# 项目导航\n\n依次读取 [项目地图](docs/project-map.md)、[约定](docs/conventions.md)、[组件合同](docs/component-contract.md) 与 [事实合同](contracts/project-context.yaml)。\n' + extraNavigation);
  await write(root, 'docs/project-map.md', '# 项目地图\n\n模块和范围读取 `contracts/project-context.yaml`。本文只导航到已证实的入口。\n');
  await write(root, 'docs/conventions.md', '# 项目约定\n\n检查命令读取合同的 `conventions.validation_gates`。没有配置时无法确认命令；不编造已通过的验证。\n');
  await write(root, 'docs/component-contract.md', componentDoc);
}

function run(args, exit = 0) {
  let output, status = 0;
  try { output = execFileSync(process.execPath, [path.join(here, 'assert.mjs'), ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (error) { status = error.status; output = error.stdout; if (status === 2) output = error.stderr; }
  assert.equal(status, exit, `退出码：${args.join(' ')}\n${output}`);
  return JSON.parse(output);
}

try {
  const cases = {};
  for (const fixture of ['f1-single-app', 'f2-monorepo', 'f3-legacy-layers', 'f4-empty']) {
    const root = path.join(temp, fixture), expected = path.join(here, 'fixtures', fixture, 'expected.yaml');
    await cp(path.join(here, 'fixtures', fixture, 'repo'), root, { recursive: true });
    const before = path.join(temp, `${fixture}-before.json`), first = path.join(temp, `${fixture}-first.json`);
    run(['snapshot', '--root', root, '--expected', expected, '--out', before, '--json']);
    await ideal(root, fixture);
    const firstResult = run(['check', '--root', root, '--expected', expected, '--before', before, '--phase', 'first', '--json']);
    assert.equal(firstResult.pass, true); assert.deepEqual(firstResult.pending, ['idempotent']);
    record(`${fixture}:手写理想产物+真实vic-check`);
    run(['snapshot', '--root', root, '--expected', expected, '--out', first, '--json']);
    const args = ['check', '--root', root, '--expected', expected, '--before', before, '--first', first, '--phase', 'final', '--json'];
    assert.equal(run(args).pass, true); record(`${fixture}:第二次真实树不变`);
    cases[fixture] = { root, expected, before, first, args };
  }
  const one = cases['f1-single-app'], three = cases['f3-legacy-layers'], four = cases['f4-empty'];
  async function corrupt(item, file, mutate, id) {
    const full = path.join(item.root, file), original = await readFile(full);
    try { await writeFile(full, mutate(original)); assert(run(item.args, 1).assertions.some((entry) => !entry.pass && entry.id.startsWith(id)), id); record(id); }
    finally { await writeFile(full, original); }
  }
  await corrupt(one, 'AGENTS.md', () => '# 导航\n' + '重复行\n'.repeat(121), 'max_lines:AGENTS.md');
  await corrupt(one, 'contracts/project-context.yaml', (bytes) => { const data = JSON.parse(bytes); data.component_contract.preferred_abstractions[0].import = 'antd'; data.component_contract.preferred_abstractions[1].import = 'antd'; return JSON.stringify(data); }, 'yaml_paths:contracts/project-context.yaml:component_contract.preferred_abstractions[*].import:contains');
  await corrupt(one, 'contracts/project-context.yaml', () => 'broken: [\n', 'vic_check:error');
  await corrupt(three, 'GLOSSARY.md', (bytes) => Buffer.concat([bytes, Buffer.from('被修改\n')]), 'files_unchanged:GLOSSARY.md');
  await corrupt(three, 'AGENTS.md', (bytes) => bytes.toString().replace('## 这是假标题，不应切断外部段落', '## 代码块内也必须保留原始字节'), 'sections_unchanged:AGENTS.md:## Agent skills');
  await corrupt(three, 'AGENTS.md', (bytes) => bytes.toString().replaceAll('\n', '\r\n'), 'sections_unchanged:AGENTS.md:## Agent skills');
  await corrupt(three, 'AGENTS.md', (bytes) => bytes.toString() + '\n## Agent skills\n重复段落\n', 'sections_unchanged:AGENTS.md:## Agent skills');
  await corrupt(four, 'contracts/project-context.yaml', (bytes) => { const data = JSON.parse(bytes); data.uncertainty.missing_information = []; return JSON.stringify(data); }, 'yaml_paths:contracts/project-context.yaml:uncertainty.missing_information:not_empty');
  await corrupt(four, 'contracts/project-context.yaml', (bytes) => { const data = JSON.parse(bytes); data.component_contract.systems = [{ name: '虚构组件库', path: 'main.py', preferred: true }]; return JSON.stringify(data); }, 'yaml_paths:contracts/project-context.yaml:component_contract.systems:equals');
  const two = cases['f2-monorepo'];
  await corrupt(two, 'contracts/project-context.yaml', (bytes) => { const data = JSON.parse(bytes); data.project_map.guarded_paths = [guard('GP-DUP-001', 'apps/web/src/request/interceptors.ts')]; return JSON.stringify(data); }, 'yaml_paths:contracts/project-context.yaml:project_map.guarded_paths[*].path:excludes');
  await write(one.root, '.codex/agents/topology.yaml', '不应生成的平行层');
  assert(run(one.args, 1).assertions.some((entry) => entry.id === 'files_absent:.codex/agents/topology.yaml' && !entry.pass)); record('files_absent:不生成平行层'); await rm(path.join(one.root, '.codex'), { recursive: true });
  await corrupt(four, 'docs/conventions.md', (bytes) => bytes.toString() + '\nNext.js\n', 'forbidden_text:docs/**/*.md:');
  await write(four.root, 'docs/deep/nested/fabrication.md', 'Next.js\n');
  assert(run(four.args, 1).assertions.some((entry) => !entry.pass && entry.id.startsWith('forbidden_text:docs/**/*.md:'))); record('glob:**/同时匹配直接与深层文件');
  await rm(path.join(four.root, 'docs/deep'), { recursive: true });
  await write(one.root, '.gitignore', 'ignored-output/\n');
  await write(one.root, 'ignored-output/new.bin', Buffer.from([0, 255, 1]));
  const changes = run(one.args, 1);
  assert(changes.tree_changes.added.includes('ignored-output/new.bin')); assert(changes.tree_changes.added.includes('ignored-output')); record('idempotent:新增未跟踪和忽略文件+目录');
  await rm(path.join(one.root, '.gitignore')); await rm(path.join(one.root, 'ignored-output'), { recursive: true });
  const missing = path.join(one.root, 'docs/project-map.md'), saved = await readFile(missing);
  await rm(missing); const deleted = run(one.args, 1); assert(deleted.tree_changes.deleted.includes('docs/project-map.md')); assert(deleted.assertions.some((entry) => entry.id === 'files_exist:docs/project-map.md' && !entry.pass)); record('idempotent:删除第一次生成的未跟踪产物'); await writeFile(missing, saved);
  await chmod(path.join(one.root, 'src/main.tsx'), 0o600); assert(run(one.args, 1).tree_changes.changed.includes('src/main.tsx')); record('idempotent:文件权限改动'); await chmod(path.join(one.root, 'src/main.tsx'), 0o644);
  await mkdir(path.join(one.root, '.git')); await write(one.root, '.git/sentinel', '忽略 Git 内部元数据'); assert.equal(run(one.args).pass, true); record('snapshot:仅排除根.git');
  run(['snapshot', '--root', one.root, '--expected', one.expected, '--out', path.join(one.root, 'self.json'), '--json'], 2); record('snapshot:拒绝树内输出');
  await symlink(one.root, path.join(temp, 'root-link'));
  run(['snapshot', '--root', one.root, '--expected', one.expected, '--out', path.join(temp, 'root-link/escape.json'), '--json'], 2); record('snapshot:拒绝经父目录软链污染树');
  await symlink(path.join(temp, 'not-present'), path.join(one.root, 'outside-link'));
  const linked = path.join(temp, 'linked.json'); run(['snapshot', '--root', one.root, '--expected', one.expected, '--out', linked, '--json']);
  assert.equal(JSON.parse(await readFile(linked)).entries['outside-link'].kind, 'symlink'); record('snapshot:记录断链且不跟随'); await rm(path.join(one.root, 'outside-link'));
  await write(temp, 'external/secret.txt', '不应读取的外部字节');
  await symlink(path.join(temp, 'external'), path.join(one.root, 'outside-dir'));
  run(['snapshot', '--root', one.root, '--expected', one.expected, '--out', linked, '--json']);
  const linkEntries = JSON.parse(await readFile(linked)).entries;
  assert.equal(linkEntries['outside-dir'].kind, 'symlink'); assert(!Object.hasOwn(linkEntries, 'outside-dir/secret.txt')); record('snapshot:不跟随仓库外目录软链'); await rm(path.join(one.root, 'outside-dir'));
  run(['check', '--root', one.root, '--expected', one.expected, '--before', one.before, '--json'], 2); record('baseline:final缺少first拒绝验收');
  run(['check', '--root', one.root, '--expected', one.expected, '--before', one.before, '--first', one.before, '--json'], 2); record('baseline:运行前与第一次不可复用同一文件');
  const wrongFirst = path.join(temp, 'wrong-first.json'); await cp(one.before, wrongFirst);
  const wrongArgs = one.args.map((arg) => arg === one.first ? wrongFirst : arg);
  assert(run(wrongArgs, 1).tree_changes.added.includes('contracts/project-context.yaml')); record('baseline:不能以运行前树代替第一次生成后的树');
  assert.equal(run(one.args).pass, true); record('破坏用例还原后重新通过');
  console.log(`T04_VERIFIED=${results.length}`);
} finally { await rm(temp, { recursive: true, force: true }); }
