import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, mkdir, writeFile, rm, realpath, symlink, readdir, lstat, readlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { load, dump } from '../scripts/vendor/js-yaml.mjs';
import { tree as snapshot, restore } from '../evals/lib/files.mjs';
import { publicationEntries } from '../evals/lib/isolation.mjs';
import { checkCoverage } from '../skills/vic-bootstrap/scripts/coverage.mjs';

const evidence = new URL('./fixtures/bootstrap-coverage/',import.meta.url);
async function replay(t, round) {
  const tree = JSON.parse(await readFile(new URL(`${round}.tree.json`,evidence),'utf8'));
  const root = await mkdtemp(join(tmpdir(),'coverage-'));
  t.after(() => rm(root,{recursive:true,force:true}));
  for (const [path,item] of Object.entries(tree)) if (item.kind === 'file') {
    assert.equal(createHash('sha256').update(Buffer.from(item.base64,'base64')).digest('hex'),item.sha256,`真实片段校验：${round}/${path}`);
    await mkdir(join(root,path,'..'),{recursive:true}); await writeFile(join(root,path),Buffer.from(item.base64,'base64'));
  }
  return { root, tree, sources:Object.keys(tree).filter(p => /\.[jt]sx?$/.test(p) && !p.startsWith('.')) };
}
async function yaml(root,path,change) { const value = load(await readFile(join(root,path),'utf8')); change(value); await writeFile(join(root,path),dump(value)); }

test('标准根缺基线仅返回未比较反馈；协议优先且整树只读',async t => {
  const script = fileURLToPath(new URL('../skills/vic-bootstrap/scripts/coverage.mjs',import.meta.url));
  for (const directory of [false,true]) {
    const root = await mkdtemp(join(tmpdir(),'coverage-missing-'));
    t.after(() => rm(root,{recursive:true,force:true}));
    if (directory) await mkdir(join(root,'contracts'));
    await writeFile(join(root,'canonical.yaml'),'schema_version: 2\n');
    const before = await snapshot(root);
    const input = {sources:['../unread'],facts:[{kind:'unknown',owner:'unregistered'}]};
    const result = await checkCoverage(root,input);
    assert.equal(result.status,'incomplete'); assert.equal(result.reason,'baseline_missing');
    assert.equal(result.baseline,'contracts/project-context.yaml');
    assert.deepEqual(result.findings,[]); assert.deepEqual(result.checked,[]); assert.equal(result.scope,null);
    assert.match(result.limitations.join(' '),/未建立 owner/);
    assert.match(result.limitations.join(' '),/未读取 sources/);
    assert.match(result.limitations.join(' '),/未核验事实项/);
    assert.match(result.limitations.join(' '),/未比较机器投影/);
    const cli = spawnSync(process.execPath,[script,root],{input:JSON.stringify(input),encoding:'utf8'});
    assert.equal(cli.status,1); assert.equal(cli.stderr,''); assert.deepEqual(JSON.parse(cli.stdout),result);
    const invalid = await checkCoverage(root,{sources:[]});
    assert.ok(invalid.error); assert.equal(invalid.reason,undefined);
    const invalidCli = spawnSync(process.execPath,[script,root],{input:'{"sources":[]}',encoding:'utf8'});
    assert.equal(invalidCli.status,1); assert.deepEqual(JSON.parse(invalidCli.stdout),invalid);
    assert.deepEqual(await snapshot(root),before);
  }
});

