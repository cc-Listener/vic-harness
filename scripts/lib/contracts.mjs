const list = value => Array.isArray(value) ? value : [];
import { lineCount } from './paths.mjs';

export function contractSemantics(records, strict) {
  const findings = [];
  const ids = new Map();
  for (const { file, value } of records) {
    const report = message => findings.push({ id: 'C01', severity: 'error', file, message,
      hint: '保持稳定 ID 唯一，并使新旧兼容字段一致' });
    if (file === 'contracts/project-context.yaml' && value?.parent !== undefined) report('根合同不允许 parent');
    if (file !== 'contracts/project-context.yaml' && value && value.parent === undefined) report('子合同必须声明 parent');
    const facts = [value?.project_map?.guarded_paths, value?.conventions?.validation_gates,
      value?.conventions?.rules, value?.component_contract?.preferred_abstractions, value?.component_contract?.locate_index];
    for (const entries of facts) for (const fact of list(entries)) {
      if (typeof fact?.id !== 'string') continue;
      if (ids.has(fact.id)) report(`重复 ID ${fact.id}，首次出现在 ${ids.get(fact.id)}`);
      else ids.set(fact.id, file);
    }
    const kind = value?.navigation_layer?.effective_guidance_entry?.kind;
    const legacyKind = value?.navigation_layer?.effective_guidance_kind?.value;
    if (kind !== undefined && legacyKind !== undefined && kind !== legacyKind) report('导航 kind 与 effective_guidance_kind.value 不一致');
    for (const gate of list(value?.conventions?.validation_gates)) {
      if (gate?.command !== undefined && gate?.command_hint !== undefined && gate.command !== gate.command_hint) {
        report(`validation_gates ${gate.id} 的 command 与 command_hint 不一致`);
      }
      if (strict && gate?.command_hint !== undefined) report(`command_hint 已弃用，请迁移为 command（${gate.id}）`);
    }
  }
  return findings;
}

const pointerFields = new Set(['path', 'entry', 'source', 'scope', 'contract', 'docs', 'parent',
  'glossary', 'adr_dir', 'dir', 'config', 'agents_dir', 'file']);
const pointerArrays = new Set(['evidence', 'entry_chain', 'locate_order', 'watch_paths']);

export async function contractPaths(records, repo) {
  const findings = [];
  for (const { file, value } of records) {
    const report = (message, severity = 'error') => findings.push({ id: 'C02', severity, file, message,
      hint: '使用仓库内相对路径并核对证据行号；明确缺失的指针应标记 present/detected/optional' });
    async function pointer(raw, field, skip) {
      if (typeof raw !== 'string') return;
      const range = field === 'evidence' && raw.match(/^(.*):(\d+)(?:-(\d+))?$/);
      const path = range ? range[1] : raw;
      const target = repo.boundary(path);
      if (target.reason) { report(`${raw}：${target.reason}`); return; }
      if (skip) return;
      if (field === 'watch_paths' && /[*?]/.test(path)) {
        if (!(await repo.matches(path))) report(`glob 未匹配任何路径：${raw}`);
        return;
      }
      const info = await repo.info(path);
      if (info.reason || info.missing) { report(`${raw}：${info.reason || '路径不存在'}`); return; }
      if (range) {
        const text = await repo.text(path);
        const start = Number(range[2]);
        const end = Number(range[3] || range[2]);
        if (text === null || start < 1 || end < start || end > lineCount(text)) report(`证据行号无效或超出文件长度：${raw}`, 'warn');
      }
    }
    async function visit(node, skip = false) {
      if (!node || typeof node !== 'object') return;
      skip ||= node.present === false || node.detected === false || node.optional === true;
      if (Array.isArray(node)) { for (const item of node) await visit(item, skip); return; }
      for (const [field, child] of Object.entries(node)) {
        if (pointerFields.has(field)) await pointer(child, field, skip);
        else if (pointerArrays.has(field)) for (const item of list(child)) await pointer(item, field, skip);
        else await visit(child, skip);
      }
    }
    await visit(value);
  }
  return findings;
}
