# 产物写法与质量门

在盘点最小资产、建事实、验证 gate 和写入产物时读取。每种职责只有一个 canonical 入口；确认已有等价文档后原地更新，导航和合同指向该入口。

## 导航与人读文档

| 职责 | 默认路径 | 必须承载 |
| --- | --- | --- |
| 根导航 | `AGENTS.md` | 读取顺序、canonical 指针、最小路由、少量 hard stops；目标 ≤120 行 |
| 生效 override | `AGENTS.override.md` | 用户的高优先级 guidance，只读，低优先级导航与之相容 |
| 项目地图 | `docs/project-map.md` | repo/workspace、主要模块和责任边界、guarded 区域与证据入口 |
| 事实性约定 | `docs/conventions.md` | 可从配置/文档确认的命令、验证、测试、CI、review/release 事实；未知项 |
| 组件合同 | `docs/component-contract.md` | 复用封装、定位表、符号索引、定位顺序与 rg 检索 |
| 根事实合同 | `contracts/project-context.yaml` | machine-readable 项目事实；不是代理配置或执行推荐 |

优先索引用户的 CODING_STANDARDS、Matt 领域文档与工作流文档，不复制判断性规范。保留已有等价人读文档的命名/目录，并从导航链接。
根或 scoped override 在同目录优先；其下更具体目录的 guidance 只在自身 scope 内生效。根导航不能取消 scoped 规则；已有 fallback/等价 guidance 以实际仓库入口为依据，不自创加载机制。
机器字段使用稳定技术分类，例如多个 workspace 包组成的仓库为 `repo_type: monorepo`，单应用/库/服务/脚本可用 `single-app/library/service/script`；这是分类约定，不新增 schema 枚举。框架组合和解释放在人读地图或模块 role 中，不把 repo_type 写成一段技术描述。
`top_level_modules` 描述顶层模块边界；存在应用/包/源码目录时用该目录 path，入口实现文件放 role/evidence/entry_chain，不用单个入口替代整个源码模块。
guarded path 优先指向直接承担风险的具体源文件或配置文件，并说明证据；发现明确的拦截器、守卫或适配器实现时不能只写其上级目录。确属整体边界的目录仍可单独记录。
资产清单包括隐藏/忽略的环境文件、CI 与工具配置。对环境文件核对真实路径及其在构建/运行中的角色，不输出凭据值；已确认的环境选择文件由所属根/app 合同维护 guarded，普通示例模板或角色不明的文件按实际证据说明，不能猜用途。

## 组件文档的确定性入口

每份合同的 `component_contract.sources` 用 `{kind: component-contract, path: <仓库相对路径>}` 明确指出对应组件文档；可与 barrel/源码 source 指针并列。
有该指针时检查器不强制默认同名文件；无指针时根默认 `docs/component-contract.md`，app 默认根 `apps[].docs` 下的 `component-contract.md`。子合同允许同 kind 指针覆盖 app 默认。
复用已有等价组件文档时必须设置此指针，不按文档标题猜路径，也不为满足检查生成第二份事实。

## 组件合同质量门

根层负责跨仓索引及属于根应用的定位，app 层负责其子域定位；两层通过链接消费共享定义。每个已核实的定位表条目在所属同份合同 `component_contract.locate_index` 中有对应 LI 事实，文档与 YAML 的 import/entry/source/exports 保持一致；不能只写人读表或把根层索引迁空到子层。
`entry` 是公开导出入口，`source` 是该导出符号的实际定义/实现文件，不是使用它的页面。调用文件记入 evidence，用来证明应用使用场景；不同实现文件的符号分开成 LI 条目，不能合并后只留下一个调用源或其中一个组件源。在下述双向覆盖检查中回查表格与 LI 的四个定位字段，再判断质量门完成。

1. **封装层定位表**：列名含“场景、优先 import、包入口、关键源码、代表导出”，每条写核实过的 import/barrel/source/exports。表格各格有内容，路径对应真实文件；只有证据支持时才写 do-not-bypass 约束。
2. **组件/符号可检索索引**：覆盖常用全局注册键名和关键导出符号，指向入口或实现；hooks 的别名需追到真实实现，不能只列目录。
3. **定位顺序**：在明确的“定位顺序”标题下用编号步骤写先查 barrel/注册，再查源码/调用，最后用检索排查未知项。
4. **检索命令**：给可在仓库根执行的 `rg` 示例，搜索路径确实存在，覆盖导出、注册或调用。