test('已有根的缺子合同、非法 YAML、未知 schema、未注册 owner 和软链不误归缺基线',async t => {
  const root = await mkdtemp(join(tmpdir(),'coverage-boundaries-'));
  t.after(() => rm(root,{recursive:true,force:true}));
  const contracts = join(root,'contracts'), file = join(contracts,'project-context.yaml');
  await mkdir(contracts);
  const valid = {schema_version:2};
  const input = {sources:[],facts:[]};
  const script = fileURLToPath(new URL('../skills/vic-bootstrap/scripts/coverage.mjs',import.meta.url));
  async function boundaryTree(path = root) {
    const stat = await lstat(path);
    if (stat.isSymbolicLink()) return {mode:stat.mode,link:await readlink(path)};
    if (stat.isFile()) return {mode:stat.mode,bytes:(await readFile(path)).toString('base64')};
    return {mode:stat.mode,entries:await Promise.all((await readdir(path)).sort().map(async name => [name,await boundaryTree(join(path,name))]))};
  }
  async function rejectUnchanged(value, expected) {
    const before = await boundaryTree();
    await assert.rejects(checkCoverage(root,value),expected);
    const cli = spawnSync(process.execPath,[script,root],{input:JSON.stringify(value),encoding:'utf8'});
    assert.equal(cli.status,1); assert.equal(cli.stderr,'');
    const result = JSON.parse(cli.stdout);
    assert.equal(result.status,'incomplete'); assert.ok(result.error); assert.equal(result.reason,undefined);
    assert.deepEqual(await boundaryTree(),before);
  }
  await writeFile(file,dump(valid));
  assert.equal((await checkCoverage(root,input)).status,'covered-within-scope');
  await rejectUnchanged({sources:[],facts:[{kind:'LI',owner:'other.yaml',evidence:['a'],values:{source:'a'}}]},/owner 未注册/);
  await writeFile(file,dump({...valid,apps:[{path:'app',contract:'contracts/child.yaml',docs:'docs/app'}]}));
  await rejectUnchanged(input,{code:'ENOENT'});
  await writeFile(file,'schema_version: [');
  await rejectUnchanged(input,/unexpected end/);
  await writeFile(file,dump({...valid,custom:true}));
  assert.equal((await checkCoverage(root,input)).status,'restricted');
  await writeFile(file,dump({...valid,apps:[{path:'app',contract:'contracts/child.yaml',docs:'docs/app'}]}));
  await writeFile(join(contracts,'child.yaml'),dump({...valid,custom:true}));
  const unknownBefore = await boundaryTree();
  const unknown = await checkCoverage(root,input);
  assert.equal(unknown.status,'restricted'); assert.equal(unknown.reason,undefined);
  const unknownCli = spawnSync(process.execPath,[script,root],{input:JSON.stringify(input),encoding:'utf8'});
  assert.equal(unknownCli.status,1); assert.deepEqual(JSON.parse(unknownCli.stdout),unknown);
  assert.deepEqual(await boundaryTree(),unknownBefore);
  await rm(file); await symlink('missing.yaml',file);
  await rejectUnchanged(input,/软链/);
  await rm(contracts,{recursive:true}); await mkdir(join(root,'actual'));
  await symlink('actual',contracts);
  await rejectUnchanged(input,/软链/);
});

test('保留真实 r2 首轮：明确机械缺口与已读风险候选；二轮补齐产物没有这些反馈',async t => {
  const first = await replay(t,'first'), second = await replay(t,'second');
  const before = await readFile(join(first.root,'docs/apps/web/component-contract.md'));
  const a = await checkCoverage(first.root,{sources:first.sources,facts:[]});
  assert.equal(a.status,'incomplete');
  assert.equal(a.findings.filter(f => f.kind === 'gap' && /VG/.test(f.message)).length,3);
  assert.equal(a.findings.filter(f => /PA 定义重复/.test(f.message)).length,2);
  for (const path of ['apps/web/vite.config.ts','apps/admin/vite.config.ts','apps/web/src/router/index.tsx','apps/web/src/request/index.ts']) assert.ok(a.findings.some(f => f.kind === 'review' && f.evidence === path));
  assert.ok(a.findings.some(f => /LI：client/.test(f.message)));
  assert.deepEqual(await readFile(join(first.root,'docs/apps/web/component-contract.md')),before);
  const b = await checkCoverage(second.root,{sources:second.sources,facts:[]});
  assert.deepEqual(b.findings,[]);
});

