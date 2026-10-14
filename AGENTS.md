# vic-harness · Agent 指南

这是 Vic 的工程 Harness Codex 插件。当前阶段：**规划已完成，按任务单逐个实现**。

## 读取顺序

1. `docs/plan/progress.md`：当前进度、规划问题、上次会话留下的交接信息
2. `docs/plan/07-roadmap.md`：找到你被分配的 ticket，读它的依赖、产出和验收标准
3. `docs/plan/00-vision.md`、`docs/plan/01-architecture.md`：原则、目录结构、文件所有权
4. 与 ticket 相关的规格：
   - 合同和日志格式 → `docs/plan/02-contract-schema.md`
   - skill 行为 → `docs/plan/03-skills.md`
   - 检查器和 hook → `docs/plan/04-checks-and-hooks.md`
   - 进化机制 → `docs/plan/05-evolution.md`
   - 评测 → `docs/plan/06-evals.md`
   - 迁移 v1 skill → `docs/plan/08-v1-migration.md` 和 `reference/v1/`
5. `docs/adr/`：已做的决策，不要推翻；有异议写进 progress.md
6. `docs/plan/open-questions.md`：Codex 格式细节以这里的"结论"一栏为准

## 工作规则

- 一个会话只做一个 ticket。开始前先复述该 ticket 的验收标准。
- 只改 ticket 产出范围内的文件。顺手发现的问题记进 progress.md，不要顺手修。
- 不要修改 `docs/plan/`、`docs/adr/` 和 `reference/`。发现规划有矛盾或缺口，写进 progress.md 的"规划问题"，然后按最保守的理解继续。
- 完成前必须实际运行验证命令，并在 progress.md 里贴出关键输出。没跑过的不能写"已验证"。
- 完成后：更新 progress.md（状态、产出文件、验证结果、给下个会话的交接说明），然后单独提交一次 commit，提交信息以 ticket ID 开头。

## Hard stops

- 不 fork、不复制 mattpocock/skills 或 Understand-Anything 的代码和 skill 文本
- 不使用软链；`skills/` 下只放要发布的 skill，草稿放 `lab/`
- 不写任何绝对路径（`/Users/...`、`/home/...`、`C:\Users\...`）
- 不添加 npm 运行时依赖；解析器以单文件形式放在 `scripts/vendor/`
- 每个 SKILL.md 正文 ≤ 150 行
- skill 的人类可读输出用简体中文；字段名、路径、模型名、技术术语保留原文
- 不运行 deploy、publish、release、数据库迁移等会写外部系统的命令

## 常用命令（随实现补充）

```bash
node --test                                        # 单元测试
node scripts/vic-check.mjs --all --root <仓库>      # 检查合同和代理配置
evals/run.sh --fixture f1 --skill vic-bootstrap    # 端到端评测
```
