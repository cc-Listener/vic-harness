---
name: vic-agents
description: 仅在用户明确要求评估或配置 Codex 子代理、更新代理模型或迁移代理配置时使用；单代理足够时保持零文件改动。Configure Codex subagents / multi-agent setup, update agent models, migrate agent configuration.
---

# 多代理配置

评估目标工作流的委派收益，增量维护 `.codex/config.toml` 与 `.codex/agents/*.toml`。本技能只配置，不执行业务任务、不启动代理，也不承担项目初始化。

## 边界与来源

- 先判断 single-agent，再复用内置 `default` / `worker` / `explorer`；只有稳定窄职责、独立证据面或配置差异值得持久化 custom agent。
- 默认主会话加 0–3 个子代理；`agent_count` 含主会话，官方并发字段只计子代理。这是保守建议，更多角色须说明独立收益及成本。
- 用户指定的模型优先；既有有效选择与成本目标优先于统一换型号。官方模型与继承快照见 [模型策略](references/model-policy.md)，字段快照见 [落地格式](references/materialization-layout.md)。
- 模型快照超过 45 天时先提示并核验官方页面，再改模型；最新模型、字段迁移或版本兼容请求也触发定向核验。记录实际日期、URL、客户端可用性和未确认项；无法联网时保留有效选择，标明本地快照依据。
- 沿用已有授权。仅对授权未覆盖的破坏性迁移或权限扩大设确认点；普通增量配置与必要修复自主完成。
- M1 不写 refresh-log。零配置收益时真正零写入，不创建空配置、contracts 或日志；后续日志能力也保留 no-op 零写入。

## 工作流

结论前必读四份核心引用正文：能力盘点、决策规则、模型策略、落地格式。步骤 2 成功读取前两份才作能力/方案判断，步骤 3 成功读取模型策略才作模型结论，步骤 4 成功读取落地格式才作持久变更结论；交付前四份均须读完。路径列表、读取命令已发出或示例不能替代成功读取正文。读取失败时说明缺口，停止依赖该材料的写入结论，继续独立可完成的只读工作。

### 1. 收集事实和生效指导

优先读取存在时的 `contracts/project-context.yaml`，以及目标仓库已有 `.codex/config.toml`、相关角色 TOML 和当前会话能力。合同缺失不阻塞配置，可用仓库扫描。

共享文件从当前实际 `SKILL.md` 所在目录定位：项目 schema 为 `../../schemas/project-context.schema.yaml`，迁移边界为 `../../schemas/MIGRATIONS.md`，检查器为 `../../scripts/vic-check.mjs`。按实际安装路径解析，不能把目标仓库或固定缓存目录当插件根。

自定义、未知或不兼容 schema 的合同只作带来源的线索；保留原件，核对相关仓库事实，明确不确定性，不为检查通过改写合同或未知角色。`project_context_source` 用 `repo-scan` / `project-context` / `mixed`，没有可用事实时为 `unknown`。

指导按全局配置目录及项目根到当前目录逐层解析；同目录取首个非空 `AGENTS.override.md`，其次 `AGENTS.md`，再取已配置 fallback。子目录 guidance 只作用于对应路径；`.codex/AGENTS.md` 不自动覆盖根目录。

完成条件：任务范围、有效指导、事实来源、已有配置、用户模型约束、加载条件及缺口均有证据或明确不确定性。

### 2. 盘点能力并选择最小方案

读取 [能力盘点](references/capability-inventory.md) 与 [决策规则](references/decision-rules.md)。区分 tools / skills / mcp / runtimes，各列 available / missing_but_relevant / planned_additions；已安装不等于当前可调用。

把会自行派生代理的既有 skill 计入可用能力。已有同类审查能力时复用它；只有不同证据面支持新 reviewer，不为任务标签或机械加分凑角色。

分别描述主会话、计划委派的子代理与需要持久化的 custom agent。摘要 `active_agents` 是计划，不表示运行；`use_multi_agent` 描述目标工作流，配置编辑尚未启动用 `delegation.execution_status: not-started` 表达。

完成条件：给出 single-agent 基线、条件增强方案及每个新增角色的独立范围、输入、可检查输出和收益；本次使用量低于项目并发容量不是降低全局上限的理由，每项持久变更须有独立配置收益；无配置收益选择零新增文件。

