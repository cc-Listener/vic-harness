# 01 · 架构

## 1. Harness 分层与组件对应

```
             ┌───────────── vic-router（路由：什么场景用哪个 skill）─────────────┐
             │                                                                │
  Guides     │  vic-bootstrap → AGENTS.md / docs/* / contracts/*              │
 （前馈）     │  Matt domain-modeling → GLOSSARY.md / docs/adr/                │
             │  UA → .ua/knowledge-graph.json（只作证据，按需查询）               │
             │                                                                │
  Agent 配置 │  vic-agents → .codex/config.toml / .codex/agents/*.toml         │
             │                                                                │
  Sensors    │  vic-check（脚本）· Matt code-review / tdd · UA understand-diff │
 （反馈）     │                                                                │
  Gates      │  插件 hook：SessionStart 过期提示（全局、只读）                    │
             │  项目级 hook / lint 规则：由 vic-learn 生成在目标仓库里             │
             │                                                                │
  进化       │  vic-learn（失误→规则）· Matt retro（会话复盘）· vic-prune（剪枝）  │
             └────────────────────────────────────────────────────────────────┘
```

**事实层和配置层的单向依赖：**

```
vic-bootstrap ──写──▶ contracts/project-context.yaml ──读──▶ vic-agents ──写──▶ .codex/*.toml
      ▲                                                          │
      └──────── 只有事实冲突时才反向触发 refresh ◀─────────────────┘
```

- `vic-agents` 可以在没有合同时独立运行（事实来源为 `repo-scan`），合同缺失不会阻塞它。
- `vic-agents` 的单次判断（`initialized_project`、`ready_for_multi_agent` 等）**绝不回写**合同。
- `vic-bootstrap` 不读也不写 `.codex/*.toml`。只有当 TOML 里引用的路径和合同事实冲突时，`vic-check` 才报告。

## 2. 插件仓库结构

```
vic-harness/
├── .codex-plugin/plugin.json          # Codex 插件清单
├── .claude-plugin/plugin.json         # 可选（M3）：同一份 skills 也给 Claude Code 用
├── .agents/plugins/marketplace.json   # 本地/团队 marketplace：vic-harness + Matt 插件（M3）
├── skills/                            # 只放要发布的 skill，不用软链
│   ├── vic-bootstrap/
│   │   ├── SKILL.md                   # ≤150 行
│   │   ├── agents/openai.yaml
│   │   └── references/
│   │       ├── app-deep.md
│   │       ├── artifacts.md           # 各产物的写法和质量门
│   │       ├── ownership.md           # 文件所有权表 + 外部段落
│   │       └── refresh-policy.md
│   ├── vic-agents/
│   │   ├── SKILL.md
│   │   ├── agents/openai.yaml
│   │   └── references/                # 由 v1 multi-agent-config 迁移
│   │       ├── decision-rules.md
│   │       ├── capability-inventory.md
│   │       ├── model-policy.md        # 带核验日期的快照
│   │       ├── materialization-layout.md
│   │       ├── role-templates.md
│   │       ├── evaluation-and-contracts.md
│   │       ├── engineering-notes.md
│   │       ├── examples.md
│   │       └── output-schema.yaml     # 回复摘要模板，不是仓库文件
│   ├── vic-check/SKILL.md
│   ├── vic-learn/
│   │   ├── SKILL.md
│   │   └── references/attribution.md
│   ├── vic-prune/SKILL.md
│   └── vic-router/SKILL.md
├── schemas/                           # 共享 schema，唯一来源
│   ├── project-context.schema.yaml
│   ├── project-context.example.yaml
│   └── refresh-log.schema.yaml
├── scripts/
│   ├── vic-check.mjs                  # 确定性检查（Node ≥18，零 npm 依赖）
│   ├── lib/                           # 检查规则模块
│   ├── vendor/                        # 内置的单文件解析器：js-yaml、smol-toml
│   └── collect-candidates.mjs         # M3：跨仓库收集晋升候选
├── hooks/hooks.json                   # 只有 SessionStart 过期提示
├── templates/                         # 写入目标仓库的模板
│   ├── AGENTS.md.tmpl
│   ├── incident.md
│   └── harness-changelog.md
├── lab/                               # 草稿 skill，不发布
├── evals/                             # 见 06-evals.md
├── tests/                             # node:test 单元测试
├── docs/plan/ · docs/adr/             # 规划和决策（本目录）
├── reference/v1/                      # 两个 v1 skill 原件，只读，迁移完成后保留存档
├── AGENTS.md · HANDOFF.md · README.md · CHANGELOG.md · PROMOTION.md（M3）
```

### 插件清单草案（格式以 open-questions Q1–Q3 的核验结果为准）

