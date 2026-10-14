# 进度

## Ticket 状态

状态：⬜ 未开始 · 🟡 进行中 · ✅ 完成 · ⛔ 阻塞

| ID | 标题 | 里程碑 | 状态 | 完成日期 | 备注 |
|---|---|---|---|---|---|
| T00 | 建仓库并核验未决问题 | M0 | ✅ | 2026-10-14 | Q1–Q4、Q9 已写结论；独立审查可合入；完整 LLM 回合留 T09 |
| T01 | 插件骨架 | M1 | ✅ | 2026-10-14 | 六技能隔离安装与发现验收通过；独立审查待定 |
| T02 | 合同 schema v2 | M1 | ✅ | 2026-10-14 | 标准 JSON Schema 小子集；58 个 v1 业务路径、163 个项目示例路径验收通过；独立审查待定 |
| T03 | vic-check：解析与合同规则 | M1 | ✅ | 2026-10-14 | 六条规则与 CLI；R1 应用文档漏扫已修；Node 18/当前 Node 23 tests 通过，示例 0 error，1455 文件 103.34ms；待独立复审 |
| T04 | 评测 fixtures f1–f4 与断言器 | M1 | ✅ | 2026-10-14 | 四夹具与两基线断言器；R1 特殊文件名漏报已修；Node 18/当前 Node 51 项通过；独立复审可合入 |
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
| 2026-10-14 | 协调 / T03–T05 | 固定要求 `docs/component-contract.md` 会妨碍复用已存在的等价组件文档或 app-local 入口。 | 每份合同通过既有 `component_contract.sources[].{kind: component-contract, path: ...}` 显式指定组件文档；有指针不强制默认同名文件。无指针时根用默认路径，子应用用根 `apps[].docs` 下的默认文件；不按标题猜测入口。 | 复用既有 schema 字段，T05 生成与 C09 读取一致。 |
| 2026-10-14 | 规划审查 / T06–T07 | T06 要运行 `--agents`，该能力到 T07 才实现。 | T03 完成后先做 T07，再做 T06；不改变依赖图。 | 拓扑有效的实现顺序调整。 |
| 2026-10-14 | 协调 / T00 | 路线图要求 GitHub 仓库，HANDOFF 把远端创建列为可选。 | 使用现有规划目录作为本地仓库，分支 `feat/vic-harness`，基线 `a9e0e08`；远端创建与发布单独记录。 | 按 HANDOFF 的可选项处理。 |
| 2026-10-14 | 规划审查 / T11–T12 | ADR-0006 的 agents 每次日志与 f5 真正零写冲突。 | `vic-agents` 真正 no-op 不追加日志、不创建 contracts；有配置变更才按允许字段记录。其他 skill 的日志规则不受此例外影响。 | 用户明确选择“真正零改动：no-op 不写日志”，作为本次实现与验收的最高优先级依据。 |
| 2026-10-14 | T02 / 协调裁定 | v1 `version` 与新 `schema_version` 并存时的语义，旧参考混合规则元数据，以及 agents 日志审计字段尚未明确。 | 根合同保留 `version:1` 兼容标记，`schema_version:2` 为格式权威；旧 `fields/description/allowed_values` 不算业务字段，`role/value` 保持原形。日志最小可选审计字段为 `models_checked_at/agent_fields_checked_at/source_urls`；agents 真正 no-op 零写入。 | 按协调明确技术裁定执行；说明写入 `schemas/MIGRATIONS.md`。 |

## 本轮执行约定

- 协调会话不连续承担实现 ticket；每个 ticket 使用全新上下文子代理，并由独立上下文重新运行验收。
- 每个 ticket 独立提交；实现证据、审查结论、实际运行证据分别记录。
- M1 完成后仍须检查 L2 三次运行门槛和真实仓库试用；M2 的 2–4 周使用门槛不能用一次测试代替。
- 测试和检查器验收以各 ticket 留存的实际运行证据为准；不能将占位骨架、未执行的 LLM 回合或其他任务的报告冒充本票验收。

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

