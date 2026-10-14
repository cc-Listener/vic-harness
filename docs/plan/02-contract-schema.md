# 02 · 合同 Schema v2

本文件定义 `contracts/project-context.yaml` 的 v2 结构，以及 `contracts/refresh-log.yaml` 的格式。实现时落成 `schemas/project-context.schema.yaml`（规则）和 `schemas/project-context.example.yaml`（完整示例）两个文件，**规则和示例必须分开**（v1 的问题之一是两者混写）。

## 1. 兼容性规则

- v2 **保留 v1 的所有字段名**，只新增字段。v1 的消费者（包括 vic-agents）不需要改代码就能读 v2。
- 唯一的语义变更：`conventions.validation_gates[].command_hint` 改名为 `command`，并保留 `command_hint` 作为只读别名一个大版本，`vic-check` 在 strict 模式下提示迁移。
- `schema_version` 只在出现不兼容变更时才升；每次升级都在 `schemas/MIGRATIONS.md` 写迁移说明。

## 2. 通用的"事实条目"字段

以下字段用于需要追溯来源的条目（guarded_paths、validation_gates、preferred_abstractions、locate_index、conventions.rules）：

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | 是 | 稳定 ID，前缀表示类型：`GP-` guarded path，`VG-` validation gate，`PA-` preferred abstraction，`LI-` locate index，`CR-` convention rule |
| `evidence` | 是 | 证据列表，格式 `path` 或 `path:line` 或 `path:start-end` |
| `origin` | 是 | `repo-scan` / `ua-graph`（必须再回源码核实）/ `incident:<文件名>` / `retro:<日期>` / `user` |
| `confidence` | 是 | `verified`（已核对证据或已运行）/ `inferred`（推断，未核实） |
| `status` | 是 | `active` / `probation` / `retired` |
| `added` | 是 | 加入日期 |
| `last_confirmed` | 否 | 最近一次 refresh 确认它仍然成立的日期 |

`retired` 的条目保留一个小版本周期，供审计，之后由 vic-prune 删除。

## 3. 完整结构（示例即规范意图）

