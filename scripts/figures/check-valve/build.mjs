// Fig: inline check valve cut open along its axis. Air from IN lifts the poppet off its seat
// against a light spring and flows through; air from OUT presses the poppet onto the seat and stops.
// `node scripts/figures/check-valve/build.mjs [--inject]`
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 640;
const HEIGHT = 340;

const PLATE = { x: -128, y: -30, w: 256, d: 64, r: 8 };
const PLATE_H = 8;
const FOOT_H = 4;

const AX = 14;
const BODY = { x: -46, y: -16, w: 92, d: 32, r: 3 };
const BORE = { x: -38, y: -9, w: 76, d: 18, r: 0.6 };
const SEAT_X = -12;
const HOLE = 4;
const CLOSED = SEAT_X + 1.2; // poppet face position when seated
const OPEN = CLOSED + 9;
const SPRING_END = 30;
const SUP_L = { x: -116, y: -12, w: 28, d: 24, r: 2 };
const SUP_R = { x: 88, y: -12, w: 28, d: 24, r: 2 };

const P = k.fitProjection([...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [0, 0, AX + 16]], WIDTH, HEIGHT, { pad: 22, azimuth: 62, elevation: 34 });

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const poly = (pts) => k.pathOf(pts.map(at));
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const screws = (pts, z, r = 1.4) => L(pts.map(([x, y]) => k.ring(x, y, r, z, P, 14)).join(""), { tone: "lo" }) + D(pts.map(([x, y]) => at([x, y, z])), { size: 0.4 });
const topText = (x, y, z, text, size = 2.8, tone = "mid") => k.faceTextSvg(k.topMatrix([x, y], z, P, "x"), text, { size, tone, anchor: "middle" });
const halo = (plan, z, h) => `<path class="iso-halo" d="${k.haloOf(plan, z, h, P)}" style="filter:blur(3px)"/>`;
const flat = (plan, z) => S(k.slabOf(plan, z - 0.01, 0.01, P, 2), { tone: "lo", flat: true, crease: "none" });

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 14))) {
    out.push(S(k.cylinder(x, y, 6, -PLATE_H - FOOT_H, 1.4, P, 24), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 4.6, -PLATE_H - FOOT_H + 1.4, FOOT_H - 1.4, P, 24), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.2), { tone: "mid", inner: L(k.sideSeam(PLATE, -PLATE_H / 2, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "faint" }));
  out.push(screws(k.corners(PLATE, 7), 0));
  return out.join("");
}
// supply blocks at both ends: each has a small valve knob and a lamp showing which side is pressurised
function supply(plan, name, label) {
  const out = [halo(plan, 0, 16), S(k.slabOf(plan, 0, 16, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(plan, 5, P, 3), { tone: "faint" }) })];
  out.push(screws(k.corners(plan, 3), 16, 1));
  const cx = plan.x + plan.w / 2, cy = plan.y + plan.d / 2 - 3;
  out.push(S(k.cylinder(cx, cy, 5, 16, 3, P, 28, 0.4), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(cx, cy, 5, 16, 19, 26, P), { tone: "lo" }));
  const [lx, ly] = at([cx, plan.y + plan.d - 4, 16]);
  out.push(`<circle class="cv-lamp" data-lamp="${name}" cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="1.6"/>`);
  out.push(topText(cx, plan.y + plan.d - 4 - 0.2 + 0.01, 16.01, "", 1));
  out.push(topText(cx - 8, plan.y + plan.d - 3, 16, label, 3, "hi"));
  return out.join("");
}
function body() {
  const out = [halo(BODY, 0, AX)];
  for (const x of [BODY.x + 6, BODY.x + BODY.w - 16]) out.push(S(k.slabOf({ x, y: BODY.y - 2, w: 10, d: BODY.d + 4, r: 1 }, 0, 3, P, 2, 0.4), { tone: "lo" }));
  out.push(S(k.slabOf(BODY, 3, AX - 3, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(BODY, 7, P, 3), { tone: "faint" }) }));
  // hex ends (outside the cut, full) and port bores on the cut face
  out.push(flat(BORE, AX));
  out.push(L(k.planOutline(BORE, AX, P, 2), { tone: "lo" }));
  out.push(flat({ x: BODY.x, y: -3.4, w: BORE.x - BODY.x, d: 6.8, r: 0.3 }, AX), flat({ x: BORE.x + BORE.w, y: -3.4, w: BODY.x + BODY.w - BORE.x - BORE.w, d: 6.8, r: 0.3 }, AX));
  // valve seat: a wall across the bore with a hole, chamfered
  for (const [y0, y1] of [[BORE.y, -HOLE], [HOLE, BORE.y + BORE.d]]) out.push(S(k.slabOf({ x: SEAT_X - 3, y: y0, w: 3, d: y1 - y0, r: 0.2 }, AX - 6, 6, P, 2, 0.3), { tone: "mid" }));
  // spring retainer with flow holes
  for (const [y0, y1] of [[BORE.y, -6], [-2, 2], [6, BORE.y + BORE.d]]) out.push(S(k.slabOf({ x: SPRING_END, y: y0, w: 2.4, d: y1 - y0, r: 0.2 }, AX - 5, 5, P, 2, 0.3), { tone: "mid" }));
  // flow arrow engraved on the near half's top edge
  const ay = BODY.y + 3.4;
  out.push(L(k.lineOnTop([-18, ay], [16, ay], AX, P) + k.lineOnTop([16, ay], [11, ay - 2.4], AX, P) + k.lineOnTop([16, ay], [11, ay + 2.4], AX, P), { tone: "hi", free: true }));
  return out.join("");
}
const BF = G.frameAlong([0, 0, AX], [1, 0, 0]);
function ends() {
  const out = [];
  for (const [s0, s1] of [[BODY.x - 12, BODY.x], [BODY.x + BODY.w, BODY.x + BODY.w + 12]]) {
    out.push(S(G.disc(s0 + (s0 < 0 ? 0 : 4), s1 - (s0 < 0 ? 4 : 0), 4.4, BF, P), { tone: "mid" }));
    out.push(S(G.disc(s0 < 0 ? s1 - 4 : s0, s0 < 0 ? s1 : s0 + 4, 6.4, BF, P), { tone: "mid", inner: L(G.ribsOf(BF, s0 < 0 ? s1 - 3.8 : s0 + 0.2, s0 < 0 ? s1 - 0.2 : s0 + 3.8, 6.4, 6, P, { seams: true }), { tone: "lo" }) }));
  }
  return out.join("");
}
// poppet (cone face + stem) built at the closed position and slid along x
const PF = G.frameAlong([CLOSED, 0, AX], [1, 0, 0]);
const poppet = () => S(G.solidOf([[0, 0], [0, 2.4, 1], [1.6, 5.2, 1], [3.4, 6.4], [6, 6.4], [6, 2], [16, 2]], PF, P), { tone: "hi", lit: true, crease: "lo" });
const SPRING_STEPS = 21;
const springs = Array.from({ length: SPRING_STEPS }, (_, i) => k.coil(CLOSED + 6 + ((OPEN - CLOSED) * i) / (SPRING_STEPS - 1), SPRING_END, [0, AX], 4.6, 5, "x", P));
const chamber = (name) => `<path class="cv-chamber" data-chamber="${name}" d=""/>`;
const flowPath = poly([[BORE.x - 4, 6.6, AX + 0.15], [SEAT_X - 4, 6.6, AX + 0.15], [SEAT_X - 1, 2.8, AX + 0.15], [SEAT_X + 12, 7.4, AX + 0.15], [BORE.x + BORE.w + 4, 7.4, AX + 0.15]]);