没有封装时如实写“尚未发现共享封装”，保留表头并用一行说明 `import/包入口/源码/导出` 均“未发现/无法确认”；这是调查结果，不是虚构组件。符号索引说明未发现组件，可单列已核实的普通入口符号并标明不是共享封装。
此时事实中的 `systems/preferred_abstractions/locate_index` 保持空数组；定位顺序指向实际 README/源码，给真实搜索命令，并在 uncertainty 写明尚缺规范/包配置。不得把普通入口伪装为组件、编造 import 或给不存在路径。
只有原则没有入口、符号索引、顺序或搜索方法的组件文档不完整，须 refresh；质量门适用于显式等价入口和 app-local 文档。

## 验证 gate

从 package scripts、贡献文档或 CI 读取命令，先检查命令内容、递归 scripts、生命周期脚本和调用链。lint/typecheck/format-check 仅在本地只读时实际运行，每条 120 秒超时；带 `--fix/--write` 或会写缓存/外部系统的命令只索引并解释未验证。
先静态核对脚本所需的本地依赖与工具路径，不通过运行包管理器探测可用性；例如脚本依赖 eslint/tsc 而本地 node_modules 缺失时，直接记录未执行，不运行 pnpm/npm 或其 --version。依赖存在后继续读取工具/shim 与版本切换配置，只有能确认不下载、不联网、不写缓存才运行 gate；无法确认时跳过并记录依据。
会下载包管理器、要求安装或联网校验版本的 shim 不是可安全运行的本地 gate。遇到此类工具缺失只记录 verified:false 与原因，不通过 Corepack 安装、npx/npm exec 下载或临时改版本绕过；不能产生工具下载/缓存后再用清理包装成只读成功。
先按实际用途区分验证入口与操作命令，再决定是否执行：用于检查代码/类型/测试/可构建性的已确认入口纳入验证能力集合；build 承担可构建性验证时也须索引，不能因默认不执行而遗漏。dev/start、发布、迁移等操作命令可作为 conventions 事实，不因脚本存在就升级为 VG。
对验证能力按 [refresh-policy.md](refresh-policy.md) 核对既有直接/聚合覆盖，缺口才新增所属根/子合同 `validation_gates`，conventions 同步其准确入口；已确认的人读验证事实不能脱离这次覆盖比较。测试和 build 默认只索引；测试仅在用户要求时运行。仅索引的新增 gate 用 `verified:false` 且无 exit_code，不能把“无需执行”当成“无需索引”。不安装依赖、不联网补工具、不修改 package/config；缺工具按真实情况记录。
执行采用仓库已有包管理器与当前目录语义，必要时 `cd` 到对应子目录；YAML 的 `command` 写用户能在仓库根复现的命令。
package script 的 gate 记录公共脚本入口：npm 用 `npm run <script>`、pnpm 用 `pnpm <script>`；执行和合同采用同一入口。scripts 内部实际调用作为证据核对，不将其 payload 内联为替代 command，以免绕过脚本组合或生命周期语义。
`verified: true` 只表示本次确实运行且 exit 0；失败或不可安全执行为 false。真实进程退出才记录 `exit_code`；超时标明 120 秒期限和终止状态，不伪造业务退出码。运行输出证据留在回复或仓库外，未验证原因落入 uncertainty。
`confidence` 表示事实证据是否核实，不等同于命令执行成功；可核实“存在此命令”但同时 `verified:false`。既有有效执行证据不为 no-op 重跑或刷新。

## Machine-readable 合同

完整结构以插件根 schema/MIGRATIONS 为准；每文件一份 YAML 文档，数组可为空，未知字段关闭。教学 example 包含 M2 字段，不当模板拷贝。

