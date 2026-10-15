# vic-harness

Vic 的工程 Harness Codex 插件：建立项目事实合同，按需配置代理，检查合同与配置，并推荐工作流。

**0.1.0 开发中，未发布。** 固定系列的规定技术门已有历史证据；已知语义与执行声明缺陷、用户人工体验验收仍未放行，见[第四系列正式记录](docs/harness/incidents/2026-10-15-m1-fourth-bootstrap.md)。

| 技能 | 当前能力 |
|---|---|
| `$vic-harness:vic-bootstrap` | 初始化或增量刷新 AGENTS.md 导航、项目事实文档与合同 |
| `$vic-harness:vic-agents` | 评估委派收益，维护官方代理 TOML；只配置，不启动代理 |
| `$vic-harness:vic-check` | 只读检查合同、路径、文档与代理配置 |
| `$vic-harness:vic-router` | 推荐当前场景的技能和工作流；仅推荐 |
| `$vic-harness:vic-learn` | 占位，学习与复盘能力计划在 M2 实现 |
| `$vic-harness:vic-prune` | 占位，剪枝与消融能力计划在 M3 实现 |

bootstrap、agents 仅由用户明确调用；check、router 允许自动调用。learn、prune 当前显式调用也只报告尚未实现。技能可独立使用；无需先初始化合同才能评估代理配置。

## 本地安装与调用

需要已安装 Codex CLI；本地安装与发现已在 CLI 0.162.1 验证。检查器和评测运行器需要 Node >=18，零 npm 运行时依赖。

在本仓库根目录执行：

```bash
codex plugin marketplace add . --json
codex plugin add vic-harness@vic-harness-local --json
codex plugin list --marketplace vic-harness-local --json
```

在 Codex 中明确调用带插件命名空间的技能，例如 `$vic-harness:vic-bootstrap`。通过 shell 传提示词时用单引号保护 `$`。命令示例采用标准工具；实际执行遵守目标仓库的 guidance，RTK 不是运行依赖。

发布技能在 `skills/`，共享资源在插件根的 `schemas/` 和 `scripts/`。技能从实际读取的 SKILL.md 路径定位共享资源，不依赖固定缓存路径或 hook 环境变量。

## 只读检查

使用源码时从本仓库根执行；安装后将脚本路径替换为实际插件根路径：

```bash
node scripts/vic-check.mjs --all --json --root "<目标仓库>"
```

`--all` 为默认全部规则，`--contract` 和 `--agents` 分别限定合同与代理规则，三者互斥。`--quiet` 简化输出，`--json` 优先；`--strict` 仅将弃用的合同 gate `command_hint` 提升为 error。

退出 0 表示无 error，仍可能有 warning；退出 1 表示发现 error；退出 2 表示参数、环境或检查器失败。0 error 不证明事实正确、合同未过期、模型可用或运行时已加载配置。M1 不支持 `--drift`、检查器 `--help` 或 refresh-log。

## 行为评测

运行器会调用模型，正常加载用户 provider；需要可用的 Codex CLI、认证与 Git。在本仓库根查看接口或运行 f1：

```bash
node evals/run.mjs --help
evals/run.sh --fixture f1 --skill vic-bootstrap --repeat 3 --layer 2 --model gpt-6.1-sol --effort low --timeout 1200
```

fixture 支持 f1–f4 的唯一短名前缀；每次 repeat 使用干净基线并执行首轮、第二轮及完整树比较。默认 repeat=1、layer=2，timeout 单位为秒；L3 尚未实现。`--rtk` 仅在用户要求时添加 RTK 模型命令指导。原始事件、来源 hash、检查与断言、用量保存在 `evals/results/`，汇总写入 `evals/metrics.csv`；未知实际模型或用量如实留空/null。

此为 source-path 显式读取技能的行为评测，与 marketplace 安装发现分别取证。同源 f1–f4 各三次固定系列的规定技术门已取得[历史证据](docs/harness/incidents/2026-10-15-m1-fourth-bootstrap.md)，不能抵销其中的语义与执行声明缺陷，也不能作为当前修订的行为回归。原生插件 loader 业务调用和用户人工体验验收仍未放行。

## 限制与可选插件

非标准根合同入口或未知自定义 schema 没有无损迁移定义时，bootstrap 进入只读受限报告，保护原件；agents 仅将其作为带来源的线索。不能保证完整迁移所有自定义合同。已知行为限制见 [bootstrap incidents](docs/harness/incidents/2026-10-14-bootstrap.md) 和 [agents incidents](docs/harness/incidents/2026-10-14-agents.md)。

bootstrap 显式调用期间按[独立语义审查协议](skills/vic-bootstrap/references/semantic-review.md)使用当前宿主已有能力：最多一个全新、只读职责 reviewer，先核对源码，再核对实际产物与完整最终声明，最多一次定向复核；不递归、不配置代理或执行业务。全新上下文、同一 reviewer 续传和原始执行事件分别确认；缺能力如实报告未执行/未完成，部分事件仅支持逐项有限核对。只读职责不是强制沙箱，作者转贴 JSON 不是原始事件。这一流程已接入，不表示真实模型行为修复已验证。

本地 marketplace 已接线 [mattpocock/skills](https://github.com/mattpocock/skills)，固定 SHA `49dd158d1076134a641b33efb035946536778336`；可选安装：

```bash
codex plugin add mattpocock-skills@vic-harness-local --json
```

Matt 本地隔离安装与技能发现已验证，物理干净机器、业务技能与自动更新仍待验。[Understand-Anything](https://github.com/Egonex-AI/Understand-Anything) 尚未集成，可按上游说明自行选用。外部插件缺席不阻塞核心流程，router 会给出替代建议。

规划见 [docs/plan](docs/plan/)，实施与验收方法见 [HANDOFF.md](HANDOFF.md)。