```yaml
schema_version: 2
generated_by: { plugin: vic-harness, plugin_version: 0.1.0 }
refreshed_at: 2026-10-13
refreshed_at_commit: 3f2a9c1            # 过期检测的基准
watch_paths:                            # 这些路径在基准之后变化，就提示 refresh
  - package.json
  - pnpm-workspace.yaml
  - apps/*/package.json
  - packages/ui/src/index.ts
  - .github/workflows/**
  - eslint.config.*

bootstrap_status: bootstrap_complete    # bootstrap_complete | bootstrap_partial_but_usable | bootstrap_missing_or_stale

navigation_layer:
  agents_md: { path: AGENTS.md, line_count: 64 }
  effective_guidance_entry: { path: AGENTS.md, kind: agents_md }   # agents_override_md | agents_md | equivalent_navigation
  claude_md_bridge: { path: CLAUDE.md, present: false }
  scoped_guidance:                     # 子目录里的 AGENTS.md / override，只在其目录作用域内生效
    - { path: apps/web/AGENTS.md, scope: apps/web/ }

project_map:
  repo_type: monorepo
  workspace_mode: pnpm-workspace
  top_level_modules:
    - { name: web, path: apps/web, role: 主前端应用 }
    - { name: ui, path: packages/ui, role: 二次封装组件库 }
  guarded_paths:
    - id: GP-001
      path: apps/web/src/request/interceptors.ts
      reason: 统一鉴权与错误处理入口，改动影响所有请求
      evidence: [apps/web/src/request/index.ts:3-12]
      origin: repo-scan
      confidence: verified
      status: active
      added: 2026-10-13

apps:                                   # 触发 app-deep 后才有
  - name: web
    path: apps/web
    contract: contracts/apps/web-project-context.yaml
    docs: docs/apps/web/

conventions:
  sources:
    - { path: eslint.config.js, kind: lint }
    - { path: CONTRIBUTING.md, kind: contributing }
  validation_gates:
    - id: VG-001
      name: lint
      command: pnpm lint
      verified: true                    # bootstrap 实际运行过并成功
      verified_at_commit: 3f2a9c1
      exit_code: 0
      evidence: [package.json:8]
      origin: repo-scan
      confidence: verified
      status: active
      added: 2026-10-13
  rules: []                             # CR-*：仓库可证实的事实性约定；判断性规则放 CODING_STANDARDS.md

component_contract:
  sources: [{ path: packages/ui/src/index.ts, kind: barrel }]
  systems:
    - { name: acme-ui, path: packages/ui, preferred: true }
  preferred_abstractions:
    - id: PA-001
      name: AcmeButton
      import: "@acme/ui"
      entry: packages/ui/src/index.ts
      source: packages/ui/src/button/AcmeButton.tsx
      exports: [AcmeButton]
      use_instead_of: [antd/Button]
      evidence: [packages/ui/src/index.ts:4]
      origin: repo-scan
      confidence: verified
      status: active
      added: 2026-10-13
  locate_index:                         # 与 component-contract.md 的定位表一一对应
    - id: LI-001
      scenario: 表单提交按钮
      import: "@acme/ui"
      entry: packages/ui/src/index.ts
      source: packages/ui/src/button/AcmeButton.tsx
      exports: [AcmeButton]
      evidence: [packages/ui/src/index.ts:4]
      origin: repo-scan
      confidence: verified
      status: active
      added: 2026-10-13
  locate_order:
    - packages/ui/src/index.ts
    - apps/web/src/components/
  search_commands:
    - rg -n "export .*Button" packages/ui/src

integrations:
  domain_docs:   { detected: true, glossary: GLOSSARY.md, adr_dir: docs/adr/, owner: mattpocock/domain-modeling }
  review_rules:  { detected: true, path: CODING_STANDARDS.md, owner: user }
  skills_config: { detected: true, dir: docs/agents/, owner: mattpocock/setup-matt-pocock-skills }
  knowledge_graph:
    detected: false
    path: .ua/knowledge-graph.json
    owner: understand-anything
    canonical: false
    query_via: $understand-chat
  agent_config:                         # 只做指针，内容由 vic-agents 负责
    detected: true
    config: .codex/config.toml
    agents_dir: .codex/agents/
    owner: vic-agents

foreign_sections:
  - { file: AGENTS.md, heading: "## Agent skills", owner: mattpocock/setup-matt-pocock-skills }

agent_context:                          # 只放事实前提，不放多代理决策结论
  canonical_agent_contracts: []
  multi_agent_readiness:
    ownership_boundaries_clear: true
    guarded_paths_defined: true
    bootstrap_layer_complete: true

uncertainty:
  missing_information: []
  inferred_but_unverified: []

non_goals:
  - 不定义 topology、agent 数量、execution order、reviewer/judge 拆分
  - 不记录 vic-agents 的单次运行判断
```

### 子应用合同 `contracts/apps/<app>-project-context.yaml`

结构是根合同的子集：`schema_version`、`refreshed_at_commit`、`watch_paths`、`project_map`（含入口链路 `entry_chain`）、`conventions`、`component_contract`、`uncertainty`，外加 `parent: contracts/project-context.yaml`。根合同和子合同**不允许重复同一事实**，只能互相引用。

## 4. refresh-log 格式

`contracts/refresh-log.yaml` 只追加，每次 vic skill 运行都写一条（包括 no-op）：

```yaml
- at: 2026-10-13T10:00:00Z
  skill: vic-bootstrap                 # vic-bootstrap | vic-agents | vic-learn | vic-prune
  plugin_version: 0.1.0
  commit: 3f2a9c1
  mode: refresh                        # bootstrap | refresh | no-op | app-deep | agents-config | learn | prune
  depth_scope: repo+app                # repo | repo+app
  app_targets: [web]
  placement_strategy: root-docs        # root-docs | app-local-docs
  trigger_evidence:
    - "watch_paths 命中：apps/web/package.json"
  affected_artifacts: [docs/apps/web/project-map.md, contracts/apps/web-project-context.yaml]
  unchanged_artifacts: [AGENTS.md, docs/conventions.md]
  uncertainty: []
  notes: ""
```

**vic-agents 写入 refresh-log 的边界**：只记录文件改动（`affected_artifacts`）、模型和字段的核验日期、来源 URL。`use_multi_agent`、`ready_for_multi_agent` 这类单次判断**不写入**，保持在回复摘要里（见 ADR-0006）。

日志超过 200 条时，vic-prune 把旧条目归档到 `contracts/refresh-log.archive/<年份>.yaml`。
