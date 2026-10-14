# 进度

## Ticket 状态

状态：⬜ 未开始 · 🟡 进行中 · ✅ 完成 · ⛔ 阻塞

| ID | 标题 | 里程碑 | 状态 | 完成日期 | 备注 |
|---|---|---|---|---|---|
| T00 | 建仓库并核验未决问题 | M0 | ✅ | 2026-10-14 | Q1–Q4、Q9 已写结论；独立审查可合入；完整 LLM 回合留 T09 |
| T01 | 插件骨架 | M1 | ✅ | 2026-10-14 | 六技能隔离安装与发现验收通过；独立审查可合入 |
| T02 | 合同 schema v2 | M1 | ✅ | 2026-10-14 | 标准 JSON Schema 小子集；58 个 v1 业务路径、163 个项目示例路径验收通过；独立审查可合入 |
| T03 | vic-check：解析与合同规则 | M1 | ✅ | 2026-10-14 | 应用文档扫描及C09命令代理误报已修；独立复审两Node40/40、14边界探针、真实f2只读检查均通过 |
| T04 | 评测 fixtures f1–f4 与断言器 | M1 | ✅ | 2026-10-14 | 原票及M1两条完整入口链限定修复独审通过，双Node 102项；旧失败结果保留 |
| T05 | vic-bootstrap v2 | M1 | 🟡 | | 原票及协议/stdin限定修复独审通过；第三系列8/12、f2 0/3，语义交付/流程P2仍open；人工体验未闭合，旧结果保留 |
| T06 | vic-agents v2 | M1 | ✅ | 2026-10-14 | 静态迁移与两次限定修复均独立通过；真实试用主动no-op/完整摘要已验证，仍有3项已披露输出缺陷移交T12，完整行为未通过 |
| T07 | vic-check：代理配置规则 | M1 | ✅ | 2026-10-14 | A01–A07 与 --agents；Node18/当前 Node 38 tests 通过；独立审查可合入 |
| T08 | vic-router 与 vic-check skill 文本 | M1 | ✅ | 2026-10-14 | 11场景及fallback完整；独立27测试/CLI探针通过，RTK依赖R1修复与Node-only限定复审通过 |
| T09 | 评测运行器 | M1 | ✅ | 2026-10-14 | 原票及发布bundle/oracle隔离独审通过；第三系列12槽/21轮、CSV/来源/清理独审闭合，815固定+202可变证据；仅资源路径隔离 |
| — | 🚩 发布 v0.1.0 | M1 | 🟡 | | 第三固定系列raw/L2 8/12、执行9/12：f1/f2/f3/f4为3/0/2/3；技术失败，T05 P2及人工体验未闭合，不放行发布/M2 |
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
| T19 | marketplace 集成外部插件 | M3 | 🟡 | | 固定SHA Matt本地接线及独立隔离安装发现通过；原生manifest、vic/Matt启用技能6/27；物理干净机器验收待验，不代表M3完成 |
| T20 | Claude Code 兼容（可选） | M3 | ⬜ | | |
| T21 | 插件自身的保鲜 CI | M3 | 🟡 | | 本地实现及R1独立复审通过；Node18默认45/45、helper5/5，strict仅未初始化命令通过；无远端，真实GitHub PR验收待验，不代表M3完成 |
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
| 2026-10-14 | T21 独立审查 / 协调裁定 | ADR-0007“每次发布升version”若相对任意开发PR基线判断，会拒绝已预置0.1.0的M1首次v0.1.0，以及提前升开发号后同号正式发布。 | 升版约束相对前次已发布记录，开发预置不算发布；manifest匹配最新标题，已发布版本不得复用，base已发布标题保留且不能降为未发布。 | 采用兼容M1目标的最小解释；不修改规划/版本绕过。仅以可验证CHANGELOG历史判断，未宣称覆盖外部release。 |
| 2026-10-14 | M1 独审 / T04 限定裁定 | f2 的 HTML 模块脚本真实连接 main→bootstrap→router，但固定 expected 仅接受后三项；规格未限定唯一起点。 | 旧 expected、raw 结果保持；仅新版本用既有 contains_any 接受含或不含该 HTML 起点的两个完整精确数组，仍拒绝缺项、乱序和无依据额外路径。 | 独审与协调均核实源码；不做任意前缀容忍，新定义在新系列开始前冻结。判断错误的成本为表示容忍扩大，以明确反例约束。 |
| 2026-10-15 | 第三系列独审 / T05 | entry_chain 的按调用顺序说明与包含加载期初始化的示例缺少统一分支/终点定义；f2r3固定数组失败，但后续模块确有初始化用途。 | 保留原expected/raw与最终歧义裁定，不新增该槽确定语义P2；A/B独立修复继续，app-deep含义暂不改。 | 已询问未来选择启动主线加人读分支，或另立完整关系规格，待用户选择；未代为改权威规格。 |

## 本轮执行约定

- 协调会话不连续承担实现 ticket；每个 ticket 使用全新上下文子代理，并由独立上下文重新运行验收。
- 每个 ticket 独立提交；实现证据、审查结论、实际运行证据分别记录。
- M1 完成后仍须检查 L2 三次运行门槛和真实仓库试用；M2 的 2–4 周使用门槛不能用一次测试代替。
- 测试和检查器验收以各 ticket 留存的实际运行证据为准；不能将占位骨架、未执行的 LLM 回合或其他任务的报告冒充本票验收。

## 迁移勾选

T05、T06 完成时，把 08-v1-migration.md 的勾选结果贴在这里。

### T05 · project-bootstrap-contract → vic-bootstrap（2026-10-14，待整票审）

必须保留（静态迁移义务完成，不表示每次模型无偏差）：

- [x] bootstrap / refresh / no-op 三分类：SKILL步骤3、refresh-policy；无变化前核对完整性与深层覆盖。
- [x] 导航只做读取顺序、canonical指针、最小路由与少量hard stops：artifacts导航层；≤120行，外部段原字节优先。
- [x] 人读文档与machine-readable事实分离：SKILL步骤5，先机器合同再事实投影。
- [x] override/scoped优先级与既有等价入口：SKILL、artifacts、ownership。
- [x] app-deep信号/产物、根集中与docs/apps落位：app-deep，普通源码目录不虚构子应用。
- [x] component质量门四项：artifacts/app-deep，表、符号索引、定位顺序、rg方法及所属LI对应。
- [x] uncertainty不编造、中文输出保留技术名：SKILL与artifacts。

必须修改：

- [x] 去除宿主绝对路径、改为vic-agents职责引用；六发布文件无用户绝对路径/软链。
- [x] 配置/TOML/bridge归vic-agents，平行层不生成；legacy只读checker warning，不为保护而读/哈希禁区；docs/agents外部资产保护。
- [x] refresh证据以共享refresh-log schema为唯一结构定义，M1明确不写日志，不抄教学example的M2字段。
- [x] app-deep移到独立reference；所有权与外部原字节保护在ownership；重复边界集中表达。
- [x] 共享schema规则/示例从实际SKILL目录定位；扩展字段由T02 schema承载，本票生成M1允许字段，不提前产出M2来源资产。
- [x] gate公共command代替新生成command_hint，verified/evidence/confidence；只读lint/typecheck/format-check按真实工具条件执行。当前夹具静态确认本地依赖缺失，verified:false且未执行，不冒充运行通过。
- [x] conventions只索引可证实事实，判断规则归用户CODING_STANDARDS，领域与工作流只建立canonical索引。
- [ ] v0.2的UA inferred证据留T14，非本票遗漏。
- [x] 结束实际执行vic-check；通过样本均0 error，f3现存legacy为A06 warn并交vic-agents。
- [ ] v0.2的refresh-log留T11；M1二轮no-op保持真实零写入。
- [x] 改名、英文触发description、openai显示/默认提示、explicit-only policy；SKILL48行、21链接有效。

验收分层：原票四fixture固定expected/真实no-op/checker证据已齐；请求使用LI的open P2、无封装表展示open P3独立披露，不改expected或raw pass。安全/所有权/原字节/幂等真实fail仍计fail。Luna发布重复未全量通过，T05保持🟡待完整独立票审。

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
- 第一轮修复后的中性复测：从已提交 `d70792b` 冻结，同prompt仅路径替换、同权限；exit0，81.758秒。四份核心references在同一成功读取事件中完整匹配；模型主动判断无独立配置收益、不降低持久容量，原仓库与副本全部内容/权限均不变，checker仍0error3warn。没有虚报本轮官方核验、账户/loader或已启动能力。但未读取output-schema，最终自然语言缺少规定字段，完整行为仍未通过。stderr一条unknown-path拒绝无可对应写入事件，不猜测动作。证据保存在 `M1-real-trial/agents-20261014T092812Z-434fcb69/`；新上下文只补强交付门槛，原两次结果均不覆盖。

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
- 独立限定复审：`962ff57` 可合入，无必须修改项。审查者从受审提交构建干净发布树，两个Node实际默认40/40；14项独立命令边界探针通过，原f2重扫C09=0且163项内容/权限未变。工作根Node18历史附件的8项失败记录保留。报告 `T03-rtk-review.md`。

