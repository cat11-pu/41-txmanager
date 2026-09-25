import fs from "node:fs";
import { decide } from "./twopc.js";
import { recover } from "./recovery.js";
import { render } from "./app.js";

// 验收断言：上面每条值收进 emit，最后与期望值逐项比对，不符就非零退出。
const __lines = [];
function emit(label, value) { __lines.push([String(label).replace(/ =$/, ""), value]); }


const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/twopc.json", "utf8"));
const result = decide(spec.txs, spec.votes || {});
const back = recover(result.decisions, spec.log || [], spec.votes || {});
const out = render(spec);

emit("裁决 =", result.decisions);
emit("落盘的决策记录 =", result.logged);
emit("恢复时的动作 =", back.actions);
emit("未决事务 =", back.unresolved);
emit("重复恢复是否幂等 =", out.idempotent);
emit("无法裁决的错误码 =", spec.unresolved_code);


// ---- 期望值（参考模型算出，与题面给的验收数值一致）----
const EXPECTED = {
  "裁决": [
    [
      "t0",
      "abort"
    ],
    [
      "t1",
      "commit"
    ],
    [
      "t2",
      "commit"
    ]
  ],
  "落盘的决策记录": [
    {
      "tx": "t0",
      "kind": "decision",
      "value": "abort"
    },
    {
      "tx": "t1",
      "kind": "decision",
      "value": "commit"
    },
    {
      "tx": "t2",
      "kind": "decision",
      "value": "commit"
    }
  ],
  "恢复时的动作": [
    [
      "t0",
      "abort"
    ],
    [
      "t2",
      "commit"
    ]
  ],
  "未决事务": [],
  "重复恢复是否幂等": true,
  "无法裁决的错误码": "E_UNRESOLVED"
};
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  const got = found[1];
  if (JSON.stringify(got) === JSON.stringify(want)) { console.log("一致 " + label + " = " + JSON.stringify(got)); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(got)); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
