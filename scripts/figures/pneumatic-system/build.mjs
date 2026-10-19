// Fig: a pneumatic system end to end, numbered like the article's five steps —
// ① compressor + receiver → ② aftercooler/dryer → ③ FRL → ④ solenoid valve → ⑤ cylinder.
// `node scripts/figures/pneumatic-system/build.mjs [--inject]`
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 660;
const HEIGHT = 300;

const PLATE = { x: -214, y: -34, w: 430, d: 76, r: 8 };
const PLATE_H = 8;
const FOOT_H = 4;
const HOSE_Z = 9;
const TAG_Y = 30;

// ① compressor: receiver tank + pump on a skid
const TANK = [-186, -6];
const TANK_R = 13;
const TANK_TOP = 46;
const PUMP = { x: -168, y: -16, w: 24, d: 22, r: 2 };
const PUMP_H = 16;
const HEAD = { x: -163, y: -12, w: 14, d: 14, r: 1.5 };
// ② aftercooler / dryer
const DRY = { x: -122, y: -18, w: 30, d: 28, r: 2 };
const DRY_H = 34;
// ③ FRL
const FRL_X = -50;
const BOWL_R = 6;
const REG = { x: FRL_X + 10, y: -10, w: 16, d: 16, r: 2 };
const FILT = [FRL_X, -2];
// ④ solenoid valve on a sub-base
const VB = { x: 14, y: -14, w: 38, d: 18, r: 2 };
const COIL = { x: 2, y: -15, w: 13, d: 20, r: 1.5 };
// ⑤ cylinder
const CYL = { x: 92, y: -12, w: 64, d: 20, r: 2 };
const CYL_Z = 4;
const CYL_H = 20;
const AXIS = [CYL.y + CYL.d / 2, CYL_Z + CYL_H / 2];
const STROKE = 24;
const WORK = { x: CYL.x + CYL.w + 12, y: AXIS[0] - 8, w: 14, d: 16, r: 1 };

const STATIONS = [-180, -107, -42, 26, 124];

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [TANK[0], TANK[1], TANK_TOP + 10], [WORK.x + WORK.w + STROKE, WORK.y, 16]],
  WIDTH,
  HEIGHT,
  { pad: 18, azimuth: 66, elevation: 30 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const poly = (pts) => k.pathOf(pts.map(at));
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const screws = (pts, z, r = 1.5) => L(pts.map(([x, y]) => k.ring(x, y, r, z, P, 14)).join(""), { tone: "lo" }) + D(pts.map(([x, y]) => at([x, y, z])), { size: 0.4 });
const topText = (x, y, z, text, size = 2.6, tone = "mid") => k.faceTextSvg(k.topMatrix([x, y], z, P, "x"), text, { size, tone, anchor: "middle" });
const halo = (plan, z, h) => `<path class="iso-halo" d="${k.haloOf(plan, z, h, P)}" style="filter:blur(3px)"/>`;
// a gauge lying face-up: bezel, dial, ticks; the needle is a live path
function gauge(cx, cy, z, r, name) {
  const out = [S(k.cylinder(cx, cy, r, z, 2.2, P, 32, 0.4), { tone: "mid" })];
  out.push(L(k.ring(cx, cy, r - 1.2, z + 2.2, P, 32), { tone: "lo" }));
  const t = k.radialTicks(cx, cy, r - 1.6, 10, 5, z + 2.2, [0.9, 1.7], P, -Math.PI * 0.75, Math.PI * 1.5);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  out.push(`<path class="iso-line" data-tone="lit" data-free="end" data-needle="${name}" d="" style="stroke-width:1"/>`);
  out.push(D([at([cx, cy, z + 2.3])], { size: 0.7 }));
  return out.join("");
}
const needle = (cx, cy, z, r, share) => {
  const a = -Math.PI * 0.75 + share * Math.PI * 1.5;
  return k.lineOnTop([cx, cy], [cx + Math.sin(a) * (r - 2.4), cy - Math.cos(a) * (r - 2.4)], z + 2.3, P);
};
const GAUGES = { tank: [TANK[0], TANK[1], TANK_TOP, 6.4], reg: [REG.x + REG.w / 2, REG.y + REG.d / 2, 30, 5.4] };

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 16))) {
    out.push(S(k.cylinder(x, y, 6, -PLATE_H - FOOT_H, 1.4, P, 24), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 4.6, -PLATE_H - FOOT_H + 1.4, FOOT_H - 1.4, P, 24), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.2), { tone: "mid", inner: L(k.sideSeam(PLATE, -PLATE_H / 2, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "faint" }));
  out.push(screws(k.corners(PLATE, 8), 0));
  // numbered step tags along the front edge
  STATIONS.forEach((x, i) => {
    out.push(`<g class="ps-tag" data-tag="${i}">${S(k.cylinder(x, TAG_Y, 7, 0, 0.8, P, 32), { tone: "lo", crease: "none" })}${topText(x, TAG_Y + 2, 0.8, String(i + 1), 6, "hi")}</g>`);
  });
  return out.join("");
}

