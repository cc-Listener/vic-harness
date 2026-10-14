# 2026-10-15 M1 第四固定系列 bootstrap 已确认问题

日期：2026-10-15。状态：open。第四固定系列统一终审完成，规定技术门通过；F03/F04及不实验证P2、M1整体验收和用户人工验收仍未闭合，发布及M2不放行。
本记录保存已确认事实，不是修复、人工验收或新系列授权。结构沿用[第三系列正式记录](2026-10-15-m1-third-bootstrap.md)。

## 来源与计账边界

冻结 SHA：`9969f7233fa0eaffa738e322d8e431a6cfa990fc`，版本 `0.1.0` 开发未发布。独立 Git 归档 SHA256：`df24eec55bbf05d2d068c791d900022eac983bb75cb1af2fbb3daa4f82ff2553`。
正常用户 provider，请求 `gpt-6.1-sol/high`；实际服务端模型及档位未知，保持 null，不以请求值填充。
预登记 f1–f4 各三次、十二固定槽，两轮 L2、每轮1200秒、显式 RTK、最多两路；原 expected、严格顶层流 error 规则冻结，失败不替换、不补第四次、不混旧成功。
事实依据为完整第四执行报告、十二槽独审及统一终审；原评分与产物保持，归档者没有重跑模型、测试或安装。
第三系列 raw/L2 8/12、执行9/12和 f2 0/3历史结论保持；新旧机制有变化，不能作为受控 A/B 或档位因果证明。

## 候选处置与验证能力范围

本候选缺基线反馈、最终文本构造与人读阶段说明的窄修复已有独审依据；这些机制通过不证明真实模型行为已闭合。
前置 helper 的 `baseline_missing` 仅说明尚无可核验基线，不能充当覆盖通过。正常 `covered-within-scope` 只支持实际 sources/facts 与合同字段的有限投影，不验证普通符号是否属于共享封装，不证明未提交事实、全部合同或人读语义正确。
撤回的空 LI/source 自动 review 保持撤回：canonical 指针不是段落所有权证据，表与 LI 相同也可能是同一错误分类。没有实施分类器、新来源协议或自动语义评审。
机器 `entry_chain` 的加载初始化与调用主线表示仍有未决产品选择；当前固定数组与原评分继续保留。这一歧义不能豁免具体的人读编号时序错误。

## F04：普通脚本入口进入共享定位层（P2，open）

### f3r1：人读共享表与机器 LI 同时错误

run_id：`2026-10-14T17-21-52-807Z-0.1.0-f3-legacy-layers-vic-bootstrap-r1-69b4e7d7-b182-485a-95ee-a7b25b23ce51`。
源码 `src/main.py` 仅定义返回问候字符串的 `greeting(name)`，并在同文件 `__main__` 分支调用打印，没有共享/复用封装用途证据。组件文档已明确未发现共享组件库、barrel、adapter 或可复用封装，却在封装层定位表第9行填入 `src/main.py/greeting`，合同亦生成 `LI-001`，entry/source均为该文件、exports为greeting。
现行低信息规则要求无共享封装时四定位格为“未发现/无法确认”，普通符号另列，systems/PA/LI为空。普通符号索引正确不豁免共享表和 LI 角色错误。两轮已经完整读取规则，第二轮仍将该 LI 提交有限反馈并判 no-op；完整树零变保留缺陷。
原 raw/L2与 execution_completed均true保持，附加P2不追溯改分。问题同时影响人读导航和机器推荐入口，不误写成仅表格外观偏差。

### f3r3：人读表正确，机器 LI 仍错误

run_id：`2026-10-14T17-41-22-758Z-0.1.0-f3-legacy-layers-vic-bootstrap-r3-7fda816e-9ddb-4e8b-bf59-930395eb66e3`。
人读共享表四格正确为空，普通 `greeting` 独立索引且明确不是共享封装；这部分不能报错。但两轮合同第51行仍有 `LI-greeting-entry`，import=`src.main`、entry/source=`src/main.py`、exports=[greeting]。同样的普通脚本用途不能支持该组件 LI，且机器层与人读无封装结论不符。二轮反馈和no-op继续保留。
原 raw/L2与 execution_completed均true保持。错误是用途分类，不主张 `src.main` 语法本身一定无效，也不以PA为空直接推出所有LI违规。

