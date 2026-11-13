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

test('Codex 安装命令使用 marketplace 里锁定的 SHA', async () => {
  const market = await loadMarketplace();
  const cmds = codexCommands(market);
  for (const name of ['mattpocock-skills', 'understand-anything']) {
    const pinned = market.plugins.find(p => p.name === name).source.sha;
    const add = cmds.find(c => c.name === name).steps[1];
    assert.deepEqual(add.slice(-2), ['--ref', pinned]);
  }
  assert.ok(cmds.at(-1).steps.some(s => s.join(' ') === 'codex plugin add vic@vic-harness'));
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
