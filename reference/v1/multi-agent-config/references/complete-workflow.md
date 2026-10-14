# 工作流兼容入口

完整工作流的唯一来源是 [SKILL.md](../SKILL.md)。保留本文件供已有引用使用，不再维护第二套步骤。

## 交付验收清单

- 已按目录作用域和同目录 `AGENTS.override.md` 优先级读取有效指令。
- 已说明事实来自 `project-context`、`repo-scan` 或 `mixed`；未把 bootstrap 变成硬前置，也未回写单次运行判断。
- 已区分可用、缺失但相关和计划补充的能力，以及 `mcp` 与 `runtime`。
- 已从 single-agent 判断必要性，优先复用内置能力；不需要配置变化时允许零文件变更。
- 已分开 `main_session` 与计划委派的 `active_agents`；代理总数包含主会话，并发子代理数不包含主会话。
- 已遵循 [model-policy.md](model-policy.md) 核验模型与推理设置，未从旧示例复制固定模型。
- 已仅增量修改相关官方 TOML，保留无关配置；没有把摘要字段或工具建议当作权限字段。
- 已保留 `minimal_setup`、`enhanced_setup`、`evaluation`、`evidence_requirements` 和 `guardrails`；人工确认点仅对应实际授权缺口。
- 已报告 superpowers 状态；`unknown` 时跳过 bridge，已有授权沿用，未因此阻塞 TOML 工作。
- 如创建 `.codex/AGENTS.md`，已通过适用指令显式引用，并说明它是可选 guidance bridge。
- 已列出实际文件变更、验证证据和未验证项；未将计划角色描述成已运行代理，也未将语法验证描述为运行时加载成功。

摘要与说明默认使用简体中文，字段名、路径、模型名和必要技术术语除外。
