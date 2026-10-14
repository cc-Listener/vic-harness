# 待验证问题

规划中有些 Codex 细节来自第三方文章或别人仓库里的记录，没有在官方文档里逐一核对。Codex 迭代很快，**开工前（T00）先核验以下问题**，结论直接写在每题的"结论"一栏。

核验方法优先级：
1. 用 Codex 内置的 `$plugin-creator` 生成一个骨架插件，对照它产出的格式；
2. 查 Codex 官方文档；
3. 查 `openai/codex` 仓库源码（`codex-rs/core-plugins/src/`）。

| ID | 问题 | 目前的依据 | 无法核验时的默认方案 | 结论 |
|---|---|---|---|---|
| Q1 | 插件 hooks 的确切 schema、支持的事件名、是否需要 `[features] codex_hooks = true`；hook 命令里如何引用插件根目录（有没有类似 `${PLUGIN_ROOT}` 的环境变量） | 第三方文章；源码里 `hooks` 字段支持路径、路径数组或内联对象 | 推迟 T15；README 提供手动配置项目级 hook 的说明 | 2026-10-14 已核验：CLI 0.162.1 的 `hooks` stable 默认 true，`codex_hooks` 为弃用别名；`hooks.SessionStart[].hooks[]` command 结构、`${PLUGIN_ROOT}`、`${CLAUDE_PLUGIN_ROOT}`、`${PLUGIN_DATA}` 均经临时插件事件验证。安装启用与 hook 信任分开，真实使用需审阅 `/hooks`。见下方证据。 |
| Q2 | `skills` 字段写成字符串还是数组；你本机 Codex 版本是否支持数组；skill 的调用语法是否是 `$name` | 源码 `RawPluginManifestPaths` 同时接受字符串和数组（近期才加）；UA 的 README 写 Codex 用 `$` 前缀 | 用字符串 `"./skills/"`，草稿放 `lab/` | 2026-10-14 已核验：字符串和数组都安装成功，数组双目录经 app-server `skills/list` 发现。vic-harness 继续使用 `"./skills/"`。CLI 显式调用用 `$skill`，发现名称含插件命名空间，评测优先 `$vic-harness:vic-bootstrap`；短名完整执行留 T09 验证。兼容 `.codex-plugin/plugin.json` 仍受支持。 |
| Q3 | 让 skill 只能由用户调用的字段，是否是 `agents/openai.yaml` 里的 `policy.allow_implicit_invocation: false` | Matt 的仓库 README | 在 description 里写明"仅在用户明确要求时使用" | 2026-10-14 已核验：确为该字段。隔离探针切换 true/false 后，`debug prompt-input` 中隐式目录条目出现/消失；`skills/list` 仍显示 enabled=true。显式调用语义由官方文档确认，完整模型回合留 L2。 |
| Q4 | 如何用 `codex exec` 非交互地调用某个 skill 并在指定目录运行；如何拿到 token 用量 | 第三方文章提到 `codex exec` | 用自然语言提示词"使用 $vic-bootstrap 初始化当前仓库"，token 记为空 | 2026-10-14 接口已核验：`codex exec --json --ephemeral -C <repo>`，提示词含显式 skill 名；JSONL `turn.completed.usage` 包含 input/cached_input/output/reasoning_output_tokens。无认证临时环境未完成模型回合，实际用量未确认，采用默认 `null`；不得当作 0 或成功。T09 在已登录环境完成真实端到端验证。 |
| Q5 | Understand-Anything 能否通过 marketplace 安装到 Codex（它只有 `.claude-plugin/`，官方 Codex 安装方式是 `install.sh` 软链） | Matt 的 ADR 提到 Codex 在没有 `.codex-plugin/` 时会回退读取 `.claude-plugin/`；但 Codex 安装时会丢弃软链 | 不放进 marketplace，README 里给出 UA 的官方安装命令 | |
| Q6 | marketplace 条目引用第三方 git 仓库的写法（`source` 的类型和字段） | 第三方文章示例：`{"source":"git-subdir","url":...,"path":...,"ref":...}` | 只列 vic-harness，README 给出 Matt 插件的安装命令 | |
| Q7 | Codex 沙箱下，bootstrap 运行 lint / typecheck 是否需要审批；会不会因为网络或权限失败 | 未核验 | 运行失败时记 `verified: false` 和原因，不阻断 bootstrap | |
| Q8 | v1 的 AGENTS.md 发现规则（逐层解析、同目录 override 优先、fallback 文件名）在当前版本是否仍然成立 | multi-agent-config v1 于 2026-10-13 核验过官方文档 | 沿用 v1 规则 | |
| Q9 | 插件安装后，skill 能否读取插件根目录下 skill 文件夹以外的文件（`schemas/`、`scripts/`）；skill 里如何得知插件安装路径 | 安装缓存位于 `~/.codex/plugins/cache/<marketplace>/<plugin>/<version>/`（第三方文章） | 在每个 skill 的 `references/` 里各放一份 schema 副本，由 `scripts/sync-shared.mjs` 生成，vic-check 校验副本一致 | 2026-10-14 已核验安装与路径机制：缓存保留根级 schemas/scripts，以 `skills/list` 的实际 SKILL.md 路径解析 `../../schemas/` 与 `../../scripts/` 成功，Node helper exit 0 输出 `T00_SHARED_OK`。保留共享单一来源；不能硬编码缓存目录，也不假定普通 skill shell 存在 hook 专用变量。模型读取行为留 L2。 |
| Q10 | 插件的 `version` 不变时，修改内容是否会被用户端更新 | 第三方文章：缓存按版本区分，不升版本不会更新 | 每次发布都升版本（已写入规则） | |