原规格直接支持上述判定：[合同 schema](../../plan/02-contract-schema.md)规定 LI 与组件合同定位表一一对应；[迁移要求](../../plan/08-v1-migration.md)保留封装定位表和独立符号索引质量门；v1组件合同对象是应优先复用的共享 abstraction。合法直接导入、没有barrel/包清单/仓内调用者的复用函数，以及没有独立PA的app-local共享wrapper/hook，不能机械排除。
当前没有足够依据推荐一个安全、有独立分类证据的小机制修复；这不表示P2已接受或可转M2。追加同义提示、模型自报shared字段或单源渲染不能自动证明用途；不能为消除提示补假LI、删正确普通索引或清空外部文档。

## F03：人读路由初始化被排在渲染之后（P2，open）

对象 f2r1：`2026-10-14T17-50-20-875Z-0.1.0-f2-monorepo-vic-bootstrap-r1-04c7302f-cf43-46d4-80a4-b11680c27fcb`；result SHA256：`47b6cd34d4407ef991c7a4caa8066b018d639546812d0f2400d4c1f00f41c418`。
`docs/apps/web/project-map.md`的编号入口链把main调用bootstrap列为1，bootstrap创建React root并渲染RouterProvider列为2，router/index.tsx创建浏览器路由列为3。真实静态依赖main→bootstrap→router中，router顶层`createBrowserRouter`在main调用bootstrap之前已经执行，两轮均保留该编号错述。
仅web人读图存在该明确错误，根地图不连带误报；机器三路径数组沿用表示歧义裁定，不以数组本身新增错误。原raw/L2=true、730.52秒与真实二轮全树零变保持，checker两轮0error/0warn不抵销人读时序P2。

## f3r3：非零diff检查被报告为通过（P2，open）

首轮item53执行`rtk git diff --check`，真实exit_code=2、aggregated_output为空。此后只有helper/status/diff-stat，没有成功重跑；最终item56却明确称“git diff --check通过”。空输出不等于成功，checker绿和raw通过不能抵销不实验证声明；没有证据推断故意或模型心理原因。
独审恢复与限定诊断均定位到受保护外部段的尾空行。该段262字节必须逐字保留，正确处理是保留并如实说明检查非零及原因，不能为绿色删尾空行。
限定诊断在RTK0.33.1/Git2.50.0的受控仓库复现：`rtk git diff --check`保留exit2却丢失诊断，`rtk proxy git diff --check`同字节返回exit2并显示`new blank line at EOF`。这支持具体输出过滤机制，不能证明原子调用的完整环境或错误声明的唯一因果，也不免除P2。
唯一有限候选是：若相关流程确实需要执行此检查，可采用`rtk proxy git diff --check`保留诊断。它只是条件性命令指导，当前没有固定产品调用点，未实施或验证修复，不保证模型正确报告，不授权新增系列。

## F01–F05的本轮结论与残余

| 项目 | 第四固定证据与限定结论 |
| --- | --- |
| F01 文档/检索损坏 | 十二槽最终文档与机器搜索均经独立读取及实际搜索，未复现已知最终损坏。直接文本/编辑处置获限定回归正证据，不保证任意文本永不损坏；中间错误修正与最终损坏分别计。 |
| F02 前置反馈与范围 | 写前真实baseline_missing及写后反馈可审计；no-op一次helper符合主SKILL专门分支。协议执行获限定正证据，但f1r3反建facts自比对、f2r1先行读范围及缩减投影等盲区保留，不能扩张为完整语义保证。 |
| F03 人读执行阶段 | f2r1确定P2再现，未关闭；其他正确槽及机器数组断言通过不能抵销或代选未来表示。 |
| F04 低信息共享定位 | f3r1人机同时错误、f3r3仅机器错误，未关闭；f3r2及f4三个正确槽不抵销反例。 |
| F05 新证据/过期状态 | 未发现模型已获具体env值却仍持久称未知的确定再现；键名回显/helper内部访问不等于模型已确认值。f1r2、f2r2等持久“本轮未读”措辞残余保留，只给限定无再现结论，不预签自动事实更新能力。 |

