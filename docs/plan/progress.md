# 进度

## Ticket 状态

状态：⬜ 未开始 · 🟡 进行中 · ✅ 完成 · ⛔ 阻塞

| ID | 标题 | 里程碑 | 状态 | 完成日期 | 备注 |
|---|---|---|---|---|---|
| T00 | 建仓库并核验未决问题 | M0 | ✅ | 2026-10-14 | Q1–Q4、Q9 已写结论；独立审查可合入；完整 LLM 回合留 T09 |
| T01 | 插件骨架 | M1 | ✅ | 2026-10-14 | 六技能隔离安装与发现验收通过；独立审查可合入 |
| T02 | 合同 schema v2 | M1 | ✅ | 2026-10-14 | 标准 JSON Schema 小子集；58 个 v1 业务路径、163 个项目示例路径验收通过；独立审查可合入 |
| T03 | vic-check：解析与合同规则 | M1 | 🟡 | 2026-10-14 | 原六条规则与 CLI 已审；真实试用 C09 的 RTK 调用假阴性已修，两 Node 干净树40项通过；等待独立限定复审 |
| T04 | 评测 fixtures f1–f4 与断言器 | M1 | ✅ | 2026-10-14 | 特殊文件名与合法表示误拒绝均已修复；两Node90项及各25独立探针通过；限定复审可合入 |
| T05 | vic-bootstrap v2 | M1 | 🟡 | | 正在真实两轮评测并修正应用边界、定位索引和幂等问题；失败记录保留，尚未最终验收 |
| T06 | vic-agents v2 | M1 | ✅ | 2026-10-14 | 静态迁移与真实试用暴露问题的文本修复均已独立审查通过；80行、24字段/111节点保留，实际行为复测中 |
| T07 | vic-check：代理配置规则 | M1 | ✅ | 2026-10-14 | A01–A07 与 --agents；Node18/当前 Node 38 tests 通过；独立审查可合入 |
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
| 2026-10-14 | T07 / 协调裁定 | ADR-0002 称 smol-toml 为 MIT，但官方稳定版 1.9.1 实际是 BSD-3-Clause。 | 内置官方单文件 bundle，保留真实完整 BSD 版权、条件与免责声明；记录版本、完整性及原 bundle/最终文件 SHA256。 | 按真实许可证执行，ADR 原件不改。 |
| 2026-10-14 | T07 / 协调裁定 | 合法旧注册 config_file 引用的无 name 片段若一律按 standalone 会被误报缺 name/description，引用自身也会被误判重复。 | 被旧注册引用且无 name 的 TOML 按旧片段，不套 A02；有 name 或未注册的 agents 直属 TOML 按 standalone。A05 只报同一角色身份双定义；缺失/越界引用安全报 A01。 | 保留旧注册与无关配置，分类解释覆盖测试与本票记录。 |
| 2026-10-14 | T06 / 协调裁定 | v1 将sandbox_mode称角色默认值，与当前官方角色权限语义冲突；无关历史报错及自定义合同也可能与全库0error目标冲突。 | 按同日研究纠正角色文件不覆盖父会话权限；保留未知schema合同与用户保护角色。零配置收益零写入优先，只修本次相关且已授权问题；无关失败如实报告并路由。 | 沿用用户内容保护与真实no-op决定，不为零错误扩大写入；既有授权持续有效。 |
| 2026-10-14 | M1 真实试用 / T06 | 隔离真实回合报告配置写入受沙箱阻止，同时出现核心引用读取和运行时可用性证据缺口；文件未变不足以证明主动 no-op。 | 保留原始事件与现场，独立诊断环境限制和技能行为，不放宽沙箱重跑或手修产物为通过。静态迁移验收与真实行为验收分别记录。 | 按证据继续，不将受阻结果算成功。 |
| 2026-10-14 | T05 真实评测 / T04 独立审查 | f2 的同一根脚本命令两种合法写法，以及 f3 唯一 Python 源文件作为模块的准确描述，被固定表示断言误拒绝。 | 增加 `contains_any` 显式精确候选；f2 只允许 `pnpm lint`/`pnpm run lint`，f3 只允许 `src`/`src/main.py`，不做命令归一化或前缀匹配。 | 独立审查确认规范未限定唯一表示；修复须保留错误脚本、参数及路径反例。旧记录不变，新断言重判另存版本与来源。 |

