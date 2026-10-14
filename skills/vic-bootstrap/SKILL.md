---
name: vic-bootstrap
description: 仅在用户明确要求时，为仓库初始化或增量刷新项目事实合同：AGENTS.md 导航、项目地图、约定、组件定位与 project-context。Bootstrap or refresh repo contract.
---

# 仓库事实合同

建立能让后续 agent 找到证据和入口的最小合同；默认模式为 `bootstrap-or-refresh`，可独立运行。
这是 M1 行为：不生成 refresh-log、来源日期、`origin/status/added/last_confirmed`、`watch_paths`、`refreshed_at_commit`、`integrations` 或 `foreign_sections`。已有这些字段时保留仍有效的值，不凭空刷新。
人类可读内容统一使用简体中文；schema 字段、路径、模型名和必要技术术语保留原文。

## 执行边界

- 只维护导航、项目事实文档和事实合同；代理配置归 `$vic-agents`。不读写 `.codex/config.toml`、`.codex/agents/*`、`.codex/AGENTS.md`，不启动代理或执行业务任务。
- 平行层 `topology.yaml`、`roles/*.md`、`bridges/*.md` 和 `.codex/agents/README.md` 只由检查器报告；迁移交给 `$vic-agents`。`docs/agents/` 是外部工作流文档，不当成 legacy 层纠偏。
- 文件/段落的写权限以 [ownership.md](references/ownership.md) 为准；先划定保护范围再写入。未知所有权保守保留。
- 所有合同路径相对目标仓库根；Markdown 链接相对所在文件。发布文本和产物不写用户绝对路径。
- 只运行已检查过内容的本地只读 gate；禁止 deploy、publish、release、数据库迁移和任何会写外部系统的命令。
- 命令示例使用标准工具；实际执行遵守目标 guidance 的命令代理要求，不假设仓库已安装 RTK。

## 共享资源

从当前会话实际读取的本 `SKILL.md` 所在目录解析 `../../` 得到插件根，按该路径读取共享资源；不得猜缓存路径或依赖 hook 环境变量。
合同规则以 [project-context.schema.yaml](../../schemas/project-context.schema.yaml) 和 [MIGRATIONS.md](../../schemas/MIGRATIONS.md) 为唯一来源；[example](../../schemas/project-context.example.yaml) 是覆盖 M2 的教学示例，不照抄为 M1 产物。
检查器是插件根的 `scripts/vic-check.mjs`，执行时把目标仓库传给 `--root`；读取和检查插件文件不改变目标仓库。

## 工作流

1. **先划读取边界，再盘点资产。** 用 `rg --files --hidden --no-ignore -g '!**/.git/**' -g '!**/node_modules/**' -g '!**/dist/**'` 只列路径，包含隐藏/忽略配置；按 [ownership.md](references/ownership.md) 区分可维护、可读只读与禁读资产。后续读取、内容检索和哈希只作用于允许集合，禁读路径交产品检查器按职责报告。
   在允许范围阅读生效 guidance、现有 canonical 文档/合同、贡献指南、包/workspace 清单、验证/构建/CI 配置与源码；保存可读外部段落原始字节，盘点 scoped guidance。环境文件核对路径与配置角色，凭据值不写产物。
   完成条件：读取与写入边界明确；按 [artifacts.md](references/artifacts.md) 识别现有合同。非标准根入口或自定义 schema 无无损迁移定义时进入只读受限报告，不覆盖、不复制事实，也不宣称完整升级或 no-op。
2. **统一调查根与 app 事实。** 在任何产物写入前，按 [artifacts.md](references/artifacts.md) 和 [app-deep.md](references/app-deep.md) 的信号调查关键结构/模块、guarded、验证能力、推荐封装、定位符号及已知缺项，确定真实 app 边界、根/子归属和唯一 canonical 落位。普通源码目录不是独立应用；单应用的深层事实落根，已有等价入口和 app-local 约定原位复用。
   将调查结果汇入本次上下文中唯一的已核实关键事实集合：每项关联证据、所属层、已有条目/稳定 ID、适用 GP/VG/PA/LI/CR 字段与文档位置；保留已有充分覆盖，不枚举所有 export 或脚本。集合只留在内存/上下文，不新建 manifest、临时合同或状态文件。推断标 `inferred`，无法支撑的结论归 `uncertainty`，无组件/无 gate 可用空数组。
   完成条件：根和所需 app 调查均已完成，import/barrel/导出/实现及真实路径已核实；每项关键事实知道要交付到哪里，PA 与 LI 各自的定位字段分别明确，不能互相代替。
