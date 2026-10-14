import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { loadAll, JSON_SCHEMA } from '../scripts/vendor/js-yaml.mjs';
import { fixture, put, inspect, componentDoc } from './support/fixtures.mjs';

test('完整 example 的两个文档分别作为真实根/子合同，引用夹具得到 0 error', async t => {
  const example = await readFile(new URL('../schemas/project-context.example.yaml', import.meta.url), 'utf8');
  const documents = loadAll(example, { schema: JSON_SCHEMA });
  assert.equal(documents.length, 2);
  const root = await fixture(t, documents[0]);
  await put(root, 'contracts/apps/web-project-context.yaml', documents[1]);
  for (const path of ['apps/web/src/components', 'docs/adr', 'docs/agents']) await mkdir(join(root, path), { recursive: true });
  for (const path of ['package.json', 'pnpm-workspace.yaml', 'apps/web/package.json', '.github/workflows/ci.yaml',
    'eslint.config.js', 'CONTRIBUTING.md', 'GLOSSARY.md', 'CODING_STANDARDS.md',
    'packages/ui/src/index.ts', 'packages/ui/src/button/AcmeButton.tsx',
    'apps/web/src/main.tsx', 'apps/web/src/App.tsx', 'apps/web/src/request/index.ts', 'apps/web/src/request/interceptors.ts']) {
    await put(root, path, '// 示例路径和证据行\n'.repeat(20));
  }
  await put(root, 'apps/web/AGENTS.md', '# 应用导航\n');
  await put(root, 'docs/apps/web/component-contract.md', componentDoc);
  const result = inspect(root, '--all');
  assert.equal(result.status, 0, result.stdout);
  assert.equal(result.report.summary.error, 0, result.stdout);
  assert.equal(result.report.summary.warn, 0, result.stdout);
});