### 2026-10-14 T06 输出交付门槛修复

- 基线：`f3ad946649f821b8c4ea77ee1f15533823de8e5d`。真实复测已正确读取四核心引用、主动选择零写入并保留容量，但未读取 output-schema、最终自然语言漏掉必保留字段，完整行为验收仍未通过。仅修改 SKILL 步骤5及末尾完成条件、evaluation 交付清单；T06 保持 🟡 待限定复审。
- 交付前必须实际成功读取输出模板和交付清单；最终回复给出完整 YAML，逐键保留模板全部顶层键及适用对象结构。no-op 同样遵守，空数组/null/未确认缺口明确表达，不删字段、不复制模板默认结论、不编造事实或权限；沿用不写仓库 manifest 的边界，未新增许可要求。
- 实际执行 `rtk proxy node .superpowers/sdd/07-roadmap/t06-real-fix-verify.mjs` exit0；ignored 脚本只追加本次门槛断言，原24字段/111节点及五组实际checker验证保留。output-schema 未改，内置 YAML parser 与 aa2d360 对比全部解析值一致。

```text
{"static":"PASS","files":11,"lines":80,"links":25,"top_keys":24,"recursive_shape_nodes":111,"toml_examples":3,"new_rules":"PASS","rtk_runtime_dependency":false}
{"scenario":"f5","exit":0,"summary":{"error":0,"warn":0},"ids":[],"input_bytes_modes_preserved":true}
{"scenario":"f6","exit":0,"summary":{"error":0,"warn":0},"ids":[],"input_bytes_modes_preserved":true}
{"scenario":"ultra","exit":0,"summary":{"error":0,"warn":0},"ids":[],"input_bytes_modes_preserved":true}
{"scenario":"legacy","exit":0,"summary":{"error":0,"warn":3},"ids":["A03","A04","A06"],"input_bytes_modes_preserved":true}
{"scenario":"unknown","exit":1,"summary":{"error":1,"warn":0},"ids":["A07"],"input_bytes_modes_preserved":true}
TEMP_FIXTURES_CLEANED=true
OUTPUT_SCHEMA_ALL_PARSED_VALUES_UNCHANGED=true
```

- `rtk git diff --check -- skills/vic-agents` exit0；主体80行，产品两个文件4行新增/3行删除。未启动LLM/代理，未改checker、原试用附件、业务仓库或ADR；确定性结果不证明真实模型后续遵守，也不追认完整行为通过。ignored报告 `.superpowers/sdd/07-roadmap/T06-summary-fix-report.md`。
- 独立限定复审：`a259518` 可合入，无必须修复项；自己重跑80行/24顶层/111节点、schema字节与全部解析值不变，预算、权限和零写边界无回退。报告 `T06-summary-review.md`。

### 2026-10-14 M1 agents 第三次试用与已知缺陷裁定

- 从 `a259518` Git对象冻结，同中性prompt仅路径换、同权限；exit0，111.459秒，六份必读材料完整正文均有成功读取事件。最终YAML可解析，24顶层键齐全、无extra、适用递归结构无缺项；模型主动no-op并保留容量、角色、自定义合同，副本与原仓库内容/权限/HEAD/状态全不变，checker0error3warn。官方核验日期null/URL空列表、账户及loader未验证如实。
- 仍有三个输出问题，完整 `skill_behavior_pass=false` 保留：主会话 materialized_path 错填 implementer TOML；code-review available 所给证据不足；空能力列表使用“无”占位项。没有填补模型输出、追认成功或启动第四回合。证据为 `M1-real-trial/agents-20261014T094004Z-7b792ea2/`。
- 独立裁定 `T06-trial3-adjudication.md`：主会话绑定路径为P2确定语义错误，能力声明为P2证据不足（JSONL不含完整注入上下文，实际可用性未知），占位数组为P3表示错误。现有规则已清楚覆盖，无新文本缺口，不再叠加提示词或重复采样直到通过。三项没有配置或权限副作用，不自动构成M1发布阻塞；须在incidents及发布限制中披露，并移交T12行为回归。
- T06正式静态迁移/确定性修复验收完成；M1隔离技术试用与问题记录不等于完整agents行为、T12稳定性、原生loader或人工体验通过。T12简报已加入三项具体回归与能力证据边界，M1收尾须将incident保存为相对路径的正式记录。

### 2026-10-14 T05 当前候选失败归档与流程收敛

- 候选 `8d62557b` 的主技能 SHA256 为 `6e5e8adda89d70d05a6f31ea70846e39cf9d12c8d4ba0ccae47e529f3de7bec3`，六文件合并 SHA256 为 `8081c20c128e26391e6efb35fe3d65c42079e8f4ead6fda201660753ef579356`。同源六次尝试全部结束，没有第四次f1采样或替换失败。
- f1完整行为0/3：首次PA的source/exports缺失；第二次补已发现请求封装的LI导致二轮四文件变化；第三次补build验证入口导致二轮合同/约定变化。f2首次首轮事实断言通过，二轮补已有递归gate覆盖的UI直接入口，幂等失败。f3两轮产物断言通过，但首轮实际读取禁区agents README，完整行为失败。f4两轮通过、第二轮完整树零变化且命令边界审计通过。各fixture还未完成M1规定的完整三次评测，不能宣称发布验收完成。
- 独立限定裁定：f1请求封装LI是已知关键事实的结构化覆盖遗漏，不能作为无必要补写豁免；新增独立GP及措辞细化不单列必修。f2递归gate已实质覆盖UI包，二轮直接入口细化无必要。f3明确禁读优先于宽泛盘点/保护要求，读取成功不能因未改文件而算通过。报告为 `T05-f1-coverage-adjudication.md`、`T05-f2-gate-coverage-adjudication.md`、`T05-workflow-diagnosis.md`。
- 当前真实运行未指定模型/推理参数，原始JSONL/stderr没有可确认的实际模型信息；只读默认上下文探针亦无可用元数据，旧运行实际模型与推理档位保持未知，不用当前默认反填。下一候选须固定并记录请求模型条件；指定模型不等于有实际服务端模型证明。
- 一次收敛方案：内容读取前区分可读和禁读资产；写入前统一根/app事实调查与归属；合同与适用文档从同一已核实事实集合增量生成；从发现事实到产物及产物到证据做双向覆盖；refresh按真实缺口判定。集合不落盘新文件，不改schema/expected，不将所有符号或所有脚本升级为关键事实。独立诊断仅支持改进假设，未证实落盘顺序就是根因。静态审查后有限新源评测，若仍失败不再逐例堆叠提示。
- T05继续进行中，T08/T09依赖门槛保持；T21按显式已满足依赖单独推进本地实现，未跳过任何发布验收。所有原始证据在本计划ignored实施目录保留。

### 2026-10-14 T05 收敛候选静态准入

- 新候选主技能 SHA256 为 `cb6236147100c95c2f4bc4ce1dd71f19f1b3926a8f077a3b449cb2051d209e30`。只改主技能及四份references，openai策略原字节不变；新主文件48行、21本地链接。实现报告和完整对旧冻结源差异为 `T05-convergence-report.md` / `T05-convergence.diff`。
- 独立复审 `T05-convergence-review.md`：规范与质量均通过，无必须修改项，可进入新源行为评测。审查者实际核对六文件哈希、metadata及三份共享YAML、所有本地链接、迁移/兼容/权限/M1边界；25份冻结非技能接口/评测文件未变，重建完整diff与报告diff逐字节一致。
- 静态准入不证明行为修复。新评测固定请求 `gpt-6.1-sol` / `low`，实际服务端模型未确认时仍记未知。与旧默认条件不明的样本分开，不作单变量因果归因；所有新源评测也保持实际产物与命令审计，不手工补齐模型输出。

### 2026-10-14 T21 插件保鲜 CI 与发布判据修复

- 产出：`.github/workflows/freshness.yml`、`.github/scripts/freshness.mjs`、`.github/scripts/freshness.test.mjs`；PR触发、只读权限、完整历史与Node18，执行默认测试、strict插件自身检查和版本/日期规则，失败退出传播。核验日期按UTC计算，45天不warn、46天warn；缺失/无效/未来均warn。
- 发布判据按协调裁定：开发号预置不算发布，首次0.1.0及提前升好的开发号允许同号转正式；manifest匹配最新标题，新发布对应当前版本；已发布版本不得复用，base已发布标题保留且不能降级，正文可修订。只依据current/base可验证CHANGELOG记录，不推断外部release，不改规划/ADR/manifest/CHANGELOG绕过。
- 实际验证：实施者以62aa239干净archive加本票三文件、独立复审以85f1e50干净archive加同字节三文件，Node v18.20.8默认 `node --test` 均45/45，显式helper测试5/5；`node scripts/vic-check.mjs --strict --root .` exit0、输出“vic-harness：未初始化”，只证明命令执行，不声称不存在的合同通过校验。未复制T05未提交内容或ignored评测副本。
- 隔离Git基线实际CLI：普通开发、首次同号发布、预置号转正式和历史说明修订exit0；版本不一致、复用已发布号、删除/降级历史exit1。独立复审另验新发布不在最新条目失败、正常下一新版本通过。原R1误拒已解决，限定复审“本地代码可合入，无新增必须修改项”。
- 报告及原始命令/退出码/stdout/stderr在ignored `T21-fix-report.md`、`T21-fix.diff`、`T21-fix-evidence/run.txt`、`T21-fix-review.md`及独立raw证据保留。`git diff --check`通过。
- 真实GitHub PR验收待验：尚无远端PR，checkout/base SHA、warning显示、job阻断和分支保护未实际验证；T21保持🟡、完成日期留空，不代表M3完成。不push、不发布。

