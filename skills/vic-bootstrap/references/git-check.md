# 固定 Git 空白检查

仅在当前 bootstrap 流程已经选择运行此检查时使用。不增加 no-op 必跑 gate，不执行包脚本、安装或自动修复。调用者先按 [ownership.md](ownership.md) 划定允许读取的逐文件集合；路径合法不授予读取授权或修改权。目标文件及受保护尾空行保持原字节，运行结果只返回会话，不写目标仓库日志。

## 调用接口

从实际 skill 安装位置定位 `../scripts/git-check.mjs`，Node ≥18、零运行时依赖。导入不读取 stdin、不执行命令、不打印。唯一产品 API：

```js
const result = await checkGitWhitespace({
  root, paths: ['AGENTS.md', 'docs/project-map.md'],
  comparison: 'index-to-worktree', proxy: 'rtk',
});
```

必填 `root`、非空 `paths`、固定 `comparison:'index-to-worktree'`、`proxy:'none'|'rtk'`。可选 `gitExecutable`、`rtkExecutable` 必须是宿主已信任工具的绝对入口；省略则从宿主 PATH 解析。可选 `timeoutMs` 为 1–120000 整数，默认 30000；此预算覆盖本次所有进程，超时后另有最多约 250ms 的管道清理时间。文件系统资格检查本身不受硬实时沙箱控制。每流最多捕获 1MiB。其他选项一律拒绝，不能传入任意命令、argv、退出码或 `reviewed/verified`。

CLI 只接受以下参数，每项必填，`--path` 可重复，其余不可重复：

```sh
rtk proxy node <实际skill目录>/scripts/git-check.mjs --root <目标根> --comparison index-to-worktree --path AGENTS.md --proxy rtk
```

stdout 是一个含中文 `report` 的 JSON 对象，stderr 保留给 Node 自身不可恢复错误。CLI 通过退出 0，明确检查失败退出 1，不能形成结论退出 2。helper 的 CLI 退出码不是被检查进程退出码；后者在 `execution.exit_code`。

## 唯一结果格式

返回 `{version:1, scope, command_form, execution, verdict, report, limitations}`，资格信息可附于 `tools` 和 `proxy_qualification`。

| 字段 | 含义 |
| --- | --- |
| `scope.root/comparison/requested_paths` | 实际规范化根、固定比较模式、调用者请求集合 |
| `scope.checked_paths/untracked_paths` | 实际交给空白检查的 tracked 文件，以及本次发现但未检查的 untracked 文件 |
| `scope.metadata_reads` | 必要元数据及属性的可能读取范围，含不存在时可能由 index 回退读取的 `.gitattributes`；不是逐次系统调用审计 |
| `scope.discarded_git_environment` | 被隔离的宿主 Git 环境变量名称，不含值 |
| `scope.rejection_reason` | 资格拒绝原因，未拒绝时为 null；独立于已观察进程的退出状态和 `execution.reason` |
| `command_form` | 最终检查的实际可执行文件、固定 argv、`shell:false` 和 proxy 模式；未形成检查命令时为 null |
| `execution` | 最后观察的范围确认或检查进程；含 `observed_process`、`phase`、`status`、`exit_code`、`signal`、分离的 `stdout/stderr`、`capture_complete`、`timed_out`、`truncated`、`startup_error`、`reason`；未执行时 `status:'not-run'` |
| `verdict` | `passed` / `failed` / `unknown`，由工具实际观察生成 |
| `report/limitations` | 中文规范摘要、未覆盖范围与信任限制，须一起带入最终声明审查 |

`passed` 仅允许空白检查进程正常完成、code 0、无信号且双流 EOF 完整。正常非零是 `failed`，即使双流都为空。信号、超时、启动错误、截断、管道未关闭或未知状态都是 `unknown`，不能映射为通过。`checked_paths` 只是尝试的精确比较集合，仍须结合 verdict 判读。资格失败返回 unknown；范围确认进程无论成功失败都保留该次观察。成功列表后的 index 条目或全 untracked 资格拒绝通过 `scope.rejection_reason` 表达，保留 scope 阶段的实际 code、双流和完整性，`checked_paths` 为空；scope 的 code 0 不代表空白检查通过。

