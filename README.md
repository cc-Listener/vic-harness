# vic-harness

Vic 的工程 Harness 发行版（Codex plugin）。

`Agent = Model + Harness`。vic-harness 负责模型以外的部分：把仓库初始化成 agent 能可靠工作的状态，按需配置最小的多代理方案，并让这些约束随失误、仓库变化和模型升级持续进化。

| Skill | 作用 |
|---|---|
| `$vic-bootstrap` | 初始化或刷新项目合同（AGENTS.md 地图、docs、contracts） |
| `$vic-agents` | 评估是否需要子代理，维护 `.codex/` 下的代理配置 |
| `$vic-check` | 确定性检查合同和代理配置，检测是否过期 |
| `$vic-learn` | 记录失误，把教训变成规则、检查、闸门或角色改进 |
| `$vic-prune` | 剪掉过期和冗余的约束，换模型后做消融测试 |
| `$vic-router` | 告诉你当前场景该用哪个 skill |

可配合使用：[mattpocock/skills](https://github.com/mattpocock/skills)、[Understand-Anything](https://github.com/Egonex-AI/Understand-Anything)。

**当前状态：T01 插件骨架，0.1.0 开发中，未发布。** 六个技能仅含占位说明，调用时只报告尚未实现；上表描述的是计划职责。规划见 `docs/plan/`，实施方法见 `HANDOFF.md`。

在仓库根目录执行本地安装（需已安装 Codex CLI；T01 验证版本为 0.162.1）：

```bash
rtk proxy codex plugin marketplace add . --json
rtk proxy codex plugin add vic-harness@vic-harness-local --json
rtk proxy codex plugin list --marketplace vic-harness-local --json
```

CLI 显式调用建议使用带插件命名空间的名称，例如 `$vic-harness:vic-bootstrap`；在 shell 提示词中使用单引号保护 `$`。四个写入型技能（bootstrap、agents、learn、prune）仅供用户明确调用，check 和 router 允许自动调用；T01 先在占位说明中声明，正式 `agents/openai.yaml` 调用策略随对应技能实现加入。

发布技能放在 `skills/`；草稿放在 `lab/`。共享 schema 和脚本由后续任务加入插件根目录。M1 骨架不引用尚未实现的 hooks。此 marketplace 当前只列出 vic-harness；可选外部插件按上述官方仓库的安装说明单独安装。
