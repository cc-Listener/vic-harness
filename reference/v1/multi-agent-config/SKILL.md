---
name: multi-agent-config
description: 用于评估项目是否需要 Codex subagents，生成或增量刷新项目级自定义 agent TOML，以及按当前官方文档更新模型和推理配置。
---

# 多代理配置

评估委派是否有收益，并将必要的配置落到 `.codex/config.toml` 与 `.codex/agents/*.toml`。配置生成与实际执行分开：本技能不因生成配置就启动业务任务，也不承担项目初始化。

## 当前基线与来源

最近核验：2026-10-13。这是核验快照，不是永久模型目录。

- [Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)：委派方式、配置层和继承规则。
- [配置参考](https://learn.chatgpt.com/docs/config-file/config-reference)：可写入 TOML 的字段。
- [Codex 模型](https://learn.chatgpt.com/docs/models)：客户端模型、推理档位和可用性。
- [AGENTS.md 发现规则](https://learn.chatgpt.com/docs/agent-configuration/agents-md)：指导文件的目录作用域。

涉及“最新模型”、字段迁移或版本兼容时，使用可用的 OpenAI Docs 技能或官方文档工具，先搜索并打开对应官方页面，再检查本地配置。记录核验日期、URL、客户端可用性与未确认项。无法联网时保留现有有效选择，注明依据是本地快照；不要宣称已核验最新版本。

## 决策原则

- 先判断 single-agent 是否足够，再判断独立调研、验证或安全并行能否节省时间或提高质量。内置 `default`、`worker`、`explorer` 足够时，无需创建 custom agent。
- 仅为可复用的窄职责、独立证据面或独立评审生成 custom agent。不要按任务标签或机械加分凑角色。
- 当前 Codex 默认启用 subagents，可由用户请求或适用的项目/技能指令触发；Ultra 支持主动委派。写入 TOML 不等于已启动代理，委派也不要求先建立 custom agent。
- 已有用户授权持续有效。普通配置刷新、只读验证与已授权的委派无需再次确认；确实缺少关键事实时，只阻塞依赖该事实的部分。
- 默认建议总规模为主会话加 0–3 个子代理。这是本技能的保守建议，不是产品上限；更多代理按独立任务、实际并发额度与成本说明理由。
- 复用已有模型选择；只有明确的迁移请求或角色收益才覆盖。最新推荐、推理支持和继承细节见 [模型策略](references/model-policy.md)。

## 工作流

### 1. 收集事实和生效指导

检查目标仓库与当前会话能力，读取已有 `.codex/config.toml`、相关 `.codex/agents/*.toml`，以及存在时的 `contracts/project-context.yaml`。合同属于项目事实层；缺失不构成初始化阻塞。需要解释合同字段时，按技能目录中实际发现的 `$project-bootstrap-contract` 路径读取其 schema，不使用某台机器的固定绝对路径。

指导文件按全局配置目录、项目根到当前目录逐层解析；同目录优先首个非空 `AGENTS.override.md`，其次 `AGENTS.md`，再查已配置的 fallback。子目录规则受路径作用域约束，不把 `docs/AGENTS.md` 或 `.codex/AGENTS.md` 当成自动覆盖整个仓库的规则。

完成条件：能区分事实来源 `project-context` / `repo-scan` / `mixed`，标明任务范围、现有配置、模型约束和未确认的加载条件。

### 2. 盘点能力并选择最小方案

参考 [决策规则](references/decision-rules.md) 与 [能力盘点](references/capability-inventory.md)，区分 `tools`、`skills`、`mcp`、`runtimes` 各自的 available、missing_but_relevant、planned_additions。已安装与本会话实际可调用不是一回事。

给出 single-agent 基线及有理由才启用的增强方案；分别列主会话、计划委派的子代理、需要持久化的 custom agent。`active_agents` 在摘要中表示计划使用的子代理，不表示已运行。`agent_count` 包含主会话，官方并发字段只计子代理。

这些决策描述用户要配置的目标工作流，不是运行本技能的配置编辑过程。例如，保留独立 reviewer 的方案仍是 `use_multi_agent: "yes"` 并列出计划 reviewer；尚未启动只由 `delegation.execution_status: not-started` 表达。

完成条件：每个新增角色都有独立工作范围、输入、可检查输出与具体收益；没有收益时选择零新增文件。

### 3. 选择模型与约束

按 [模型策略](references/model-policy.md) 核对模型、推理档位、继承结果和账户/客户端支持。保留用户明确指定的型号；不可用时说明阻塞，不悄悄替换。

需要 custom agent 时按 [角色模板](references/role-templates.md) 写简短的职责、写入范围、完成证据和回传要求。并行读任务优先；并行写任务必须有不重叠的 ownership 或经验证的隔离方式。子会话的上下文隔离不意味着独立文件系统。

完成条件：每个显式模型配置都有依据；角色输出可验证；权限约束区分文字指导与实际工具/沙箱配置。

### 4. 增量落地

字段、旧配置迁移与 bridge 规则见 [落地格式](references/materialization-layout.md)。

- 仅在确实需要调整全局设置时创建或修改 `.codex/config.toml`。
- 仅为需要持久化的子代理创建或修改 `.codex/agents/<name>.toml`；它不会改变主会话角色。
- 每个 standalone agent 必须有 `name`、`description`、`developer_instructions`；其余仅用当前官方支持且本次需要的字段。
- 保留无关配置、注释、已有角色与凭证引用。对冲突的同名角色先核对用途；与 built-in 同名会覆盖 built-in。
- single-agent 或内置代理足够且无需全局变更时，报告无文件变更；不要创建空配置，也不要因此禁用整个项目的多代理能力。
- 项目不受信任、字段支持或加载情况未确认时，区分“文件已写入”与“运行时已生效”，不替用户修改信任或权限。

`superpowers_integration` 保留 `user-confirmed` / `user-denied` / `unknown` 三态。只有用户已确认集成或明确要求 bridge 时才考虑 `.codex/AGENTS.md`；状态未知时跳过可选 bridge，继续 TOML 工作。需要让 bridge 对根目录任务生效，必须通过适用的指导文件或 custom agent 指令显式引用，并遵守同目录 override 优先级。

完成条件：所有本次变更都是官方配置或已授权的 bridge；没有另建 `topology.yaml`、`roles/*.md`、`bridges/*.md` 等平行配置层。

### 5. 验证并报告

按 [验证与质量门](references/evaluation-and-contracts.md) 检查 TOML 语法、必需字段、引用路径、模型/推理组合和增量差异。语法可解析不代表客户端已加载；只有实际运行证据才支持生效结论。验证与改动相称，通过后不重复无关检查。

输出简洁建议与 [YAML 摘要](references/output-schema.yaml)，列出确切创建、修改、保留与待处理文件。参考 [示例](references/examples.md)；摘要默认留在回复中，除非用户要求保存，不写成第二套仓库 manifest。

必须保留：

- `initialized_project`、`initialization_required`、`ready_for_multi_agent`：本次运行判断，不回写项目合同。
- `project_context_source`、`capability_inventory`、`use_multi_agent` 与升级理由。
- `minimal_setup`、`enhanced_setup`、`evaluation`、`evidence_requirements`、`guardrails`。
- `model_policy`、`delegation`、`superpowers_integration`、`materialization` 与 `repo_local_artifacts`。
- 风险确有需要时的 `human_checkpoints`；已有授权直接记录，不新增普遍审批关卡。

所有说明、角色描述和指令使用简体中文；字段、路径、模型名与必要技术术语保留原文。

设计取舍见 [工程说明](references/engineering-notes.md)。
