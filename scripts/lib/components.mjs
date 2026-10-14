import { posix } from 'node:path';
import { markdownParts } from './markdown.mjs';

const list = value => Array.isArray(value) ? value : [];
function explicitDocuments(value) {
  return list(value?.component_contract?.sources).filter(pointer => pointer?.kind === 'component-contract' && typeof pointer.path === 'string').map(pointer => posix.normalize(pointer.path));
}

export function componentDocuments(records, existingFiles) {
  const files = new Set(existingFiles.filter(file => posix.basename(file) === 'component-contract.md'));
  const root = records.find(record => record.file === 'contracts/project-context.yaml');
  if (root) {
    const explicit = explicitDocuments(root.value);
    for (const file of explicit.length ? explicit : ['docs/component-contract.md']) files.add(file);
    for (const app of list(root.value?.apps)) {
      const child = records.find(record => typeof app?.contract === 'string' && record.file === posix.normalize(app.contract));
      const documents = explicitDocuments(child?.value);
      if (documents.length) for (const file of documents) files.add(file);
      else if (typeof app?.docs === 'string') files.add(posix.join(app.docs, 'component-contract.md'));
    }
  }
  for (const { value } of records) for (const file of explicitDocuments(value)) files.add(file);
  return [...files].sort();
}

function hasTable(prose) {
  const lines = prose.split('\n');
  const cells = line => line.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());
  const headers = [/场景|scenario/i, /import/i, /包入口|entry|barrel/i, /源码|source/i, /导出|exports?/i];
  for (let index = 0; index < lines.length - 2; index++) {
    if (!lines[index].includes('|')) continue;
    const header = cells(lines[index]);
    const separator = cells(lines[index + 1]);
    if (!headers.every(pattern => header.some(cell => pattern.test(cell)))) continue;
    if (separator.length !== header.length || !separator.every(cell => /^:?-{3,}:?$/.test(cell))) continue;
    for (let row = index + 2; row < lines.length && lines[row].includes('|'); row++) {
      const values = cells(lines[row]);
      if (values.length === header.length && values.every(cell => cell && !/^[-—]+$/.test(cell))) return true;
    }
  }
  return false;
}

function hasSearchCommand(text) {
  // 只识别文档中的明确调用；不执行命令，也不把 echo 字符串内的分隔符当成调用边界。
  const invocation = /^[ \t]*(?:\$[ \t]*)?(?:rtk[ \t]+(?:proxy[ \t]+)?)?rg[ \t]+\S/;
  for (const line of text.split('\n')) {
    let start = 0, quote = null;
    for (let index = 0; index < line.length; index++) {
      const char = line[index];
      if (char === '\\' && quote !== "'") { index++; continue; }
      if (quote) { if (char === quote) quote = null; continue; }
      if (char === "'" || char === '"') { quote = char; continue; }
      if (char === ';' || (char === '&' && line[index + 1] === '&')) {
        if (invocation.test(line.slice(start, index))) return true;
        if (char === '&') index++;
        start = index + 1;
      }
    }
    if (invocation.test(line.slice(start))) return true;
  }
  return false;
}

export async function componentChecks(files, repo) {
  const findings = [];
  for (const file of files) {
    const text = await repo.text(file);
    const missing = [];
    if (text === null) missing.push('组件文档不存在或不在仓库内');
    else {
      const { prose, code } = markdownParts(text);
      if (!hasTable(prose)) missing.push('有具体条目的定位表（场景/import/包入口/源码/导出）');
      const order = prose.match(/^#{1,6}\s+[^\n]*(?:定位顺序|检索顺序|locate order|lookup order)[^\n]*\n([^#]*)/im);
      if (!order || !/(?:^\s*\d+[.)、]\s*\S|先[^\n]+(?:再|后)|first[^\n]+then)/im.test(order[1])) missing.push('明确的定位顺序');
      const inline = [...prose.matchAll(/`([^`\n]+)`/g)].map(match => match[1]).join('\n');
      if (!hasSearchCommand(`${code}\n${inline}\n${prose}`)) missing.push('至少一条 rg 检索命令');
    }
    if (missing.length) findings.push({ id: 'C09', severity: 'error', file, message: `组件合同缺少：${missing.join('；')}`,
      hint: '补充定位表、定位顺序和 rg 示例；已有等价文档用 sources 的 kind: component-contract 显式指向' });
  }
  return findings;
}
