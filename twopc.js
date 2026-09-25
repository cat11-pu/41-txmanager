// twopc.js：阶段推进（基线：不问投票直接提交）
export function decide(txs, votes) {
  return { decisions: txs.map((tx) => [tx.id, "commit"]), logged: [] };
}
