import { readdir, lstat, readFile, writeFile, mkdir, chmod, readlink } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

export const sha256 = (value) => createHash('sha256').update(value).digest('hex');
export const jsonFile = (file, value) => writeFile(file, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });

// 文本/二进制均以 base64 归档，避免 Node 测试发现扫描附件中的可执行树。
export async function tree(root, { allowLinks = false } = {}) {
  const entries = {};
  async function walk(dir, prefix = '') {
    for (const name of (await readdir(dir)).sort()) {
      const rel = prefix ? `${prefix}/${name}` : name;
      if (rel === '.git') continue;
      const full = path.join(dir, name), info = await lstat(full);
      if (info.isDirectory()) { entries[rel] = { kind: 'directory', mode: info.mode & 0o777 }; await walk(full, rel); }
      else if (info.isFile()) {
        const bytes = await readFile(full);
        entries[rel] = { kind: 'file', mode: info.mode & 0o777, sha256: sha256(bytes), base64: bytes.toString('base64') };
      } else if (allowLinks && info.isSymbolicLink()) entries[rel] = { kind: 'symlink', target: await readlink(full) };
      else if (allowLinks) entries[rel] = { kind: 'special', mode: info.mode };
      else throw new Error('unsupported_tree_entry');
    }
  }
  await walk(root); return entries;
}

export async function restore(entries, root) {
  await mkdir(root, { recursive: true });
  for (const [name, entry] of Object.entries(entries)) {
    const dest = path.join(root, name);
    if (entry.kind === 'directory') { await mkdir(dest, { recursive: true }); await chmod(dest, entry.mode); }
    else if (entry.kind === 'file') { await mkdir(path.dirname(dest), { recursive: true }); await writeFile(dest, Buffer.from(entry.base64, 'base64'), { flag: 'wx', mode: entry.mode }); }
    else throw new Error('unsupported_tree_entry');
  }
}

export const hashes = (entries) => Object.fromEntries(Object.entries(entries).map(([name, entry]) => [name, entry.kind === 'file' ? { kind: entry.kind, mode: entry.mode, sha256: entry.sha256 } : entry]));
export const quote = (value) => "'" + value.replaceAll("'", "'\\''") + "'";
