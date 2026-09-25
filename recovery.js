// recovery.js：恢复（基线：未决事务直接丢弃）
export function recover(decisions, log, votes) {
  return { actions: [], unresolved: [] };
}
