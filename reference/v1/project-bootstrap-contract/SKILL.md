---
name: project-bootstrap-contract
description: 为仓库初始化或刷新项目合同。用于仓库缺少可靠的 `AGENTS.md` 导航层、缺少 machine-readable 项目上下文、需要首次补齐 bootstrap 合同，或已有合同层分层混乱、内容重复、需要静默增量刷新时。它可以独立运行，也可以被其他 workflow 选择性消费。
---

# 项目 Bootstrap 合同

为后续 agent 工作流建立最小项目合同，让它们基于稳定的仓库事实工作，而不是每次临时搜索和猜测。生成或刷新导航优先的 `AGENTS.md`、少量人类可读的项目地图，以及 machine-readable 的项目上下文合同。

不要把它扩成完整治理系统。只产出后续 skill 可复用的最小、耐用初始化层。
不要把它扩展成 Codex agent 配置生成器；它不负责生成 `.codex/agents/topology.yaml`、`.codex/agents/roles/*.md` 或 `.codex/agents/bridges/*.md`。

共享 schema 只作为接口，不改变职责分层：

- 本 skill 负责生成和刷新项目事实。
- 其他 skill 可以消费这些事实，例如 multi-agent 配置生成器。
- 两者共享 `project-context` schema，但不共享决策职责。

## 默认模式

默认使用 `bootstrap-or-refresh`。

- 本 skill 可以独立运行，不依赖其他 skill 先调用。
- 如果项目没有可用的初始化资产，执行首次 `bootstrap`。
- 如果项目只有局部初始化资产，例如已有 `.codex/config.toml`、`.codex/agents/*.toml`、旧版 agent 文档或导航文件，但缺少 bootstrap 层的最小集合，仍按 `bootstrap` 或 `refresh` 处理，不视为 `no-op`。
- 如果项目已经有初始化资产，执行增量 `refresh`。
- 如果没有结构性变化且当前合同仍然一致，保持文件不变。
- 当仓库存在主前端或主应用子域（如 `apps/*`）且复杂度显著高于根层摘要时，默认在仓库层 `bootstrap/refresh` 之后追加一次 **app-deep refresh**，避免只做“根层浅初始化”。

## 必需产物

只创建或刷新最小必需集合：

- `AGENTS.md`
- `docs/project-map.md`
- `docs/conventions.md`
- `docs/component-contract.md`
- `contracts/project-context.yaml`

如果仓库已经有等价文件，优先原地复用和更新，不要制造重复文件。

下面这些不是本 skill 的产物：

- `.codex/agents/topology.yaml`
- `.codex/agents/roles/*.md`
- `.codex/agents/bridges/*.md`

这些属于 Codex agent 配置层，应由 [`$multi-agent-config`](/Users/aze/.codex/skills/multi-agent-config/SKILL.md) 负责。

## 文档落位策略

默认优先“根目录集中 + 子域分层”：

- 根层文档保留在 `docs/` 与 `contracts/`。
- 子项目文档默认放在 `docs/apps/<app>/`（而不是 `apps/<app>/docs/`）。
- 子项目 machine-readable 合同默认放在 `contracts/apps/<app>-project-context.yaml`。

如果仓库已经稳定采用 `apps/<app>/docs` 或 `apps/<app>/contracts`，可沿用既有约定；但必须确保根层导航能路由到子项目入口，并避免双份事实漂移。

## 子项目深层产物（条件触发）

当触发 app-deep refresh 时，除根层最小集合外，至少补齐一个可导航的子项目合同层：

- `<app>/AGENTS.md` 或等价 app-level guidance 入口
- `docs/apps/<app>/project-map.md`
- `docs/apps/<app>/conventions.md`
- `docs/apps/<app>/component-contract.md`
- `contracts/apps/<app>-project-context.yaml`（或仓库既有等价路径）

## 工作流