const hose = (pts, name) => { const d = poly(pts); return `<g class="cv-hose" data-hose="${name}"><path class="cv-hose-body" d="${d}"/><path class="cv-hose-core" d="${d}"/><path class="cv-hose-flow" d="${d}"/></g>`; };
function bez(p0, c1, c2, p3, n = 20) { return Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [0, 1, 2].map((j) => u * u * u * p0[j] + 3 * u * u * t * c1[j] + 3 * u * t * t * c2[j] + t * t * t * p3[j]); }); }
const hoses = () => [
  hose(bez([SUP_L.x + SUP_L.w, 0, 8], [SUP_L.x + SUP_L.w + 14, 0, 8], [BODY.x - 26, 0, AX], [BODY.x - 12, 0, AX]), "l"),
  hose(bez([BODY.x + BODY.w + 12, 0, AX], [BODY.x + BODY.w + 26, 0, AX], [SUP_R.x - 14, 0, 8], [SUP_R.x, 0, 8]), "r"),
].join("");

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: "An inline check valve cut open along its axis, between an inlet block on the left and an outlet block on the right. Air from the inlet lifts the cone-shaped poppet off its seat against a light spring and flows through. Air pushed back from the outlet presses the poppet onto the seat and the flow stops.",
  body: [plate(), supply(SUP_L, "in", "IN"), supply(SUP_R, "out", "OUT"), hoses(), body(), chamber("up"), chamber("down"), `<path class="cv-flow" d="${flowPath}"/>`, `<path class="iso-line" data-tone="lo" data-part="spring-back" d="${springs[0].back}" style="stroke-width:.8"/>`, `<g data-part="poppet">${poppet()}</g>`, `<path class="iso-line" data-tone="hi" data-free="both" data-part="spring-front" d="${springs[0].front}" style="stroke-width:1"/>`, ends()],
});

