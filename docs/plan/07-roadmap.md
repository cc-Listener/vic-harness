# 07 · 路线图与任务单

**规则**：
- 每个 ticket 的规模控制在一次 agent 会话内能完成。一个会话只做一个 ticket。
- 只有"依赖"都完成后才能开始。
- 完成的定义 = 验收标准全部满足 + 更新 `progress.md` + 单独提交一次 commit。
- 发现规划本身有问题时，不要擅自改规划，写进 `progress.md` 的"规划问题"一节，由人决定。

---

## M0 准备（人来做，约半天）

### T00 建仓库并核验未决问题
- **产出**：GitHub 仓库 `vic-harness`；本规划包的初始提交；open-questions 中 Q1–Q4、Q9 的核验结论写回该文件。
- **做法**：见 HANDOFF.md 第 1、2 步，可以让 Codex 用 `$plugin-creator` 生成一个骨架来对照格式。
- **验收**：Q1–Q4、Q9 都有"已核验 / 默认方案"结论。

---

## M1 · v0.1.0 骨架、检查器与两个核心 skill

### T01 插件骨架
- **依赖**：T00
- **产出**：`.codex-plugin/plugin.json`、本地 `.agents/plugins/marketplace.json`、6 个 skill 的占位 SKILL.md（只有 frontmatter 和一句话）、`lab/`、`.gitignore`、`README.md`、`CHANGELOG.md`。
- **验收**：本地添加 marketplace 后，Codex 能看到 vic-harness 和 6 个 skill 名。

### T02 合同 schema v2
- **依赖**：T01
- **产出**：`schemas/project-context.schema.yaml`、`schemas/project-context.example.yaml`、`schemas/refresh-log.schema.yaml`、`schemas/MIGRATIONS.md`。内容按 02-contract-schema.md。
- **验收**：v1 的示例（`reference/v1/project-bootstrap-contract/references/project-context-schema.yaml` 中的字段）全部能在 v2 中找到同名字段；example 文件覆盖 schema 中的所有字段。

### T03 vic-check：解析与合同规则
- **依赖**：T02
- **产出**：`scripts/vic-check.mjs`、`scripts/lib/*`、`scripts/vendor/js-yaml.mjs`；规则 C01–C04、C06、C09（C05 属于 T14，其余属于 T10）；`--json`、`--quiet`、`--strict`；`tests/` 单元测试。
- **验收**：`node --test` 全部通过；每条规则至少一个通过用例和一个失败用例；在 example 合同上 0 error；普通仓库上运行 < 3 秒。

### T04 评测 fixtures f1–f4 与断言器
- **依赖**：T02
- **产出**：`evals/fixtures/f1..f4/`（repo、expected.yaml、questions.yaml）、`evals/assert.mjs`。
- **验收**：对一个"手写的理想产物"跑 `assert.mjs` 能通过；对故意改坏的产物能报出具体失败项。
- **注意**：v0.1 的 expected.yaml 只断言 v0.1 已有的能力（产物存在、外部文件和段落保留、AGENTS.md 行数、核心事实、不编造、幂等）。来源字段、`watch_paths`、refresh-log、`integrations` 的断言分别在 T10、T11、T14 中补充。

### T05 vic-bootstrap v2
- **依赖**：T03、T04
- **产出**：`skills/vic-bootstrap/`（SKILL.md ≤150 行 + references + agents/openai.yaml），按 08-v1-migration.md 第 1 节完成全部改动。
- **范围**：实现 03-skills.md §1 中未标注"v0.2 起"的步骤。
- **验收**：在 f1–f4 上手动运行后满足各自 expected.yaml；f1 连续两次运行，第二次为 no-op 且没有任何文件变化（v0.1 还没有 refresh-log）；`vic-check` 0 error。

### T06 vic-agents v2
- **依赖**：T03
- **产出**：`skills/vic-agents/`，按 08-v1-migration.md 第 2 节迁移（其中标注"v0.2 起"的 refresh-log 部分留给 T11）。
- **验收**：SKILL.md ≤150 行；与 v1 相比核心规则无遗漏（对照迁移清单逐项打勾）；不再引用其他 skill 的路径。

### T07 vic-check：代理配置规则
- **依赖**：T03
- **产出**：`scripts/vendor/smol-toml.mjs`、规则 A01–A07、`scripts/lib/agents-fields.json`（带核验日期和来源）。
- **验收**：单元测试覆盖 A01–A07；`--agents` 参数可用。

### T08 vic-router 与 vic-check skill 文本
- **依赖**：T05、T06
- **产出**：`skills/vic-router/SKILL.md`、`skills/vic-check/SKILL.md`。
- **验收**：router 的决策表覆盖 03-skills.md §6 的全部场景，并标明外部 skill 未安装时的替代做法。

