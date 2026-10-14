# 项目事实合同迁移与校验接口

## v1 → v2

`schema_version: 2` 是新合同格式的权威版本。根合同同时保留 `version: 1`，这是给 v1 消费者的兼容标记，不用于选择新 schema。子合同是新增接口，不要求旧 `version` 字段。插件版本单独记录在可选的 `generated_by.plugin_version`，升级插件不自动升级合同格式。

v1 参考文件混合了规则、说明和示例。迁移时去掉 `fields` 包装，把里面的业务字段放回对应对象；旧文件的 `description`、`allowed_values`、`fields` 是文档元数据，合同不保留这些元数据。保留全部业务字段名及旧对象形状，包括：

- `bootstrap_status.level`；规范输出必须保留对象，scalar 状态仅作为已有 v2 草案的兼容输入。
- `navigation_layer.agents_md.role`、`effective_guidance_entry.role`、`effective_guidance_kind.value`；新增 `effective_guidance_entry.kind` 与旧 `value` 同现时必须一致。
- `navigation_layer.agent_index.path/role/optional` 只读兼容，整项可省略；不重新生成 `.codex/agents/README.md` 等平行层。
- `component_contract.preferred_abstractions[].path`；新增 `entry/source/import/exports`，不以新字段替换旧 `path`。
- `agent_context.canonical_agent_contracts[].path/kind/optional` 和 `multi_agent_readiness` 的事实前提；不写 `ready_for_multi_agent`、`use_multi_agent` 等运行判断。

`validation_gates[].command_hint` 是唯一改名字段，在一个大版本内作为只读别名接受。新输出生成 `command`；兼容输入至少含两者之一。同现时必须相同，不能静默挑选其中一条。strict 模式对旧别名提示迁移。完整示例同时展示两者以验证兼容覆盖，不是新生成器的输出模板。

旧事实条目补稳定 `id`、非空 `evidence`、`confidence`，再升级到 `schema_version: 2`。未核实的事实使用 `inferred`，无法支撑的结论放入 `uncertainty`。原 v1 输入未经补字段不承诺直接通过 v2 校验；兼容承诺是 v1 消费者能读取新增后的合同，且业务字段同名、形状稳定。

## 根合同、子合同与里程碑

真实 `contracts/project-context.yaml` 每文件一份 YAML 文档，无 `parent`。根合同 M1 必填：`version`、`schema_version`、`bootstrap_status`、`navigation_layer`、`project_map`、`conventions`、`component_contract`、`agent_context`、`uncertainty`、`non_goals`。对象内部 required 见 schema；数组允许为空，不编造条目。

`contracts/apps/<app>-project-context.yaml` 必填 `parent: contracts/project-context.yaml`、`schema_version`、`project_map`、`conventions`、`component_contract`、`uncertainty`。子合同只允许这一子集，以及可选的 `refreshed_at_commit/watch_paths`；没有根导航、代理前提、外部集成或再次嵌套 `apps`。所有路径（包括子合同中的路径）相对仓库根；`project_map.entry_chain` 是按调用顺序排列的路径数组。

M1 所有关键事实（`GP/VG/PA/LI/CR`）要求 `id/evidence/confidence` 及相应业务字段。`origin/status/added` 到 M2 才要求完整，`last_confirmed` 始终可选；M2 的 C10 校验来源，不把缺少 M2 来源作为 M1 的 C01 错误。`generated_by`、`refreshed_at`、`refreshed_at_commit`、`watch_paths`、`integrations`、`foreign_sections` 均可选；M1 不强制生成日志。

`project-context.example.yaml` 是教学用 YAML 多文档：第一份完整根合同，第二份完整子合同，用 `loadAll` 分别验证；每份均通过同一个 schema。它覆盖所有项目合同业务属性，包括非空 `conventions.rules` 和子合同 `parent/entry_chain`。它描述虚构仓库，路径存在性需要 T03 在相应临时仓库中验证，不能对插件目录直接要求这些示例路径存在。

根和其全部子合同构成一个 ID 唯一范围；跨合同引用使用 `parent` 或根 `apps[].contract`，不得复制事实。ID 前缀为 `GP-/VG-/PA-/LI-/CR-`，后缀允许字母、数字、点、下划线和短横线，刷新时保持 ID 稳定。Schema 检查前缀；C01 必须另查整个集合的重复 ID，不能用 `uniqueItems` 冒充按 ID 查重。示例中的根共享事实和子应用事实 ID 各不相同。

## 可执行的 JSON Schema 小子集

