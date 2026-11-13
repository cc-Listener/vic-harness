# vic-harness

Vic 的工程 harness：用一个插件装好 [mattpocock/skills](https://github.com/mattpocock/skills)（工作流）和 [Understand-Anything](https://github.com/Egonex-AI/Understand-Anything)（代码知识图谱），把两者接成一套工作流，并按周期升级和反思。支持 Claude Code 和 Codex。

| 组成 | 作用 |
|---|---|
| `mattpocock-skills` | 怎么做事：grilling → spec → tickets → implement/tdd → code-review → retro |
| `understand-anything` | 代码是什么：知识图谱、领域流程、diff 影响分析 |
| `vic` | `vic:vic` 接线规则（在哪一步查图谱）；`vic:vic-sync` 升级与反思 |

两个上游按 SHA 锁定在 [.claude-plugin/marketplace.json](.claude-plugin/marketplace.json)，这是唯一的版本来源，不复制上游代码。

## 安装

### Claude Code

```bash
claude plugin marketplace add cc-Listener/vic-harness
claude plugin install vic@vic-harness
```

这会一次装好 `vic`、`mattpocock-skills`、`understand-anything` 三个插件，重启后生效。

如果之前从别的来源装过 Matt 或 UA，比如官方目录的 `mattpocock-skills@claude-plugins-official`，先卸掉它，否则同一批 skill 会出现两份。

开启自动更新：在 `/plugin` → Marketplaces 里打开 vic-harness 的自动更新（第三方 marketplace 默认关闭）。团队也可以在 `~/.claude/settings.json` 里统一配置：

```json
{
  "extraKnownMarketplaces": {
    "vic-harness": { "source": { "source": "url", "url": "https://github.com/cc-Listener/vic-harness.git" }, "autoUpdate": true }
  }
}
```

### Codex

Codex 插件不支持依赖声明，所以由脚本按同一组锁定版本安装（需要 Node >= 18）：

```bash
git clone https://github.com/cc-Listener/vic-harness.git
node vic-harness/scripts/vic.mjs codex-install
```

脚本会：
- 按锁定的 SHA 添加两个上游 marketplace，并安装对应插件；
- 安装 `vic`；
- 在 `~/.codex/AGENTS.md` 里维护一个带标记的指针段，标记外的内容不动。

重复运行是安全的。升级时 `git pull` 后再跑一次即可。加 `--dry-run` 可以只打印命令、不执行。

## 使用

- 第一次在业务仓库里工作时：运行 `/mattpocock-skills:setup-matt-pocock-skills` 和 `/understand-anything:understand`。在 Codex 中把 `/` 换成 `$`。
- 之后照常使用 Matt 的工作流。agent 会按 `vic:vic` 的接线表，在实现、诊断、评审前先查图谱。
- 不确定用哪个 skill 时，运行 `/mattpocock-skills:ask-matt`。

## 升级与反思

- **自动：** `.github/workflows/upstream.yml` 每周查询一次上游。只要上游发布新版本（`plugin.json` 的 `version` 变化），就开一个 PR，附带版本变化和接线检查结果，由维护者合并。
- **手动：** 在本仓库运行 `/vic:vic-sync`。它会升级上游、修复失效的接线，并把本周期的 retro 结论落到接线表、检查或上游 issue 中。

## 开发

```bash
node --test                          # 单元测试
node scripts/vic.mjs check           # 校验 marketplace，并在锁定版本上校验接线引用（会克隆上游）
node scripts/vic.mjs check --offline # 只做结构校验
node scripts/vic.mjs upstream        # 查询上游最新版本，不写文件
```

设计决策见 [docs/adr/](docs/adr/)，术语见 [GLOSSARY.md](GLOSSARY.md)。
