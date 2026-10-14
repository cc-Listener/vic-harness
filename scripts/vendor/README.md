# 内置解析器

- `js-yaml.mjs` 5.4.3，来源：<https://unpkg.com/js-yaml@5.4.3/dist/js-yaml.mjs>，官方仓库：<https://github.com/nodeca/js-yaml>。
- `js-yaml.LICENSE.txt` 保留 MIT 许可证。发行 tarball integrity：`sha512-yzzNtgczwgoVHNigCyKTXcQJU4Y8t/ikU4UxXW0BvrLfHTGWZhsNcOT2s/a7vn81/4KqVnNmHjaUEPlvWnNwVw==`。
- ESM 文件 SHA256：`2ed2785988d4737fa33bcf4330be3a7b88d0da7b1fd534e9811cc48313ba0f6e`；从官方 npm tarball 核对内容一致，无静态 import。完整许可证 SHA256：`a07bc24468b9654ce76a547d47a2db282d07733b715db4c73a98bd63961f9550`。
- package 未声明 `engines`；已实际在 Node 18.20.8 验证导入和解析。上游 `argparse` 仅用于其 CLI，本插件内置 ESM 无此运行时依赖。
- T03 使用 `JSON_SCHEMA`，并在读取层拒绝循环 alias；schema/example 读取分别使用 `load` 与 `loadAll`。
