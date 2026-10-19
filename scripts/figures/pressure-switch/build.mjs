// Fig: a pressure switch running a compressor between cut-in 6 bar and cut-out 8 bar.
// The switch box is open: a diaphragm pushes a rod against an adjustable spring; at 8 bar the
// contact bridge snaps off the fixed contacts and the motor stops; at 6 bar it snaps back.
// `node scripts/figures/pressure-switch/build.mjs [--inject]`
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 640;
const HEIGHT = 380;

const PLATE = { x: -142, y: -34, w: 256, d: 86, r: 8 };
const PLATE_H = 8;
const FOOT_H = 4;

// receiver tank lying along x, with pump and motor on top
const TANK_X = [-126, -6];
const TANK_Y = -10;
const TANK_R = 15;
const TANK_Z = 22;
const TANK_TOP = TANK_Z + TANK_R;
const DECK = { x: -112, y: TANK_Y - 13, w: 88, d: 26, r: 2 };
const MOTOR = { x: -64, y: TANK_Y - 11, w: 32, d: 22, r: 3 };
const HEAD = { x: -104, y: TANK_Y - 8, w: 16, d: 16, r: 1.5 };
const GAUGE = [-14, TANK_Y, TANK_TOP + 6];

// switch box (lid off), standing on the plate in front of the tank end
const SW = { x: 18, y: 2, w: 58, d: 30, r: 2 };
const SW_H = 13;
const FLOOR = 3;
const AXZ = 9; // mechanism axis height
const MID = SW.y + SW.d / 2;
const DIA = [SW.x + 9, MID];
const ROD_FROM = SW.x + 14;
const CONTACT_X = SW.x + 28;
const SPRING_END = SW.x + SW.w - 6;
const TRAVEL = 4; // rod travel from 5 to 9 bar
const SNAP = 3; // extra bridge travel when the contacts open

// outlet: ball valve + hose to a blow gun on a stand
const OUTLET = [TANK_X[1] + 3, TANK_Y, 12];
const GUN = { x: 86, y: -26, w: 12, d: 10, r: 1.5 };

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [MOTOR.x, MOTOR.y, TANK_TOP + 26], [GAUGE[0], GAUGE[1], GAUGE[2] + 6]],
  WIDTH,
  HEIGHT,
  { pad: 22, azimuth: 52, elevation: 32 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const poly = (pts) => k.pathOf(pts.map(at));
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const screws = (pts, z, r = 1.4) => L(pts.map(([x, y]) => k.ring(x, y, r, z, P, 14)).join(""), { tone: "lo" }) + D(pts.map(([x, y]) => at([x, y, z])), { size: 0.4 });
const topText = (x, y, z, text, size = 2.6, tone = "mid") => k.faceTextSvg(k.topMatrix([x, y], z, P, "x"), text, { size, tone, anchor: "middle" });
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
  return out.join("");
}

