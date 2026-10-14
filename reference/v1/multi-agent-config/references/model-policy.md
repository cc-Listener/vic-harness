# 模型与推理策略

核验日期：2026-10-13。用户指定的模型优先于“最新”推荐，已有合理分工和成本目标优先于统一换成旗舰。

## 选择流程

1. 用户要求“最新”或升级时，先搜索并打开 [Codex 模型](https://learn.chatgpt.com/docs/models) 和 [subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)，再读取本地配置。API 模型目录不能单独证明 Codex 账户可用性。
2. 读取现有 agent、`[agents]` 默认值和已知父会话设置。没有覆盖需求时省略 `model` 与 `model_reasoning_effort`，保留继承。
3. 根据客户端显示的模型与推理能力、用户指定值、任务质量/成本要求确定配置。无法确认支持时写入摘要的 uncertainty；可保留继承或已确认有效配置，不能杜撰可用性。
4. 显式跨模型覆盖时核对最终推理值，尤其是从 Ultra 父会话切换到 Luna。在 custom agent 中同时设置已支持的推理值，避免不兼容继承。

## 本次核验的候选

| 使用场景 | 模型 | 推理起点 |
| --- | --- | --- |
| 常规复杂编码、多步骤工具工作、需要持续验证 | `gpt-6.1-sol` | 优先客户端默认值；只有有依据时显式设置 |
| 最困难的端到端推理、复杂判断 | `gpt-6-astra` | `low` 起步，再按实际质量调整 |
| 范围清晰的扫描、抽取、重复性检查 | `gpt-6-luna` | `high` 起步；不支持 `ultra` |

这是按角色选择候选的快照，不要求每个仓库都写死上述三个型号。`max`、`ultra` 只在任务收益和客户端支持都成立时考虑；不要自动将每个子代理升级到最高档。

当前官方文档把 `gpt-5.4`、`gpt-5.3-codex` 等列为 ChatGPT 登录下 Codex 的退役或弃用型号；`gpt-5.5` 将于 2026-10-14 在该入口退役。API 生命周期不同。刷新时确认身份入口与可用替代，不批量改写历史示例、评测基线或用户有意保留的兼容配置。

## 配置优先级

按 [subagents 的继承规则](https://learn.chatgpt.com/docs/agent-configuration/subagents) 分两步解析：

1. 在应用 custom agent 文件前，模型和推理分别从显式 spawn 参数、`agents.default_subagent_*`、父会话中解析。如果 spawn 或 `[agents]` 显式选择模型却都未指定推理，则使用所选模型默认推理。
2. custom agent 文件的 `model` / `model_reasoning_effort` 再覆盖已解析结果。文件只写 `model` 时会保留此前解析的推理值，不能假设自动采用新模型默认值。

主会话模型是 `.codex/config.toml` 顶层的 `model`，不会被 `.codex/agents/implementer.toml` 改变。仅调整子代理模型时，不改主会话默认值。模型和推理以实际客户端支持为准，不能把 API 的 `reasoning.effort` 直接写成 Codex TOML 键。

## 与 GPT-6 提示词的配合

[官方 GPT-6 指南](https://developers.openai.com/api/docs/guides/latest-model) 建议明确自主推进、委派条件和验证尺度。落实到角色指令时：

- 写清目标、输入、完成证据和边界，允许在已授权范围内自主完成工作。
- 存在可独立并行且能节省时间或提高质量的工作时，可以建议委派；约定写入范围、等待关系与结果摘要。
- 缺少事实只阻塞依赖它的步骤，继续独立可完成的工作。
- 验证覆盖真实风险；必要检查通过后交付，避免对小改动反复运行大范围测试。

Ultra 是 Codex 客户端的推理/委派体验，不是应复制到所有 API 模型的通用参数。此技能只生成 Codex 配置，不把 Responses API 的多代理 beta 字段写进 TOML。
