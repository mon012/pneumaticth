// Fig: piston vs screw compressor, side by side. The piston's crank turns, the piston strokes and
// reed valves flap — air leaves in pulses. Two meshing screw rotors turn — air leaves continuously.
// `node scripts/figures/air-compressor/build.mjs [--inject]`
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 660;
const HEIGHT = 360;

const PLATE = { x: -150, y: -34, w: 300, d: 70, r: 8 };
const PLATE_H = 8;
const FOOT_H = 4;

// ── piston side (left) ──
const PX = -92;
const CRANK = { c: [PX, 2, 20], r: 7 }; // crank axis along y
const CASE = { x: PX - 16, y: -10, w: 32, d: 24, r: 3 };
const CASE_H = 30;
const CYL_Z = [CASE_H, CASE_H + 34];
const BORE = 10;
const ROD_LEN = 26;
const PISTON_H = 8;
const HEADP = { x: PX - 15, y: -13, w: 30, d: 26, r: 2 };
const HEAD_Z = CYL_Z[1];
const TANK_P = { x: -56, y: -14, w: 30, d: 28, r: 4 };

// ── screw side (right) ──
const SX = [26, 104]; // rotor span along x
const AXZ = 16;
const RM = 7.4; // male rotor
const RF = 6.2; // female rotor
const YM = -6.6, YF = 7.2;
const HOUSING = { x: SX[0] - 8, y: -18, w: SX[1] - SX[0] + 16, d: 34, r: 3 };
const TANK_S = { x: 118, y: -14, w: 26, d: 28, r: 4 };

const P = k.fitProjection([...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [PX, 0, HEAD_Z + 14]], WIDTH, HEIGHT, { pad: 22, azimuth: 56, elevation: 30 });

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const poly = (pts) => k.pathOf(pts.map(at));
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const screws = (pts, z, r = 1.3) => L(pts.map(([x, y]) => k.ring(x, y, r, z, P, 14)).join(""), { tone: "lo" }) + D(pts.map(([x, y]) => at([x, y, z])), { size: 0.4 });
const topText = (x, y, z, text, size = 3.4, tone = "hi") => k.faceTextSvg(k.topMatrix([x, y], z, P, "x"), text, { size, tone, anchor: "middle" });
const halo = (plan, z, h) => `<path class="iso-halo" d="${k.haloOf(plan, z, h, P)}" style="filter:blur(3px)"/>`;
const flat = (plan, z) => S(k.slabOf(plan, z - 0.01, 0.01, P, 3), { tone: "lo", flat: true, crease: "none" });
const hose = (pts, name) => { const d = poly(pts); return `<g class="ac-hose" data-hose="${name}"><path class="ac-hose-body" d="${d}"/><path class="ac-hose-core" d="${d}"/><path class="ac-hose-flow" d="${d}"/></g>`; };
function bez(p0, c1, c2, p3, n = 22) { return Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [0, 1, 2].map((j) => u * u * u * p0[j] + 3 * u * u * t * c1[j] + 3 * u * t * t * c2[j] + t * t * t * p3[j]); }); }

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 14))) {
    out.push(S(k.cylinder(x, y, 6, -PLATE_H - FOOT_H, 1.4, P, 24), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 4.6, -PLATE_H - FOOT_H + 1.4, FOOT_H - 1.4, P, 24), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.2), { tone: "mid", inner: L(k.sideSeam(PLATE, -PLATE_H / 2, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "faint" }));
  out.push(screws(k.corners(PLATE, 7), 0));
  // divider groove between the two machines
  out.push(L(k.lineOnTop([0, PLATE.y + 5], [0, PLATE.y + PLATE.d - 5], 0, P), { tone: "lo" }));
  out.push(topText(-118, PLATE.y + PLATE.d - 8, 0, "PISTON", 3.6, "mid"), topText(64, PLATE.y + PLATE.d - 8, 0, "SCREW", 3.6, "mid"));
  return out.join("");
}
function tank(plan, name) {
  const F = G.frameAlong([plan.x + plan.w / 2, plan.y + plan.d / 2, 0], [0, 0, 1]);
  const r = plan.w / 2;
  return halo(plan, 0, 30) + S(G.solidOf([[0, 0], [0, r - 3], [2, r], [26, r], [30, r - 4, 1], [32, r - 9, 1], [32, 0]], F, P), { tone: "hi", crease: "lo", inner: L(G.arcOf(F, 12, r, P), { tone: "faint" }) }) + S(G.disc(32, 35, 3, F, P), { tone: "mid" }) + `<g class="ac-puff" data-puff="${name}">${S(G.disc(32.5, 33, r - 9.4, F, P), { tone: "hi", crease: "none" })}</g>`;
}

