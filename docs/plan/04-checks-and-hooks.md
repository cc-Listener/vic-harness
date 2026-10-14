# 04 · 确定性检查与 Hooks

## 1. vic-check.mjs

### 运行约束
- Node ≥ 18，**零 npm 运行时依赖**。YAML 和 TOML 解析用内置的单文件解析器（`scripts/vendor/js-yaml.mjs`、`scripts/vendor/smol-toml.mjs`），保留原许可证头部（见 ADR-0002）。
- 不联网，不写文件，普通仓库上 3 秒内完成。
- 目标仓库没有 `contracts/` 也没有 `.codex/` 时，直接输出"未初始化"并以 0 退出。

### 命令行

```
node scripts/vic-check.mjs [--all | --contract | --agents | --drift] [--json] [--quiet] [--strict] [--root <path>]
```

| 参数 | 含义 |
|---|---|
| `--all` | 默认值，跑全部规则 |
| `--contract` | 只跑合同相关规则（C01–C12） |
| `--agents` | 只跑代理配置规则（A01–A07） |
| `--drift` | 只跑过期检测（C07） |
| `--json` | 机器可读输出 |
| `--quiet` | 只输出一行摘要；没有问题时什么都不输出（给 hook 用） |
| `--strict` | 部分 warning 升级为 error（给 CI 和插件自身评测用） |

**退出码**：0 = 无 error，1 = 有 error，2 = 检查器自身出错。

**JSON 输出**：

```json
{ "version": "0.1.0", "root": ".", "summary": { "error": 0, "warn": 2 },
  "findings": [ { "id": "C07", "severity": "warn", "file": "contracts/project-context.yaml",
                  "message": "合同落后 12 个 commit，watch_paths 命中 apps/web/package.json",
                  "hint": "运行 $vic-bootstrap 刷新" } ] }
```

### 合同规则

| ID | 检查内容 | 级别 |
|---|---|---|
| C01 | 合同符合 schema：必填字段、枚举值、ID 唯一 | error |
| C02 | 所有 `path`、`evidence`、`entry`、`source` 指向的文件存在；行号超出文件长度 | error；行号问题为 warn |
| C03 | AGENTS.md 行数 | >120 warn，>200 error |
| C04 | AGENTS.md 和 docs 中的相对链接能解析 | error |
| C05 | 仓库存在 `docs/agents/` 时，AGENTS.md（或 CLAUDE.md）中有 `## Agent skills` 段 | warn |
| C06 | 合同、AGENTS.md、docs 和 `.codex/` 配置里没有用户绝对路径（`/Users/`、`/home/<名字>/`、`C:\Users\`）。检查插件仓库自身时排除 `reference/` 和 `docs/plan/`（那里会引用 v1 的问题原文） | error |
| C07 | 过期检测：`git diff --name-only <refreshed_at_commit>..HEAD` 与 `watch_paths` 求交集；基准 commit 不存在时也报 | warn |
| C08 | 根层和 app 层文档出现重复段落（规范化后连续 ≥3 行相同） | warn |
| C09 | component-contract.md 有定位表、定位顺序和至少一条 `rg` 命令（v1 质量门） | error |
| C10 | 关键事实条目缺少 `evidence` / `origin` / `confidence` / `status` | warn；strict 下 error |
| C11 | refresh-log 最新一条的 `commit` 等于合同的 `refreshed_at_commit` | warn |
| C12 | CLAUDE.md 存在时只包含 `@AGENTS.md`，且不包含 `## Agent skills` 段 | warn |

### 代理配置规则

| ID | 检查内容 | 级别 |
|---|---|---|
| A01 | `.codex/config.toml` 和 `.codex/agents/*.toml` 能被解析 | error |
| A02 | 每个 standalone agent 有 `name`、`description`、`developer_instructions`；文件名与 `name` 一致 | error；文件名不一致为 warn |
| A03 | `[agents]` 中只出现当前已核验的字段（`enabled`、`max_concurrent_threads_per_session`、`default_subagent_model`、`default_subagent_reasoning_effort`、`interrupt_message`）；出现 `max_depth` 等未列出字段时提示 | warn |
| A04 | 旧别名 `max_threads` 与新字段同时存在 | error；只有旧别名时为 warn |
| A05 | 同一角色既有 standalone 文件又有 `[agents.<name>] config_file` 注册 | error |
| A06 | 存在 v1 平行层：`topology.yaml`、`roles/*.md`、`bridges/*.md`、`.codex/agents/README.md` | warn |
| A07 | TOML 里出现摘要字段（`allowed_tools`、`forbidden_tools`、`write_scope`、`runtime_class`） | error |

A03 的"已核验字段列表"放在 `scripts/lib/agents-fields.json`，带 `checked_at` 和来源 URL。插件仓库的 CI 在它超过 45 天时报 warn，提醒维护者重新核验（这是插件自身的保鲜机制）。

### 测试
- 每条规则在 `tests/` 下至少有一个通过用例和一个失败用例，用 `node --test` 运行。
- 测试数据用临时目录内联生成，不依赖 evals 的 fixtures。

## 2. 插件 Hooks

**原则：插件 hook 在所有启用插件的仓库里都会生效，所以只做全局安全、只读、便宜的事。项目特有的闸门由 vic-learn 生成在目标仓库里，不放进插件。**（见 ADR-0004）

### v0.2 只提供一个 hook

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node <插件根>/scripts/vic-check.mjs --drift --quiet",
            "statusMessage": "检查 harness 合同是否过期",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

行为：
- 未初始化的仓库：无输出。
- 合同没有过期：无输出。
- 合同过期：输出一行，例如 `vic-harness：合同落后 12 个 commit（apps/web/package.json 等 3 个文件变化），建议运行 $vic-bootstrap`。
- 任何错误（没有 Node、不是 git 仓库、超时）：无输出，退出码 0，绝不阻断会话。

`<插件根>` 在 hook 命令里如何引用，以及 hooks 的确切 schema 和开关（`codex_hooks` 特性开关），见 open-questions Q1。

### 明确不做的 hook
- `PostToolUse` 跑 lint：每个项目的命令都不同，放在插件里只会制造噪音。需要时由 vic-learn 为具体仓库生成项目级 hook。
- 任何调用 LLM 的 hook。
- `Stop` 提醒：v0.2 不做，等收集到真实使用反馈再决定。
