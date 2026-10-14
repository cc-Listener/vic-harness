import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';

export function stopGroup(child, signal) {
  try { process.kill(-child.pid, signal); } catch { try { child.kill(signal); } catch {} }
}

export async function execute(command, args, { cwd, input = '', timeout = 120000, stdoutFile, stderrFile } = {}) {
  return new Promise((resolve) => {
    const started = Date.now(), child = spawn(command, args, { cwd, detached: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', timed_out = false, interrupted = null, spawn_error = false, termination;
    const out = stdoutFile ? createWriteStream(stdoutFile, { flags: 'wx' }) : null;
    const err = stderrFile ? createWriteStream(stderrFile, { flags: 'wx' }) : null;
    const terminate = () => {
      if (termination) return;
      stopGroup(child, 'SIGTERM');
      termination = new Promise((done) => setTimeout(() => { stopGroup(child, 'SIGKILL'); done(); }, 2000));
    };
    const interrupt = (signal) => { interrupted = signal; terminate(); };
    const onInt = () => interrupt('SIGINT'), onTerm = () => interrupt('SIGTERM');
    process.on('SIGINT', onInt); process.on('SIGTERM', onTerm);
    const timer = setTimeout(() => { timed_out = true; terminate(); }, timeout);
    child.stdout.on('data', (data) => { if (out) out.write(data); else stdout += data; });
    child.stderr.on('data', (data) => { if (err) err.write(data); else stderr += data; });
    child.stdin.on('error', () => {});
    child.on('error', () => { spawn_error = true; });
    child.stdin.end(input);
    child.on('close', async (exit_code, signal) => {
      clearTimeout(timer);
      // close 只确认直接子进程退出；同组后代仍可能忽略 SIGTERM。
      await termination;
      process.off('SIGINT', onInt); process.off('SIGTERM', onTerm);
      await Promise.all([out, err].filter(Boolean).map((stream) => new Promise((done) => stream.end(done))));
      resolve({ exit_code, signal, timed_out, interrupted, spawn_error, seconds: (Date.now() - started) / 1000, stdout, stderr });
    });
  });
}
