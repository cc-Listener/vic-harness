import { spawn } from 'node:child_process';
import { stopGroup } from './process.mjs';

// 完整响应仅存在内存；绝不保存 app-server stdout/stderr 或连接配置。
export async function readConfig(cwd, overrides, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const child = spawn('codex', ['--disable', 'plugins', '--disable', 'hooks', ...overrides, 'app-server', '--stdio'], { cwd, detached: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let buffer = '', finished = false;
    const timer = setTimeout(() => finish(new Error('config_read_timeout')), timeout);
    function finish(error, config) {
      if (finished) return; finished = true; clearTimeout(timer); stopGroup(child, 'SIGTERM');
      const kill = setTimeout(() => stopGroup(child, 'SIGKILL'), 2000); kill.unref();
      error ? reject(error) : resolve(config);
    }
    const send = (value) => child.stdin.write(JSON.stringify(value) + '\n');
    child.stderr.on('data', () => {});
    child.stdin.on('error', () => {});
    child.on('error', () => finish(new Error('config_spawn_failed')));
    child.on('close', () => { if (!finished) finish(new Error('config_server_closed')); });
    child.stdout.on('data', (data) => {
      buffer += data;
      let end;
      while ((end = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, end); buffer = buffer.slice(end + 1);
        let value; try { value = JSON.parse(line); } catch { finish(new Error('config_protocol_invalid')); return; }
        if (value.id === 1) {
          if (value.error) { finish(new Error('config_initialize_failed')); return; }
          send({ method: 'initialized' });
          send({ id: 2, method: 'config/read', params: { cwd, includeLayers: false } });
        } else if (value.id === 2) {
          if (value.error || !value.result?.config) finish(new Error('config_read_failed'));
          else finish(null, value.result.config);
        }
      }
    });
    send({ id: 1, method: 'initialize', params: { clientInfo: { name: 'vic-evals', version: '0.1.0' } } });
  });
}

export function controls(model, effort, servers) {
  if (!Array.isArray(servers) || servers.some((key) => !/^[A-Za-z0-9_-]+$/.test(key))) throw new Error('unsupported_mcp_identifier');
  return ['-c', `model=${JSON.stringify(model)}`, '-c', `model_reasoning_effort=${JSON.stringify(effort)}`, '-c', 'approval_policy="never"', '-c', 'sandbox_mode="workspace-write"', '-c', 'notify=[]', ...servers.flatMap((key) => ['-c', `mcp_servers.${key}.enabled=false`])];
}

export function validateConfig(config, model, effort, count) {
  const servers = Object.values(config.mcp_servers ?? {});
  const valid = config.model === model && config.model_reasoning_effort === effort && typeof config.model_provider === 'string' && config.approval_policy === 'never' && config.sandbox_mode === 'workspace-write' && Array.isArray(config.notify) && config.notify.length === 0 && config.features?.plugins === false && config.features?.hooks === false && servers.length === count && servers.every((value) => value.enabled === false);
  if (!valid) throw new Error('config_controls_unverified');
  return { model: config.model, effort: config.model_reasoning_effort, provider: config.model_provider, config_loading: 'normal-user-config', approval: 'never', sandbox: 'workspace-write', notify: [], plugins: false, hooks: false, mcp_count: count, all_mcp_disabled: true };
}

export async function prepareConfig(cwd, model, effort) {
  const initial = await readConfig(cwd, []);
  const servers = Object.keys(initial.mcp_servers ?? {});
  const overrides = controls(model, effort, servers);
  const checked = await readConfig(cwd, overrides);
  if (initial.model_provider !== checked.model_provider) throw new Error('config_provider_changed');
  return { overrides, projection: validateConfig(checked, model, effort, servers.length) };
}