1. 检查仓库里已有的初始化资产。
   查看生效 guidance 文件 `AGENTS.override.md` / `AGENTS.md`、仓库内文档、贡献指南、lint 和 test 配置、包清单、workspace 清单、UI 或共享组件目录，以及已有的 machine-readable contract。
   默认把以下集合作为 bootstrap 层的最小初始化资产：
   - `AGENTS.md`、更高优先级的 `AGENTS.override.md`，或等价导航层
   - `docs/project-map.md`
   - `docs/conventions.md`
   - `docs/component-contract.md`
   - `contracts/project-context.yaml` 或等价 machine-readable 项目合同
   已有 canonical agent contract 或 agent registry 只能证明“agent 执行合同存在”，不能单独证明 bootstrap 层已经完整。
   只有当仓库已存在 legacy 的 `.codex/agents/README.md`、`docs/AGENTS.md`、agent index 或 bridge 文档时，才做一次轻量分层检查。
   这些 legacy 相邻层文件只用于检查分层是否冲突，不作为 bootstrap 完整性的判据。
   同时识别是否存在需要深层初始化的主应用子域（例如 `apps/web-*`、`apps/admin-*`、`packages/<app-shell>` 等）。

2. 将本次运行归类为 `bootstrap`、`refresh` 或 `no-op`。
   核心初始化资产缺失时使用 `bootstrap`。
   只有 agent contract、导航层或零散文档存在，但 bootstrap 层最小集合不完整时，默认使用 `bootstrap`；如果 bootstrap 层存在但事实过期，则使用 `refresh`。
   项目已有资产但结构事实发生变化时使用 `refresh`。
   合同与仓库仍然一致时使用 `no-op`。
   如果文件存在但分层失真，例如 `AGENTS.md` 膨胀成治理文档、agent index 重复仓库导航、bridge 重复项目事实，也应归类为 `refresh`，而不是 `no-op`。
   如果根层合同完整但主应用子域缺少 app-level 导航、app-level facts 或组件可定位索引，归类为 `refresh`（app-deep refresh），而不是 `no-op`。

3. 建立最小项目事实清单。
   至少覆盖：
   - 仓库结构和主要模块
   - 开发规范与验证 gate
   - guarded path 或 release-gated path
   - 二次封装组件、共享 abstraction 与推荐入口
   - 组件可定位索引（场景 -> import -> 入口文件 -> 关键源码文件 -> 代表导出符号）
   - 已知不确定项与缺失证据
   同时建立最小分层清单：
   - 仓库导航层放什么
   - agent contract 层放什么
   - machine-readable 项目事实层放什么
   - 如存在 legacy bridge / index 层，它们只保留什么

3.5 如触发 app-deep refresh，建立子项目事实清单。
   至少覆盖：
   - 子项目入口链路（如 `main` / `bootstrap` / `router` / `api` / `adapter`）
   - 子项目 guarded path（尤其 env、构建配置、路由守卫、请求拦截器、封装适配层）
   - 子项目组件封装索引（全局组件键名、常用 hooks 实现来源、定位顺序、检索命令）

4. 写入或刷新导航层。
   保持导航层简短，让它指向真正的事实来源，而不是重复整套规则。
   如果仓库已存在 `AGENTS.override.md`，尊重它高于 `AGENTS.md` 的官方优先级，不要让低优先级文件与其冲突。
   默认让生效导航层只承担：
   - 读取顺序
   - canonical source 指针
   - 最小路由
   - 少量 hard stops

5. 写入或刷新 machine-readable contract。
   把稳定事实放进 `contracts/project-context.yaml`。凡是会影响后续 agent 决策的内容，优先用明确字段而不是大段 prose。
   默认遵循 [references/project-context-schema.yaml](references/project-context-schema.yaml) 的最小共享 schema。
   在 `navigation_layer` 中显式写出当前生效 guidance 入口和入口类型，避免 override 场景下产生歧义。
   `project-context.yaml` 只承载项目事实接口，不承载 Codex topology 推荐、role 合同或 execution order。

6. 仅当仓库已存在 legacy 的 agent 目录索引或 bridge 文档时，做一次轻量分层校正。
   例如 `.codex/agents/README.md`、`docs/AGENTS.md` 或类似索引页，应只说明本目录下的 contract / bridge 文件职责与何时读取，不应再复制仓库导航层或项目事实层。
   bridge 文档应聚焦“外部流程系统如何映射到本仓库本地约束”，不应重写完整项目地图。
   这一步只做去重和层次纠偏，不负责生成 `.codex/agents/topology.yaml`、`roles/*.md` 或 `bridges/*.md`。