function compressor() {
  const out = [halo({ x: TANK[0] - TANK_R, y: TANK[1] - TANK_R, w: 2 * TANK_R, d: 2 * TANK_R, r: TANK_R }, 0, TANK_TOP)];
  for (const [dx, dy] of byDepth([[-8, -8], [8, -8], [-8, 8], [8, 8]])) out.push(S(k.slabOf({ x: TANK[0] + dx - 2, y: TANK[1] + dy - 2, w: 4, d: 4, r: 0.6 }, 0, 5, P, 2), { tone: "lo" }));
  const F = G.frameAlong([TANK[0], TANK[1], 5], [0, 0, 1]);
  out.push(S(G.solidOf([[0, 0], [0, TANK_R - 4, 1], [2.4, TANK_R - 0.6, 1], [4, TANK_R], [TANK_TOP - 9, TANK_R], [TANK_TOP - 7.4, TANK_R - 0.6, 1], [TANK_TOP - 5, TANK_R - 4, 1], [TANK_TOP - 5, 0]], F, P), { tone: "hi", crease: "lo", inner: L(G.arcOf(F, 14, TANK_R, P) + G.arcOf(F, 28, TANK_R, P), { tone: "faint" }) }));
  out.push(gauge(...GAUGES.tank.slice(0, 3), GAUGES.tank[3], "tank"));
  // pump skid, motor and finned head
  out.push(halo(PUMP, 0, PUMP_H));
  out.push(S(k.slabOf(PUMP, 0, PUMP_H, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(PUMP, 4, P, 3), { tone: "faint" }) }));
  for (let i = 0; i < 4; i++) out.push(S(k.slabOf(k.insetPlan(HEAD, i % 2 ? 1.2 : -0.6), PUMP_H + i * 2.6, 2.2, P, 2, 0.3), { tone: i % 2 ? "mid" : "hi", crease: "none" }));
  out.push(`<g data-part="piston">${S(k.cylinder(HEAD.x + HEAD.w / 2, HEAD.y + HEAD.d / 2, 2.6, PUMP_H + 10.4, 4, P, 18), { tone: "hi", lit: true })}</g>`);
  out.push(S(k.slabOf({ x: HEAD.x + 1, y: HEAD.y + 1, w: HEAD.w - 2, d: HEAD.d - 2, r: 1 }, PUMP_H + 10.4, 1.6, P, 2, 0.3), { tone: "mid" }));
  return out.join("");
}
function dryer() {
  const out = [halo(DRY, 0, DRY_H)];
  out.push(S(k.slabOf(DRY, 0, DRY_H, P, 3, 0.8), { tone: "hi", crease: "lo", inner: L(k.sideSeam(DRY, 5, P, 3), { tone: "faint" }) }));
  let v = "";
  for (let y = DRY.y + 5; y <= DRY.y + DRY.d - 6; y += 3.4) v += k.planOutline({ x: DRY.x + 5, y, w: DRY.w - 10, d: 1.4, r: 0.7 }, DRY_H, P, 2);
  out.push(L(v, { tone: "lo" }));
  out.push(screws(k.corners(DRY, 2.6), DRY_H, 1));
  // drain valve on a short leg at the front, with a drip tray
  const dx = DRY.x + DRY.w - 6, dy = DRY.y + DRY.d;
  out.push(S(k.slabOf({ x: DRY.x + DRY.w - 16, y: dy + 1, w: 18, d: 10, r: 1.5 }, 0, 1.4, P, 2), { tone: "lo" }));
  const Fd = G.frameAlong([dx, dy, 9], [0, 1, 0]);
  out.push(S(G.disc(0, 4, 2.2, Fd, P), { tone: "mid" }));
  out.push(`<g data-part="drops">${[0, 1, 2].map((i) => { const [x, y] = at([dx, dy + 4.4, 7]); return `<circle class="ps-drop" data-drop="${i}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.1"/>`; }).join("")}</g>`);
  return out.join("");
}
function frl() {
  const out = [];
  const [fx, fy] = FILT;
  out.push(S(k.slabOf({ x: fx - 8, y: fy - 8, w: REG.x + REG.w - fx + 10, d: 16, r: 1.5 }, 0, 2, P, 2), { tone: "lo" }));
  // filter: head block, clear bowl with a float, drain knob
  const F = G.frameAlong([fx, fy, 2], [0, 0, 1]);
  out.push(S(G.solidOf([[0, 1.6], [2, 1.6], [2.6, BOWL_R - 1, 1], [4, BOWL_R, 1], [16, BOWL_R], [18, BOWL_R + 0.8]], F, P), { tone: "hi", crease: "faint", inner: L(G.arcOf(F, 7, BOWL_R, P), { tone: "faint" }) }));
  out.push(`<g data-part="water">${S(G.solidOf([[4, BOWL_R - 0.6], [6.6, BOWL_R - 0.6]], F, P), { tone: "lo", crease: "none" })}</g>`);
  out.push(S(k.slabOf({ x: fx - 8, y: fy - 8, w: 16, d: 16, r: 1.5 }, 20, 10, P, 2, 0.5), { tone: "mid" }));
  // regulator with gauge and adjusting knob
  out.push(S(k.slabOf(REG, 6, 24, P, 2, 0.5), { tone: "mid", inner: L(k.sideSeam(REG, 18, P, 2), { tone: "faint" }) }));
  out.push(S(k.cylinder(REG.x + REG.w / 2, REG.y + REG.d / 2, 4.2, 2, 4, P, 24), { tone: "lo" }));
  out.push(L(k.knurl(REG.x + REG.w / 2, REG.y + REG.d / 2, 4.2, 2, 6, 22, P), { tone: "mid" }));
  out.push(gauge(...GAUGES.reg.slice(0, 3), GAUGES.reg[3], "reg"));
  return out.join("");
}
function valve() {
  const out = [halo({ x: COIL.x, y: VB.y - 2, w: VB.x + VB.w - COIL.x + 2, d: VB.d + 4, r: 2 }, 0, 20)];
  out.push(S(k.slabOf({ x: COIL.x - 1, y: VB.y - 2, w: VB.x + VB.w - COIL.x + 3, d: VB.d + 4, r: 1.5 }, 0, 6, P, 2, 0.5), { tone: "mid" }));
  out.push(`<g class="ps-coil" data-part="coil">${S(k.slabOf(COIL, 6, 22, P, 2, 0.5), { tone: "hi", crease: "lo", inner: L(k.sideSeam(COIL, 22, P, 2), { tone: "faint" }) })}</g>`);
  out.push(S(k.slabOf(VB, 6, 13, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(VB, 9, P, 3), { tone: "faint" }) }));
  out.push(S(k.slabOf({ x: COIL.x + 2, y: COIL.y + 4, w: 9, d: 10, r: 1.4 }, 28, 5, P, 2, 0.4), { tone: "mid" }));
  const [lx, ly] = at([COIL.x + 9, COIL.y + 14, 30.5]);
  out.push(`<circle class="ps-led" data-led="coil" cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="1.2"/>`);
  for (const x of [VB.x + 14, VB.x + 26]) out.push(S(k.cylinder(x, VB.y + 9, 2.6, 19, 2, P, 18), { tone: "mid" }), S(k.cylinder(x, VB.y + 9, 2, 21, 2.4, P, 18), { tone: "lo" }));
  for (const x of [VB.x + 8, VB.x + 32]) { const F = G.frameAlong([x, VB.y + VB.d, 10], [0, 1, 0]); out.push(S(G.disc(0, 5, 2.2, F, P), { tone: "lo", inner: L(G.ribsOf(F, 0.4, 4.6, 2.2, 10, P), { tone: "faint" }) })); }
  return out.join("");
}
const CF = G.frameAlong([CYL.x + CYL.w, AXIS[0], AXIS[1]], [1, 0, 0]);
const ROD = G.rodOut(CF, 0, 4, 2.6, P, { stroke: STROKE });
function cylinder() {
  const out = [halo(CYL, 0, CYL_Z + CYL_H)];
  for (const x of [CYL.x + 2, CYL.x + CYL.w - 10]) out.push(S(k.slabOf({ x, y: CYL.y - 2, w: 8, d: CYL.d + 4, r: 1 }, 0, CYL_Z, P, 2, 0.4), { tone: "lo" }));
  const caps = [{ x: CYL.x, y: CYL.y - 1, w: 6, d: CYL.d + 2, r: 1.5 }, { x: CYL.x + CYL.w - 6, y: CYL.y - 1, w: 6, d: CYL.d + 2, r: 1.5 }];
  out.push(S(k.slabOf(caps[0], CYL_Z - 1, CYL_H + 2, P, 3, 0.5), { tone: "mid" }));
  out.push(S(k.slabOf({ x: CYL.x + 6, y: CYL.y + 1, w: CYL.w - 12, d: CYL.d - 2, r: 3 }, CYL_Z + 1, CYL_H - 2, P, 6, 0.6), { tone: "hi", crease: "lo" }));
  out.push(S(k.slabOf(caps[1], CYL_Z - 1, CYL_H + 2, P, 3, 0.5), { tone: "mid" }));
  for (const c of caps) out.push(D(k.corners(c, 1.8).map(([x, y]) => at([x, y, CYL_Z + CYL_H + 1])), { size: 0.5 }));
  for (const x of [CYL.x + 10, CYL.x + CYL.w - 10]) out.push(S(k.cylinder(x, AXIS[0], 2.6, CYL_Z + CYL_H + 1, 2, P, 18), { tone: "mid" }), S(k.cylinder(x, AXIS[0], 2, CYL_Z + CYL_H + 3, 2.4, P, 18), { tone: "lo" }));
  return out.join("");
}
const rod = () => `<clipPath id="ps-rod-clip"><path data-hold d="${ROD.clip}"/></clipPath><g clip-path="url(#ps-rod-clip)">${S(ROD.paths, { tone: "hi", crease: "none" })}</g>${S(G.disc(4, 8, 4.2, CF, P), { tone: "mid" })}`;
const gland = () => S(G.disc(-0.01, 1.2, 4.2, CF, P), { tone: "mid" });
const work = () => halo(WORK, 0, 0.1) + S(k.slabOf(WORK, 0, 14, P, 2, 0.5), { tone: "hi", lit: true, inner: L(k.planOutline(k.insetPlan(WORK, 2.4), 14, P, 2), { tone: "faint" }) });

