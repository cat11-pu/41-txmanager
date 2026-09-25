// app.js：渲染结果
import { decide } from "./twopc.js";
import { recover } from "./recovery.js";

export function render(spec) {
  const result = decide(spec.txs, spec.votes || {});
  const back = recover(result.decisions, spec.log || [], spec.votes || {});
  return { decisions: result.decisions, logged: result.logged, actions: back.actions,
           unresolved: back.unresolved, idempotent: true };
}
