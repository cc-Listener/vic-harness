# 交接手册：怎么让其他模型把 vic-harness 做出来

这份手册写给你（Vic）。它说明怎么分工、按什么顺序推进，以及每一步可以直接复制使用的提示词。

## 0. 总体打法

这套打法本身就是 harness engineering 的实践：

| 角色 | 谁来做 | 职责 |
|---|---|---|
| 产品负责人 / 验收者 | 你 | 回答规划问题、批准方案、在真实仓库上试用、决定是否发版 |
| 实现者 | Codex（一个 ticket 开一个新会话） | 按 ticket 实现并自测 |
| 审查者 | **不同的模型，或至少是一个全新的会话** | 对照验收标准和 ADR 审查改动，不参与实现 |

三条纪律：
1. **一个 ticket 一个会话**。不要让一个会话连续做多个 ticket。每次都从干净的上下文开始，靠 `docs/plan/progress.md` 交接。这和 Anthropic 长时任务 harness 的做法一致：上下文重置 + 结构化交接文件。
2. **生成和评审分开**。实现者自己说"已完成"不算数，要由审查者和评测脚本判定。
3. **吃自己的狗粮**。实现模型反复犯同一种错时，把规则加进本仓库的 AGENTS.md 的 Hard stops，或者在 progress.md 里记录。这就是 vic-learn 要自动化的事。

### 模型分工建议

按你 multi-agent-config 里 2026-10-13 核验的模型快照（使用前请再确认客户端可用性）：

| 工作 | 建议 |
|---|---|
| 实现 ticket（尤其 T05、T06 这类写 skill、需要判断的） | `gpt-6.1-sol`，推理用客户端默认 |
| 规划审查、里程碑验收 | `gpt-6-astra`，`low` 起步 |
| 生成 fixtures 这类机械性工作（T04） | `gpt-6.1-sol` 即可；量大时可以考虑 `gpt-6-luna` |
| 审查 | 换一个不同的模型，比如用另一家的模型或另一个 Codex 模型开新会话 |

---

## 1. 准备（10 分钟）

```bash
mkdir vic-harness && cd vic-harness
unzip ~/Downloads/vic-harness-plan.zip -d .
git init && git add -A && git commit -m "docs: vic-harness 规划包"
gh repo create vic-harness --private --source . --push   # 可选
```

在仓库目录启动 Codex。仓库根目录的 `AGENTS.md` 会自动告诉实现模型怎么读规划、怎么工作。

---

## 2. 第一步：让模型先审查规划

在写任何代码前，先让一个强模型挑规划的毛病。你回答它的问题，再决定要不要改规划。

如果装了 Matt 的 skills，可以直接用 `$grill-with-docs`；否则用下面的提示词：

```text
你是这份插件规划的审查者，不写任何代码。

请完整阅读 AGENTS.md、docs/plan/ 下全部文件、docs/adr/ 下全部文件，以及 reference/v1/ 下两个 v1 skill。

输出：
1. 规划内部的矛盾（文件之间说法不一致、字段名不一致、ticket 依赖顺序有问题）
2. 关键缺口（某个 ticket 的验收标准无法客观判定、某个产出没有规格）
3. 相对 v1 skill 可能丢失的好规则
4. 你认为过度设计、可以推迟或删掉的部分
5. 需要我（Vic）回答的问题，最多 8 个，按影响大小排序

每条都给出具体文件和位置。不要修改任何文件。
```

拿到结果后：你回答问题 → 让模型按你的答复修改规划文件 → 提交一次 commit。

---

## 3. 第二步：T00 核验未决问题

```text
执行 T00：核验 docs/plan/open-questions.md 中的 Q1、Q2、Q3、Q4、Q9。

做法：
1. 先用 $plugin-creator 在临时目录生成一个包含一个 skill 和一个 SessionStart hook 的示例插件，对照它产出的文件格式。
2. 用本地 marketplace 安装这个示例插件，实际验证：skill 能否被看到和调用、hook 是否执行、skill 能否读取插件根目录下 skill 文件夹以外的文件、hook 命令如何引用插件根目录。
3. 查 Codex 官方文档确认；必要时查 openai/codex 源码 codex-rs/core-plugins/src/。

把每个问题的结论、依据（实际运行结果或文档 URL）、核验日期写进 open-questions.md 的"结论"一栏。
不能确认的，写明"未确认，采用默认方案"。
最后删除临时示例插件，更新 progress.md，提交 commit。
```

---

## 4. 第三步：ticket 循环（M1 到 M3 都按这个循环）