## 资格和读取边界

调用方须选用当前宿主已信任的 Git/RTK 并保持目标与工具在本次运行中稳定。helper 解析实际入口及 realpath，检查为可执行原生 ELF/Mach-O 文件，拒绝未知脚本 shim；格式识别不是供应链、身份或行为认证。macOS 系统 Git 入口仍依赖宿主已信任的开发工具选择。Windows 原生入口目前返回 unknown。没有 `reviewed:true` 绕过门。

子进程使用重建的最小环境，不继承 `GIT_DIR`、`GIT_WORK_TREE`、`GIT_INDEX_FILE`、对象库、配置注入、动态加载器等环境重定向。系统与全局 Git 配置和属性禁用；不关闭 Git 自身所有权保护。目标局部配置在 Git 执行前读取并仅接受普通 core/user/remote/branch 的小子集；未知语法、include/includeIf、filter.clean/filter.process、fsmonitor、外部 diff/textconv、worktree/对象来源等配置均拒绝，不打印配置内容。保留允许的 core.whitespace、换行和属性语义；不把禁用 ext-diff/textconv 误当成禁用 clean filter 的全部措施。

目标目前只支持根下真实 `.git` 目录、普通 index 与局部对象库。gitfile/linked worktree、bare、扩展仓库格式、split index、commondir、config.worktree、alternates、info/attributes、元数据软链及过大的元数据树返回 unknown。选定条目的 assume-unchanged、skip-worktree、未合并状态和非普通文件模式也返回 unknown，避免 Git 忽略工作树却扩大通过声明。这些形状涉及额外配置、比较或内容来源，本轮不猜测资格。检查会读取 `.git/config`、index、HEAD/refs、对象和必要属性；不能宣称零元数据读取。对象/refs 的资格核验最多发现 10000 个节点，超过则 unknown。

`paths` 必须是根内现有普通文件的相对路径；拒绝目录、越界、glob 字符、pathspec magic、空段/点段、换行、反斜杠和软链穿越，拒绝 `.git/.codex/.claude/.agents/.ua/.understand-anything` 等已知配置或外部资产禁区。根本身规范化为 realpath；其下每个路径组件逐项检查，不跟随软链。空格、中文、tab、引号、shell 元字符和前导连字符使用 literal pathspec 处理。全程无 shell，Git 固定关闭 pager/ext-diff/textconv/fsmonitor；不运行仓库提供的命令。未知读取授权仍由主会话保守处理，不能通过这个工具绕过原禁区。

这不是 OS 沙箱，不能保证恶意本地进程不在核验和执行之间替换文件或让后代脱离进程组。受控进程超时/超限时终止同组进程并关闭管道；可信 Git/RTK 是必要前提，不宣称能安全执行任意原生程序。

## RTK 与范围声明

`proxy:'rtk'` 每次在自有临时仓库用固定 Git 检查的正常/空白错误两个探针，对照 direct 与 `rtk proxy <已解析Git路径>` 的 code 和分离诊断；临时仓库最后清理。探针不修改目标，不运行用户命令。传播或捕获不能确认时返回 unknown，探针真实观察保留于 `proxy_qualification.probes`。该核验只支持本轮两个反例的有限传播判断，不是所有代理行为证明。

目标执行只直接观察 `rtk-proxy`，`execution.exit_code` 始终是外层代理的状态；不得冒称直接捕获了内部 Git 退出码。`proxy:'none'` 才标为直接观察 `git`。运行工具外面的 `rtk proxy node ...` 是宿主命令入口，不改变 helper 对其子进程的这项标识。

退出 0 只支持 `checked_paths` 在 index→worktree 范围内的空白检查。staged-only 差异、untracked 文件和未选路径未检查；不支持“全树检查通过”或“所有验证通过”。其他 checker/gate 仍分别保留真实结果，失败不得被本项绿色抵销。工具不能阻止上层忽略结果或自由文本错报，仍需独立核对最终声明。
