import { isDeepStrictEqual } from 'node:util';

const supported = new Set(['$schema', 'title', 'description', '$defs', '$ref', 'type', 'properties',
  'required', 'additionalProperties', 'items', 'anyOf', 'enum', 'const', 'pattern', 'minLength', 'minItems', 'minimum']);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

// 只执行 schemas/MIGRATIONS.md 固定的小子集，遇到扩展应显式报检查器错误。
export function assertSupportedSchema(schema) {
  function visit(node) {
    for (const keyword of Object.keys(node)) {
      if (!supported.has(keyword)) throw new Error(`schema 使用未支持的关键词：${keyword}`);
    }
    if (node.$ref && !/^#\/\$defs\/[^/]+$/.test(node.$ref)) throw new Error('schema 仅支持本文件 $defs 引用');
    if (node.$ref && !Object.hasOwn(schema.$defs || {}, node.$ref.slice(8))) throw new Error('schema 引用不存在');
    if (node.pattern) new RegExp(node.pattern);
    for (const field of ['$defs', 'properties']) for (const child of Object.values(node[field] || {})) visit(child);
    if (node.items) visit(node.items);
    for (const child of node.anyOf || []) visit(child);
  }
  visit(schema);
}

export function validateSchema(value, schema) {
  function validate(node, rule, path) {
    const errors = [];
    const fail = message => errors.push(`${path}：${message}`);
    if (rule.$ref) errors.push(...validate(node, schema.$defs[rule.$ref.slice(8)], path));
    if (rule.type) {
      const matches = { object: object(node), array: Array.isArray(node), string: typeof node === 'string',
        boolean: typeof node === 'boolean', null: node === null,
        number: typeof node === 'number' && Number.isFinite(node), integer: Number.isInteger(node) };
      if (!matches[rule.type]) { fail(`需要 ${rule.type} 类型`); return errors; }
    }
    if (Object.hasOwn(rule, 'const') && !isDeepStrictEqual(node, rule.const)) fail(`必须为 ${JSON.stringify(rule.const)}`);
    if (rule.enum && !rule.enum.some(item => isDeepStrictEqual(node, item))) fail('值不在允许枚举中');
    if (typeof node === 'string') {
      if (rule.minLength !== undefined && [...node].length < rule.minLength) fail('字符串过短');
      if (rule.pattern && !new RegExp(rule.pattern).test(node)) fail(`不匹配 ${rule.pattern}`);
    }
    if (typeof node === 'number' && rule.minimum !== undefined && node < rule.minimum) fail('数值小于允许下限');
    if (object(node)) {
      for (const field of rule.required || []) if (!Object.hasOwn(node, field)) fail(`缺少必填字段 ${field}`);
      for (const [field, child] of Object.entries(node)) {
        if (Object.hasOwn(rule.properties || {}, field)) errors.push(...validate(child, rule.properties[field], `${path}.${field}`));
        else if (rule.additionalProperties === false) fail(`不允许字段 ${field}`);
      }
    }
    if (Array.isArray(node)) {
      if (rule.minItems !== undefined && node.length < rule.minItems) fail('数组条目过少');
      if (rule.items) node.forEach((item, index) => errors.push(...validate(item, rule.items, `${path}[${index}]`)));
    }
    if (rule.anyOf) {
      const branches = rule.anyOf.map(child => validate(node, child, path));
      if (!branches.some(branch => branch.length === 0)) {
        fail('不符合 anyOf 的任何分支');
        errors.push(...branches.sort((a, b) => a.length - b.length)[0]);
      }
    }
    return errors;
  }
  return validate(value, schema, '$');
}