3. **先运行反馈，再以覆盖缺口确定模式。** 调查完成后，依 [coverage.md](references/coverage.md) 将已读允许证据及已核实关键事实经 stdin 交内部只读反馈，真实运行并读取缺基线、gap/review 或 restricted 结果。
   结合已完成的 canonical/所有权调查，按 [refresh-policy.md](references/refresh-policy.md) 检查最小资产、分层、组件质量门和 app-deep，再判 `bootstrap` / `refresh` / `no-op`；已有产物仍须双向人工核对。标准根缺失可能另有非标准 canonical，反馈不扩展写权限。刷新依据是缺失、失效、错层或无法定位的覆盖，不是还能增加描述或更细入口。
   完成条件：模式有具体证据与必要改动范围；已有聚合 gate 的实际覆盖已核对。无 git 变化不是充分条件，只有代理配置也不算完整初始化。`no-op` 直接到第 8 步，不跑项目 gate，零创建/覆盖/删除/时间戳/日志写入。
4. **将 gate 核验结果补回同一集合。** 按 [artifacts.md](references/artifacts.md) 区分验证入口索引与执行资格；先静态检查调用链、本地依赖和工具/shim，确认不下载、不联网、不写缓存后才执行。缺依赖或无法确认只读时仅索引，连包管理器 `--version` 也不运行。可安全执行的 lint/typecheck/format-check 每条最多 120 秒；测试默认只索引，用户明确要求才运行。
   完成条件：每条本次核验 gate 有真实 `verified` 及未验证原因；真实结束才记录 `exit_code`，失败/超时/权限或依赖缺失进入 `uncertainty`。保留仍有效的既有执行证据，不安装依赖、写缓存或事后清理来冒充只读验证；不能执行不免除应有的索引交付。
5. **从同一集合增量序列化合同。** 按共享 schema 与 [artifacts.md](references/artifacts.md) 生成根及所需子合同，每文件一份 YAML。保留稳定 ID、有效旧事实/M2 扩展、`version: 1`、`bootstrap_status.level`、旧导航 `role/value`、abstraction `path` 等兼容形状；新 gate 使用 `command`，旧别名按迁移规则读取。
   按 [直接提交最终文本](references/ownership.md#直接提交最终文本) 优先将最终内容或定向 diff 交宿主已有编辑/补丁工具，先确认授权路径并完整读回已有文件；精确保留外部字节及有效字段，无法保真则如实未完成。`no-op` 不调用写工具。
   完成条件：集合中需机器交付的事实进入所属字段，根 `apps[]` 与 `scoped_guidance` 注册指向实际 app/文档/guidance；根/子分工及组件文档 sources 指针符合 references。只增量修改已判定缺口，不在序列化时重新挑选事实或重排无关内容。
6. **从同一集合增量生成人读文档。** 按 [artifacts.md](references/artifacts.md) 与 [app-deep.md](references/app-deep.md) 更新导航、地图、事实性约定和组件文档；与合同共享事实、归属和定位值，保留准确 prose、等价入口与外部原文。解释、导航和外部规范指针不必机械转成 YAML。
   完成条件：根与各目标 app 的必需文档可导航到达；导航只含读取顺序、canonical 指针、最小路由和少量 hard stops，AGENTS 目标 ≤120 行；override 优先且只读，链接和 scope 正确，组件文档满足全部质量门。
7. **双向检查交付覆盖。** 按 [artifacts.md](references/artifacts.md) 的双向覆盖检查，从已调查关键事实追到所属合同字段及适用文档，再从产物回查证据、归属和定位值；不是仅检查已写数组是否合法。发现遗漏先补回同一集合，再定向修正受影响产物。
   再运行 [有限反馈](references/coverage.md)，逐项补缺或给出排除/未完成依据；重跑至修正得到反馈验证，未裁定项明确留为未完成。只修改事实缺口，准确的检索表示、措辞、链接与顺序保持。
   完成条件：必要事实无遗漏、根/子无重复、PA 与 LI 各自字段完整；状态按最终产物覆盖更新，已记录 gate 失败不等同合同缺项。按 ownership 检查保护字节，全部路径/证据/ID/导航 kind/链接一致；中断或仍有缺口不得宣称完成。
8. **检查并交付。** 用 `node <实际插件根>/scripts/vic-check.mjs --all --json --root <目标仓库>` 运行产品检查器；有 error 时只修权限内相关产物，再重跑，无法修的明确报告 error 与 `uncertainty`。检查失败不能宣称通过；只有 warning 时说明其来源。
   完成条件：列出实际修改与检查结果；`refresh/no-op` 回复证据字段按 [refresh-policy.md](references/refresh-policy.md) 的唯一 schema 指针组织。`no-op` 零写入，完整文件树比较由有相应读取权限的独立验收执行，不因此自行读取禁区。

最终回复给出 `mode`、变更文件、触发证据、深度/落位、保留项、未确认项和检查结果。文件已生成不等于命令已通过；缺少执行证据的能力不写“已验证”。