### 2026-10-14 T04 评测 fixtures f1–f4 与断言器
- 做了什么：建立四个配置齐全的小型合成仓库和 M1 expected、L3 题库；新增 snapshot/check 断言器及可复跑的确定性验收入口。f3 的 300 行旧导航与外部文件全部自行编写，不复制第三方 skill 文本。所有 expected 的 `git_diff_only: []`，不提前要求来源字段、watch_paths、refresh-log 或 integrations。
- 产出文件：`evals/assert.mjs`、`evals/verify-fixtures.mjs`、`evals/fixtures/f1-single-app/`、`f2-monorepo/`、`f3-legacy-layers/`、`f4-empty/`（各含 repo、expected.yaml、questions.yaml），共 62 个 evals 文件；本进度文件。完整报告保存在忽略的 `.superpowers/sdd/07-roadmap/T04-report.md`。
- 断言接口：`snapshot --root <repo> --expected <yaml> --out <snapshot.json>` 仅向目标根外写快照；`check --root <repo> --expected <yaml> --before <before.json> --phase first --json` 验证首轮并明确 `idempotent` 待验；第一次完成后保存 `first` 快照，第二次用 `check ... --before <before.json> --first <first.json> --phase final --json` 完成幂等验收。before 只用于外部内容保留，first 用于第二次真实文件树比较；缺少 first 或复用同一基线文件以 exit 2 拒绝。
- 验证命令与关键输出：`rtk proxy node evals/verify-fixtures.mjs` → exit 0，`T04_VERIFIED=33`；复用 T03 已核验的官方 Node 18.20.8 运行同一入口 → exit 0，`T04_VERIFIED=33`。四份手写理想产物都实际运行 `vic-check --all --json --root`，`summary.error=0`；随后保持第一次文件树并运行 final 检查，四份均通过。`rtk proxy node --test` 在 T03 当前工作树上 → tests 19 / pass 19 / fail 0，夹具没有被自动发现为业务测试。两个 mjs 的 `node --check` exit 0；静态检查：files=62、json=11、yaml=9、f3_lines=300、symlinks=0、user_absolute_paths=0、autodiscovered_business_tests=0。
- 原始验收输出摘要：

```text
通过 f1-single-app:手写理想产物+真实vic-check
通过 f2-monorepo:手写理想产物+真实vic-check
通过 f3-legacy-layers:手写理想产物+真实vic-check
通过 f4-empty:手写理想产物+真实vic-check
通过 idempotent:新增未跟踪和忽略文件+目录
通过 idempotent:删除第一次生成的未跟踪产物
通过 idempotent:文件权限改动
通过 snapshot:拒绝树内输出
通过 snapshot:不跟随仓库外目录软链
通过 baseline:不能以运行前树代替第一次生成后的树
T04_VERIFIED=33
```

- 反向覆盖：行数超限、推荐 import 错误、坏 YAML/真实 checker error、外部文件变化、代码块内文字变化、CRLF 变化、重复外部标题、清空 uncertainty、虚构组件库、根/子重复 guarded fact、误生成平行层、直接/深层 docs 的虚构文本。文件树扫描包含未跟踪/忽略文件、目录、字节摘要与权限，仅排除根 `.git`；软链只记录目标，不跟随；输出路径经真实父目录解析防止软链污染根。失败项含具体 id、路径、expected/actual。
- 未完成 / 遗留：手写理想产物只验证夹具和断言器；未执行真实 skill 或 LLM 评测，不证明 bootstrap 行为、L2 三次稳定性或 L3 答对率。真实 checker 来自并行 T03 实现的当前工作树，T03 自身仍须独立提交与审查；T04 不修改 scripts/tests。questions.yaml 留 T16 消费。
- 给下个会话的提示：T05 在四夹具上实际调用 bootstrap；T09 按唯一前缀解析 f1 等短名，before/first 快照必须放在目标 repo 外，只有 final 通过才算完整 L2。M1 第二次不能写 refresh-log。`verify-fixtures.mjs` 可独立复跑、自动清理临时目录，不调用 LLM、不安装或运行业务依赖。
- 独立审查：待定。