两份 `.schema.yaml` 均为 YAML 表达的标准 JSON Schema 2020-12。消费者使用 YAML 的 JSON 数据模型（mapping/list/string/boolean/number/null），不接受重复 mapping key、自定义 tag 或循环 alias；日期和时间必须引用为字符串。无需联网解析 schema，所有 `$ref` 都是本文件 `#/$defs/<名称>`。

仅使用以下关键词：`$schema`、`title`、`description`、`$defs`、`$ref`、`type`、`properties`、`required`、`additionalProperties`、`items`、`anyOf`、`enum`、`const`、`pattern`、`minLength`、`minItems`、`minimum`。`$schema/title/description` 是声明或注释，其余按标准语义递归执行；`anyOf` 表示至少一个分支有效，`$ref` 不发生联网请求。对象均关闭未知属性，避免单次判断混进事实层。这个小子集可由 T03 直接实现，不需要 npm 运行时依赖；开发验收可用标准 JSON Schema 校验工具。

Schema 负责类型、必填、枚举、ID 形状与结构分支；日期、UTC 时间和 commit pattern 只检查词法形状。下列语义不能只靠本小子集表达，消费者须另查：ID 集合唯一、真实日历日期、路径存在/证据行号、根与子事实不重复、导航新旧 kind 一致、命令别名一致、`verified:true` 对应已运行且成功的证据。`verified_at_commit/exit_code` 不等于执行证明，不可凭示例宣称命令已运行。T03 实现范围由路线图决定，M2 来源和漂移规则留 T10。

只有 `watch_paths` 声明支持 glob。`path/entry/source/evidence` 等均是普通路径或带行号的 evidence；可指文件或目录。C02 跳过明确 `present:false`、`detected:false` 或 `optional:true` 的指针；这些标记只豁免存在检查，不豁免格式和用户绝对路径检查。`agent_config` 是所有权指针，bootstrap 不读取或改写 TOML。

## refresh-log（M2）

日志文件是一份 YAML 数组，只追加，不修改历史；超过 200 条由 vic-prune 归档到 `contracts/refresh-log.archive/<年份>.yaml`。Schema 按 `skill` 分支限制 `mode`。bootstrap/learn/prune 的 no-op 可以记录；vic-agents 真正 no-op 不创建 `contracts/`、不追加日志，遵循 progress 的用户裁定。

vic-agents 只有实际文件变更才写 `mode: agents-config`，`affected_artifacts` 至少一项。允许可选 `models_checked_at`、`agent_fields_checked_at`、`source_urls` 和 `notes`，以及运行信封和 `uncertainty`；不接受 bootstrap 深度、触发决策或任何多代理判断字段。日志不是当前项目事实来源。

以下日志覆盖 refresh-log 的全部可实例化属性，仅作为格式示例，不声称这些操作已执行：

```yaml
- at: '2026-10-14T10:00:00Z'
  skill: vic-bootstrap
  plugin_version: 0.1.0
  commit: 3f2a9c1
  mode: app-deep
  depth_scope: repo+app
  app_targets: [web]
  placement_strategy: root-docs
  trigger_evidence: ['watch_paths 命中：apps/web/package.json']
  affected_artifacts: [docs/apps/web/project-map.md, contracts/apps/web-project-context.yaml]
  unchanged_artifacts: [AGENTS.md, docs/conventions.md]
  uncertainty: []
  notes: ''
- at: '2026-10-14T10:05:00Z'
  skill: vic-agents
  plugin_version: 0.1.0
  commit: 3f2a9c1
  mode: agents-config
  affected_artifacts: [.codex/agents/reviewer.toml]
  models_checked_at: '2026-10-14'
  agent_fields_checked_at: '2026-10-14'
  source_urls: [https://developers.openai.com/codex/config-reference/]
  uncertainty: []
  notes: '新增独立审查角色文件'
- at: '2026-10-14T11:00:00Z'
  skill: vic-learn
  plugin_version: 0.1.0
  commit: 3f2a9c1
  mode: learn
  depth_scope: repo
  app_targets: []
  placement_strategy: root-docs
  trigger_evidence: ['incident 已确认']
  affected_artifacts: [docs/harness/CHANGELOG.md]
  unchanged_artifacts: [AGENTS.md]
  uncertainty: []
  notes: ''
- at: '2026-10-14T12:00:00Z'
  skill: vic-prune
  plugin_version: 0.1.0
  commit: 3f2a9c1
  mode: no-op
  depth_scope: repo
  app_targets: []
  placement_strategy: root-docs
  trigger_evidence: []
  affected_artifacts: []
  unchanged_artifacts: [AGENTS.md]
  uncertainty: []
  notes: ''
```
