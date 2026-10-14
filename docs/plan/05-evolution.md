# 05 · 进化机制

vic-harness 的进化分两层：**项目级**（每个仓库自己的合同和配置）和**插件级**（vic-harness 本身）。

```
┌─────────────────────────── 项目级 ───────────────────────────┐
│ 回路 A 事实同步   git diff 命中 watch_paths → $vic-bootstrap 刷新 │
│ 回路 B 行为学习   失误 / retro → $vic-learn → 合同、检查、闸门、角色 │
│ 回路 C 剪枝       定期或换模型后 → $vic-prune → probation → retired │
│ 回路 D 配置保鲜   模型或字段过期 → $vic-agents 重新核验官方文档        │
└────────────────────────────┬─────────────────────────────────┘
                             │ incidents 标记 generalizable: yes/maybe
                             ▼
┌─────────────────────────── 插件级 ───────────────────────────┐
│ 晋升：跨仓库反复出现的教训 → 检查规则 / 模板默认值 / skill 规则 → 发版 │
│ 降级：换模型后消融测试无退化 → 从插件中移除 → 发版                   │
│ 保鲜：model-policy、agents-fields 核验日期超过 45 天 → CI 提醒      │
└──────────────────────────────────────────────────────────────┘
```

## 1. Incident 模板（`templates/incident.md`）

```markdown
---
id: INC-2026-10-13-01
status: open                 # open | resolved | wontfix
date: 2026-10-13
model: gpt-6.1-sol           # 出错时的模型（如可知）
skill_or_flow: implement     # 出错时在用的 skill 或流程
attribution: null            # 由 vic-learn 填：guide | sensor | gate | tool | judgment | agent-role | no-action
generalizable: maybe         # yes | maybe | no
resolution: null             # 解决后链接到改动（文件或 commit）
---
## 发生了什么
agent 在新页面里直接用了 antd 的 Button，没有用 @acme/ui 的 AcmeButton。

## 我怎么纠正的
提示它改用 AcmeButton。

## 期望
以后在 apps/web 下写 UI 时默认使用 @acme/ui。
```

写 incident 的门槛要低：三五行就够。这是全部进化的原料。

## 2. 什么时候触发每条回路

| 回路 | 触发 | 频率建议 |
|---|---|---|
| A 事实同步 | SessionStart hook 提示过期；或手动 | 随时 |
| B 行为学习 | 每次人工纠正 agent 后记录；每周集中处理一次 | 记录随时，处理每周 |
| C 剪枝 | 每月一次；换模型后必做 | 每月 |
| D 配置保鲜 | 换模型、Codex 大版本升级、`model-policy` 超过 45 天 | 按事件 |

## 3. 插件级晋升标准（写进 `PROMOTION.md`）

一条教训要从"某个仓库的规则"晋升为"vic-harness 的默认行为"，必须同时满足：

1. **跨仓库复现**：在 ≥2 个不同仓库的 incidents 里出现；或只出现 1 次，但后果严重且显然通用。
2. **能脱离具体项目表述**：不依赖某个项目的命名、路径或技术栈。
3. **优先最确定的形式**：检查规则 > 模板默认值 > skill 里的文字规则。
4. **有评测证明**：新增一个 fixture 或评测问题，证明加入后成绩更好或至少不变。
5. **走 PR**：CHANGELOG 记录来源（哪些仓库的哪些 incident）。

**收集候选**：`scripts/collect-candidates.mjs <repo1> <repo2> ...` 扫描各仓库 `docs/harness/incidents/` 中 `generalizable: yes|maybe` 的条目，按归因和关键词聚类，输出到插件仓库的 `docs/harness/promotion-candidates.md`。这一步是确定性的，聚类只做简单的关键词分组，判断由人来做。

## 4. 降级与退役

- 插件里的每条规则、模板默认值都在 CHANGELOG 里有来源记录。
- 每次换主力模型后，对插件级规则做一次消融：逐条关掉，跑 evals 全量。成绩不降的规则进入 probation；下一个版本仍不降，就删除。
- 项目级的条目由 vic-prune 按同样逻辑处理。

## 5. 版本记录

- 插件遵循 semver。合同 schema 的不兼容变更 = 插件大版本升级。
- 每次发版必须升 `plugin.json` 的 `version`（Codex 安装缓存按版本区分，不升版本用户就收不到更新）。
- refresh-log 记录 `plugin_version`，所以可以回答"这个仓库的合同是哪个版本的插件生成的"。
- 评测结果按版本存入 `evals/metrics.csv`，用来比较各版本的效果。