7. 应用静默增量刷新规则。
   如果项目在本 skill 关注的范围内发生变化，只更新受影响部分。不要因为无关改动重写整份合同。

8. 保守处理不确定性。
   如果开发规范或封装组件无法从仓库中证实，就标记为 uncertain，不要自行发明。

## 子项目深层触发信号（app-deep refresh）

命中任一信号，且现有合同无法覆盖该子域时，应执行 app-deep refresh：

- 主应用目录存在复杂入口链（如 `src/main.*` + `src/bootstrap.*` + `src/router/*`）。
- 子项目具备独立构建与环境配置（如独立 `package.json`、`vite.config.*`、`.env*`）。
- 子项目存在明显的二次封装层（如 `adapter`、`setup`、`ui-kit`、`plugins`）。
- 用户明确要求“主前端/主应用深层初始化”。

## component-contract 质量门（新增）

`docs/component-contract.md`（含 app-level 版本）至少应满足：

- 有“封装层定位索引表”，包含：场景、优先 import、包入口、关键源码入口、代表导出。
- 有“组件/符号可检索索引”，至少覆盖常用全局组件键名或关键导出符号。
- 有“找不到组件时的定位顺序”，明确先查哪里、后查哪里。
- 有可执行的仓库检索命令示例（如 `rg`），避免仅给原则性描述。

若仅有抽象原则、没有可定位索引，默认视为合同不完整，应归类为 `refresh`，而不是 `no-op`。

## 静默刷新策略

默认采用静默、事件驱动的增量刷新。

在以下任一变化发生时刷新：

- 顶层目录、workspace、package 或 app 边界
- 共享组件库或 wrapper 层
- lint、format、test、build、CI、贡献文档等项目规则入口
- guarded path、review gate、release gate 或 ownership 规则
- canonical 项目合同文件
- 导航层、agent index、bridge 与 project-context 之间出现明显重复或分层错位
- 主应用子域合同层缺失或过浅（只有根层摘要，没有 app-level 路由与事实）
- component-contract 缺少可定位索引（只有原则，没有入口/符号/检索路径）

以下情况默认不刷新：

- 普通功能代码改动
- 小型 bug 修复
- 不改变项目规范的局部测试修改
- 文案或纯内容更新

如果其他 workflow 或 skill 发现关键字段缺失或明显过期，允许触发一次静默补刷新。
仅 `.codex/agents/*` 的变化本身，不应默认触发 bootstrap refresh；只有这些变化暴露了 `AGENTS.md`、`project-context.yaml`、导航层或索引层之间的事实冲突、重复或错位时，才应触发本 skill。

## Refresh Evidence Contract

当本次运行被归类为 `refresh` 或 `no-op` 时，输出至少应包含：

- `trigger_evidence`
- `affected_artifacts`
- `unchanged_artifacts`
- `uncertainty`（若存在）
- `depth_scope`（`repo` / `repo+app`）
- `app_targets`（若执行 app-deep refresh）
- `placement_strategy`（`root-docs` / `app-local-docs`，说明为何采用）

目标是让静默刷新可审计，而不是只给“已刷新”或“无需刷新”的笼统结论。

## 输出规则

- 保持 `AGENTS.md` 是地图，不是堆料文档。
- `AGENTS.md` 默认应短到可快速扫读；优先链接，不优先复制。
- 优先更新现有文件，不创建平行替代物。
- 文档落位默认优先根目录 `docs/` 分层（如 `docs/apps/<app>/...`）；只有仓库已有稳定 app-local 约定时才沿用本地路径。
- 把人类可读说明与 machine-readable 事实分开。
- 用 `uncertainty` 或等价字段显式标记未知项。
- 在合适时保留仓库已有命名和结构。
- 不要声称项目遵循了没有仓库证据支撑的规范。
- 尊重 `AGENTS.override.md` > `AGENTS.md` 的官方优先级；如果 override 已存在，不要让更低优先级的导航文件与其冲突。
- 如果 `AGENTS.override.md` 存在，默认把它视为 guidance entrypoint；`AGENTS.md` 退为较低优先级导航层。
- 如果仓库已有 `.codex/agents/README.md` 或等价索引页，默认把它视为 agent 目录索引层，而不是仓库导航层。
- `.codex/agents/*` 是相邻配置层，不是 bootstrap 产物。
- 输出时优先消除重复事实，而不是把同一套规则平移到更多文件。
- `component-contract` 默认采用双层结构：根层做跨仓索引，app-level 做可执行定位细节；两层互相链接，避免重复正文。
- 对 `refresh` 或 `no-op`，始终写清触发证据、受影响文件与保持不变的部分。
- 人类可读输出默认使用简体中文。
- 保留英文的内容仅限：
  - schema 字段名
  - YAML 键名
  - 文件路径
  - 必要技术术语
