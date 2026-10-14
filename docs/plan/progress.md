# 进度

## Ticket 状态

状态：⬜ 未开始 · 🟡 进行中 · ✅ 完成 · ⛔ 阻塞

| ID | 标题 | 里程碑 | 状态 | 完成日期 | 备注 |
|---|---|---|---|---|---|
| T00 | 建仓库并核验未决问题 | M0 | ✅ | 2026-10-14 | Q1–Q4、Q9 已写结论；独立审查可合入；完整 LLM 回合留 T09 |
| T01 | 插件骨架 | M1 | ✅ | 2026-10-14 | 六技能隔离安装与发现验收通过；独立审查待定 |
| T02 | 合同 schema v2 | M1 | ✅ | 2026-10-14 | 标准 JSON Schema 小子集；58 个 v1 业务路径、163 个项目示例路径验收通过；独立审查待定 |
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
| 2026-10-14 | T02 / 协调裁定 | v1 `version` 与新 `schema_version` 并存时的语义，旧参考混合规则元数据，以及 agents 日志审计字段尚未明确。 | 根合同保留 `version:1` 兼容标记，`schema_version:2` 为格式权威；旧 `fields/description/allowed_values` 不算业务字段，`role/value` 保持原形。日志最小可选审计字段为 `models_checked_at/agent_fields_checked_at/source_urls`；agents 真正 no-op 零写入。 | 按协调明确技术裁定执行；说明写入 `schemas/MIGRATIONS.md`。 |

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
- 独立审查：`review_t00` 结论“可合入，无必须修改项”；重跑五题结论、CLI 版本/选项、`git diff --check`、Hard stops 检查通过。临时探针已清理，未二次复现；本轮官方打包页面返回 403，审查未把它当作实测证据。实现提交 `572b033`。

每个会话结束时追加一条，供下一个会话接手：

### 2026-10-14 T01 插件骨架
- 做了什么：新增兼容 Codex manifest、本地官方 metadata 格式 marketplace、六个仅含 frontmatter 和一句话的占位技能、lab 说明与开发中 CHANGELOG；README 加入本地安装步骤和明确的占位状态，gitignore 忽略本地实施证据目录。
- 产出文件：`.codex-plugin/plugin.json`、`.agents/plugins/marketplace.json`、`skills/vic-{bootstrap,agents,check,learn,prune,router}/SKILL.md`、`lab/README.md`、`.gitignore`、`README.md`、`CHANGELOG.md`、本进度文件。
- 验证方法：通过 Python 子进程 env 指定临时 `CODEX_HOME`；实际执行 `rtk proxy codex plugin marketplace add <repo> --json`、`plugin add vic-harness@vic-harness-local --json`、`plugin list --marketplace vic-harness-local --json`，再启动 `rtk proxy codex app-server --stdio`，initialize 后请求 `skills/list`（临时空工作区，forceReload=true）。没有读取/复制凭据或修改全局配置；安装测试最后卸载并清理。
- 原始关键输出（仅省去机器路径；六技能字段直接取自 API 响应）：

```text
COMMAND=codex plugin marketplace add <repo> --json
EXIT=0
"marketplaceName": "vic-harness-local"
COMMAND=codex plugin add vic-harness@vic-harness-local --json
EXIT=0
"pluginId": "vic-harness@vic-harness-local"
"version": "0.1.0"
COMMAND=codex plugin list --marketplace vic-harness-local --json
EXIT=0
"installed": true
"enabled": true
ERRORS=[]
{"name": "vic-harness:vic-agents", "enabled": true, "pluginId": "vic-harness@vic-harness-local"}
{"name": "vic-harness:vic-bootstrap", "enabled": true, "pluginId": "vic-harness@vic-harness-local"}
{"name": "vic-harness:vic-check", "enabled": true, "pluginId": "vic-harness@vic-harness-local"}
{"name": "vic-harness:vic-learn", "enabled": true, "pluginId": "vic-harness@vic-harness-local"}
{"name": "vic-harness:vic-prune", "enabled": true, "pluginId": "vic-harness@vic-harness-local"}
{"name": "vic-harness:vic-router", "enabled": true, "pluginId": "vic-harness@vic-harness-local"}
SKILL_COUNT=6
T01_DISCOVERY_PASS=true
COMMAND=codex plugin remove vic-harness@vic-harness-local --json
EXIT=0
APP_SERVER_EXITED=true
TEMP_ROOT_EXISTS=false
skills/vic-agents/SKILL.md: lines=6, body_lines=1
skills/vic-bootstrap/SKILL.md: lines=6, body_lines=1
skills/vic-check/SKILL.md: lines=6, body_lines=1
skills/vic-learn/SKILL.md: lines=6, body_lines=1
skills/vic-prune/SKILL.md: lines=6, body_lines=1
skills/vic-router/SKILL.md: lines=6, body_lines=1
T01_STATIC_PASS=true
```

