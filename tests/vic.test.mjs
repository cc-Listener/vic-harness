import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  ROOT, loadMarketplace, validateMarketplace, referencedSkills, missingSkills,
  planUpgrade, applyUpgrade, codexCommands, upsertPointer,
} from '../scripts/vic.mjs';

const sha = c => c.repeat(40);

test('仓库里的 marketplace 通过结构校验', async () => {
  assert.deepEqual(validateMarketplace(await loadMarketplace()), []);
});

test('上游条目缺 sha、缺 version 或缺失时报错', () => {
  const errors = validateMarketplace({ plugins: [
    { name: 'vic', source: './plugins/vic' },
    { name: 'mattpocock-skills', source: { source: 'github', repo: 'x/y', sha: 'abc' } },
  ] });
  assert.ok(errors.some(e => e.includes('40 位')));
  assert.ok(errors.some(e => e.includes('version')));
  assert.ok(errors.some(e => e.includes('understand-anything')));
});

test('接线引用：识别完整写法和表格单元格里的简写', () => {
  const refs = referencedSkills('| x | `/mattpocock-skills:to-spec`、`to-tickets` | `/understand-anything:understand-chat` |\n运行 `/mattpocock-skills:retro`');
  assert.deepEqual(refs, [
    'mattpocock-skills:retro', 'mattpocock-skills:to-spec', 'mattpocock-skills:to-tickets', 'understand-anything:understand-chat',
  ]);
});

test('接线引用：不存在于上游的 skill 被报出', () => {
  const available = { 'mattpocock-skills': new Set(['tdd']), 'understand-anything': new Set(['understand']) };
  assert.deepEqual(missingSkills(['mattpocock-skills:tdd', 'mattpocock-skills:gone', 'understand-anything:understand'], available),
    ['mattpocock-skills:gone']);
});

test('真实接线 skill 至少引用两个上游各一个 skill', async () => {
  const refs = referencedSkills(await readFile(join(ROOT, 'plugins/vic/skills/vic/SKILL.md'), 'utf8'));
  assert.ok(refs.some(r => r.startsWith('mattpocock-skills:')));
  assert.ok(refs.some(r => r.startsWith('understand-anything:')));
});

test('只在上游 version 变化时计划升级', () => {
  const plan = planUpgrade({
    a: { sha: sha('1'), version: '1.0.0', current: { sha: sha('0'), version: '1.0.0' } },
    b: { sha: sha('2'), version: '2.1.0', current: { sha: sha('0'), version: '2.0.0' } },
  });
  assert.deepEqual(Object.keys(plan), ['b']);
});

test('写回升级不改动其他条目，也不修改原对象', () => {
  const market = { plugins: [
    { name: 'vic', source: './plugins/vic' },
    { name: 'understand-anything', version: '2.0.0', source: { source: 'git-subdir', url: 'u', path: 'p', sha: sha('0') } },
  ] };
  const next = applyUpgrade(market, { 'understand-anything': { sha: sha('2'), version: '2.1.0' } });
  assert.equal(next.plugins[1].source.sha, sha('2'));
  assert.equal(next.plugins[1].version, '2.1.0');
  assert.equal(next.plugins[1].source.path, 'p');
  assert.equal(market.plugins[1].source.sha, sha('0'));
  assert.deepEqual(next.plugins[0], market.plugins[0]);
});

test('Codex 只从 vic-harness 一个 marketplace 安装全部插件', async () => {
  const market = await loadMarketplace();
  const lines = codexCommands(market).map(c => c.cmd.join(' '));
  for (const name of ['vic', 'mattpocock-skills', 'understand-anything']) {
    assert.ok(lines.includes(`codex plugin add ${name}@vic-harness`), `缺少 ${name}@vic-harness`);
  }
  assert.ok(lines.includes('codex plugin marketplace add cc-Listener/vic-harness'));
  // 不再单独添加上游 marketplace，也不在命令行里写 SHA：版本只来自 marketplace.json。
  assert.ok(!lines.some(l => / marketplace add (mattpocock|Egonex-AI)\//.test(l)));
  assert.ok(!lines.some(l => l.includes('--ref')));
});

test('Codex 安装会清理旧版单独添加的上游 marketplace，且清理失败不阻断安装', async () => {
  const cmds = codexCommands(await loadMarketplace());
  for (const mk of ['mattpocock', 'understand-anything']) {
    const step = cmds.find(c => c.cmd.join(' ') === `codex plugin marketplace remove ${mk}`);
    assert.ok(step?.optional, `应可选地移除 ${mk}`);
  }
  const firstAdd = cmds.findIndex(c => c.cmd.includes('add') && !c.optional);
  assert.ok(cmds.slice(0, firstAdd).every(c => c.optional), '清理步骤应在安装之前');
});

test('上游 source 只允许 Claude Code 与 Codex 都支持的 url / git-subdir', () => {
  const market = { plugins: [
    { name: 'vic', source: './plugins/vic' },
    { name: 'mattpocock-skills', version: '1.0.0', source: { source: 'github', repo: 'a/b', sha: sha('a') } },
    { name: 'understand-anything', version: '1.0.0', source: { source: 'git-subdir', url: 'https://x', path: 'p', sha: sha('b') } },
  ] };
  const errors = validateMarketplace(market);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /mattpocock-skills.*url 或 git-subdir/);
});

test('Codex AGENTS.md 指针段：追加、幂等、保留其他内容', () => {
  const once = upsertPointer('# 我的规则\n- 用中文\n');
  assert.ok(once.startsWith('# 我的规则\n- 用中文\n\n<!-- vic-harness:begin -->'));
  assert.equal(upsertPointer(once), once);
  const edited = once.replace('先读', '旧文本先读');
  assert.equal(upsertPointer(edited), once);
  assert.ok(upsertPointer('').startsWith('<!-- vic-harness:begin -->'));
});

test('通过别名路径（如 /tmp 软链）调用脚本时仍会执行 main', async () => {
  const { execFile } = await import('node:child_process');
  const { mkdtemp, symlink, rm } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const dir = await mkdtemp(join(tmpdir(), 'vic-alias-'));
  try {
    await symlink(ROOT, join(dir, 'repo'));
    const out = await new Promise((resolve, reject) => execFile(process.execPath,
      [join(dir, 'repo/scripts/vic.mjs'), 'check', '--offline'], (e, stdout) => e ? reject(e) : resolve(stdout)));
    assert.match(out, /vic check：通过/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('上游条目统一用 HTTPS 克隆，不依赖 SSH（22 端口常被封）', async () => {
  const market = await loadMarketplace();
  for (const name of ['mattpocock-skills', 'understand-anything']) {
    const src = market.plugins.find(p => p.name === name).source;
    assert.notEqual(src.source, 'github', `${name} 不应使用 github 源（会走 SSH）`);
    assert.match(src.url, /^https:\/\//);
  }
});
