import { posix } from 'node:path';
import { lineCount } from './paths.mjs';
import { markdownLinks } from './markdown.mjs';

export async function documentChecks(files, repo) {
  const findings = [];
  for (const file of files) {
    const text = await repo.text(file);
    if (text === null) continue;
    if (/(^|\/)AGENTS(?:\.override)?\.md$/.test(file)) {
      const count = lineCount(text);
      if (count > 120) findings.push({ id: 'C03', severity: count > 200 ? 'error' : 'warn', file,
        message: `AGENTS.md 有 ${count} 行，建议不超过 120 行`, hint: '将细节移到文档并保留导航指针' });
    }
    for (const link of markdownLinks(text)) {
      if (!link || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(link) && !/^[a-z]:[\\/]/i.test(link)) continue;
      let path, reason;
      try {
        path = decodeURIComponent(link.split(/[?#]/, 1)[0]);
        if (!path) continue;
        const pointer = path.startsWith('/') || /^[a-z]:[\\/]/i.test(path) ? path : posix.join(posix.dirname(file), path);
        const info = await repo.info(pointer);
        reason = info.reason || (info.missing ? '目标不存在' : null);
      } catch (error) {
        if (!(error instanceof URIError)) throw error;
        reason = 'URL 编码无效';
      }
      if (reason) findings.push({ id: 'C04', severity: 'error', file, message: `相对链接 ${link}：${reason}`,
        hint: '链接相对所在 Markdown 文件解析，核对目标路径' });
    }
  }
  return findings;
}

export async function absolutePathChecks(files, repo, pluginRepository, records = []) {
  const findings = [];
  function scalarText(value) {
    if (typeof value === 'string') return value;
    if (!value || typeof value !== 'object') return '';
    return Object.values(value).map(scalarText).join('\n');
  }
  for (const file of files) {
    if (pluginRepository && /^(?:reference\/|docs\/plan\/)/.test(file)) continue;
    const text = await repo.text(file);
    if (text === null) continue;
    const decoded = records.find(record => record.file === file);
    const content = `${text}\n${decoded ? scalarText(decoded.value) : ''}`;
    const users = [...content.matchAll(/\/(?:Users|home)\/([^/\s"'`<>()[\]{}]+)/g),
      ...content.matchAll(/\b[a-z]:\\+Users\\+([^\\\s"'`<>()[\]{}]+)/gi)];
    if (users.some(match => !['.', '..', '...'].includes(match[1]))) findings.push({ id: 'C06', severity: 'error', file,
      message: '含用户绝对路径，无法在其他机器可靠使用', hint: '改成仓库内相对路径或可移植的配置引用' });
  }
  return findings;
}
