// recovery.js：按日志裁决恢复（日志扫一次、事务扫一次，均为线性）
// 已有提交/中止记录的事务按记录走、不重复执行；
// 只有 prepare 的事务中止；参与者缺席（裁决 pending）报未决。
function compareTxIds(a, b) {
  const ma = /^(.*?)(\d+)$/.exec(a);
  const mb = /^(.*?)(\d+)$/.exec(b);
  if (ma && mb && ma[1] === mb[1]) return Number(ma[2]) - Number(mb[2]);
  return a < b ? -1 : a > b ? 1 : 0;
}

export function plan(decisions, log, votes) {
  const verdictByTx = new Map(decisions || []);
  const finalByTx = new Map();
  const prepared = new Set();
  const seen = new Set();
  const ordered = [];

  for (const entry of log || []) {
    if (!seen.has(entry.tx)) { seen.add(entry.tx); ordered.push(entry.tx); }
    const value = entry.kind === "decision" ? entry.value : entry.kind;
    if (value === "commit" || value === "abort") {
      if (!finalByTx.has(entry.tx)) finalByTx.set(entry.tx, value);
    } else if (entry.kind === "prepare") {
      prepared.add(entry.tx);
    }
  }

  const actions = [];
  const unresolvedSet = new Set();

  for (const [tx, verdict] of decisions || []) {
    if (!seen.has(tx)) { seen.add(tx); ordered.push(tx); }
    if (verdict === "pending") unresolvedSet.add(tx);
  }

  for (const tx of ordered) {
    if (finalByTx.has(tx)) continue;
    if (unresolvedSet.has(tx)) continue;
    if (prepared.has(tx)) {
      actions.push([tx, "abort"]);
    } else {
      const verdict = verdictByTx.get(tx);
      if (verdict === "commit" || verdict === "abort") actions.push([tx, verdict]);
    }
  }

  return { actions, unresolved: [...unresolvedSet].sort(compareTxIds) };
}

export function recover(decisions, log, votes) {
  const result = plan(decisions, log, votes);
  if (result.unresolved.length > 0) {
    const error = new Error("E_UNRESOLVED：无法裁决的未决事务：" + result.unresolved.join(", "));
    error.code = "E_UNRESOLVED";
    error.unresolved = result.unresolved;
    error.actions = result.actions;
    throw error;
  }
  return result;
}
