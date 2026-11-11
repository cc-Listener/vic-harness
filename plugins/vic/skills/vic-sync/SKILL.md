---
name: vic-sync
description: vic-harness 的周期性升级与反思：检查 mattpocock-skills 和 understand-anything 的新版本，判断接线规则是否失效，并结合近期 retro 结论提议更新接线。仅在用户要求升级、同步或周期复盘 vic-harness 时使用。
disable-model-invocation: true
---

# vic-sync：升级与反思

在 vic-harness 仓库根目录运行。目标是给出一份待合并的改动，而不是直接发布。

## 1. 查上游

运行 `node scripts/vic.mjs upstream`，读取输出：

- `upgrade` 为空：上游没有新版本，跳到第 3 步。
- `upgrade` 非空：每一项都是上游 `version` 发生了变化（只改 commit 不算）。`verify` 列出在新版本下接线规则会失效的地方，比如某个被引用的 skill 改名或被删除。

## 2. 读变更，判断影响

对每个要升级的上游：

1. 读它在两个 SHA 之间的 CHANGELOG 或提交记录（`git log <旧>..<新>`，在临时克隆里看）。
2. 按三类列出：
   - **破坏接线**：`verify` 报出的错误，或者语义变了但名字没变的 skill。
   - **新能力**：新增的 skill 可能值得写进接线表。
   - **无关**：其余改动。
3. 有破坏接线的项时，提出 `plugins/vic/skills/vic/SKILL.md` 的修改方案，让 `verify` 在新版本下通过。

确认后运行 `node scripts/vic.mjs upstream --write` 写回新的锁定版本，再运行 `node scripts/vic.mjs check`，直到通过。

## 3. 反思

收集本周期与接线有关的信号：

- 用户提供的或仓库里 `docs/retro/` 下的 `/mattpocock-skills:retro` 结论；
- 用户口述的问题，比如"某一步该查图谱却没查""图谱结论误导了实现"。

逐条判断应该落在哪里：

| 信号类型 | 落点 |
|---|---|
| 接线表缺了场景，或者某条接线没用 | 修改 `plugins/vic/skills/vic/SKILL.md` |
| 可以机械检查的错误 | 给 `scripts/vic.mjs check` 加检查，并补测试 |
| 属于上游 skill 本身的问题 | 不改 vic；整理成给上游的 issue 草稿，交给用户决定是否提交 |
| 只是个人或单个仓库的偏好 | 写进那个仓库自己的 AGENTS.md，不进 vic |

没有真实信号支撑的"可能更好"一律不改。

## 4. 交付

- 改了插件内容时，把 `plugins/vic/.claude-plugin/plugin.json` 的 `version` 加一，否则成员机器不会拉取更新。
- 运行 `node --test` 和 `node scripts/vic.mjs check`，结果都贴进最终回复。
- 最终回复包括：升级了哪些上游（旧版本 → 新版本）、接线改动、按上表分类的反思结论、没处理的项及原因。
- 不要自行 push 或发布。由用户审阅后提交；在 CI 中则由 PR 承载。