### 2026-10-14 T19 marketplace 外部 Matt 本地接线

- 产出：仅 `.agents/plugins/marketplace.json` 新增 Matt 外部 Git source，固定 SHA `49dd158d1076134a641b33efb035946536778336`；保留现有 vic 条目和市场语义，不新增 UA，不复制第三方代码、skill 文本或 manifest 到产品。
- 实施及独立审查均从已提交基线 `c60a81e0c44d3f659d56744a8a02b0a66ebd36da` 的 Git archive 建立工作区外树，仅叠本票 marketplace；对照原始文件确认变化集合唯一，未纳入 T05 未提交内容。独立临时 CODEX_HOME 配置/缓存，未读复制认证、未改全局、未执行业务 skill 或 LLM。
- 实际命令：`rtk proxy python3 .superpowers/sdd/07-roadmap/T19-verify.py` 与独立 `T19-review-verify.py` 均 exit0；CLI 0.162.1，从本票市场安装 vic 0.1.0 / Matt 1.3.1 均 exit0、installed/enabled=true，Matt 实际 source 返回指定 Git URL 和固定 SHA。缓存保留原生 `.claude-plugin/plugin.json`、27 个显式普通技能文件，无合成 `.codex-plugin/plugin.json`。
- app-server `skills/list forceReload=true`：errors=[]，按精确 pluginId 分组 vic 6、Matt 27，均 enabled=true；名称集合与各自发布清单一致。54 个宿主技能排除统计；独立审查额外确认技能路径位于对应缓存。只证明接线及加载发现，不证明全部业务技能、自动更新或独立远端 Git 树逐文件字节一致性。
- 两轮成功验收均两个 remove exit0，最终 installed/available 为空，app-server exit0，TEMP_ROOT_EXISTS=false。实施的两次脚本环境兼容失败原始记录保留，其临时环境也已清理；不清理其他 ticket 证据、不用 git clean。
- 本地质量与规范独立审查通过，无必须修改项；完整产品 diff、报告及原始证据在 ignored `T19-report.md`、`T19-product.diff`、`T19-evidence.txt`、`T19-review.md` 和独立证据保留。`rtk git diff --check` exit0。
- 物理干净机器验收仍待验：本轮独立临时 CODEX_HOME 仍可见宿主技能，不能冒充路线图验收。T19 保持🟡、完成日期留空，不代表 M3 发布完成；仅本地提交，不 push、不发布。

### 2026-10-14 T05 同源原票证据齐与限定提交

- 发布产出仅vic-bootstrap六文件；主技能48行/21本地链接、explicit-only、无软链/宿主绝对路径。静态独立准入后源冻结为 `0335d370-65a0-4737-9b9c-6b057666b8ee`；SKILL SHA256 `cb6236147100c95c2f4bc4ce1dd71f19f1b3926a8f077a3b449cb2051d209e30`，六文件tree SHA256 `4575ebe06b2c92804ecd3fb03e63808fb18aa3a7334210230f8489d994af6f8b`。统一根/app事实集合→机器合同→人读投影→双向覆盖，不新增落盘状态或fixture答案提示；评测期间六文件未改。
- 固定上游：scripts/schemas `962ff5707ee2e1015d03f93b0367f818d53e3e14`，assert/expected `d70792ba52e16c2dd3198662ae095b39dfafe9db`；31文件冻结manifest与期末工作区逐项匹配，所有run来源/evaluator前后不变，原始result/JSONL和失败未替换。
- 实际命令：`rtk proxy node .superpowers/sdd/07-roadmap/T05-run-luna.mjs <fixture> <冻结plugin> <冻结evaluator>`；显式请求 `gpt-6-luna / medium`、never/workspace-write/ephemeral/ignore-user-config、plugins/hooks disabled；fixture工作repo外置，每份最多3次、最多2路。实际服务端model/effort缺原始元数据，保持未知。
- 原票推荐通过证据：f1 `2026-10-14T10-22-22-342Z-f1-single-app-ad2171f4` 首轮29/0/1→最终30/0/0；f2 `2026-10-14T10-15-44-341Z-f2-monorepo-b583875b` 与 `2026-10-14T10-22-22-342Z-f2-monorepo-e648660c` 均40/0/1→41/0/0；f3 `2026-10-14T10-25-51-846Z-f3-legacy-layers-1673a765` 22/0/1→23/0/0；f4 `2026-10-14T10-19-38-395Z-f4-empty-5b96c100` 18/0/1→19/0/0。各轮exit0/turn.completed1/usage及真实SKILL与四reference读取有原始事件；五样本二轮no-op、file_change0、全树added/deleted/changed空、checker0error。f3仅A06现存legacy warn，不读配置正文、不迁移外部层。
- 真实失败保留：f1第1次别名无必要刷新、第3次纠正client source并补拦截器LI，二轮均两文件变化；f3第1次外部段262→261字节，少一换行，首轮即失败。全部命令含inline脚本已人工核对，未见禁区内容/递归检索/哈希、安装、联网探测、缓存清理或范围外写入；f3字节违例不降级。
- 独立范围裁定 `T05-acceptance-scope-adjudication.md`：原票、06规定L2、附加质量分开。f1第2次/f2两次请求使用定位LI遗漏是open P2，但地图/GP/CR有准确备用入口，不扩expected或覆盖raw pass；无封装表列明确非共享的真实普通入口为open P3展示偏差。可带incident完成原票，不能声称所有指令/语义无缺陷；M1仍需审查已知限制。正式incident由协调单独归档，本提交不纳入并行incident文件。
- Luna规定L2统计：f1 **1/3**，f2 **2/2（第三次未跑）**，f3 **1/2（第三次未跑）**，f4 **1/1（未追加）**。f1未满足2/3，其余未全量重复，不能宣称M1发布通过；无第四次、没有跨源混计。source-path不证明原生插件业务加载，L3/全部变体/真实仓库门槛另验。
- 推荐sol/low的旧两条400发生在ignore-user-config切换后的ChatGPT服务，技能工具调用前拒绝，单列环境失败不计luna分母；用户正常app-server的既有provider与该条件不同，不能推断正常provider不支持sol。未读/输出密钥或URL、复制认证/provider配置、修改全局。未来正常provider系列另固定条件，等整票审后执行，不在本窗口追加模型。
- 最终报告 `T05-report.md`；冻结/条件 `T05-luna-binding.json`，八次结果SHA/次数/slot状态 `T05-luna-series-summary.json`，机械与人工分层审计 `T05-luna-audit-results.json` / `T05-luna-behavior-audit.json`。旧报告 `T05-old-candidate-report.md` 与旧诊断/六次JSONL/result原样保留。所有模型自然结束、slot为空。T05保持🟡，原票门槛齐，待完整独立票审；不push、不发布。

### 2026-10-14 M1 已确认行为问题正式归档

- 新增 `docs/harness/incidents/2026-10-14-bootstrap.md` 与 `2026-10-14-agents.md`，由独立归档上下文按既有裁定整理，协调逐文复核。它们保留可独立理解的触发、观察、影响、未知和后续责任，不依赖 ignored 链接才知道问题。
- bootstrap 记录请求 LI P2、真实二轮 refresh/树变化、外部段少一换行及普通入口展示 P3；agents 记录主会话绑定角色文件 P2、available 证据不足 P2（真实可用性未知）和空数组占位 P3。全部 open，不冒称已修复；agents 后续交 T12。
- 协调实际复核八份原始 result：f1 false/true/false，f2 true/true，f3 false/true，f4 true；五份 pass 的二轮 added/deleted/changed 均空，f1 两份 fail 均改合同及组件文档。f1 规定 L2 1/3，其他尚未完成三次，M1未通过。
- 两份文档17个相对链接存在；机器绝对路径和正文尾随空白扫描通过。仅文档归档，无新模型调用、产品变更、模板或自动学习；未改旧原始结果。T05提交 `24188fbb84a799c3aac45eceded6915ad3fc0331` 的完整独立票审正在进行。

### 2026-10-14 T05 完整独立验收与后续放行

