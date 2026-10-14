import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const manifestPath = '.codex-plugin/plugin.json';
export function releaseEntries(text) {
  return [...text.matchAll(/^##\s+\[?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\]?([^\n]*)$/gm)]
    .map(([, version, suffix]) => ({ version, published: !/开发中|未发布|unreleased/i.test(suffix) }));
}

// 普通开发 PR 可保持版本；把开发条目改为已发布或新增已发布版本就是发布变更。
// 开发号预置不算发布；基线已发布标题必须保留，说明文字可修改。
export function checkVersions(currentVersion, changelog, baseVersion, baseChangelog) {
  const current = releaseEntries(changelog);
  const base = releaseEntries(baseChangelog);
  const errors = [];
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(currentVersion)) errors.push('plugin.json 版本无效');
  if (!current.length || current[0].version !== currentVersion) errors.push('plugin.json 版本与 CHANGELOG 最新版本不一致');
  const priorPublished = new Set(base.filter(entry => entry.published).map(entry => entry.version));
  const newPublished = current.filter(entry => entry.published && !priorPublished.has(entry.version));
  const currentPublished = new Set(current.filter(entry => entry.published).map(entry => entry.version));
  if ([...priorPublished].some(version => !currentPublished.has(version))) {
    errors.push('必须保留已发布版本标题及其已发布状态');
  }
  if (newPublished.length && (!current[0].published || newPublished.some(entry => entry.version !== currentVersion))) {
    errors.push('新发布条目必须是 CHANGELOG 最新条目并对应插件版本');
  }
  if (currentVersion !== baseVersion && priorPublished.has(currentVersion)) errors.push('不得复用已发布版本');
  return errors;
}

export function dateWarning(value, now = new Date()) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return '核验日期缺失或无效';
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return '核验日期缺失或无效';
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = (today - date.getTime()) / 86400000;
  if (days < 0) return '核验日期位于未来，需重新核验';
  return days > 45 ? `核验日期已过 ${days} 天，需重新核验` : null;
}

export function run(baseRef) {
  if (!baseRef) throw new Error('必须通过 --base 提供 PR 基线');
  // 用共同祖先比较 PR 自身的变更，避免目标分支后续提交被当成 PR 的发布变更。
  const base = execFileSync('git', ['merge-base', 'HEAD', baseRef], { encoding: 'utf8' }).trim();
  const old = path => execFileSync('git', ['show', `${base}:${path}`], { encoding: 'utf8' });
  const errors = checkVersions(JSON.parse(readFileSync(manifestPath, 'utf8')).version,
    readFileSync('CHANGELOG.md', 'utf8'), JSON.parse(old(manifestPath)).version, old('CHANGELOG.md'));
  for (const error of errors) console.error(`::error::${error}`);
  for (const [path, date] of [
    ['skills/vic-agents/references/model-policy.md', readFileSync('skills/vic-agents/references/model-policy.md', 'utf8').match(/^核验日期：([^。\n]+)/m)?.[1]],
    ['scripts/lib/agents-fields.json', JSON.parse(readFileSync('scripts/lib/agents-fields.json', 'utf8')).checked_at],
  ]) {
    const warning = dateWarning(date);
    if (warning) console.warn(`::warning file=${path}::${warning}`);
    else console.log(`${path}：核验日期有效且未超过 45 天`);
  }
  console.log(`比较基线：${base}`);
  return errors.length ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.length !== 4 || process.argv[2] !== '--base') throw new Error('用法：node freshness.mjs --base <ref>');
    process.exitCode = run(process.argv[3]);
  } catch (error) {
    console.error(`::error::保鲜检查无法完成：${String(error.message).replace(/[\r\n]/g, ' ')}`);
    process.exitCode = 1;
  }
}