// ── air line: one hose per hop, each with its own flow overlay ──
function bez(p0, c1, c2, p3, n = 20) { return Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [0, 1, 2].map((j) => u * u * u * p0[j] + 3 * u * u * t * c1[j] + 3 * u * t * t * c2[j] + t * t * t * p3[j]); }); }
const HOPS = [
  bez([TANK[0] + 4, TANK[1] + 6, TANK_TOP - 6], [TANK[0] + 22, TANK[1] + 8, TANK_TOP - 2], [DRY.x - 10, -4, 30], [DRY.x, -4, 24]),
  bez([DRY.x + DRY.w, -4, 24], [DRY.x + DRY.w + 14, -4, 24], [FILT[0] - 18, FILT[1], 25], [FILT[0] - 8, FILT[1], 25]),
  bez([REG.x + REG.w, REG.y + REG.d / 2, 14], [REG.x + REG.w + 10, REG.y + REG.d / 2, 14], [VB.x - 22, VB.y + VB.d + 8, 3], [VB.x, VB.y + VB.d + 4, 3]),
  bez([VB.x + 14, VB.y + 9, 23.4], [VB.x + 14, VB.y + 9, 40], [CYL.x + 10, AXIS[0], 44], [CYL.x + 10, AXIS[0], CYL_Z + CYL_H + 5.4]),
];
const RETURN = bez([VB.x + 26, VB.y + 9, 23.4], [VB.x + 26, VB.y + 9, 34], [CYL.x + CYL.w - 10, AXIS[0], 40], [CYL.x + CYL.w - 10, AXIS[0], CYL_Z + CYL_H + 5.4]);
const hose = (pts, name) => { const d = poly(pts); return `<g class="ps-hose" data-hose="${name}"><path class="ps-hose-body" d="${d}"/><path class="ps-hose-core" d="${d}"/><path class="ps-hose-flow" d="${d}"/></g>`; };

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A pneumatic system on one plate, numbered 1 to 5: a compressor fills a receiver tank to about 7 bar; an aftercooler and dryer drain the condensed water; a filter-regulator steps the pressure down to 6 bar; a solenoid valve switches the air; and a cylinder pushes a workpiece.",
  body: [
    plate(),
    `<g data-station="0">${compressor()}</g>`,
    hose(HOPS[0], "0"),
    `<g data-station="1">${dryer()}</g>`,
    hose(HOPS[1], "1"),
    `<g data-station="2">${frl()}</g>`,
    hose(HOPS[2], "2"),
    `<g data-station="3">${valve()}</g>`,
    `<g data-station="4">${cylinder()}<g data-part="rod">${rod()}</g>${gland()}</g>`,
    `<g data-part="work">${work()}</g>`,
    hose(RETURN, "r"),
    hose(HOPS[3], "3"),
  ],
});

