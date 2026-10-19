// Fig: double-acting pneumatic cylinder (Ø40 bore, Ø16 rod), cut open along its axis.
// Air into port A fills the cap-end chamber and pushes the piston out; air into B pushes it back.
// `node scripts/figures/pneumatic-cylinder/build.mjs [--inject]`
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 660;
const HEIGHT = 360;

const PLATE = { x: -104, y: -26, w: 316, d: 84, r: 8 };
const PLATE_H = 8;
const FOOT_H = 4;

const AX = 15; // axis height = cut plane
const BODY = { x: -84, y: -15, w: 168, d: 30, r: 2 };
const BARREL = [-70, 70];
const BORE_R = 10;
const ROD_R = 4;
const PISTON_W = 10;
const REST = -54; // piston centre, retracted
const OUT = 34; // piston centre, extended
const ROD_LEN = 152; // from piston centre to rod tip
const FRONT = BODY.y + BODY.d;
const PORTS = [{ x: -77, name: "A" }, { x: 77, name: "B" }];
const PORT_Z = 8;

const WORK = { x: 112, y: -9, w: 16, d: 18, r: 1 };
const VALVE = { x: -26, y: 36, w: 34, d: 14, r: 2 };
const COIL = { x: -38, y: 35, w: 12, d: 16, r: 1.5 };

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [BODY.x, BODY.y, AX + 12], [WORK.x + WORK.w + (OUT - REST), 0, 18]],
  WIDTH,
  HEIGHT,
  { pad: 20, azimuth: 60, elevation: 32 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const poly = (pts) => k.pathOf(pts.map(at));
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const screws = (pts, z, r = 1.5) => L(pts.map(([x, y]) => k.ring(x, y, r, z, P, 14)).join(""), { tone: "lo" }) + D(pts.map(([x, y]) => at([x, y, z])), { size: 0.4 });
const topText = (x, y, z, text, size = 2.8, tone = "mid") => k.faceTextSvg(k.topMatrix([x, y], z, P, "x"), text, { size, tone, anchor: "middle" });
const halo = (plan, z, h) => `<path class="iso-halo" d="${k.haloOf(plan, z, h, P)}" style="filter:blur(3px)"/>`;
function bez(p0, c1, c2, p3, n = 24) { return Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [0, 1, 2].map((j) => u * u * u * p0[j] + 3 * u * u * t * c1[j] + 3 * u * t * t * c2[j] + t * t * t * p3[j]); }); }

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 16))) {
    out.push(S(k.cylinder(x, y, 6, -PLATE_H - FOOT_H, 1.4, P, 24), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 4.6, -PLATE_H - FOOT_H + 1.4, FOOT_H - 1.4, P, 24), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.2), { tone: "mid", inner: L(k.sideSeam(PLATE, -PLATE_H / 2, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "faint" }));
  out.push(screws(k.corners(PLATE, 8), 0));
  // stroke ruler in front of the rod
  const strip = { x: 82, y: 14, w: 120, d: 5, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const t = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.6, 0.6, [1.6, 3], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  return out.join("");
}

// body cut at the axis: feet, lower half of barrel and both end caps, bore trough on the cut face
function body() {
  const out = [halo(BODY, 0, AX)];
  for (const x of [BODY.x + 2, BODY.x + BODY.w - 12]) out.push(S(k.slabOf({ x, y: BODY.y - 3, w: 10, d: BODY.d + 6, r: 1 }, 0, 3, P, 2, 0.4), { tone: "lo" }));
  const capA = { x: BODY.x, y: BODY.y, w: 14, d: BODY.d, r: 2 };
  const capB = { x: BARREL[1], y: BODY.y, w: 14, d: BODY.d, r: 2 };
  const barrel = { x: BARREL[0], y: BODY.y + 1.5, w: BARREL[1] - BARREL[0], d: BODY.d - 3, r: 1 };
  out.push(S(k.slabOf(barrel, 3, AX - 3, P, 2, 0.4), { tone: "hi", crease: "lo", inner: L(k.sideSeam(barrel, 8, P, 2), { tone: "faint" }) }));
  out.push(S(k.slabOf(capA, 3, AX - 3, P, 2, 0.5), { tone: "mid" }));
  out.push(S(k.slabOf(capB, 3, AX - 3, P, 2, 0.5), { tone: "mid" }));
  // cut faces: bore, rod bore through cap B, air passages from the ports
  out.push(S(k.slabOf({ x: BARREL[0], y: -BORE_R, w: BARREL[1] - BARREL[0], d: 2 * BORE_R, r: 0.5 }, AX - 0.01, 0.01, P, 2), { tone: "lo", flat: true, crease: "none" }));
  out.push(L(k.planOutline({ x: BARREL[0], y: -BORE_R, w: BARREL[1] - BARREL[0], d: 2 * BORE_R, r: 0.5 }, AX, P, 2), { tone: "lo" }));
  out.push(S(k.slabOf({ x: BARREL[1], y: -ROD_R - 0.6, w: 14, d: 2 * ROD_R + 1.2, r: 0.3 }, AX - 0.01, 0.01, P, 2), { tone: "lo", flat: true, crease: "none" }));
  for (const p of PORTS) {
    const x0 = p.x < 0 ? p.x - 2 : p.x - 2;
    out.push(S(k.slabOf({ x: x0, y: p.x < 0 ? -BORE_R + 4 : ROD_R + 0.6, w: 4, d: FRONT - (p.x < 0 ? -BORE_R + 4 : ROD_R + 0.6), r: 0.3 }, AX - 0.01, 0.01, P, 2), { tone: "lo", flat: true, crease: "none" }));
    out.push(topText(p.x, BODY.y + 4, AX, p.name, 3.4, "hi"));
  }
  // rod seal and wiper in cap B, cushion rings
  out.push(L(k.lineOnTop([BARREL[1] + 4, -ROD_R - 0.6], [BARREL[1] + 4, ROD_R + 0.6], AX, P) + k.lineOnTop([BARREL[1] + 11, -ROD_R - 0.6], [BARREL[1] + 11, ROD_R + 0.6], AX, P), { tone: "hi" }));
  // tie-rod bolt heads on the caps' cut faces
  out.push(D([[BODY.x + 4, BODY.y + 4], [BODY.x + 10, BODY.y + BODY.d - 4], [BARREL[1] + 4, BODY.y + 4], [BARREL[1] + 10, BODY.y + BODY.d - 4]].map(([x, y]) => at([x, y, AX])), { size: 0.5 }));
  return out.join("");
}

// chamber fills: drawn live on the bore floor, between cap and piston
const chamber = (name) => `<path class="pc-chamber" data-chamber="${name}" d=""/>`;

// piston + rod, built at rest and slid along x
const F = G.frameAlong([REST, 0, AX], [1, 0, 0]);
function piston() {
  const out = [];
  out.push(S(G.disc(PISTON_W / 2, ROD_LEN, ROD_R, F, P), { tone: "hi", crease: "none", lit: true }));
  out.push(S(G.disc(-PISTON_W / 2, PISTON_W / 2, BORE_R - 0.4, F, P), { tone: "hi", crease: "lo" }));
  for (const s of [-PISTON_W / 2 + 1.6, PISTON_W / 2 - 1.6]) out.push(S(G.disc(s - 0.8, s + 0.8, BORE_R - 0.1, F, P), { tone: "lo", crease: "none" }));
  out.push(S(G.disc(-0.6, 0.6, BORE_R - 0.25, F, P), { tone: "mid", crease: "none" })); // magnet band
  out.push(S(G.disc(ROD_LEN, ROD_LEN + 5, 5.4, F, P), { tone: "mid" })); // rod-end nut
  return out.join("");
}
function fittings() {
  const out = [];
  for (const p of PORTS) {
    const Fp = G.frameAlong([p.x, FRONT, PORT_Z], [0, 1, 0]);
    out.push(S(G.disc(0, 2.6, 3.8, Fp, P), { tone: "mid" }), S(G.disc(2.6, 5.4, 3, Fp, P), { tone: "lo" }));
  }
  return out.join("");
}
function workpiece() {
  return halo(WORK, 0, 0.1) + S(k.slabOf(WORK, 0, 18, P, 2, 0.5), { tone: "mid", inner: L(k.planOutline(k.insetPlan(WORK, 2.6), 18, P, 2), { tone: "faint" }) });
}
function valve() {
  const out = [halo({ x: COIL.x, y: VALVE.y - 1, w: VALVE.x + VALVE.w - COIL.x, d: VALVE.d + 2, r: 2 }, 0, 18)];
  out.push(`<g class="pc-coil" data-part="coil">${S(k.slabOf(COIL, 0, 20, P, 2, 0.5), { tone: "hi", crease: "lo", inner: L(k.sideSeam(COIL, 16, P, 2), { tone: "faint" }) })}</g>`);
  out.push(S(k.slabOf(VALVE, 0, 13, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(VALVE, 4, P, 3), { tone: "faint" }) }));
  out.push(screws([[VALVE.x + 3, VALVE.y + 3], [VALVE.x + VALVE.w - 3, VALVE.y + VALVE.d - 3]], 13, 1.1));
  for (const x of [VALVE.x + 12, VALVE.x + 24]) out.push(S(k.cylinder(x, VALVE.y + 7, 2.6, 13, 2, P, 18), { tone: "mid" }), S(k.cylinder(x, VALVE.y + 7, 2, 15, 2.4, P, 18), { tone: "lo" }));
  out.push(topText(VALVE.x + 12, VALVE.y + 12, 13, "A", 2.6), topText(VALVE.x + 24, VALVE.y + 12, 13, "B", 2.6));
  out.push(S(k.slabOf({ x: COIL.x + 2, y: COIL.y + 3, w: 8, d: 10, r: 1.2 }, 20, 4, P, 2, 0.3), { tone: "mid" }));
  return out.join("");
}
const hose = (pts, name) => { const d = poly(pts); return `<g class="pc-hose" data-hose="${name}"><path class="pc-hose-body" d="${d}"/><path class="pc-hose-core" d="${d}"/><path class="pc-hose-flow" d="${d}"/></g>`; };
const tip = (x) => [x, FRONT + 5.4, PORT_Z];
const hoses = () => [
  hose(bez([VALVE.x + 12, VALVE.y + 7, 17.4], [VALVE.x + 12, VALVE.y + 7, 30], [-77, FRONT + 22, PORT_Z + 4], tip(-77)), "a"),
  hose(bez([VALVE.x + 24, VALVE.y + 7, 17.4], [VALVE.x + 24, VALVE.y + 7, 34], [77, FRONT + 22, PORT_Z + 4], tip(77)), "b"),
].join("");

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A double-acting pneumatic cylinder, cut open along its axis to show the piston, its seals and the rod. A 5/2 valve in front sends air into port A, filling the chamber behind the piston and pushing the rod out against a block, or into port B, filling the rod-side chamber and pulling the rod back in.",
  body: [plate(), `<g data-part="work">${workpiece()}</g>`, body(), chamber("cap"), chamber("rod"), `<g data-part="piston">${piston()}</g>`, fittings(), valve(), hoses()],
});

