# 进度

## Ticket 状态

状态：⬜ 未开始 · 🟡 进行中 · ✅ 完成 · ⛔ 阻塞

| ID | 标题 | 里程碑 | 状态 | 完成日期 | 备注 |
|---|---|---|---|---|---|
| T00 | 建仓库并核验未决问题 | M0 | 🟡 | | Q1–Q4、Q9 已写结论；真实隔离插件探针通过，待独立审查 |
| T01 | 插件骨架 | M1 | ⬜ | | |
| T02 | 合同 schema v2 | M1 | ⬜ | | |
| T03 | vic-check：解析与合同规则 | M1 | ⬜ | | |
| T04 | 评测 fixtures f1–f4 与断言器 | M1 | ⬜ | | |
| T05 | vic-bootstrap v2 | M1 | ⬜ | | |
| T06 | vic-agents v2 | M1 | ⬜ | | |
| T07 | vic-check：代理配置规则 | M1 | ⬜ | | |
| T08 | vic-router 与 vic-check skill 文本 | M1 | ⬜ | | |
| T09 | 评测运行器 | M1 | ⬜ | | |
| — | 🚩 发布 v0.1.0 | M1 | ⬜ | | |
| T10 | 来源字段与过期检测 | M2 | ⬜ | | |
| T11 | refresh-log | M2 | ⬜ | | |
| T12 | vic-agents 的 fixtures 与评测 | M2 | ⬜ | | |
| T13 | vic-learn | M2 | ⬜ | | |
| T14 | 外部集成与所有权 | M2 | ⬜ | | |
| T15 | SessionStart hook | M2 | ⬜ | | |
| T16 | 问答评测 | M2 | ⬜ | | |
| — | 🚩 发布 v0.2.0 | M2 | ⬜ | | |
| T17 | vic-prune | M3 | ⬜ | | |
| T18 | 晋升机制 | M3 | ⬜ | | |
| T19 | marketplace 集成外部插件 | M3 | ⬜ | | |
| T20 | Claude Code 兼容（可选） | M3 | ⬜ | | |
| T21 | 插件自身的保鲜 CI | M3 | ⬜ | | |
| — | 🚩 发布 v0.3.0 | M3 | ⬜ | | |

## 规划问题

实现中发现的规划矛盾或缺口写在这里，由人决定后再改规划文件。

| 日期 | 发现者（ticket） | 问题 | 采取的临时做法 | 人的决定 |
|---|---|---|---|---|
| 2026-10-14 | 规划审查 / T02 | v2 示例省略或改形了 v1 字段，与“保留全部字段、旧消费者可读”的承诺冲突。 | 兼容承诺优先：规范输出保留 `version`、`bootstrap_status.level`、`effective_guidance_kind`、`agent_index`、`preferred_abstractions[].path`；允许读取示例中的 scalar 状态。`agent_index` 只作旧输入兼容，不生成平行层。 | 按最保守理解继续，原规格不改。 |
| 2026-10-14 | 规划审查 / T02–T05 | 来源字段在 schema 中必填，但完整来源能力明确到 M2 才实现。 | M1 schema 不将 M2 字段设为 required；M1 保证 evidence/confidence，M2 通过 C10 检查完整来源。 | 按版本边界继续，原规格不改。 |
| 2026-10-14 | 规划审查 / T03 | C02 的“所有路径存在”与 `present:false`、`detected:false`、`optional:true` 的不存在指针冲突。 | 跳过明确不存在/可选指针；文件与目录都可作为路径，glob 仅在声明支持 glob 的字段使用。 | 按最保守理解继续，原规格不改。 |
| 2026-10-14 | 规划审查 / T06–T07 | T06 要运行 `--agents`，该能力到 T07 才实现。 | T03 完成后先做 T07，再做 T06；不改变依赖图。 | 拓扑有效的实现顺序调整。 |
| 2026-10-14 | 协调 / T00 | 路线图要求 GitHub 仓库，HANDOFF 把远端创建列为可选。 | 使用现有规划目录作为本地仓库，分支 `feat/vic-harness`，基线 `a9e0e08`；远端创建与发布单独记录。 | 按 HANDOFF 的可选项处理。 |
| 2026-10-14 | 规划审查 / T11–T12 | ADR-0006 的 agents 每次日志与 f5 真正零写冲突。 | `vic-agents` 真正 no-op 不追加日志、不创建 contracts；有配置变更才按允许字段记录。其他 skill 的日志规则不受此例外影响。 | 用户明确选择“真正零改动：no-op 不写日志”，作为本次实现与验收的最高优先级依据。 |

## 本轮执行约定

- 协调会话不连续承担实现 ticket；每个 ticket 使用全新上下文子代理，并由独立上下文重新运行验收。
- 每个 ticket 独立提交；实现证据、审查结论、实际运行证据分别记录。
- M1 完成后仍须检查 L2 三次运行门槛和真实仓库试用；M2 的 2–4 周使用门槛不能用一次测试代替。
- `node --test` 尚无实现可测；当前不能宣称任何实现 ticket 通过。

## 迁移勾选

T05、T06 完成时，把 08-v1-migration.md 的勾选结果贴在这里。

## 会话日志

### 2026-10-14 T00 技术核验与规划预检
- 做了什么：建立本地 Git 基线；独立审查完整规划与 v1；核验 CLI 0.162.1 的插件安装、技能发现、显式调用 policy、hook 事件及共享资源机制。
- 产出文件：`docs/plan/open-questions.md`、`docs/plan/progress.md`；基线提交 `a9e0e08`。
- 验证命令与关键输出：`rtk proxy codex --version` → `codex-cli 0.162.1`；隔离 `plugin marketplace add` / `plugin add` → exit 0；`skills/list` → errors=[]、两个数组目录技能 enabled=true；policy true/false → 隐式条目 present=true/false；SessionStart source=startup；共享脚本 → exit 0、`T00_SHARED_OK`；清理 → `TEMP_ROOT_EXISTS=False`。详细命令与官方来源已记录在 open-questions。
- 未完成 / 遗留：无认证隔离环境没有完成 LLM 回合，tokens=null，T09 负责真实 L2；GitHub 远端可选且未创建；未发布。T15 的 fail-open 业务用例尚未实现。
- 给下个会话的提示：T01 用真实骨架重新做隔离 marketplace 安装与六技能发现；采用 skills 字符串，M1 不提前引用尚不存在的 hooks 文件；共享路径从实际 SKILL.md 定位，不能拼接固定缓存路径。

每个会话结束时追加一条，供下一个会话接手：

```
### <日期> <ticket ID> <模型>
- 做了什么：
- 产出文件：
- 验证命令与关键输出：
- 未完成 / 遗留：
- 给下个会话的提示：
```
