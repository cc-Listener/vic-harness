# 刷新策略

只在判断某次仓库变化是否应该触发静默刷新时读取这份 reference。

## 触发刷新

- 顶层 app、package、workspace 或 service 被新增、删除或重命名。
- 共享 UI、design-system、SDK、infra wrapper 或其他可复用 abstraction 层发生实质变化。
- 规则入口发生变化：`CONTRIBUTING.md`、CI 配置、lint 配置、formatter 配置、test 配置、build 配置、release 配置。
- ownership、guarded path 或 release gate 被引入或发生实质变化。
- 现有 contract 文件已经不能准确描述当前仓库布局。

## 通常不刷新

- 现有模块边界内的功能代码改动。
- 不改变 conventions 或 ownership 的小型 bug 修复。
- 仍然沿用现有模式的新测试。
- 与项目规则无关的 README 文案或纯内容修改。

## 补刷新

如果其他 skill 或工作流依赖 `project-context.yaml`，并发现核心字段缺失或过期，即使没有显式结构触发器，也允许进行一次定向补刷新。

## 刷新方式

- 默认使用增量修改。
- 只触碰受影响的部分。
- 现有命名仍然准确时保留它。
- 如果当前 contract 大体可用，只替换过期片段，不要顺手重排所有文件。

## 刷新证据

每次 `refresh` 或 `no-op` 最少记录：

- `trigger_evidence`
- `affected_artifacts`
- `unchanged_artifacts`
- `uncertainty`（若存在）

如果仓库存在 legacy bridge / index 层，只在它们与当前导航层或事实层冲突时才把它们列入 `affected_artifacts`。

## 输出语言

- 人类可读的刷新说明默认使用简体中文。
- 保留英文的内容仅限字段名、文件路径和必要技术术语。
