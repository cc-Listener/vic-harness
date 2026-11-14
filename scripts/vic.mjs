#!/usr/bin/env node
// vic-harness 维护脚本：零依赖，Node >= 18。
// 唯一的版本来源是 .claude-plugin/marketplace.json（ADR 0002）。
//
//   node scripts/vic.mjs check                 校验 marketplace 与接线引用
//   node scripts/vic.mjs codex-install [--dry-run] [--local]   从 vic-harness marketplace 安装或升级三个插件，并写入 AGENTS.md 指针
//   node scripts/vic.mjs upstream [--write]    查询上游最新版本；--write 时写回锁定版本
import { readFile, writeFile, readdir, mkdtemp, rm, realpath } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join, dirname } from 'node:path';
import { tmpdir, homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MARKETPLACE = join(ROOT, '.claude-plugin/marketplace.json');

// 每个上游：plugin.json 位置，以及 skill 列表从哪里读。
export const UPSTREAMS = {
  'mattpocock-skills': { manifest: '.claude-plugin/plugin.json', skillsFrom: 'manifest' },
  'understand-anything': { manifest: 'understand-anything-plugin/.claude-plugin/plugin.json', skillsFrom: 'understand-anything-plugin/skills' },
};

export async function loadMarketplace(path = MARKETPLACE) {
  return JSON.parse(await readFile(path, 'utf8'));
}

export function repoUrl(source) {
  return source.url;
}

// 只做结构校验，不访问网络。
export function validateMarketplace(market) {
  const errors = [];
  const byName = new Map((market.plugins || []).map(p => [p.name, p]));
  for (const name of Object.keys(UPSTREAMS)) {
    const entry = byName.get(name);
    if (!entry) { errors.push(`marketplace 缺少上游条目 ${name}`); continue; }
    const src = entry.source;
    if (!src || typeof src !== 'object') { errors.push(`${name}：source 必须是对象`); continue; }
    if (!/^[0-9a-f]{40}$/.test(src.sha || '')) errors.push(`${name}：source.sha 必须是 40 位小写 commit SHA`);
    if (!/^\d+\.\d+\.\d+/.test(entry.version || '')) errors.push(`${name}：缺少锁定的 version`);
    if (!['url', 'git-subdir'].includes(src.source)) errors.push(`${name}：source 类型必须是 url 或 git-subdir（Claude Code 与 Codex 都支持，且走 HTTPS），实际是 ${src.source}`);
  }
  const vic = byName.get('vic');
  if (!vic) errors.push('marketplace 缺少 vic 条目');
  return errors;
}

// 接线 skill 引用的 /插件:skill 必须在锁定的上游中真实存在。
export function referencedSkills(text) {
  const refs = new Set();
  for (const m of text.matchAll(/\/(mattpocock-skills|understand-anything):([a-z0-9-]+)/g)) refs.add(`${m[1]}:${m[2]}`);
  // 表格里同一单元格的简写：`/mattpocock-skills:to-spec`、`to-tickets`
  for (const line of text.split('\n')) {
    for (const cell of line.split('|')) {
      const head = cell.match(/\/(mattpocock-skills|understand-anything):[a-z0-9-]+/);
      if (!head) continue;
      for (const m of cell.matchAll(/`([a-z0-9-]+)`/g)) refs.add(`${head[1]}:${m[1]}`);
    }
  }
  return [...refs].sort();
}

export function missingSkills(refs, available) {
  return refs.filter(ref => {
    const [plugin, skill] = ref.split(':');
    return !(available[plugin] || new Set()).has(skill);
  });
}

async function git(args, cwd) {
  const { stdout } = await run('git', args, { cwd, maxBuffer: 64 * 1024 * 1024 });
  return stdout.trim();
}

// 浅克隆某个 commit，返回目录；调用方负责删除。
async function checkout(url, sha) {
  const dir = await mkdtemp(join(tmpdir(), 'vic-upstream-'));
  await git(['init', '-q'], dir);
  await git(['remote', 'add', 'origin', url], dir);
  await git(['fetch', '-q', '--depth', '1', 'origin', sha], dir);
  await git(['checkout', '-q', 'FETCH_HEAD'], dir);
  return dir;
}

export async function upstreamSkills(name, dir) {
  const up = UPSTREAMS[name];
  const manifest = JSON.parse(await readFile(join(dir, up.manifest), 'utf8'));
  let skills;
  if (up.skillsFrom === 'manifest') skills = (manifest.skills || []).map(p => p.split('/').filter(Boolean).pop());
  else skills = (await readdir(join(dir, up.skillsFrom), { withFileTypes: true })).filter(e => e.isDirectory()).map(e => e.name);
  return { version: manifest.version, skills: new Set(skills) };
}

async function wiringText() {
  return readFile(join(ROOT, 'plugins/vic/skills/vic/SKILL.md'), 'utf8');
}

// 在给定的 sha 上校验：版本号与锁定一致，接线引用的 skill 全部存在。
export async function verifyAt(market, overrides = {}) {
  const errors = [];
  const available = {};
  for (const name of Object.keys(UPSTREAMS)) {
    const entry = market.plugins.find(p => p.name === name);
    const sha = overrides[name]?.sha || entry.source.sha;
    const expected = overrides[name]?.version || entry.version;
    const dir = await checkout(repoUrl(entry.source), sha);
    try {
      const { version, skills } = await upstreamSkills(name, dir);
      if (version !== expected) errors.push(`${name}@${sha.slice(0, 12)} 的 plugin.json 版本是 ${version}，锁定的是 ${expected}`);
      available[name] = skills;
    } finally { await rm(dir, { recursive: true, force: true }); }
  }
  const missing = missingSkills(referencedSkills(await wiringText()), available);
  for (const ref of missing) errors.push(`接线引用的 /${ref} 在锁定版本中不存在`);
  return { errors, available };
}

// 查询上游默认分支最新 commit 与其 plugin.json 版本。
export async function latest(market) {
  const out = {};
  for (const name of Object.keys(UPSTREAMS)) {
    const entry = market.plugins.find(p => p.name === name);
    const url = repoUrl(entry.source);
    const sha = (await git(['ls-remote', url, 'HEAD'])).split(/\s+/)[0];
    const dir = await checkout(url, sha);
    try {
      const { version } = await upstreamSkills(name, dir);
      out[name] = { sha, version, current: { sha: entry.source.sha, version: entry.version } };
    } finally { await rm(dir, { recursive: true, force: true }); }
  }
  return out;
}

// 只在上游 version 变化时升级（ADR 0003）。
export function planUpgrade(latestInfo) {
  return Object.fromEntries(Object.entries(latestInfo).filter(([, v]) => v.version !== v.current.version));
}

export function applyUpgrade(market, plan) {
  const next = structuredClone(market);
  for (const [name, { sha, version }] of Object.entries(plan)) {
    const entry = next.plugins.find(p => p.name === name);
    entry.source.sha = sha;
    entry.version = version;
  }
  return next;
}

export const VIC_REPO = 'cc-Listener/vic-harness';
export const VIC_MARKETPLACE = 'vic-harness';
// 旧版 codex-install 单独添加过的上游 marketplace，迁移时移除，避免 skill 出现两份。
const LEGACY_CODEX_MARKETPLACES = { 'mattpocock-skills': 'mattpocock', 'understand-anything': 'understand-anything' };

// Codex 与 Claude Code 共用同一个 marketplace（ADR 0006）：三个插件都从 vic-harness 安装。
// Codex 没有插件依赖，所以逐个 add；marketplace 已存在时 upgrade 会刷新锁定版本。
export function codexCommands(market, { local = false } = {}) {
  const legacy = Object.entries(LEGACY_CODEX_MARKETPLACES).flatMap(([plugin, mk]) => [
    { cmd: ['codex', 'plugin', 'remove', `${plugin}@${mk}`], optional: true },
    { cmd: ['codex', 'plugin', 'marketplace', 'remove', mk], optional: true },
  ]);
  const plugins = market.plugins.map(p => p.name);
  return [
    ...legacy,
    { cmd: ['codex', 'plugin', 'marketplace', 'add', local ? ROOT : VIC_REPO], optional: false },
    { cmd: ['codex', 'plugin', 'marketplace', 'upgrade', VIC_MARKETPLACE], optional: true },
    ...plugins.map(name => ({ cmd: ['codex', 'plugin', 'add', `${name}@${VIC_MARKETPLACE}`], optional: false })),
  ];
}
const BEGIN = '<!-- vic-harness:begin -->';
const END = '<!-- vic-harness:end -->';
const POINTER = `${BEGIN}
## vic-harness
本机装有 vic-harness（mattpocock-skills + understand-anything）。开始代码调查、实现、调试、评审或规划前，先读 \`$vic:vic\` 的接线规则。
${END}`;

// 在 ~/.codex/AGENTS.md 里维护一个带标记的指针段，其他内容原样保留（ADR 0004）。
export function upsertPointer(text) {
  const start = text.indexOf(BEGIN), end = text.indexOf(END);
  if (start >= 0 && end > start) return text.slice(0, start) + POINTER + text.slice(end + END.length);
  return `${text}${text && !text.endsWith('\n') ? '\n' : ''}${text ? '\n' : ''}${POINTER}\n`;
}

async function main(argv) {
  const [command, ...flags] = argv;
  const market = await loadMarketplace();
  if (command === 'check') {
    const errors = validateMarketplace(market);
    if (!errors.length && !flags.includes('--offline')) errors.push(...(await verifyAt(market)).errors);
    for (const e of errors) console.error(`error: ${e}`);
    console.log(errors.length ? `vic check：${errors.length} 个错误` : 'vic check：通过');
    return errors.length ? 1 : 0;
  }
  if (command === 'codex-install') {
    const dry = flags.includes('--dry-run');
    for (const { cmd, optional } of codexCommands(market, { local: flags.includes('--local') })) {
      console.log(`$ ${cmd.join(' ')}`);
      if (dry) continue;
      try { await run(cmd[0], cmd.slice(1)); }
      catch (error) {
        if (optional) continue; // 迁移清理、已存在时的刷新：失败可以忽略
        console.error(`失败：${(error.stderr || error.message).trim()}`);
        return 1;
      }
    }
    const agentsFile = join(process.env.CODEX_HOME || join(homedir(), '.codex'), 'AGENTS.md');
    console.log(`更新 ${agentsFile} 中的 vic-harness 指针段`);
    if (!dry) {
      let text = '';
      try { text = await readFile(agentsFile, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      await writeFile(agentsFile, upsertPointer(text));
    }
    console.log(dry ? '（dry-run，未执行）' : 'Codex 安装完成；重启 Codex 生效。');
    return 0;
  }
  if (command === 'upstream') {
    const info = await latest(market);
    const plan = planUpgrade(info);
    const result = { latest: info, upgrade: plan, verify: null };
    if (Object.keys(plan).length) {
      result.verify = await verifyAt(market, plan).then(r => r.errors);
      if (flags.includes('--write')) await writeFile(MARKETPLACE, `${JSON.stringify(applyUpgrade(market, plan), null, 2)}\n`);
    }
    console.log(JSON.stringify(result, null, 2));
    return 0;
  }
  console.error('用法：node scripts/vic.mjs <check [--offline] | codex-install [--dry-run] | upstream [--write]>');
  return 2;
}

// 比较真实路径：/tmp → /private/tmp 这类系统别名会让字面比较失败。
const entry = process.argv[1] && await realpath(process.argv[1]).catch(() => null);
if (entry && entry === await realpath(fileURLToPath(import.meta.url))) {
  process.exitCode = await main(process.argv.slice(2)).catch(error => { console.error(error.message); return 2; });
}