### 3. 选择模型与角色约束

按 [模型策略](references/model-policy.md) 核对最终模型、推理和客户端支持。指定模型不可用时报告阻塞，保留用户选择；显式跨模型切换特别核对 Ultra 到 Luna 的推理兼容。

只有需要 custom agent 时读取 [角色模板](references/role-templates.md)，定义职责、写入范围、完成证据和回传要求。并行读优先；并行写必须有不重叠 ownership 或已验证隔离，上下文独立不等于文件系统独立。

工具建议和只读指令属于行为约束。角色文件的 sandbox_mode、approval_policy、model_provider、mcp_servers 不覆盖父会话，服务档位随根会话；真实权限取决于父运行时及连接器授权。本技能不改变 trust 或权限。

完成条件：显式模型配置有依据、最终推理兼容、角色输出可验证，并清楚区分指令与运行时权限证据。

### 4. 增量落地

按 [落地格式](references/materialization-layout.md) 处理官方字段、旧注册、平行层迁移与 bridge。

- 仅在确需全局调整时修改 `.codex/config.toml`；仅为持久职责维护 `.codex/agents/<name>.toml`，它不改变主会话角色。
- standalone 必填 `name`、`description`、`developer_instructions`；其余仅生成当前支持且本次必要的字段。
- 合法旧别名不因 warning 自动迁移；纯别名迁移保持数值，数值变更另须项目级依据。
- 保留无关设置、注释、合法旧注册、未知历史字段与凭证引用；同名角色先核对用途及用户指导，避免覆盖 built-in 或重复注册。
- 平行层先逐文件给出“转为 TOML / 退役 / 保留为人类文档”的具体方案与引用影响，授权覆盖后执行；未确认的方案只报告，继续其他工作。
- superpowers 保持 user-confirmed / user-denied / unknown；确认集成或明确要求 bridge 后才考虑 `.codex/AGENTS.md`。unknown 时跳过；根任务需要显式读取入口并遵守 override 优先级。
- 接收 `$vic-learn` 转交的 agent-role 教训时，核对事件证据与适用范围，只更新对应角色的 `developer_instructions`，报告变更和验收依据。
- single-agent 或内置能力足够且无需全局修改时保留零文件变更，不因此关闭整个项目的多代理能力。

完成条件：每份改动属于有依据的官方配置或已授权 bridge；没有生成第二套平行配置；未确认加载的文件只报告“已写入”。

### 5. 验证并报告

按 [验证与交付清单](references/evaluation-and-contracts.md) 检查实际差异、TOML、字段、路径、模型/推理及完成证据。

执行 `node <实际插件根>/scripts/vic-check.mjs --agents --root <目标仓库> --json`（目标指导要求命令代理时遵守）。修复本次目标相关且已授权的问题后重跑；无关历史错误保留用户内容，报告未通过及处理路由，不为全库 0 error 扩大写入。零配置收益优先零写入；检查器输出不证明运行时加载或账户模型可用性。

回复用简体中文，字段、路径、模型名和必要术语保留原文。按 [YAML 摘要](references/output-schema.yaml) 保留本次判断、能力、最小/增强方案、evaluation、evidence_requirements、guardrails、模型、delegation、bridge 与实际工件清单。仅必要风险设置 human_checkpoints，已有授权直接记录。

`initialized_project`、`initialization_required`、`ready_for_multi_agent`、`use_multi_agent` 等判断只在回复中；不回写合同。摘要默认不保存为仓库 manifest。列清创建、修改、保留、待处理文件及未验证项，核验日期只填实际完成的核验。核对来源正文确实读取；本地快照日期/路径与本轮官方页面核验日期/URL分别说明，不能用运行当天或快照日期冒充本轮核验。写入拒绝后保留现场，停止该写分支，不换路径或工具规避拒绝；继续独立只读工作，只报告有证据的动作、拒绝和实际差异。文件未变不证明主动 no-op，回合完成不证明配置成功。

完成条件：报告与实际差异、检查结果一致，所有必保留摘要字段齐全；有未通过检查时明确失败，不宣称完成验证。示例见 [三种场景](references/examples.md)，官方行为说明见 [工程依据](references/engineering-notes.md)。
