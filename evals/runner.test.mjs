import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, cp, realpath, chmod } from 'node:fs/promises';
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


test('超时及 SIGINT/SIGTERM 等待杀死忽略 SIGTERM 的同组孙进程', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'vic-group-test-'));
  try {
    for (const trigger of ['timeout', 'SIGINT', 'SIGTERM']) {
      const pidFile = path.join(temp, trigger);
      const descendant = `process.on('SIGTERM',()=>{});require('node:fs').writeFileSync(${JSON.stringify(pidFile)},String(process.pid));setInterval(()=>{},1000)`;
      const parent = `require('node:child_process').spawn(process.execPath,['-e',${JSON.stringify(descendant)}],{stdio:'ignore'});setInterval(()=>{},1000)`;
      let pid;
      try {
        const pending = execute(process.execPath, ['-e', parent], { timeout: trigger === 'timeout' ? 600 : 10000 });
        for (let i = 0; i < 100; i++) {
          try { pid = Number(await readFile(pidFile, 'utf8')); break; } catch {}
          await new Promise((done) => setTimeout(done, 20));
        }
        assert.ok(pid, '孙进程已注册 SIGTERM handler');
        if (trigger !== 'timeout') process.emit(trigger);
        const result = await pending;
        assert.equal(result.timed_out, trigger === 'timeout');
        assert.equal(result.interrupted, trigger === 'timeout' ? null : trigger);
        assert.ok(result.seconds >= 2, '结果等待完整终止宽限期');
        for (let i = 0; i < 50; i++) {
          try { process.kill(pid, 0); } catch { pid = null; break; }
          await new Promise((done) => setTimeout(done, 20));
        }
        assert.equal(pid, null, '返回后孙进程已不存在');
      } finally { if (pid) { try { process.kill(pid, 'SIGKILL'); } catch {} } }
    }
  } finally { await rm(temp, { recursive: true, force: true }); }
});

test('系统路径别名实际 run.sh help、无模型失败及 mock repeat2 落盘', { skip: process.platform !== 'darwin' }, async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'vic-alias-test-'));
  const canonical = await realpath(temp), alias = canonical.replace(/^\/private(?=\/var\/)/, '');
  const workspaces = [];
  try {
    assert.notEqual(alias, canonical, '使用系统既有别名，不创建软链');
    for (const folder of ['scripts', 'schemas', 'skills/vic-bootstrap', '.codex-plugin', 'evals/lib', 'evals/fixtures/f1-single-app']) {
      await cp(path.resolve(folder), path.join(temp, folder), { recursive: true });
    }
    for (const file of ['run.sh', 'run.mjs', 'assert.mjs', 'metrics.csv']) await cp(path.resolve('evals', file), path.join(temp, 'evals', file));
    const bin = path.join(temp, 'bin'); await mkdir(bin); await cp(process.execPath, path.join(bin, 'node'));
    const args = [`PATH=${bin}:/usr/bin:/bin`, path.join(alias, 'evals/run.sh')];
    const help = await execute('/usr/bin/env', [...args, '--help']);
    assert.equal(help.exit_code, 0); assert.match(help.stdout, /用法/);
    const missing = await execute('/usr/bin/env', [...args, '--fixture', 'f1']);
    assert.equal(missing.exit_code, 1); assert.match(missing.stdout, /config_spawn_failed/);
    const results = path.join(temp, 'evals/results');
    async function collect() {
      const { readdir } = await import('node:fs/promises');
      const records = [];
      for (const name of await readdir(results)) {
        const record = JSON.parse(await readFile(path.join(results, name, 'result.json'), 'utf8'));
        workspaces.push(path.dirname(record.workspace.path)); records.push(record);
      }
      return records;
    }
    await collect(); await rm(results, { recursive: true });
    await cp(path.resolve('evals/metrics.csv'), path.join(temp, 'evals/metrics.csv'));
    // 仅测试 config/read 协议和明确失败事件，绝不调用模型。
    await writeFile(path.join(bin, 'codex'), `#!/usr/bin/env node
const readline=require('node:readline');
if(process.argv.includes('app-server')){
 readline.createInterface({input:process.stdin}).on('line',line=>{
  const m=JSON.parse(line);
  if(m.id===1)console.log(JSON.stringify({id:1,result:{}}));
  if(m.id===2)console.log(JSON.stringify({id:2,result:{config:{model:'gpt-6.1-sol',model_reasoning_effort:'low',model_provider:'test-only-mock',approval_policy:'never',sandbox_mode:'workspace-write',notify:[],features:{plugins:false,hooks:false},mcp_servers:{}}}}));
 });
}else{console.log(JSON.stringify({type:'turn.failed',error:{message:'test-only-mock'}}));process.exitCode=1;}
`); await chmod(path.join(bin, 'codex'), 0o755);
    const failed = await execute('/usr/bin/env', [...args, '--fixture', 'f1', '--repeat', '2']);
    assert.equal(failed.exit_code, 1);
    const records = await collect(); assert.equal(records.length, 2);
    assert.equal(new Set(records.map((r) => r.run_id)).size, 2);
    assert.deepEqual(records.map((r) => r.repeat).sort(), [1, 2]);
    for (const r of records) {
      assert.equal(r.pass, false); assert.equal(r.execution_completed, false);
      assert.ok(r.failures.includes('first:model_event_failure')); assert.equal(r.usage.tokens, null);
    }
    const csv = await readFile(path.join(temp, 'evals/metrics.csv'), 'utf8');
    const lines = csv.trimEnd().split('\n'); assert.equal(lines.length, 3);
    for (const line of lines.slice(1)) assert.equal(line.split(',')[8], '', '失败 CSV 不伪造 tokens');
    console.log(JSON.stringify({ alias_help: help.exit_code, no_model: missing.exit_code, mock_repeat2: failed.exit_code, unique_results: records.length, csv_rows: 2 }));
  } finally {
    for (const folder of workspaces) await rm(folder, { recursive: true, force: true });
    await rm(temp, { recursive: true, force: true });
  }
});
