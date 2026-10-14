#!/usr/bin/env node
import { readFile, writeFile, mkdir, mkdtemp, readdir, realpath, rm, appendFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { load, JSON_SCHEMA } from '../scripts/vendor/js-yaml.mjs';
import { execute } from './lib/process.mjs';
import { prepareConfig } from './lib/config.mjs';
import { parseEvents, totalUsage, CSV_HEADER, csvRow } from './lib/events.mjs';
import { tree, restore, hashes, sha256, jsonFile, quote } from './lib/files.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HELP = '用法：evals/run.sh --fixture f1 --skill vic-bootstrap [--repeat 3] [--layer 2] [--model gpt-6.1-sol] [--effort low] [--timeout 1200] [--rtk]\nL3 尚未实现，明确拒绝；timeout 单位为秒。正常加载用户 provider，source-path 显式读取技能。默认使用标准工具并遵守适用 guidance；--rtk 是用户要求的可选模型命令指导。';

export function options(argv) {
  const result = { fixture: 'f1', skill: 'vic-bootstrap', repeat: 1, layer: 2, model: 'gpt-6.1-sol', effort: 'low', timeout: 1200, rtk: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--help') return { help: true };
    if (argv[i] === '--rtk') { result.rtk = true; continue; }
    const key = argv[i].slice(2);
    if (!argv[i].startsWith('--') || !Object.hasOwn(result, key) || argv[i + 1] == null || argv[i + 1].startsWith('--')) throw new Error('参数无效');
    result[key] = ['repeat', 'layer', 'timeout'].includes(key) ? Number(argv[++i]) : argv[++i];
  }
  for (const key of ['fixture', 'skill', 'model', 'effort']) if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(result[key])) throw new Error('名称无效');
  if (!Number.isSafeInteger(result.repeat) || result.repeat < 1 || result.repeat > 100 || !Number.isSafeInteger(result.timeout) || result.timeout < 1 || result.timeout > 86400) throw new Error('次数或超时无效');
  if (result.layer !== 2) throw new Error('仅支持 L2；L3 未实现');
  return result;
}

export function phasePrompt({ skill, skillPath, phase, rtk }) {
  const readCommand = `${rtk ? 'rtk proxy ' : ''}cat ${quote(skillPath)}`;
  const guidance = rtk ? '用户要求实际 shell 命令以 rtk 前缀执行。' : '实际 shell 命令遵守目标仓库和用户适用 guidance 的命令代理要求；没有代理要求时使用标准工具。';
  const prompt = `用户现在明确调用 $${skill}，在当前目标仓库执行该技能的完整工作流。${phase === 'second' ? '这是同一仓库第二次调用，请按技能真实判定模式。' : ''}\n第一个工具调用必须执行 ${readCommand}，完整读取实际 SKILL.md，再按其实际路径读取 references 及共享资源；只遵循本次指定 vic 技能。所有对话和人读输出用简体中文；${guidance}技能及插件源只读，产物只写当前目标仓库。不启动其他代理。不读取认证或宿主配置。不要安装依赖或探测联网包管理器。\n`;
  return { prompt, readCommand };
}

async function freeze(fixture, skill) {
  const entries = {};
  for (const folder of [`skills/${skill}`, 'schemas', 'scripts', `evals/fixtures/${fixture}`]) {
    entries[folder] = { kind: 'directory', mode: 0o755 };
    for (const [name, entry] of Object.entries(await tree(path.join(ROOT, folder)))) entries[`${folder}/${name}`] = entry;
  }
  for (const file of ['evals/assert.mjs', 'evals/run.mjs', 'evals/run.sh', '.codex-plugin/plugin.json']) {
    const bytes = await readFile(path.join(ROOT, file));
    entries[file] = { kind: 'file', mode: 0o644, sha256: sha256(bytes), base64: bytes.toString('base64') };
  }
  for (const [name, entry] of Object.entries(await tree(path.join(ROOT, 'evals/lib')))) entries[`evals/lib/${name}`] = entry;
  return entries;
}

