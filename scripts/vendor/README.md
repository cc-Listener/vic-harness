# 内置解析器

- `js-yaml.mjs` 5.4.3，来源：<https://unpkg.com/js-yaml@5.4.3/dist/js-yaml.mjs>，官方仓库：<https://github.com/nodeca/js-yaml>。
- `js-yaml.LICENSE.txt` 保留 MIT 许可证。发行 tarball integrity：`sha512-yzzNtgczwgoVHNigCyKTXcQJU4Y8t/ikU4UxXW0BvrLfHTGWZhsNcOT2s/a7vn81/4KqVnNmHjaUEPlvWnNwVw==`。
- ESM 文件 SHA256：`2ed2785988d4737fa33bcf4330be3a7b88d0da7b1fd534e9811cc48313ba0f6e`；从官方 npm tarball 核对内容一致，无静态 import。完整许可证 SHA256：`a07bc24468b9654ce76a547d47a2db282d07733b715db4c73a98bd63961f9550`。
- package 未声明 `engines`；已实际在 Node 18.20.8 验证导入和解析。上游 `argparse` 仅用于其 CLI，本插件内置 ESM 无此运行时依赖。
- T03 使用 `JSON_SCHEMA`，并在读取层拒绝循环 alias；schema/example 读取分别使用 `load` 与 `loadAll`。

- `smol-toml.mjs` 1.9.1，核验于 2026-10-14；官方仓库：<https://github.com/squirrelchat/smol-toml>，来源：<https://registry.npmjs.org/smol-toml/-/smol-toml-1.9.1.tgz>。
- 真实许可证为 **BSD-3-Clause**；完整版权、三条条件与免责声明保留在文件头。ADR-0002 的 MIT 标记是事实笔误。
- 官方 `dist/index.cjs` 是无外部 require 的完整单文件 bundle；只插入本地 `exports` 对象和 ESM named/default 导出适配，未重写解析器。
- 发行 tarball integrity：`sha512-j7WyPdf0CJoutMzMoPLF/bVXHtKZIT9Rb4eGeEbWw8X2t5oirjPgpL+OpaENZrILYaXqYwnVH+qgUwVbl+pUJQ==`；获取时实际校验通过。
- tarball SHA256：`4ac8392f1918c22a4366be19047cf53aa42646077d4c711b2ef73263beefb172`；原 bundle SHA256：`f9029370259e9a43a2f3e64fa1d39e72f3598188380ace83a0abb8261fa33555`；本地 ESM SHA256：`b3e2376169f18d0e87506553f6a183e29df3f090f5cfa51af509279346ae4cb6`。
- package 声明 Node ≥18、零 npm dependencies；保留 parse/stringify/TomlDate/TomlError API，检查器仅 parse，不写回用户 TOML。使用 `integersAsBigInt: true` 避免合法 64 位整数因 JS 精度限制被拒绝。
- 已实际在官方 Node 18.20.8 验证 ESM 导入、parse/stringify 往返、重复键拒绝、64 位整数，并运行完整检查器测试套件通过。
