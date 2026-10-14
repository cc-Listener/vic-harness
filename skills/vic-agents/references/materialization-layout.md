# 官方落地格式

依据：[subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)、[配置参考](https://learn.chatgpt.com/docs/config-file/config-reference)，及 [公开 schema](https://learn.chatgpt.com/docs/config-schema.json)，核验于 2026-10-14。公开 schema 未绑定本机 CLI 0.162.1 的固定版本；本快照不声称完成目标客户端加载验证。仅创建实际需要的文件。

## `.codex/config.toml`

`[agents]` 保存全局子代理设置。当前新配置生成字段（enabled/interrupt_message 为 boolean，并发值为整数且至少 1，模型/推理为非空字符串，推理支持依最终模型判断）：

| 字段 | 含义与使用边界 |
| --- | --- |
| `enabled` | 多代理工具开关；当前默认启用，不为保持单代理任务而关闭整个项目 |
| `max_concurrent_threads_per_session` | 同时打开的子代理线程上限，不计主线程；未设置时由 Codex 选择默认值 |
| `default_subagent_model` | 子代理默认模型，确有统一覆盖需求才设置 |
| `default_subagent_reasoning_effort` | 子代理默认推理档位，需要与最终模型兼容 |
| `interrupt_message` | 是否把中断写入模型上下文；当前默认启用，无需求则省略 |

`max_threads` 是仍支持的旧别名。合法别名不因 warning 自动迁移；仅换字段名须有授权和配置收益。纯别名迁移保持数值；数值改变属于另一项行为变更，须单独给出项目级依据。新配置用新字段；迁移已有配置时保持原数值语义，避免同时声明新旧字段，即使数值相同也会被本项目 A04 报 error。此为一致性规则，不冒称已验证 CLI 冲突行为。`max_depth` 在公开 schema 中仍存在，仅 V1 使用、V2 忽略；不用于新模板。`nickname_candidates` 属于旧角色注册子表，不是全局 scalar 字段；不在新模板生成。`job_max_runtime_seconds` 的当前运行语义没有公开证据。上述历史字段及未知配置均先保留，定向核对后迁移，不能一概删除或断言所有版本无效。

若需要限制两条并发子线程：

```toml
[agents]
max_concurrent_threads_per_session = 2
```

该值表示主会话之外最多两条子线程，不是两个 custom agent 定义。串行 staged pair 只需要一条子线程；本次使用量低于已有项目容量不构成降低持久上限的理由，在计划/guardrails 中限制本次使用量即可。建议值也不能提升运行环境已经设置的额度。

## `.codex/agents/<name>.toml`

每份 standalone TOML 定义一个可被委派的角色，必需 `name`、`description`、`developer_instructions`。文件名尽量等于 `name`，以 `name` 为身份来源；同名 built-in 会被覆盖。

模型需要覆盖时使用 `model`、`model_reasoning_effort`，继承见 [模型策略](model-policy.md)。角色可调整指令、支持的模型设置或关闭支持的 capability；其余设置必须按当前官方文档定向确认，避免复制父配置。

当前配置参考仍列有 `[agents.<name>]` 的 `description` / `config_file` 注册方式；发现已有可用注册时增量维护，不把它误判成伪格式，也不再生成同名 standalone 文件造成重复。新建角色优先 standalone 格式。`config_file` 相对声明它的配置文件所在目录解析，例如 `.codex/config.toml` 中 `agents/reviewer.toml` 指向 `.codex/agents/reviewer.toml`。旧注册引用的配置片段不必具有 standalone 的三项身份字段；先区分片段与 standalone，再核对全部引用及用户要求，授权覆盖后才移除旧注册。

角色的 `allowed_tools`、`forbidden_tools`、`write_scope` 等是本技能的摘要/指令语义，不是新增的 Codex TOML 权限字段。角色文件中的 `sandbox_mode`、`approval_policy`、`model_provider`、`mcp_servers` 不覆盖父会话；服务档位随根会话。只读意图放入 `developer_instructions`，真实只读边界在父运行时与连接器授权中确认。本技能不替用户修改 trust 或权限；不能凭指令或角色文件宣称隔离生效。

## 生效条件与增量刷新

- 保留无关 agent、现有注释、MCP 配置与敏感值引用；摘要中不回显凭证。
- 只调整本次有依据的字段。未知客户端版本或字段支持时，说明兼容性未确认并保留可用配置。
- 未受信任项目会跳过项目级 `.codex/` 配置层；不得自动修改 trust 配置来使文件生效。
- 解析 TOML、核对 schema 与实际客户端加载是不同证据层。未运行客户端加载检查时，明确写“未验证加载”。
- 不创建平行的 `.codex/agents/README.md`、`topology.yaml`、`roles/*.md` 或 `bridges/*.md` 作为配置。用户明确要求的人类文档可以额外提供。

## 可选的 `.codex/AGENTS.md` bridge

`user-confirmed` 表示已获用户确认集成，或用户明确要求 bridge；只有存在实际需要时才创建。`user-denied` 表示用户拒绝集成，本次跳过 bridge 并保留无关现有文件。`unknown` 表示没有确认，仅有安装或仓库线索也属于此态；跳过 bridge，不打断其它配置工作。沿用有效的已有授权，用户后续明确请求可更新状态，无需重复询问。

按 [AGENTS.md 发现规则](https://learn.chatgpt.com/docs/agent-configuration/agents-md)，根目录任务不会因为 `.codex/AGENTS.md` 存在就自动读它。使用 bridge 时，在适用的指导文件或相关 agent 的 `developer_instructions` 中写明读取入口，并按 `.codex/AGENTS.override.md`、`.codex/AGENTS.md` 的顺序解析。无读取入口则报告未接通，不宣称集成生效。

bridge 仅连接已有技能与指导，不替代 TOML，也不把安装线索当成用户确认。

## v1 平行层迁移

只在发现 `.codex/agents/topology.yaml`、`.codex/agents/roles/*.md`、`.codex/agents/bridges/*.md` 或 `.codex/agents/README.md` 时读取本节。它们是本项目的迁移 warning，不代表官方 TOML 语法错误；`docs/agents/` 属外部文档，不按旧平行层处理。

1. 逐文件核对用途、所有者、调用或 guidance 引用、已有 TOML 与角色身份；用户禁止改写的角色保留。
2. 给出逐文件方案：稳定窄职责转为 TOML；过时且无引用的配置退役；有文档价值的内容保留为人类文档并说明其非运行时配置身份。列出目标路径、将迁移的字段、引用变更、删除项及风险。
3. 先将方案做成可审阅结果，再依据已有明确授权执行。没有覆盖该迁移动作的授权时等待用户确认，只停迁移分支，继续独立的官方配置工作。
4. 转换时仅提取职责、指令和支持的配置字段；摘要约束写进指令。更新相关引用，核对同名旧注册与 standalone 不重复；获授权后再退役原件，不生成新的平行层。
5. 对实际变化运行检查并报告保留项。未知历史内容、未知合同 schema 和无关报错维持原样，列入未通过检查与后续路由；不能靠扩大写入取得零错误。

完成条件：每个旧文件均有转换/退役/人类文档/待确认的处置及引用证据；实际差异只含已授权项目。
