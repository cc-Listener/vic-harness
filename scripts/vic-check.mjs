#!/usr/bin/env node
import { resolve } from 'node:path';
import { checkRepository } from './lib/checker.mjs';

function parseArguments(args) {
  const options = { root: process.cwd(), mode: 'all', json: false, quiet: false, strict: false };
  let selected = false;
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (['--all', '--contract', '--agents'].includes(flag)) {
      if (selected) throw new Error('只能选择一个检查范围');
      selected = true;
      options.mode = flag.slice(2);
    } else if (flag === '--drift') {
      throw new Error(`${flag} 尚未实现，由 T10 补齐`);
    } else if (['--json', '--quiet', '--strict'].includes(flag)) {
      options[flag.slice(2)] = true;
    } else if (flag === '--root') {
      const value = args[++index];
      if (!value || value.startsWith('--')) throw new Error('--root 需要目录参数');
      options.root = resolve(value);
    } else {
      throw new Error(`未知参数：${flag}`);
    }
  }
  return options;
}

function render(result, options) {
  const summary = { error: 0, warn: 0 };
  for (const finding of result.findings) summary[finding.severity]++;
  const report = { version: '0.1.0', root: '.', summary, findings: result.findings };
  if (options.json) {
    process.stdout.write(`${JSON.stringify(report)}\n`);
  } else if (options.quiet) {
    if (summary.error || summary.warn) process.stdout.write(`vic-harness：${summary.error} error，${summary.warn} warn\n`);
  } else if (!result.initialized && !summary.error) {
    process.stdout.write('vic-harness：未初始化\n');
  } else {
    for (const finding of result.findings) {
      process.stdout.write(`${finding.severity} ${finding.id} ${finding.file}：${finding.message}\n`);
    }
    process.stdout.write(`vic-harness：${summary.error} error，${summary.warn} warn\n`);
  }
  return summary.error ? 1 : 0;
}

const args = process.argv.slice(2);
let options = { json: args.includes('--json'), quiet: args.includes('--quiet') };
try {
  options = parseArguments(args);
  process.exitCode = render(await checkRepository(options.root, options), options);
} catch (error) {
  render({ initialized: true, findings: [{ id: 'CHECKER', severity: 'error', file: '.',
    message: `检查器无法完成：${error.message}`, hint: '检查参数、目录权限和插件安装完整性' }] }, options);
  process.exitCode = 2;
}
