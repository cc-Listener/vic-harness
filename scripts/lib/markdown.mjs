// 只抽取检查需要的 Markdown 结构；代码围栏和缩进代码不属于真实导航链接。
export function markdownParts(text) {
  const prose = [], code = [];
  let fence = null;
  for (const line of text.split(/\r?\n/)) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
      else code.push(line);
      prose.push('');
    } else if (marker) {
      fence = marker[1];
      prose.push('');
    } else if (/^( {4}|\t)/.test(line)) {
      code.push(line);
      prose.push('');
    } else prose.push(line);
  }
  return { prose: prose.join('\n').replace(/<!--[\s\S]*?-->/g, ''), code: code.join('\n') };
}

function destination(text, start) {
  let index = start;
  while (/\s/.test(text[index] || '') && index < text.length) index++;
  if (text[index] === '<') {
    const end = text.indexOf('>', index + 1);
    return end < 0 ? null : { value: text.slice(index + 1, end), end: end + 1 };
  }
  let value = '', depth = 0;
  while (index < text.length) {
    const char = text[index];
    if (char === '\\' && index + 1 < text.length) { value += text[index + 1]; index += 2; continue; }
    if (char === '(') depth++;
    if (char === ')') { if (!depth) break; depth--; }
    if (/\s/.test(char) && !depth) break;
    value += char;
    index++;
  }
  return depth ? null : { value, end: index };
}
const referenceKey = value => value.trim().replace(/\s+/g, ' ').toLowerCase();

export function markdownLinks(text) {
  let prose = markdownParts(text).prose.replace(/(`+)[\s\S]*?\1/g, '');
  const definitions = new Map();
  prose = prose.replace(/^ {0,3}\[([^\]\n]+)\]:[^\n]*$/gm, line => {
    const match = line.match(/^ {0,3}\[([^\]]+)\]:\s*/);
    const parsed = destination(line, match[0].length);
    if (parsed) definitions.set(referenceKey(match[1]), parsed.value);
    return '';
  });
  const links = [];
  for (let index = 0; index < prose.length; index++) {
    if (prose[index] !== '[' || prose[index - 1] === '\\') continue;
    let end = index + 1, depth = 1;
    while (end < prose.length && depth) {
      if (prose[end] === '\\') { end += 2; continue; }
      if (prose[end] === '[') depth++;
      if (prose[end] === ']') depth--;
      end++;
    }
    if (depth) continue;
    const label = prose.slice(index + 1, end - 1);
    if (prose[end] === '(') {
      const parsed = destination(prose, end + 1);
      const close = parsed ? prose.indexOf(')', parsed.end) : -1;
      if (close >= 0) { links.push(parsed.value); end = close + 1; }
    } else if (prose[end] === '[') {
      const close = prose.indexOf(']', end + 1);
      if (close >= 0) {
        const key = referenceKey(prose.slice(end + 1, close) || label);
        if (definitions.has(key)) links.push(definitions.get(key));
        end = close + 1;
      }
    } else if (definitions.has(referenceKey(label))) links.push(definitions.get(referenceKey(label)));
    index = end - 1;
  }
  return links;
}
