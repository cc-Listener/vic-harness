# 接线规则放在 vic 插件的 skill 里，各 runtime 只注入一行指针

接线规则写在 `plugins/vic/skills/vic/SKILL.md`，随插件版本更新。Claude Code 由插件自带的 SessionStart hook 注入一行指针；Codex 已经移除了插件 hook（`plugin_hooks` 状态为 removed），所以由 `codex-install` 在 `~/.codex/AGENTS.md` 维护一个带标记的指针段，标记外的内容原样保留。业务仓库里不放规则副本。
