import assert from "node:assert";
import { decide } from "../twopc.js";
import { recover } from "../recovery.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

const txs = [{ id: "t0", participants: ["p0", "p1"] }];
const votes = { t0: { p0: "yes", p1: "yes" } };

check("decide returns decisions", () => {
  assert.ok(Array.isArray(decide(txs, votes).decisions));
});

check("decide returns logged list", () => {
  assert.ok(Array.isArray(decide(txs, votes).logged));
});

check("recover returns actions", () => {
  assert.ok(Array.isArray(recover([], [], {}).actions));
});

check("recover returns unresolved", () => {
  assert.ok(Array.isArray(recover([], [], {}).unresolved));
});

check("render exposes idempotent flag", () => {
  assert.strictEqual(typeof render({ txs: txs, votes: votes, log: [] }).idempotent, "boolean");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