test('已核实语义事实逐字段检查；合法 refresh 补缺而准确人读内容保持',async t => {
  const first = await replay(t,'first'), second = await replay(t,'second');
  const path = 'contracts/apps/web-project-context.yaml';
  const complete = load(await readFile(join(second.root,path),'utf8'));
  const pa = complete.component_contract.preferred_abstractions[0];
  const values = Object.fromEntries(['path','import','entry','source','exports'].map(k => [k,pa[k]]));
  const input = { sources:[], facts:[{kind:'PA',owner:path,evidence:pa.evidence,values}] };
  assert.ok((await checkCoverage(first.root,input)).findings.some(f => /已核实/.test(f.message)));
  const doc = await readFile(join(first.root,'docs/apps/web/component-contract.md'));
  await yaml(first.root,path,v => { v.component_contract.preferred_abstractions.push(pa); });
  assert.ok(!(await checkCoverage(first.root,input)).findings.some(f => /已核实/.test(f.message)));
  assert.deepEqual(await readFile(join(first.root,'docs/apps/web/component-contract.md')),doc);
  await yaml(first.root,path,v => { v.component_contract.preferred_abstractions.at(-1).source = 'apps/web/src/router/index.tsx'; });
  assert.ok((await checkCoverage(first.root,input)).findings.some(f => /已核实/.test(f.message)));
});

test('准确别名、同类型聚合、普通脚本和无共享封装不误报；不同验证类型不能代替',async t => {
  const {root,sources} = await replay(t,'second');
  await yaml(root,'contracts/project-context.yaml',v => { v.conventions.validation_gates.find(g=>g.name==='test').command='rtk pnpm run test'; v.component_contract.preferred_abstractions=[]; });
  for (const path of ['contracts/apps/web-project-context.yaml','contracts/apps/admin-project-context.yaml']) await yaml(root,path,v => { v.conventions.validation_gates=v.conventions.validation_gates.filter(g=>g.name==='build'); });
  assert.deepEqual((await checkCoverage(root,{sources,facts:[]})).findings,[]);
  const pkg = JSON.parse(await readFile(join(root,'package.json'),'utf8'));
  pkg.scripts.dev='vite'; pkg.scripts.publish='npm publish'; pkg.scripts.audit='echo audit';
  await writeFile(join(root,'package.json'),JSON.stringify(pkg));
  assert.deepEqual((await checkCoverage(root,{sources,facts:[]})).findings,[]);
  pkg.scripts.lint='pnpm -r typecheck'; await writeFile(join(root,'package.json'),JSON.stringify(pkg));
  assert.equal((await checkCoverage(root,{sources,facts:[]})).findings.filter(f=>/VG:|VG：/.test(f.message)).length,2);
});

test('未知合同受限、危险路径拒绝；零写入检查不掩盖旧缺口',async t => {
  const {root} = await replay(t,'first');
  await assert.rejects(checkCoverage(root,{facts:[],sources:['.codex/config.toml']}),/不可读取/);
  await assert.rejects(checkCoverage(root,{facts:[],sources:['../escape']}),/不可读取/);
  await yaml(root,'contracts/project-context.yaml',v=> { v.custom_profile={keep:true}; });
  assert.equal((await checkCoverage(root,{sources:[],facts:[]})).status,'restricted');
});

test('任意命名的低信息合同与有证据的嵌套聚合；普通导出没有强制 PA/LI',async t => {
  const {root} = await replay(t,'second');
  const pkg = JSON.parse(await readFile(join(root,'package.json'),'utf8'));
  pkg.scripts.verify='pnpm inspect'; pkg.scripts.inspect='pnpm -r run lint && pnpm -r typecheck && pnpm -r build';
  await writeFile(join(root,'package.json'),JSON.stringify(pkg));
  await yaml(root,'contracts/project-context.yaml',v => { v.conventions.validation_gates.push({command:'pnpm verify'}); });
  for (const path of ['contracts/apps/web-project-context.yaml','contracts/apps/admin-project-context.yaml']) await yaml(root,path,v => { v.conventions.validation_gates=[]; });
  await mkdir(join(root,'lib'),{recursive:true}); await writeFile(join(root,'lib/plain.ts'),'export const ordinary = 42;');
  assert.deepEqual((await checkCoverage(root,{facts:[],sources:['lib/plain.ts']})).findings,[]);
  const minimal = {schema_version:2,project_map:{guarded_paths:[]},conventions:{validation_gates:[]},component_contract:{preferred_abstractions:[],locate_index:[]}};
  await writeFile(join(root,'contracts/project-context.yaml'),dump(minimal));
  await writeFile(join(root,'docs/conventions.md'),'未发现验证入口。');
  assert.equal((await checkCoverage(root,{facts:[],sources:['lib/plain.ts']})).status,'covered-within-scope');
});