// piston machine: crankcase (open front window), crank disc, rod, piston in a glass cylinder, head with reed valves
const CF = G.frameAlong([PX, CASE.y + CASE.d, CRANK.c[2]], [0, 1, 0]);
function pistonBack() {
  const out = [halo(CASE, 0, CASE_H)];
  out.push(S(k.slabOf(CASE, 0, CASE_H, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(CASE, 5, P, 3), { tone: "faint" }) }));
  out.push(screws(k.corners(CASE, 3), CASE_H, 1));
  // crank disc on the front face
  out.push(S(G.disc(0, 2.2, CRANK.r + 3, CF, P), { tone: "hi", crease: "lo" }));
  out.push(D([at(G.pointOf(CF, 2.25, 0, 0))], { size: 1 }));
  // cylinder liner back half via glass
  return out.join("");
}
const VF = G.frameAlong([PX, 0, CYL_Z[0]], [0, 0, 1]);
const glass = () => `<g class="ac-glass">${S(G.solidOf([[0, BORE + 1.2], [CYL_Z[1] - CYL_Z[0], BORE + 1.2]], VF, P), { tone: "hi", crease: "faint" })}</g>` + L(G.arcOf(VF, 8, BORE + 1.2, P) + G.arcOf(VF, 16, BORE + 1.2, P) + G.arcOf(VF, 24, BORE + 1.2, P), { tone: "faint" });
const pistonPart = () => S(G.disc(0, PISTON_H, BORE, G.frameAlong([PX, 0, 0], [0, 0, 1]), P), { tone: "hi", lit: true, inner: L(G.arcOf(G.frameAlong([PX, 0, 0], [0, 0, 1]), 2, BORE, P) + G.arcOf(G.frameAlong([PX, 0, 0], [0, 0, 1]), 4, BORE, P), { tone: "lo" }) });
function pistonHead() {
  const out = [S(k.slabOf(HEADP, HEAD_Z, 6, P, 2, 0.5), { tone: "mid" })];
  for (let i = 0; i < 3; i++) out.push(S(k.slabOf(k.insetPlan(HEADP, i % 2 ? 1.6 : 0.4), HEAD_Z + 6 + i * 2.4, 2, P, 2, 0.3), { tone: i % 2 ? "mid" : "hi", crease: "none" }));
  out.push(screws(k.corners(HEADP, 2.6), HEAD_Z + 6 + 2 * 2.4 + 2, 1));
  // reed valve flaps visible on the head front (intake left, discharge right)
  for (const [dx, name] of [[-7, "in"], [7, "out"]]) out.push(`<g data-reed="${name}">${S(k.slabOf({ x: PX + dx - 3, y: HEADP.y + HEADP.d, w: 6, d: 1, r: 0.3 }, HEAD_Z + 1, 4, P, 2), { tone: "lo" })}</g>`);
  return out.join("");
}
// screw machine: housing with the top cut away, two helical rotors
const MF = G.frameAlong([SX[0], YM, AXZ], [1, 0, 0]);
const FF = G.frameAlong([SX[0], YF, AXZ], [1, 0, 0]);
const PHASES = 18;
const ribFrames = (F, r, lobes, dir) => Array.from({ length: PHASES }, (_, i) => G.ribsOf(F, 0.3, SX[1] - SX[0] - 0.3, r, lobes * 2, P, { twist: dir * 1.6, phase: (dir * i * 2 * Math.PI) / (PHASES * lobes), least: 0.05 }));
const MALE = ribFrames(MF, RM, 4, 1);
const FEMALE = ribFrames(FF, RF, 6, -1);
function screwBody() {
  const out = [halo(HOUSING, 0, AXZ)];
  out.push(S(k.slabOf(HOUSING, 0, AXZ, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(HOUSING, 5, P, 3), { tone: "faint" }) }));
  out.push(flat({ x: SX[0] - 1, y: YM - RM - 0.6, w: SX[1] - SX[0] + 2, d: YF + RF - YM + RM + 1.2, r: 1 }, AXZ));
  out.push(screws(k.corners(HOUSING, 3), AXZ, 1));
  // inlet port (back, top) and discharge port (end)
  out.push(S(k.cylinder(SX[0] + 6, HOUSING.y + 4, 3.6, AXZ, 4, P, 20), { tone: "mid" }));
  // motor at the inlet end
  const MotF = G.frameAlong([HOUSING.x, YM, AXZ], [-1, 0, 0]);
  out.push(S(G.disc(0, 2, 6, MotF, P), { tone: "mid" }));
  return out.join("");
}
const rotor = (F, r, name, ribs) => S(G.disc(0, SX[1] - SX[0], r, F, P), { tone: "hi", crease: "lo", lit: name === "male" }) + `<path class="iso-line" data-tone="mid" data-free="both" data-rotor="${name}" d="${ribs[0]}" style="stroke-width:1.1"/>`;