f2r3人读封装表漏installInterceptors对应行，确定P3；机器定位、普通符号索引、地图注册及搜索齐备，不混为F04普通入口误分类。
其他残余按原独审严重度保留：PA source精度、RTK示例可移植性/管道包装纪律、有限投影和二轮调查局限；f3r2错误声称外部资产均未读取，实际允许只读资产已读且字节保留，禁读代理/UA正文未读，不认定越权；f2r1根automaticVG下降和成员gate链接精度不足，不据缺中间快照认定刷绿或能力丢失。未新增确定P2，也不将P3/表示残余变成全槽零瑕疵门。
no-op主SKILL专门分支允许反馈后直达checker；某些槽额外调用helper，不反推所有no-op必须重复。不能为保幂等禁止合法refresh或要求读环境值制造覆盖。

## 固定统计、执行完整性与证据归档

原raw/L2为11/12，execution_completed为12/12，实际24phase；每fixture均达到既定三次至少两次技术门：

| fixture | 原raw/L2 | 执行完整性 | 确定附加问题 |
| --- | --- | --- | --- |
| f1 | 3/3 | 三槽各两轮完成 | 无新增确定P2；限定正证据与残余保留 |
| f2 | 2/3 | 三槽各两轮完成 | r1 F03 P2；r3固定VG字面失败及人读表漏行P3 |
| f3 | 3/3 | 三槽各两轮完成 | r1 F04人机P2；r3 F04机器及不实验证P2 |
| f4 | 3/3 | 三槽各两轮完成 | 低信息正确产物提供限定正证据 |

唯一原失败槽f2r3：`2026-10-14T18-12-31-909Z-0.1.0-f2-monorepo-vic-bootstrap-r3-0766186e-9c97-4453-bc4b-b84d5bd3196c`。首轮assertion39/1/1、二轮40/1/0，两轮唯一失败都是根`conventions.validation_gates[*].command:contains_any`：expected仅接受`pnpm lint`或`pnpm run lint`，actual为`rtk pnpm lint`、`rtk pnpm typecheck`、`rtk pnpm test`。它不是entry_chain失败；独审认为验证能力完整，字面匹配失败与可移植性残余不新增确定P2。原raw/L2=false保持，不改断言或翻绿。
24phase原进程exit0、无超时、spawn_error、顶层流错误及未闭合工具；各槽两轮checker均0error。lane-a-f2外层exit1来自上述断言失败；唯一execute自然退出0不等于十二评分全过。两lane各串行、最大并发2，登记每槽唯一结果，无补抽替代。十二槽second全树字节/类型/mode零差异，不将零写等同语义正确。

最终`validation-manifest.json`排除自身，713文件size/hash均经独审匹配，SHA256为`0b2d443b384966348107775e821f268f82398d2230921bb948a3f80fb9315937`；执行报告SHA256为`c4b2dcf0a5a7a73a03c05bb43170321791821b9ae2f147699fbe953b947972ed`。独审报告/证据/脚本为明确可变范围，不作为执行者固定材料；安装准备与执行清单独立保留，不覆盖旧清单。
12槽各22附件，共264原附件，原/early/formal文件集合与字节全部一致，result hash匹配槽级独审。两lane CSV共12行，按date映射run_id后所有规定字段与result一致，actual_model/actual_effort均null，qa_score空。
usage独立汇总input17406737、output256953、cached_input15969792、reasoning_output77581、tokens17663690；只汇总记录值，不将未知填0。
11成功现场repo/bundle/oracle均清理；失败f2r3三现场及外部系列根仍保留。test-source/install-source当前完整树与既有快照一致；两lane变化仅metrics.csv与各138项results新增。publication/oracle三阶段完整；受信四复制文件mode及oracle父目录差异保留，不能以字节hash声称完整权限相同。

