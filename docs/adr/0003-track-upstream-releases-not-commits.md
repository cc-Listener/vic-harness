# 跟踪上游发布版本，不跟踪每个 commit

升级只在上游 `plugin.json` 的 `version` 变化时发生。两个上游都在 `plugin.json` 里声明了 `version`，Claude Code 以它判断是否需要重新拉取，所以只改 SHA、不改版本的升级不会到达成员机器，还会让团队成员之间的状态不一致。