const TF = G.frameAlong([TANK_X[0], TANK_Y, TANK_Z], [1, 0, 0]);
function tank() {
  const out = [halo({ x: TANK_X[0], y: TANK_Y - TANK_R, w: TANK_X[1] - TANK_X[0], d: 2 * TANK_R, r: TANK_R }, 0, TANK_Z)];
  for (const x of [TANK_X[0] + 18, TANK_X[1] - 22]) out.push(S(k.slabOf({ x: x - 3, y: TANK_Y - 11, w: 6, d: 22, r: 1 }, 0, TANK_Z - 10, P, 2, 0.4), { tone: "lo" }));
  const len = TANK_X[1] - TANK_X[0];
  const prof = [[0, 0], [0, 6, 1], [1.6, 11, 1], [4.4, 14.2, 1], [7, TANK_R], [len - 7, TANK_R], [len - 4.4, 14.2, 1], [len - 1.6, 11, 1], [len, 6, 1], [len, 0]];
  out.push(S(G.solidOf(prof, TF, P), { tone: "hi", crease: "lo", inner: L(G.arcOf(TF, 30, TANK_R, P) + G.arcOf(TF, 90, TANK_R, P), { tone: "faint" }) }));
  // deck, motor and pump
  out.push(S(k.slabOf(DECK, TANK_TOP - 1, 2, P, 2, 0.4), { tone: "mid" }));
  out.push(screws(k.corners(DECK, 3), TANK_TOP + 1, 1));
  out.push(halo(MOTOR, TANK_TOP + 1, 20));
  const MF = G.frameAlong([MOTOR.x, TANK_Y, TANK_TOP + 12], [1, 0, 0]);
  out.push(S(G.disc(0, MOTOR.w, 10, MF, P), { tone: "hi", crease: "lo", inner: L(G.ribsOf(MF, 3, MOTOR.w - 3, 10, 22, P, { seams: true }), { tone: "faint" }) }));
  out.push(S(G.disc(MOTOR.w, MOTOR.w + 4, 10.6, MF, P), { tone: "mid" }));
  out.push(S(k.slabOf({ x: MOTOR.x + 10, y: TANK_Y - 6, w: 12, d: 12, r: 1 }, TANK_TOP + 1, 2.4, P, 2), { tone: "lo" }));
  out.push(S(k.slabOf({ x: MOTOR.x + 6, y: TANK_Y + 6, w: 10, d: 7, r: 1 }, TANK_TOP + 18, 6, P, 2, 0.4), { tone: "mid" })); // terminal box
  out.push(`<g data-part="fan">${L(G.spokesOf(MF, MOTOR.w + 4, 2, 9, 6, P) + G.circleOf(MF, MOTOR.w + 4, 2, P, 24) + G.circleOf(MF, MOTOR.w + 4, 9, P, 48), { tone: "lo" })}</g>`);
  // pump: crankcase, finned head, piston indicator
  out.push(S(k.slabOf({ x: HEAD.x - 2, y: HEAD.y - 2, w: HEAD.w + 4, d: HEAD.d + 4, r: 2 }, TANK_TOP + 1, 10, P, 2, 0.5), { tone: "mid" }));
  for (let i = 0; i < 4; i++) out.push(S(k.slabOf(k.insetPlan(HEAD, i % 2 ? 1.2 : -0.6), TANK_TOP + 11 + i * 2.6, 2.2, P, 2, 0.3), { tone: i % 2 ? "mid" : "hi", crease: "none" }));
  out.push(`<g data-part="piston">${S(k.cylinder(HEAD.x + HEAD.w / 2, HEAD.y + HEAD.d / 2, 2.6, TANK_TOP + 21.4, 3.4, P, 18), { tone: "hi", lit: true })}</g>`);
  out.push(S(k.slabOf(k.insetPlan(HEAD, 1), TANK_TOP + 21.4, 1.4, P, 2, 0.3), { tone: "mid" }));
  // belt guard between motor and pump
  out.push(S(k.slabOf({ x: HEAD.x + HEAD.w + 2, y: TANK_Y + 8, w: MOTOR.x - HEAD.x - HEAD.w - 2, d: 4, r: 1.5 }, TANK_TOP + 3, 16, P, 2, 0.4), { tone: "mid" }));
  return out.join("");
}
function gauge() {
  const [x, y, z] = GAUGE;
  const out = [S(k.cylinder(x, y, 2, TANK_TOP - 1, z - TANK_TOP + 1, P, 16), { tone: "mid" })];
  out.push(S(k.cylinder(x, y, 9, z, 2.4, P, 40, 0.5), { tone: "mid" }));
  out.push(L(k.ring(x, y, 7.6, z + 2.4, P, 40), { tone: "lo" }));
  const t = k.radialTicks(x, y, 7, 10, 2, z + 2.4, [1, 2], P, -Math.PI * 0.75, Math.PI * 1.5);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  // cut-in / cut-out marks at 6 and 8 of 0–10 bar
  const mark = (v, cls) => { const a = -Math.PI * 0.75 + (v / 10) * Math.PI * 1.5; return `<path class="ps2-mark" data-mark="${cls}" d="${k.lineOnTop([x + Math.sin(a) * 7.8, y - Math.cos(a) * 7.8], [x + Math.sin(a) * 5.4, y - Math.cos(a) * 5.4], z + 2.42, P)}"/>`; };
  out.push(mark(6, "in"), mark(8, "out"));
  out.push(`<path class="iso-line" data-tone="lit" data-free="end" data-part="needle" d="" style="stroke-width:1.1"/>`);
  out.push(D([at([x, y, z + 2.5])], { size: 0.8 }));
  return out.join("");
}
const needleAt = (bar) => { const [x, y, z] = GAUGE; const a = -Math.PI * 0.75 + (bar / 10) * Math.PI * 1.5; return k.lineOnTop([x, y], [x + Math.sin(a) * 6.2, y - Math.cos(a) * 6.2], z + 2.5, P); };

