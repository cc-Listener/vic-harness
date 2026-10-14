# 2026-10-14 bootstrap 已确认行为问题

日期：2026-10-14。状态：open。这是人工问题记录；当前未发现 incident 模板，不提前实施 T13 自动学习或模板。

## 来源与验收边界

B01–B04 限定于冻结源 `0335d370-65a0-4737-9b9c-6b057666b8ee`，主技能 SHA256 `cb6236147100c95c2f4bc4ce1dd71f19f1b3926a8f077a3b449cb2051d209e30`，六文件树 SHA256 `4575ebe06b2c92804ecd3fb03e63808fb18aa3a7334210230f8489d994af6f8b`。请求模型为 `gpt-6-luna`、推理档位 `medium`；实际服务端模型和档位均未知。显式 source-path 执行不证明原生插件加载。

规定 L2 依据固定 expected、checker 和真实二轮幂等计账；附加语义审计另行保留。原票每份至少一次真实完整两轮通过与 M1 同源每 fixture 三次至少两次通过是不同门槛；本文不结算整票或发布是否通过，不混用旧源、未知默认请求条件或其他模型条件。旧 `8d62557b` 报告仅供历史诊断，不能替代本源结果。

## B01：请求使用定位遗漏（P2，open）

触发：调查实际请求封装调用后生成根或应用事实产物。观察：以下 run 保留请求事实，却遗漏适用组件定位表及 locate_index（LI）的关键使用定位。

| run ID | 已确认观察 | 规定 L2 与附加质量 |
| --- | --- | --- |
| `2026-10-14T10-15-44-341Z-f2-monorepo-b583875b` | web 表和 LI 只有 UI；根/web 地图、CR、GP 有请求关系 | 固定断言、二轮 no-op、checker 通过；附加请求定位覆盖不完整 |
| `2026-10-14T10-22-22-342Z-f1-single-app-ad2171f4` | 首轮及最终 PA/LI 与定位表只有 UI，Settings 实际调用的 client 缺定位 | 两轮固定断言、no-op、checker 通过；附加请求定位覆盖不完整 |
| `2026-10-14T10-22-22-342Z-f2-monorepo-e648660c` | web 表与 LI 仅 AcmeButton；client.get 出现在检索示例/地图等关系中 | 两轮固定断言、no-op、checker 通过；附加请求定位覆盖不完整 |

期望：已核实的实际封装使用场景进入所属组件文档及 LI，交付真实 import/entry/source/exports；准确地图、guarded paths（GP）或 conventions rules（CR）不能替代该结构化条目。web 已核实源码从 `../request` 导入 client、调用 `client.get('/profile')`，请求入口创建 axios 实例并安装鉴权拦截器。PA 空数组本身不独立判错，不强造复用推荐政策。

影响：只消费 LI 的检索缺少直接入口，增加补查成本；已有准确地图、GP/CR 和源码导航可补查，尚无证据证明必要下游因缺项无法工作。独立范围裁定评为 P2，不自动阻塞 T05 原票或 T08/T09；M1 仍须明确是否接受已知限制。不能声称完整行为无缺陷，也不能据附加失败追溯把上述规定 L2 pass 改成 fail。

已知机制：已调查事实未完成跨产物覆盖。未知：具体内部生成顺序及执行遗漏根因；流程诊断只支持改进假设，未证明“先写 Markdown”是主要根因，更未证明修复成功。

处理与后续验证：保持 open，由 bootstrap 后续行为修复及 M1 审查承接；不手修旧产物、不改 expected、不追加无界抽样。若后续制定覆盖测试，应明确新测试版本与固定来源，并独立核对发现事实到 LI/文档的覆盖及备用导航实际影响。

## B02：有效别名引起无必要刷新（真实幂等失败，open）

run ID：`2026-10-14T10-15-44-341Z-f1-single-app-ffddab81`。首轮推荐 `@/request` 有 Vite 与 TypeScript 配置支持，正文已经准确说明页面实际使用 `./request`，两者指向同一入口。第二轮却改 LI import、增加已有入口说明，变更 `contracts/project-context.yaml` 与 `docs/component-contract.md`，mode 为 refresh。