## T00 核验证据（2026-10-14）

环境：macOS arm64，`rtk proxy codex --version` 原始输出 `codex-cli 0.162.1`。`plugin-creator` 在当前技能清单与本机技能目录未找到，使用手写的最小隔离探针，未声称由该 skill 生成。

官方依据：
- [Hooks](https://learn.chatgpt.com/docs/hooks)：事件、schema、开关与信任。
- [Build skills](https://learn.chatgpt.com/docs/build-skills)：显式调用及 optional metadata。
- [Package your plugin](https://developers.openai.com/plugins/build/plugins)：manifest、marketplace 与共享文件打包。
- [Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)：exec 与 JSONL usage。
- [官方 manifest 源码](https://github.com/openai/codex/blob/main/codex-rs/core-plugins/src/manifest.rs) 与 [store 源码](https://github.com/openai/codex/blob/main/codex-rs/core-plugins/src/store.rs)：仅为核验当天的 main，不冒充本机固定版本源码。

临时子进程使用独立 `CODEX_HOME`，没有读取或复制认证文件，没有修改全局配置。原始关键输出：

```text
plugin marketplace add: exit 0, marketplaceName=t00-isolated
plugin add: exit 0, pluginId=t00-probe@t00-isolated, version=0.0.1
plugin list: installed=true, enabled=true
skills/list: errors=[]
t00-probe:t00-array: enabled=true
t00-probe:t00-probe: enabled=true
allow_implicit_invocation=true: exit 0, catalog entry present=true
allow_implicit_invocation=false: exit 0, catalog entry present=false
event=SessionStart
source=startup
PLUGIN_DATA 已定义=true
SHARED_SCHEMA={"sentinel":"T00_SHARED_OK"}
SHARED_SCRIPT_EXIT=0
SHARED_SCRIPT_OUTPUT=T00_SHARED_OK
TEMP_ROOT_EXISTS=False
```

hook 探针使用已审阅本地脚本，单次允许该探针运行以验证事件，没有写入永久信任。普通未信任会话不执行该 hook，属预期边界；不把绕过信任选项加入日常安装流程。无认证 `codex exec` 在 40 秒期限内没有 `turn.completed`，已终止且用量记录为 null。两个临时插件卸载均 exit 0，临时目录和进程已清理。

T01 复用方法：临时环境执行 `codex plugin marketplace add <repo> --json`、`codex plugin add vic-harness@<marketplace> --json`，启动 `codex app-server --stdio`，依次发送 initialize、initialized、`skills/list`（cwds 指向临时工作区、forceReload=true）。只统计本插件的 enabled skill，且 errors 必须为空。T01 仍需对真正的六技能骨架独立验证。