async function checked(command, args, cwd) {
  const result = await execute(command, args, { cwd });
  if (result.exit_code !== 0 || result.spawn_error || result.timed_out || result.interrupted) throw new Error('baseline_command_failed');
}

async function runOne(opts, fixture, sequence, frozen) {
  const started = Date.now(), date = new Date().toISOString();
  const version = JSON.parse(Buffer.from(frozen['.codex-plugin/plugin.json'].base64, 'base64')).version;
  const run_id = `${date.replaceAll(':', '-').replaceAll('.', '-')}-${version}-${fixture}-${opts.skill}-r${sequence}-${randomUUID()}`;
  const artifacts = path.join(ROOT, 'evals/results', run_id);
  await mkdir(artifacts); // 原子独占创建，永不覆盖已有运行。
  const result = { run_id, date, plugin_version: version, fixture, skill: opts.skill, repeat: sequence, layer: 2, loading_mode: 'source-path', loading_note: '显式读取并遵循当前技能源；未验证原生插件 loader。正常用户配置仍可能带入用户指令。', command_guidance: opts.rtk ? 'user-requested-rtk' : 'applicable-guidance-or-standard-tools', requested_model: opts.model, requested_effort: opts.effort, actual_model: null, actual_effort: null, config: null, binding: hashes(frozen), phases: [], failures: [], pass: false, check_errors: null, usage: null, artifacts: path.relative(ROOT, artifacts), command_side_effect_audit: '未自动审计；完整命令事件保留，不能据最终树断言无中途副作用。' };
  const temp = await mkdtemp(path.join(os.tmpdir(), 'vic-eval-'));
  const repo = path.join(temp, 'repo'), source = path.join(temp, 'frozen');
  result.workspace = { path: repo, retained: true, cleanup: '本次现场在插件工作区之外；成功时清理，失败保留供复查。' };
  let interruption = false, expectedCount = null;
  const onInterrupt = () => { interruption = true; };
  process.on('SIGINT', onInterrupt); process.on('SIGTERM', onInterrupt);
  try {
    await jsonFile(path.join(artifacts, 'binding-source.tree.json'), frozen);
    await restore(frozen, source);
    const inputTree = await tree(path.join(source, 'evals/fixtures', fixture, 'repo'));
    await restore(inputTree, repo);
    await jsonFile(path.join(artifacts, 'input.tree.json'), inputTree);
    const expected = path.join(source, 'evals/fixtures', fixture, 'expected.yaml');
    const expectedText = await readFile(expected, 'utf8');
    await writeFile(path.join(artifacts, 'expected.yaml'), expectedText, { flag: 'wx' });
    const expectation = load(expectedText, { schema: JSON_SCHEMA });
    expectedCount = expectation.idempotent ? 2 : 1;
    const git = ['-c', 'core.hooksPath=/dev/null', '-c', 'core.fsmonitor=false', '-c', 'commit.gpgsign=false', '-c', 'user.name=Vic eval', '-c', 'user.email=vic-eval@example.invalid'];
    await checked('git', [...git, 'init', '-q'], repo);
    await checked('git', [...git, 'add', '-A'], repo);
    await checked('git', [...git, 'commit', '-qm', 'fixture baseline'], repo);
    const assertion = path.join(source, 'evals/assert.mjs');
    const before = path.join(artifacts, 'before.snapshot.json'), first = path.join(artifacts, 'first.snapshot.json');
    const assertBase = [assertion, 'check', '--root', repo, '--expected', expected, '--before', before];
    async function snapshot(out) {
      await checked(process.execPath, [assertion, 'snapshot', '--root', repo, '--expected', expected, '--out', out], repo);
    }
    await snapshot(before);
    const config = await prepareConfig(repo, opts.model, opts.effort);
    if (interruption) throw new Error('runner_interrupted');
    if (!isDeepStrictEqual(hashes(await freeze(fixture, opts.skill)), result.binding)) throw new Error('source_changed_before_run');
    result.config = config.projection;
    // 系列条件包含真实 provider 与全部冻结来源，不能混入旧系列。
    result.series_id = sha256(JSON.stringify({ binding: result.binding, config: result.config, loading_mode: result.loading_mode, command_guidance: result.command_guidance }));
    const skillPath = await realpath(path.join(ROOT, 'skills', opts.skill, 'SKILL.md'));
    const skillText = Buffer.from(frozen[`skills/${opts.skill}/SKILL.md`].base64, 'base64').toString('utf8');
    for (const phase of expectation.idempotent ? ['first', 'second'] : ['first']) {
      if (phase === 'second') await snapshot(first);
      if (interruption) throw new Error('runner_interrupted');
      const { prompt, readCommand } = phasePrompt({ skill: opts.skill, skillPath, phase, rtk: opts.rtk });
      await writeFile(path.join(artifacts, `${phase}.prompt.txt`), prompt, { flag: 'wx' });
      const args = ['--disable', 'plugins', '--disable', 'hooks', '-a', 'never', ...config.overrides, 'exec', '--json', '--ephemeral', '--model', opts.model, '-s', 'workspace-write', '-C', repo, '-o', path.join(artifacts, `${phase}.last-message.txt`), '-'];
      // args 含仅内存 MCP 标识，不保存完整命令参数。
      const execution = await execute('codex', args, { cwd: repo, input: prompt, timeout: opts.timeout * 1000, stdoutFile: path.join(artifacts, `${phase}.events.jsonl`), stderrFile: path.join(artifacts, `${phase}.stderr.txt`) });
      const events = parseEvents(await readFile(path.join(artifacts, `${phase}.events.jsonl`), 'utf8'), skillText, readCommand);
      const record = { phase, ...execution, ...events }; delete record.stdout; delete record.stderr;
      result.phases.push(record);
      if (execution.exit_code !== 0 || execution.spawn_error || execution.timed_out || execution.interrupted) result.failures.push(`${phase}:execution_failed`);
      result.failures.push(...events.errors.map((error) => `${phase}:${error}`));
      if (execution.interrupted) interruption = true;
      await jsonFile(path.join(artifacts, `${phase}.tree.json`), await tree(repo, { allowLinks: true }));
      if (!isDeepStrictEqual(hashes(await freeze(fixture, opts.skill)), result.binding)) result.failures.push('source_changed_during_run');
      const check = await execute(process.execPath, [path.join(source, 'scripts/vic-check.mjs'), '--all', '--json', '--root', repo], { cwd: repo });
      await jsonFile(path.join(artifacts, `${phase}.check.json`), check);
      let checkValue; try { checkValue = JSON.parse(check.stdout); } catch {}
      record.check_errors = checkValue?.summary?.error ?? null;
      result.check_errors = record.check_errors;
      if (check.exit_code !== 0 || record.check_errors !== 0) result.failures.push(`${phase}:checker_failed`);
      const assertionArgs = [...assertBase, '--phase', phase === 'first' && expectation.idempotent ? 'first' : 'final', '--json'];
      if (phase === 'second') assertionArgs.push('--first', first);
      const asserted = await execute(process.execPath, assertionArgs, { cwd: repo });
      await jsonFile(path.join(artifacts, `${phase}.assertion.json`), asserted);
      let value; try { value = JSON.parse(asserted.stdout); } catch {}
      record.assertion = value ?? null;
      if (asserted.exit_code !== 0 || value?.pass !== true || (phase === 'second' && value?.summary?.pending !== 0)) result.failures.push(`${phase}:assertion_failed`);
      if (events.errors.length || execution.exit_code !== 0 || interruption || result.failures.includes('source_changed_during_run')) break;
    }
    result.execution_completed = result.phases.length === (expectation.idempotent ? 2 : 1) && result.phases.every((p) => p.exit_code === 0 && !p.errors.length && !p.timed_out && !p.interrupted);
    result.l2_pass = result.phases.every((p) => p.assertion?.pass === true && p.check_errors === 0) && result.phases.at(-1)?.assertion?.summary?.pending === 0 && result.execution_completed;
    result.pass = result.execution_completed && result.l2_pass && !result.failures.length;
  } catch (error) {
    // 配置响应错误及内部路径不写入 failure message，防止敏感字段泄漏。
    const known = /^(config_|unsupported_|baseline_|runner_interrupted$|source_changed_before_run$)/.test(error.message) ? error.message : 'runner_internal_failure';
    result.failures.push(known); result.execution_completed = false; result.l2_pass = false;
  } finally {
    result.usage = totalUsage(result.phases, expectedCount);
    result.known_usage = totalUsage(result.phases.filter((p) => p.usage?.tokens != null));
    result.expected_phases = expectedCount;
    result.interrupted = interruption;
    result.service_accepted = result.phases.some((p) => p.service_accepted);
    result.check_errors = result.phases.length && result.phases.every((p) => Number.isInteger(p.check_errors)) ? Math.max(...result.phases.map((p) => p.check_errors)) : null;
    result.seconds = (Date.now() - started) / 1000;
    if (result.pass) {
      try { await rm(temp, { recursive: true, force: true }); result.workspace.retained = false; }
      catch { result.failures.push('cleanup_failed'); result.pass = false; }
    }
    process.off('SIGINT', onInterrupt); process.off('SIGTERM', onInterrupt);
    await jsonFile(path.join(artifacts, 'result.json'), result);
    const csv = path.join(ROOT, 'evals/metrics.csv');
    const current = await readFile(csv, 'utf8');
    if (current.split(/\r?\n/)[0] !== CSV_HEADER || !current.endsWith('\n')) throw new Error('metrics 表头或尾行无效，结果 JSON 已保留');
    await appendFile(csv, csvRow([date, version, `requested:${opts.model}`, fixture, opts.skill, result.pass, result.check_errors, null, result.usage.tokens, result.seconds]));
  }
  console.log(JSON.stringify({ run_id, result: path.relative(ROOT, path.join(artifacts, 'result.json')), execution_completed: result.execution_completed, l2_pass: result.l2_pass, pass: result.pass, failures: result.failures, tokens: result.usage.tokens }));
  return { pass: result.pass, interruption };
}