// switch box with the lid off
function switchBox() {
  const out = [halo(SW, 0, SW_H)];
  out.push(S(k.slabOf(SW, 0, SW_H, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(SW, 4, P, 3), { tone: "faint" }) }));
  const inner = k.insetPlan(SW, 2.2);
  out.push(S(k.slabOf(inner, SW_H - 0.01, 0.01, P, 3), { tone: "lo", flat: true, crease: "none" }));
  out.push(L(k.planOutline(inner, SW_H, P, 3), { tone: "lo" }));
  out.push(D(k.corners(SW, 1.2).map(([x, y]) => at([x, y, SW_H])), { size: 0.45 }));
  // diaphragm chamber with the pressure line coming in from below
  out.push(S(k.cylinder(DIA[0], DIA[1], 6.4, FLOOR, AXZ + 4 - FLOOR, P, 32, 0.4), { tone: "hi", crease: "lo" }));
  out.push(L(k.ring(DIA[0], DIA[1], 4.6, AXZ + 4, P, 28), { tone: "lo" }));
  // fixed contacts (two blocks either side of the rod) and their terminal screws
  for (const dy of [-8, 8]) {
    out.push(S(k.slabOf({ x: CONTACT_X - 3, y: MID + dy - 2.4, w: 4, d: 4.8, r: 0.6 }, FLOOR, AXZ + 1 - FLOOR, P, 2, 0.3), { tone: "mid" }));
    out.push(D([at([CONTACT_X - 1, MID + dy, AXZ + 1])], { size: 0.8 }));
  }
  // adjusting screw through the end wall, outside knob
  const AF = G.frameAlong([SW.x + SW.w - 2.2, MID, AXZ], [1, 0, 0]);
  out.push(S(G.disc(-4, 4, 1.4, AF, P), { tone: "mid" }));
  out.push(S(G.disc(4, 8, 4, AF, P), { tone: "mid", inner: L(G.ribsOf(AF, 4.3, 7.7, 4, 18, P, { seams: true }), { tone: "lo" }) }));
  out.push(topText(SW.x + SW.w - 12, SW.y + 5, SW_H, "SET", 2.4, "lo"));
  return out.join("");
}
// moving parts in the box: rod with bridge (snaps), spring precomputed per rod position
const RF = G.frameAlong([ROD_FROM, MID, AXZ], [1, 0, 0]);
const rod = () => S(G.disc(0, CONTACT_X - ROD_FROM + 4, 1.2, RF, P), { tone: "hi", crease: "none" });
const bridge = () => S(k.slabOf({ x: CONTACT_X - 0.4, y: MID - 11, w: 2.4, d: 22, r: 0.5 }, AXZ - 1.2, 2.4, P, 2, 0.3), { tone: "hi", lit: true });
const SPRING_STEPS = 25;
const springs = Array.from({ length: SPRING_STEPS }, (_, i) => k.coil(CONTACT_X + 2 + (i / (SPRING_STEPS - 1)) * (TRAVEL + SNAP), SPRING_END, [MID, AXZ], 3.2, 6, "x", P));

