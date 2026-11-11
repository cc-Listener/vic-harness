# vic-harness

把 mattpocock-skills（工作流）和 Understand-Anything（代码事实）组合成一套团队可一键安装、可周期升级的工程 harness。

## Language

**上游**：
vic-harness 组合但不修改的外部插件，目前是 mattpocock-skills 和 understand-anything。
_Avoid_: 依赖库、子模块

**锁定版本**：
某个上游在 marketplace.json 中被固定的 commit SHA 与对应的发布版本号，团队所有成员安装的都是它。
_Avoid_: pin、快照

**接线**：
一条规则，说明 Matt 工作流的某一步在什么时候调用 UA 的哪项能力。全部接线写在 vic skill 的接线表中。
_Avoid_: 集成、桥接、路由

**指针**：
在 runtime 启动上下文中注入的一句话，只告诉 agent 去读接线规则，本身不包含规则。
_Avoid_: 提示词、引导段

**图谱**：
UA 为一个业务仓库生成的知识图谱文件。它用于导航，不能代替源码作为证据。
_Avoid_: 合同、索引

**升级**：
把锁定版本推进到上游的新发布版本，并确认接线仍然有效。
_Avoid_: 同步、更新依赖

**反思**：
在一个周期结束时，把 retro 中与接线有关的结论落到接线表、检查或上游 issue 中。
_Avoid_: 学习、进化