## 本轮执行约定

- 协调会话不连续承担实现 ticket；每个 ticket 使用全新上下文子代理，并由独立上下文重新运行验收。
- 每个 ticket 独立提交；实现证据、审查结论、实际运行证据分别记录。
- M1 完成后仍须检查 L2 三次运行门槛和真实仓库试用；M2 的 2–4 周使用门槛不能用一次测试代替。
- 测试和检查器验收以各 ticket 留存的实际运行证据为准；不能将占位骨架、未执行的 LLM 回合或其他任务的报告冒充本票验收。

## 迁移勾选

T05、T06 完成时，把 08-v1-migration.md 的勾选结果贴在这里。

### T06 · multi-agent-config → vic-agents（2026-10-14）

必须保留：

- [x] 单代理先行，内置够用不建 custom：SKILL §边界/步骤2，decision-rules。
- [x] 主会话+0–3子代理，agent_count含主会话，并发不含：SKILL §边界，decision-rules/output-schema。
- [x] 配置/执行及写入/加载分离：SKILL §步骤2/4/5，materialization-layout/engineering-notes。
- [x] 能力四类与三态：capability-inventory，output-schema。
- [x] 官方日期/URL、用户模型优先、两步继承、Ultra→Luna同时设推理：model-policy，examples。
- [x] 五个agents字段、max_threads、standalone三必填、旧config_file增量维护：materialization-layout；旧无name片段区分处理。
- [x] 摘要字段不进TOML、权限证据分层：SKILL §步骤3，capability-inventory/materialization-layout/evaluation。v1“sandbox是角色默认值”按当前官方证据纠正为角色文件不覆盖父会话权限。
- [x] superpowers三态与bridge读取入口：materialization-layout，output-schema。
- [x] 三种角色模板及不凑角色：role-templates，decision-rules。
- [x] output-schema及requires_explicit_codex_multiagent_invocation兼容字段：保留24个顶层键与关键对象全部子键。
- [x] 运行判断不回写合同：SKILL §步骤1/5，output-schema。
- [x] 中文输出及技术名保留原文：SKILL §步骤5，中文角色模板/示例/摘要说明。

必须修改：

- [x] 改名、openai.yaml、policy.allow_implicit_invocation=false、含英文触发词的description。
- [x] 从实际SKILL目录定位../../schemas与../../scripts，不查其他skill目录。
- [x] 不迁移complete-workflow兼容入口，全部交付清单合入evaluation-and-contracts。
- [x] 自行派生代理的skill计入skills.available，同类审查去重：capability-inventory/decision-rules。
- [x] 旧平行层转TOML/退役/人类文档三方案、引用影响、已有授权与待确认边界：materialization-layout。
- [ ] refresh-log留T11；M1不写，未来真正no-op仍零日志，非本票遗漏。
- [x] 结束实际执行vic-check --agents；只修本次已授权范围，历史失败保留并如实报告。
- [x] model-policy超过45天先提醒核验；字段/版本兼容请求定向核验。
- [x] 接收vic-learn agent-role教训并有证据地更新对应developer_instructions。
- [x] 技能目录无__MACOSX/.DS_Store；现有.gitignore已含两项，无需越界修改。

迁移后验证：

- [x] 上述必保留项逐项找到v2文本对应；九份references、24个本地链接、共享文件定位及metadata通过。
- [x] examples三例对应f5/f6/Ultra变体的参考行为；三段TOML解析及实际检查通过。
- [ ] T12真实技能行为评测未执行，不能把确定性示例校验当LLM行为验收。

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
- 独立复审：`review_t03` 结论“R1 已解决，可合入”，修复差异无新必须修改项。实际重跑两套 Node 各 23/23；原漏报探针现在 exit 1 且准确报告 C04/C06；越界软链和目录去重保护通过。Node18 新建 1455 文件探针约 96ms，前后内容不变。实现 `d5ae496`，修复 `6b43e48`，完整证据见 ignored `T03-review-r1.md`。