const O = at([0, 0, 0]);
const EX = k.axisVector(P, [1, 0, 0]), EY = k.axisVector(P, [0, 1, 0]);
const CSS = `
.pc-chamber{fill:#3e8fdd;opacity:0;transition:opacity .25s}
.pc-chamber[data-state="in"]{opacity:.42}
.pc-chamber[data-state="out"]{fill:var(--anatomy-mid);opacity:.18}
.pc-coil .iso-shade,.pc-coil .iso-top{transition:fill .25s}
.pc-coil[data-on] .iso-shade{fill:#f6d58c}.pc-coil[data-on] .iso-top{fill:#fae6b8}
.pc-hose-body{fill:none;stroke:var(--anatomy-mid);stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}
.pc-hose-core{fill:none;stroke:var(--anatomy-card);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.pc-hose-flow{fill:none;stroke:#3e8fdd;stroke-width:1.1;stroke-dasharray:2 5;opacity:0;transition:opacity .2s}
.pc-hose[data-flow="in"] .pc-hose-flow{opacity:1;animation:pc-air .6s linear infinite}
.pc-hose[data-flow="out"] .pc-hose-flow{opacity:.6;stroke:var(--anatomy-mid);animation:pc-air .6s linear infinite reverse}
@keyframes pc-air{to{stroke-dashoffset:-14}}
.pc-stage{cursor:pointer;touch-action:manipulation}
@media (prefers-reduced-motion:reduce){.pc-hose-flow{animation:none!important}}
`;
const live = `(() => {
const fig = document.currentScript.previousElementSibling;
const stage = fig.querySelector(".pc-stage"), svg = stage.querySelector("svg");
const $ = (s) => svg.querySelector(s);
const O = ${JSON.stringify(O)}, EX = ${JSON.stringify(EX)}, EY = ${JSON.stringify(EY)}, Z = ${JSON.stringify(k.axisVector(P, [0, 0, 1]))};
const REST = ${REST}, OUT = ${OUT}, PW = ${PISTON_W / 2}, B0 = ${BARREL[0]}, B1 = ${BARREL[1]}, R = ${BORE_R - 0.6}, AX = ${AX};
const TIP0 = ${REST + ROD_LEN + 5}, WORK_X = ${WORK.x};
const piston = $('[data-part="piston"]'), work = $('[data-part="work"]'), coil = $('[data-part="coil"]');
const cap = $('[data-chamber="cap"]'), rodC = $('[data-chamber="rod"]'), hA = $('[data-hose="a"]'), hB = $('[data-hose="b"]');
const readout = fig.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const pt = (x, y) => [O[0] + EX[0] * x + EY[0] * y + Z[0] * (AX + 0.1), O[1] + EX[1] * x + EY[1] * y + Z[1] * (AX + 0.1)];
const rect = (x0, x1) => x1 - x0 < 0.2 ? "" : "M" + [pt(x0, -R), pt(x1, -R), pt(x1, R), pt(x0, R)].map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L") + "Z";
const mv = (s) => "translate(" + (EX[0] * s).toFixed(2) + " " + (EX[1] * s).toFixed(2) + ")";
let extend = false, x = REST, touring = !still.matches, clock = 0, idle = 0, visible = false, frame = 0, last = 0;
function draw() {
  piston.setAttribute("transform", mv(x - REST));
  cap.setAttribute("d", rect(B0, x - PW)); rodC.setAttribute("d", rect(x + PW, B1));
  const moving = Math.abs(x - (extend ? OUT : REST)) > 0.5;
  cap.dataset.state = extend ? "in" : moving ? "out" : ""; rodC.dataset.state = extend ? (moving ? "out" : "") : "in";
  hA.dataset.flow = moving ? (extend ? "in" : "out") : ""; hB.dataset.flow = moving ? (extend ? "out" : "in") : "";
  extend ? coil.setAttribute("data-on", "") : coil.removeAttribute("data-on");
  const tipX = TIP0 + (x - REST);
  work.setAttribute("transform", mv(Math.max(0, tipX - WORK_X)));
  const stroke = Math.round(((x - REST) / (OUT - REST)) * 100);
  const text = (extend ? "ลมเข้า A → ยืดออก · แรงดัน ≈ 754 N" : "ลมเข้า B → หดกลับ · แรงดึง ≈ 633 N") + " · ระยะชัก " + stroke + "%";
  if (readout.textContent !== text) readout.textContent = text;
}
function tick(t) {
  const dt = last ? Math.min((t - last) / 1000, 1 / 20) : 1 / 60; last = t;
  if (touring) { clock += dt; extend = Math.floor(clock / 3) % 2 === 1; } else if ((idle += dt) > 7) { touring = !still.matches; clock = extend ? 3 : 0; }
  const target = extend ? OUT : REST, speed = 70;
  x = still.matches ? target : x + Math.sign(target - x) * Math.min(Math.abs(target - x), speed * dt * Math.min(1, 0.25 + Math.abs(target - x) / 12));
  draw();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; visible ? run() : (cancelAnimationFrame(frame), (frame = 0)); }, { rootMargin: "80px 0px" }).observe(stage);
const toggle = () => { touring = false; idle = 0; extend = !extend; run(); };
stage.addEventListener("click", toggle);
stage.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } });
draw();
})();`;

