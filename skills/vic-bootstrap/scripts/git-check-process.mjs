// 仅供固定 Git 工具使用。测试在真实子进程边界验证观察语义，不把模拟进程当 Git。
import { spawn } from 'node:child_process';

const LIMIT = 1024 * 1024;
export function processVerdict(e) {
  if (e.status !== 'completed' || !e.capture_complete || e.signal || e.exit_code === null) return 'unknown';
  return e.exit_code === 0 ? 'passed' : 'failed';
}

export function observeProcess({ executable, argv, cwd, env, timeoutMs }) {
  return new Promise(resolve => {
    const e = { status: 'running', exit_code: null, signal: null, stdout: '', stderr: '', capture_complete: false,
      timed_out: false, truncated: false, startup_error: null, reason: null };
    const chunks = { stdout: [], stderr: [] }, bytes = { stdout: 0, stderr: 0 }, eof = { stdout: false, stderr: false };
    let child, settled = false, cleanupTimer;
    const grouped = process.platform !== 'win32';
    function kill() {
      try { if (grouped && child.pid) process.kill(-child.pid, 'SIGKILL'); else child.kill('SIGKILL'); } catch {}
    }
    function finish(closed = false) {
      if (settled) return;
      settled = true; clearTimeout(timer); clearTimeout(cleanupTimer);
      e.capture_complete = closed && eof.stdout && eof.stderr && !e.truncated && !e.timed_out && !e.startup_error;
      if (e.status === 'running') e.status = e.capture_complete ? 'completed' : 'incomplete';
      if (e.signal && !e.reason) e.reason = 'signal';
      if (e.status === 'completed' && e.exit_code !== 0 && !e.reason) e.reason = 'nonzero_exit';
      for (const stream of ['stdout', 'stderr']) e[stream] = Buffer.concat(chunks[stream]).toString('utf8');
      resolve(e);
    }
    function stop(reason) {
      if (e.reason) return;
      e.reason = reason; e.status = reason === 'timeout' ? 'timeout' : 'incomplete';
      e.timed_out = reason === 'timeout'; e.truncated = reason === 'output_limit'; kill();
      cleanupTimer = setTimeout(() => { child.stdout.destroy(); child.stderr.destroy(); finish(); }, 250);
    }
    const timer = setTimeout(() => stop('timeout'), timeoutMs);
    try {
      child = spawn(executable, argv, { cwd, env, shell: false, detached: grouped, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    } catch (error) {
      e.status = 'error'; e.startup_error = error.code || 'spawn_error'; e.reason = 'startup_error'; finish(); return;
    }
    child.on('error', error => { e.status = 'error'; e.startup_error = error.code || 'spawn_error'; e.reason = 'startup_error'; });
    child.on('exit', (code, signal) => { e.exit_code = code; e.signal = signal; });
    for (const stream of ['stdout', 'stderr']) {
      child[stream].on('data', chunk => {
        const remaining = LIMIT - bytes[stream];
        if (remaining > 0) chunks[stream].push(chunk.subarray(0, remaining));
        bytes[stream] += chunk.length;
        if (bytes[stream] > LIMIT) stop('output_limit');
      });
      child[stream].on('end', () => { eof[stream] = true; });
      child[stream].on('error', () => stop('stream_error'));
    }
    child.on('close', (code, signal) => {
      e.exit_code = code; e.signal = signal;
      // 同组继承进程也须终止，不能只等待直接子进程退出。
      kill(); finish(true);
    });
  });
}