### 2026-10-14 T07 vic-check：代理配置规则
- 做了什么：新增结构化 TOML A01–A07；`--agents` 仅检查代理配置，默认/`--all` 合并 A/C，`--contract` 保留合同规则。A03 只检查 agents 全局字段，角色注册子表与旧 alias 单独处理；max_depth 保持 V1/V2 兼容 warn。A07 递归检查解析键，正文/注释中的摘要词不违规。旧注册 config_file 以主 config 所在目录为相对基准，读取前检查仓库和真实软链边界；无 name 的被注册片段不套 standalone schema，A05 不将旧注册引用自身误报成重复。
- 产出文件：`scripts/lib/{agents.mjs,agents-fields.json,checker.mjs}`、`scripts/vendor/{smol-toml.mjs,README.md}`、`scripts/vic-check.mjs`、`tests/{agents,cli}.test.mjs`、本进度文件。ignored `T07-preparation.md`/`T07-report.md` 保存准备与实施证据；未改 schema/evals/ADR/reference 或 T05 技能文件。
- TOML parser：smol-toml 官方稳定 1.9.1，2026-10-09 发布，BSD-3-Clause 完整许可证保留于文件头；零上游 npm dependencies。直接使用官方 `dist/index.cjs` 完整单文件 bundle，只加最薄 ESM exports 适配；官方 npm tarball SHA512 integrity 实际校验通过。tarball SHA256=`4ac8392f1918c22a4366be19047cf53aa42646077d4c711b2ef73263beefb172`，原 bundle=`f9029370259e9a43a2f3e64fa1d39e72f3598188380ace83a0abb8261fa33555`，最终 ESM=`b3e2376169f18d0e87506553f6a183e29df3f090f5cfa51af509279346ae4cb6`；全部来源与完整性见 vendor README。
- 字段快照：checked_at=2026-10-14，依据同日 `agent-fields-research.md` 官方核验；保存五个已核验字段、max_threads 旧别名和 max_depth 的 V2 忽略说明。官方来源为 `https://learn.chatgpt.com/docs/config-file/config-reference`、`https://learn.chatgpt.com/docs/config-schema.json`、`https://learn.chatgpt.com/docs/agent-configuration/subagents`。
- 先失败后通过：`rtk proxy node --test tests/agents.test.mjs` 在实现前 → tests 15 / pass 0 / fail 15，合法用例退出码实际 2（--agents 未实现），预期 0；实际结构违规尚无 A findings。实现后每条 A 规则至少一正一反用例全部通过，含每个 required/禁用 key、max_threads 同值双声明、旧片段自引用/真正双定义、quoted/dotted/inline/array table、注册路径缺失/目录/越界/外部软链、只读字节保留、范围隔离/互斥。
- 验证命令与原始关键输出：`rtk proxy node --test`（v25.8.1）→ tests 38 / pass 38 / fail 0 / duration_ms 3330.43625；`rtk proxy <T03-node18.txt 的 NODE_PATH> --test`（v18.20.8）→ tests 38 / pass 38 / fail 0 / duration_ms 3426.217792；既有 C 规则、完整 example 与 CLI 回归均通过。Node18 ESM 探针实际输出 `{"node":"v18.20.8","namedApi":true,"roundTrip":true,"invalidRejected":true,"int64":"9223372036854775807","sha256":"b3e2376169f18d0e87506553f6a183e29df3f090f5cfa51af509279346ae4cb6"}`。
- 集成与性能：`rtk proxy node evals/verify-fixtures.mjs` → exit 0、`T04_VERIFIED=51`（确定性夹具回归，不是 LLM 评测）。Node18 对 100 角色 TOML、250 文档、1200 源码及主配置的 1551 文件仓库运行 `--all --json`（计入进程启动）→ `{"node":"v18.20.8","files":1551,"elapsed_ms":322.05,"exit":0,"summary":{"error":0,"warn":0},"unchanged":true}`；前后全文件 SHA256 一致，临时夹具已清理。
- 其他验证：`rtk git diff --check` exit 0；内置 parser 无外部 import/require；产出没有新增 npm 运行时依赖、软链或用户绝对路径。Node18 复用 T03 已校验官方二进制，由主协调最后清理。
- 未完成 / 遗留：官方 loader 实际角色加载、账号模型可用性不在本票确定性规则验收范围；未执行 LLM 回合。45 天字段保鲜 CI 留 T21，`--drift` 与后续 C 规则仍未实现。独立审查待协调派发。
- 给下个会话的提示：T06 可实际执行 `--agents`；保留已有合法旧注册与无 name 片段，正文表达权限意图并不建立运行时隔离；不要把 max_depth 兼容警告升级成所有版本无效。T05 的技能改动仍属于并行独立任务，本票未暂存其文件。
- 独立审查：`review_t07` 结论“可合入，无必须修复项”。实际重跑当前 Node 和 Node18 均 38/38；A01–A07、CLI范围、C规则回归与边界通过；上游 vendor 哈希、真实完整 BSD-3-Clause 和最薄适配重新核验通过。1551 文件独立性能探针约 208ms，内容及权限保持不变。未发现 Hard stops、ADR 或范围违规；实现 `e789ef1`，报告见 ignored `T07-review.md`。