// outlet ball valve and hose to a blow gun on a stand
function outlet() {
  const out = [];
  const OF = G.frameAlong(OUTLET, [1, 0, 0]);
  out.push(S(G.disc(-3, 3, 2.2, OF, P), { tone: "mid" }), S(G.sphereOf([OUTLET[0] + 5, OUTLET[1], OUTLET[2]], 3.6, P), { tone: "mid" }), S(G.disc(7, 10, 2.2, OF, P), { tone: "lo" }));
  out.push(`<g data-part="handle">${S(k.slabOf({ x: OUTLET[0] + 1, y: OUTLET[1] - 1, w: 9, d: 2, r: 0.8 }, OUTLET[2] + 3.6, 1.4, P, 2), { tone: "hi", lit: true })}</g>`);
  out.push(S(k.slabOf({ x: GUN.x - 4, y: GUN.y - 4, w: GUN.w + 8, d: GUN.d + 8, r: 2 }, 0, 2, P, 2), { tone: "lo" }));
  out.push(S(k.slabOf({ x: GUN.x + 4, y: GUN.y + 3, w: 4, d: 4, r: 1 }, 2, 14, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf(GUN, 16, 6, P, 2, 0.4), { tone: "hi", crease: "lo" }));
  const NF = G.frameAlong([GUN.x + GUN.w, GUN.y + GUN.d / 2, 19], [1, 0, 0]);
  out.push(S(G.disc(0, 8, 1.4, NF, P), { tone: "mid" }));
  return out.join("");
}
const hose = (pts, name) => { const d = poly(pts); return `<g class="ps2-hose" data-hose="${name}"><path class="ps2-hose-body" d="${d}"/><path class="ps2-hose-core" d="${d}"/><path class="ps2-hose-flow" d="${d}"/></g>`; };
const hoses = () => [
  hose(bez([OUTLET[0] + 10, OUTLET[1], OUTLET[2]], [OUTLET[0] + 30, OUTLET[1], 4], [GUN.x - 16, GUN.y + GUN.d / 2, 18], [GUN.x, GUN.y + GUN.d / 2, 19]), "out"),
  hose(bez([TANK_X[1] - 14, TANK_Y + 12, 10], [TANK_X[1] - 14, TANK_Y + 26, 2], [DIA[0] - 16, DIA[1], 2], [SW.x, DIA[1], 5]), "sense"),
].join("");
const wire = () => { const pts = [[CONTACT_X - 1, MID + 8, AXZ + 1], [CONTACT_X - 1, MID + 14, 52], [MOTOR.x + 11, TANK_Y + 30, TANK_TOP + 44], [MOTOR.x + 11, TANK_Y + 9.5, TANK_TOP + 24]]; const b = bez(pts[0], pts[1], pts[2], pts[3], 28); return `<g class="iso-wire ps2-wire" data-tone="lo">${L(poly(b), { tone: "lo" })}<circle class="iso-wire-end" cx="${at(b[0])[0].toFixed(1)}" cy="${at(b[0])[1].toFixed(1)}" r="1"/><circle class="iso-wire-end" cx="${at(b.at(-1))[0].toFixed(1)}" cy="${at(b.at(-1))[1].toFixed(1)}" r="1"/></g>`; };

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "An air compressor with a horizontal receiver tank, a pressure gauge and a pressure switch with its lid off. A diaphragm in the switch pushes a rod against an adjustable spring. When tank pressure reaches 8 bar the contact bridge snaps off the fixed contacts and the motor stops; as air is used through the blow gun the pressure falls, and at 6 bar the contacts close and the motor starts again.",
  body: [
    plate(),
    tank(),
    gauge(),
    hoses(),
    switchBox(),
    `<path class="iso-line" data-tone="lo" data-part="spring-back" d="${springs[0].back}" style="stroke-width:.8"/>`,
    `<g data-part="rod">${rod()}</g>`,
    `<g data-part="bridge">${bridge()}</g>`,
    `<path class="iso-line" data-tone="hi" data-free="start" data-part="spring-front" d="${springs[0].front}" style="stroke-width:1"/>`,
    outlet(),
    wire(),
  ],
});

