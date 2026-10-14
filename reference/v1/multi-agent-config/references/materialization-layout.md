# 官方落地格式

依据：[subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)、[配置参考](https://learn.chatgpt.com/docs/config-file/config-reference)，核验于 2026-10-13。仅创建实际需要的文件。

## `.codex/config.toml`

`[agents]` 保存全局子代理设置。当前可用字段：

| 字段 | 含义与使用边界 |
| --- | --- |
| `enabled` | 多代理工具开关；当前默认启用，不为保持单代理任务而关闭整个项目 |
| `max_concurrent_threads_per_session` | 同时打开的子代理线程上限，不计主线程；未设置时由 Codex 选择默认值 |
| `default_subagent_model` | 子代理默认模型，确有统一覆盖需求才设置 |
| `default_subagent_reasoning_effort` | 子代理默认推理档位，需要与最终模型兼容 |
| `interrupt_message` | 是否把中断写入模型上下文；当前默认启用，无需求则省略 |

`max_threads` 是仍支持的旧别名。新配置用新字段；迁移已有配置时保持原数值语义，避免同时写两个冲突值。当前参考未列出 `max_depth`、`job_max_runtime_seconds` 与 `nickname_candidates`，不要在新模板中生成；发现历史字段时先核对目标客户端，不能把“文档未列出”直接等同于“所有旧版本均无效”。

若需要限制两条并发子线程：

```toml
[agents]
max_concurrent_threads_per_session = 2
```

该值表示主会话之外最多两条子线程，不是两个 custom agent 定义。串行 staged pair 只需要一条子线程；建议值也不能提升运行环境已经设置的额度。

## `.codex/agents/<name>.toml`

每份 standalone TOML 定义一个可被委派的角色，必需 `name`、`description`、`developer_instructions`。文件名尽量等于 `name`，以 `name` 为身份来源；同名 built-in 会被覆盖。

可选使用 `model`、`model_reasoning_effort`、`sandbox_mode`、`mcp_servers`、`skills.config` 等当前支持的配置键。模型继承见 [模型策略](model-policy.md)。只有角色需要时才覆盖，避免复制父配置。

当前配置参考仍列有 `[agents.<name>]` 的 `description` / `config_file` 注册方式；发现已有可用注册时增量维护，不把它误判成伪格式，也不再生成同名 standalone 文件造成重复。新建角色优先 standalone 格式。迁移时核对所有引用后再移除旧注册。

角色的 `allowed_tools`、`forbidden_tools`、`write_scope` 等是本技能的摘要/指令语义，不是新增的 Codex TOML 权限字段。实际权限使用官方沙箱和工具配置；`sandbox_mode = "read-only"` 是角色默认值，父会话实时覆盖与连接器权限仍需单独检查，不能声称绝对禁止所有外部写入。

## 生效条件与增量刷新

- 保留无关 agent、现有注释、MCP 配置与敏感值引用；摘要中不回显凭证。
- 只调整本次有依据的字段。未知客户端版本或字段支持时，说明兼容性未确认并保留可用配置。
- 未受信任项目会跳过项目级 `.codex/` 配置层；不得自动修改 trust 配置来使文件生效。
- 解析 TOML、核对 schema 与实际客户端加载是不同证据层。未运行客户端加载检查时，明确写“未验证加载”。
- 不创建平行的 `.codex/agents/README.md`、`topology.yaml`、`roles/*.md` 或 `bridges/*.md` 作为配置。用户明确要求的人类文档可以额外提供。

## 可选的 `.codex/AGENTS.md` bridge

只有用户已确认 superpowers 集成或明确要求 bridge，且确实需要时才创建。`unknown` 时跳过 bridge，不打断其它配置工作；用户已有授权无需重复询问。

按 [AGENTS.md 发现规则](https://learn.chatgpt.com/docs/agent-configuration/agents-md)，根目录任务不会因为 `.codex/AGENTS.md` 存在就自动读它。使用 bridge 时，在适用的指导文件或相关 agent 的 `developer_instructions` 中写明读取入口，并按 `.codex/AGENTS.override.md`、`.codex/AGENTS.md` 的顺序解析。无读取入口则报告未接通，不宣称集成生效。

bridge 仅连接已有技能与指导，不替代 TOML，也不把安装线索当成用户确认。
