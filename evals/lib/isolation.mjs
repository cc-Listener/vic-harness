// 从冻结来源动态选取发布资源；不得将评测树恢复到模型bundle中。
export function publicationEntries(frozen) {
  return Object.fromEntries(Object.entries(frozen).filter(([name]) =>
    ['skills', 'schemas', 'scripts'].some((root) => name === root || name.startsWith(root + '/'))));
}

// 这是可审计的显式路径检测，不是shell解释器或任意宿主读取防护。
export function auditCommands(commands, { oracleRoot, sourceRoot }) {
  const flagged = commands.filter(({ command }) => typeof command === 'string' && (
    command.includes(oracleRoot) || command.includes(sourceRoot) ||
    /(?:^|[\s/'"\\])(?:evals|expected\.ya?ml|questions\.ya?ml|metrics\.csv)(?:[\s/'"\\]|$)/.test(command)
  )).map(({ id, command }) => ({ id, command }));
  return { flagged, coverage: '仅显式命令路径；动态构造、非command工具及任意宿主读取未知' };
}