- 独立审查提交 `24188fbb84a799c3aac45eceded6915ad3fc0331`（仅七文件）；spec通过、质量带open P2/P3接受，没有必须修改项。四份真实现场重新生成仓库外快照后独立重跑：f1最终30/0/0、f2 41/0/0、f3 23/0/0、f4 19/0/0；八次checker均exit0/error0，f3各有既有A06 warn1，其余warn0；四份first/final全树零差异。
- 独立复核Git提交六blob/冻结/各run一致、31文件manifest及962ff57共享工具/d70792b断言来源一致；八回合完整SKILL、四refs、schema正文及完成/usage有正证据。153条原始完成命令及inline写入核查未见禁区读取或外部副作用；f3外部段262字节保持。
- 原票可完成不等于发布通过：请求LI P2和普通入口展示P3仍open，真实失败不覆盖；luna f1仍1/3，其他未完成三次，native loader业务调用和真实试用等未由本票替代。报告/独立原始复验附件：ignored T05-final-review.md、T05-final-review-recheck.json、T05-final-review-events.json。
- T08、T09按已完成依赖正式并行，互斥skill文本/evals目录，进度与提交串行；apple-tools bootstrap按已准备方案只做一次隔离技术试用，原仓库只读。任何受限合同处理不得宣称标准迁移或no-op。

### 2026-10-14 T08 vic-router 与 vic-check 文本（待独立票审）

- 实际产出：`skills/vic-router/SKILL.md`（33行）、`skills/vic-check/SKILL.md`（42行）。router覆盖03-skills §6全部11场景及外部未安装替代，按真实会话技能列表使用准确名称；只推荐，不执行。check从实际SKILL位置解析共享脚本并显式传目标根，只读解释结果与路由。
- M1边界：learn到M2/T13、prune到M3/T17；当前均占位，提供人工可执行替代。drift到M2/T10，当前CLI拒绝；不把0error当未过期、模型可用或配置生效证明。strict按实装仅额外报告gate弃用command_hint的C01 error，不声称全部warning升级。
- 实际文本探针：ROUTES=11、LINK_OK=true；两文件≤150行、无软链/用户绝对路径。`rtk git diff --check` exit0。
- 实际CLI探针：空目标all/contract/agents exit0；quiet空输出、json+quiet优先JSON；drift/help/范围冲突exit2且CHECKER诊断；代理旧max_threads在agents/all/agents+strict均exit0/error0/warn1；坏代理TOML与坏合同YAML分别exit1/error1/warn0。每次运行前后目标逐文件SHA256与路径清单一致，临时目录已清理。
- 相关现有测试：`rtk proxy node --test tests/cli.test.mjs tests/contracts.test.mjs` 12/12通过；代理测试15/15通过（初次命令同时指定不存在的checker.test.mjs，实际只发现agents.test.mjs，不算不存在文件测试证据）。共27项实际通过；未新增镜像文本实现测试。
- 范围与限制：仅两SKILL及本progress进入提交；无外部安装、npm依赖、业务gate、模型运行或发布。真实LLM路由、完整f1–f7、缓存内模型读取未执行，文本/CLI验证不替代行为验收或M1稳定性。实施详情与关键输出保存在ignored `T08-report.md`；状态保持🟡待独立票审。

### 2026-10-14 T08 R1 发布命令兼容修复（待限定复审）

- 针对独立票审唯一必修P2，仅修改 `skills/vic-check/SKILL.md` 两行：发布示例使用标准 `node`；实际执行按目标仓库 guidance，仅明确要求且代理可用时包装。没有新增RTK安装步骤或运行时依赖，开发shell仍使用rtk前缀。
- 实际执行外层 `rtk proxy python3` 临时探针，在PATH仅含复制的Node二进制、无RTK的环境运行标准Node示例；原始关键输出如下。临时目标保留一个README文件，运行前后路径、SHA256和权限一致。

```text
NODE_ONLY_RTK_AVAILABLE=false
NODE_ONLY_EXIT=0
NODE_ONLY_STDOUT={"version":"0.1.0","root":".","summary":{"error":0,"warn":0},"findings":[]}
NODE_ONLY_STDERR=
READ_ONLY_BYTES_MODES=true
TEMP_CLEANED=true
LINK_OK=true
SKILL_LINES=42
SKILL_SYMLINK=false
STANDARD_NODE_EXAMPLE=true; ABSOLUTE_USER_PATH=false; READ_ONLY_BOUNDARY_PRESERVED=true
```

- `rtk git diff --check` exit0；产品diff仅两行替换，只读禁止写入/网络/安装/业务gate及CLI语义未改。未重跑无关全套、未新增功能或测试；router、scripts、T09 evals、规划原件/ADR/reference未改。报告在ignored `T08-fix-report.md`，T08保持🟡待限定复审，不将R1确定性复验当LLM路由或M1发布验收。

### 2026-10-14 真实仓库 bootstrap 单次受限试用

- 在用户指定仓库的既有隔离副本中，从受审 `24188fb` Git对象冻结bootstrap执行一次；原仓库只读，包含的两份用户角色改动保持。新条件正常加载既有provider、请求sol/low，逐MCP禁用、notify空、plugins/hooks关、never/workspace-write，目标cwd两次公开config/read白名单核验通过；未读复制认证/连接，不保存完整config。
- 实际命令 `rtk proxy python3 .superpowers/sdd/07-roadmap/M1-real-trial/run-bootstrap.py`；模型exit0、93.760秒、1 completed、0 failed/error。识别version3/local合同无无损迁移定义，主动restricted只读，明确刷新未完成、未归no-op/标准迁移成功。14条完成命令未见禁区直接读取或业务副作用，0 file_change；两条空检索exit1如实保留。
- frozen checker前后及模型自身均exit1、132error/3warn，外部JSON逐字节相同；C01=127/C02=4/C06=1，A03=2/A04=1。标准检查未通过，不删自定义扩展强凑绿色。执行成功、受限保护、完整bootstrap和checker结论分别记录。
- 副本410完整树条目字节/权限/HEAD/status相同；原322tracked字节/权限/HEAD/status以及68407完整树元数据相同，原ignored/未跟踪字节未读取未核验。冻结来源前后hash相同。协调直接核对原始最终回复、保护JSON、前后checker及原事件计数，与报告一致。
- run_id `bootstrap-20261014T104734Z-3e2286ad`；ignored `M1-bootstrap-trial-report.md`及同目录原始证据保留，正式bootstrap incident追加独立条件/受限范围记录，无新产品保护缺陷归因。没有重试或手修产物。实际后端未知、native loader/人工体验未验，不能据此称M1发布通过。

### 2026-10-14 T08 独立验收与 R1 复审完成

- 实现990297b覆盖11场景、外部未装替代、M1占位/漂移边界及真实checker语义；独立审查重跑27测试全部通过，CLI参数/0-1-2退出和只读探针通过。唯一P2为发布示例无条件RTK依赖，在Node-only环境复现exit127。
- fresh R1提交1e8fb73仅把示例改标准Node并说明按目标guidance可选包装，开发shell仍RTK。独立限定复审重新从发布代码块运行：NODE_ONLY_RTK_AVAILABLE=False、NODE_ONLY_EXIT=0、READ_ONLY_BYTES_MODES=true、LINK_OK=True、SKILL_LINES=42、TEMP_CLEANED=True；diff检查通过，原P2 ADDRESSED，无新增阻塞，spec/质量通过。
- 报告ignored T08-review.md、T08-fix-report.md、T08-fix-review.md；T08标完成。未运行router LLM评测或完整f1–f7，本票不替代M1稳定性验收。T09仍实施中，真实f1两轮运行已通过但发布默认prompt兼容修正与独立票审尚待完成。

### 2026-10-14 T09 评测运行器（待完整独立验收）

