import { load, JSON_SCHEMA } from '../vendor/js-yaml.mjs';

// YAML alias 可以共享对象，但循环及非 JSON 标量不属于合同的数据模型。
export function parseYaml(text) {
  const value = load(text, { schema: JSON_SCHEMA });
  const ancestors = new Set();
  const visited = new Set();
  function visit(node) {
    if (typeof node === 'number' && !Number.isFinite(node)) throw new Error('YAML 含非 JSON 数字');
    if (!node || typeof node !== 'object') return;
    if (ancestors.has(node)) throw new Error('YAML 含循环 alias');
    if (visited.has(node)) return;
    ancestors.add(node);
    for (const child of Object.values(node)) visit(child);
    ancestors.delete(node);
    visited.add(node);
  }
  visit(value);
  return value;
}
