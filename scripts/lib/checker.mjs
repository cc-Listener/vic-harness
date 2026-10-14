import { access, stat, readFile, realpath } from 'node:fs/promises';
import { join } from 'node:path';
import { parseYaml } from './yaml.mjs';
import { assertSupportedSchema, validateSchema } from './schema.mjs';
import { contractSemantics, contractPaths } from './contracts.mjs';
import { Repository } from './paths.mjs';
import { documentChecks, absolutePathChecks } from './documents.mjs';
import { componentDocuments, componentChecks } from './components.mjs';

async function exists(path) {
  try { await access(path); return true; }
  catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}

export async function checkRepository(root, options = {}) {
  if (!(await stat(root)).isDirectory()) throw new Error('目标路径不是目录');
  root = await realpath(root);
  const repo = new Repository(root);
  const initialized = await exists(join(root, 'contracts')) || await exists(join(root, '.codex'));
  const findings = [];
  if (!initialized) return { initialized, findings };
  const schema = parseYaml(await readFile(new URL('../../schemas/project-context.schema.yaml', import.meta.url), 'utf8'));
  assertSupportedSchema(schema);
  for (const directory of ['contracts', 'docs', '.codex']) {
    const target = await repo.info(directory);
    if (target.reason || !target.missing && !target.stat.isDirectory()) findings.push({ id: 'C02', severity: 'error', file: directory,
      message: target.reason || '检查范围不是目录', hint: '检查范围必须是目标仓库内的目录' });
  }
  const contractFiles = await repo.files('contracts');
  const files = contractFiles.filter(file => /(^|\/)project-context\.yaml$|-project-context\.yaml$/.test(file));
  const queued = new Set(files);
  const records = [];
  for (const file of files) {
    const target = await repo.info(file);
    if (target.reason || target.missing || !target.stat.isFile()) {
      findings.push({ id: 'C02', severity: 'error', file, message: target.reason || '合同文件不存在或不是文件',
        hint: '核对 apps[].contract 指针及仓库边界' });
      continue;
    }
    const text = await repo.text(file);
    let value;
    try {
      value = parseYaml(text);
    } catch (error) {
      findings.push({ id: 'C01', severity: 'error', file, message: `YAML 无法解析：${error.message}`,
        hint: '每份合同只允许一个 YAML 文档，检查语法和 alias' });
      continue;
    }
    records.push({ file, value });
    for (const message of validateSchema(value, schema)) findings.push({ id: 'C01', severity: 'error', file,
      message, hint: '按 schemas/project-context.schema.yaml 修正合同' });
    if (file === 'contracts/project-context.yaml') for (const app of Array.isArray(value?.apps) ? value.apps : []) {
      if (typeof app?.contract === 'string') {
        const target = repo.boundary(app.contract);
        const child = target.path || app.contract;
        if (!queued.has(child)) { files.push(child); queued.add(child); }
      }
    }
  }
  findings.push(...contractSemantics(records, options.strict));
  findings.push(...await contractPaths(records, repo));
  const documentDirectories = new Set(['docs']);
  const rootContract = records.find(record => record.file === 'contracts/project-context.yaml')?.value;
  for (const app of Array.isArray(rootContract?.apps) ? rootContract.apps : []) {
    if (typeof app?.docs !== 'string') continue;
    const target = repo.boundary(app.docs);
    if (!target.reason) documentDirectories.add(target.path);
  }
  const docs = [...new Set((await Promise.all([...documentDirectories].map(directory => repo.files(directory)))).flat())];
  const configs = await repo.files('.codex');
  const documentFiles = new Set([...docs, ...configs].filter(file => file.endsWith('.md')));
  documentFiles.add('AGENTS.md');
  documentFiles.add('AGENTS.override.md');
  for (const { value } of records) {
    const navigation = value?.navigation_layer;
    for (const pointer of [navigation?.agents_md, navigation?.effective_guidance_entry, ...(Array.isArray(navigation?.scoped_guidance) ? navigation.scoped_guidance : [])]) {
      if (typeof pointer?.path === 'string') documentFiles.add(pointer.path);
    }
  }
  const components = componentDocuments(records, [...documentFiles]);
  for (const file of components) documentFiles.add(file);
  findings.push(...await documentChecks([...documentFiles].sort(), repo));
  let pluginRepository = false;
  const manifest = await repo.text('.codex-plugin/plugin.json');
  if (manifest) { try { pluginRepository = JSON.parse(manifest).name === 'vic-harness'; } catch { /* 非本插件清单无需解析 */ } }
  const scanned = new Set([...contractFiles, ...files, ...docs, ...configs, ...documentFiles]);
  findings.push(...await absolutePathChecks([...scanned].sort(), repo, pluginRepository, records));
  findings.push(...await componentChecks(components, repo));
  return { initialized, findings };
}
