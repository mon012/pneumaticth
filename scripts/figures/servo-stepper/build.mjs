// Fig: two ball-screw slides side by side, one driven by a stepper (open loop), one by a servo with an
// encoder (closed loop). Both are told to move between the same two targets. With a heavy load the
// stepper loses steps and stops short; the servo reads its encoder and still lands on target.
// `node scripts/figures/servo-stepper/build.mjs [--inject]`
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 640;
const HEIGHT = 380;

const PLATE = { x: -78, y: -36, w: 146, d: 72, r: 7 };
const PLATE_H = 7;
const FOOT_H = 4;
const LANES = { step: -16, servo: 16 };
const AXZ = 11; // screw axis height
const SCREW = [-40, 52];
const TARGETS = [-8, 32];
const CAR = { w: 14, d: 16 };
const CAR_Z = AXZ - 6, CAR_H = 12;

const P = k.fitProjection([...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [-60, -16, 24], [60, 16, 20]], WIDTH, HEIGHT, { pad: 22, azimuth: 40, elevation: 32 });

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const halo = (plan, z, h) => `<path class="iso-halo" d="${k.haloOf(plan, z, h, P)}" style="filter:blur(3px)"/>`;
const screws = (pts, z, r = 1.2) => L(pts.map(([x, y]) => k.ring(x, y, r, z, P, 14)).join(""), { tone: "lo" }) + D(pts.map(([x, y]) => at([x, y, z])), { size: 0.4 });
const topText = (x, y, z, text, size = 2.4, tone = "lo") => k.faceTextSvg(k.topMatrix([x, y], z, P, "x"), text, { size, tone, anchor: "middle" });

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of k.corners(PLATE, 14).sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P))) {
    out.push(S(k.cylinder(x, y, 5.6, -PLATE_H - FOOT_H, 1.4, P, 24), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 4.3, -PLATE_H - FOOT_H + 1.4, FOOT_H - 1.4, P, 24), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.2), { tone: "mid", inner: L(k.sideSeam(PLATE, -PLATE_H / 2, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 4.5), 0, P), { tone: "faint" }));
  out.push(screws(k.corners(PLATE, 7.5), 0));
  return out.join("");
}

