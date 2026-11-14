# marketplace.json 是唯一的版本锁定来源

上游 SHA 和版本号只写在 `.claude-plugin/marketplace.json` 的条目里。Claude Code 和 Codex 都从这个 marketplace 安装全部三个插件，不再单独添加上游的 marketplace，命令行里也不写 SHA（安装方式见 0006）。

## Consequences

- 同一个上游插件不能再从官方目录或上游自己的 marketplace 另装一份：两个 runtime 都会把不同 marketplace 来源的同名插件当成两个插件。
- 上游条目的 `source` 只能用 `url` 或 `git-subdir`。这是两个 runtime 都支持、且走 HTTPS 的类型；Codex 不认 `github` 类型，而 `github` 类型在 Claude Code 中会走 SSH，在 22 端口被封的网络里装不上。
- 在 Claude Code 中，上游条目的依赖属于同一 marketplace，因此不需要 `allowCrossMarketplaceDependenciesOn`，也不要求成员事先添加上游 marketplace。原型实测：跨 marketplace 依赖在全新环境中不会自动安装。