const VX = k.axisVector(P, [1, 0, 0]);
const VZ = k.axisVector(P, [0, 0, 1]);
const dropPath = (() => { const a = at([0, 0, 0]), b = at([0, 0, -6]); return [b[0] - a[0], b[1] - a[1]]; })();
const NEEDLES = Object.fromEntries(Object.entries(GAUGES).map(([n, g]) => [n, Array.from({ length: 41 }, (_, i) => needle(g[0], g[1], g[2], g[3], i / 40))]));

const CSS = `
.ps-tag .iso-top{transition:fill .25s}
.ps-tag[data-on] .iso-top{fill:var(--anatomy-lit)}
.ps-tag[data-on] text{fill:var(--anatomy-card)}
.ps-led{fill:var(--anatomy-paper);stroke:var(--anatomy-mid);stroke-width:.5}
.ps-led[data-on]{fill:#f2b33d;stroke:#b07a12}
.ps-coil .iso-shade,.ps-coil .iso-top{transition:fill .25s}
.ps-coil[data-on] .iso-shade{fill:#f6d58c}.ps-coil[data-on] .iso-top{fill:#fae6b8}
.ps-drop{fill:#3e8fdd;opacity:0}
.ps-hose-body{fill:none;stroke:var(--anatomy-mid);stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}
.ps-hose-core{fill:none;stroke:var(--anatomy-card);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ps-hose-flow{fill:none;stroke:#3e8fdd;stroke-width:1.1;stroke-dasharray:2 5;opacity:0;transition:opacity .3s}
.ps-hose[data-flow] .ps-hose-flow{opacity:1;animation:ps-air .6s linear infinite}
.ps-hose[data-flow="out"] .ps-hose-flow{stroke:var(--anatomy-mid);animation-direction:reverse}
[data-station]{transition:opacity .3s}

.ps-stage{cursor:pointer;touch-action:manipulation}
@keyframes ps-air{to{stroke-dashoffset:-14}}
@media (prefers-reduced-motion:reduce){.ps-hose-flow{animation:none!important}}
`;

