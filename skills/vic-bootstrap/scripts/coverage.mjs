import { readFile, lstat } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { load } from '../../../scripts/vendor/js-yaml.mjs';

// 内部只读反馈；输入仅在 stdin/内存中存在，不构成合同字段。
export async function checkCoverage(root, input = {}) {
  root = resolve(root);
  async function read(path) {
    if (typeof path !== 'string' || !path || path.includes('\\') || /^(?:\/|[A-Za-z]:)/.test(path)) throw Error('非法相对路径');
    const full = resolve(root, path), rel = relative(root, full);
    if (rel.startsWith('..') || /(?:^|\/)(?:\.git|\.codex|\.ua|\.understand-anything)(?:\/|$)/.test(rel)) throw Error(`不可读取：${path}`);
    let current = root;
    for (const part of rel.split(sep)) { current = resolve(current, part); if ((await lstat(current)).isSymbolicLink()) throw Error(`不读取软链：${path}`); }
    return readFile(full, 'utf8');
  }
  const findings = [], checked = [];
  const add = (kind, owner, evidence, message) => findings.push({ kind, owner, evidence, message });
  const main = load(await read('contracts/project-context.yaml'));
  // 未知对象/版本交标准检查器处理，禁止用此反馈冒充迁移成功。
  const known = new Set(['version','schema_version','bootstrap_status','navigation_layer','project_map','apps','conventions','component_contract','agent_context','uncertainty','non_goals','integrations','foreign_sections','refreshed_at_commit']);
  if (!main || main.schema_version !== 2 || (main.version !== undefined && main.version !== 1) || Object.keys(main).some(k => !known.has(k))) return { status: 'restricted', findings: [], checked: [], limitations: ['未知根合同，保留原文并交标准检查器与迁移调查'] };
  const layers = [{ path: '', file: 'contracts/project-context.yaml', docs: 'docs', value: main }];
  for (const app of main.apps || []) layers.push({ ...app, file: app.contract, value: load(await read(app.contract)) });
  const childKeys = new Set(['schema_version','version','parent','bootstrap_status','project_map','conventions','component_contract','uncertainty','refreshed_at_commit']);
  if (layers.slice(1).some(l => l.value.schema_version !== 2 || Object.keys(l.value).some(k => !childKeys.has(k)))) return { status:'restricted',findings:[],checked:[],limitations:['未知子合同；保留原文并调查迁移'] };
  let readRootScripts = {};
  try { readRootScripts = JSON.parse(await read('package.json')).scripts || {}; } catch (e) { if (e.code !== 'ENOENT') throw e; }
  function aggregate(name, script, seen = new Set()) {
    if (seen.has(name) || seen.size >= 8) return false;
    seen = new Set([...seen,name]);
    return String(readRootScripts[name] || '').split(/\s*&&\s*/).some(part => {
      if (new RegExp('^pnpm -r(?: --if-present)? (?:run )?'+script+'$').test(part)) return true;
      const next = part.match(/^pnpm (?:run )?([\w:-]+)$/)?.[1];
      return next ? aggregate(next,script,seen) : false;
    });
  }
  const ownerOf = path => layers.filter(l => l.path && (path === l.path || path.startsWith(l.path.replace(/\/$/, '') + '/'))).sort((a,b) => b.path.length-a.path.length)[0] || layers[0];
  const fields = { GP: ['project_map','guarded_paths'], VG: ['conventions','validation_gates'], PA: ['component_contract','preferred_abstractions'], LI: ['component_contract','locate_index'] };
  const entries = (l,k) => l.value[fields[k][0]]?.[fields[k][1]] || [];
  const command = s => String(s || '').replace(/^rtk (?:proxy )?/, '').replace(/\bnpm (test|start)\b/g, 'npm run $1').replace(/\bpnpm run /g, 'pnpm ').trim();
  for (const layer of layers) {
    for (const pa of entries(layer,'PA')) {
      if (layer.path && entries(layers[0],'PA').some(p => p.source === pa.source && p.entry === pa.entry && p.import === pa.import && JSON.stringify(p.exports) === JSON.stringify(pa.exports))) add('gap',layer.file,pa.source,'共享 PA 定义重复到子合同；保留应用 LI 使用场景');
    }
    const docPaths = (layer.value.conventions?.sources || []).filter(s => /\.md$/.test(s.path)).map(s => s.path);
    docPaths.push(`${layer.docs.replace(/\/$/,'')}/conventions.md`);
    let prose = '';
    for (const path of new Set(docPaths)) { try { prose += '\n' + await read(path); } catch (e) { if (e.code !== 'ENOENT') throw e; } }
    for (const match of prose.matchAll(/`((?:rtk (?:proxy )?)?(?:pnpm|npm|yarn)[^`\n]+)`/g)) {
      const cmd = command(match[1]);
      const script = cmd.match(/(?:^|\s)(lint|typecheck|test|build|format:check)(?:\s|$)/)?.[1];
      if (!script) continue;
      const packagePath = `${layer.path ? layer.path.replace(/\/$/,'')+'/' : ''}package.json`;
      let pkg; try { pkg = JSON.parse(await read(packagePath)); } catch (e) { if (e.code === 'ENOENT') continue; throw e; }
      if (!pkg.scripts?.[script]) continue;
      if (!entries(layer,'VG').some(g => command(g.command || g.command_hint) === cmd)) {
        // 聚合不是凭名称推断：有限递归 payload 必须真的调用同类型且覆盖此包。
        const covered = layers.some(other => entries(other,'VG').some(g => {
          const c = command(g.command || g.command_hint);
          const name = c.match(/^pnpm ([\w:-]+)$/)?.[1];
          if (!name || other !== layers[0] || layer === other) return false;
          return aggregate(name,script);
        }));
        if (!covered) add('gap',layer.file,packagePath,`人读验证入口缺少 VG：${cmd}`);
      }
      checked.push({ kind:'VG',owner:layer.file,evidence:packagePath,command:cmd });
    }
  }
  // 源码候选只从调用者给出的已读允许集合取，不递归访问目标禁区。
  for (const path of input.sources || []) {
    const text = await read(path), layer = ownerOf(path);
    const risk = /(?:vite|webpack|rollup)\.config\.[cm]?[jt]s$/.test(path) || /\b(?:axios\.create|\w+\.interceptors\.(?:request|response)\.use)\s*\(/.test(text) || /(?:sessionStorage|localStorage)\.getItem[\s\S]*<(?:Navigate|Redirect)\b/.test(text);
    if (risk && !entries(layer,'GP').some(g => g.path === path)) add('review',layer.file,path,'风险候选缺少具体 GP；回读配置/调用语义，确认后定向补齐或说明排除依据');
    if (/\baxios\.create\s*\(|\.interceptors\.(?:request|response)\.use\s*\(/.test(text)) {
      for (const m of text.matchAll(/export\s+(?:async\s+)?(?:const|function|class)\s+(\w+)/g)) if (!entries(layer,'LI').some(li => li.source === path && li.exports?.includes(m[1]))) add('review',layer.file,path,`请求定位候选缺少 LI：${m[1]}；核实调用与公开入口后补齐`);
    }
  }
  // 已核实的语义事实逐字段检查，允许事实集合覆盖有限扫描之外的语言/命令。
  for (const fact of input.facts || []) {
    if (!fields[fact.kind]) throw Error('未知覆盖事实类型');
    if (!fact.evidence?.length || !fact.values || !Object.keys(fact.values).length) throw Error('已核实事实必须包含证据及待核对字段');
    const layer = layers.find(l => l.file === fact.owner);
    if (!layer) throw Error('事实 owner 未注册');
    for (const path of fact.evidence || []) await read(path.replace(/:\d+(?:-\d+)?$/, ''));
    const matches = entries(layer,fact.kind).some(item => Object.entries(fact.values || {}).every(([key,value]) => key === 'command' ? command(item.command || item.command_hint) === command(value) : JSON.stringify(item[key]) === JSON.stringify(value)));
    if (!matches) add('gap',layer.file,fact.evidence,'已核实事实缺少准确机器投影：'+fact.kind);
    checked.push(fact);
  }
  return { status: findings.length ? 'incomplete' : 'covered-within-scope', findings, checked, limitations: ['有限命令与源码模式；review 需回读裁定，不自动生成 GP/PA/LI。未输入的观察事实、一般语义与人读准确性仍须双向人工核对。'] };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    let raw = ''; for await (const chunk of process.stdin) raw += chunk;
    const result = await checkCoverage(process.argv[2], raw.trim() ? JSON.parse(raw) : {});
    console.log(JSON.stringify(result,null,2)); process.exitCode = result.status === 'covered-within-scope' ? 0 : 1;
  } catch (error) { console.log(JSON.stringify({status:'incomplete',error:error.message})); process.exitCode = 1; }
}
