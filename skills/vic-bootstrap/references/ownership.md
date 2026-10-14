# 文件与段落所有权

每次盘点和写入前读取。先按主 skill 的执行边界把路径分为可维护、可读只读、禁读三类，再读取正文；所有权决定允许修改的范围，行数预算、去重或迁移都不能扩大权限。
禁读资产只允许路径级发现；后续批量读取、递归内容检索、哈希与保护检查都从输入集合中排除它们。其内容只由产品检查器按自身职责读取/报告，外部验收可独立比较完整性；“保护原文”不是 bootstrap 的读取授权。

| 文件或范围 | 所有者 | 本 skill 的操作 |
| --- | --- | --- |
| 根或 app `AGENTS.md` 主体 | vic-bootstrap | 维护导航，保护外部段落 |
| `AGENTS.md` 的 `## Agent skills` 段 | Matt setup | 原始字节保留 |
| 根或 scoped `AGENTS.override.md` | 用户 | 只读，优先级高于同目录 AGENTS |
| 项目地图、事实性 conventions、组件合同及其已确认等价文档 | vic-bootstrap | 增量更新受影响部分 |
| `contracts/project-context.yaml` 及其 app 子合同 | vic-bootstrap | 维护项目事实，保留有效旧字段与稳定 ID |
| `CODING_STANDARDS.md` | 用户 | 只读、只索引；判断性规范不复制到 conventions |
| `GLOSSARY.md`、`GLOSSARY-MAP.md`、`docs/adr/` | Matt domain-modeling | 只读、只索引 |
| `docs/agents/*` | Matt setup | 只读、只索引，不做 legacy 纠偏 |
| `.ua/*`、`.understand-anything/*` | Understand-Anything | M1 保留文件，不消费图谱事实；来源核验留 T14 |
| 代理配置与旧平行层 | vic-agents / legacy | 遵守主 skill 的代理配置边界，检查器报告后转交迁移 |
| 已有 `CLAUDE.md` | 用户 / 其他工具 | 保留；可选桥接生成留 M3 |
| 源码、配置、包清单、环境文件、CI、贡献指南 | 项目维护者 | 读作证据，不修业务或改配置 |
| 未明确归属的现有文档/段落 | 用户或外部工具 | 保守保留，记录冲突或 uncertainty |

## 外部段落保留流程

1. 写前按原始字节提取外部标题到下一个同级或更高级标题之前的完整段落，包含原换行、空行、代码块、子标题；fenced code 内的假标题不结束段落。
2. 只重写本 skill 的主体范围，插回原段落字节。不得重排、改标点、翻译、调整缩进或换行。
3. 写后比较段落字节及允许读取的只读文件 SHA256；禁读资产不参与本 skill 的哈希。改变任何受保护内容即撤回该项改动，修正后再验收。
4. 标题重复、范围不清或所有权冲突时保留相关原文，并在回复/uncertainty 说明，不能猜测可删范围。

先精简自己的段落，使导航尽量 ≤120 行。若外部原文自身导致超预算，保留其字节，报告 C03 和超限原因；不得截断外部段落，也不得把 error 包装成成功。

## 分层与相邻资产

导航指向 canonical 文档，细节与事实放到对应层。用户的 override 不替换成第二份地图；现有 app guidance 的目录作用域继续生效。
重复导航的 legacy 文件只列入报告和 `$vic-agents` 的迁移建议，不改写。任何“受影响文件”清单只能包含实际有权且确实改动的文件。
M1 不新写 `integrations/foreign_sections` 或 refresh-log；所有权保护本身立即执行，不等待 M2 的结构化检测。

## 直接提交最终文本

优先使用宿主已有文件编辑/补丁工具，直接提交本轮已核实的最终内容或定向 diff，不要求把 Markdown/YAML 手写为 JavaScript 字符串。先确认实际授权路径、目录和需改范围；已有文件完整读回，只改实际缺口，保留外部段原始字节、有效字段、合法原文、CRLF、无末尾换行及 mode。写后读回并逐字节核对保护范围；工具不能精确保留或安全合并时如实报告未完成，不能用整文件覆盖绕过。`no-op` 不调用写工具，不新增 writer、scratch 或可执行生成器文件。

工具传输仍须正确编码，YAML 引用与文档 shell 命令语法仍须核对；文档命令和 YAML 解析后命令分别与同一已核实值对照。正确的正则反斜杠、检索/外部示例不全局删除，不能用零 diff 掩盖事实错误。

编辑工具的保留能力须按实际边界确认，不能从 LF 文本/mode 保持推导无末尾换行也保真；若补丁会追加末尾换行而原文要求精确保留，该工具不可直接用于该项修改，应保留原文件并报告未完成。

带单引号的 heredoc 仅防 shell 展开；`node --input-type=module -` 的 stdin 仍是 JavaScript 程序，`String.raw` 仍受反引号边界约束，任意 stdin 不自动保真。coverage 的 stdin 是 JSON 数据，与文本编辑或程序 stdin 区分。