### 2026-10-14 T06 vic-agents v2
- 做了什么：迁移v1完整核心规则，主体77行；九份references保留完整摘要及窄角色模板，交付清单合并到evaluation。增加技能委派能力去重、旧平行层逐文件迁移、角色教训接收、45天模型保鲜、共享schema/scripts实际路径定位及explicit-only policy。按当天研究纠正权限/历史字段语义；自定义schema与无关历史错误保留并如实报告。M1不写日志，真正no-op零写入。
- 产出文件：skills/vic-agents/SKILL.md、agents/openai.yaml、references/{decision-rules,capability-inventory,model-policy,materialization-layout,role-templates,evaluation-and-contracts,engineering-notes,examples}.md、references/output-schema.yaml；本进度文件。ignored详细报告为.superpowers/sdd/07-roadmap/T06-report.md。
- 验证方法：rtk proxy node --input-type=module -执行确定性静态与临时配置脚本；YAML/TOML使用现有内置解析器。24个本地链接、三个共享路径、metadata policy=false、24个v1摘要顶层键与关键对象子键、三态bridge、11文件Hard stops/行尾空白均通过。rtk proxy git diff --check -- skills/vic-agents为exit0。
- 原始关键输出：

```text
SKILL_LINES=77
REFERENCE_COUNT=9
LOCAL_LINKS_VALID=24
SHARED_PATHS_VALID=true
METADATA_EXPLICIT_ONLY=true
V1_SUMMARY_TOP_LEVEL_KEYS_PRESERVED=24
HARD_STOPS=PASS
CHECKER_f5-reference={"exit":0,"error":0,"warn":0,"ids":[],"input_preserved":true}
ZERO_WRITE_BASELINE_CHECKER=true
CHECKER_f6-reference={"exit":0,"error":0,"warn":0,"ids":[],"input_preserved":true}
CHECKER_ultra-reference={"exit":0,"error":0,"warn":0,"ids":[],"input_preserved":true}
CHECKER_old-registration={"exit":0,"error":0,"warn":3,"ids":["A03","A04","A06"],"input_preserved":true}
CHECKER_unknown-contract-history-error={"exit":1,"error":1,"warn":0,"ids":["A07"],"input_preserved":true}
ACTUAL_CHECKER_SCENARIOS=5
EXAMPLES_TOML_PARSE=3_PASS
BEHAVIOR_EVAL_T12=NOT_RUN
LLM_RUNTIME_LOADING=NOT_RUN
TEMP_FIXTURES_CLEANED=true
FINAL_STATIC_FILES=11
FINAL_STATIC_LINKS=24
FINAL_METADATA_POLICY=false
FINAL_BRIDGE_THREE_STATES=PASS
FINAL_STATIC=PASS
```

