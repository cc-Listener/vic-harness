# 变更记录

## 0.1.0（开发中，未发布）

- 建立 Codex 插件、本地 marketplace 与六个技能入口，明确显式调用和自动调用边界。
- 实现项目事实合同 schema 与兼容迁移规则、合同及代理配置的确定性只读检查；需要 Node >=18，零 npm 运行时依赖。
- 实现 bootstrap 增量维护、agents 最小代理配置、check 结果解释与 router 工作流推荐。非标准入口或未知自定义合同保留原件，按只读受限范围处理。
- 提供 f1–f4 fixtures、断言器及真实 L2 两轮评测运行器，保留来源、事件、树比较、检查与用量证据；最终 M1 各三次同源系列仍待验。
- 接线固定 SHA 的 Matt 外部插件，本地隔离安装与发现已验，物理干净机器仍待验；Understand-Anything 尚未集成。
- 插件保鲜 CI 本地验收通过，真实 GitHub PR 验收仍待执行。
- learn/prune 仍为 M2/M3 占位；过期检测、refresh-log 和 hooks 尚未实现。已知行为限制见 [bootstrap incidents](docs/harness/incidents/2026-10-14-bootstrap.md) 与 [agents incidents](docs/harness/incidents/2026-10-14-agents.md)。原生插件业务调用、人工体验与发布批准仍待完成。
