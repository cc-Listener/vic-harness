# M1 方案 B 定向行为验收

本记录只判断固定候选 `f749b889b385d0276bc6623a3d177e500c160d72` 的一个自有微型样本，不重判第四系列、旧失败或 apple-tools 试用。产品来源为该提交的仅已跟踪隔离导出；确定性整合、独审和测试范围事故另见[进度](../../plan/progress.md)与[事故记录](2026-10-15-m1-node18-test-discovery.md)。

## 单元与输入

第一单元预登记一次显式 bootstrap 新生成：一个 fresh 作者，由作者实际调用一个独立 reviewer，源码与实际产物/完整最终声明两个必要回合，最多一次复核。输入为新建普通 Git 仓库的12个文件，其中10份源码共67行；index已建立但无commit，`protected.txt`工作树比index多一个受保护LF。作者和reviewer不读取预登记判定表、构造清单、旧答案或开发oracle。

第一单元结束后，root针对尚未覆盖的新协议真实no-op路径，另行预登记一次现有产物验收：保持同一来源与实际五份产物，用另一个fresh作者和独立reviewer重新判断模式。一次调用，不选择Git检查，不重建样本或重复到通过。两个单元及各自预算、结果分别保存，未把第一单元原来未覆盖的范围追记为已覆盖。此后不再自动追加行为运行。

两次作者创建的`fork_turns:none`及返回由root直接调用观察；reviewer创建参数由作者报告。root用原生`list_agents`取得各reviewer的实际完成返回，能够确认身份及返回内容；该接口不展示父方创建参数，不据此独立认证fresh参数。第二回合reviewer实际确认同一上下文续传。只读是职责约束，不是强制沙箱。

## 第一单元：实际生成

实际新增恰为`AGENTS.md`、根合同与三份默认docs，共5文件和2目录。首次候选即通过两回合源码/产物语义核对，没有产物反证、修改或第三回合，不能把它说成“已展示拦截并修正错误候选”。root独立读回五份产物，并从目标外保存首次候选及终态完整内容。

| 审查面 | 实际有限结果 |
| --- | --- |
| F03：初始化先后 | 地图明确router与taskState模块顶层初始化在main调用bootstrap之前；显式main→bootstrap→render调用另述；未把详情dynamic import写成启动必经支路。 |
| F04：普通符号误分类 | greeting留在普通符号索引，没有进入共享表、PA或LI；普通导航没有被删除。 |
| F04：合法对象与反向遗漏 | 名称工具、状态封装均有真实消费并进入PA/LI；overview/editor局部接口保留LI而不强求对应PA，共4项LI、2项PA。没有用空表或空LI避开语义核对。 |
| 失败声明 | 最终回复保留固定helper失败，区分CLI退出1与被观察RTK代理退出2，限定protected.txt的index→worktree范围，没有改称全通过。实际执行数字对root和reviewer均来自作者转述，不能当独立原始事件。 |
| 文件保护 | root完整快照由67项变为74项，只增加上述5文件、2目录及根目录mtime变化；12原输入、原.git文件及index在观察点间保持。两个reviewer阶段及helper阶段前后74/67项集合、内容、类型、mode、mtime均无变化。 |

作者报告首次coverage为exit1/baseline_missing，生成后coverage为exit0/covered-within-scope，checker为exit0、0error/0warn，唯一helper为CLI exit1/verdict failed。reviewer独立核对这些转述的结果含义与完整声明一致，明确执行真实性仍unresolved；没有通过重跑检查或读取root混合历史补成认证。本记录不将作者报告的命令结果升级为独立执行证据。

该样本保留了准确加载期事实与合法局部封装。`entry_chain`的具体表示不作为新评分，不据这次两个节点的数组选择裁定其未来通用语义。没有测试循环、顶层await、所有动态触发情形或全部低信息项目，也没有重新回放原十二槽。

## 第二单元：现有产物

实际判定`no-op`。作者和另一个reviewer按实际源码、既有产物和原协议重新判断；reviewer两回合读回17个允许文件，源码、人读、机器关系supported，无contradicted、无文件修订或第三回合。旧conventions的Git流程文字没有被作为本次检查发生的证据；作者明确本次未选择/未执行Git helper。

root将最终完整74项树与第一单元结束基线比较：新增0、删除0，字节/type/mode/mtime变化0，包括12原输入、5产物、目录及.git/index。各reviewer阶段前后比较亦无变化。这是外部独立观察的整轮no-op正证据，不冒称reviewer自己读取了.git或完整树前态。

作者报告两次coverage均exit0/covered-within-scope，checker一次exit0/0error/0warn；它们的实际执行次数和退出值对独立reviewer仍未核实。reviewer没有以文档/合同一致性或root转述代替原始事件，最终草稿明确保留该缺项。真实no-op结果只支持该修订、样本与宿主，不推广为所有场景零副作用。

两单元合计2个作者上下文、2个reviewer上下文、4个必要reviewer回合，无第三回合或补抽。root观察窗口分别约12分钟与6分钟，包含协调等待，不能冒称模型纯运行时间；均未达到各自预算。requested作者模型为gpt-6.1-sol、reviewer为gpt-6-astra/low，实际模型及token没有独立数据。

## 证据与限制

本次ignored证据根为`.superpowers/sdd/2026-10-15-m1-structural-repair/`：

- 来源及预登记：`behavior-input-manifest.json`、`behavior-run-binding.json`、`behavior-validation-registration.md`、`author-prompt-frozen.md`；现有产物单元为`noop-validation-registration.md`、`noop-run-binding.json`、`noop-author-prompt.md`。
- 观察及回复：`behavior-events.jsonl`、`noop-events.jsonl`、`behavior-snapshot-*.json`、`behavior-final-draft-v1.md`、`behavior-final-response.md`和后续no-op回复。快照含完整目标集合、内容及元数据，保存在目标外。
- 快照证明限定观察点之间的差异，不证明从未出现并消失的临时写入、不访问其他路径或强制权限隔离。作者原始工具事件和完整行为史未独立取得，requested模型不冒称actual模型；token消耗未知，不填0。

独立收尾核对`behavior-closeout-review.md`确认记录准确、无需必修；实际复算三份74项快照及内部内容hash，并核对17个当前文件和12原输入。root采用其状态建议：F03/F04为“修复正证据、仍待补证”，暂不关闭发布缺陷。任务2的静态反例走查已完成，但本轮首次候选即正确，没有展示错误候选被实际检测、修正并复核的链路；fresh创建参数的独立事件证据也未取得。这些缺项不否定已实读确认的正确时序与分类，不扩张为必须覆盖所有循环/TLA或所有低信息项目的无限清单。

不实验证的独立执行事件缺口仍未闭合。当前暴露接口未提供可关联作者本轮的原始事件通道，转贴结果、共享文件和重复执行不能替代；依获批方案的缺能力分支明确未完成，不通过继续加文字约束或重复新生成补成通过。后续检测链验证与事件来源须先具体定界，本轮停止追加行为运行。

本次也未代签原生loader业务、物理干净机器、真实远端、apple-tools人工体验或发布决定。M1整体与M2/T10继续保持原边界。
