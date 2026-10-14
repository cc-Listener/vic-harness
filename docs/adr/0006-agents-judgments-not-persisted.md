# ADR-0006 vic-agents 的单次判断不写入仓库，只记录文件改动

- 状态：已采纳
- 日期：2026-10-13

## 背景
v1 multi-agent-config 规定：`initialized_project`、`ready_for_multi_agent`、`use_multi_agent` 等是单次运行判断，不回写项目合同，摘要默认留在回复里，不写成第二套仓库 manifest。但进化回路需要知道"代理配置什么时候、因为什么被改过"。

## 决策
- 单次判断仍然只出现在回复摘要里。
- vic-agents 每次运行向 `contracts/refresh-log.yaml` 追加一条，只包含：改动了哪些文件、模型和字段的核验日期、来源 URL、未确认项。
- refresh-log 是变更日志，不是事实来源；任何 skill 都不能从日志推断项目当前状态。

## 后果
保留了 v1 "不制造第二套 manifest" 的原则，同时让配置变化可审计、可用于剪枝。