- 产出 `evals/run.sh`、`run.mjs`、四个必要lib模块、`runner.test.mjs`、metrics规定表头及results本地忽略文件。标准node/git/codex子进程，无npm运行时依赖、宿主绝对路径或软链；fixture与冻结资源在工作区外，附件树用base64 JSON保留，不引入外部可执行测试树。
- source-path显式读取当前SKILL及其资源；冻结技能/全部references/schema/scripts/fixture/expected/assertion/runner来源hash。断言和checker只用运行自己的冻结副本；每repeat重新复制干净fixture，首轮后完整first快照供二轮比较；毫秒UTC和UUID唯一结果。失败保留原始JSONL、stderr、最终消息、快照/树与现场状态；CSV转义、未知用量留空，缺规定轮次用量汇总null。
- 正常加载用户provider，请求sol/low，两次公开config/read在独立cwd确认8MCP逐项禁用、notify空、plugins/hooks关、never/workspace-write；MCP标识只内存用于覆盖，不保存完整config/连接、不读取复制认证。实际后端模型/effort未知，source-path不证明native loader或物理隔离。
- 唯一真实命令 `rtk proxy evals/run.sh --fixture f1 --skill vic-bootstrap` exit0，run_id `2026-10-14T10-51-01-688Z-0.1.0-f1-single-app-vic-bootstrap-r1-376d3086-164f-438f-925f-82bb1f41535e`。两轮exec exit0，各有完整SKILL读取item_4与一个turn.completed；首轮固定断言29pass/0fail/1pending，二轮30/0/0，全树added/deleted/changed均空，两轮checker 0error/0warn。execution_completed/l2_pass/pass均true；input685274+output6033=tokens691307，cached578176另存，耗时282.532秒。真实CSV另存ignored附件，提交metrics仅表头。
- 真实回合采用运行前旧绑定：run.mjs SHA256 `46a62e417d79ee9a7a6a63906149888a54ce6b73b496679e0bc2c087da413097`。结束后按协调裁定将发布默认prompt改标准cat及遵守适用guidance，RTK仅可选 `--rtk`；本次实际RTK指导来自用户/brief，26条完成命令均RTK前缀且exit0。没有重跑模型或改写原结果。
- 最终四文件run.mjs/config.mjs/events.mjs/files.mjs相对真实绑定有差异：提示RTK可选化、首命令完整读取/非法事件边界、缺规定轮次用量与known_usage、provider一致性及运行前来源复核、中断/清理/metrics错误保留、全轮L2与checker汇总、特殊树条目只归档及Git fsmonitor关闭。技能、fixture、expected、checker/assertion未改；最终源码未真实执行模型。最终解析器对旧原始两轮事件复核errors=[]、读取/用量一致，单列final-runner-verification.json，不冒充新系列。
- 最终确定性验证：当前Node和官方Node18.20.8各8/8运行器机制测试通过；无RTK PATH下标准cat真实执行exit0，RTK提示只随可选标志；真实assert接口捕获二轮隐藏文件、删除和空目录变化。`rtk proxy node --test tests/*.test.mjs evals/runner.test.mjs` 48/48通过；`rtk git diff --check` exit0。
- ignored报告T09-report.md及唯一结果附件完整保留。规定f1 L2与执行完成分层通过；固定保护断言通过，命令级审阅未见安装/联网包管理器或禁读代理配置，但未独立监测网络/系统副作用，不宣称无外部副作用已验证。仅一次repeat，不计最终M1三次系列，不替代f2–f4、附加语义或native loader验收。T09保持🟡待完整独立票审；本次不push、不发布。


### 2026-10-14 T09 R1/R2 限定修复（待限定复审）

- 仅修独立票审两项：`evals/lib/process.mjs` 将终止宽限期作为可等待的 Promise，直接子进程 close 不取消组级 SIGKILL；timeout、SIGINT、SIGTERM 均等待该流程后返回。`evals/run.mjs` 对 argv 入口使用 realpath，与 import.meta.url 的规范路径比较；保留 import 不自动执行。
- 新增必要运行器回归：stdio ignore、忽略 SIGTERM 的同组孙进程，三种触发返回后确认后代不存在；系统既有目录别名下实际执行 run.sh help、无模型失败 CLI、test-only mock config/read + turn.failed 的 repeat2。普通目录复制、没有创建软链；模拟失败只验证机制，不计真实模型评测。现场均清理，旧真实附件未改写。
- 从 `a577c3429bf54211f46f4396dbcd4131103ca6ce` 工作区外 archive 叠新回归：当前Node与Node18均2项失败，原版timeout约0.61秒返回、别名help stdout为空。另以原process复现：两Node在返回2300ms后孙进程仍存活，探针已SIGKILL清理。
- 实际命令：`rtk proxy node --test evals/runner.test.mjs` 当前Node10/10；`rtk proxy python3` 读取T03已核验NODE_PATH并参数数组执行Node18相同测试10/10。`rtk proxy node --test tests/*.test.mjs evals/runner.test.mjs` 当前Node50/50；`rtk git diff --check` exit0。

```text
{"alias_help":0,"no_model":1,"mock_repeat2":1,"unique_results":2,"csv_rows":2}
ℹ tests 50
ℹ pass 50
ℹ fail 0
Node18: # tests 10 / # pass 10 / # fail 0 / EXIT=0
```

- 核对旧真实binding：run.sh相同；run/config/events/files原有差异仍保留，本修复后process也不同。技能、fixture、expected、checker/assertion未动。修复后源码没有新真实模型执行，旧真实两轮结果仅证明旧binding执行；限定确定性回归不替代M1规定系列、native loader或副作用审计。
- ignored `T09-fix-report.md`、`T09-fix-binding.json`、`T09-fix-before.txt`、`T09-fix-old-grandchild.txt`、`T09-fix-node18.txt`记录原输出和哈希。T09仍🟡待限定复审；无新依赖、绝对用户路径、规划/ADR/reference变更、push或发布。

### 2026-10-14 T09 独立完整审查与修复复审完成

- 完整审查a577c34独立验证当前Node48/48、Node18机制8/8、完整无模型失败CLI repeat2、真实冻结树首轮29/0/1与二轮30/0/0及checker0error；发现R1/P1进程组清理、R2/P2系统路径别名两个必修。fresh修复185139e只改run/process/必要测试及progress。
- 独立限定复审双Node10/10，真实操作系统SIGINT/SIGTERM及timeout六场景均等待组清理且顽固孙进程消失，普通完成约0.05–0.06秒不额外等待；系统已有别名run.sh help0、无codex1、mock repeat2为1，2唯一结果/2CSV行且tokens空。旧22份附件hash全部一致，未追加模型。
- R1/R2均ADDRESSED，spec/质量通过，T09可完成。真实后来源差异仍披露：仅run.sh与旧真实binding相同，另外五runtime不同；旧真实执行加最终确定性复核足够本票，不宣称最终源码已真实执行，不计M1三次。完整证据在ignored T09-review.md、T09-fix-report.md、T09-fix-review.md。
- 非阻塞P3：通过stdin的 `node --input-type=module -` 导入run.mjs时realpath('-')报ENOENT，文件脚本导入/公开run.sh正常；后续若需此非公开模块复用再处理。进程组清理不承诺回收主动脱离组的进程，副作用不自动审计。
- T01–T09已完成独立票审，M1工程文档收尾及最终同源三次评测、安装发现、独立里程碑审查仍待执行；未打tag、未发布。

### 2026-10-14 M1 工程文档收尾

- T01–T09 独立票审完成后，按协调放行仅更新 README、CHANGELOG、plugin description/interface 与本记录；version 保持 0.1.0 开发未发布。README 面向使用者说明四项已实现能力、learn/prune 占位、标准安装/检查/评测入口和调用边界。
- 保留自定义合同只读受限、无 drift/refresh-log、正式 open incidents、source-path 与安装发现分证；M1 最终同源三次系列、native 业务 loader、人工体验仍待验。Matt 固定 SHA 本地接线与物理待验、UA 未集成及 CI 真实 PR 待验均如实披露。
- 实际 `rtk proxy node evals/run.mjs --help` exit0，与 README 的 repeat/layer/model/effort/timeout 及可选 --rtk 一致；轻量脚本确认 VERSION_MATCH/JSON_PARSE/METADATA_SCOPE/LOCAL_LINKS/STANDARD_COMMANDS 均 true；`rtk git diff --check` exit0。未运行模型、安装、全套测试或发布。
- ignored 报告 M1-release-docs-report.md；本次文字与 metadata 待独立审查，最终技术验收由协调随后冻结同源执行，不以文档收尾替代发布验收。

### 2026-10-14 M1 工程文档独立审查通过与最终验证启动

- 收尾提交a630f3a只改README/CHANGELOG/plugin描述及interface/progress；保持0.1.0开发未发布。四技能实现、两占位、M1无漂移/日志/钩子、标准Node/Codex命令、自定义合同受限、source-path与安装证据分开、Matt本地接线/UA缺席及已知incidents均明确。
- 独立限定审查spec/质量通过，无必须修改或新增非阻塞项；实际核验CLI帮助、JSON/版本、Markdown链接、metadata仅三字段和四文件范围、diff检查。报告ignored M1-release-docs-report.md、M1-release-docs-review.md。
- 最终技术验证从本次记录后的固定提交归档，使用外部干净树跑两Node默认测试、f1–f4各3次真实两轮（最多2路）、最终插件隔离安装发现。旧T05各条件及T09一次run不计入新12槽位，失败不替换。所有来源/配置/事件/用量/树比较留存，强边界与附加语义分层审计。
- 本次是验证放行，不是发布通过；尚未打tag或发布。最终结果、独立里程碑审查和人工验收仍须如实完成。

### 2026-10-14 M1 最终固定系列与独立里程碑审查：不可发布

