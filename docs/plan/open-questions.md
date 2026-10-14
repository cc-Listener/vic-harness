# 待验证问题

规划中有些 Codex 细节来自第三方文章或别人仓库里的记录，没有在官方文档里逐一核对。Codex 迭代很快，**开工前（T00）先核验以下问题**，结论直接写在每题的"结论"一栏。

核验方法优先级：
1. 用 Codex 内置的 `$plugin-creator` 生成一个骨架插件，对照它产出的格式；
2. 查 Codex 官方文档；
3. 查 `openai/codex` 仓库源码（`codex-rs/core-plugins/src/`）。

| ID | 问题 | 目前的依据 | 无法核验时的默认方案 | 结论 |
|---|---|---|---|---|
| Q1 | 插件 hooks 的确切 schema、支持的事件名、是否需要 `[features] codex_hooks = true`；hook 命令里如何引用插件根目录（有没有类似 `${PLUGIN_ROOT}` 的环境变量） | 第三方文章；源码里 `hooks` 字段支持路径、路径数组或内联对象 | 推迟 T15；README 提供手动配置项目级 hook 的说明 | |
| Q2 | `skills` 字段写成字符串还是数组；你本机 Codex 版本是否支持数组；skill 的调用语法是否是 `$name` | 源码 `RawPluginManifestPaths` 同时接受字符串和数组（近期才加）；UA 的 README 写 Codex 用 `$` 前缀 | 用字符串 `"./skills/"`，草稿放 `lab/` | |
| Q3 | 让 skill 只能由用户调用的字段，是否是 `agents/openai.yaml` 里的 `policy.allow_implicit_invocation: false` | Matt 的仓库 README | 在 description 里写明"仅在用户明确要求时使用" | |
| Q4 | 如何用 `codex exec` 非交互地调用某个 skill 并在指定目录运行；如何拿到 token 用量 | 第三方文章提到 `codex exec` | 用自然语言提示词"使用 $vic-bootstrap 初始化当前仓库"，token 记为空 | |
| Q5 | Understand-Anything 能否通过 marketplace 安装到 Codex（它只有 `.claude-plugin/`，官方 Codex 安装方式是 `install.sh` 软链） | Matt 的 ADR 提到 Codex 在没有 `.codex-plugin/` 时会回退读取 `.claude-plugin/`；但 Codex 安装时会丢弃软链 | 不放进 marketplace，README 里给出 UA 的官方安装命令 | |
| Q6 | marketplace 条目引用第三方 git 仓库的写法（`source` 的类型和字段） | 第三方文章示例：`{"source":"git-subdir","url":...,"path":...,"ref":...}` | 只列 vic-harness，README 给出 Matt 插件的安装命令 | |
| Q7 | Codex 沙箱下，bootstrap 运行 lint / typecheck 是否需要审批；会不会因为网络或权限失败 | 未核验 | 运行失败时记 `verified: false` 和原因，不阻断 bootstrap | |
| Q8 | v1 的 AGENTS.md 发现规则（逐层解析、同目录 override 优先、fallback 文件名）在当前版本是否仍然成立 | multi-agent-config v1 于 2026-10-13 核验过官方文档 | 沿用 v1 规则 | |
| Q9 | 插件安装后，skill 能否读取插件根目录下 skill 文件夹以外的文件（`schemas/`、`scripts/`）；skill 里如何得知插件安装路径 | 安装缓存位于 `~/.codex/plugins/cache/<marketplace>/<plugin>/<version>/`（第三方文章） | 在每个 skill 的 `references/` 里各放一份 schema 副本，由 `scripts/sync-shared.mjs` 生成，vic-check 校验副本一致 | |
| Q10 | 插件的 `version` 不变时，修改内容是否会被用户端更新 | 第三方文章：缓存按版本区分，不升版本不会更新 | 每次发布都升版本（已写入规则） | |
