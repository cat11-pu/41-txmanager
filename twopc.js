// twopc.js：阶段推进。逐事务收集投票：任一反对则中止，全部赞成才提交，
// 参与者缺席标为未决；决策先写进日志（logged）再返回。
export function decide(txs, votes) {
  const decisions = [];
  const logged = [];
  for (const tx of txs) {
    const ballot = votes[tx.id] || {};
    let missing = false;
    let decision = "commit";
    for (const participant of tx.participants) {
      const vote = ballot[participant];
      if (vote === "no") { decision = "abort"; missing = false; break; }
      if (vote !== "yes") missing = true;
    }
    if (missing) decision = "pending";
    decisions.push([tx.id, decision]);
    if (decision !== "pending") {
      logged.push({ tx: tx.id, kind: "decision", value: decision });
    }
  }
  return { decisions, logged };
}