- 冻结提交2a822f5ede273f72306329c6a2f48f420613a282，只用Git archive建立外部干净树。执行者与独审者分别实际运行默认node --test：当前Node50/50、Node18 55/55，全部exit0；差额为Node18默认发现隐藏目录五个CI helper，未收窄发现。最终隔离安装发现六个正确命名空间技能，enabled/errors、版本和40份共享资源缓存hash一致，卸载及自身临时缓存清理完成；只证明发现/metadata，不证明原生业务调用。
- 预登记12槽位均完成，正常用户provider、请求gpt-6.1-sol/low、显式RTK、最多两路；实际后端未知仍null。固定raw/L2均9/12：f1为3/3、f2为1/3、f3为3/3、f4为2/3；execution_completed为10/12，实际23模型回合。没有追加第四次、替换失败、混入旧样本或改变旧expected。
- f2 r1首轮有流断开error，CLI恢复不覆盖严格失败；HTML入口链另被固定精确断言拒绝，后经源码证明属于有效表示范围过窄。该run未执行二轮，仍在分母中。f4 r1二轮同类error，虽产物断言及完整树通过仍计失败。f2 r2真实二轮修改10文件，首轮40/0/1、二轮40/11/0；两轮checker0error不能抵消真实幂等失败。
- f2 r2首轮已读规则与源码，却漏交机器test/build、部分局部GP/请求LI并重复子层共享PA；二轮补缺并夹带表述整理。独立重建确认源未变，不能简单禁止refresh或再加同义指令。首轮还成功读取source树内expected.yaml；该答案暴露是独立的评测有效性缺陷，原raw不重写，下一系列必须先分离发布资源与验收材料。
- 独审重新构造全部实际input/first/second树，checker/assertion/CSV/同源绑定均与原记录一致；438条完成命令及4个file_change审阅未见业务源码、外部所有权、代理配置或外部系统写入违规。23轮必读材料完整读取有正文证据。确有3次合成非凭据env值工具回显，177份生成产物未含这些值；执行报告原“未回显”句已勘误，旧报告/清单原字节归档，raw附件不改。没有完整syscall/network监控，不把可见事件审阅说成强隔离保证。
- archive原始权限有清单；runner四个单独入口snapshot固定0644、fixture restore受umask清除group-write位，属于已披露非阻塞可重现性限制。实际输入到首/二轮权限保护独立核对。两lane原源码只预期追加metrics.csv及结果目录；9个成功现场已清理，3个失败现场和旧ignored证据全部保留。
- 独审明确不可发布。按AGENTS每票新上下文，T05首轮交付检查、T09评测材料隔离、T04两种完整入口链表示分别限定修复，组成同一里程碑修复波，随后统一独立复审。修复源与新定义冻结后才另行预登记新系列；不直接续抽同源样本凑通过。原票历史验收不删除，本表重开三票记录当前剩余修复。
- 真实apple-tools技术试用和incidents保留：bootstrap仍为自定义合同restricted零写、132error/3warn且刷新未完成；agents完整语义缺陷仍open。人工正常使用体验尚未闭合，技术代理不能代签；M2/T10尚未启动。版本仍0.1.0开发未发布，无tag/push。
- 本地ignored完整证据：M1-final-validation-report.md（勘误v2）、M1-milestone-review.md、M1-final-evidence/、M1-review-evidence/。三份修复简报为T04/T05/T09-M1-fix-brief.md，保留全部旧失败与审查记录。

### 2026-10-14 T04 M1 入口链表示限定修复（待统一独审）

- fresh 实现上下文仅修改 f2 expected 与既有 verify-fixtures：使用既有 contains_any 深度精确比较，接受 main→bootstrap→router 和 HTML→main→bootstrap→router 两条完整数组。HTML 模块脚本的连接有 fixture 源码依据，不增加前缀、子序列或路径归一化规则。
- 新增两条合法链及十条错误链回归；缺核心项、乱序、无依据前后缀/中间路径、重复项均拒绝，其余断言必须仍通过。实现者实际运行当前 Node25.8.1 与 Node18.20.8 的 evals/verify-fixtures.mjs，均 exit0、T04_VERIFIED=102（原90项保持）。协调检查两文件差异与 diff --check 通过，产品和回归共35增/1删。
- 报告 ignored T04-M1-fix-report.md；未运行模型、未修改其他 fixtures/断言器/旧 expected 或 raw。旧 f2 r1 仍失败，新表示只用于未来冻结系列。T04 保持🟡，等待三票修复后的统一独立复验，不以确定性测试替代发布验收。

### 2026-10-14 T09 M1 发布资源与验收材料隔离修复（待统一独审）

- fresh 实现上下文只改 run.mjs、lib/files.mjs、runner.test.mjs 并新增 lib/isolation.mjs。模型提示及首命令验证改绑独立 bundle，动态收集完整 skills/schemas/scripts，包含技能内部辅助与共享 vendor；不向 bundle 放入 evals、测试、历史结果或规划。fixture/expected/可信 checker/assertion 恢复到另一次 mkdtemp 的 oracle，不与模型已知运行根相邻。
- 新增发布清单/树/hash、oracle binding、逐阶段完整性和显式路径事件审计。bundle/oracle/live 来源变动或显式验收材料读取均失败并保留证据；可信 oracle 变动时不执行其中工具。恢复文件显式 chmod 保持冻结 mode；原组清理、路径别名、配置白名单、流 error 严格失败、用量和 CSV 行为保留。此为资源和路径隔离，不能证明任意宿主读取或动态 shell 路径被操作系统阻断。
- 实现者最终实际执行两套 evals/runner.test.mjs：当前 Node25.8.1 与 Node18.20.8 各11/11通过、无跳过；diff --check exit0。反例证明完整 source 的 expected 可读而真实 bundle 对应路径不存在，嵌套辅助的相对 vendor 导入成功；真实 run.sh/mock 检出 bundle/source 篡改并落盘，严格 turn.failed 仍失败。协调已核对报告与四文件差异范围。
- ignored T09-M1-fix-report.md 保存细节；没有真实模型调用、旧结果重算或敏感配置落盘。T09 保持🟡，等待统一独审及最终新源全量验证；未把 mock/确定性测试当作新固定系列通过。

### 2026-10-14 T05 M1 首轮有限覆盖反馈（待统一独审）

- fresh 实现上下文新增技能内部只读 coverage.mjs 与 coverage reference，在模式判断和最终交付前接入。stdin 传入本轮已读允许源码和已核实 GP/VG/PA/LI 事实，不建 manifest、不运行目标脚本、不写目标；机械核对 conventions 验证入口到 VG、有限同类型递归聚合、根/子重复 PA 及已核实字段。源码风险/请求 LI 仅给 review 候选，仍须语义裁定，反馈未覆盖范围不能冒称完整。
- 真实 f2 r2 首轮报告3个 VG 缺口、2个共享 PA 重复及已读源码风险/请求定位候选；对应二轮有限反馈归零。回归保留合法聚合、等价命令、低信息/普通导出、准确内容和合法 refresh；补 PA 后人读文档原字节保持，错 source 再检出。未知自定义合同仍 restricted，不迁移 apple-tools，不提前 M2。
- 提交前协调发现初版测试直接依赖 ignored 诊断文件，已补为 tests/fixtures/bootstrap-coverage 跟踪最小片段：两轮各15个必要文件、42374字节，30/30与原始字节及SHA256一致；不含env文件/值、旧完整证据或外部可执行测试树，旧附件未改。测试每次核验夹具hash，在独立临时目标运行反馈并比较读取文件字节，CLI首轮exit1、二轮exit0。
- 实现者实际当前 Node25.8.1 与 Node18.20.8 相关测试各27/27（新6项）；不含 .superpowers 的六文件外部副本默认 node --test 各6/6。SKILL50行、本地链接及软链扫描通过；协调 diff --check exit0。文件仅本技能三份、测试及三份夹具；详细报告 ignored T05-M1-fix-report.md。
- T05 保持🟡待统一独立复验，尚无新真实模型系列。sources/facts 仍依赖模型提交完整已读证据，有限正则可能命中注释，其他语言/复杂聚合需人工核对；确定性反馈与现有 checker 不证明模型首轮必定完整或二轮必定 no-op。

### 2026-10-14 M1 修复波限定独审：T04/T09闭合，T05入口回归待修

- 独立复审固定0d05d7e..3f233b1完整差异：T04两种精确完整入口链、T09实际发布bundle/oracle隔离均 ADDRESSED。从常规系统tar解包的干净Git归档独立运行默认测试，当前Node57/57、Node18 62/62；两版verify-fixtures均T04_VERIFIED=102，前后源码字节/权限不变。30份tracked反例片段与旧原字节一致；规范路径下真实完整first/second树反馈11→0且全树零写。
- 唯一必须修改为新增T05 coverage CLI入口比较未规范化系统路径。两Node实际以macOS临时bundle的/var别名调用均exit0且stdout/stderr空；同文件真实路径调用才有首轮缺口JSON。runner提示中的bundleRoot合法保留该别名，故不能依赖模型自行规避。独审判P1，T05及集成 NOT ADDRESSED，当前不可冻结新模型系列。
- 首次保留Git archive普通文件0664的解包策略下，既有verify-fixtures固定chmod644恢复会导致权限断言失败；独审在旧基线两Node复现相同失败，非本diff引入。两种解包策略、失败和通过输出均保留，列既有可移植性限制，不删证据或改范围换通过。后续必须继续分开报告归档mode与实际输入/两轮mode。
- ignored M1-fix-review.md及44份M1-fix-review-evidence附件记录完整依据。fresh T05别名修复上下文已启动，只改helper入口及必要回归，完成后限定复验；T04/T09恢复完成，旧9/12/f2 1/3和不可发布基线不变。第二次系列12槽位与新脚本仅准备，尚无模型调用、安装、tag或push。