export async function main(argv) {
  const opts = options(argv); if (opts.help) { console.log(HELP); return 0; }
  const metrics = await readFile(path.join(ROOT, 'evals/metrics.csv'), 'utf8');
  if (metrics.split(/\r?\n/)[0] !== CSV_HEADER || !metrics.endsWith('\n')) throw new Error('metrics 表头或尾行无效');
  const candidates = (await readdir(path.join(ROOT, 'evals/fixtures'))).filter((name) => name === opts.fixture || name.startsWith(opts.fixture + '-'));
  if (candidates.length !== 1) throw new Error('fixture 不存在或前缀不唯一');
  const skillRoot = await realpath(path.join(ROOT, 'skills', opts.skill));
  if (skillRoot !== path.join(ROOT, 'skills', opts.skill)) throw new Error('skill 必须为发布目录且不得为软链');
  const frozen = await freeze(candidates[0], opts.skill);
  await mkdir(path.join(ROOT, 'evals/results'), { recursive: true });
  let passed = true;
  for (let i = 1; i <= opts.repeat; i++) {
    const result = await runOne(opts, candidates[0], i, frozen); passed &&= result.pass;
    if (result.interruption) break;
  }
  return passed ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; }).catch((error) => { console.error(error.message); process.exitCode = 2; });
}
