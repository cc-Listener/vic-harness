# marketplace.json 是唯一的版本锁定来源

上游 SHA 和版本号只写在 `.claude-plugin/marketplace.json` 的条目里。Claude Code 直接读取它（vic 插件依赖同一 marketplace 里的上游条目，一条 install 装好全套）；Codex 不认 marketplace 里的远程条目，所以 `scripts/vic.mjs codex-install` 从同一文件读取 SHA，用 `codex plugin marketplace add --ref <sha>` 安装。

## Consequences

- 同一个上游插件不能再从官方目录或上游自己的 marketplace 另装一份：Claude Code 会把不同 marketplace 来源的同名插件当成两个插件。
- 在 Claude Code 中，上游条目的依赖属于同一 marketplace，因此不需要 `allowCrossMarketplaceDependenciesOn`，也不要求成员事先添加上游 marketplace。原型实测：跨 marketplace 依赖在全新环境中不会自动安装。