- 其他验证：Python 断言两份 JSON 可解析、skills 字符串、无 hooks 引用、六个正文各一句话且总行数 ≤150、插件产出无软链/用户绝对路径；`rtk git diff --check` exit 0，无输出。
- 未完成 / 遗留：技能业务行为尚未实现，正式 `agents/openai.yaml` 调用策略按简报留给后续技能任务；占位 frontmatter 和正文先声明四个写入型技能仅供用户明确调用。没有执行 LLM 回合，未声称隐式策略或技能功能已完成。
- 给下个会话的提示：T02 可开始 schema；继续使用 `skills: "./skills/"`、local source `{"source":"local","path":"./"}`。M1 不引用未来 hook；显式名称优先使用 `$vic-harness:vic-bootstrap`。
- 独立审查：`review_t01` 结论“可合入，无必须修改项”；重新隔离安装并发现六个技能，JSON/占位结构/变更范围/`git diff --check` 全部通过，临时目录与进程已清理。实现提交 `e2d21d7`。

### 2026-10-14 T02 合同 schema v2
- 做了什么：将规则与示例分离；以 YAML 表达标准 JSON Schema 2020-12 的明确小子集。根/子合同使用各自关闭未知字段的分支，canonical 保留 v1 对象与字段；关键事实 M1 要求 ID、evidence/confidence，M2 完整来源可选。定义按 skill 分支的 refresh-log，agents 只记录非空文件变更和可选日期/URL 审计，不接受单次判断与 no-op 日志。
- 产出文件：`schemas/project-context.schema.yaml`、`schemas/project-context.example.yaml`、`schemas/refresh-log.schema.yaml`、`schemas/MIGRATIONS.md`、本进度文件；本地实施报告和验证脚本在忽略的 `.superpowers/sdd/07-roadmap/`。
- 验证工具：系统 Python 和 bundled runtime 均缺少 YAML/JSON Schema 库；在忽略的临时 venv 安装 `PyYAML==6.0.3`、`jsonschema==4.25.1`，仅开发验收，不新增 npm 或插件运行时依赖。
- 可复跑命令：`rtk proxy .superpowers/sdd/07-roadmap/t02-venv/bin/python .superpowers/sdd/07-roadmap/t02-verify.py`（exit 0）；两份 schema 实际通过 `Draft202012Validator.check_schema`；`yaml.load_all` 读取两份示例并分别验证；从 v1 原件剥离文档元数据后逐个比较同名业务字段路径；递归解析 `$ref/anyOf/properties/items` 审计全部可实例化属性。迁移文档的四技能日志示例亦实际加载、验证与覆盖审计。
- 原始关键输出：

```text
SCHEMA_VALID=project-context
SCHEMA_VALID=refresh-log
SCHEMA_KEYWORDS=$defs,$ref,$schema,additionalProperties,anyOf,const,description,enum,items,minItems,minLength,minimum,pattern,properties,required,title,type
YAML_LOAD_ALL_DOCUMENT_1=PASS
YAML_LOAD_ALL_DOCUMENT_2=PASS
V1_BUSINESS_PATHS=58
V1_SCHEMA_MISSING=[]
V1_EXAMPLE_MISSING=[]
PROJECT_SCHEMA_PROPERTY_PATHS=163
PROJECT_EXAMPLE_MISSING=[]
EXAMPLE_IDS_UNIQUE=6
LOG_SCHEMA_PROPERTY_PATHS=16
LOG_EXAMPLE_MISSING=[]
EXAMPLE_COMPAT_VALUES_CONSISTENT=true
ABSENT_POINTER_SEMANTICS=PASS
HARD_STOPS=PASS
TOOLS=PyYAML-6.0.3,jsonschema-4.25.1
POSITIVE_CASES=8
NEGATIVE_CASES=26
T02_SCHEMA_AUDIT=PASS
```

- 正向覆盖：M1 根/子移除所有 M2 字段、scalar 状态兼容输入、无 agent_index、command/command_hint 各自单独输入、四技能日志、空日志；反向覆盖：版本/对象形状/状态枚举、空 evidence、confidence 与 ID 前缀、缺旧 abstraction path、缺命令/别名、运行判断、子合同越界/错误 parent、入口链路类型，以及 agents 无文件变更/no-op/深度字段、日志 URL/skill/mode/timestamp/commit。
- 其他验证：`rtk git diff --check` 与 `rtk git diff --cached --check` 均 exit 0；四份 schemas 无软链和用户绝对路径。
- 未完成 / 遗留：T03 的 vic-check 尚未实现，未声称已跑产品检查器或示例路径存在。跨文件 ID 唯一、根/子事实不重复、命令别名/导航 kind 一致、日期日历有效性等须语义检查；本次只实际审计示例 ID 和兼容值，schema 的边界已明示。M2 来源与漂移规则留 T10。
- 给下个会话的提示：真实合同每文件一个 YAML 文档；完整教学 example 第一份根、第二份子，使用 `loadAll`。所有 `$ref` 是本文件引用，只需上述小子集；`version:1` 是兼容标记。C02 识别 absent/optional/detected 状态，根/子 ID 全集合查重；fixture 要建立示例文件，不能对插件根强测虚构路径存在。临时验证脚本和完整原始输出保留供独立审查。
- 独立审查：`review_t02` 结论“可合入，无必须修改项”；重跑完整验收并补充独立探针，v1 字段覆盖、所有示例属性覆盖、M1/M2 必填边界、根/子隔离、agents no-op 日志约束、范围和差异检查均通过。实现提交 `c37b00b`。跨文件语义仍待 T03 产品实现。

```
### <日期> <ticket ID> <模型>
- 做了什么：
- 产出文件：
- 验证命令与关键输出：
- 未完成 / 遗留：
- 给下个会话的提示：
```