- 根规范入口 `contracts/project-context.yaml` 无 parent；保留 `version:1`、`schema_version:2`、对象型 `bootstrap_status.level`，状态反映实际完整性而不是代理决策。
- `bootstrap_complete` 和事实前提 `bootstrap_layer_complete:true` 表示所需导航/事实产物齐全且覆盖已发现边界，不表示 gate 全通过。依赖缺失、测试默认未运行或未知 review/release 规范已如实落入 verified/uncertainty 时，不自动把完整层降为 partial/false；核心事实确实仍未知、产物缺失或覆盖有缺口时可保留 partial 并说明具体原因，不把所有 uncertainty 一律当完整。写完后重新核对状态，不能把盘点时的缺项状态留给下一轮修。
- 导航保留旧 `agents_md.role/effective_guidance_entry.role/effective_guidance_kind.value`；如新增 kind 则与旧 value 一致。旧 `agent_index` 只作输入兼容，默认不生成；已存在且有效时保留其兼容语义，不生成平行层。
- 保留 `project_map`、`conventions`、`component_contract`、`agent_context`、`uncertainty`、`non_goals` 的 v1 业务字段/对象形状；v1 reference 的 fields/description/allowed_values 是规则元数据，迁移时剥除。
- `preferred_abstractions[].path` 保留，与新增 `import/entry/source/exports` 共同表达复用关系；定位事实使用 `locate_index/locate_order/search_commands`。
- 新 gate 生成 `command`；`command_hint` 是只读兼容别名，同现时须一致，冲突先核实。不按 example 同时生成两份命令。
- `GP/VG/PA/LI/CR` 每条有根/子集合唯一且稳定的 ID、非空仓库 evidence、verified/inferred confidence；evidence 为真实文件/目录或有效行号，不用 glob。
- 未证实的结论放 `uncertainty.missing_information/inferred_but_unverified`；事实前提保留 v1 `multi_agent_readiness`，不写 `use_multi_agent/ready_for_multi_agent` 等运行判断。
- 根 `apps[]` 与 `navigation_layer.scoped_guidance` 只在实际发现 app/scoped 入口时填写。子合同形状和无重复规则见 [app-deep.md](app-deep.md)。

## 受限输入：非标准入口或自定义 schema

标准 schema 的根入口、child.parent 与检查接口绑定 `contracts/project-context.yaml`；子合同可经 `apps[].contract` 指针复用非默认路径。v1 泛称的任意等价根路径不属于 M1 已实现接口。
若只有非标准位置的 machine-readable 根合同，先读取、保留、记录 canonical 入口及消费者，明确报告“需要明确 canonical 入口迁移”；不生成第二份事实、不擅自移动，也不声称标准检查器已覆盖它。
识别合同要看完整字段结构和已知 schema，不只看 version 数字。发现未知 profile、额外业务对象或自定义版本时保留原文与扩展，具体列出不兼容字段/入口及消费者迁移缺口；未知根对象不能当作 v1 的规则元数据丢弃。
没有明确的无损迁移定义时停止合同和依赖导航的写入，完成只读调查与建议，在回复提供 uncertainty 和需确认的迁移选择。不能删除自定义字段强凑 C01、强行覆盖为 v2，也不能标 `bootstrap_complete/no-op` 或宣称完整升级。
运行检查器时解释其标准输入范围；即使它未发现非标准根文件且 error=0，也不代表受限输入通过验收。标准根上的自定义 schema 检查错误如实报告，不用修复权限掩盖迁移缺口。

## 双向覆盖检查

从调查证据出发逐项核对必须交付的关键事实，不能仅比较文档与 YAML 是否彼此一致：

- 已确认需保护的边界/风险文件（含环境选择文件）进入所属 GP 与地图；已确认验证能力有准确 VG 覆盖及 conventions 入口，聚合覆盖按 refresh-policy 核实。
- 推荐复用关系进入所属 PA；关键定位场景、组件表及符号索引对应所属 LI。分别核对 PA 的 `path/import/entry/source/exports` 与 LI 的 `import/entry/source/exports`：某符号只出现在 LI、PA 或人读索引中不能补足另一类事实的应有字段。仅普通解释和非关键符号不强制生成机器条目。
- 所需 app 的入口链、guidance、三文档与子合同均交付，根 `apps[]` 的 `name/path/contract/docs`、`scoped_guidance` 的 `path/scope` 及子 `parent` 指向同一真实边界；根只导航局部事实，共享定义与应用使用场景按 app-deep 分工。

再逐项从产物回查同一事实集合：证据支持其内容与归属，import/entry/source/exports 可定位，实际实现与调用证据不混淆，组件文档 sources 指针和同层 LI 一致。已有准确内容与外部原文保留；发现新遗漏先修正集合，再修正对应产物，不以删掉人读正确事实消除不一致。
检查路径存在、证据行号、ID 唯一、根/子无重复、导航优先级与相对链接，最后运行真实产品检查器；受保护入口无法修正时保留字节并报告限制。
