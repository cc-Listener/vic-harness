# 08 · v1 → v2 迁移清单

两个 v1 原件放在 `reference/v1/`，**只读，不要修改**。迁移时逐项打勾，完成后把本清单的勾选结果贴进 `progress.md`。

**总体原则：保留 v1 已经做对的设计，只修问题和补进化能力。** 两个 v1 skill 的分层思路、证据优先、保守处理不确定性、增量刷新、零改动允许等规则都要保留。

---

## 1. project-bootstrap-contract → vic-bootstrap

### 必须保留
- [ ] bootstrap / refresh / no-op 三分类及判定规则
- [ ] 导航层只承担读取顺序、canonical 指针、最小路由、少量 hard stops
- [ ] 人读文档和 machine-readable 事实分离
- [ ] `AGENTS.override.md` > `AGENTS.md` 的优先级处理
- [ ] app-deep refresh 的触发信号和产物
- [ ] component-contract 质量门（定位表、符号索引、定位顺序、`rg` 命令）
- [ ] 文档落位策略（根目录集中 + `docs/apps/<app>/`）
- [ ] 无法证实就标 uncertainty，不编造
- [ ] 人类可读输出默认简体中文，字段名、路径、术语保留英文

### 必须修改
- [ ] **删除绝对路径** `/Users/aze/.codex/skills/multi-agent-config/SKILL.md`，改为 `$vic-agents`
- [ ] **修正与 multi-agent-config 的矛盾**：v1 写着 `.codex/agents/topology.yaml`、`roles/*.md`、`bridges/*.md` "应由 multi-agent-config 负责"，但 multi-agent-config 明确**不生成**这些平行层。v2 改为：`.codex/config.toml`、`.codex/agents/*.toml`、`.codex/AGENTS.md` 归 vic-agents；平行层不再由任何 skill 生成，发现时由 vic-check 报 warn
- [ ] 统一 refresh 证据字段：SKILL.md 列了 7 个，两份 reference 只列了 4 个。v2 以 `schemas/refresh-log.schema.yaml` 为唯一定义，其他地方只引用
- [ ] app-deep 整节移到 `references/app-deep.md`
- [ ] 去重：「不生成 `.codex/agents/*`」重复约 6 处、语言规则重复 3 处，各保留一处
- [ ] schema 规则与示例分开，放到插件根 `schemas/`
- [ ] schema 补字段：`locate_index`、`locate_order`、`search_commands`、`apps`、`integrations`、`foreign_sections`、`watch_paths`、`refreshed_at_commit`、来源字段（见 02-contract-schema）
- [ ] `validation_gates[].command_hint` → `command`，并增加 `verified` 等字段；实际运行 lint / typecheck / format-check
- [ ] v1 第 6 步"legacy agent index / bridge 纠偏"：缩小为只处理 `.codex/agents/README.md` 这类重复导航的文件，且**只报告不改写**，迁移交给 vic-agents；明确排除 `docs/agents/`（Matt 的配置目录）和 `.codex/AGENTS.md`（vic-agents 的 bridge）
- [ ] 增加文件所有权表和外部段落保护（`references/ownership.md`）
- [ ] conventions.md 只放可从仓库证实的事实；判断性规则归 `CODING_STANDARDS.md`，bootstrap 只索引
- [ ] （v0.2 起，T14）允许读取 `.ua/knowledge-graph.json` 作为 `inferred` 证据
- [ ] 结束时运行 vic-check；（v0.2 起，T11）写 refresh-log
- [ ] 改名为 vic-bootstrap；`agents/openai.yaml` 更新显示名和默认提示词，并设为只能由用户调用（字段名见 open-questions Q3）
- [ ] description 补充英文触发词

---

## 2. multi-agent-config → vic-agents

### 必须保留（v1 这部分质量很高，原则上整体迁移）
- [ ] 先判断单代理是否足够；内置代理够用时不建 custom agent
- [ ] 默认规模：主会话 + 0–3 个子代理；`agent_count` 含主会话，并发字段不含
- [ ] 配置与执行分离；"文件已写入"与"运行时已生效"分开表述
- [ ] 能力盘点四类（tools / skills / mcp / runtimes）和三态（available / missing_but_relevant / planned_additions）
- [ ] 模型策略：核验官方文档、记录核验日期和 URL、用户指定优先、继承规则两步解析、Ultra 到 Luna 时同时写推理档位
- [ ] 落地格式：`[agents]` 已核验字段、`max_threads` 旧别名处理、standalone TOML 必需字段、`[agents.<name>] config_file` 旧注册的增量维护
- [ ] 摘要字段不进 TOML；`sandbox_mode` 只是角色默认值
- [ ] superpowers 三态和 bridge 规则
- [ ] 角色模板（implementer / reviewer / docs-verifier）和"不凑角色"原则
- [ ] 回复摘要模板 `output-schema.yaml`，包括兼容字段 `requires_explicit_codex_multiagent_invocation`
- [ ] 单次判断不回写项目合同
- [ ] 中文输出规则

### 必须修改
- [ ] 改名为 vic-agents；`agents/openai.yaml` 更新，并设为只能由用户调用
- [ ] 第 1 步中"按技能目录中实际发现的 `$project-bootstrap-contract` 路径读取其 schema"改为读取插件的 `schemas/project-context.schema.yaml`
- [ ] 删除 `references/complete-workflow.md`（它只是兼容入口）；其中的"交付验收清单"并入 `evaluation-and-contracts.md`
- [ ] 能力盘点补充：会自己派生子代理的 skill（如 Matt 的 `code-review`、`implement-spec`）计入 `skills.available`，并在决策规则里说明"已有同类审查能力时不重复建 reviewer，除非证据面不同"
- [ ] 增加 v1 平行层迁移流程：发现 `topology.yaml`、`roles/*.md`、`bridges/*.md`、`.codex/agents/README.md` 时，给出"转成 TOML 角色 / 退役 / 保留为人类文档"的方案，用户确认后执行
- [ ] （v0.2 起，T11）增加：运行结束追加 refresh-log（只记文件改动、核验日期和来源 URL）
- [ ] 增加：运行结束执行 `vic-check --agents`
- [ ] 增加：`model-policy.md` 核验日期超过 45 天时，先提醒重新核验
- [ ] 增加：接收 vic-learn 转交的 agent-role 类教训，更新对应角色的 `developer_instructions`
- [ ] 打包时排除 `__MACOSX/`、`.DS_Store`（v1 的 zip 里带了这些），并在 `.gitignore` 中忽略
- [ ] description 补充英文触发词

### 迁移后验证
- [ ] 对照上面"必须保留"逐项在 v2 文本中找到对应内容
- [ ] `references/examples.md` 的三个示例分别对应评测 f5、f6、f6 的 `task-ultra.md` 变体（在 T12 中实现）
