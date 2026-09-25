// twopc.js：逐事务收集投票并裁决，决策先写日志再返回（每个事务只扫一次）
export function decide(txs, votes) {
  const allVotes = votes || {};
  const decisions = [];
  const logged = [];
  for (const tx of txs || []) {
    const txVotes = allVotes[tx.id] || {};
    let verdict = "commit";
    let missing = false;
    for (const participant of tx.participants || []) {
      const vote = txVotes[participant];
      if (vote === "no") {
        verdict = "abort";
      } else if (vote !== "yes" && verdict !== "abort") {
        missing = true;
      }
    }
    if (verdict !== "abort" && missing) verdict = "pending";
    decisions.push([tx.id, verdict]);
    if (verdict === "commit" || verdict === "abort") {
      logged.push({ tx: tx.id, kind: "decision", value: verdict });
    }
  }
  return { decisions, logged };
}
