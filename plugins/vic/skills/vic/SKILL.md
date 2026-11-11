---
name: vic
description: Vic 工程 harness 的接线规则：在 mattpocock-skills 的工作流（实现、诊断、评审、规划）中，何时查询 understand-anything 的代码知识图谱。开始任何代码调查、实现、调试、评审或规划前使用。
---

# Vic 接线规则

两个上游各管一层，vic 只负责把它们接起来：

- **mattpocock-skills**：怎么做事。grilling → spec → tickets → implement/tdd → code-review → retro。
- **understand-anything（UA）**：代码是什么。知识图谱位于 `.ua/knowledge-graph.json`，旧版仓库可能是 `.understand-anything/`。

调用前缀因 runtime 而异：Claude Code 用 `/`，Codex 用 `$`。下文统一写作 `/插件:skill`。

## 第 0 步：确认图谱状态

在一个仓库里开始工作前，先检查图谱：

1. 图谱文件不存在：告诉用户，先运行 `/understand-anything:understand` 生成基线。如果用户说要跳过，就按普通方式调查代码，不再反复提醒。
2. 图谱存在：之后需要定位代码时，先查图谱，再用 `rg` 或读文件核对。图谱是导航，不是证据，引用结论前要回到源码确认。
3. 图谱落后于当前 commit：在 Claude Code 中，UA 自带的 SessionStart hook 会处理；在 Codex 中，提醒用户运行 `/understand-anything:understand` 做增量更新。

## 接线表

| 场景 | Matt 侧入口 | 先接入的 UA 能力 | 用途 |
|---|---|---|---|
| 首次接入仓库 | `/mattpocock-skills:setup-matt-pocock-skills` | `/understand-anything:understand` | 两者都运行一次：前者配置 tracker 与文档布局，后者生成图谱 |
| 讨论需求、术语 | `/mattpocock-skills:grill-with-docs` | `/understand-anything:understand-domain` | 用代码里真实存在的领域概念校对 `GLOSSARY.md` 的术语，指出不一致 |
| 写 spec、拆 ticket | `/mattpocock-skills:to-spec`、`to-tickets` | `/understand-anything:understand-chat` | 确认 spec 涉及的模块、入口和依赖，写进 ticket |
| 实现 ticket | `/mattpocock-skills:implement`、`tdd` | `/understand-anything:understand-explain` | 动手前定位要改的文件、调用方和已有测试 |
| 诊断 bug | `/mattpocock-skills:diagnosing-bugs` | `/understand-anything:understand-chat`、`understand-explain` | 缩小可疑范围；反馈回路仍由 diagnosing-bugs 建立 |
| 评审与 PR | `/mattpocock-skills:code-review`、`pr` | `/understand-anything:understand-diff` | 补充改动的影响面和风险，作为评审输入 |
| 架构改进 | `/mattpocock-skills:improve-codebase-architecture` | `/understand-anything:understand` 生成的分层与依赖 | 用图谱找耦合热点，再用 codebase-design 的词汇讨论 |
| 新成员上手 | `/mattpocock-skills:ask-matt` | `/understand-anything:understand-onboard` | 前者讲工作流，后者讲代码 |
| 复盘 | `/mattpocock-skills:retro` | — | 与接线有关的结论（某一步该查图谱却没查等）交给 vic-sync |

## 规则

- Matt 的不少 skill 只能由用户手动调用。遇到这类 skill 时，告诉用户该运行哪一个，不要假装已经执行。
- UA 的 skill 可以由模型直接调用。查询图谱属于只读操作，不需要先征得同意；生成或重建图谱会调用 LLM、产生成本，先告诉用户再运行。
- 某一层不可用（插件没装、图谱缺失）时，安静降级，按原有方式继续，并在结尾说明少了哪一层。
- 图谱结论和源码不一致时，以源码为准，并提醒用户图谱可能需要更新。
- 发现这张表缺失的场景，或者某条接线在实际使用中不好用，把它记下来，交给 `/vic:vic-sync` 在下一个周期处理，不要当场改这份文件。