- 实际checker：五组临时仓库分别以rtk proxy node <实际插件>/scripts/vic-check.mjs --agents --root <临时仓库> --json执行。旧注册无name片段、max_threads/max_depth与topology得到0error3warn（A03/A04/A06）；自定义version3合同及历史A07角色正确exit1/error1，所有输入字节不变。临时仓库已清理。另在插件根执行rtk proxy node scripts/vic-check.mjs --agents --root . --json得到summary.error=0/warn=0；插件根无目标角色，该结果不替代示例配置验证。
- 未完成 / 遗留：以上是确定性文本/配置验收，未执行LLM/T12真实技能行为、账户模型可用性或loader生效检查，也未修改apple-tools。字段与模型基于同日已核验研究，公开schema未绑定固定CLI版本。T11日志与T12行为评测保留后续里程碑，三示例只是参考行为；M1真实试用与稳定性门槛仍需协调执行。
- 给下个会话的提示：已有授权无需重复确认；未知自定义合同只作线索并回源码核对相关事实。无关历史失败报告未通过并路由，不扩大修改；零配置收益零写入优先。角色文件不提供独立只读沙箱；Ultra→Luna显式模型覆盖要核对最终推理。仅文档改动，本票未改检查器或目标项目。
- 独立审查：待协调会话派发。
- 独立审查结果：`review_t06` 结论“可合入，无必须修复项”。独立重跑静态与五组实际 `--agents` 验收；77 行主文件、24 个摘要顶层字段和 111 个递归结构节点保留，输入内容与权限未变。核心迁移、三态 bridge、权限与未知格式边界通过，未发现 Hard stops、ADR 或范围违规。实现 `40c1923`，详细证据见 ignored `T06-review.md`；T12真实行为、loader、账户模型可用性及真实仓库试用尚未验证。

### 2026-10-14 M1 真实仓库 agents 技术试用
- 用户指定 apple-tools；在无远端的隔离副本中保留全部 322 个 tracked 文件当前字节与权限，包括用户未提交的两份角色修改。原仓库只读，自定义 version:3/schema_profile:local 合同原样保留。
- 冻结 T06 已审查源码运行一次真实 source-path 回合：exit 0，108.535 秒，SKILL 读取与 turn.completed 事件齐全。模型选择复用 reviewer、未实际派生代理；前后 checker 均为 0 error、3 warn。
- 模型报告将并发上限从 2 调整到 1 时写入受阻；stderr 有 filesystem policy_denied，但 JSONL 缺完整 patch 事件，不能还原确切写入内容。核心 references 的读取、isolated-child 可用性及模型依据均有证据缺口。
- 副本完整文件树与权限无变化，原仓库 322 个文件的 hash/权限、HEAD 与 Git 状态均不变。本次不是成功 no-op 或完整技能验收；bootstrap 尚未运行。独立诊断进行中，不通过放宽权限或手修产物消除失败。
- 原始证据保存在 ignored `M1-real-trial/agents-20261014T090700Z-139b9681/`；准备证据为 `M1-real-repo-preparation.md`。技术试用不替代 T12 重复评测、原生 loader 验证、业务回归或人工体验。
- 独立诊断：现有项目并发容量 2 与本次使用最多 1 条不冲突；合法旧别名 warning 不是必须迁移的理由。新上下文正补强持久变更收益、决策前引用读取及能力证据门槛；不要求为证明能力而实际派生代理。原静态迁移结论保留，修复及复审完成前本票暂回进行中。

### 2026-10-14 T06 真实试用通用规则修复
- 基线：`1e71be7912080cb7069b534921dd56132d27986b`；原实现 `40c1923`。仅修改 vic-agents 的8份文本；主体80行。提交时 T06 保持🟡，等待独立限定复审；真实行为验收仍未通过，不追认原试用为成功no-op。
- 改动：任务使用预算与项目持久容量分离，每项持久改动独立说明收益；合法别名不因warning自动迁移，纯迁移保留数值。四份核心引用正文成功读取设为分阶段结论门槛，失败只停止依赖材料的写入结论；本地快照路径/日期与本轮官方URL/核验日期分开。available须有当前工具/宿主声明等可定位证据；可用/允许/已启动/权限验证分开，缺证据不冒充可用，不为盘点spawn。写入拒绝停止分支，不换路径/工具规避，仅报告有证据动作及实际差异。
- 实际验证：`rtk proxy node .superpowers/sdd/07-roadmap/t06-real-fix-verify.mjs` exit0；复用内置解析器，11文件、24本地链接、24顶层字段、111非null结构节点兼容，三段示例TOML解析通过，五组临时仓库checker均实际执行并逐字节/mode比较不变，finally清理。静态没有RTK产品运行依赖；所有本地执行仍使用rtk前缀。验证脚本及完整报告留在ignored目录。