### 4.1 实现（新会话）

```text
执行 <Txx>。

先按 AGENTS.md 的读取顺序阅读，然后：
1. 复述 <Txx> 的产出和验收标准，列出你打算新建或修改的文件。
2. 实现。只改 ticket 范围内的文件。
3. 运行验收所需的全部验证命令，贴出关键输出。验收标准中有一条没满足，就继续修，直到满足或确认被阻塞。
4. 更新 docs/plan/progress.md：状态、产出文件、验证结果、会话日志。
5. 提交 commit，信息以 "<Txx>:" 开头。

遇到规划矛盾时，不要改规划文件，记到 progress.md 的"规划问题"，按最保守的理解继续。
```

### 4.2 审查（换模型或新会话）

如果装了 Matt 的 skills，可以用 `$code-review`，把 ticket 的验收标准作为 spec 提供给它。否则：

```text
你是审查者，只读，不修改代码。

审查最近一次以 "<Txx>:" 开头的 commit（git show HEAD 或指定 commit）。

依据：
- docs/plan/07-roadmap.md 中 <Txx> 的验收标准
- AGENTS.md 的 Hard stops
- docs/adr/ 的全部决策
- 与该 ticket 相关的规格文件（见 AGENTS.md 读取顺序第 4 条）

请自己重新运行验收所需的验证命令，不要相信 progress.md 里的结论。

输出：
1. 每条验收标准：通过 / 不通过 / 无法判定，附证据
2. 违反 Hard stops 或 ADR 的地方
3. 超出 ticket 范围的改动
4. 结论：可合入 / 需修改（列出必须修改项）
```

### 4.3 修复

审查结论是"需修改"时，把必须修改项贴回一个**新的**实现会话：

```text
<Txx> 的审查发现以下必须修改项：
<粘贴审查结论>

逐条修复，重新运行验证，更新 progress.md，提交 commit，信息以 "<Txx> fix:" 开头。
```

### 4.4 你的验收

每个 ticket 你只需要看三样东西：
- progress.md 里的验证输出
- 审查结论
- `git diff --stat`，确认改动范围合理

---

## 5. 里程碑验收（v0.1.0 / v0.2.0 / v0.3.0）

```text
对里程碑 <M1> 做发布前验收，只读。

1. 确认 07-roadmap.md 中 <M1> 的全部 ticket 在 progress.md 中为完成。
2. 运行 node --test 和 06-evals.md 规定的该里程碑评测（LLM 评测每个 fixture 重复 3 次）。
3. 对照 00-vision.md 的成功标准逐项判断。
4. 检查 plugin.json 的 version、CHANGELOG 是否已更新。
5. 列出发布阻塞项和可以留到下个版本的问题。

结论给出：可发布 / 不可发布。
```

通过后由你打 tag，然后**在自己的真实仓库上试用**，遇到的问题按 `templates/incident.md` 记录。v0.2 之后就可以用 `$vic-learn` 处理这些记录了。

---

## 6. 常见问题与对策

| 现象 | 对策 |
|---|---|
| 模型擅自改了规划文件 | 回滚这部分改动；在 AGENTS.md 的 Hard stops 里加强措辞 |
| 模型顺手改了 ticket 范围外的文件 | 审查时会报出；要求拆成单独的 ticket |
| progress.md 写"已验证"但其实没跑 | 审查者必须自己重跑；在 AGENTS.md 加一条"验证输出必须贴原文" |
| SKILL.md 越写越长 | vic-check 跑插件自身时会报；要求把细节移到 references |
| 模型凭记忆写 Codex 格式 | 让它以 open-questions.md 的结论为准，没有结论就先核验 |
| 一个 ticket 太大，一个会话做不完 | 让模型在 progress.md 里写清进度和剩余部分，下个会话接着做；必要时把 ticket 拆小 |

## 7. 什么时候可以放手让模型连续做

等 M1 跑顺、审查基本不再发现问题后，可以让 Codex 一次做完一个里程碑：

```text
按顺序执行 M2 的全部 ticket（T10–T16）。
每完成一个 ticket：运行验证、更新 progress.md、提交 commit，然后用一个独立的审查子代理按 HANDOFF.md 4.2 的标准审查该 commit；审查不通过就先修复。
任何 ticket 被阻塞时停下来，写清原因，不要跳过。
```

这时你也可以先用 `$vic-agents`（或 v1 的 multi-agent-config）为 vic-harness 仓库本身配置一个只读的 reviewer 角色。