const O = at([0, 0, 0]);
const EX = k.axisVector(P, [1, 0, 0]), EY = k.axisVector(P, [0, 1, 0]), EZ = k.axisVector(P, [0, 0, 1]);
const CSS = `
.cv-chamber{fill:#3e8fdd;opacity:0;transition:opacity .3s}
.cv-chamber[data-on]{opacity:.4}
.cv-flow{fill:none;stroke:#3e8fdd;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:3 4;opacity:0;transition:opacity .25s}
.cv-flow[data-on]{opacity:1;animation:cv-air .6s linear infinite}
.cv-lamp{fill:var(--anatomy-paper);stroke:var(--anatomy-mid);stroke-width:.5}
.cv-lamp[data-on]{fill:#3e8fdd;stroke:#1f5fa0}
.cv-hose-body{fill:none;stroke:var(--anatomy-mid);stroke-width:3.6;stroke-linecap:round;stroke-linejoin:round}
.cv-hose-core{fill:none;stroke:var(--anatomy-card);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.cv-hose-flow{fill:none;stroke:#3e8fdd;stroke-width:1.1;stroke-dasharray:2 5;opacity:0;transition:opacity .2s}
.cv-hose[data-flow] .cv-hose-flow{opacity:1;animation:cv-air .6s linear infinite}
.cv-hose[data-flow="rev"] .cv-hose-flow{animation-direction:reverse}
.cv-hose[data-flow="hold"] .cv-hose-flow{animation:none;stroke-dasharray:none;opacity:.55}
@keyframes cv-air{to{stroke-dashoffset:-14}}
.cv-stage{cursor:pointer;touch-action:manipulation}
@media (prefers-reduced-motion:reduce){.cv-flow,.cv-hose-flow{animation:none!important}}
`;
const live = `(() => {
const fig = document.currentScript.previousElementSibling;
const stage = fig.querySelector(".cv-stage"), svg = stage.querySelector("svg");
const $ = (s) => svg.querySelector(s);
const O = ${JSON.stringify(O)}, EX = ${JSON.stringify(EX)}, EY = ${JSON.stringify(EY)}, EZ = ${JSON.stringify(EZ)};
const SPRINGS = ${JSON.stringify(springs)}, STEPS = ${SPRING_STEPS}, CLOSED = ${CLOSED}, OPEN = ${OPEN}, SEAT = ${SEAT_X}, B0 = ${BORE.x}, B1 = ${BORE.x + BORE.w}, R = ${BORE.d / 2 - 0.4}, AX = ${AX};
const pop = $('[data-part="poppet"]'), sB = $('[data-part="spring-back"]'), sF = $('[data-part="spring-front"]'), flow = svg.querySelector(".cv-flow");
const up = $('[data-chamber="up"]'), down = $('[data-chamber="down"]'), lampIn = $('[data-lamp="in"]'), lampOut = $('[data-lamp="out"]'), hL = $('[data-hose="l"]'), hR = $('[data-hose="r"]');
const readout = fig.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const on = (n, v) => (v ? n.setAttribute("data-on", "") : n.removeAttribute("data-on"));
const pt = (x, y) => [O[0] + EX[0] * x + EY[0] * y + EZ[0] * (AX + 0.08), O[1] + EX[1] * x + EY[1] * y + EZ[1] * (AX + 0.08)];
const rect = (x0, x1) => "M" + [pt(x0, -R), pt(x1, -R), pt(x1, R), pt(x0, R)].map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L") + "Z";
up.setAttribute("d", rect(B0, SEAT - 3)); down.setAttribute("d", rect(SEAT, B1));
let forward = true, x = CLOSED, rate = 0, touring = !still.matches, clock = 0, idle = 0, visible = false, frame = 0, last = 0, lastStep = -1;
function draw() {
  pop.setAttribute("transform", "translate(" + (EX[0] * (x - CLOSED)).toFixed(2) + " " + (EX[1] * (x - CLOSED)).toFixed(2) + ")");
  const step = Math.max(0, Math.min(STEPS - 1, Math.round(((x - CLOSED) / (OPEN - CLOSED)) * (STEPS - 1))));
  if (step !== lastStep) { sB.setAttribute("d", SPRINGS[step].back); sF.setAttribute("d", SPRINGS[step].front); lastStep = step; }
  const open = x - CLOSED > 2;
  on(flow, forward && open); on(up, forward); on(down, !forward || open); on(lampIn, forward); on(lampOut, !forward);
  hL.dataset.flow = forward ? "fwd" : ""; hR.dataset.flow = forward ? (open ? "fwd" : "") : "hold";
  const text = forward ? (open ? "ลมไหลทางเดียวกับลูกศร · ลิ้นวาล์วเปิด · ลมผ่าน" : "ลมดันลิ้นวาล์ว…") : "ลมย้อนจากฝั่ง OUT · ลิ้นวาล์วปิดสนิท · ลมไม่ผ่าน";
  if (readout.textContent !== text) readout.textContent = text;
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60; last = now;
  if (touring) { clock += dt; forward = Math.floor(clock / 3.2) % 2 === 0; } else if ((idle += dt) > 7) { touring = !still.matches; clock = forward ? 0 : 3.2; }
  const target = forward ? OPEN : CLOSED;
  if (still.matches) { x = target; rate = 0; } else { for (let i = 0; i < 4; i++) { rate += ((target - x) * 900 - rate * 34) * dt / 4; x += rate * dt / 4; } if (x < CLOSED) { x = CLOSED; rate = 0; } }
  draw();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; visible ? run() : (cancelAnimationFrame(frame), (frame = 0)); }, { rootMargin: "80px 0px" }).observe(stage);
const toggle = () => { touring = false; idle = 0; forward = !forward; run(); };
stage.addEventListener("click", toggle);
stage.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } });
draw();
})();`;

