# 03 · Skill 规格

每个 skill 的规格包括：职责、调用方式、description 草案、输入、步骤、输出、禁止事项和验收标准。SKILL.md 的正文上限 150 行，超出部分放进该 skill 的 `references/`。

Codex 启动时只读 name 和 description，所以 **description 决定能否被正确触发**，要同时写中英文触发词。

**版本边界**：标注"（v0.2 起）"的步骤依赖 M2 才有的能力（过期检测、refresh-log、外部集成检测），在 v0.1 的实现中跳过，由对应 ticket 补上。

---

## 1. vic-bootstrap（由 project-bootstrap-contract 升级）

**职责**：初始化或增量刷新仓库的项目事实合同。

**调用**：只能由用户调用。

**description 草案**：
> 为仓库初始化或增量刷新项目合同：导航优先的 AGENTS.md、项目地图、约定、组件合同和 machine-readable 的 project-context。用于新仓库初始化、合同过期、AGENTS.md 膨胀或分层混乱时。Bootstrap or refresh the repo contract (AGENTS.md map, project-context.yaml).

**输入**：目标仓库；可选的 `.ua/knowledge-graph.json`；已有的合同和 refresh-log。

**步骤**（保留 v1 工作流，以下是 v2 的改动）：
1. 盘点现有资产。按 `references/ownership.md` 识别外部文件和外部段落，标记为只读。
2. 把本次运行归类为 `bootstrap` / `refresh` / `no-op`（判定规则沿用 v1）。（v0.2 起）先用 `vic-check --drift --json` 的结果作为确定性触发证据，没有命中且合同完整时直接判为 no-op。
3. 建立事实清单。每条关键事实都要有 `evidence` 和 `confidence`；（v0.2 起）补齐 `origin`、`status` 等全部来源字段。（v0.2 起）UA 图谱给出的事实标成 `origin: ua-graph`，回源码核实后才能升级为 `verified`。
4. **验证 gate**：对 lint、typecheck、format-check 类命令实际运行，超时 120 秒，记录 `verified` 和 `exit_code`。测试命令默认不运行，只在用户要求时运行。**禁止运行** deploy、publish、release、数据库迁移以及任何会写外部系统的命令。
5. 写入或刷新导航层（AGENTS.md ≤ 120 行）和 docs。外部段落原样保留。
6. 写入合同；（v0.2 起）生成 `watch_paths` 和 `refreshed_at_commit`。
7. 如果命中 app-deep 信号，按 `references/app-deep.md` 执行。
8. （v0.2 起）追加一条 refresh-log。
9. 运行 `vic-check --all`，有 error 就修到没有为止；修不了的写进 `uncertainty`，并在回复里说明。

**输出**：被改动的文件；回复里给出 refresh 证据摘要（与 refresh-log 条目字段一致）。

**禁止**：
- 读写 `.codex/config.toml`、`.codex/agents/*`、`.codex/AGENTS.md`（这些归 vic-agents）
- 改写外部所有者的文件或段落
- 把 `docs/agents/` 当成 legacy agent index 去纠偏
- 没有证据就写组件合同或约定
- 写绝对路径

**验收**：
- fixtures f1–f4 上 `vic-check` 为 0 error，且满足各自 `expected.yaml`
- 对 f1 连续运行两次，第二次为 no-op，`git diff` 只有 refresh-log 有变化
- f3 中外部段落和外部文件逐字节不变

---

## 2. vic-agents（由 multi-agent-config 升级）

**职责**：评估目标工作流是否需要子代理，增量维护 `.codex/config.toml` 的 `[agents]` 和 `.codex/agents/*.toml`；按官方文档核验模型和字段。只写配置，不执行任务、不启动代理。

**调用**：只能由用户调用。