const hoses = () => [
  hose(bez([PX + 7, HEADP.y + HEADP.d / 2, HEAD_Z + 14], [PX + 7, 0, HEAD_Z + 26], [TANK_P.x + TANK_P.w / 2, TANK_P.y + TANK_P.d / 2, 52], [TANK_P.x + TANK_P.w / 2, TANK_P.y + TANK_P.d / 2, 35]), "p"),
  hose(bez([HOUSING.x + HOUSING.w, YF, AXZ - 4], [HOUSING.x + HOUSING.w + 8, YF, AXZ - 4], [TANK_S.x + TANK_S.w / 2, TANK_S.y + TANK_S.d / 2, 50], [TANK_S.x + TANK_S.w / 2, TANK_S.y + TANK_S.d / 2, 35]), "s"),
].join("");

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: "Two compressors side by side. Left, a piston compressor: a crank turns, a connecting rod drives the piston up and down in its cylinder, and reed valves in the head open in turn, so air is delivered to its tank in pulses. Right, a screw compressor with its housing cut open: two meshing helical rotors turn continuously and push air along to the discharge end in a steady stream.",
  body: [plate(), tank(TANK_P, "p"), tank(TANK_S, "s"), pistonBack(), `<path class="iso-line" data-tone="hi" data-free="end" data-part="conrod" d="" style="stroke-width:2.2"/>`, `<g data-part="pin">${D([at([PX, CASE.y + CASE.d + 2.3, CRANK.c[2]])], { size: 1.2 })}</g>`, `<g data-part="piston">${pistonPart()}</g>`, glass(), pistonHead(), screwBody(), rotor(MF, RM, "male", MALE), rotor(FF, RF, "female", FEMALE), hoses()],
});

const O = at([0, 0, 0]);
const EX = k.axisVector(P, [1, 0, 0]), EY = k.axisVector(P, [0, 1, 0]), EZ = k.axisVector(P, [0, 0, 1]);
const CSS = `
.ac-glass .iso-fill,.ac-glass .iso-shade,.ac-glass .iso-top{fill-opacity:.35}
.ac-hose-body{fill:none;stroke:var(--anatomy-mid);stroke-width:3.6;stroke-linecap:round;stroke-linejoin:round}
.ac-hose-core{fill:none;stroke:var(--anatomy-card);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.ac-hose-flow{fill:none;stroke:#3e8fdd;stroke-width:1.2;stroke-dasharray:2 5;animation:ac-air .6s linear infinite}
.ac-hose[data-hose="p"] .ac-hose-flow{transition:opacity .08s}
@keyframes ac-air{to{stroke-dashoffset:-14}}
.ac-stage{cursor:pointer;touch-action:manipulation}
@media (prefers-reduced-motion:reduce){.ac-hose-flow{animation:none!important}}
`;
const live = `(() => {
const fig = document.currentScript.previousElementSibling;
const stage = fig.querySelector(".ac-stage"), svg = stage.querySelector("svg");
const $ = (s) => svg.querySelector(s);
const O = ${JSON.stringify(O)}, EX = ${JSON.stringify(EX)}, EY = ${JSON.stringify(EY)}, EZ = ${JSON.stringify(EZ)};
const MALE = ${JSON.stringify(MALE)}, FEMALE = ${JSON.stringify(FEMALE)};
const PX = ${PX}, FY = ${CASE.y + CASE.d + 2.3}, CZ = ${CRANK.c[2]}, CR = ${CRANK.r}, ROD = ${ROD_LEN}, PH = ${PISTON_H};
const sc = (x, y, z) => [O[0] + EX[0] * x + EY[0] * y + EZ[0] * z, O[1] + EX[1] * x + EY[1] * y + EZ[1] * z];
const rod = $('[data-part="conrod"]'), pin = $('[data-part="pin"]'), piston = $('[data-part="piston"]'), male = $('[data-rotor="male"]'), female = $('[data-rotor="female"]');
const reedIn = $('[data-reed="in"]'), reedOut = $('[data-reed="out"]'), hoseP = svg.querySelector('[data-hose="p"] .ac-hose-flow');
const readout = fig.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
let a = 0, slow = true, visible = false, frame = 0, last = 0;
const pin0 = sc(PX, FY, CZ);
function draw() {
  const px = PX + Math.sin(a) * CR, pz = CZ + Math.cos(a) * CR;
  const pinS = sc(px, FY, pz);
  pin.setAttribute("transform", "translate(" + (pinS[0] - pin0[0]).toFixed(2) + " " + (pinS[1] - pin0[1]).toFixed(2) + ")");
  const top = pz + Math.sqrt(ROD * ROD - (px - PX) ** 2); // wrist pin height
  const w = sc(PX, FY - 0.1, top);
  rod.setAttribute("d", "M" + pinS[0].toFixed(1) + " " + pinS[1].toFixed(1) + "L" + w[0].toFixed(1) + " " + w[1].toFixed(1));
  const pz0 = sc(0, 0, top - 2), base = sc(0, 0, 0);
  piston.setAttribute("transform", "translate(" + (pz0[0] - base[0]).toFixed(2) + " " + (pz0[1] - base[1]).toFixed(2) + ")");
  const up = Math.sin(a) > 0; // piston rising after bottom dead centre → compressing
  const s = Math.cos(a);
  reedIn.setAttribute("transform", "translate(0 " + (!up ? 0.8 : 0) + ")");
  reedOut.setAttribute("transform", "translate(0 " + (up && s > 0.2 ? -0.8 : 0) + ")");
  hoseP.style.opacity = up && s > 0.2 ? 1 : 0.08;
  const i = Math.floor(((a / (2 * Math.PI)) * 6 * 18) % 18 + 18) % 18;
  male.setAttribute("d", MALE[i]); female.setAttribute("d", FEMALE[i]);
  const text = (slow ? "แสดงช้าลง · " : "") + "ลูกสูบ: ลมออกเป็นจังหวะ (" + (up && s > 0.2 ? "จังหวะอัด" : up ? "อัดตัว" : "จังหวะดูด") + ") · สกรู: ลมออกต่อเนื่อง";
  if (readout.textContent !== text) readout.textContent = text;
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60; last = now;
  if (!still.matches) a = (a + dt * (slow ? 2.2 : 9)) % (2 * Math.PI);
  draw();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; visible ? run() : (cancelAnimationFrame(frame), (frame = 0)); }, { rootMargin: "80px 0px" }).observe(stage);
const toggle = () => { slow = !slow; run(); };
stage.addEventListener("click", toggle);
stage.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } });
draw();
})();`;