const NEEDLES = Array.from({ length: 101 }, (_, i) => needleAt(i / 10));
const EX = k.axisVector(P, [1, 0, 0]), EZ = k.axisVector(P, [0, 0, 1]);
const CSS = `
.ps2-mark{fill:none;stroke-width:1.6;stroke-linecap:round}
.ps2-mark[data-mark="in"]{stroke:#30a46c}.ps2-mark[data-mark="out"]{stroke:#e5484d}
.ps2-wire .iso-line{transition:stroke .2s}
.ps2-wire[data-on] .iso-line{stroke:#30a46c;stroke-width:1}
.ps2-hose-body{fill:none;stroke:var(--anatomy-mid);stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}
.ps2-hose-core{fill:none;stroke:var(--anatomy-card);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ps2-hose-flow{fill:none;stroke:#3e8fdd;stroke-width:1.1;stroke-dasharray:2 5;opacity:0;transition:opacity .2s}
.ps2-hose[data-flow] .ps2-hose-flow{opacity:1;animation:ps2-air .6s linear infinite}
@keyframes ps2-air{to{stroke-dashoffset:-14}}
.ps2-stage{cursor:pointer;touch-action:manipulation}
@media (prefers-reduced-motion:reduce){.ps2-hose-flow{animation:none!important}}
`;
const live = `(() => {
const fig = document.currentScript.previousElementSibling;
const stage = fig.querySelector(".ps2-stage"), svg = stage.querySelector("svg");
const $ = (s) => svg.querySelector(s);
const NEEDLES = ${JSON.stringify(NEEDLES)}, SPRINGS = ${JSON.stringify(springs)};
const EX = ${JSON.stringify(EX)}, EZ = ${JSON.stringify(EZ)}, TRAVEL = ${TRAVEL}, SNAP = ${SNAP}, STEPS = ${SPRING_STEPS};
const needle = $('[data-part="needle"]'), rod = $('[data-part="rod"]'), bridge = $('[data-part="bridge"]'), piston = $('[data-part="piston"]'), handle = $('[data-part="handle"]');
const sB = $('[data-part="spring-back"]'), sF = $('[data-part="spring-front"]'), wire = svg.querySelector(".ps2-wire"), hOut = $('[data-hose="out"]'), fan = $('[data-part="fan"]');
const readout = fig.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const CUT_IN = 6, CUT_OUT = 8, FILL = 0.55, USE = 0.32;
const mv = (v, s) => "translate(" + (v[0] * s).toFixed(2) + " " + (v[1] * s).toFixed(2) + ")";
let p = 6.4, motor = true, using = true, snap = 0, t = 0, visible = false, frame = 0, last = 0, lastStep = -1;
function draw() {
  needle.setAttribute("d", NEEDLES[Math.round(Math.min(10, Math.max(0, p)) * 10)]);
  const travel = Math.min(TRAVEL, Math.max(0, ((p - 5) / 4) * TRAVEL));
  rod.setAttribute("transform", mv(EX, travel));
  bridge.setAttribute("transform", mv(EX, travel + snap * SNAP));
  const step = Math.round(((travel + snap * SNAP) / (TRAVEL + SNAP)) * (STEPS - 1));
  if (step !== lastStep) { sB.setAttribute("d", SPRINGS[step].back); sF.setAttribute("d", SPRINGS[step].front); lastStep = step; }
  piston.setAttribute("transform", mv(EZ, motor ? Math.sin(t * 22) * 1.4 : 0));
  fan.style.opacity = motor ? (0.55 + 0.45 * Math.abs(Math.sin(t * 30))).toFixed(2) : 1;
  motor ? wire.setAttribute("data-on", "") : wire.removeAttribute("data-on");
  using ? hOut.setAttribute("data-flow", "") : hOut.removeAttribute("data-flow");
  handle.setAttribute("transform", using ? "" : mv([EX[0] - 0, EX[1]], 0) + " rotate(0)");
  handle.style.opacity = using ? 1 : 0.45;
  const text = p.toFixed(1) + " bar · " + (motor ? "หน้าสัมผัสต่อ · มอเตอร์ทำงาน" : "หน้าสัมผัสตัด · มอเตอร์หยุด") + " · ต่อ 6 / ตัด 8 bar";
  if (readout.textContent !== text) readout.textContent = text;
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60; last = now; t += dt;
  p += ((motor ? FILL : 0) - (using ? USE : 0.02)) * dt;
  if (motor && p >= CUT_OUT) motor = false;
  if (!motor && p <= CUT_IN) motor = true;
  p = Math.max(0, Math.min(9.5, p));
  const target = motor ? 0 : 1;
  snap += (target - snap) * (still.matches ? 1 : 1 - Math.exp(-dt / 0.03));
  draw();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; visible ? run() : (cancelAnimationFrame(frame), (frame = 0)); }, { rootMargin: "80px 0px" }).observe(stage);
const toggle = () => { using = !using; run(); };
stage.addEventListener("click", toggle);
stage.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } });
draw();
})();`;