- `AGENTS.md`、`docs/project-map.md`、`docs/conventions.md`、`docs/component-contract.md`、说明性 prose、`uncertainty`、以及 refresh/no-op 的解释性结论，默认都应使用简体中文，除非用户明确要求其他语言。

## 文件意图

- `AGENTS.md`
  默认导航层，给 agent 和人类看，指向 canonical 文档和 contract。
  如果仓库已采用 `AGENTS.override.md` 作为生效入口，仍应避免两者内容冲突。
- `docs/project-map.md`
  高层仓库结构、主要模块和 guarded 区域。
- `docs/conventions.md`
  工作规则：风格、测试、验证、发布与 review 预期。
- `docs/component-contract.md`
  二次封装组件、共享 abstraction、推荐用法路径，以及 “do not bypass” 规则。
- `contracts/project-context.yaml`
  提供给后续 skill 使用的稳定 machine-readable 项目事实。
  只承载事实接口，不承载 Codex topology、role 配置或 execution order。

app-deep refresh 常见文件意图：

- `docs/apps/<app>/project-map.md`
  子项目结构、入口链路和 guarded path。
- `docs/apps/<app>/conventions.md`
  子项目运行约束、验证 gate 与集成约束。
- `docs/apps/<app>/component-contract.md`
  子项目可定位组件索引（入口、符号、定位顺序、检索命令）。
- `contracts/apps/<app>-project-context.yaml`
  子项目 machine-readable 事实接口。

可选但常见的配套索引层：

- `.codex/agents/README.md`
  如果存在，应只解释 `.codex/agents/` 内各 contract / bridge 文件的职责和读取时机。
  它不是 bootstrap 必需物，也不是 bootstrap 完整性的判据，但作为 legacy 索引层，经常需要在 refresh 时一起去重和校正。

## Guardrails

- 不要创建一个重复整仓库内容的巨大 `AGENTS.md`。
- 不要把 `AGENTS.md` 写成第二份 harness、第二份 bridge 或第二份 project context。
- 不要只输出“原则型” `component-contract`；缺少入口、符号、定位顺序与检索命令的文档视为不合格。
- 不要忽略已有 `AGENTS.override.md` 的优先级，或让它与 `AGENTS.md` 长期漂移。
- 不要只根据命名猜测就发明组件合同。
- 如果仓库本身不支持，不要强塞 framework-specific 章节。
- 除非刷新确实需要，不要覆盖用户已有文档。
- 不要把“已有 agent contract”误判成“项目初始化已经完整”。
- 不要生成或重写 `.codex/agents/topology.yaml`、`.codex/agents/roles/*.md` 或 `.codex/agents/bridges/*.md`。
- 不要把 multi-agent 的角色拆分、topology 推荐、review gate 设计写回共享 schema。
- 不要把这个 skill 扩展成任务规划或 sub-agent orchestration。
- 不要把 agent index、bridge、导航层和 machine-readable contract 混成一个层。
- 不要在根层与 app 层分别维护两份独立事实正文且不互链；允许分层，不允许漂移。

## 导航层质量门

`AGENTS.md` 至少应该满足：

- 能告诉后续 agent 先读什么、再读什么
- 能指出 canonical agent contract 与 machine-readable 项目事实在哪里
- 能给最小路由和少量 hard stops
- 不要求读者在这里理解完整治理细节

## 交付提醒

这个 skill 负责为项目初始化合同与项目上下文。它不负责判断是否需要 multi-agent，不会自行 spawn agent，也不负责生成 `.codex/agents/*` 的配置层文件。
