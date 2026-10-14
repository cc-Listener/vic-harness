# 示例

以下 YAML 是针对差异的摘要片段，完整质量门按 [摘要模板](output-schema.yaml) 填写。模型示例基于 2026-10-14 的核验；使用前按 [模型策略](model-policy.md) 重新确认客户端支持。

## 1. 小改动，零文件变更

输入：为设置页增加时区选择；成本优先；现有主会话已能完成，没有独立评审收益。

建议：保持 single-agent，保留已有配置，不创建空 `.codex/config.toml` 或自定义实现角色。

```yaml
use_multi_agent: "no"
requires_explicit_codex_multiagent_invocation: "no"
delegation:
  trigger: none
  execution_status: not-started
recommended_topology:
  label: single-agent
  main_session_role: implementer
  rationale: 局部任务没有可独立委派的工作
main_session:
  role: implementer
  runtime_class: current-session
  materialized_path: null
active_agents: []
custom_agent_files: []
materialization:
  mode: repo-local
  status: unchanged
repo_local_artifacts:
  config:
    path: .codex/config.toml
    required: "no"
    action: not-needed
  custom_agents: []
superpowers_integration:
  status: unknown
  bridge_materialization_allowed: "no"
  notes: 跳过可选 bridge，无需为此中断任务
```

## 2. 主会话实现，一个子代理评审

输入：认证逻辑跨模块回归，需要长期复用独立评审角色；用户已要求使用子代理，并明确要求新建的项目配置硬上限为一条子线程；客户端已确认支持 `gpt-6.1-sol` 的 `high`。

建议：主会话负责实现，仅持久化 reviewer；写入配置后报告计划，不声称已经完成实际评审。

`.codex/config.toml`：

```toml
[agents]
max_concurrent_threads_per_session = 1
```

`.codex/agents/reviewer.toml`：

```toml
name = "reviewer"
description = "检查认证改动的正确性、回归、权限与测试缺口。"
model = "gpt-6.1-sol"
model_reasoning_effort = "high"
developer_instructions = """
评审分配的改动和相关调用方，不修改代码。
优先报告有证据的正确性、权限和数据完整性问题，附文件位置、影响与验证方法。
没有发现时说明已检查范围与剩余风险。根据风险运行必要验证，已有证据充分时结束。
"""
```

摘要片段：

```yaml
use_multi_agent: "yes"
requires_explicit_codex_multiagent_invocation: "no"
delegation:
  trigger: user-request
  execution_status: not-started
recommended_topology:
  label: staged-pair
  main_session_role: implementer
  rationale: 认证回归需要独立证据检查
minimal_setup:
  agent_count: 1
  topology: single-agent
enhanced_setup:
  agent_count: 2
  topology: staged-pair
main_session:
  role: implementer
  runtime_class: current-session
  materialized_path: null
active_agents:
  - name: reviewer
    kind: custom
    run_mode: spawned
    runtime_class: isolated-child
    materialized_path: .codex/agents/reviewer.toml
    owned_scope: 认证改动及相关调用方，只读评审
    purpose: 提供独立评审证据
custom_agent_files:
  - path: .codex/agents/reviewer.toml
    action: created
guardrails:
  global:
    max_agents: 2
    max_concurrent_subagents: 1
```

## 3. Ultra 父会话下使用轻量扫描角色

输入：用户需要可复用的窄范围只读扫描，客户端确认 Luna 与 `high` 可用，父会话推理为 Ultra。

优先考虑内置 explorer；只有该扫描需要长期固定职责和模型时，才定义如下 custom agent。显式同时写模型和推理，以避免继承不兼容的 Ultra。

```toml
name = "repo_scan"
description = "查找指定符号的调用路径，返回文件位置与证据。"
model = "gpt-6-luna"
model_reasoning_effort = "high"
developer_instructions = """
只在分配的范围内查找符号、调用方与相关测试，不修改代码。
返回可复核的文件路径、关键依赖和未确认项；引用已有日志与相关片段，不创建文件。
"""
```

示例的只读职责写在 `developer_instructions`，不生成虚假的角色权限隔离字段。角色文件的 sandbox_mode、approval_policy、model_provider、mcp_servers 不覆盖父会话，真实权限以父运行时与外部工具授权为准；此处未进行客户端加载测试。

上述三例分别作为 f5 小任务、f6 独立评审与 f6 `task-ultra.md` 变体的参考行为。T06 只校验文本和临时 TOML，不声称已完成 T12 的真实技能行为评测。M1 三例都不写 refresh-log；第一例不创建 contracts 或任何空配置。
