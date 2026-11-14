# 接线规则放在 vic 插件的 skill 里，各 runtime 只注入一行指针

接线规则写在 `plugins/vic/skills/vic/SKILL.md`，随插件版本更新。Claude Code 由插件自带的 SessionStart hook 注入一行指针。Codex 的插件 hook 在 CLI 0.166.0 上不可用（`plugin_hooks` 状态为 removed，实测 vic 的 hook 没有注入），所以由 `codex-install` 在 `~/.codex/AGENTS.md` 维护一个带标记的指针段，标记外的内容原样保留。等 Codex 的插件 hook 可用后，改为与 Claude Code 共用同一个 hook，删除这个指针段。业务仓库里不放规则副本。
