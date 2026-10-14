export const CSV_HEADER = 'date,plugin_version,model,fixture,skill,pass,check_errors,qa_score,tokens,seconds';
export const csvRow = (values) => values.map((value) => {
  const text = value == null ? '' : String(value);
  return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
}).join(',') + '\n';

export function parseEvents(text, skillText, readCommand) {
  const errors = [], commands = [], completions = [], reads = [];
  let count = 0;
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    let event;
    try { event = JSON.parse(line); count++; } catch { errors.push('invalid_jsonl'); continue; }
    if (!event || typeof event !== 'object' || Array.isArray(event)) { errors.push('invalid_event'); continue; }
    if (event.type === 'turn.failed' || event.type === 'error') errors.push('model_event_failure');
    if (event.type === 'turn.completed') completions.push(event);
    if (event.type === 'item.completed' && event.item?.type === 'command_execution') {
      const item = event.item;
      commands.push({ id: item.id, command: item.command, exit_code: item.exit_code });
      // 固定的首次读取命令必须成功，并且返回完整的冻结技能正文。
      if (commands.length === 1 && item.exit_code === 0 && typeof item.command === 'string' && item.command.includes(readCommand) && typeof item.aggregated_output === 'string' && item.aggregated_output.includes(skillText)) reads.push(item.id);
    }
  }
  if (!count) errors.push('empty_events');
  if (completions.length !== 1) errors.push('completion_count_invalid');
  if (!reads.length) errors.push('skill_read_unverified');
  const raw = completions[0]?.usage;
  const number = (key) => Number.isSafeInteger(raw?.[key]) && raw[key] >= 0 ? raw[key] : null;
  const usage = { input_tokens: number('input_tokens'), output_tokens: number('output_tokens'), cached_input_tokens: number('cached_input_tokens'), reasoning_output_tokens: number('reasoning_output_tokens') };
  usage.tokens = usage.input_tokens == null || usage.output_tokens == null ? null : usage.input_tokens + usage.output_tokens;
  return { errors: [...new Set(errors)], usage, skill_read_event_ids: reads, commands, service_accepted: reads.length > 0, actual_model: null, actual_effort: null };
}

export function totalUsage(phases, expectedCount = phases.length) {
  const keys = ['input_tokens', 'output_tokens', 'cached_input_tokens', 'reasoning_output_tokens', 'tokens'];
  return Object.fromEntries(keys.map((key) => [key, phases.length === expectedCount && phases.length > 0 && phases.every((p) => p.usage?.[key] != null) ? phases.reduce((n, p) => n + p.usage[key], 0) : null]));
}
