# vic-harness · Agent 指南

vic-harness v2：一个薄的胶水层，把 [mattpocock/skills](https://github.com/mattpocock/skills)（工作流）和 [Understand-Anything](https://github.com/Egonex-AI/Understand-Anything)（代码事实与知识图谱）组合成 Vic 的工程 harness。这一层只负责接线和确定性闸门，不重新实现这两个插件已有的能力。

当前阶段：**从零重新规划。** v1 已整体删除，保留在本地 tag `v1-archive`，只作历史参考，不迁移代码。

## 已定方向（2026-11-11）

- runtime：Claude Code 和 Codex，用同一份 skill 源码适配两种格式
- 事实层：精简的合同，从 UA 图谱确定性地生成；只人工维护图谱给不出的事实（禁区、验证闸门）
- 集成方式：组合，不吞并；不 fork、不复制 Matt 或 UA 的代码和 skill 文本
- Multica 负责任务派发和 Squad 编排，和 harness 互不冲突；harness 只管每个 agent 进入仓库时的环境

## 工作方式

按 Matt 的主流程推进：`/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement`。决策写在 `docs/adr/`，术语写在 `GLOSSARY.md`。
