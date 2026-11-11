# vic-harness · Agent 指南

这个仓库是 vic-harness 的 marketplace 和 vic 插件源码。用户文档见 [README.md](README.md)。

## 读取顺序

1. [GLOSSARY.md](GLOSSARY.md)：术语（上游、锁定版本、接线、指针、图谱、升级、反思）
2. [docs/adr/](docs/adr/)：已定决策，修改前先读
3. 按任务读对应文件：
   - 分发与版本 → `.claude-plugin/marketplace.json`、`scripts/vic.mjs`
   - 接线规则 → `plugins/vic/skills/vic/SKILL.md`
   - 升级与反思流程 → `plugins/vic/skills/vic-sync/SKILL.md`、`.github/workflows/upstream.yml`

## 规则

- 不复制上游的代码或 skill 文本，只按 SHA 引用（ADR 0001）。
- 版本只写在 `.claude-plugin/marketplace.json` 一处（ADR 0002）。
- 修改 `plugins/vic/` 下的内容后，把 `plugins/vic/.claude-plugin/plugin.json` 的 `version` 加一，否则成员机器不会更新。
- 接线表里引用上游 skill 时，一律写完整的 `/插件:skill`；`scripts/vic.mjs check` 会在锁定版本上逐一校验这些引用。
- 零 npm 依赖，Node >= 18。

## 验证

提交前运行：

```bash
node --test
node scripts/vic.mjs check
```

v1 已废弃，只保留在本地 tag `v1-archive`，不要从中迁移代码。
