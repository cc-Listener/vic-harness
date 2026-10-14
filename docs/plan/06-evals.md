# 06 · 评测

评测分三层，越往下越贵、越不确定：

| 层 | 内容 | 是否调用 LLM | 何时运行 |
|---|---|---|---|
| L1 单元测试 | vic-check 每条规则 | 否 | 每次提交 |
| L2 产物断言 | 在 fixture 上跑 skill，再用脚本断言产物 | 是（跑 skill） | 每个 ticket 完成时、发版前 |
| L3 问答评测 | 新 agent 只读合同回答问题，按答案关键词评分 | 是 | 发版前、换模型后 |

## 1. Fixtures（`evals/fixtures/`）

都是**小型合成仓库**，不要求能真正运行，但配置文件要齐全、真实。每个 fixture 一个目录，内含 `repo/`（仓库内容）、`expected.yaml`（断言）和可选的 `questions.yaml`（问答评测）、`task.md`（给 vic-agents 的任务描述）。

| ID | 内容 | 主要考察 |
|---|---|---|
| f1-single-app | Vite + React 单应用；`src/ui/` 封装了 antd 的 Button 和 Modal；eslint、vitest、`.env.production`、请求拦截器 | 基本 bootstrap、组件合同、guarded path、幂等 |
| f2-monorepo | pnpm workspace：`apps/web`（main → bootstrap → router 入口链、独立 vite 配置和 .env）、`apps/admin`、`packages/ui` | app-deep 触发、根层与 app 层不重复 |
| f3-legacy-layers | 300 行的臃肿 AGENTS.md；`.codex/agents/README.md` 重复了导航；Matt 的 `## Agent skills` 段；`docs/agents/`、`GLOSSARY.md`、`CODING_STANDARDS.md`；一个 `.ua/knowledge-graph.json` 样本 | 分层纠偏、外部内容保留、UA 证据标记 |
| f4-empty | 只有 README 和一个 `main.py` | 大量 uncertainty，不编造事实 |
| f5-agents-small | f1 + `task.md`：给设置页加时区选择 | vic-agents 零文件改动 |
| f6-agents-review | f1 + `task.md`：认证跨模块回归，用户要求独立评审，最多一条子线程；另有 `task-ultra.md` 变体：Ultra 父会话下需要可复用的只读扫描 | 只新增 reviewer.toml 和 `[agents]` 并发设置，保留已有内容；变体中优先推荐内置 explorer |
| f7-agents-legacy | 已有 `.codex/config.toml`（含 `max_threads`、注释、MCP 配置）、`[agents.reviewer] config_file` 注册，以及 v1 的 `topology.yaml` | 不重复定义、迁移提示、无关配置保留 |
| incidents/ | 3 条样例 incident：分别应归因为 guide、sensor、agent-role | vic-learn 归因 |
| router-cases.yaml | 10 个场景描述及期望推荐 | vic-router |

## 2. expected.yaml 断言类型

```yaml
files_exist: [AGENTS.md, contracts/project-context.yaml, docs/component-contract.md]
files_unchanged: [GLOSSARY.md, CODING_STANDARDS.md]      # 与运行前逐字节相同
sections_unchanged:
  - { file: AGENTS.md, heading: "## Agent skills" }
files_absent: [.codex/agents/topology.yaml]               # 不应生成的文件
max_lines: { AGENTS.md: 120 }
vic_check: { error: 0 }                                   # 跑 vic-check 的期望
yaml_paths:                                               # 合同里必须出现的事实
  - path: component_contract.preferred_abstractions[*].import
    contains: "@/ui"
  - path: project_map.guarded_paths[*].path
    contains: src/request/interceptors.ts
forbidden_text:                                           # 不应编造的内容
  - { glob: "docs/**/*.md", pattern: "Next.js" }
idempotent: true                                          # 第二次运行为 no-op
git_diff_only: [contracts/refresh-log.yaml]               # 第二次运行后只允许这个文件有变化
```

## 3. 问答评测（L3）

每个 fixture 的 `questions.yaml`：

```yaml
- q: 在 apps/web 里新增一个提交按钮，应该从哪里 import？
  must_contain: ["@acme/ui"]
- q: 提交代码前需要运行哪些检查命令？
  must_contain: ["pnpm lint", "pnpm typecheck"]
- q: 修改请求拦截器前需要注意什么？
  must_contain: ["interceptors"]
```

**流程**：在 fixture 上跑完 bootstrap 后，开一个新的 agent 会话，只允许它读 AGENTS.md 和它链接的文件，回答全部问题。用 `must_contain` 做确定性评分。

## 4. 运行器（`evals/run.sh`）

```
evals/run.sh [--fixture f1] [--skill vic-bootstrap] [--repeat 3] [--layer 2|3]
```

1. 把 fixture 的 `repo/` 复制到临时目录，`git init` 并提交一次作为基线。
2. 用 `codex exec` 以非交互方式调用 skill（确切写法见 open-questions Q4）。
3. 运行 `vic-check --all --json`。
4. 用 `evals/assert.mjs` 检查 `expected.yaml`。
5. 若 `idempotent: true`，再运行一次 skill，检查 `git_diff_only`。
6. L3 时执行问答评测。
7. 结果写入 `evals/results/<日期>-<版本>-<fixture>.json`，并追加一行到 `evals/metrics.csv`：`date,plugin_version,model,fixture,skill,pass,check_errors,qa_score,tokens,seconds`。

LLM 的结果不稳定，**发版要求每个 fixture 重复 3 次，至少 2 次通过**。

## 5. 里程碑的评测门槛

| 里程碑 | 要求 |
|---|---|
| v0.1 | L1 全部通过；L2：f1、f2、f3、f4 全部通过 |
| v0.2 | 加上 f5–f7、incidents；L3 平均答对率 ≥ 80% |
| v0.3 | 加上 router-cases；建立换模型后的消融流程 |
