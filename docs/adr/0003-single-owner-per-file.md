# ADR-0003 每个文件只有一个所有者；事实与判断分离

- 状态：已采纳
- 日期：2026-10-13

## 背景
vic-bootstrap、vic-agents、Matt 的 setup / retro / domain-modeling、Understand-Anything 都会往仓库写文件。没有规则时，bootstrap 的"去重纠偏"会误删 Matt 写入的 `## Agent skills` 段，或把 `docs/agents/` 当成 legacy 层改写；`conventions.md` 和 `CODING_STANDARDS.md` 会变成两份互相矛盾的规范。

## 决策
- 每个文件（或文件中的指定段落）只有一个所有者，见 01-architecture.md §3 的所有权表。其他方只能读，或在明确允许的范围内追加。
- `docs/conventions.md` 只放能从仓库证实的**事实**（命令、gate、guarded path）；需要人判断的**规范**放 `CODING_STANDARDS.md`，由用户经 Matt retro 或 vic-learn 提议后批准写入。
- 合同的 `foreign_sections` 记录外部段落，vic-check 校验它们存在。

## 后果
新增任何会写文件的 skill 时，必须先更新所有权表。
