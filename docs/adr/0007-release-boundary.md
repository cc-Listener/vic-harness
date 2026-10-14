# ADR-0007 发布边界：只发布 skills/ 下的内容，不使用软链

- 状态：已采纳
- 日期：2026-10-13

## 背景
Codex 安装插件时会把插件目录复制到缓存，且会丢弃软链（Matt 的 ADR 记录了这一点）。`skills` 字段写单个路径时，Codex 会递归发现其下所有 SKILL.md。

## 决策
- `skills/` 下只放要发布的 skill；草稿和实验放 `lab/`。
- 不用软链拼装发布目录。
- 共享文件放插件根目录（`schemas/`、`scripts/`）；如果核验发现 skill 读不到这些文件（open-questions Q9），改为由脚本生成副本，并由 vic-check 校验副本一致。
- 每次发布都升 `plugin.json` 的 `version`。

## 后果
目录结构即发布边界，不需要额外维护清单。
