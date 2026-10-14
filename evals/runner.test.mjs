import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { controls, validateConfig } from './lib/config.mjs';
import { parseEvents, totalUsage, csvRow } from './lib/events.mjs';
import { execute } from './lib/process.mjs';
import { tree, restore, hashes } from './lib/files.mjs';
import { options, phasePrompt } from './run.mjs';

test('参数拒绝穿越、未知参数和未实现 L3', () => {
  assert.equal(options([]).model, 'gpt-6.1-sol');
  assert.equal(options([]).effort, 'low');
  assert.equal(options([]).rtk, false);
  assert.equal(options(['--rtk']).rtk, true);
  for (const args of [['--fixture', '../f1'], ['--repeat', '0'], ['--layer', '3'], ['--unknown', 'x'], ['--timeout', 'NaN']]) assert.throws(() => options(args));
});

test('配置逐项覆盖，特殊标识明确拒绝，投影不泄漏 MCP 连接', () => {
  assert.ok(controls('sol', 'low', ['sample']).includes('mcp_servers.sample.enabled=false'));
  assert.throws(() => controls('sol', 'low', ['a.b']), /unsupported/);
  const config = { model: 'sol', model_reasoning_effort: 'low', model_provider: 'test', approval_policy: 'never', sandbox_mode: 'workspace-write', notify: [], features: { plugins: false, hooks: false }, mcp_servers: { sample: { enabled: false, url: 'secret' } } };
  const projection = validateConfig(config, 'sol', 'low', 1);
  assert.ok(!JSON.stringify(projection).includes('sample'));
  assert.ok(!JSON.stringify(projection).includes('secret'));
  for (const change of [{ notify: ['x'] }, { features: { plugins: true, hooks: false } }, { mcp_servers: {} }, { model_reasoning_effort: 'medium' }, { sandbox_mode: 'danger-full-access' }]) assert.throws(() => validateConfig({ ...config, ...change }, 'sol', 'low', 1));
});

test('事件要求真实完整技能读取及唯一完成，用量不重复累计缓存', () => {
  const events = [{ type: 'item.completed', item: { id: 'i', type: 'command_execution', command: "rtk proxy cat 'skill'", exit_code: 0, aggregated_output: '技能全文' } }, { type: 'turn.completed', usage: { input_tokens: 100, output_tokens: 20, cached_input_tokens: 80 } }];
  const parse = (value) => parseEvents(value.map((e) => JSON.stringify(e)).join('\n'), '技能全文', "rtk proxy cat 'skill'");
  const result = parse(events);
  assert.deepEqual(result.errors, []); assert.equal(result.usage.tokens, 120); assert.equal(result.actual_model, null);
  assert.equal(totalUsage([result, result]).tokens, 240);
  assert.equal(totalUsage([result, { usage: { tokens: null } }]).tokens, null);
  assert.equal(totalUsage([result], 2).tokens, null);
  assert.ok(parse([...events, events[1]]).errors.includes('completion_count_invalid'));
  assert.ok(parse(events.slice(1)).errors.includes('skill_read_unverified'));
  assert.ok(parse([...events, { type: 'turn.failed' }]).errors.includes('model_event_failure'));
  assert.ok(parseEvents('bad', '', '').errors.includes('invalid_jsonl'));
  assert.ok(parseEvents('null', '', '').errors.includes('invalid_event'));
  assert.ok(parse([{ type: 'item.completed', item: { type: 'command_execution', command: 'other', exit_code: 0 } }, ...events]).errors.includes('skill_read_unverified'));
});

test('CSV 正确转义且未知用量留空', () => {
  assert.equal(csvRow(['a,b', 'x"y', null, false]), '"a,b","x""y",,false\n');
});

