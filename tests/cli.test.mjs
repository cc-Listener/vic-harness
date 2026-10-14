import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { fixture, put } from './support/fixtures.mjs';

const cli = fileURLToPath(new URL('../scripts/vic-check.mjs', import.meta.url));
export function invoke(root, ...args) {
  return spawnSync(process.execPath, [cli, '--root', root, ...args], { encoding: 'utf8' });
}

test('未初始化仓库成功退出；普通、quiet 和 JSON 输出可预测', async () => {
  const root = await mkdtemp(join(tmpdir(), 'vic-check-cli-'));
  try {
    const normal = invoke(root);
    assert.equal(normal.status, 0, normal.stderr);
    assert.match(normal.stdout, /未初始化/);
    const quiet = invoke(root, '--quiet');
    assert.equal(quiet.status, 0);
    assert.equal(quiet.stdout, '');
    const json = invoke(root, '--json');
    assert.equal(json.status, 0);
    assert.equal(json.stderr, '');
    assert.deepEqual(JSON.parse(json.stdout).summary, { error: 0, warn: 0 });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('默认 --all 与 --contract 等价；JSON 是唯一对象，quiet 只输出一行', async t => {
  const root = await fixture(t);
  assert.deepEqual(JSON.parse(invoke(root, '--json').stdout), JSON.parse(invoke(root, '--all', '--json').stdout));
  assert.deepEqual(JSON.parse(invoke(root, '--all', '--json').stdout), JSON.parse(invoke(root, '--contract', '--json').stdout));
  assert.equal(invoke(root, '--quiet').stdout, '');
  const combined = invoke(root, '--quiet', '--json');
  assert.equal(combined.status, 0);
  assert.deepEqual(JSON.parse(combined.stdout).summary, { error: 0, warn: 0 });
  await put(root, 'AGENTS.md', '导航\n'.repeat(121));
  const warning = invoke(root, '--quiet');
  assert.equal(warning.status, 0);
  assert.equal(warning.stdout.trim().split('\n').length, 1);
  await put(root, 'AGENTS.md', '导航\n'.repeat(201));
  const errors = invoke(root, '--json');
  assert.equal(errors.status, 1);
  assert.equal(errors.stderr, '');
  assert.equal(JSON.parse(errors.stdout).summary.error, 1);
});

test('参数、检查范围和根路径错误使用退出码 2，并保持 JSON 可解析', async t => {
  const root = await fixture(t);
  for (const args of [['--unknown'], ['--all', '--contract'], ['--agents'], ['--drift'], ['--root'], ['--root', 'missing-directory']]) {
    const result = invoke(root, '--json', ...args);
    assert.equal(result.status, 2, result.stdout);
    assert.equal(result.stderr, '');
    assert.equal(JSON.parse(result.stdout).findings[0].id, 'CHECKER');
  }
});