### 2026-10-14 T05 M1 覆盖辅助路径别名修复（待限定复验）

- fresh 修复仅改 coverage.mjs 的主入口识别及 bootstrap-coverage.test.mjs。argv 文件先 realpath 再比较模块URL；无argv、stdin/eval非文件入口仅导出API，不读取CLI stdin或输出。覆盖算法、反馈JSON及退出码未改，无新依赖。
- 新回归从真实发布资源构建外部bundle，以系统别名/规范路径各运行首轮和二轮；首轮exit1且11反馈，二轮exit0且0反馈，目标及bundle完整字节/权限保持。stdin模块、eval无argv/eval非文件argv、普通文件纯导入均exit0且输出空。修改前新测试正确红为7/8；修复后双Node定向8/8、相关测试29/29通过。
- 协调补验发现新测试误假设所有macOS TMPDIR都带别名：TMPDIR=/private/tmp时7/8。提交前已改为测试仅使用系统既有/tmp别名建立自己的bundle临时目录，不改变用户TMPDIR、不创建或发布软链。最终两Node×默认/规范TMPDIR四组合均8/8、无跳过，全部实际执行双路径/零写/纯导入；diff --check通过。
- ignored T05-M1-alias-fix-report.md保留红绿过程、实际命令及限制。当前未运行新模型或重做无关测试，未修既有verify-fixtures权限假设。T05保持🟡，提交后交原独立审查者只复验该P1和本次直接回归。

### 2026-10-14 M1 修复独审闭合与第二次固定系列放行

- 原独立审查者复验3f233b1..fc5b52a差异逐字节一致，唯一P1 ADDRESSED，无新增必须修改项。冻结Git归档下两Node×默认/规范TMPDIR四组定向各8/8；另以原问题的/var实际bundle、旧完整first/second树执行两Node×两路径×两轮8次CLI：11→0反馈，正确JSON与退出码，完整目标及bundle字节/权限保持。四种纯导入×两Node8次均exit0/输出空。
- T04/T05/T09本次修复全部独审闭合，恢复完成；不是M1发布通过。报告ignored T05-M1-alias-fix-review.md及对应原始附件保留，旧失败基线、首次限定复审失败和既有0664测试假设不改写。
- 从本记录提交后的完整SHA冻结新系列：新建M1-second-evidence，已预登记f1–f4各三次12槽位；正常provider、gpt-6.1-sol/low、显式RTK、1200秒、最多两路。先同源外部干净归档双Node默认测试，之后真实两轮评测、动态bundle/oracle/coverage反馈审计、最终隔离安装发现及独立复验。不得补第四次、替换失败或混旧成功；实际后端与未监测宿主行为仍未知。
- 协调放行仅上述技术验证；新结果、人工真实正常使用体验与发版决定仍待完成。版本保持0.1.0开发未发布，不打tag、不push、不启动依赖v0.1的T10。

### 2026-10-14 M1 第二次固定系列收口：不可发布

- 冻结 `eeeba9428c655f3f55095f14e1c6cc02c2c36ae5`，归档 SHA256 `f38b547d70e30bb445162a9325361ac549d7510d5b41aef254d242bdf16b5a60`。正常用户 provider，请求 `gpt-6.1-sol/low`，实际模型/档位仍未知；RTK、每轮1200秒、最多两路。12个预登记槽位全部结束，未补第四次、替换失败、手修产物或混入旧成功。

| fixture | 原始 / L2 通过 | 固定门槛 |
| --- | --- | --- |
| f1 | 3/3 | 通过 |
| f2 | 2/3 | 通过 |
| f3 | 1/3 | 未通过 |
| f4 | 2/3 | 通过 |

- 合计原始/L2 **8/12**、执行完整 **10/12**，真实23轮、475完成命令、158非命令item、44次coverage尝试，无未完成工具item。独审核对全部12行CSV与result、四组唯一repeat1/2/3及配置；两种时间区间核对并发峰值均2，lane内串行。旧系列9/12、f2 1/3独立保留，不合并选优。
- 四个原始失败：f3 r2二轮合法删除错误普通入口LI并改组件文档，实际两文件变化，首22/0/1、二22/3/0；f3 r3首轮流error，无二轮；f4 r1二轮流error，虽然树零变、产物断言通过仍严格失败；f2 r3首39/1/1、二40/1/0，两轮同一entry_chain失败，二轮树零变。f2额外请求路径有真实import连接，但不符合冻结规则的连续启动控制主链，不能新增候选放宽断言。
- 同源外部默认测试实际命令为 `rtk proxy node --test` 及 `rtk proxy <共享Node18> --test`；执行者和独审分别得到当前Node25 **59/59**、Node18 **64/64**，fail0/skip0/exit0，源字节和权限不变。差5为Node18额外发现隐藏CI helper，未收窄测试发现或删除旧证据。
- 隔离安装与独审确认六准确namespace enabled、errors为空，42发布文件字节及文件mode同源；16目录0775→0755如实保留，不能称全链权限相同。bootstrap/agents explicit-only，check/router缺省允许，learn/prune占位。app-server退出、卸载/list和本次安装临时根清理均核验；仅证明发现与资源，不证明原生业务回合或物理干净机器。
- 正式复制260文件（lane-a134、lane-b126）与原件同hash，全部已审早期副本与正式副本一致、不重复计数。八成功现场已清理，四失败现场及同源执行根保留；源树只有允许的metrics/results增量。最终清单598文件逐大小/hash独审核验，无重复/漏项；清单自身SHA256 `54bca83d4f0519a4a6299db6d450a2a1530f4831cc9537feecd93404ef5a2760`。只读审计对串联/前缀JSON提取的修正及首轮日志均保留，未改变评分。
- 发布前P2重新交T05处理：缺sources/facts仍绿色及越界全覆盖陈述、漏执行helper；普通入口入共享表/LI、低信息表格与人读/机器定位缺漏；真实请求支路放错entry_chain；目标外固定临时生成器写入。f2 r3已提交PA/LI事实字段完整，问题是请求LI根本未提交、实际合同仍缺import等，不能声称单条fact字段校验能解决漏交事实。f3目标外scratch违反写scope，但没有证据证明碰撞、业务系统损坏或泄漏。合成公共环境URL回显不作为凭据泄漏。
- 独审结论为**当前不可发布**：f3固定技术门失败、上述既定交付/协议/写范围P2及人工正常使用体验均未闭合。通用语义分类器、任意漏报自动发现和OS强隔离可另票；不能把本次已经观察到的规则偏差整体推给M2。真实apple-tools既有受限试用与agents问题继续保留，不代签人工体验、不打tag、不push、不启动T10。
- fresh归档上下文新增 [第二系列incident](../harness/incidents/2026-10-14-m1-second-bootstrap.md)，旧incident不改。ignored完整依据为 `M1-second-validation-report.md`、`M1-second-review.md`、`M1-second-semantic-diagnosis.md`、`M1-second-evidence/final-evidence-manifest.json` 与独审附件；正式incident可独立理解，不依赖本地附件才能了解问题。
- 下一步只先实施已有直接反例的输入/范围反馈修复：缺输入非成功、显式空数组合法、披露实际检查及未验证范围。它不解决通用语义、遗漏事实、漏执行或写范围遵循；剩余发布前事项继续open，须另有具体处置与真实验证。当前未授权第三系列或改变旧评分，不以追加抽样代替修复。

### 2026-10-14 T05 M1 输入与检查范围协议修复独审通过

- 仅改 coverage helper、其 reference 与直接测试。API/CLI 强制显式 sources/facts 两数组；无 stdin、缺键、非数组、null 或数组顶层返回 incomplete/error、scope:null，CLI exit1。显式双空数组合法。输入校验先于合同读取；非法输入不声称检查成功，未知合同加合法输入仍 restricted、零写入。
- 正常 scope 记录 submitted/scanned 源码路径、每 owner 四类显式事实投影次数、实际 automaticVG 数量、子层 PA 与根定义重复核对数量；常驻 limitations 披露语义分类、未提交观察与组件文档语义未验证。未更改发现算法、分类、路径保护、CLI 别名或纯导入逻辑。
- 实现者及独立审查者分别实际执行 `rtk proxy node --test tests/bootstrap-coverage.test.mjs` 和共享 Node18 的同一定向命令，各 **10/10、fail0、skip0、exit0**。独审另从基线脚本复现无 stdin exit0 误绿，核对新 CLI/API 八类缺失输入一致、双空集合、无本地 PA 的单条 LI、低信息 Go、未知合同顺序及禁区/越界/绝对路径/软链拒绝；完整目标树前后相同。协调 `rtk proxy git diff --check` exit0，三文件 diff 与受审附件相符。
- ignored `T05-M1-input-scope-fix-report.md`、`T05-M1-input-scope-fix-review.md` 及原始探针记录保留。独审无阻断，可合入本窄补丁；**T05 仍🟡、M1 当前不可发布**。未执行模型、安装或 live 默认全套，也未改变旧评分。漏调用/漏提交事实、普通入口分类、人读机器一致性、entry_chain 与目标外 scratch 仍 open，不能据此声称行为成功率改善。
- 后续仅追加直接 stdin 生成器示例的窄实现与独立验证；第三系列先准备，须两项补丁独审完成、最终新 SHA 及完整条件固定后由协调放行，当前尚未执行。

