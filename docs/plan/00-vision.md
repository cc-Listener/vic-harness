# 00 · 愿景与原则

## 一句话

**vic-harness 是 Vic 的工程 Harness 发行版（Codex plugin）。** 它负责三件事：
1. 把一个仓库初始化成 agent 能可靠工作的状态；
2. 按需为它配置最小且有依据的多代理方案；
3. 让这套约束随着 agent 犯的错、仓库的变化和模型的升级持续进化。

背景公式：`Agent = Model + Harness`。模型以外的一切都属于 harness，包括导航、事实、检查、闸门、工具、代理配置和记忆。

## 设计原则（冲突时按顺序优先）

1. **地图而非手册**：AGENTS.md 只放读取顺序、指针、最小路由和少量 hard stops，细节按需加载。
2. **事实必须有出处**：每条关键事实都带 `evidence`（仓库证据）和 `origin`（来源：仓库扫描、某次失误或用户声明）。没有证据的内容只能写进 `uncertainty`。
3. **确定性优先**：能写成脚本检查的，就不交给 LLM 判断。比如是否过期、路径是否存在、TOML 或 YAML 是否合规。
4. **失败驱动**：除仓库事实外，每条规则都应能追溯到一次具体失误（incident）或一次 retro 结论。
5. **可删除**：harness 编码的是"模型目前做不到什么"。每个组件都要能被剪掉，模型升级后要主动做消融测试，删掉不再需要的部分。
6. **从单代理开始**：多代理只在有独立证据面、独立评审或不重叠的并行工作时才启用。不需要配置变化时，允许零文件改动。
7. **组合而非吞并**：mattpocock/skills 和 Understand-Anything 只通过接线集成，不 fork 也不复制它们的代码。依赖缺失时安静降级。
8. **小而精**：发布的 skill 不超过 6 个，每个 SKILL.md 不超过 150 行，其余内容放进 references。
9. **版本敏感的事实要标核验日期**：模型名、配置字段、产品行为都会过期。记录核验日期和来源 URL，过期就重新核验，不凭记忆宣称"最新"。

## 范围

**负责：**

| Skill | 职责 | 来源 |
|---|---|---|
| `vic-bootstrap` | 仓库的项目事实合同（AGENTS.md、docs/、contracts/）的初始化和增量刷新 | 由 v1 `project-bootstrap-contract` 升级 |
| `vic-agents` | 评估是否需要多代理，增量维护 `.codex/config.toml` 和 `.codex/agents/*.toml` | 由 v1 `multi-agent-config` 升级 |
| `vic-check` | 合同和代理配置的确定性检查、过期检测 | 新增 |
| `vic-learn` | 记录失误，把教训写回合同、检查、闸门或代理角色 | 新增 |
| `vic-prune` | 剪枝，以及模型升级后的消融测试 | 新增 |
| `vic-router` | 工作流路由，告诉 agent 什么场景用哪个 skill | 新增 |

**不负责（非目标）：**
- 实际执行业务任务或启动子代理。`vic-agents` 只写配置，不执行
- 任务规划、spec/ticket 流程、issue tracker，这归 mattpocock/skills
- 代码知识图谱，这归 Understand-Anything
- 平行的代理配置层（`topology.yaml`、`roles/*.md`、`bridges/*.md`），这些在 v2 里不再生成
- 完整的团队治理体系

## 成功标准（可衡量）

| 指标 | 目标 |
|---|---|
| 新 agent 只读 AGENTS.md 和它链接的文档，评测问题答对率 | ≥ 80% |
| `vic-check` 在 bootstrap 或 agents 运行后的结果 | 0 error |
| AGENTS.md 行数 | ≤ 120 |
| 对未变化的仓库连续运行两次 bootstrap 或 agents | 第二次为 no-op，除 refresh-log 外没有文件变化 |
| 小任务或单代理足够的场景下，`vic-agents` 的文件改动 | 零 |
| 关键事实（guarded_paths / validation_gates / preferred_abstractions）带 evidence 和 origin 的比例 | 100% |
| 外部 skill 的文件（Matt 的段落、GLOSSARY、CODING_STANDARDS 等）和已有的无关 TOML 配置 | 被原样保留 |