const figure = k.plateHtml({
  fig: "Fig 1",
  title: "Pressure switch",
  hint: "คลิกเพื่อเปิด/ปิดการใช้ลม",
  readout: "6.4 bar · หน้าสัมผัสต่อ · มอเตอร์ทำงาน · ต่อ 6 / ตัด 8 bar",
  keys: [
    { mark: "lit", label: "สะพานหน้าสัมผัส ดีดออกที่ 8 bar กลับเข้าที่ 6 bar" },
    { mark: "green", label: "วงจรมอเตอร์ต่ออยู่ / ค่าแรงดันต่อ (Cut-in)" },
    { mark: "red", label: "ค่าแรงดันตัด (Cut-out)" },
  ],
  caption: "Pressure Switch ตัวนี้ตั้งค่าต่อ 6 bar และตัด 8 bar แรงดันในถังดันไดอะแฟรมสู้สปริงที่ปรับด้วยสกรู SET เมื่อแรงดันถึง 8 bar หน้าสัมผัสดีดแยก มอเตอร์หยุด เมื่อใช้ลมจนแรงดันลดเหลือ 6 bar หน้าสัมผัสต่อกลับ มอเตอร์เดินอีกครั้ง ช่วงห่าง 2 bar นี้เรียกว่า Differential",
  body: `<div class="iso-stage ps2-stage" tabindex="0" role="button" aria-label="เปิดหรือปิดการใช้ลมจากถัง (กด Space)">${svg}</div>`,
});

const fragment = `<div class="iso ps2-fig" data-theme="light"><style>${k.ISO_CSS}${CSS}</style>${figure}</div><script>${live}</script>`;
writeFileSync(join(HERE, "pressure-switch.fragment.html"), fragment);
writeFileSync(join(HERE, "pressure-switch.html"), `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pressure switch</title><style>body{margin:0;background:#f2f2ef;padding:32px 16px}.ps2-fig{max-width:740px;margin:0 auto}</style></head><body>${fragment}</body></html>`);
console.log("wrote", (fragment.length / 1024).toFixed(1) + " KB fragment");

if (process.argv.includes("--inject")) {
  const file = join(HERE, "../../../src/data/pages.json");
  const raw = readFileSync(file, "utf8");
  const pages = JSON.parse(raw);
  const page = pages.find((p) => p.route === "pressure-switch");
  const marked = /<!-- fig:pressure-switch -->[\s\S]*?<!-- \/fig:pressure-switch -->/;
  if (!page || !marked.test(page.html)) throw new Error("pressure-switch: figure marker not found");
  page.html = page.html.replace(marked, () => `<!-- fig:pressure-switch -->\n${fragment}\n<!-- /fig:pressure-switch -->`);
  writeFileSync(file, JSON.stringify(pages, null, 2) + (raw.endsWith("\n") ? "\n" : ""));
  console.log("injected into pressure-switch");
}