```json
{
  "name": "vic-harness",
  "version": "0.1.0",
  "description": "可进化的工程 Harness：项目合同、多代理配置、确定性检查、失败学习与剪枝",
  "keywords": ["harness", "bootstrap", "agents-md", "multi-agent", "codex"],
  "skills": "./skills/",
  "hooks": "./hooks/hooks.json",
  "interface": {
    "displayName": "Vic Harness",
    "shortDescription": "初始化并持续进化仓库的 agent 合同与代理配置",
    "category": "Development",
    "defaultPrompt": "用 $vic-router 看看这个仓库现在该用哪个 vic skill"
  }
}
```

## 3. 目标仓库里的产物与所有权

这是 v2 最核心的约束：**每个文件只有一个所有者，其他 skill 只能读或在指定段落内写。**

| 路径 | 所有者 | 其他方的权限 |
|---|---|---|
| `AGENTS.md`（主体） | vic-bootstrap | vic-learn 只能经用户批准后加导航指针或 hard stop |
| `AGENTS.md` 中的 `## Agent skills` 段 | Matt `setup-matt-pocock-skills` | 所有 vic skill 原样保留 |
| `AGENTS.override.md` | 用户 | vic-bootstrap 只读，并保证 AGENTS.md 不与之冲突 |
| `docs/project-map.md`、`docs/conventions.md`、`docs/component-contract.md`、`docs/apps/<app>/*` | vic-bootstrap | vic-learn 可追加带 `origin` 的条目 |
| `contracts/project-context.yaml`、`contracts/apps/*` | vic-bootstrap | vic-learn、vic-prune 可改条目的 `status` 和追加条目；vic-agents 只读 |
| `contracts/refresh-log.yaml` | 所有 vic skill（只追加） | 不改写历史条目 |
| `docs/harness/incidents/*.md` | vic-learn | 用户可直接写 |
| `docs/harness/CHANGELOG.md` | vic-learn、vic-prune（只追加） | — |
| `.codex/config.toml`、`.codex/agents/*.toml` | vic-agents | vic-learn 只能提议，由 vic-agents 落地 |
| `.codex/AGENTS.md`（superpowers bridge） | vic-agents | 只在 `superpowers_integration: user-confirmed` 时创建 |
| `CODING_STANDARDS.md` | 用户（经 Matt retro 或 vic-learn 提议、用户批准） | vic-bootstrap 只索引，不改写 |
| `GLOSSARY.md`、`GLOSSARY-MAP.md`、`docs/adr/` | Matt domain-modeling | 只索引 |
| `docs/agents/*.md` | Matt setup | 只索引；不得当成"legacy agent index"去纠偏 |
| `.ua/*`、`.understand-anything/*` | Understand-Anything | 只读，作为 `inferred` 证据 |
| `CLAUDE.md`（可选桥接，M3） | vic-bootstrap | 内容只能是 `@AGENTS.md` |

**v1 遗留的平行层**（`.codex/agents/topology.yaml`、`.codex/agents/roles/*.md`、`.codex/agents/bridges/*.md`、`.codex/agents/README.md`）：没有任何 v2 skill 再生成它们。`vic-check` 发现时报 warning，`vic-agents` 提供迁移方案（转成 TOML 角色或退役），需用户确认后执行。

## 4. 外部集成

| 外部 | 检测方式 | 集成方式 | 缺失时 |
|---|---|---|---|
| mattpocock/skills | 当前会话可用 skill 列表里有 `retro`、`code-review` 等；仓库里有 `docs/agents/` 或 `## Agent skills` 段 | router 路由到它的流程；vic-learn 接收 retro 的结论；合同 `integrations` 记录指针 | 安静跳过，router 只推荐 vic 自己的 skill |
| Understand-Anything | 存在 `.ua/knowledge-graph.json` 或 `.understand-anything/` | vic-bootstrap 把图谱里的层次和入口当作 `inferred` 证据，再回源码核实；AGENTS.md 路由到 `$understand-chat` | 安静跳过 |
| 会自己派生子代理的 skill（Matt 的 `code-review`、`implement-spec` 等） | 能力盘点 | vic-agents 盘点能力时计入，避免重复建同类 reviewer 角色 | — |
| superpowers | 用户确认 | vic-agents 维持 v1 的三态规则（user-confirmed / user-denied / unknown） | unknown 时跳过 bridge |

## 5. 命名与调用

- 所有 skill 带 `vic-` 前缀，避免和其他插件冲突。Codex 里用 `$vic-bootstrap` 调用（语法见 open-questions Q2）。
- 会写多个文件的 skill（bootstrap、agents、learn、prune）设为**只能由用户调用**；只读的 check、router 允许模型自动调用。
- skill 之间互相引用时只写 skill 名，例如 `$vic-agents`，**禁止写绝对路径**。
- 共享 schema 放在插件根目录 `schemas/`，skill 用相对路径引用（安装后能否读到见 open-questions Q9）。
