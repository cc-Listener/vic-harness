import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../../scripts/vic-check.mjs', import.meta.url));
export function invoke(root, ...args) {
  return spawnSync(process.execPath, [cli, '--root', root, ...args], { encoding: 'utf8' });
}
export function inspect(root, ...args) {
  const result = invoke(root, '--json', ...args);
  return { ...result, report: JSON.parse(result.stdout) };
}
export async function put(root, path, content) {
  await mkdir(dirname(join(root, path)), { recursive: true });
  await writeFile(join(root, path), typeof content === 'string' ? content : JSON.stringify(content));
}
export function contract() {
  return {
    version: 1, schema_version: 2, bootstrap_status: { level: 'bootstrap_complete' },
    navigation_layer: { agents_md: { path: 'AGENTS.md' }, effective_guidance_entry: { path: 'AGENTS.md', kind: 'agents_md' },
      effective_guidance_kind: { value: 'agents_md' } },
    project_map: { repo_type: 'single', workspace_mode: 'none', top_level_modules: [], guarded_paths: [] },
    conventions: { sources: [], validation_gates: [] },
    component_contract: { sources: [], systems: [], preferred_abstractions: [] },
    agent_context: { canonical_agent_contracts: [], multi_agent_readiness: {
      ownership_boundaries_clear: true, guarded_paths_defined: false, bootstrap_layer_complete: true } },
    uncertainty: { missing_information: [], inferred_but_unverified: [] }, non_goals: [],
  };
}
export const componentDoc = `# 组件合同
## 封装层定位索引表
| 场景 | 优先 import | 包入口 | 关键源码入口 | 代表导出 |
| --- | --- | --- | --- | --- |
| 按钮 | @app/ui | src/index.ts | src/button.ts | Button |
## 定位顺序
1. 先查共享包入口，再查应用组件目录。
## 检索命令
\`\`\`sh
rg -n "Button" src
\`\`\`
`;
export async function fixture(t, value = contract()) {
  const root = await mkdtemp(join(tmpdir(), 'vic-check-rule-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await put(root, 'AGENTS.md', '# 项目导航\n');
  await put(root, 'docs/component-contract.md', componentDoc);
  await put(root, 'contracts/project-context.yaml', value);
  return root;
}
