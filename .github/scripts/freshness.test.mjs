import test from 'node:test';
import assert from 'node:assert/strict';
import { checkVersions, dateWarning } from './freshness.mjs';

test('开发骨架和普通开发变更允许不升版', () => {
  assert.deepEqual(checkVersions('0.1.0', '## 0.1.0（开发中，未发布）\n- 新功能', '0.1.0', '## 0.1.0（开发中，未发布）'), []);
  assert.deepEqual(checkVersions('0.1.0', '## [0.1.0]\n- 修正文案', '0.1.0', '## [0.1.0]\n- 原文'), []);
});
test('首次发布和预置开发号转正式允许同号发布', () => {
  assert.deepEqual(checkVersions('0.1.0', '## 0.1.0', '0.1.0', '## 0.1.0（开发中，未发布）'), []);
  assert.deepEqual(checkVersions('0.2.0', '## 0.2.0\n## 0.1.0', '0.2.0', '## 0.2.0（开发中，未发布）\n## 0.1.0'), []);
});
test('新增发布匹配最新条目且不能复用已发布号', () => {
  assert.match(checkVersions('0.1.0', '## 0.2.0', '0.1.0', '## 0.1.0').join(), /不一致/);
  assert.deepEqual(checkVersions('0.2.0', '## 0.2.0\n## 0.1.0', '0.1.0', '## 0.1.0'), []);
  assert.match(checkVersions('0.1.0', '## 0.1.0', '0.2.0', '## 0.2.0\n## 0.1.0').join(), /复用/);
});
test('已发布历史不能删除或降级为开发状态', () => {
  for (const changelog of ['## 0.2.0', '## 0.2.0\n## 0.1.0（开发中，未发布）']) {
    assert.match(checkVersions('0.2.0', changelog, '0.1.0', '## 0.1.0').join(), /保留已发布/);
  }
  assert.match(checkVersions('0.2.0', '## 0.2.0（开发中，未发布）\n## 0.1.0', '0.2.0', '## 0.2.0\n## 0.1.0').join(), /保留已发布/);
  assert.match(checkVersions('0.3.0', '## 0.3.0（开发中，未发布）\n## 0.2.0\n## 0.1.0', '0.1.0', '## 0.1.0').join(), /新发布条目/);
});
test('日期按 UTC 日历计算，45 天不警告，46 天警告', () => {
  const now = new Date('2026-03-18T23:59:59Z');
  assert.equal(dateWarning('2026-02-01', now), null);
  assert.match(dateWarning('2026-01-31', now), /46 天/);
  for (const value of [undefined, '', '2026-02-30', '2026-2-01', '2026-03-19']) assert.ok(dateWarning(value, now));
  assert.equal(dateWarning('2024-02-29', new Date('2024-03-01T00:00:00Z')), null);
});