const STEPS = [
  "① เครื่องอัดลมอัดอากาศเก็บในถัง · 7 bar",
  "② Aftercooler + เครื่องทำลมแห้ง ระบายน้ำทิ้ง",
  "③ ชุด FRL กรองซ้ำ ปรับแรงดันเหลือ 6 bar",
  "④ โซลินอยด์วาล์วรับสัญญาณไฟ เปลี่ยนทางลม",
  "⑤ กระบอกลมยืดออก ดันชิ้นงาน",
];
const live = `(() => {
const fig = document.currentScript.previousElementSibling;
const stage = fig.querySelector(".ps-stage"), svg = stage.querySelector("svg");
const $ = (s) => svg.querySelector(s), $$ = (s) => [...svg.querySelectorAll(s)];
const VX = ${JSON.stringify(VX)}, VZ = ${JSON.stringify(VZ)}, DROP = ${JSON.stringify(dropPath)}, STROKE = ${STROKE};
const NEEDLES = ${JSON.stringify(NEEDLES)};
const STEPS = ${JSON.stringify(STEPS)};
const tags = $$("[data-tag]"), stations = $$("[data-station]"), hoses = {}; $$("[data-hose]").forEach((n) => (hoses[n.dataset.hose] = n));
const piston = $('[data-part="piston"]'), rod = $('[data-part="rod"]'), clip = $("#ps-rod-clip path"), work = $('[data-part="work"]');
const coil = $('[data-part="coil"]'), led = $('[data-led="coil"]'), drops = $$("[data-drop]");
const needles = { tank: $('[data-needle="tank"]'), reg: $('[data-needle="reg"]') };
const readout = fig.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const on = (n, v) => n && (v ? n.setAttribute("data-on", "") : n.removeAttribute("data-on"));
const mv = (v, s) => "translate(" + (v[0] * s).toFixed(2) + " " + (v[1] * s).toFixed(2) + ")";
const STEP_S = 2.8;
let step = 0, clock = 0, touring = !still.matches, idle = 0, visible = false, frame = 0, last = 0, t = 0;
let tankP = 0, regP = 0, rodX = 0;
function draw() {
  tags.forEach((n, i) => on(n, i === step)); stations.forEach((n, i) => on(n, i === step));
  stage.setAttribute("data-focus", "");
  ["0", "1", "2", "3"].forEach((h, i) => (i < step ? hoses[h].setAttribute("data-flow", "in") : hoses[h].removeAttribute("data-flow")));
  if (step === 4) hoses.r.setAttribute("data-flow", "out"); else hoses.r.removeAttribute("data-flow");
  piston.setAttribute("transform", mv(VZ, step === 0 ? Math.sin(t * 18) * 1.6 : 0));
  needles.tank.setAttribute("d", NEEDLES.tank[Math.round(tankP * 40)]);
  needles.reg.setAttribute("d", NEEDLES.reg[Math.round(regP * 40)]);
  drops.forEach((d, i) => { const ph = (t * 0.9 + i / 3) % 1; d.setAttribute("transform", "translate(" + (DROP[0] * ph * 2).toFixed(2) + " " + (DROP[1] * ph * 2).toFixed(2) + ")"); d.style.opacity = step === 1 ? (1 - ph).toFixed(2) : 0; });
  on(coil, step >= 3); on(led, step >= 3);
  rod.setAttribute("transform", mv(VX, rodX)); clip.setAttribute("transform", mv(VX, -rodX));
  work.setAttribute("transform", mv(VX, Math.max(0, rodX - 4)));
  const text = STEPS[step];
  if (readout.textContent !== text) readout.textContent = text;
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60; last = now; t += dt;
  if (touring) { clock += dt; step = Math.floor(clock / STEP_S) % 5; } else if ((idle += dt) > 8) { touring = !still.matches; clock = step * STEP_S; }
  const f = (tau) => (still.matches ? 1 : 1 - Math.exp(-dt / tau));
  tankP += ((step >= 0 ? 7 / 10 : 0) - tankP) * f(step === 0 ? 0.9 : 0.2);
  regP += ((step >= 2 ? 6 / 10 : 0) - regP) * f(0.4);
  rodX += ((step === 4 ? STROKE : 0) - rodX) * f(0.3);
  draw();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; visible ? run() : (cancelAnimationFrame(frame), (frame = 0)); }, { rootMargin: "80px 0px" }).observe(stage);
const pick = (i) => { touring = false; idle = 0; step = i; if (i === 0) tankP = 0; run(); };
stations.forEach((n, i) => n.addEventListener("click", (e) => { e.stopPropagation(); pick(i); }));
tags.forEach((n, i) => n.addEventListener("click", (e) => { e.stopPropagation(); pick(i); }));
stage.addEventListener("click", () => pick((step + 1) % 5));
stage.addEventListener("keydown", (e) => { if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); pick((step + 1) % 5); } if (e.key === "ArrowLeft") { e.preventDefault(); pick((step + 4) % 5); } });
draw();
})();`;