### T09 评测运行器
- **依赖**：T04、T05
- **产出**：`evals/run.sh`、`evals/metrics.csv` 表头、结果目录。
- **验收**：`evals/run.sh --fixture f1 --skill vic-bootstrap` 能端到端跑完并写入结果。

### 🚩 发布 v0.1.0
- 评测门槛：见 06-evals.md §5。
- 人工验收：在你自己的 1 个真实仓库上运行 bootstrap 和 agents，记录体验问题到 incidents。
- 打 tag `v0.1.0`。

---

## M2 · v0.2.0 进化回路

### T10 来源字段与过期检测
- **依赖**：v0.1.0
- **产出**：vic-check 规则 C07、C08、C10、C11、C12；vic-bootstrap 生成 `watch_paths`、`refreshed_at_commit` 和完整的来源字段。
- **验收**：在 f2 上改动 `apps/web/package.json` 后，`--drift` 能报出；f1–f4 重新通过。

### T11 refresh-log
- **依赖**：T10
- **产出**：vic-bootstrap 和 vic-agents 都追加 refresh-log；vic-agents 只记录 02-contract-schema §4 允许的字段。
- **验收**：每次运行（包括 no-op）都有一条日志；C11 通过。

### T12 vic-agents 的 fixtures 与评测
- **依赖**：T07、T11
- **产出**：f5、f6（含 `task-ultra.md` 变体）、f7 及断言。
- **验收**：f5 零改动；f6 只新增预期文件；f7 无重复定义，无关配置逐字节保留。

### T13 vic-learn
- **依赖**：T11
- **产出**：`skills/vic-learn/`、`templates/incident.md`、`templates/harness-changelog.md`、`evals/fixtures/incidents/`。
- **验收**：3 条样例 incident 的归因与预期一致；agent-role 类会转交给 `$vic-agents` 而不是直接改 TOML。

### T14 外部集成与所有权
- **依赖**：T10
- **产出**：vic-bootstrap 检测 Matt 和 UA 并写入 `integrations` 和 `foreign_sections`；C05；f3 的保留断言全部通过。
- **验收**：f3 中外部文件和段落逐字节不变；UA 来源的事实全部标为 `ua-graph`，未核实的保持 `inferred`。

### T15 SessionStart hook
- **依赖**：T10，以及 open-questions Q1 的结论
- **产出**：`hooks/hooks.json`。
- **验收**：未初始化仓库无输出；合同未过期无输出；过期时输出一行；故意让 Node 不可用时也不阻断会话。

### T16 问答评测
- **依赖**：T09、T14
- **产出**：L3 评测流程接入 run.sh。
- **验收**：f1–f3 平均答对率 ≥ 80%。

### 🚩 发布 v0.2.0
- 在 2–4 个真实仓库上使用 2–4 周，坚持记录 incidents。

---

## M3 · v0.3.0 剪枝、晋升与分发

### T17 vic-prune
- **依赖**：v0.2.0
- **产出**：`skills/vic-prune/`；一个包含预设冗余项的 fixture（f8-bloated）。
- **验收**：列出全部预设冗余项，不误报 guarded path。

### T18 晋升机制
- **依赖**：T13
- **产出**：`scripts/collect-candidates.mjs`、`PROMOTION.md`、`docs/harness/promotion-candidates.md` 的生成。
- **验收**：对两个含样例 incidents 的仓库运行，能按归因分组输出候选。

### T19 marketplace 集成外部插件
- **依赖**：open-questions Q5、Q6 的结论
- **产出**：`.agents/plugins/marketplace.json` 同时列出 vic-harness 和 Matt 的插件（UA 视核验结果而定）。
- **验收**：在一台干净的机器上添加该 marketplace 后能安装两者。

### T20 Claude Code 兼容（可选）
- **依赖**：v0.2.0
- **产出**：`.claude-plugin/plugin.json`；vic-bootstrap 的可选 CLAUDE.md 桥接（内容只有 `@AGENTS.md`）。
- **验收**：Claude Code 能加载 skills；C12 通过。

### T21 插件自身的保鲜 CI
- **依赖**：T07
- **产出**：GitHub Actions：`node --test`、`vic-check --strict` 跑插件自身、校验 `plugin.json` 版本与 CHANGELOG 一致、`model-policy.md` 和 `agents-fields.json` 核验日期超过 45 天时报 warn。
- **验收**：CI 在 PR 上运行并能拦下版本号未更新的发布。

### 🚩 发布 v0.3.0