const figure = k.plateHtml({
  fig: "Fig 1",
  title: "Check valve",
  hint: "คลิกเพื่อสลับทิศทางลม",
  readout: "ลมไหลทางเดียวกับลูกศร · ลิ้นวาล์วเปิด · ลมผ่าน",
  keys: [
    { mark: "lit", label: "ลิ้นวาล์ว (Poppet) กับสปริงดันปิด" },
    { mark: "blue", label: "ฝั่งที่มีแรงดันลม" },
  ],
  caption: "ภาพตัดเช็ควาล์วแบบลิ้นกรวย ลมที่ไหลเข้าทางเดียวกับลูกศรดันลิ้นวาล์วให้ยกออกจากบ่าวาล์ว ลมจึงไหลผ่านได้ เมื่อลมย้อนกลับจากฝั่ง OUT แรงดันกับสปริงช่วยกันกดลิ้นวาล์วแนบบ่า ลมจึงย้อนกลับไม่ได้",
  body: `<div class="iso-stage cv-stage" tabindex="0" role="button" aria-label="สลับทิศทางลมผ่านเช็ควาล์ว (กด Space)">${svg}</div>`,
});

const fragment = `<div class="iso cv-fig" data-theme="light"><style>${k.ISO_CSS}${CSS}</style>${figure}</div><script>${live}</script>`;
writeFileSync(join(HERE, "check-valve.fragment.html"), fragment);
writeFileSync(join(HERE, "check-valve.html"), `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Check valve</title><style>body{margin:0;background:#f2f2ef;padding:32px 16px}.cv-fig{max-width:740px;margin:0 auto}</style></head><body>${fragment}</body></html>`);
console.log("wrote", (fragment.length / 1024).toFixed(1) + " KB fragment");

if (process.argv.includes("--inject")) {
  const file = join(HERE, "../../../src/data/pages.json");
  const raw = readFileSync(file, "utf8");
  const pages = JSON.parse(raw);
  const page = pages.find((p) => p.route === "pneumatic-valves");
  const marked = /<!-- fig:check-valve -->[\s\S]*?<!-- \/fig:check-valve -->/;
  if (!page || !marked.test(page.html)) throw new Error("pneumatic-valves: figure marker not found");
  page.html = page.html.replace(marked, () => `<!-- fig:check-valve -->\n${fragment}\n<!-- /fig:check-valve -->`);
  writeFileSync(file, JSON.stringify(pages, null, 2) + (raw.endsWith("\n") ? "\n" : ""));
  console.log("injected into pneumatic-valves");
}