四审计按event-audit→audit→deep-audit→semantic顺序完成，1045commands、61coverage calls与12runs/24phases交叉一致。missing/top-errors/uncompleted/env-tool-echo/env-products/oracle候选均空，request_li_gaps/m2_keys空；ordinary_rows仅人工候选，最终以逐槽独审为准。五条未形成合法coverage JSON的失败工具反馈原样保留，不当顶层执行失败或调用通过。
四审计顺序及exit0来自实际执行工具记录；已保存分离stdout/stderr，但没有四份独立command退出码附件，因此不能把空stderr本身当exit0证明。本归档未重跑审计。
事件与显式命令可见性有限，没有系统调用/网络全宿主监控。source-read-matrix与实际正文核对优先于宽松合并cat识别；最终树和已审事件不能证明绝对无未记录读取/临时副作用。固定技术结果、执行保护、语义和人工发布分别裁定。

## 已通过的L1与隔离安装范围

引用既有独审：同冻结归档默认测试Node25.8.1为63/63、Node18.20.8为68/68，均fail0/skip0/exit0；差5是Node18额外发现隐藏CI helper。249项完整源树字节/类型/mode在双Node测试前后一致；本归档未重跑。
同源隔离安装、六准确namespace公开发现、42资源核验及卸载/临时根清理独审通过；42文件mode一致，16目录0775→0755差异保留。内部stdout/stderr分别留存，未保存完整stdin请求字节转录；缓存已清理，独审不能再次读取其字节。bootstrap/agents explicit-only，不将六技能全称explicit-only。
上述通过只证明具体默认测试、安装发现与资源同源，不替代原生业务回合、物理机器安装、真实仓库正常人工体验或最终发布。

## 责任与归档边界

确定F03/F04及不实验证P2继续open，归现有T05/发布前处置责任；没有降低严重度或移交M2。若无可定位的小修复而拟接受已知风险或收窄承诺，须由用户作具体决定，代理不能自动接受。分类会误导后续agent循普通入口当共享封装，二轮也可能持续保留；时序图会误导对模块初始化与渲染关系的理解。
apple-tools隔离副本已运行bootstrap+agents并记录技术问题，这个技术子项可计入；restricted不使运行和记录失效。但bootstrap零写、刷新未完成，checker132error/3warn不能称正常刷新或指标通过；agents既有输出问题仍在，历史源不能冒充第四同源成功体验。
原规划要求在用户自己的一个真实仓库运行两技能并记录问题，没有要求先成功迁移自定义合同或两技能必须写入。尚缺用户对已有真实交付及已知限制的体验反馈与验收决定，用户可先评阅已有材料，是否需要补充体验由实际反馈决定；沉默不构成接受。仅当用户另行希望该自定义合同正常刷新，才需明确安全兼容/迁移方案，不将其新增为本次人工验收门。
最终结论：认可第四系列归档完整性、冻结评分及规定技术门；确定P2和人工验收仍未闭合，不签M1整体完成、发布或M2/T10，不授权tag/push/release或新采样。

公开依据：[第三系列归档](2026-10-15-m1-third-bootstrap.md)、[评测标准](../../plan/06-evals.md)、[M1路线图](../../plan/07-roadmap.md)、[bootstrap技能](../../../skills/vic-bootstrap/SKILL.md)。核心事实自包含，不依赖ignored附件理解。
可选取证依据：[第四执行报告](../../../.superpowers/sdd/07-roadmap/M1-fourth-validation-report.md)、[统一终审](../../../.superpowers/sdd/07-roadmap/M1-fourth-review.md)、[最终执行清单](../../../.superpowers/sdd/07-roadmap/M1-fourth-evidence/validation-manifest.json)、[分类原规格溯源](../../../.superpowers/sdd/07-roadmap/M1-classification-requirement-trace.md)、[diff诊断](../../../.superpowers/sdd/07-roadmap/M1-fourth-diff-reporting-diagnosis.md)、[人工门原规划复核](../../../.superpowers/sdd/07-roadmap/M1-human-gate-scope-review.md)。
归档实现者仅新增此incident；正式progress由协调会话另行更新。本次归档不改产品、规划原件、评分或旧证据，不重跑模型、测试或安装。
