# 本轮有限交付反馈

本技能内部脚本 `scripts/coverage.mjs` 是只读反馈，区别于 schema 检查；不写目标文件、不执行包脚本，不新增公开技能或合同字段。调查结束及最终交付前都运行一次：

```sh
node <本技能目录>/scripts/coverage.mjs <目标仓库根> <<'JSON'
{"sources":[],"facts":[]}
JSON
```

实际执行填入本轮已完整读取且允许读取的源码/构建配置路径 `sources`；不是只填已写进合同的 evidence，也不含代理配置、legacy、UA、软链、环境凭据文件。`facts` 放上下文已核实但有限模式不能可靠推断的关键事实，每项 `{kind:"GP|VG|PA|LI", owner:"所属合同路径", evidence:["证据路径"], values:{...应有字段值}}`。只用 stdin，不写 manifest 或临时合同。PA 与 LI 分别输入，不能互相替代；定位 values 包含 import/entry/source/exports，PA 另含 path，GP 含具体 path。输入事实不能凭猜测生成，低信息场景允许空数组。

自动检查范围：已存在 canonical conventions 中的常见验证脚本命令与对应 package script 的 VG 投影；有限且明确的 pnpm 根递归同类型聚合；根/子 PA 定义重复；所给源码中构建配置、axios 客户端、拦截器和存储鉴权跳转风险候选及其请求导出 LI。不枚举所有 package script 或 export，不执行命令，不重写格式。准确的 npm test/run test、pnpm run 与 RTK 代理写法可等价；其他合法命令/聚合无法静态证明时回读调用链裁定并在回复给出依据，不能仅为消除反馈强加直接 VG。

结果 `gap` 是跨产物或已核实事实投影缺口；`review` 是有限源码模式命中的候选，可能来自注释或非关键代码，必须回读实际语义确认或排除，不能自动升级为 GP/PA/LI。对每个 finding 在本轮内定向补齐并重跑，或在最终回复逐项写未完成/排除依据；机器输出非零未必是产品 error，但未裁定的候选禁止宣称完整。`covered-within-scope` 只说明有限检查没有发现缺口，仍执行原双向人工核对与产品 checker。未知 schema 返回 `restricted`，沿用原只读迁移保护。

修复前明确“准确保留项”和“事实修正项”：只改对应字段/缺失行及必要状态，不整理原来准确的检索代码块、描述、顺序或链接。源未变且旧产物缺项仍是诚实 refresh；已准确的产物才有资格 no-op，保持零写入。脚本不管理任何外部段落，原 ownership 保护优先。

调用协议要求 API 与 CLI 都显式提交 `sources`、`facts` 两个数组；无 stdin、缺键或非数组返回 `incomplete`、非成功退出，不能作为覆盖完成。低信息场景显式 `[]` 合法，但高信息场景也不能以空集合省略已经核实的观察。

协议校验后，标准根 `contracts/project-context.yaml` 真实缺失（包括正常父目录缺失）返回 `status: incomplete`、`reason: baseline_missing`、`baseline` 标准根路径、空 findings/checked 与 `scope: null`，CLI 仍 exit1。此时未建立 owner、未读取 sources/事实 evidence、未核验事实项、未比较机器投影；零 findings 不是通过。可能仍有非标准 canonical 根，须结合入口与所有权调查决定模式和写权限，不自动判 bootstrap。缺注册子合同、未注册 owner、非法 YAML、权限或软链错误保持原非成功边界，不能归为缺基线；未知根/子 schema 仍 restricted。摘要仅陈述实际 scope，未核验范围不可称匹配。

正常反馈的 `scope` 记录 sources 的 submitted/scanned 路径、每个 owner 的 GP/VG/PA/LI 显式事实投影计数、automaticVG 实际核对命令数量，以及 paDuplicateChecks 子层 PA 与根定义的重复核对数量（根层 count 为零，rootDefinitions 是比较基准数量）。零计数表示该类显式投影未执行，不能推导该类不存在；只提交一条 LI 就仅证明该条投影匹配。摘要仅按实际范围表述，不以各类有数量或零 findings 推导完整调查。事实语义分类、未提交观察集合、组件文档语义始终未验证，仍须双向人工核对。
