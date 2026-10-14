# 输出产物

只在不清楚各输出文件应覆盖什么范围时读取这份 reference。

## `AGENTS.md`

目的：
- 作为顶层导航层。
- 若仓库没有 `AGENTS.override.md`，它通常也是生效 guidance 入口。

应包含：
- canonical 项目事实放在哪里
- 关键 guarded 区域
- conventions 和组件规则放在哪里
- 人类可读说明默认使用简体中文

避免：
- 重复整套 conventions
- 罗列每个 package 或每个组件

## `AGENTS.override.md`

目的：
- 当仓库已经采用 override 机制时，作为当前生效 guidance 入口。

应包含：
- 只放需要覆盖或提高优先级的 guidance
- 与 `AGENTS.md` 保持分层，不复制整份地图
- 人类可读说明默认使用简体中文

避免：
- 与 `AGENTS.md` 长期漂移
- 把它写成第二份完整 project map

## `docs/project-map.md`

目的：
- 解释仓库结构和主要边界。

应包含：
- 顶层目录或 workspace
- 主要模块及其 ownership
- guarded 或 release-sensitive 路径
- 说明文字默认使用简体中文

## `docs/conventions.md`

目的：
- 基于仓库证据总结 coding、testing、validation 和 review 预期。

应包含：
- 能确认的 lint、format、test、build、CI、release、review 规则
- 当规则只能推断、但没有文档佐证时，显式写出 uncertainty
- 说明文字默认使用简体中文

## `docs/component-contract.md`

目的：
- 记录后续 agent 应优先复用的 abstraction，而不是直接走底层实现。

应包含：
- 共享组件和 wrapper
- 在明确时给出推荐 import 或入口路径
- 代码或文档能支撑时写出 “do not bypass” 指导
- 说明文字默认使用简体中文

## `contracts/project-context.yaml`

目的：
- 为后续 skill 提供 machine-readable 的项目事实。

建议内容：
- repo 类型或 workspace 模式
- 主要模块
- guarded path
- conventions 入口
- 组件系统和推荐 abstraction
- 当前生效 guidance 入口
- uncertainty 或缺失信息

说明：
- 字段名保持 machine-readable schema 约定。
- `description`、解释性注释和 uncertainty 说明默认使用简体中文。

## `refresh` / `no-op` 输出

目的：
- 让静默刷新可审计。

至少包含：
- `trigger_evidence`
- `affected_artifacts`
- `unchanged_artifacts`
- `uncertainty`（若存在）

补充规则：
- 解释触发原因、影响面和 no-op 原因时，默认使用简体中文。