test('真实反例的命令行反馈退出非零；补齐后退出零且不写目标树',async t => {
  const script = fileURLToPath(new URL('../skills/vic-bootstrap/scripts/coverage.mjs',import.meta.url));
  for (const round of ['first','second']) {
    const {root,sources,tree} = await replay(t,round);
    const result = spawnSync(process.execPath,[script,root],{input:JSON.stringify({sources,facts:[]}),encoding:'utf8'});
    assert.equal(result.status,round === 'first' ? 1 : 0,result.stderr);
    assert.equal(JSON.parse(result.stdout).status,round === 'first' ? 'incomplete' : 'covered-within-scope');
    for (const [path,item] of Object.entries(tree)) if (item.kind==='file') assert.deepEqual(await readFile(join(root,path)),Buffer.from(item.base64,'base64'));
  }
});


test('真实发布 bundle 的系统别名和规范路径均执行覆盖 CLI，并保持整树字节与权限',async t => {
  // macOS 的 TMPDIR 可能已是规范路径；使用现成 /tmp 系统别名，随后验证它确实指向同一文件。
  const parent = await mkdtemp(join(process.platform === 'darwin' ? '/tmp' : tmpdir(),'coverage-bundle-'));
  t.after(() => rm(parent,{recursive:true,force:true}));
  const repository = fileURLToPath(new URL('../',import.meta.url));
  const frozen = {};
  for (const directory of ['skills','schemas','scripts']) {
    for (const [path,item] of Object.entries(await snapshot(join(repository,directory)))) frozen[`${directory}/${path}`] = item;
  }
  const bundle = join(parent,'bundle');
  await restore(publicationEntries(frozen),bundle);
  const alias = join(bundle,'skills/vic-bootstrap/scripts/coverage.mjs');
  const canonical = await realpath(alias);
  if (process.platform === 'darwin') assert.notEqual(alias,canonical,'macOS /tmp 系统别名应实际覆盖不同 argv 路径');
  assert.equal(await realpath(alias),canonical);
  const bundleBefore = await snapshot(bundle);
  for (const round of ['first','second']) {
    const {root,sources} = await replay(t,round);
    const before = await snapshot(root);
    for (const script of [alias,canonical]) {
      const result = spawnSync(process.execPath,[script,root],{input:JSON.stringify({sources,facts:[]}),encoding:'utf8',timeout:5000});
      assert.equal(result.error,undefined);
      assert.equal(result.stderr,'');
      assert.equal(result.status,round === 'first' ? 1 : 0,`实际 CLI：${round} ${script}`);
      const feedback = JSON.parse(result.stdout);
      assert.equal(feedback.status,round === 'first' ? 'incomplete' : 'covered-within-scope');
      assert.equal(feedback.findings.length,round === 'first' ? 11 : 0);
      assert.equal(feedback.findings.filter(f => f.kind === 'gap' && /VG/.test(f.message)).length,round === 'first' ? 3 : 0);
      assert.equal(feedback.findings.filter(f => /PA 定义重复/.test(f.message)).length,round === 'first' ? 2 : 0);
      assert.deepEqual(await snapshot(root),before);
    }
  }
  assert.deepEqual(await snapshot(bundle),bundleBefore);
});

