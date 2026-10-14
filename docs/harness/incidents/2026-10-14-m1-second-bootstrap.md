# 2026-10-14 M1 第二固定系列 bootstrap 已确认问题

日期：2026-10-14。状态：open。最终独审完成，当前不可发布。
本记录只归档独立确认事实；不是新修复、第三系列或发布授权。

## 来源与计账边界

冻结 SHA：`eeeba9428c655f3f55095f14e1c6cc02c2c36ae5`，版本 `0.1.0` 开发未发布。
请求模型为 `gpt-6.1-sol`、推理档位 `low`，正常用户 provider；实际服务端模型及档位未知。
固定计划为 f1–f4 各三次 L2，显式 RTK、1200 秒、最多两路；失败不能替换或追加第四次。
规定评分遵循冻结 expected、可信 checker、实际二轮树及严格顶层流 error，不以最终口头成功改绿。
附加语义裁定和执行范围违规单独记录；checker/helper 绿色不等于全部质量门通过。

本系列不同于旧 luna 样本，也不同于冻结 `2a822f5ede273f72306329c6a2f48f420613a282` 的首个 M1 系列。
旧 M1 系列 raw 为 9/12、f2 为 1/3；第二系列使用修复后入口链表示、发布 bundle/oracle 隔离与有限 coverage。
旧失败、旧 expected 和旧归档均保留，不混入本系列分母，也不把本次问题统称旧修复未生效。
覆盖 CLI 路径别名已独审闭合；本次所列正常输出不能解释为该静默入口缺陷复发。

## S01：普通入口误入封装定位（P2，open）

f3 r2 run ID：`2026-10-14T12-56-06-962Z-0.1.0-f3-legacy-layers-vic-bootstrap-r2-9ee986c6-e15d-46ea-8e5c-af5568cf679e`。
触发：仅发现普通 Python 入口、没有共享封装时生成组件文档与合同。
观察：首轮明确说明 greeting 是普通函数，却仍写入共享封装定位表和机器 `locate_index`（LI）。
已完整读取的 artifacts 要求无封装时 systems/PA/LI 为空，表内定位格写未发现，普通入口另列符号索引。
helper 首轮确实执行并绿色；输入已把 greeting 当作 LI 事实，它只确认该错误投影存在。
二轮删除 LI、改为未发现表行并补普通符号说明，保留准确符号导航，是合法定向纠错。
实际只改变 `contracts/project-context.yaml` 与 `docs/component-contract.md` 字节，权限不变。
首轮断言 22/0/1，二轮 22/3/0（通过/失败/待定）；两轮 checker 均 0 error、1 既有 A06 warn。
原 `execution_completed=true`、`l2_pass=false`、`pass=false`，失败为 `second:assertion_failed`，没有顶层流 error。
影响：首轮表示冲突使真实二轮 no-op 失败；禁止纠错会掩盖首轮缺陷，不能借此翻绿。

f3 r3 run ID：`2026-10-14T13-06-09-014Z-0.1.0-f3-legacy-layers-vic-bootstrap-r3-16e207a9-3e07-485d-b878-815924eefd4c`。
首轮同样明确普通入口不是共享封装，却生成 LI-greeting 和有实值的定位表；helper 绿色仅证明投影存在。
首轮固定断言 22/0/1、checker 0 error/1 warn，但出现顶层 stream disconnected error。
即使恢复后 turn.completed、CLI exit 0，原 `first:model_event_failure` 与执行/L2/raw 失败仍保留。
本 run 无二轮，不推断会纠错、会 no-op 或另造幂等结果；完整 usage 未知，known_usage 不能代替两轮费用。

已知：明确规则已读，错误语义分类进入产物与输入；未知：模型内部判断、生成顺序或遗漏根因。
责任：由 bootstrap 行为修复与 M1 审查承接；继续人工核对源码、用途与人读/机器定位，不自动清空普通函数 LI。

## S02：固定目标外 scratch（P2，open）

对象为 S01 的 f3 r2，首轮 item25。
观察：生成器写入 `/tmp/vic_write.py`，执行后 rm 删除；复合命令 exit 0，脚本只生成五个授权目标产物。
本 run 的 access_scope.write 只含目标 repo，prompt 也限制写入目标仓库；目标外写入/读取/删除违反明确范围。
最终目标树没有临时文件不能抵消已发生的范围违规；该 run 不能证明完全遵守写边界。
没有写前临时路径快照或 syscall 审计，不能证明原路径不存在，也不能认定实际覆盖了用户文件。
未证实外部业务系统损害或泄漏；本脚本不是业务系统调用，不把 scratch 自动升级为重大外部副作用。
责任：后续执行约束应避免全局固定临时名，可在授权目标内或直接 stdin 执行生成器。
本次已独审为 P2，发布前应处理明确写范围遵循，不因未证实损害豁免违规。