### 2026-10-14 T05 M1 直接 stdin 生成器示例独审通过

- 输入协议补丁已提交 `41587c1437138d1d3b0deaa193ef8c7f01bab1b4`。fresh 实现只在主 SKILL 序列化步骤增加指针、ownership 增加标准 Node 单引号 heredoc 示例，两文件新增22行，SKILL51行。生成器代码直接进入 stdin，明确只写预先确认的授权产物，不落脚本；与 coverage JSON 是独立调用，实际命令遵守目标 guidance。
- 示例先确认路径、目录和所有权，内容须替换为已核实集合的增量结果，外部段落和有效旧字段照旧保护，no-op 不写。演示内容不代表完整合同，不是无损合并器；没有扩展 scratch 权限或新增依赖。
- 实现者及独审各自从发布代码块在两 Node 的独立临时目标实际执行。Node25.8.1、Node18.20.8 均 exit0/stderr空，完整树仅两预列产物变化，无新增/删除，其余文件字节及全部 mode 保持；临时目标已清理。独审命令 `rtk proxy python3 .superpowers/sdd/07-roadmap/T05-M1-generator-stdin-review-evidence/probe.py`；18个链接/锚点有效，协调 diff --check exit0。
- ignored `T05-M1-generator-stdin-report.md`、`T05-M1-generator-stdin-review.md` 与两套 probe 证据保留。独审可合入本示例，未跑模型/安装/默认全套；不能据此宣称真实模型遵循或全宿主零写入。旧目标外 scratch 及其余行为 P2 仍 open，T05/M1 未完成。
- 第三系列已预登记12槽位，请求同模型 high 条件；尚未放行。新调度 STOP 预检发现独立配置进程可能遗留，正限于 ignored 调度层修复并用模拟进程验证；待其独审及最终 SHA/条件固定再执行，旧系列脚本和结果保持。


### 2026-10-15 M1 第三固定系列最终收口：技术失败，不可发布

- 冻结 `39b4e7e35b4036d5f1f6bed0f5861d08dae3b0ee`，正常cliproxyapi，请求 `gpt-6.1-sol/high`，实际model/effort均null；显式RTK、每轮1200秒、最多两lane。12预登记槽自然结束并最终独审闭合，未替换/追加；原raw/L2 **8/12**、execution_completed **9/12**，实际 **21轮**（12首/9二），f1/f2/f3/f4分别 **3/3、0/3、2/3、3/3**，f2未达至少2/3，规定技术门失败。旧9/12与第二系列8/12各自保留、不混分母。
- f2 r1/r2及f3 r1首轮超时，CLI exit0不构成完成；f2 r2零交付。f2 r1局部交付仍有覆盖缺口，无最终回复，不混为成功后误称完整。f2 r3两轮完成且二轮全树零变，但固定entry_chain完整数组失败；真实加载期初始化表示有规格歧义，最终独审无新增确定语义P2，不改expected/raw。helper二轮内部确实读取env evidence但不回显，不能称从未读取。
- 附加P2仍open并归T05：文档转义/检索损坏，前置反馈遗漏及明确全合同范围夸大，人读启动阶段误述，低信息共享表实值，新证据已读而uncertainty仍写未知。机器LI空与人读表偏差、失败生成器与实际file_change分别记录；成功不抵销同类缺陷，P3不自动升级。四专项诊断只为未实施候选，不授权产品修复或追加采样。
- 承接已闭合双Node默认测试61/61、66/66及同源隔离安装，未重跑。42资源文件同源，16目录0775→0755保留；内部完整stdout/stderr未保存、stderr丢弃，外层仅真实invocation/合并tool-output，不声称完整原始流或stderr为空。六namespace发现/卸载清理仅证明安装发现，不证明native业务回合。
- 两CSV各6行与原result逐字段一致；237early/formal原附件相同，deep-copy241项含CSV核验。共872完成命令、174其他item，无未完成工具；真实并发峰值2、lane串行，九实际二轮全树零变。八成功现场清理、四失败现场及外部系列根保留，无同身份遗留进程、无新增越权/保护破坏STOP；事件审查不代表宿主强隔离。
- 最终manifest SHA256 `81d9ef5862f45f5a2d8d72af7b9e0900770a99b0820ffeb97f686f2635509c5a`：815固定执行项全匹配，另202明确root_mutable亦读取记录，不能称1017全部冻结；后续新增独审材料另由当前独审快照绑定。原prepared113项及hash `17d9b52d12379379317d0daeecb6044e4384d27dcb5f0d936bf970f87ec08d58`保留。
- 本会话新增 [第三系列incident](../harness/incidents/2026-10-15-m1-third-bootstrap.md)，依据ignored `M1-third-validation-report.md`、`M1-third-review.md`、final-series-audit及final-review-current-manifest；仅归档和本次进度记录，未修改产品/旧评分/旧证据，未运行模型/安装/默认测试，未stage/commit。
- 阻塞保持：规定技术门失败、附加P2未闭合、真实仓库bootstrap+agents正常人工体验未完成；发布及M2均不放行，M2/T10未启动，不代签人工、不tag/push。后续有限修复须具体处置和独审，不用放宽expected、禁止合法refresh或混旧成功翻绿。

### 2026-10-15 T05 缺基线反馈与最终文本窄修复

- 第三系列已归档于 `d75783b`。本波只改 bootstrap 内部 helper、SKILL、coverage/ownership/artifacts 引用及直接测试，共6文件；不改 app-deep、schema、公开 checker、expected/runner 或旧评分。独立实现与审查均完成，受审产品差异21652字节、SHA256 `ecae004bedaed768e3d0cc242dec1cfce3169ecb37dd4b8f8978d0b8604b84d3`，独审结论本波可合入，无必须修改项；不表示整票T05完成。
- 标准根安全读取真实 ENOENT 才返回 `incomplete/reason:baseline_missing`、明确基线路径、空 findings/checked 与 scope:null，CLI仍exit1；反馈明确未读 sources/evidence、未建 owner、未比较事实。顶层双数组协议先校验，YAML解析、子合同、权限、软链及未知schema原失败/受限边界保持，不用缺基线自动授权bootstrap。
- 步骤3改为真实反馈后结合调查判模式；写入优先已有编辑工具直接接收最终文本/定向diff，删除首选手写JS生成器示例。保留授权路径、外部字节、有效字段及no-op零写；无法保真时不修改该项。uncertainty区分持久未知与本轮未读/未运行；新增无发现表例子仅用于本轮已确认无共享封装且获授权新建自有文档，普通入口独立索引，不清空既有PA/LI。
- 协调裁定：撤回空LI/source自动review，canonical指针不证明段落所有权；代价是相关语义仍需人工核对，P2不因本波机制通过关闭。入口链仍有调用顺序/加载初始化的规格歧义，已向用户询问未来采用启动主线加文档分支，或另立完整关系规格；答复前不修改该含义，也不重判第三系列f2r3。
- 实现先红时缺基线用例返回旧ENOENT；修复后实现及独审各自运行 `rtk proxy node --test tests/bootstrap-coverage.test.mjs`，并以共享Node18.20.8执行同一定向文件，均exit0、12/12。独审真实EACCES探针：当前Node API及两Node CLI保持权限错误、CLI exit1、无baseline_missing，读取阶段mode/mtime/ctime不变。独审原始计数：

```text
Node25.8.1:
ℹ tests 12
ℹ pass 12
ℹ fail 0
ℹ skipped 0
Node18.20.8:
# tests 12
# pass 12
# fail 0
# skipped 0
```

- 实现与独审分别实际使用编辑工具做独立文本探针：指定特殊字符、外部段、CRLF、0640模式及文档/YAML同一命令值保留。无末尾换行确实被追加LF，已准确写入ownership限制；不能把该边界称保真，也不能推广成任意文件安全。no-op探针仅连续只读比较，不能冒充真实模型主动no-op。未执行业务/检索命令。
- 独审SKILL总51行，改动Markdown的20个链接/锚点有效；协调 `rtk proxy git diff --check` exit0。ignored `T05-M1-baseline-text-fix-report.md`、`T05-M1-baseline-text-review.md` 与各自原始探针/失败/最终输出保留，未重跑旧默认套件、模型或安装。
- 后续：行为遵循、完整语义及超时仍待真实验收；第三系列技术失败、F01–F05、入口链选择和人工正常体验保持未闭合。未放行第四系列、发布或M2，T10未启动。
