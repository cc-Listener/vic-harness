# 工程依据

本文件只解释影响配置设计的官方行为。核验日期：2026-10-14；版本敏感结论在刷新配置时仍需对照当前官方页面。

## 官方来源

- [Codex 子代理](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Codex 配置参考](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Codex 模型](https://learn.chatgpt.com/docs/models)
- [AGENTS.md 指令发现](https://learn.chatgpt.com/docs/agent-configuration/agents-md)

字段来源另含 [公开 schema](https://learn.chatgpt.com/docs/config-schema.json)；该 schema 未绑定 CLI 0.162.1，文档、解析与实际加载证据分别说明。字段生成与兼容的唯一规则来源为 [materialization-layout.md](materialization-layout.md)。模型选择的唯一规则来源为 [model-policy.md](model-policy.md)，此处不复制模型名或推理参数清单。

## 委派与配置是不同动作

当前 Codex 默认启用子代理。用户请求或适用的 `AGENTS.md` / skill 指令可以指导委派；Ultra 支持主动委派。创建 TOML 文件本身不会启动代理，本技能也不代替主会话执行配置中的任务。

自定义代理定义应用于启动的子会话，不能配置或重命名当前主会话。未覆盖模型和推理设置时继承上级设置；默认优先复用内置能力，只为稳定而明确的职责差异创建自定义文件。

## 采用当前配置字段

全局 `[agents]` 当前参考列出 `enabled`、`max_concurrent_threads_per_session`、`default_subagent_model`、`default_subagent_reasoning_effort` 和 `interrupt_message`。并发线程上限不计主线程，只在需要改变行为时写入相关设置。

`max_threads` 是旧别名，不用于新配置。公开 schema 仍列出 V1 专用、V2 忽略的 `max_depth`；`nickname_candidates` 是历史角色注册子表字段；`job_max_runtime_seconds` 的公开运行语义未确认。这些不作为新配置生成项，已有未知配置保留。刷新时保留无关现有设置，对涉及迁移的差异单独核验。

## 上下文、文件和权限分别确认

子会话拥有独立上下文，但可能共享目录。安全并行依赖明确写入范围，不依赖“子代理”名称。指令中的工具禁用说明属于行为约束，不能当作已生效的权限控制；角色文件中的 sandbox_mode、approval_policy、model_provider、mcp_servers 不覆盖父会话，服务档位随根会话；外部连接器仍有独立授权边界。

项目 guidance 按作用目录发现，同目录优先使用 `AGENTS.override.md`。`.codex/AGENTS.md` 不会自动成为仓库根目录的指令；如创建可选 bridge，必须通过适用指令显式引用，并确认没有被同目录 override 遮蔽。

## 用收益决定复杂度

独立审查、不同来源核验或互不重叠的工作可以支持委派；仅列出更多角色不会提高质量。对子代理产生的额外上下文、工具调用和综合成本保留判断，使用具体验证结果证明收益。工作流与质量门分别以 [SKILL.md](../SKILL.md) 和 [evaluation-and-contracts.md](evaluation-and-contracts.md) 为准。