```json
{"static":"PASS","files":11,"lines":80,"links":24,"top_keys":24,"recursive_shape_nodes":111,"toml_examples":3,"new_rules":"PASS","rtk_runtime_dependency":false}
{"scenario":"f5","exit":0,"summary":{"error":0,"warn":0},"ids":[],"input_bytes_modes_preserved":true}
{"scenario":"f6","exit":0,"summary":{"error":0,"warn":0},"ids":[],"input_bytes_modes_preserved":true}
{"scenario":"ultra","exit":0,"summary":{"error":0,"warn":0},"ids":[],"input_bytes_modes_preserved":true}
{"scenario":"legacy","exit":0,"summary":{"error":0,"warn":3},"ids":["A03","A04","A06"],"input_bytes_modes_preserved":true}
{"scenario":"unknown","exit":1,"summary":{"error":1,"warn":0},"ids":["A07"],"input_bytes_modes_preserved":true}
TEMP_FIXTURES_CLEANED=true
```

- 其他实际验证：`rtk git diff --check -- skills/vic-agents` exit0；插件根 `rtk proxy node scripts/vic-check.mjs --agents --root . --json` exit0，error0/warn0，只证明空配置基线。初版验证脚本两次因节点计数口径错误失败，修正脚本后完整成功；产品结构未改变。
- 边界与交接：未改checker/ADR/reference原件或试用附件，未写业务仓库、启动模型回合/代理、调整权限或安装依赖；已有授权/零写边界保留。真实模型行为、账户可用性、loader及权限仍未重新验证；限定复审只审通用文本与确定性证据，不能据此宣布真实行为通过。报告 `.superpowers/sdd/07-roadmap/T06-real-fix-report.md`。
- 独立限定复审：修复提交 `aa2d360` 可合入，无必须修复项。审查者自己重跑静态、五组checker并确认摘要全部解析值与基线完全一致；80行/24字段/111节点保留。报告 `T06-real-fix-review.md`。已安排同任务、同权限的隔离真实复测，仍不声称运行时或真实行为通过。

### 2026-10-14 T04 明确候选表示假阴性修复

- 按独立 gate 审查及 f3 补充裁定修复两个过严事实断言。新增 contains_any：显式非空候选数组，路径解析值对至少一个候选深度严格相等；每条仅一个操作，空/非数组候选与混用操作配置错误 exit 2。旧 contains 对数组值仍精确匹配；没有子串、正则、命令归一化或执行 gate。
- 仅修改 assert.mjs、verify-fixtures.mjs、f2-monorepo/expected.yaml、f3-legacy-layers/expected.yaml 和本进度文件。f2 gate 只允许 pnpm lint / pnpm run lint；f3 模块只允许 src / src/main.py，其他 fixture 内容与断言不变。
- 实际执行当前 Node v25.8.1 和 T03-node18.txt 指定官方 Node v18.20.8 的 evals/verify-fixtures.mjs；原 51 项全部通过，新 39 项覆盖错误脚本/内联 payload/参数/目录/拼接、错误模块路径、缺路径、坏 YAML、深层严格相等、旧 contains 数组语义及配置失败。两个真实 fixture 的替代表示均用完整 expected 和独立新 first 验证。