const figure = k.plateHtml({
  fig: "Fig 1",
  title: "Piston vs screw",
  hint: "คลิกเพื่อสลับความเร็ว ช้า ↔ เร็ว",
  readout: "แสดงช้าลง · ลูกสูบ: ลมออกเป็นจังหวะ · สกรู: ลมออกต่อเนื่อง",
  keys: [
    { mark: "lit", label: "ลูกสูบ / โรเตอร์ตัวผู้ ชิ้นส่วนที่อัดลม" },
    { mark: "blue", label: "ลมอัดไหลเข้าถังพักลม" },
  ],
  caption: "ซ้าย: เครื่องอัดลมแบบลูกสูบ ข้อเหวี่ยงหมุนขับลูกสูบขึ้นลง ลิ้นวาล์วเปิดปิดสลับกัน ลมจึงออกเป็นจังหวะ ขวา: เครื่องอัดลมแบบสกรู โรเตอร์เกลียวสองตัวขบกันหมุนต่อเนื่อง ดันอากาศจากด้านดูดไปด้านจ่าย ลมจึงออกสม่ำเสมอ เหมาะกับงานที่ใช้ลมตลอดเวลา",
  body: `<div class="iso-stage ac-stage" tabindex="0" role="button" aria-label="สลับความเร็วภาพเคลื่อนไหว (กด Space)">${svg}</div>`,
});

const fragment = `<div class="iso ac-fig" data-theme="light"><style>${k.ISO_CSS}${CSS}</style>${figure}</div><script>${live}</script>`;
writeFileSync(join(HERE, "air-compressor.fragment.html"), fragment);
writeFileSync(join(HERE, "air-compressor.html"), `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Piston vs screw</title><style>body{margin:0;background:#f2f2ef;padding:32px 16px}.ac-fig{max-width:760px;margin:0 auto}</style></head><body>${fragment}</body></html>`);
console.log("wrote", (fragment.length / 1024).toFixed(1) + " KB fragment");

if (process.argv.includes("--inject")) {
  const file = join(HERE, "../../../src/data/pages.json");
  const raw = readFileSync(file, "utf8");
  const pages = JSON.parse(raw);
  const page = pages.find((p) => p.route === "air-compressor");
  const block = `<!-- fig:air-compressor -->\n${fragment}\n<!-- /fig:air-compressor -->`;
  const marked = /<!-- fig:air-compressor -->[\s\S]*?<!-- \/fig:air-compressor -->/;
  const anchor = /(<h2[^>]*>เครื่องอัดอากาศแบบลูกสูบ vs แบบสกรู เลือกแบบไหนดี<\/h2>\s*)/;
  if (marked.test(page.html)) page.html = page.html.replace(marked, () => block);
  else if (anchor.test(page.html)) page.html = page.html.replace(anchor, (m) => m + block + "\n\n");
  else throw new Error("air-compressor: heading not found");
  writeFileSync(file, JSON.stringify(pages, null, 2) + (raw.endsWith("\n") ? "\n" : ""));
  console.log("injected into air-compressor");
}