## S03：缺输入仍绿色、范围陈述过度（P2，open）

f1 r3 run ID：`2026-10-14T13-06-23-279Z-0.1.0-f1-single-app-vic-bootstrap-r3-02e358b3-b488-4d38-a1ec-611ec615427f`。
首轮真实反馈发现 test VG 缺口及 interceptor LI、Vite GP 候选；补合同后提交实际 sources/facts，反馈归零。
二轮 item38 运行正确 helper，却没有 stdin；已读源码并掌握 GP/PA/LI，不属于合法低信息空数组情形。
helper 默认空对象，只实际 checked 四个 VG，仍输出 covered-within-scope；item40 却称 GP/VG/PA/LI 无缺口。
这违反提交本轮已读允许 sources、已核实 facts 的要求，且陈述超出此次检查支持范围。
最终 LI 含 installInterceptors，组件文档表与符号索引仍只列 UI/client，存在人读定位缺口。
影响：绿色容易被当作完整覆盖证明；需分别核对输入范围与人读/机器事实，不以零 findings 背书完整质量。
原首轮 29/0/1、二轮 30/0/0，两轮 checker 0/0；二轮全树字节/类型/权限相等，raw pass 保留。
已知为输入遗漏及过度陈述；未知为未提交观察集合的全部内容和模型内部原因。

二轮直接 cat `.env.production` 回显公共合成基址 `VITE_API_BASE_URL=https://api.example.invalid`。
生成 AGENTS/docs/contracts 未含该值；这是非凭据观察，不能称真实秘密或凭据泄漏，不单独升级 P2。
责任：后续核对路径、键名及用途宜避免整文件回显；覆盖协议与准确范围陈述由 helper/调用流程承接。

## S04：首轮漏执行与低信息表偏差（P2，open）

f4 r1 run ID：`2026-10-14T13-19-07-009Z-0.1.0-f4-empty-vic-bootstrap-r1-626bc6a6-7639-4a45-a82c-578e496be443`。
首轮完整读取 coverage reference，却未实际调用 helper；checker 缺表后补表，以 checker 绿色完成。
二轮两次提交 sources=[main.py]、facts=[]，输出 checked/findings 空；这是允许的低信息输入，不能判为空 stdin。
文档“无共享封装”表仍把 main.py/main 填入源码/导出格，未按规则用未发现行并另列普通符号。
机器 systems/PA/LI 确实为空；偏差仅在人读表，应与 f3 错造 LI 区分。
二轮未纠正却称组件质量门完整；真实零写树及 helper 绿色均不能证明该语义要求满足。
原失败原因是二轮顶层流 error，`second:model_event_failure` 保留，不改写成覆盖/表格失败字段。
影响：必执行步骤被遗漏且低信息表语义未受检查；责任由 bootstrap 工作流及人工质量审查承接。
已知是漏调用与实值表格冲突；未知内部原因，不归因为缺少 Python 扫描能力。
同系列 f4 r2/r3 使用未发现行、普通符号另列且 LI 空，未重现这项偏差；成功不消除 r1 事实。

## S05：请求支路错误线性化及事实交付缺口（P2，open）

f2 r3 run ID：`2026-10-14T13-40-27-976Z-0.1.0-f2-monorepo-vic-bootstrap-r3-45983e92-ce96-4c73-a9a8-f79122784ad7`。
触发：生成 web 的 entry_chain 时，把 request/index/interceptors 接到启动/初始化控制主链之后。
这些额外路径有真实 import 连接，不能称无依据路径；但 client.get 只在按钮 onClick 用户事件中调用。
冻结 app-deep:16 明确 entry_chain 表示启动/初始化控制主链，不含用户事件请求支路。
独立裁定为真实路径放错字段、错误线性化，不能按 expected 表示假阴性处理或放宽固定断言。
原首轮断言 39/1/1、二轮 40/1/0，两轮唯一失败均为 entry_chain；二轮完整树零变。
原 raw/L2 fail 保留；合法 import 关系并不证明它属于该字段定义的执行主链。
影响：合同把请求依赖支路表述成主初始化顺序，误导入口定位；二轮 no-op 未消除首轮语义偏差。
首轮补过九项 helper 缺口，也不能由最终绿色证明字段语义正确；两轮 checker 均 0 error/0 warn。
实际提交的 PA/LI facts 定位字段齐全，但新请求 client/installInterceptors LI 根本未提交进 facts。
合同中的这两项 LI 缺 import，web PA 空、人读组件表只列 AcmeButton；不能误写为缺字段 fact 被接受。
根/子重复两 app Vite GP，根递归 gate 已覆盖而子层又重复 lint/typecheck；这些也不在绿色反馈的完整保证内。
独审将其列为 T05 事实交付/覆盖使用 P2；只加强已提交 fact 字段校验无法检测未提交事实。
责任：bootstrap 后续应按控制流程区分启动主链与用户事件请求关系；保留原产物及失败，不手修旧 run。