```text
当前 Node v25.8.1：
通过 f2-monorepo:替代表示完整 expected 与新 first 验收
通过 f3-legacy-layers:替代表示完整 expected 与新 first 验收
T04_VERIFIED=90
EXIT=0
官方 Node v18.20.8：
通过 f2-monorepo:替代表示完整 expected 与新 first 验收
通过 f3-legacy-layers:替代表示完整 expected 与新 first 验收
T04_VERIFIED=90
EXIT=0
```

- 两个 mjs 的 node --check 与限定四文件 git diff --check 均 exit 0。报告在忽略目录 T04-representations-fix-report.md。contains_any 只证明正确值存在，不禁止额外错误值，已专门回归此边界。
- 旧 T05 失败记录、旧 before/first 与 expectedHash 未修改或改绿；新 expected 不可混用旧快照冒充重验。没有运行真实模型，本次仅确定性断言修复；提交时 T04 保持 🟡，等待独立限定复审。
- 独立限定复审：修复提交 `d70792b` 可合入，无必须修改项。两Node各自实际重跑90项及25个额外探针，精确候选、非法配置exit2、旧数组语义、反例及原完整树基线回归均通过；受审文件与提交逐字节一致。报告 `T04-representations-review.md`。

### 2026-10-14 T03 C09 RTK 检索调用假阴性修复

- 基线：`acbbe252b16832882ab65dd99213bebb0361c1c8`。真实 T05 f2 首轮产物三份组件文档第21行均为 `rtk rg`；原 C09 只接受直接 `rg`，导致三个假阴性。仅修改 `scripts/lib/components.mjs`、现有 `tests/documents.test.mjs` 与本进度文件，T03 暂保持 🟡 等待独立限定复审。
- 明确接受 `rg`、`rtk rg`、`rtk proxy rg`，要求同行参数；保留提示符与原有 `&&`/`;` 调用边界。引号内分隔符不作为调用边界，命令名提及、echo 字符串和无关 wrapper 均不算调用。不执行被扫描命令、不新增 RTK/npm 运行时依赖、不改变原文件发现、解析、边界和只读行为。
- 先增加有意义反例/正例，再修复：新增两项测试涵盖18个正例与13个反例，红阶段12项/10通过/2失败，绿阶段12/12通过。当前 Node v25.8.1 工作根默认 `rtk proxy node --test` 40/40通过；官方 Node v18.20.8 显式全套产品 `--test tests/*.test.mjs` 40/40通过。
- 官方 Node18 工作根默认 `--test` 发现忽略目录 M1-real-trial 的外部仓库 before/after 测试副本，354项中346通过/8失败，因其预期的根脚本不存在；原失败日志保留，未改发现规则、删除现场或扩大产品改动，不能宣称该工作根默认命令全部通过。另用 `git archive` 基线构建干净临时发布树，同字节覆盖本票两文件、不复制 `.superpowers`，两个 Node 实际默认 `--test` 均40/40通过；源码 SHA256 与原始输出留存，临时树自动清理。
- T04 d70792b 稳定后两个 Node 实际重跑 `evals/verify-fixtures.mjs`，均 exit 0、`T04_VERIFIED=90`。真实 f2 first-repo 使用实际 checker 只读复扫，三个 C09 消失，error=0/warn=0；163个条目的文件 SHA256、软链目标及权限前后相同。

```text
红阶段：tests=12 pass=10 fail=2 exit=1
绿阶段：tests=12 pass=12 fail=0 exit=0
干净发布树 Node v25.8.1 默认 --test：tests=40 pass=40 fail=0 exit=0
干净发布树 Node v18.20.8 默认 --test：tests=40 pass=40 fail=0 exit=0
两 Node T04：T04_VERIFIED=90 exit=0
实际 f2：entries=163 content_and_permissions_unchanged=true C09_count=0
实际 checker：summary={error:0,warn:0} findings=[] exit=0
```

- 可复跑证据：忽略目录 `.superpowers/sdd/07-roadmap/T03-rtk-fix-report.md`、`T03-rtk-clean-tree.py/json`、`T03-rtk-readonly.py/json` 及红绿/两 Node/T04 原始输出。限定 `git diff --check` exit 0。未重跑 LLM、未改技能源或历史 T05 产物/result；本次验收只证明限定规则修复与确定性回归。
