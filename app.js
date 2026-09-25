// app.js：渲染结果
import { decide } from "./twopc.js";
import { recover } from "./recovery.js";

export function render(spec) {
  const result = decide(spec.txs, spec.votes || {});
  const back = recover(result.decisions, spec.log || [], spec.votes || {});
  const again = recover(result.decisions, spec.log || [], spec.votes || {});
  const idempotent = JSON.stringify(back.actions) === JSON.stringify(again.actions)
    && JSON.stringify(back.unresolved) === JSON.stringify(again.unresolved);
  return { decisions: result.decisions, logged: result.logged, actions: back.actions,
           unresolved: back.unresolved, idempotent };
}
