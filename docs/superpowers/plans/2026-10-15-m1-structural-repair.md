# M1 方案 B 实施计划

> 面向执行代理：使用 `superpowers:subagent-driven-development` 按任务执行；每包 fresh 实现、独立审查，root 更新进度并精确提交。执行方法由 HANDOFF 与用户已确认方案确定，不再重复请求 reviewer 授权。

**目标：** 用真实进程结果工具和源码优先独立审查处理 F03、F04、不实验证的失效机制，不预签行为缺陷已闭合。

**架构：** bootstrap 内部固定 Git 工具只读检查指定文件并直接生成结果/中文摘要。语义协议使用宿主实际独立上下文与返回，源码、产物和最终声明分别核对；无能力时明确未完成，不以自报审查对象替代调用。

**技术栈：** Node ≥18、node:test、现有 Markdown skill 与原生宿主工具；零 npm 运行时依赖。

**规格：** [已确认设计](../specs/2026-10-15-m1-structural-repair-design.md)。实施前基线 `0045760`。

## 全局约束

- 简体中文输出，所有 shell 命令以 `rtk` 开头；使用现有 `feat/vic-harness`，不推送、发布或打 tag。
- apple-tools 原仓与隔离副本不重跑；旧原件/评分/expected 保持；M2/T10 不启动。
- 一个 reviewer 上下文，源码与实际产物/最终声明两个必要回合，最多再复核一次；禁止递归/业务执行/代理配置读写。
- no-op 零写且不新增 Git gate；本次只有用户批准的边界例外可同步原规划，其余规划/ADR/reference 原件不改。
- 测试必须覆盖真实接口与反例，不为 Markdown 文案写镜像测试；机制与真实模型行为分证。

## 审查重点

1. Git 重定向、include 与未知工具不能让指定 root 悄悄变成另一个仓库（任务 1）。
2. 子进程非零且双流空、超时/信号/截断均非通过；proxy 外层不冒充内部 Git 退出（任务 1）。
3. 特殊文件名、子路径软链、untracked/staged、受保护尾空行不能被范围或修复误处理（任务 1）。
4. 有新 agent ID 但继承作者推理、只有转贴 JSON 而无原始事件，不能分别签独立或真实性（任务 2）。
5. 审后文件/检查范围/最终声明改变、预算耗尽及第二轮旧错误，不能沿用旧结论或为零写隐藏缺陷（任务 2）。

## 任务 1：固定 Git 检查工具

**文件：** 新建 `skills/vic-bootstrap/scripts/git-check.mjs`、必要时内部 `git-check-process.mjs`，新建 `tests/bootstrap-git-check.test.mjs`、`references/git-check.md`。本包不改 SKILL 或其他包文件。

**接口：** 导出 `checkGitWhitespace(options)`，接收 `{root, paths, comparison:'index-to-worktree', proxy:'none'|'rtk', gitExecutable?, rtkExecutable?, timeoutMs?}`，生产超时不超过120000ms、每流上限1MiB；返回单个版本化对象 `{version:1, scope, command_form, execution, verdict, report, limitations}`。状态由实际进程产生，`verdict` 为 `passed|failed|unknown`；`execution` 保留被观察进程的 code/signal/捕获完整性和实际失败原因。CLI 固定 `--root --comparison --path`（可重复）`--proxy`，不接受任意命令、调用者exit或verified。正常通过CLI exit0，检查明确非零exit1，不能形成结论exit2；报告保留实际被观察进程退出码。API测试可缩短timeout，不能放宽上限。

- [ ] 写最小红测试：code非零/输出空实际子进程仍 `failed`；正常 code0且完整捕获才 `passed`；检查范围与中文摘要一致。实现缺失时测试必须真实失败。
- [ ] 实现只读资格检查：路径逐文件、literal pathspec、禁读与软链拒绝；无默认全库；实际工具/元数据与环境/配置资格；不输出配置秘密。无法确认就unknown，不能以模型 `reviewed:true` 认证。
- [ ] 固定argv无shell，关闭ext-diff/textconv/fsmonitor/pager；约束Git环境注入，保留whitespace含义与Git自身保护，不初始化/安装/改目标。必要元数据读取不能声称为零元数据读取。
- [ ] 实现子进程完成/双EOF/信号/超时/超限处理及规范摘要。RTK模式只证明代理过程，传播不能确认时不冒称内部Git结果。纯导入不得读取stdin、执行命令或打印。
- [ ] 扩充真实自有临时Git正反例：受保护尾空行保持；空scope/目录/glob/pathspec/越界/软链/禁读拒绝；untracked与staged-only明确未检查；特殊文件名literal；环境重定向/include/未知shim拒绝或unknown；timeout/signal/截断非通过且无遗留进程。mock只测观察映射，不能冒充实际Git证据。
- [ ] 运行 `rtk proxy node --test tests/bootstrap-git-check.test.mjs`，再用已有Node18运行同文件；保存命令、原输出、失败与修复证据。只在实际依赖变化时增加相关测试，不重复旧整套评测。
- [ ] 独审者对照规格检查并按HANDOFF独立运行本包必要定向验证；root收到实现/独审后精确提交。报告放 ignored 实施账本，不新增目标仓库状态文件。