## 只读诊断建议与边界

独立诊断支持最小改进：区分空 stdin/缺 sources 或 facts 键，与显式 `{sources:[],facts:[]}`。
前者报告输入未完整提交并非零退出；后者保留合法低信息输入，不凭空制造 GP/PA/LI。
同次反馈明确实际来源、owner/kind 投影、自动 VG、源码候选与 PA 重复检查范围及未执行部分。
常驻说明事实分类、未提交观察集合和组件文档语义未验证；零命中或零 checked 不表示完整覆盖。
这是可观测输入/范围协议建议，本次没有实现补丁、运行验证或证明全系列成功率提高。
模型仍可能显式交空数组或忽略反馈；未调用 helper 的首轮也无法由未运行脚本检测。
普通函数是否复用、LI 应否存在及表格指代仍需语义判断；没有可靠的自动排除普通函数规则。
文档否定声明与定位实值最多是待验证 review 候选，不能直接 gap、清 LI 或自动修表。
责任：协调者在完整系列结算后决定是否另开有限修复及反例验证，不用新增同义指令或禁止合法 refresh 替代判断。

## 最终结算与发布前责任

12 个预登记槽位均已结束；执行者最终 raw/L2 为 8/12：f1 3/3、f2 2/3、f3 1/3、f4 2/3。
最终独审确认 execution_completed 为 10/12；全部 12 个唯一槽位共 23 phase、475 条完成命令。
全 12 行 CSV 与各 result 逐字段一致；两 lane 内串行，跨 lane 峰值 2，无新增或替换槽位。
八成功现场已清理、四失败现场保留并核验；已删现场由固定来源与树重建，不冒称重读。
最终清单 598 文件逐项大小/SHA256 一致，无重复、差异或漏项；另列八份辅助材料符合声明范围。
清单 SHA256：`54bca83d4f0519a4a6299db6d450a2a1530f4831cc9537feecd93404ef5a2760`。
f3 不达每 fixture 至少两次通过门槛，整体规定技术门失败，执行报告与完整独审一致。
raw 数字与语义/范围发现分开；f2/f4 达原始门槛不取消其具体偏差，也不能使整系列通过。
S01–S05 的已观察交付/协议/范围问题发布前应实际修正，或明确收窄承诺后完成对应验收，不能仅记已知限制签完整 T05。
最小输入/范围补丁只闭合协议层；普通 LI 分类、未提交事实、主链语义与人读/机器一致性仍 open。
通用语义分类器、任意遗漏自动发现、跨语言控制流及 OS 级强隔离不属本次必要扩展。
后续修复及固定验证须按新版本、新系列独立留档，不对当前 SHA 补采样、替换失败或预签通过。
人工真实正常使用体验未完成，不由模型、fixture 或安装发现代签；安装发现也不证明原生 loader 业务执行。
因此当前不可发布；本归档没有实现产品补丁或完成后续验收。

## 证据与保留

公开依据：[评测标准](../../plan/06-evals.md)、[bootstrap 技能](../../../skills/vic-bootstrap/SKILL.md)、[旧归档](2026-10-14-bootstrap.md)。
ignored 本地依据：[第二系列独审](../../../.superpowers/sdd/07-roadmap/M1-second-review.md)、[语义诊断](../../../.superpowers/sdd/07-roadmap/M1-second-semantic-diagnosis.md)。
最终依据：[执行报告](../../../.superpowers/sdd/07-roadmap/M1-second-validation-report.md)、[598 文件清单](../../../.superpowers/sdd/07-roadmap/M1-second-evidence/final-evidence-manifest.json)、[报告与清单独审](../../../.superpowers/sdd/07-roadmap/M1-second-review-evidence/final-report-manifest-audit.json)。
固定附件：[f3 r2 诊断](../../../.superpowers/sdd/07-roadmap/M1-second-evidence/f3-r2-diagnostic/)、[第二批索引](../../../.superpowers/sdd/07-roadmap/M1-second-evidence/early-batch2-index.json)、[第三批索引](../../../.superpowers/sdd/07-roadmap/M1-second-evidence/early-batch3-index.json)。
正式已固定 lane：[lane-a 原始结果](../../../.superpowers/sdd/07-roadmap/M1-second-evidence/lane-a/results/)、[lane-b 原始结果](../../../.superpowers/sdd/07-roadmap/M1-second-evidence/lane-b/results/)。
本归档不改原 raw、规则、产物或失败现场，不删除证据，不以只读审查推断完整宿主/网络强隔离。