test('默认提示在无 RTK 的 PATH 下读取来源；RTK 仅用户可选指导', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'vic-prompt-test-'));
  try {
    const skillPath = path.join(temp, "skill's.md"); await writeFile(skillPath, 'skill');
    const standard = phasePrompt({ skill: 'vic-bootstrap', skillPath, phase: 'first', rtk: false });
    assert.ok(standard.readCommand.startsWith('cat ')); assert.ok(!standard.prompt.includes('rtk'));
    const read = await execute('/usr/bin/env', ['PATH=/usr/bin:/bin', 'sh', '-c', standard.readCommand]);
    assert.equal(read.exit_code, 0); assert.equal(read.stdout, 'skill');
    const requested = phasePrompt({ skill: 'vic-bootstrap', skillPath, phase: 'second', rtk: true });
    assert.ok(requested.readCommand.startsWith('rtk proxy cat ')); assert.ok(requested.prompt.includes('用户要求'));
  } finally { await rm(temp, { recursive: true, force: true }); }
});

test('完整文件树归档保留隐藏、忽略、空目录及字节；拒绝软链', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'vic-runner-test-'));
  try {
    const source = path.join(temp, 'source'), target = path.join(temp, 'target');
    await mkdir(path.join(source, '.hidden'), { recursive: true });
    await mkdir(path.join(source, 'empty'));
    await writeFile(path.join(source, '.hidden', 'data'), Buffer.from([0, 255, 10]));
    const before = await tree(source); await restore(before, target);
    assert.deepEqual(hashes(await tree(target)), hashes(before));
    await rm(path.join(target, '.hidden', 'data'));
    assert.notDeepEqual(hashes(await tree(target)), hashes(before));
    await assert.rejects(() => restore({ x: { kind: 'symlink', target: 'data' } }, path.join(temp, 'rejected')), /unsupported/);
  } finally { await rm(temp, { recursive: true, force: true }); }
});

test('进程原始附件与非零/超时信息真实保留', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'vic-process-test-'));
  try {
    const stdoutFile = path.join(temp, 'out'), stderrFile = path.join(temp, 'err');
    const result = await execute(process.execPath, ['-e', 'process.stdout.write("raw\\n");process.stderr.write("failure");process.exitCode=7'], { stdoutFile, stderrFile });
    assert.equal(result.exit_code, 7); assert.equal(await readFile(stdoutFile, 'utf8'), 'raw\n'); assert.equal(await readFile(stderrFile, 'utf8'), 'failure');
    const timed = await execute(process.execPath, ['-e', 'setInterval(()=>{},1000)'], { timeout: 80 });
    assert.equal(timed.timed_out, true); assert.equal(timed.signal, 'SIGTERM');
    const missing = await execute('vic-test-command-not-found', []);
    assert.equal(missing.spawn_error, true); assert.notEqual(missing.exit_code, 0);
  } finally { await rm(temp, { recursive: true, force: true }); }
});

test('真实断言接口：首轮新增不误判；二轮忽略文件、删除和空目录变化均失败', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'vic-interface-test-'));
  try {
    const repo = path.join(temp, 'repo'), expected = path.join(temp, 'expected.yaml');
    const before = path.join(temp, 'before.json'), first = path.join(temp, 'first.json');
    await mkdir(repo); await writeFile(expected, 'idempotent: true\ngit_diff_only: []\n');
    const cli = path.resolve('evals/assert.mjs');
    const snapshot = (out) => execute(process.execPath, [cli, 'snapshot', '--root', repo, '--expected', expected, '--out', out]);
    assert.equal((await snapshot(before)).exit_code, 0);
    await writeFile(path.join(repo, 'generated'), 'first');
    await writeFile(path.join(repo, '.ignored'), 'first');
    assert.equal((await snapshot(first)).exit_code, 0);
    const checkArgs = [cli, 'check', '--root', repo, '--expected', expected, '--before', before, '--first', first, '--phase', 'final', '--json'];
    assert.equal((await execute(process.execPath, checkArgs)).exit_code, 0);
    await rm(path.join(repo, 'generated')); await writeFile(path.join(repo, '.ignored'), 'second'); await mkdir(path.join(repo, 'empty'));
    const changed = await execute(process.execPath, checkArgs); assert.equal(changed.exit_code, 1);
    const report = JSON.parse(changed.stdout);
    assert.deepEqual(report.tree_changes, { added: ['empty'], deleted: ['generated'], changed: ['.ignored'] });
  } finally { await rm(temp, { recursive: true, force: true }); }
});
