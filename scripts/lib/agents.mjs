import { readFile, readdir, realpath } from 'node:fs/promises';
import { basename, isAbsolute } from 'node:path';
import { parse } from '../vendor/smol-toml.mjs';

const snapshot = JSON.parse(await readFile(new URL('./agents-fields.json', import.meta.url), 'utf8'));
const knownFields = new Set(snapshot.fields);
const aliases = new Set(Object.keys(snapshot.legacy_aliases));
const summaryFields = new Set(['allowed_tools', 'forbidden_tools', 'write_scope', 'runtime_class']);
const table = value => value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
const own = (value, key) => Object.hasOwn(value, key);

// 只检查解析后的键，注释和 developer_instructions 的字符串内容不参与。
function summaryChecks(value, file, findings, path = '') {
  if (Array.isArray(value)) {
    for (const [index, child] of value.entries()) summaryChecks(child, file, findings, `${path}[${index}]`);
  } else if (table(value)) {
    for (const [key, child] of Object.entries(value)) {
      const field = path ? `${path}.${key}` : key;
      if (summaryFields.has(key)) findings.push({ id: 'A07', severity: 'error', file,
        message: `摘要字段 ${field} 不能作为 Codex TOML 配置键`, hint: '把摘要语义放在指令中，权限使用官方配置字段' });
      summaryChecks(child, file, findings, field);
    }
  }
}

export async function agentChecks(repo) {
  const findings = [];
  const report = (file, message) => findings.push({ id: 'A01', severity: 'error', file, message,
    hint: '核对 TOML 语法及注册路径；仅允许读取仓库内文件' });
  async function directory(file) {
    const target = await repo.info(file);
    if (target.reason || !target.missing && !target.stat.isDirectory()) {
      report(file, target.reason || '代理检查范围不是目录');
      return null;
    }
    return target.missing ? null : target;
  }
  if (!await directory('.codex')) return findings;
  const records = new Map();
  async function load(file, required = false) {
    if (records.has(file)) return records.get(file);
    const target = await repo.info(file);
    if (target.reason || target.missing || !target.stat.isFile()) {
      if (required || target.reason || !target.missing) report(file, target.reason || (target.missing ? '注册配置文件不存在' : '配置路径不是文件'));
      records.set(file, null);
      return null;
    }
    const text = await repo.text(file);
    let value;
    try { value = parse(text, { integersAsBigInt: true }); }
    catch (error) {
      report(file, `TOML 无法解析：${error.message}`);
      records.set(file, null);
      return null;
    }
    const record = { file, value, actual: await realpath(target.absolute) };
    records.set(file, record);
    summaryChecks(value, file, findings);
    return record;
  }
  const config = await load('.codex/config.toml');
  const agents = table(config?.value.agents) ? config.value.agents : {};
  for (const [field, value] of Object.entries(agents)) {
    if (table(value) || knownFields.has(field) || aliases.has(field)) continue;
    findings.push({ id: 'A03', severity: 'warn', file: '.codex/config.toml',
      message: snapshot.compatibility_notes[field] ? `${field}：${snapshot.compatibility_notes[field]}` : `agents.${field} 不在当前已核验的全局字段列表中`,
      hint: `字段核验于 ${snapshot.checked_at}；核对目标客户端兼容性后保留或迁移` });
  }
  for (const [alias, canonical] of Object.entries(snapshot.legacy_aliases)) {
    if (!own(agents, alias)) continue;
    const conflict = own(agents, canonical);
    findings.push({ id: 'A04', severity: conflict ? 'error' : 'warn', file: '.codex/config.toml',
      message: conflict ? `旧别名 ${alias} 与 ${canonical} 同时存在` : `${alias} 是 ${canonical} 的旧别名`,
      hint: '保留原并发数值语义，迁移为 canonical 字段并避免双重声明' });
  }
  const registrations = new Map();
  const registeredFiles = new Set();
  for (const [name, value] of Object.entries(agents)) {
    if (!table(value) || !own(value, 'config_file')) continue;
    registrations.set(name, value.config_file);
    const raw = value.config_file;
    if (typeof raw !== 'string' || !raw.trim() || /[\0\r\n]/.test(raw)) {
      report('.codex/config.toml', `agents.${name}.config_file 路径格式无效`);
      continue;
    }
    const path = raw.replaceAll('\\', '/');
    if (isAbsolute(path) || /^[a-z]:\//i.test(path)) {
      report('.codex/config.toml', `agents.${name}.config_file 为绝对路径，超出仓库边界`);
      continue;
    }
    const target = repo.boundary(`.codex/${path}`);
    if (target.reason) { report('.codex/config.toml', `agents.${name}.config_file：${target.reason}`); continue; }
    const record = await load(target.path, true);
    if (record) registeredFiles.add(record.actual);
  }
  const standaloneFiles = new Set();
  const agentsDirectory = await directory('.codex/agents');
  if (agentsDirectory) {
    for (const entry of (await readdir(agentsDirectory.absolute, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (!entry.name.endsWith('.toml')) continue;
      const file = `.codex/agents/${entry.name}`;
      standaloneFiles.add(file);
      await load(file, true);
    }
  }
  for (const record of records.values()) {
    if (!record || record.file === '.codex/config.toml') continue;
    const { file, value } = record;
    // 旧注册引用的无 name 配置片段不套用新 standalone schema。
    if (!own(value, 'name') && registeredFiles.has(record.actual)) continue;
    if (!standaloneFiles.has(file) && !own(value, 'name')) continue;
    for (const field of ['name', 'description', 'developer_instructions']) {
      if (typeof value[field] !== 'string' || !value[field].trim()) findings.push({ id: 'A02', severity: 'error', file,
        message: `standalone 必须有非空字符串 ${field}`, hint: '补齐 name、description、developer_instructions' });
    }
    if (typeof value.name !== 'string' || !value.name.trim()) continue;
    if (basename(file, '.toml') !== value.name) findings.push({ id: 'A02', severity: 'warn', file,
      message: `文件名与 standalone name ${value.name} 不一致`, hint: '角色身份来源为 name；建议文件名与 name 保持一致' });
    if (registrations.has(value.name)) findings.push({ id: 'A05', severity: 'error', file,
      message: `角色 ${value.name} 同时存在 standalone 和 agents.${value.name}.config_file 注册`,
      hint: '保留一种角色定义方式，核对引用后再迁移重复定义' });
  }
  const legacy = ['.codex/agents/topology.yaml', '.codex/agents/README.md'];
  for (const dir of ['roles', 'bridges']) {
    const file = `.codex/agents/${dir}`;
    const target = await directory(file);
    if (!target) continue;
    for (const entry of await readdir(target.absolute, { withFileTypes: true })) {
      if (entry.name.endsWith('.md') && (entry.isFile() || entry.isSymbolicLink())) legacy.push(`${file}/${entry.name}`);
    }
  }
  for (const file of legacy.sort()) {
    const target = await repo.info(file);
    if (target.missing) continue;
    findings.push({ id: 'A06', severity: 'warn', file, message: '发现 v1 平行代理配置层',
      hint: '由 $vic-agents 提供 TOML 迁移或退役方案，经确认后处理' });
  }
  return findings;
}