### 2026-10-14 T03 vic-check：解析与合同规则
- 做了什么：新增只读、不联网的 Node 检查器，实现 C01–C04/C06/C09；schema 执行实际 17 关键词子集，跨根/子合同 ID 查重、导航 kind/命令兼容一致性；C02 检查路径/目录、证据行号、缺失指针豁免和仓库/软链边界。C04 相对所在 Markdown 解析链接并隔离代码示例；C09 支持正式等价文档指针裁定。
- 产出文件：`scripts/vic-check.mjs`、`scripts/lib/{checker,schema,yaml,contracts,paths,markdown,documents,components}.mjs`、`scripts/vendor/{js-yaml.mjs,js-yaml.LICENSE.txt,README.md}`、`tests/{cli,contracts,documents,example}.test.mjs`、`tests/support/fixtures.mjs`、本进度文件。ignored `T03-report.md` 与原始输出在 `.superpowers/sdd/07-roadmap/`。
- parser 来源：js-yaml 5.4.3 官方 npm 发行与 nodeca/js-yaml，单文件 ESM 无静态 import；保留原 MIT banner 和完整许可证。官方 tarball 的 SHA512 integrity 一致，ESM SHA256=`2ed2785988d4737fa33bcf4330be3a7b88d0da7b1fd534e9811cc48313ba0f6e`；上游 package 没有 engines 声明，因此采用实际 Node 18.20.8 验证，不凭版本推断。解析使用 JSON_SCHEMA 保持日期为字符串，读取层拒绝循环 alias。
- CLI：默认 `--all` 与 `--contract` 跑当前合同规则；JSON 唯一对象含 `summary.error/warn`，与 quiet 同时出现时 JSON 优先；quiet 成功为空、有问题一行；未初始化普通输出“未初始化”、quiet 为空、exit 0。规则 error exit 1，自身/参数错误 exit 2；strict 对旧 command_hint 报 C01 error 迁移提示，行号/行数 warning 不升级。`--agents`、`--drift` 尚未实现，明确 exit 2，分别留 T07/T10。
- 先失败后通过：未实现 CLI 为 MODULE_NOT_FOUND；非法 schema_version、跨合同 ID/别名、路径/行号、行数/链接、用户绝对路径/组件质量门，以及非默认子合同/仓库外目录软链均先观察到失败，再逐项实现通过。测试只通过公共 CLI 观察行为，夹具在临时目录内生成，不依赖 evals。
- 验证命令与原始关键输出：`rtk proxy node --test`（Node 25.8.1）→ tests 20 / pass 20 / fail 0 / duration_ms 1358.4375；复用已核验官方 Node 18.20.8 执行相同 `--test` → tests 20 / pass 20 / fail 0 / duration_ms 1496.667208。六条规则均至少一通过和一失败；真实合同拒绝多文档、重复 key、自定义 tag、循环 alias 和坏 YAML；JSON/quiet/strict/全部退出码均覆盖。
- 示例验证：example 用 loadAll 读出两份文档，分别落为根与子真实合同，并搭建全部文件/目录/证据/组件文档引用。`example.test.mjs` 实际输出对应 status=0、summary.error=0、summary.warn=0，测试通过。
- 性能与只读证据：Node 18.20.8 对含 250 文档、1200 源码及合同/配置等的 1454 文件初始化仓库执行完整 CLI；夹具准备不计时，CLI 启动计入。原始输出 `{"node":"v18.20.8","files":1454,"elapsed_ms":97.09,"exit":0,"summary":{"error":0,"warn":0},"unchanged":true}`；检查前后目录清单与逐文件 SHA256 完全相同，临时目标已清理。
- 其他验证：`rtk git diff --check` 与暂存后的 `rtk git diff --cached --check` 均 exit 0；暂存统计仅 18 个本票文件（scripts/tests/progress）。产出无软链/用户绝对路径/新增 npm 运行时依赖。Node18 官方归档 SHA256 对照 SHASUMS256 通过，临时二进制和 ignored 来源记录保留供 T04/T07/独立审查复用，由协调者最终清理。
- 未完成 / 遗留：A 规则、C05/C07+、漂移和日志一致性尚未实现；Markdown 扫描不校验文件内部 fragment 标题；glob 覆盖当前 schema/example 的 `*`、`?`、`**`。真实日历和命令执行证明按 T02 边界不提前补。没有执行 LLM 回合或真实业务 skill，未声称其验收通过。
- 给下个会话的提示：T07 复用 checker 编排/报告结构，补 TOML parser 与 `--agents`；T05 使用明确 `kind: component-contract` 复用等价文档，或按默认路径生成，所有路径相对仓库根。M1 checker 只对已实现规则报告，不以未实现能力假成功。
- 独立审查：待协调会话派发；提交基线 `c38694a`，本票只暂存 scripts/tests/progress，不修改 evals。

