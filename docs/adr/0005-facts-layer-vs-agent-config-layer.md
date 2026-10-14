# ADR-0005 项目事实层与代理配置层分离，单向依赖

- 状态：已采纳
- 日期：2026-10-13

## 背景
v1 的两个 skill 都声明了"共享 schema 但不共享决策职责"，但 project-bootstrap-contract 里写着 `.codex/agents/topology.yaml`、`roles/*.md`、`bridges/*.md` 由 multi-agent-config 负责，而 multi-agent-config 明确不生成这些平行层，两者描述不一致。

## 决策
- vic-bootstrap 只负责项目事实（AGENTS.md、docs/、contracts/）。
- vic-agents 只负责代理配置（`.codex/config.toml` 的 `[agents]`、`.codex/agents/*.toml`、可选的 `.codex/AGENTS.md` bridge）。
- 依赖方向：vic-agents 读合同；vic-bootstrap 不读写代理配置。合同缺失时 vic-agents 以 `repo-scan` 独立运行。
- 平行配置层（`topology.yaml`、`roles/*.md`、`bridges/*.md`、`.codex/agents/README.md`）不再由任何 skill 生成；发现时由 vic-check 报告，由 vic-agents 提供迁移方案。

## 后果
两个 skill 可以独立演进；schema 是唯一的接口，变更须遵守 02-contract-schema.md 的兼容规则。
