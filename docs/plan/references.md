# 参考资料

规划依据的主要来源。实现时如需核对细节，优先看这些原文。

## Harness Engineering
- Mitchell Hashimoto，My AI Adoption Journey（"Engineer the harness" 一步）
- OpenAI，Harness engineering: leveraging Codex in an agent-first world — https://openai.com/index/harness-engineering
- OpenAI，Codex as a platform: build on the open agent harness — https://developers.openai.com/blog/codex-as-a-platform
- Anthropic，Effective harnesses for long-running agents（2025-11-26）
- Anthropic，Harness design for long-running application development — https://www.anthropic.com/engineering/harness-design-long-running-apps
- Anthropic，Scaling Managed Agents: Decoupling the brain from the hands — https://www.anthropic.com/engineering/managed-agents
- Birgitta Böckeler，Harness Engineering for Coding Agent Users — https://martinfowler.com/articles/harness-engineering.html
- Addy Osmani，Agent Harness Engineering — https://addyosmani.com/blog/agent-harness-engineering/
- Harness Engineering: Anatomy, Architecture, and Evolution of Coding Agents（arXiv 2609.00006）

## Codex 插件
- openai/codex 源码：`codex-rs/core-plugins/src/manifest.rs`（清单字段：skills、hooks、mcpServers、apps、interface 等）
- Codex CLI Plugin Ecosystem（第三方，含 marketplace 与 hooks 示例）— https://codex.danielvaughan.com/2026/05/04/codex-cli-plugin-ecosystem-building-distributing-marketplace-plugins/
- mattpocock/skills ADR 0002（Codex 插件清单与软链限制）— https://github.com/mattpocock/skills/blob/main/.agents/adr/0002-ship-as-a-claude-code-plugin.md

## 集成对象
- mattpocock/skills — https://github.com/mattpocock/skills（重点：setup-matt-pocock-skills、retro、code-review、domain-modeling、writing-for-agents）
- Understand-Anything — https://github.com/Egonex-AI/Understand-Anything（重点：/understand 的产物 .ua/knowledge-graph.json、understand-diff、understand-chat）

## Codex 官方文档（multi-agent-config v1 于 2026-10-13 核验）
- Subagents — https://learn.chatgpt.com/docs/agent-configuration/subagents
- 配置参考 — https://learn.chatgpt.com/docs/config-file/config-reference
- 模型 — https://learn.chatgpt.com/docs/models
- AGENTS.md 发现规则 — https://learn.chatgpt.com/docs/agent-configuration/agents-md