```
### <日期> <ticket ID> <模型>
- 做了什么：
- 产出文件：
- 验证命令与关键输出：
- 未完成 / 遗留：
- 给下个会话的提示：
```

### 2026-10-14 T04 独立审查 R1 修复
- 做了什么：修复完整文件树快照遗漏根级 `__proto__` 的问题；写入使用无原型 entries，读取快照后亦移除 entries 原型。仅修改 `evals/assert.mjs`、`evals/verify-fixtures.mjs` 与本进度文件，未改 T03 或其他票。
- 先复现：新增特殊文件名回归后运行 `rtk proxy node evals/verify-fixtures.mjs` → exit 1；新增 `__proto__` 时 checker 错误 exit 0、pass=true、tree_changes 全空。
- 修复验证：`rtk proxy node evals/verify-fixtures.mjs`（v25.8.1）与 `rtk proxy <T03-node18.txt 的 NODE_PATH> evals/verify-fixtures.mjs`（v18.20.8）均 exit 0、`T04_VERIFIED=51`。两个 mjs 的 `node --check` 与 `rtk git diff --check` 均 exit 0。
- 新增 18 项回归覆盖 `__proto__`、`constructor`、`toString` 普通文件新增/不变/内容修改/删除，以及 `__proto__` 空目录和断链新增/不变/删除；变化要求 exit 1 且 tree_changes 精确包含目标路径，不变要求 exit 0。原 33 项均复跑通过。
- 交接：独立审查原结论需修改，仅 R1 必修；本次修复已确定性验证，待独立限定范围复审。仍未执行真实 skill/LLM；详细红绿输出见 ignored T04-report.md。
- 独立复审：`review_t04` 结论“R1 已解决，可合入”，限定修复差异没有新必须修改项。实际复跑当前 Node 与 Node 18 均 `T04_VERIFIED=51`；原始独立 `__proto__` 新增探针现在 exit 1，变化列表包含该文件；差异检查通过。实现 `c38694a`，修复 `9a70705`，完整复审报告 `T04-review-r1.md`。

### 2026-10-14 T03 独立审查 R1 修复
- 审查必修：根合同 `apps[].docs` 声明的应用目录未进入 C04/C06，项目映射文档中的坏链接和用户绝对路径漏报。读取完整 T03-review 后仅修此项；基线 `207f4e9`。
- 产出：`scripts/lib/checker.mjs` 汇总并规范化根合同显式应用文档目录，沿用 Repository 的仓库/真实软链边界；目录与文件分别 Set 去重，纳入 Markdown C04 和全文件 C06 集合。`tests/documents.test.mjs` 补 3 项回归：真实 app-local 项目映射正反例、重叠目录/非 Markdown C06、越界和外部软链不读取。
- 先复现：`rtk proxy node --test tests/documents.test.mjs` → tests 10 / pass 8 / fail 2；坏文档错误退出码实际为 0（预期 1），app-local 非 Markdown C06 数量实际为 0（预期 1）。
- 验证：`rtk proxy node --test` → tests 23 / pass 23 / fail 0 / duration_ms 1616.831667；`rtk proxy <T03-node18.txt 的 NODE_PATH> --test` → tests 23 / pass 23 / fail 0 / duration_ms 1832.788166。完整 example 的根/子文档均 0 error，既有六规则和 CLI 回归全部通过。
- 性能/只读：Node18 临时仓库含 250 份 app-local 文档、1200 源码、根/子合同与组件导航文档共 1455 文件，执行完整 CLI（计入启动，准备不计时）；原始输出 `{"node":"v18.20.8","files":1455,"elapsed_ms":103.34,"exit":0,"summary":{"error":0,"warn":0},"unchanged":true}`。前后全部目录清单与逐文件 SHA256 相同，临时夹具已清理。
- `rtk git diff --check` exit 0。仅本票 scripts/tests/progress 改动；未改 schema/evals/规划/ADR，未启动子代理，未 push/发布。R1 已修，待新上下文独立复审；原报告其他边界与后续票分工保持有效，详见 ignored T03-report.md 追加证据。