test('stdin、无 argv 和普通文件纯导入不读取 CLI 输入或输出反馈',async t => {
  const root = await mkdtemp(join(tmpdir(),'coverage-import-'));
  t.after(() => rm(root,{recursive:true,force:true}));
  const url = new URL('../skills/vic-bootstrap/scripts/coverage.mjs',import.meta.url).href;
  const program = `await import(${JSON.stringify(url)});`;
  const importer = join(root,'importer.mjs');
  await writeFile(importer,program);
  for (const [args,input] of [
    [['--input-type=module','-'],program],
    [['--input-type=module','--eval',program],'invalid CLI JSON'],
    [['--input-type=module','--eval',`process.argv[1] = 'missing-entry.mjs'; ${program}`],'invalid CLI JSON'],
    [[importer],'invalid CLI JSON']
  ]) {
    const result = spawnSync(process.execPath,args,{input,encoding:'utf8',timeout:5000});
    assert.equal(result.error,undefined);
    assert.equal(result.status,0,result.stderr);
    assert.equal(result.stdout,'');
    assert.equal(result.stderr,'');
  }
});


test('缺失集合不能误绿；API 与真实 CLI 一致且完整空集合合法',async t => {
  const {root} = await replay(t,'second');
  const before = await snapshot(root);
  const script = fileURLToPath(new URL('../skills/vic-bootstrap/scripts/coverage.mjs',import.meta.url));
  for (const input of [undefined,{}, {sources:[]}, {facts:[]}, {sources:null,facts:[]}, {sources:[],facts:{}}, null, []]) {
    const api = await checkCoverage(root,input);
    assert.equal(api.status,'incomplete');
    assert.ok(api.error.includes('sources') && api.error.includes('facts'));
    assert.equal(api.scope,null);
    const cli = spawnSync(process.execPath,[script,root],{input:input === undefined ? '' : JSON.stringify(input),encoding:'utf8'});
    assert.equal(cli.status,1); assert.equal(cli.stderr,'');
    assert.deepEqual(JSON.parse(cli.stdout),api);
  }
  const result = await checkCoverage(root,{sources:[],facts:[]});
  assert.equal(result.status,'covered-within-scope');
  assert.deepEqual(result.scope.sources,{submitted:[],scanned:[]});
  assert.ok(result.scope.factProjections.every(s => Object.values(s.counts).every(n => n === 0)));
  assert.deepEqual(result.scope.automaticVG.map(s => s.count),[3,3,3]);
  assert.deepEqual(result.scope.paDuplicateChecks.map(s => s.count),[0,1,0]);
  assert.deepEqual(await snapshot(root),before);
});

test('单条应用 LI 只检查该条投影，源码范围与 owner 计数准确；软链拒绝',async t => {
  const {root} = await replay(t,'second');
  const owner = 'contracts/apps/admin-project-context.yaml';
  const contract = load(await readFile(join(root,owner),'utf8'));
  assert.equal(contract.component_contract.preferred_abstractions.length,0);
  const li = contract.component_contract.locate_index[0];
  const fact = {kind:'LI',owner,evidence:li.evidence,values:Object.fromEntries(['import','entry','source','exports'].map(k => [k,li[k]]))};
  // 跟踪片段不含 admin 调用文件；在独立目标补最小可读证据，不依赖旧现场。
  const sources = [li.evidence[0].replace(/:\d+(?:-\d+)?$/, '')];
  for (const path of li.evidence.map(p => p.replace(/:\d+(?:-\d+)?$/, ''))) {
    await mkdir(join(root,path,'..'),{recursive:true});
    await writeFile(join(root,path),'export const applicationUsage = 1;');
  }
  const before = await snapshot(root);
  const result = await checkCoverage(root,{sources,facts:[fact]});
  assert.equal(result.status,'covered-within-scope');
  assert.deepEqual(result.scope.sources,{submitted:sources,scanned:sources});
  assert.deepEqual(result.scope.factProjections.map(s => s.counts),[{GP:0,VG:0,PA:0,LI:0},{GP:0,VG:0,PA:0,LI:0},{GP:0,VG:0,PA:0,LI:1}]);
  assert.equal(result.checked.filter(f => f.kind === 'LI').length,1);
  assert.deepEqual(await snapshot(root),before);
  await symlink(sources[0],join(root,'linked.ts'));
  await assert.rejects(checkCoverage(root,{sources:['linked.ts'],facts:[]}),/软链/);
});
