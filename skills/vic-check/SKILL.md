---
name: vic-check
description: 只读检查项目合同、路径、AGENTS.md 体积、组件文档和代理 TOML，解释问题并推荐下一步；M1 尚无过期检测。Check harness contract health, AGENTS.md size, agent TOML validity; drift unavailable in M1.
---

允许模型自动调用。只执行确定性只读检查、解释结果和建议下一步，不刷新、迁移、修复、删除文件，不写目标仓库日志，不安装依赖、不联网、不运行业务 gate。

## 执行

1. 确认目标仓库根与检查范围。目标根默认当前工作仓库；路径不明时先只读核实，避免检查插件自身。
2. 从本技能实际 `SKILL.md` 所在目录解析 [检查脚本](../../scripts/vic-check.mjs)，即 `../../scripts/vic-check.mjs`。不要硬编码安装缓存，也不要假定普通 shell 有 hook 专用变量。需要 Node ≥18，零 npm 运行时依赖。
3. 使用实际脚本路径和目标根执行下列命令。尖括号为文档占位，执行时替换并正确引用参数；遵守目标仓库要求的命令代理。

```bash
rtk proxy node "<实际插件根>/scripts/vic-check.mjs" --all --json --root "<目标仓库>"
```

| 参数 | 当前语义 |
|---|---|
| `--all` | 默认全部已实现规则；与其他范围互斥。 |
| `--contract` | 仅当前合同/文档规则，不包含代理 TOML 规则；仍可能扫描配置中的路径/文档。 |
| `--agents` | 代理配置规则 A01–A07。 |
| `--json` | 输出 version/root/summary/findings；root 为 `.`，相对传入目标根；finding 含 id/severity/file/message/hint。 |
| `--quiet` | 无问题无输出，有问题一行摘要；同时指定 `--json` 时 JSON 优先。 |
| `--strict` | 当前只将合同 gate 的弃用 `command_hint` 报为 error，不将所有 warn 升级。 |
| `--root <path>` | 存在且可读的目标目录；默认进程当前目录。 |

M1 不支持 `--drift`（M2/T10）或 `--help`。过期检测、完整来源字段和 refresh-log 一致性尚未实现，不以规划中的全部 C01–C12 宣称当前覆盖。需要过期判断时人工对照 evidence 与源码变更。

## 解释结果

- 退出 0：此次规则无 error，仍可能有 warn；保留并解释 warning。
- 退出 1：发现 error，按 error 后 warn 汇总 id、file、message、hint，说明影响和下一步。
- 退出 2：参数、环境或检查器自身失败，说明“无法完成检查”并保留诊断；不是合同违规结论。Node 不可用等进程启动失败也属于未完成检查，不冒充上述脚本退出码。
- JSON 无 initialized 字段。必要时只读核实目标根的 `contracts` 或 `.codex` 是否存在；两者均不存在时当前 checker 视为未初始化。空 findings/summary 不能独自证明合同完整；仅有 `.codex` 也不能证明项目合同存在。
- “0 error”不证明所有事实正确、合同未过期、模型可用或配置已在运行时生效。

## 下一步建议

合同 schema、路径、导航、组件文档问题建议用户明确调用 `$vic-bootstrap`；代理 TOML、旧平行层问题建议用户明确调用 `$vic-agents`。组件文档可由合同显式指针指定，不要求一律重建默认同名文件。跨所有权问题分别说明所属技能，不代改外部资产或无关历史配置。

回复使用简体中文，保留规则 ID、路径和技术名，给出实际范围、退出状态、error/warn 数量及主要定位；未执行或受阻的检查明确说明。推荐不等于执行授权，不自动调用写入型技能。
