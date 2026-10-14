# ADR-0002 确定性检查用 Node 实现，内置单文件解析器

- 状态：已采纳
- 日期：2026-10-13

## 背景
过期检测、路径存在性、schema 和 TOML 校验都可以确定性完成，不该交给 LLM。插件装在用户机器上，不能要求额外安装依赖。

## 决策
- `scripts/vic-check.mjs` 用 Node ≥18 编写，零 npm 运行时依赖。
- YAML 和 TOML 解析器以单文件形式放在 `scripts/vendor/`（如 js-yaml、smol-toml，均为 MIT），保留许可证头部，并在 `scripts/vendor/README.md` 记录来源和版本。
- 检查器只读、不联网、3 秒内完成。

## 考虑过的方案
- Python：标准库有 `tomllib` 但没有 YAML 解析，同样需要内置依赖；Node 在 Codex 的使用环境里更普遍。
- 把合同改成 JSON：机器友好但人类编辑体验差，且 v1 已经是 YAML。

## 后果
内置的解析器需要偶尔更新，更新时同步记录版本。