**description 草案**：
> 评估项目是否需要 Codex 子代理，按当前官方文档增量维护 .codex/config.toml 和 .codex/agents/*.toml，核验模型与推理档位；单代理足够时保持零文件改动。Configure Codex subagents / multi-agent setup, update agent models.

**保留 v1 的全部核心规则**：
- 先判断单代理是否足够；内置 `default` / `worker` / `explorer` 够用时不建 custom agent
- 默认总规模为主会话加 0–3 个子代理
- 配置和执行分离；写入 TOML 不等于代理已启动
- 区分"文件已写入"和"运行时已生效"
- 能力盘点区分 available / missing_but_relevant / planned_additions
- 模型策略按核验快照执行，用户指定的模型优先
- superpowers bridge 三态规则
- 回复摘要按 `references/output-schema.yaml`

**v2 的改动**：
1. 事实来源优先读 `contracts/project-context.yaml`，schema 按插件里的 `schemas/` 解析，不再查找其他 skill 的路径。
2. 能力盘点要计入**会自己派生子代理的 skill**（例如 Matt 的 `code-review` 用并行子代理做双轴审查）。已有同类能力时，不再建重复的 reviewer 角色，除非有不同的证据面。
3. 发现 v1 遗留平行层（`topology.yaml`、`roles/*.md`、`bridges/*.md`、`.codex/agents/README.md`）时，给出迁移方案，用户确认后再转成 TOML 或退役。
4. （v0.2 起）追加 refresh-log 条目，内容边界见 02-contract-schema §4。
5. 完成后运行 `vic-check --agents`，有 error 就修复。
6. `model-policy.md` 的核验日期超过 45 天时，提醒先重新核验官方文档再改模型配置。
7. 接收 vic-learn 转交的"代理角色"类教训，比如 reviewer 漏掉某类问题，就更新对应角色的 `developer_instructions`。

**禁止**：
- 把摘要字段（`allowed_tools`、`write_scope` 等）写进 TOML
- 生成当前官方参考未列出的字段（如 `max_depth`）
- 修改项目信任设置或权限
- 把单次判断回写进合同
- 为了"保持单代理"而关闭整个项目的多代理能力

**验收**：
- f5（小任务）为零文件改动
- f6（认证跨模块回归 + 用户要求独立评审）只新增 `reviewer.toml`，并保留已有的无关配置和注释
- f6 的 `task-ultra.md` 变体（Ultra 父会话 + 可复用的轻量扫描）：优先推荐内置 explorer；确需 custom agent 时同时写模型和推理档位
- f7（含旧字段 `max_threads` 和 `[agents.x] config_file` 注册）不产生重复定义，迁移方案正确
- `vic-check --agents` 为 0 error

---

## 3. vic-check

**职责**：调用 `scripts/vic-check.mjs`，用通俗中文解释结果并给出下一步建议。只读，不改任何文件。

**调用**：允许模型自动调用。

**description 草案**：
> 检查仓库的 agent 合同和代理配置是否合规、是否过期：schema、路径、AGENTS.md 体积、组件合同质量、TOML 字段。Check harness contract health, drift, AGENTS.md size, agent TOML validity.

**步骤**：运行 `node <插件根>/scripts/vic-check.mjs --all --json`，按严重程度汇总；有过期提示时建议 `$vic-bootstrap`；有 TOML 问题时建议 `$vic-agents`。

**验收**：在 f1–f7 上输出和 `expected.yaml` 中的 check 结果一致。

---

## 4. vic-learn

**职责**：两种模式。
- **记录模式**：把一次失误写成 `docs/harness/incidents/<日期>-<slug>.md`。
- **处理模式**：读取状态为 open 的 incidents，或者 Matt `retro` 的结论，归因并提出 harness 修改。

**调用**：只能由用户调用。

**description 草案**：
> 把 agent 的失误或 retro 结论沉淀成 harness 改进：记录 incident，归因为 guide / sensor / gate / tool / agent-role，并提出带来源的修改。Learn from agent mistakes, record incidents, turn retro findings into rules or checks.

**归因表**（详见 `references/attribution.md`）：

| 归因 | 典型信号 | 落点 | 执行者 |
|---|---|---|---|
| guide | agent 不知道某个事实或约定 | 合同条目 / docs，`origin: incident:<文件>` | vic-learn |
| sensor | 错误只有事后才能看出来，且是机械性的 | 目标仓库的 lint 规则、测试或检查脚本 | vic-learn（生成代码，用户批准） |
| gate | 这类错误绝不能进入下一步 | 目标仓库的 pre-commit / CI / 项目级 hook | vic-learn（用户批准） |
| tool | agent 缺少能力或信息来源 | 目标仓库的 `scripts/agent/` | vic-learn |
| judgment | 需要人判断的规范 | `CODING_STANDARDS.md`，带来源注释 | 提议，用户批准 |
| agent-role | 某个子代理角色的职责或指令有缺口 | `.codex/agents/<name>.toml` | 转交 `$vic-agents` |
| no-action | 一次性的偶发问题 | 只在 incident 里记录结论 | — |

**原则**：机械性的问题优先做成确定性检查，判断性的问题才写成文字规则（与 Matt `retro` 一致）。

**步骤（处理模式）**：归因 → 给出改动 diff → 用户批准 → 落地 → incident 状态改为 `resolved` 并链接改动 → 追加 harness CHANGELOG 和 refresh-log → 运行 `vic-check`。每条 incident 还要判断 `generalizable: yes | maybe | no`，供插件级晋升使用（见 05-evolution）。

**禁止**：未经批准就写入；往 AGENTS.md 写导航指针和 hard stop 以外的内容。

**验收**：给定 3 条样例 incident（evals/fixtures/incidents/），归因和落点与预期一致；批准后的改动通过 `vic-check`。

---

## 5. vic-prune

**职责**：找出可以降级或删除的 harness 组件，并在模型升级后安排消融测试。

**调用**：只能由用户调用。

**description 草案**：
> 精简 harness：找出过期、重复、无用的合同条目、规则和代理角色，模型升级后做消融测试，建议降级或退役。Prune stale rules, ablation test after model upgrade.

**候选来源**：
- `last_confirmed` 超过 90 天未更新的条目
- 指向已不存在路径的条目（由 vic-check 报出）
- 根层和 app 层的重复事实
- AGENTS.md 超出行数预算
- 长期没有被使用的 custom agent（依据 refresh-log 和用户确认）
- `retired` 已满一个版本周期的条目

**消融测试**：逐个把候选组件设为 probation（不删除），重跑评测问题集；成绩不下降的，下一轮再退役。

**禁止**：未经明确批准就删除 guarded path 或 hard stop。

**说明**："某条规则被触发了多少次"很难自动统计。v0.3 先用 `last_confirmed` 加消融测试作为主要依据，不追求精确的触发计数。

**验收**：在一个人为加入冗余条目的 fixture 上，能列出全部预设的冗余项，且不误报 guarded path。

---

## 6. vic-router

**职责**：根据用户的情况推荐该用哪个 skill 或流程。只推荐，不执行。

**调用**：允许模型自动调用。

**description 草案**：
> 不确定该用哪个 skill 或工作流时使用：在 vic-harness、mattpocock/skills 和 Understand-Anything 之间路由。Which skill should I use, workflow routing.

**正文是一张决策表**，至少覆盖：

| 场景 | 推荐 |
|---|---|
| 新仓库或合同缺失 | `$vic-bootstrap` →（可选）`$setup-matt-pocock-skills` →（大仓库）`$understand` → `$vic-bootstrap` 再刷新一次以吸收指针 |
| 需要决定是否用子代理、换模型 | `$vic-agents` |
| 想知道合同是否过期 | `$vic-check` |
| 需求还模糊 | `$grill-with-docs` |
| 要拆任务 | `$to-spec` → `$to-tickets` |
| 实现 | `$implement` / `$tdd` |
| 提交前 | `$understand-diff`（如已安装）→ `$code-review` → `$pr` |
| 会话结束 | `$retro` → `$vic-learn` |
| agent 刚犯了错 | `$vic-learn`（记录模式） |
| 换了模型 | `$vic-agents`（核验模型）→ `$vic-prune`（消融测试） |
| 看不懂陌生代码 | `$understand-chat` / `$understand-explain` |

未安装的外部 skill 要说明"未安装，可选"，并给出不依赖它的替代做法。

**验收**：给出 10 个场景描述，推荐结果与预期一致（评测用 `evals/router-cases.yaml`）。
