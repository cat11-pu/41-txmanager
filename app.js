// app.js：渲染结果
import { decide } from "./twopc.js";
import { plan } from "./recovery.js";

export function render(spec) {
  const votes = spec.votes || {};
  const log = spec.log || [];
  const result = decide(spec.txs, votes);
  const first = plan(result.decisions, log, votes);
  const second = plan(result.decisions, log, votes);
  const idempotent = JSON.stringify(first) === JSON.stringify(second);
  const out = { decisions: result.decisions, logged: result.logged,
                actions: first.actions, unresolved: first.unresolved,
                idempotent: idempotent };
  if (first.unresolved.length > 0) {
    const error = new Error("E_UNRESOLVED：无法裁决的未决事务：" + first.unresolved.join(", "));
    error.code = "E_UNRESOLVED";
    error.details = out;
    throw error;
  }
  return out;
}