期望：事实及覆盖充分时二轮零写入；现有 schema 未要求 LI.import 必须逐字复制调用处字符串，不能新造门槛。影响：产生无必要仓库变更，真实幂等失败；规定 L2 fail 原样保留，不能用“修正事实”翻案。此条未另获独立 P 级裁定，不擅自分级；零写边界不适用 B01 的非阻塞豁免。已知是将充分定位误判为刷新需要，内部判断机制未知。

处理与后续验证：open，保留原首轮/最终差异与失败；后续以语义覆盖判断 refresh，并用完整文件树、字节/权限和实际写入事件核验二轮，不以最终口头 no-op 替代。

补充原始结果：同源第三次 f1 `2026-10-14T10-26-52-937Z-f1-single-app-148c2047` 首轮通过，第二轮实际 mode 为 refresh，`final_assert.pass=false`（29 pass、3 fail）；完整树 changed 为 `contracts/project-context.yaml` 与 `docs/component-contract.md`，规定 L2 为 fail。本条仅记录刷新及树变化事实，不把第一次别名裁定的根因套到第三次。

截至本次归档，同源 luna f1 三次规定 L2 仅 **1/3**（第一次 fail、第二次 pass、第三次 fail），未达每 fixture 至少两次通过门槛。f2、f3 各执行两次，第三次未执行；f4 仅一次，后两次重复未执行，因此系列尚未完成 M1 三次评测。这里是规定 L2 统计，不以附加请求定位缺口覆盖原始 pass，也不计入请求 sol/low 被拒绝的两个环境失败。

## B03：外部段少一换行（真实字节保护失败，open）

run ID：`2026-10-14T10-19-38-395Z-f3-legacy-layers-03363257`。首轮 `AGENTS.md` 的 `## Agent skills` 外部段由 262 字节变为 261 字节，丢失一处换行。固定 expected 的 `sections_unchanged:AGENTS.md:## Agent skills` 实际拒绝：首轮 21 pass、1 fail、幂等待验；未执行第二轮。

期望：外部所有权原文字节保持。影响：真实所有权/字节保护违规，规定 L2 fail 必须保留，不能降为格式偏好、套用 B01 裁定或说已修复。此条未另获独立 P 级裁定，不擅自分级。已知产物字节变化与断言失败；具体产生机制未知。

处理与后续验证：open，bootstrap 后续修复需同时验证外部原文字节和实际写入边界；其他 run 的成功不覆盖本次失败。

## B04：普通脚本入口出现在封装表（P3，open）

run ID：`2026-10-14T10-19-38-395Z-f4-empty-5b96c100`。组件表以“仓库脚本入口”行展示 `main.py/main`，明确标为普通脚本函数、不是共享封装，正文也说明未发现共享封装；机器 systems/PA/LI 为空，指向真实源码。

期望：无组件表行的 import/包入口/源码/导出按 artifacts 写“未发现/无法确认”。观察与该具体展示规则有偏差，但未虚构封装、推荐错误 import 或生成虚假机器组件。影响/严重度：P3 展示偏差；规定 L2及本票样本 pass 可以保留，不宣称逐条格式完全遵守。已知呈现偏差，内部执行原因未知。处理：open，后续做无封装场景表示回归，不改原产物或样本结果。

## 独立真实仓库受限输入试用记录（未完成刷新）

日期：2026-10-14。run ID：`bootstrap-20261014T104734Z-3e2286ad`。冻结受审提交 `24188fbb84a799c3aac45eceded6915ad3fc0331`。本节与 B01–B04 的 luna 固定 fixture 样本分开：正常加载用户配置及其 provider，显式请求 `gpt-6.1-sol` / `low`，请求接受并自然完成；实际后端模型及档位仍 unknown。provider 配置一致性不证明独立网络路由或完整宿主隔离。本节不改旧样本结论，不参与其规定 L2 分母。

触发与观察：真实仓库根及前端子合同为自定义 `version: 3` / `schema_profile: local`，包含 deployment/control_plane/git_workflow 扩展；冻结迁移规则没有对应无损迁移定义。模型主动进入 restricted 受限调查，停止合同及依赖导航写入，明确“刷新未完成，仓库零写入”，未归类 no-op，也未宣称 bootstrap 或标准迁移成功。期望：在没有无损定义时保留自定义扩展与消费者边界，只读报告缺口；后续刷新先明确无损迁移方案。

