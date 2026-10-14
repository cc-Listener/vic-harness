# ADR-0001 组合外部 skill，不吞并

- 状态：已采纳
- 日期：2026-10-13

## 背景
工作流同时依赖 mattpocock/skills（流程、审查、retro、领域文档）和 Understand-Anything（代码知识图谱）。两者都在快速迭代，Matt 的插件还会自动更新。Codex 插件之间没有依赖解析。

## 决策
- 不 fork、不复制两者的代码或 skill 文本。
- 通过三种方式集成：合同的 `integrations` 字段记录指针；vic-router 路由到它们的 skill；vic-learn 接收 retro 的结论。
- 两者缺失时，vic 的所有 skill 都能安静降级运行。
- 分发上，用自己的 marketplace 一起列出（取决于 open-questions Q5、Q6）。

## 后果
- 好处：上游更新自动可用；职责清晰。
- 代价：需要维护文件所有权表，防止互相覆盖（见 ADR-0003）；上游改了文件约定时要跟进。
