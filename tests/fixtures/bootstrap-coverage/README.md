# Bootstrap 覆盖检查的真实反例片段

来源：M1 固定 f2 r2 的 `M1-final-evidence/f2-r2-diagnostic/first.tree.json` 与 `second.tree.json`，原证据保留于 `.superpowers/sdd/07-roadmap/`，只读且不随测试发布。对应独审定位见 `T05-M1-fix-brief.md` 和 `M1-review-evidence/f2-r2-independent.diff`。

本目录两个 JSON 各仅保留测试实际读取的15个文件：根与两个应用 package 清单、三个事实合同、三份 conventions、web 组件文档、两个 Vite 配置、web 路由、请求客户端及 interceptor。每项 base64 是该轮真实文件的原始字节，sha256 与原附件对应项一致；没有修改文本或用预期答案重写产物。首轮保留真实遗漏，二轮保留真实修正及原文本；本夹具不裁定二轮所有文案改动都是必要变化。

没有包含环境文件/环境值、无关业务源码、代理配置、原完整证据、事件、评测 expected 或外部测试树。事实合同中原有相对 evidence/path 指针原样保留，指向未收集文件不代表这里构成完整产品 checker 夹具。本片段只为有限覆盖反馈测试服务。

测试默认仅依赖本目录的跟踪数据，临时重建所选文件，并验证每项原始字节的 sha256。内部实现不读取本目录或依赖 f2 名称、路径和符号；不包含可被 Node 默认发现的额外测试文件。2026-10-14 提取后已逐项对比两轮各15项原始 base64 字节及源 sha256，30/30一致。