const figure = k.plateHtml({
  fig: "Fig 1",
  title: "Double-acting cylinder",
  hint: "คลิกที่ภาพเพื่อสลับทางลม",
  readout: "ลมเข้า B → หดกลับ · แรงดึง ≈ 633 N · ระยะชัก 0%",
  keys: [
    { mark: "lit", label: "ก้านสูบ (Rod) ต่อกับลูกสูบ" },
    { mark: "blue", label: "ห้องที่มีลมอัดดันลูกสูบ" },
    { mark: "dim", label: "ห้องที่กำลังระบายลมออก" },
  ],
  caption: "ภาพตัดกระบอกลมสองทาง ขนาดกระบอก Ø40 มม. ก้าน Ø16 มม. ที่แรงดัน 6 bar ลมเข้าพอร์ต A ดันลูกสูบออกด้วยแรงประมาณ 754 N ส่วนขากลับ ลมเข้าพอร์ต B ได้แรงน้อยกว่า (ประมาณ 633 N) เพราะพื้นที่ฝั่งก้านสูบถูกก้านกินไปบางส่วน",
  body: `<div class="iso-stage pc-stage" tabindex="0" role="button" aria-label="สลับทางลมของกระบอกลม (กด Space)">${svg}</div>`,
});

const fragment = `<div class="iso pc-fig" data-theme="light"><style>${k.ISO_CSS}${CSS}</style>${figure}</div><script>${live}</script>`;
writeFileSync(join(HERE, "pneumatic-cylinder.fragment.html"), fragment);
writeFileSync(join(HERE, "pneumatic-cylinder.html"), `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pneumatic cylinder</title><style>body{margin:0;background:#f2f2ef;padding:32px 16px}.pc-fig{max-width:760px;margin:0 auto}</style></head><body>${fragment}</body></html>`);
console.log("wrote", (fragment.length / 1024).toFixed(1) + " KB fragment");

if (process.argv.includes("--inject")) {
  const file = join(HERE, "../../../src/data/pages.json");
  const raw = readFileSync(file, "utf8");
  const pages = JSON.parse(raw);
  const page = pages.find((p) => p.route === "pneumatic-cylinder");
  const marked = /<!-- fig:pneumatic-cylinder -->[\s\S]*?<!-- \/fig:pneumatic-cylinder -->/;
  if (!page || !marked.test(page.html)) throw new Error("pneumatic-cylinder: figure marker not found");
  page.html = page.html.replace(marked, () => `<!-- fig:pneumatic-cylinder -->\n${fragment}\n<!-- /fig:pneumatic-cylinder -->`);
  writeFileSync(file, JSON.stringify(pages, null, 2) + (raw.endsWith("\n") ? "\n" : ""));
  console.log("injected into pneumatic-cylinder");
}