实际执行证据：exit 0、93.760 秒，原始事件单个 turn.completed、零 turn.failed/error、零 file_change；没有可见写命令或依靠写入拒绝冒充主动停止。所需技能、所有权及受限识别材料有成功正文读取证据。冻结路径盘点/检索 item_14、item_17 均 exit 1 且输出空，不能当作成功读取，原因未知。

标准 checker **未通过**：模型及外部前后检查均 exit 1、132 error / 3 warn，外部 before/after JSON 逐字节相同。计数为 C01=127、C02=4、C06=1、A03=2、A04=1；涉及标准 schema 不兼容、必填/路径及历史文档路径问题。模型如实报告，没有删除自定义扩展或修改历史问题追求零错误。执行成功与保护分支遵守不覆盖 checker 失败或未完成刷新；本次不是已证实的新产品保护缺陷，不新增严重度或归因。

保护证据：副本 410 个非 .git 树条目的字节/大小/权限及 HEAD、Git 状态前后相同，changed_paths 为空；原仓库 322 个 tracked 文件字节/大小/权限、HEAD、状态与原保护基线相同，原完整非 .git 树 68,407 个条目元数据相同；冻结技能及共享资源 hash/权限树相同。原仓库 ignored/未跟踪内容未读取，`source_ignored_bytes_verified=false`，不能宣称全部字节验证；没有完整宿主系统调用监控。模型自身未验证完整树，以上保护比较来自外部技术证据，两者不混称。

已知与未知：已知自定义合同无对应无损迁移定义、模型主动受限零写及标准检查失败；未知消费者兼容性、完整应用事实覆盖与无损迁移方案。项目测试/build/lint、人工体验、原生 loader 未验，`complete_bootstrap_verified=false`、`native_loader_verified=false`。不得将这次真实试用降级改绿或作为 M1 发布通过。

处理与后续验证：保留受限输入及未完成刷新记录，后续需明确自定义合同和消费者的无损方案，再安排适用验收；本次不实施迁移、不重试、不手修输出。ignored 证据仅本地可用：[试用报告](../../../.superpowers/sdd/07-roadmap/M1-bootstrap-trial-report.md)、[原始结果](../../../.superpowers/sdd/07-roadmap/M1-real-trial/bootstrap-20261014T104734Z-3e2286ad/result.json)、[原始回复](../../../.superpowers/sdd/07-roadmap/M1-real-trial/bootstrap-20261014T104734Z-3e2286ad/last-message.txt)、[保护比较](../../../.superpowers/sdd/07-roadmap/M1-real-trial/bootstrap-20261014T104734Z-3e2286ad/protection.json)、[检查前](../../../.superpowers/sdd/07-roadmap/M1-real-trial/bootstrap-20261014T104734Z-3e2286ad/before-check.json)、[检查后](../../../.superpowers/sdd/07-roadmap/M1-real-trial/bootstrap-20261014T104734Z-3e2286ad/after-check.json)。

## 证据与发布限制

公开规则见 [评测标准](../../plan/06-evals.md)、[路线图](../../plan/07-roadmap.md)、[bootstrap 技能](../../../skills/vic-bootstrap/SKILL.md)。本记录保留具体观察与裁定，即使本地附件不可用仍可理解问题。

ignored 原始证据仅本地可用：[验收范围裁定](../../../.superpowers/sdd/07-roadmap/T05-acceptance-scope-adjudication.md)、[首次行为裁定](../../../.superpowers/sdd/07-roadmap/T05-luna-first-adjudication.md)、[流程诊断](../../../.superpowers/sdd/07-roadmap/T05-workflow-diagnosis.md)、[绑定记录](../../../.superpowers/sdd/07-roadmap/T05-luna-binding.json)、[行为审计](../../../.superpowers/sdd/07-roadmap/T05-luna-behavior-audit.json)。上述 run 的原始 result、断言、事件、首轮与最终产物位于本地 `T05-fixed-runs/<run ID>/`。

本次归档编辑不新增模型运行、产品修复或测试结论；上述独立真实试用已由既有原始证据记录。P2 定位缺陷不自动阻塞原票不等于 M1 可发布；所有真实幂等、外部字节、安全与所有权边界失败继续独立计账，发布所需完整采样和其他既定门槛仍须另行验收。