function lane(kind) {
  const y = LANES[kind];
  const out = [];
  const base = { x: SCREW[0] - 2, y: y - 10, w: SCREW[1] - SCREW[0] + 6, d: 20, r: 1.5 };
  out.push(halo(base, 0, 3));
  out.push(S(k.slabOf(base, 0, 3, P, 2, 0.5), { tone: "lo" }));
  // ruler on the near edge with the two target marks
  const ruler = { x: TARGETS[0] - 14, y: y + 6, w: TARGETS[1] - TARGETS[0] + 28, d: 4, r: 0.6 };
  out.push(S(k.slabOf(ruler, 3, 0.6, P, 2, 0.2), { tone: "mid" }));
  const t = k.topTicks(ruler.x + 2, ruler.x + ruler.w - 2, 2, 5, ruler.y, 3.6, [1.2, 2.4], P, "x");
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  for (const tx of TARGETS) out.push(`<path class="sv-mark" d="${k.lineOnTop([tx, ruler.y], [tx, ruler.y + ruler.d], 3.62, P)}"/>`);
  // motor
  if (kind === "step") {
    const m = { x: SCREW[0] - 24, y: y - 9, w: 18, d: 18, r: 1.6 };
    out.push(halo(m, 0, 20));
    out.push(S(k.slabOf(m, 1, 18, P, 2, 0.8), { tone: "mid", inner: L(k.sideSeam(m, 5, P, 2) + k.sideSeam(m, 14, P, 2), { tone: "faint" }) }));
    out.push(L(k.planOutline(k.insetPlan(m, 2.4), 19, P, 2), { tone: "lo" }));
    out.push(screws(k.corners(m, 2.2), 19, 0.8));
    out.push(S(k.slabOf({ x: SCREW[0] - 6, y: y - 9, w: 2, d: 18, r: 0.4 }, 1, 18, P, 2, 0.3), { tone: "lo" })); // flange
    out.push(topText(m.x + 9, y, 19, "STEP", 2.4));
  } else {
    const F = G.frameAlong([SCREW[0] - 30, y, AXZ], [1, 0, 0]);
    out.push(halo({ x: SCREW[0] - 30, y: y - 9, w: 26, d: 18, r: 4 }, 0, 20));
    out.push(S(k.slabOf({ x: SCREW[0] - 24, y: y - 6, w: 16, d: 12, r: 1 }, 0, 3, P, 2), { tone: "lo" })); // cradle
    out.push(S(G.disc(0, 7, 6.4, F, P), { tone: "lo", inner: L(G.ribsOf(F, 0.6, 6.4, 6.4, 14, P, { seams: true }), { tone: "faint" }) })); // encoder cap
    out.push(S(G.disc(7, 24, 8, F, P), { tone: "hi", crease: "lo", className: "sv-servo", inner: L(G.arcOf(F, 12, 8, P) + G.arcOf(F, 19, 8, P), { tone: "faint" }) }));
    out.push(S(k.slabOf({ x: SCREW[0] - 6, y: y - 9, w: 2, d: 18, r: 0.4 }, 1, 18, P, 2, 0.3), { tone: "mid" })); // flange
    out.push(topText(SCREW[0] - 18, y + 0.5, AXZ + 8, "SERVO", 2.2));
  }
  // coupling and screw with bearing blocks
  const F = G.frameAlong([SCREW[0], y, AXZ], [1, 0, 0]);
  out.push(S(G.disc(-4, 2, 3.4, F, P), { tone: "mid", inner: L(G.arcOf(F, -1, 3.4, P), { tone: "lo" }) }));
  out.push(S(k.slabOf({ x: SCREW[0] + 2, y: y - 7, w: 5, d: 14, r: 0.8 }, 3, AXZ + 4 - 3, P, 2, 0.4), { tone: "mid" }));
  const pitch = Array.from({ length: Math.floor((SCREW[1] - SCREW[0] - 14) / 2.4) }, (_, i) => G.arcOf(F, 8 + i * 2.4, 2, P)).join("");
  out.push(S(G.disc(7, SCREW[1] - SCREW[0] - 5, 2, F, P), { tone: "hi", crease: "none", inner: L(pitch, { tone: "faint" }) }));
  return out.join("");
}
const carriage = (kind) => {
  const y = LANES[kind];
  const c = { x: -CAR.w / 2, y: y - CAR.d / 2, w: CAR.w, d: CAR.d, r: 1.2 };
  return `<g data-car="${kind}">${halo(c, CAR_Z, CAR_H)}${S(k.slabOf(c, CAR_Z, CAR_H, P, 2, 0.6), { tone: "hi", lit: true, inner: L(k.sideSeam(c, CAR_Z + 4, P, 2), { tone: "faint" }) })}${screws(k.corners(c, 2.4), CAR_Z + CAR_H, 0.8)}${S(k.slabOf({ x: -0.6, y: y + CAR.d / 2, w: 1.2, d: 6, r: 0.3 }, 3.7, 0.6, P, 2), { tone: "lo" })}<g class="sv-load">${S(k.slabOf({ x: -5, y: y - 5, w: 10, d: 10, r: 0.8 }, CAR_Z + CAR_H, 6, P, 2, 0.4), { tone: "mid" })}</g></g>`;
};
const endBlock = (kind) => { const y = LANES[kind]; return S(k.slabOf({ x: SCREW[1] - 5, y: y - 7, w: 5, d: 14, r: 0.8 }, 3, AXZ + 4 - 3, P, 2, 0.4), { tone: "mid" }); };

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: "Two ball-screw slides side by side. The back one is driven by a stepper motor without feedback, the front one by a servo motor with an encoder. Both carriages are commanded between the same two target marks. With a heavy load added, the stepper loses steps and stops short of the target, while the servo corrects its position from the encoder and stops exactly on the mark.",
  body: [plate(), lane("step"), carriage("step"), endBlock("step"), lane("servo"), carriage("servo"), endBlock("servo")],
});