## 任务 2：接入独立语义审查与工具

**文件：** 改 `skills/vic-bootstrap/SKILL.md`、`references/artifacts.md`、`coverage.md`、`refresh-policy.md`，新 `references/semantic-review.md`；同步 `docs/plan/00-vision.md`、`03-skills.md` 的获批例外，必要的使用说明；不改公开schema/expected或现有ADR。任务1的reference接口只引用不复制。

**消费：** 任务1真实CLI结果；现行coverage仅有限反馈；实际宿主新上下文、续传与原始事件能力分开检测。

**产出：** 可执行的技能流程和唯一审查reference，定义阶段、输入、返回、范围绑定、缺能力/未决/预算耗尽路径。不是编造宿主API的JS控制器，不新增自填review-pass验证器。

- [ ] 根据当前工具和既有核验资料，完成宿主适配矩阵：fresh/no-history、同一reviewer续传、原始工具事件分别已知/未知；不读取宿主config/auth，不把开发环境推广全安装环境。
- [ ] reference明确源码阶段不接收作者分类自评；产物阶段独立读实际文件及最终声明全文；返回 `supported|contradicted|unresolved`、证据、读集与对应修订。无真实事件只可审源码语义，验证声明保持未核实。
- [ ] 接入bootstrap调查/模式/no-op/检查/交付流程；准确no-op零写，发现错误诚实refresh。审后改文件或扩大声明使对应结论失效，最多一次复核；未决不签完成，普通导航/合法LI/准确时序保留。
- [ ] 固定Git工具只在本次已选检查时调用，按原ownership逐文件范围；不把Git结果写成项目VG，不增加日志或新持久字段。
- [ ] 同步用户批准的“不启动代理”限定例外及说明，保留不执行业务/不配置代理/不递归；独立职责不宣称OS沙箱；`SKILL.md`≤150行。
- [ ] 用有来源的静态情境逐条走查：F03错时序/正确callback与dynamic import；F04人机一致错/仅机器错/合法无PA封装/空集合漏项；无native能力/历史继承/原事件不可见；最终失败改通过/审后范围扩大/预算耗尽。此为协议走查，不称真实行为测试，不写文案镜像测试。
- [ ] 独立审查实际改动、链接、行数、与任务1接口的一致性及上述反例；root精确提交。必须修复项先修，不跳后包。

## 任务 3：集成核验与行为验收准备

**文件：** 必要的直接回归；本计划、正式progress和独立审查记录。新行为评测计划单独留存，不重写原runner条件/旧评分。

- [ ] 核对任务1/2完整产出，运行一次受影响范围的整合确定性测试（必要时最终默认node --test），只报告实际当前代码结果；独审复查实现和最终声明。
- [ ] 核对新文件能从技能实际安装相对位置引用；无需重做已有整套安装发现，若有新加载风险用局部bundle导入验证。
- [ ] 针对最终冻结源码预登记定向行为验证的输入、反例/对照、轮数、原生审查能力、失败/未决和停止条件。没有原始事件能力时，不把测试runner的记录伪装成产品通用能力。
- [ ] 新行为运行须明确范围，不自动发起第五系列、复用旧通过或重跑apple-tools。若能力仍缺，完成能做的确定性与协议交付并准确保留相应阻塞，不宣称三项P2已闭合。
- [ ] root记录实现提交、独审、测试与仍缺证据；不发版、不代签人工体验、不进入M2。

## 计划自检

任务1产出结果接口，任务2只消费并引用；两者写文件不冲突。任务3验证实际集成而非重复历史验收。公开schema、entry_chain语义与旧expected不变，强制宿主出口/语言解析器不在范围。reviewer权限、身份、原始事件和语义判断分别有准确限制；没有遗漏已确认设计中的最终声明审查或Git环境边界。用户已选路线和执行方式，按现有授权实施，不再设置相同批准点。
