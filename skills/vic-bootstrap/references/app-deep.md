# 子应用深层合同

盘点发现主应用子域时读取。先核对覆盖情况；信号命中且现有根摘要不足以导航该子域时补齐，不为单应用根目录重复造一层相同事实。
先确认实际 app/package 或清晰业务子域边界，再核对独立入口/配置/包的证据；普通源码目录本身不等于独立 app。只有根 package/构建配置的单应用，深入扫描其入口、封装、guarded 和组件索引后补到根文档/根合同；不将普通源码目录命名为虚构子应用，不仅为“深层”字样新增子合同。

## 触发信号

命中任一信号并存在 coverage 缺口即执行：

- 主应用目录有复杂入口链，例如 main → bootstrap → router。
- 子项目有独立 package、构建、环境配置。
- 存在 adapter/setup/ui-kit/plugins 等二次封装层。
- 用户明确要求主前端/主应用深层初始化。

入口文件或目录存在只是线索，需实际读 import 与调用确认顺序。根层齐全但 app guidance、app facts 或可定位组件索引缺失时分类为 refresh，不能 no-op。
`entry_chain` 记录连续的应用启动/初始化控制主链，不把并行 import 依赖或用户事件触发的请求处理支路排进同一线性链。API/adapter 确实属于连续启动处理链时才列入；其他请求、组件、守卫依赖分别写 guarded/组件定位及地图链接。

## 事实与必需产物

在主流程写入前，将各子域调查及 canonical 路径选择汇入与根层相同的事实集合，不等根文档写完再补查。对子域逐一建立：实际入口链、env/构建配置/路由守卫/请求拦截器/adapter 等 guarded path、可证实 gate 与约定、组件全局键名与关键导出、hooks 实现来源、推荐 import/entry/source、定位顺序与 rg 检索方法。

默认产物：

- `<app>/AGENTS.md` 或已有等价 scoped guidance。
- `docs/apps/<app>/project-map.md`、`conventions.md`、`component-contract.md` 或对应已有等价文档。
- `contracts/apps/<app>-project-context.yaml`，或根 `apps[].contract` 明确列出的既有等价子合同。

根导航链接 app guidance 与子域入口；app guidance 按自身文件位置链接文档和子合同，保持 ≤120 行。已有同目录 override 优先且只读，根 `navigation_layer.scoped_guidance` 记录真实 `path/scope`。
每份生成或复用的子合同必须在根 `apps[]` 注册真实 `name/path/contract/docs`，docs 为相对仓库根的目录；Markdown 导航和 `scoped_guidance` 都不能替代这项注册。已有稳定 `apps/<app>/docs` / `apps/<app>/contracts` 时原位沿用，在根导航接线；否则集中到根 docs/contracts，避免平行替代物。

## 子合同与组件入口

子合同按共享 schema 的 `appContract` 写单个 YAML 文档，`parent: contracts/project-context.yaml`。所有内部路径也相对仓库根，入口链是有序路径数组；只写子域允许字段，不复制根 navigation/agent_context/integrations/apps。
已有等价组件文档在该份子合同 `component_contract.sources` 中以 `kind: component-contract` 和明确 `path` 指定；不靠标题或同名猜测。
存在该指针时无需额外生成同名文档；没有时检查器使用根 `apps[].docs` 目录下的 `component-contract.md`。根组件文档入口规则见 [artifacts.md](artifacts.md)。

## 根/子事实分工

- 根层维护跨 app 的模块边界、共享组件定义与共享 gate；子层维护本 app 的入口链、局部 guarded、应用使用场景与独立命令。
- 已注册 app 目录内的拦截器、守卫、环境/构建配置等局部 guarded 只由该子合同维护；根层只链接子合同，不能因其“重要”再复制一份 GP。在统一双向覆盖检查中核对调查发现的局部风险文件都在所属子合同（含环境配置），根未残留同一事实。
- 子层经 `parent` 和文档相对链接消费根事实；共享定义不重复写进子层 `preferred_abstractions`。应用具体使用场景的 `locate_index` 可引用共享 entry/source/import，但场景与 evidence 应来自应用调用位置。
- 发现 app 实际使用共享封装时，其组件文档与 `locate_index` 必须包含该使用场景；复用根共享定义不等于省略 app 使用定位。给真实的共享 import/entry/source/exports，应用调用位置作为 evidence，不只索引 router/request 而遗漏已核实的 UI 使用。
- 文档根层做跨仓索引，app 层给实际定位步骤并链接共享定义。相同事实只维护一份正文，索引链接不当成新事实。
- ID 在根及所有子合同中唯一且刷新稳定；证据不足记录 uncertainty，空数组表达继承或确实未发现的事实。
- 定位事实写在消费该定位文档的同份合同中：根文档的定位表对应根 `locate_index`，子文档的本地使用场景对应子 `locate_index`；不能只写文档或把根组件索引迁空到子合同。

## 完成检查

每个目标 app 的 guidance、地图、约定、组件文档和子合同都可从根导航到达；所有链接按所在 Markdown 的位置解析。写后按实际子合同清单逐个核对根 `apps[]` 的 `name/path/contract/docs` 与 `navigation_layer.scoped_guidance` 的 `path/scope` 均已登记，指向同一 app 的实际路径；根缺注册时 app-deep 未完成。
组件文档具备 [artifacts.md](artifacts.md) 的定位表、组件/符号索引、定位顺序与 rg 命令，即使未发现封装也必须如实说明搜索范围；app-local 文档同样满足质量门。
对所有 app 检查根/子无重复事实、路径与 scope 正确、ID 唯一、文档与 YAML 一致；任何缺项都是未完成的 app-deep，不得以根层完成代替。
