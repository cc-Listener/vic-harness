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

**当前状态：规划阶段。** 规划见 `docs/plan/`，实施方法见 `HANDOFF.md`。
