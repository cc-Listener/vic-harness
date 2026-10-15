# M1 Node18 默认测试发现越界事故

2026-10-15，M1 结构修复的 Task 3 在仓库根各运行一次 Node v25.8.1 与 Node v18.20.8 的默认 `--test`。Node18 自动发现进入 ignored `.superpowers/sdd/07-roadmap/M1-real-trial` 的历史试用测试，实际违反不重跑旧样本的约束。此事故不因旧测试位于 ignored 目录而免除；Git 忽略规则没有形成该运行时的测试发现边界。

## 已观察结果

| 运行时 | 退出码 | tests | pass | fail | 证据范围 |
| --- | --- | --- | --- | --- | --- |
| Node v25.8.1 | 0 | 92 | 92 | 0 | 本次默认命令实际发现的集合 |
| Node v18.20.8 | 1 | 1083 | 1059 | 24 | 混入旧试用测试的集合，不能作为当前产品用例集合 |

24 个失败 location 全部落在三个历史 agents 目录各自 before/after 的六份 `scripts/order-runner-server.test.mjs`。六份是失败文件集合，不能称为所有误发现文件；本次输出不能精确枚举所有已通过历史测试的来源文件。可见共同错误为 `ERR_MODULE_NOT_FOUND`，子进程尝试从当前仓库根导入不存在的 `scripts/order-runner-server.mjs`。

原输出中出现 `runner-no-handoff-*` 临时目录、回环 HTTP 测试代码片段及子进程导入错误，支持旧测试实际执行并尝试启动子进程。现有记录不足以证明服务真实监听、外部系统调用或旧树写入，也不足以证明这些均未发生。

## 影响与证据边界

执行前后核对的 49 个唯一文件属于发布 `skills/schemas/scripts` 与 Task 2 八文档，hash/type/mode 变化数为 0。这个限定产品范围的前后绑定不覆盖旧证据树或全工作树。旧树没有完整执行前态，不能证明旧树零变化或无间接副作用。两次已知测试会话均已返回退出码，未做进程树核验，遗留子进程是否全部退出未知。

本次没有另行调用 bootstrap/agents 模型，但不能据此声称旧材料未执行。apple-tools 原仓未被直接指定为执行目标，也未另行访问；该限定事实不能推广为无任何间接访问。

Node25 的 92/92 保留为其实际默认测试集合的通过结果，不能据此宣称两个运行时发现集合相同或 Node18 当前产品整合通过。另有 46 个发布资源的局部布局检查：22 处主 SKILL Markdown 本地链接文件可达，两个 helper 纯导入成功。这些只支持文件可达与局部加载，不证明完整安装体验、模型行为或 M1 缺陷闭合。

## 留存与后续约束

本次 ignored 账本为 `.superpowers/sdd/2026-10-15-m1-structural-repair/`；事实来源为其中 `task-3-integration-report.md`、`integration-summary.json`、`integration-node18-deviation-observations.json`，原始失败输出为 `integration-node18-output.txt`。该输出保持原样，SHA256 为 `37ae35b26c581500fe162694f7a146f9bbf4bc2ca275305cdf933715a742693e`；Node25 原输出 SHA256 为 `823f8efcdb06b6dcf46f929c968c4e1a0520f04d6e27f99e3ee1875f2ccd4097`。

后续默认测试必须使用固定完整提交 SHA 的 `git archive` 仅已跟踪隔离导出，先核对导出不含 `.superpowers/` 与旧证据。不得删除旧树换绿，不重跑 Node25；若需补足当前产品 Node18 证据，只能在该边界成立后补跑一次并单独保留结果。此次归档不运行任何测试、业务或安装，也不通过补跑覆盖失败。

## 归档期间的独立边界偏差

归档代理定位根 `AGENTS.md` 时错误运行 `rtk proxy find .. -name AGENTS.md -print`，只读路径枚举遍历并输出了包括旧 `M1-real-trial` 快照在内的路径，违反本次禁止遍历旧快照的要求。未读取旧文件正文；不能由此推论无元数据副作用。该偏差已报告 root，随后停止广域发现，只使用明确指定的本次证据路径；没有为此追加旧树核查。它独立于前述 Node18 事故，不作为 Node18 影响的证据。
