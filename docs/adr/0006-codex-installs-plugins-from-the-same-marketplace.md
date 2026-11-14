# Codex 从同一个 marketplace 以插件形式安装

早期判断 Codex 不认 marketplace 里的远程条目，于是让 `codex-install` 按 SHA 单独添加两个上游 marketplace。这个判断是错的：失败的只是 `github` 类型，Codex 支持 `url` 和 `git-subdir` 两种远程类型，也支持 `sha` 锁定。改为 Codex 直接从 vic-harness marketplace 安装三个插件，实测装到的正是锁定的 commit。

`codex-install` 仍然保留，原因有三：Codex 没有插件依赖，需要逐个 `plugin add`；需要清理旧版单独添加的上游 marketplace，避免 skill 出现两份；以及维护 `~/.codex/AGENTS.md` 指针（见 0004）。升级时 `codex plugin marketplace upgrade vic-harness` 会刷新锁定版本。

## Considered Options

- marketplace 条目写 `policy.installation: INSTALLED_BY_DEFAULT`，让添加 marketplace 后自动安装：在 Codex CLI 0.166.0 上实测无效，添加后没有任何插件被安装。
