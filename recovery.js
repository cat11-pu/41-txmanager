// recovery.js：按日志裁决恢复。日志里已有提交/中止记录的按记录走（不重复执行）；
// 只有准备记录、没有决策的一律中止；参与者缺席的未决事务报 E_UNRESOLVED。
// 每个事务与每条日志各扫一次，线性。
export function recover(decisions, log, votes) {
  const loggedDecision = new Map();
  const prepared = new Set();
  for (const entry of log) {
    if (entry.kind === "prepare") {
      prepared.add(entry.tx);
    } else if (entry.kind === "commit" || entry.kind === "abort") {
      loggedDecision.set(entry.tx, entry.kind);
    } else if (entry.kind === "decision") {
      loggedDecision.set(entry.tx, entry.value);
    }
  }

  const actions = [];
  const unresolved = [];
  const covered = new Set();
  for (const pair of decisions) {
    const tx = pair[0];
    const decision = pair[1];
    covered.add(tx);
    if (decision === "commit" || decision === "abort") {
      if (!loggedDecision.has(tx)) actions.push([tx, decision]);
    } else {
      unresolved.push(tx);
    }
  }

  for (const tx of prepared) {
    if (!covered.has(tx) && !loggedDecision.has(tx)) {
      actions.push([tx, "abort"]);
    }
  }

  unresolved.sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  const result = { actions, unresolved };
  if (unresolved.length > 0) {
    result.error = { code: "E_UNRESOLVED", txs: unresolved.slice() };
  }
  return result;
}