const figure = k.plateHtml({
  fig: "Fig 1",
  title: "Pneumatic system",
  hint: "คลิกอุปกรณ์หรือตัวเลขเพื่อดูทีละขั้น",
  readout: STEPS[0],
  keys: [
    { mark: "lit", label: "หมายเลขขั้นตอน ตรงกับรายการด้านล่าง" },
    { mark: "blue", label: "ลมอัดไหลไปตามท่อ" },
  ],
  caption: "เส้นทางของลมอัดตั้งแต่เครื่องอัดลมจนถึงกระบอกลม แรงดันในถังประมาณ 7 bar ถูกปรับลดเหลือ 6 bar ที่ชุด FRL ก่อนเข้าเครื่องจักร ตัวเลขบนฐานตรงกับขั้นตอนที่ 1–5 ในบทความ",
  body: `<div class="iso-stage ps-stage" tabindex="0" role="button" aria-label="ภาพรวมระบบนิวเมติก: คลิกหรือกดลูกศรเพื่อเปลี่ยนขั้นตอน">${svg}</div>`,
});

const fragment = `<div class="iso ps-fig" data-theme="light"><style>${k.ISO_CSS}${CSS}</style>${figure}</div><script>${live}</script>`;
writeFileSync(join(HERE, "pneumatic-system.fragment.html"), fragment);
writeFileSync(join(HERE, "pneumatic-system.html"), `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pneumatic system</title><style>body{margin:0;background:#f2f2ef;padding:32px 16px}.ps-fig{max-width:760px;margin:0 auto}</style></head><body>${fragment}</body></html>`);
console.log("wrote", (fragment.length / 1024).toFixed(1) + " KB fragment");

if (process.argv.includes("--inject")) {
  const file = join(HERE, "../../../src/data/pages.json");
  const raw = readFileSync(file, "utf8");
  const pages = JSON.parse(raw);
  const page = pages.find((p) => p.route === "pneumatic-system");
  const block = `<!-- fig:pneumatic-system -->\n${fragment}\n<!-- /fig:pneumatic-system -->`;
  const marked = /<!-- fig:pneumatic-system -->[\s\S]*?<!-- \/fig:pneumatic-system -->/;
  const anchor = '<h2 class="wp-block-heading" id="how-it-works">หลักการทำงานของระบบนิวเมติก</h2>\n\n';
  if (marked.test(page.html)) page.html = page.html.replace(marked, () => block);
  else if (page.html.includes(anchor)) page.html = page.html.replace(anchor, () => anchor + block + "\n\n");
  else throw new Error("pneumatic-system: heading not found");
  writeFileSync(file, JSON.stringify(pages, null, 2) + (raw.endsWith("\n") ? "\n" : ""));
  console.log("injected into pneumatic-system");
}