const EX = k.axisVector(P, [1, 0, 0]);
const CSS = `
.sv-mark{fill:none;stroke:var(--anatomy-red);stroke-width:1.2;stroke-linecap:round}
.sv-load{opacity:0;transition:opacity .2s}
.sv-fig[data-heavy] .sv-load{opacity:1}
.sv-fig[data-slip] [data-car="step"] .iso-edge{stroke:#e5484d}
.sv-stage{cursor:pointer;touch-action:manipulation}
`;
const live = `(() => {
const fig = document.currentScript.previousElementSibling;
const stage = fig.querySelector(".sv-stage"), svg = stage.querySelector("svg");
const cars = { step: svg.querySelector('[data-car="step"]'), servo: svg.querySelector('[data-car="servo"]') };
const readout = fig.querySelector("[data-readout]");
const EX = ${JSON.stringify(EX)}, TARGETS = ${JSON.stringify(TARGETS)};
const still = matchMedia("(prefers-reduced-motion: reduce)");
const VMAX = 22;
let homed = false, heavy = false, leg = 1, cmd = TARGETS[0], lost = 0, servo = TARGETS[0], dwell = 0, visible = false, frame = 0, last = 0;
const mv = (x) => "translate(" + (EX[0] * x).toFixed(2) + " " + (EX[1] * x).toFixed(2) + ")";
function draw() {
  const step = cmd - lost;
  cars.step.setAttribute("transform", mv(step));
  cars.servo.setAttribute("transform", mv(servo));
  heavy ? fig.setAttribute("data-heavy", "") : fig.removeAttribute("data-heavy");
  Math.abs(lost) > 0.3 ? fig.setAttribute("data-slip", "") : fig.removeAttribute("data-slip");
  const goal = TARGETS[leg];
  const text = "เป้า " + goal.toFixed(0) + " mm · Stepper " + step.toFixed(1) + (Math.abs(lost) > 0.3 ? " (หลุดสเต็ป " + lost.toFixed(1) + ")" : homed ? " (Home ใหม่)" : "") + " · Servo " + servo.toFixed(1) + (heavy ? " · โหลดหนัก" : "");
  if (readout.textContent !== text) readout.textContent = text;
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60; last = now;
  const goal = TARGETS[leg], d = goal - cmd;
  if (Math.abs(d) > 0.01) {
    const v = Math.sign(d) * Math.min(VMAX, Math.abs(d) * 4 + 4);
    const dx = Math.abs(v * dt) > Math.abs(d) ? d : v * dt;
    cmd += dx;
    if (heavy && v > 12) lost += dx * 0.18; // open loop: steps missed while pushing the load are never made up
  } else if ((dwell += dt) > 1.2) { dwell = 0; leg = 1 - leg; if (lost > 12 || !heavy) { homed = lost > 12; lost = 0; } else homed = false; }
  servo += (cmd - servo) * (still.matches ? 1 : 1 - Math.exp(-dt / (heavy ? 0.12 : 0.05)));
  draw();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; visible ? run() : (cancelAnimationFrame(frame), (frame = 0)); }, { rootMargin: "80px 0px" }).observe(stage);
const toggle = () => { heavy = !heavy; lost = 0; run(); };
stage.addEventListener("click", toggle);
stage.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } });
draw();
})();`;

const figure = k.plateHtml({
  fig: "Fig 1",
  title: "Stepper vs servo",
  hint: "คลิกเพื่อเพิ่ม/ลดโหลดบนแคร่",
  readout: "เป้า 32 mm · Stepper -8.0 · Servo -8.0",
  keys: [
    { mark: "lit", label: "แคร่ที่มอเตอร์ขับผ่านบอลสกรู" },
    { mark: "red", label: "ตำแหน่งเป้าหมาย 2 จุด" },
  ],
  caption: "ชุดหลังขับด้วย Stepper Motor แบบ Open Loop ชุดหน้าขับด้วย Servo Motor ที่มี Encoder ท้ายมอเตอร์ (Closed Loop) ทั้งสองได้รับคำสั่งให้วิ่งระหว่างเป้า 2 จุดเหมือนกัน เมื่อเพิ่มโหลดหนัก Stepper เร่งไม่ทันจนหลุดสเต็ป แคร่หยุดไม่ถึงเป้าและคลาดสะสมไปเรื่อยๆ โดยไดรเวอร์ไม่รู้ตัว ส่วน Servo อ่านตำแหน่งจริงจาก Encoder แล้วชดเชยจนหยุดตรงเป้าทุกครั้ง",
  body: `<div class="iso-stage sv-stage" tabindex="0" role="button" aria-label="เพิ่มหรือลดโหลดบนแคร่ (กด Space)">${svg}</div>`,
});

const fragment = `<div class="iso sv-fig" data-theme="light"><style>${k.ISO_CSS}${CSS}</style>${figure}</div><script>${live}</script>`;
writeFileSync(join(HERE, "servo-stepper.fragment.html"), fragment);
writeFileSync(join(HERE, "servo-stepper.html"), `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Stepper vs servo</title><style>body{margin:0;background:#f2f2ef;padding:32px 16px}.sv-fig{max-width:740px;margin:0 auto}</style></head><body>${fragment}</body></html>`);
console.log("wrote", (fragment.length / 1024).toFixed(1) + " KB fragment");

if (process.argv.includes("--inject")) {
  const file = join(HERE, "../../../src/data/pages.json");
  const raw = readFileSync(file, "utf8");
  const pages = JSON.parse(raw);
  const page = pages.find((p) => p.route === "servo-vs-stepper-motor");
  const marked = /<!-- fig:servo-stepper -->[\s\S]*?<!-- \/fig:servo-stepper -->/;
  if (!page || !marked.test(page.html)) throw new Error("servo-stepper: figure marker not found");
  page.html = page.html.replace(marked, () => `<!-- fig:servo-stepper -->\n${fragment}\n<!-- /fig:servo-stepper -->`);
  writeFileSync(file, JSON.stringify(pages, null, 2) + (raw.endsWith("\n") ? "\n" : ""));
  console.log("injected into servo-vs-stepper-motor");
}
