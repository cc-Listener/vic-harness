#!/usr/bin/env node
// 只注入一行指针；规则本身在 vic skill 里，随插件更新（ADR 0004）。
import { existsSync } from 'node:fs';

const graph = ['.ua', '.understand-anything'].some(dir => existsSync(`${dir}/knowledge-graph.json`));
const state = graph ? '本仓库已有 UA 知识图谱。' : '本仓库还没有 UA 知识图谱，需要时建议运行 /understand-anything:understand。';
const additionalContext = `本机装有 vic-harness（mattpocock-skills + understand-anything）。开始代码调查、实现、调试、评审或规划前，先读取 vic:vic skill 的接线规则。${state}`;
process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext } }));
