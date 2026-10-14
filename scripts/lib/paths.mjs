import { stat, realpath, readFile, readdir } from 'node:fs/promises';
import { resolve, relative, isAbsolute, sep } from 'node:path';

export function lineCount(text) {
  if (!text) return 0;
  return text.split(/\r\n|\n|\r/).length - (/\r?\n$|\r$/.test(text) ? 1 : 0);
}
const absent = error => ['ENOENT', 'ENOTDIR'].includes(error.code);

export class Repository {
  constructor(root) { this.root = root; this.texts = new Map(); }
  boundary(pointer) {
    if (!pointer || /[\0\r\n]/.test(pointer)) return { reason: '路径格式无效' };
    const path = pointer.replaceAll('\\', '/');
    if (isAbsolute(path) || /^[a-z]:\//i.test(path)) return { reason: '绝对路径超出仓库边界' };
    const absolute = resolve(this.root, path);
    const inside = relative(this.root, absolute);
    if (inside === '..' || inside.startsWith(`..${sep}`) || isAbsolute(inside)) return { reason: '路径超出仓库边界' };
    return { path: inside.split(sep).join('/') || '.', absolute };
  }
  async info(pointer) {
    const target = this.boundary(pointer);
    if (target.reason) return target;
    try {
      const actual = await realpath(target.absolute);
      const inside = relative(this.root, actual);
      if (inside === '..' || inside.startsWith(`..${sep}`) || isAbsolute(inside)) return { reason: '软链目标超出仓库边界' };
      return { ...target, stat: await stat(actual) };
    } catch (error) { if (absent(error)) return { ...target, missing: true }; throw error; }
  }
  async text(pointer) {
    if (this.texts.has(pointer)) return this.texts.get(pointer);
    const target = await this.info(pointer);
    if (target.reason || target.missing || !target.stat.isFile()) return null;
    const text = await readFile(target.absolute, 'utf8');
    this.texts.set(pointer, text);
    return text;
  }
  async files(directory) {
    const target = await this.info(directory);
    if (target.reason || target.missing || !target.stat.isDirectory()) return [];
    const files = [];
    for (const entry of await readdir(target.absolute, { withFileTypes: true })) {
      const file = `${directory}/${entry.name}`;
      if (entry.isDirectory()) files.push(...await this.files(file));
      else if (entry.isFile() || entry.isSymbolicLink()) files.push(file);
    }
    return files.sort();
  }
  async matches(pattern) {
    const boundary = this.boundary(pattern);
    if (boundary.reason) return false;
    const parts = boundary.path.split('/').filter(Boolean);
    async function visit(repo, prefix, index) {
      const target = await repo.info(prefix || '.');
      if (target.reason || target.missing) return false;
      if (index === parts.length) return true;
      if (!target.stat.isDirectory()) return false;
      const part = parts[index];
      if (part === '**' && await visit(repo, prefix, index + 1)) return true;
      if (!/[*?]/.test(part)) return visit(repo, prefix ? `${prefix}/${part}` : part, index + 1);
      const expression = new RegExp(`^${part.replace(/[.+^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*').replaceAll('?', '.')}$`);
      for (const entry of await readdir(target.absolute, { withFileTypes: true })) {
        if (entry.isSymbolicLink() || entry.name === '.git' || entry.name === 'node_modules') continue;
        const file = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (part === '**') {
          if (entry.isDirectory() && await visit(repo, file, index)) return true;
        } else if (expression.test(entry.name) && await visit(repo, file, index + 1)) return true;
      }
      return false;
    }
    return visit(this, '', 0);
  }
}
