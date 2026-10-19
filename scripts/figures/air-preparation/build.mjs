// Fig: filter-regulator (FR) unit. Wet 8 bar air enters, a deflector swirls it so water is flung
// out and runs down the clear bowl; the auto drain dumps it when the level is high. The regulator
// then holds the outlet at its set pressure (click to switch 6 ↔ 4 bar).
// `node scripts/figures/air-preparation/build.mjs [--inject]`
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 620;
const HEIGHT = 400;

const PLATE = { x: -110, y: -30, w: 214, d: 66, r: 8 };
const PLATE_H = 8;
const FOOT_H = 4;

// wall bracket the unit hangs from
const WALL = { x: -70, y: -28, w: 120, d: 6, r: 1.5 };
const WALL_H = 86;
const PIPE_Z = 66; // inlet/outlet axis height
const FX = -36; // filter axis
const RX = 18; // regulator axis
const HEADS = { x: FX - 12, y: -12, w: 24, d: 24, r: 2 };
const REG = { x: RX - 12, y: -12, w: 24, d: 24, r: 2 };
const HEAD_Z = [PIPE_Z - 9, PIPE_Z + 9];
const BOWL_TOP = HEAD_Z[0];
const BOWL_BOT = 16;
const BOWL_R = 9;
const ELEMENT = [BOWL_TOP - 22, BOWL_TOP - 3];

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [WALL.x, WALL.y, WALL_H], [RX, 0, HEAD_Z[1] + 30]],
  WIDTH,
  HEIGHT,
  { pad: 22, azimuth: 40, elevation: 26 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const poly = (pts) => k.pathOf(pts.map(at));
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const screws = (pts, z, r = 1.4) => L(pts.map(([x, y]) => k.ring(x, y, r, z, P, 14)).join(""), { tone: "lo" }) + D(pts.map(([x, y]) => at([x, y, z])), { size: 0.4 });
const halo = (plan, z, h) => `<path class="iso-halo" d="${k.haloOf(plan, z, h, P)}" style="filter:blur(3px)"/>`;
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
  // drip tray under the drain
  out.push(S(k.slabOf({ x: FX - 10, y: -10, w: 20, d: 20, r: 2 }, 0, 3, P, 3, 0.4), { tone: "lo" }));
  out.push(S(k.slabOf({ x: FX - 8, y: -8, w: 16, d: 16, r: 1.5 }, 2.99, 0.01, P, 3), { tone: "lo", flat: true, crease: "none" }));
  out.push(`<path class="ap-puddle" d="${k.planOutline({ x: FX - 6, y: -6, w: 12, d: 12, r: 5 }, 3.05, P, 6)}"/>`);
  return out.join("");
}
function wall() {
  const out = [S(k.slabOf(WALL, 0, WALL_H, P, 2, 0.6), { tone: "mid", inner: L(k.sideSeam(WALL, 10, P, 2), { tone: "faint" }) })];
  // L-bracket plates behind each head
  for (const x of [FX, RX]) out.push(S(k.slabOf({ x: x - 9, y: WALL.y + WALL.d, w: 18, d: 4, r: 0.8 }, HEAD_Z[0] - 4, HEAD_Z[1] - HEAD_Z[0] + 8, P, 2, 0.4), { tone: "mid" }), D([at([x - 6, WALL.y + WALL.d + 4, HEAD_Z[1] + 2]), at([x + 6, WALL.y + WALL.d + 4, HEAD_Z[1] + 2])], { size: 0.5 }));
  return out.join("");
}
// inlet pipe from the left, nipple between filter and regulator
const XF = G.frameAlong([0, 0, PIPE_Z], [1, 0, 0]);
function pipes() {
  const out = [];
  out.push(S(G.disc(-100, FX - 12, 3.6, XF, P), { tone: "mid", crease: "none" }));
  out.push(S(G.disc(-104, -100, 5.6, XF, P), { tone: "lo" }));
  out.push(S(G.disc(FX - 17, FX - 12, 5.4, XF, P), { tone: "mid", inner: L(G.ribsOf(XF, FX - 16.8, FX - 12.2, 5.4, 6, P, { seams: true }), { tone: "lo" }) }));
  out.push(S(G.disc(FX + 12, RX - 12, 4.4, XF, P), { tone: "mid" }));
  return out.join("");
}
function filterHead() {
  const out = [halo(HEADS, HEAD_Z[0], HEAD_Z[1] - HEAD_Z[0])];
  out.push(S(k.slabOf(HEADS, HEAD_Z[0], HEAD_Z[1] - HEAD_Z[0], P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(HEADS, HEAD_Z[0] + 4, P, 3), { tone: "faint" }) }));
  out.push(screws(k.corners(HEADS, 3), HEAD_Z[1], 1));
  // flow arrow on the head top
  const y = HEADS.y + HEADS.d - 5;
  out.push(L(k.lineOnTop([FX - 7, y], [FX + 7, y], HEAD_Z[1], P) + k.lineOnTop([FX + 7, y], [FX + 3.5, y - 2], HEAD_Z[1], P) + k.lineOnTop([FX + 7, y], [FX + 3.5, y + 2], HEAD_Z[1], P), { tone: "hi", free: true }));
  return out.join("");
}
// inside the bowl: deflector, element, water, drain — drawn before the glass
const VF = G.frameAlong([FX, 0, 0], [0, 0, 1]);
function bowlInside() {
  const out = [];
  out.push(S(G.disc(BOWL_TOP - 3, BOWL_TOP, 7, VF, P), { tone: "mid", inner: L(G.ribsOf(VF, BOWL_TOP - 2.8, BOWL_TOP - 0.2, 7, 14, P, { twist: 0.6, seams: true }), { tone: "lo" }) })); // deflector vanes
  out.push(S(G.disc(ELEMENT[0], ELEMENT[1], 4.6, VF, P), { tone: "lo", inner: L(G.ribsOf(VF, ELEMENT[0] + 0.2, ELEMENT[1] - 0.2, 4.6, 20, P, { seams: true }), { tone: "faint" }) })); // sintered element
  out.push(S(G.disc(ELEMENT[0] - 3, ELEMENT[0], 6.4, VF, P), { tone: "mid" })); // baffle
  out.push(`<g data-part="water">${S(G.disc(BOWL_BOT + 2, BOWL_BOT + 14, BOWL_R - 1.4, VF, P), { tone: "lo", crease: "none", className: "ap-water" })}</g>`);
  return out.join("");
}
function bowlGlass() {
  const prof = [[BOWL_BOT, 0], [BOWL_BOT, 4, 1], [BOWL_BOT + 1.4, 7.4, 1], [BOWL_BOT + 4, BOWL_R], [BOWL_TOP - 3, BOWL_R], [BOWL_TOP - 1, BOWL_R + 1.4], [BOWL_TOP, BOWL_R + 1.4], [BOWL_TOP, 0]];
  return `<g class="ap-glass">${S(G.solidOf(prof, VF, P), { tone: "hi", crease: "faint" })}</g>` + S(G.disc(BOWL_TOP - 4, BOWL_TOP, BOWL_R + 1.8, VF, P), { tone: "mid", inner: L(G.ribsOf(VF, BOWL_TOP - 3.8, BOWL_TOP - 0.2, BOWL_R + 1.8, 24, P, { seams: true }), { tone: "lo" }) }); // bowl guard ring
}
function drain() {
  return S(G.disc(BOWL_BOT - 4, BOWL_BOT, 2.6, VF, P), { tone: "mid" }) + S(G.disc(BOWL_BOT - 6, BOWL_BOT - 4, 1.4, VF, P), { tone: "lo" });
}
// regulator: body, bonnet with spring housing, knob, gauge on the front
const RF = G.frameAlong([RX, 0, 0], [0, 0, 1]);
const GF = G.frameAlong([RX, REG.y + REG.d, PIPE_Z], [0, 1, 0]);
const GR = 7.4;
// dial face lies in the x-z plane facing +y: angle 0 points up, increasing clockwise as the viewer sees it
const GC = [RX, REG.y + REG.d + 7.06, PIPE_Z];
const dialPt = (r, a, dy = 0) => [GC[0] + Math.sin(a) * r, GC[1] + dy, GC[2] + Math.cos(a) * r];
function regulator() {
  const out = [halo(REG, HEAD_Z[0], HEAD_Z[1] - HEAD_Z[0])];
  out.push(S(G.disc(BOWL_BOT + 18, HEAD_Z[0], 6, RF, P), { tone: "mid" })); // lower plug
  out.push(S(k.slabOf(REG, HEAD_Z[0], HEAD_Z[1] - HEAD_Z[0], P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(REG, HEAD_Z[0] + 4, P, 3), { tone: "faint" }) }));
  out.push(S(G.solidOf([[HEAD_Z[1], 10], [HEAD_Z[1] + 3, 10], [HEAD_Z[1] + 6, 8.6, 1], [HEAD_Z[1] + 16, 6.8], [HEAD_Z[1] + 16, 0]], RF, P), { tone: "hi", crease: "lo" })); // bonnet
  out.push(`<g data-part="knob">${S(G.disc(HEAD_Z[1] + 16, HEAD_Z[1] + 23, 7.4, RF, P), { tone: "hi", lit: true, inner: L(G.ribsOf(RF, HEAD_Z[1] + 16.3, HEAD_Z[1] + 22.7, 7.4, 26, P, { seams: true }), { tone: "lo" }) })}</g>`);
  out.push(S(G.disc(HEAD_Z[1] + 13, HEAD_Z[1] + 16, 7.8, RF, P), { tone: "mid" })); // lock ring
  // gauge on the front
  out.push(S(G.disc(0, 3, 2.4, GF, P), { tone: "mid" }), S(G.disc(3, 7, GR + 1, GF, P), { tone: "mid" }));
  out.push(L(G.circleOf(GF, 7, GR - 0.6, P, 48), { tone: "lo" }));
  let ticks = "";
  for (let i = 0; i <= 10; i++) { const a = -Math.PI * 0.75 + (i / 10) * Math.PI * 1.5; const ang = a; ticks += k.pathOf([dialPt(GR - 1.2, ang, -0.06), dialPt(GR - (i % 5 ? 2.2 : 3.2), ang, -0.06)].map(at)); }
  out.push(L(ticks, { tone: "mid", free: true }));
  out.push(`<path class="iso-line" data-tone="lit" data-free="end" data-part="needle" d="" style="stroke-width:1.1"/>`);
  out.push(D([at(G.pointOf(GF, 7.05, 0, 0))], { size: 0.8 }));
  return out.join("");
}
const needleAt = (bar) => { const a = -Math.PI * 0.75 + (bar / 10) * Math.PI * 1.5; return k.pathOf([dialPt(0, a), dialPt(GR - 2, a)].map(at)); };
// outlet: hose from the regulator to a cylinder-like consumer block
const hose = (pts, name) => { const d = poly(pts); return `<g class="ap-hose" data-hose="${name}"><path class="ap-hose-body" d="${d}"/><path class="ap-hose-core" d="${d}"/><path class="ap-hose-flow" d="${d}"/></g>`; };
const OUTB = { x: 62, y: -6, w: 26, d: 22, r: 2 };
function outlet() {
  const out = [S(G.disc(RX + 12, RX + 18, 4.4, XF, P), { tone: "mid" }), S(G.disc(RX + 18, RX + 22, 3.2, XF, P), { tone: "lo" })];
  out.push(halo(OUTB, 0, 18), S(k.slabOf(OUTB, 0, 18, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(OUTB, 5, P, 3), { tone: "faint" }) }), screws(k.corners(OUTB, 3), 18, 1));
  out.push(S(k.cylinder(OUTB.x + OUTB.w / 2, OUTB.y + OUTB.d / 2, 3, 18, 2.4, P, 20), { tone: "mid" }));
  return out.join("");
}
const inletHose = () => hose([[-104, 0, PIPE_Z], [FX - 17, 0, PIPE_Z]], "in");
const outHose = () => hose(bez([RX + 22, 0, PIPE_Z], [RX + 40, 0, PIPE_Z], [OUTB.x + OUTB.w / 2, OUTB.y + OUTB.d / 2, 44], [OUTB.x + OUTB.w / 2, OUTB.y + OUTB.d / 2, 20.4]), "out");

// droplet lanes inside the bowl, in screen space
const LANES = Array.from({ length: 5 }, (_, i) => { const a = Math.PI * (0.15 + 0.17 * i); const r = BOWL_R - 2.2; return { top: at([FX + Math.cos(a) * r, Math.sin(a) * r, ELEMENT[0] - 4]), bot: at([FX + Math.cos(a) * r, Math.sin(a) * r, BOWL_BOT + 4]) }; });
const DRIP = { top: at([FX, 0, BOWL_BOT - 6]), bot: at([FX, 0, 3.2]) };
const WATER_STEPS = 21;
const waters = Array.from({ length: WATER_STEPS }, (_, i) => { const h = 0.6 + (i / (WATER_STEPS - 1)) * 13; return G.disc(BOWL_BOT + 2, BOWL_BOT + 2 + h, BOWL_R - 1.4, VF, P); });

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: "A filter-regulator unit on a wall bracket. Wet compressed air at 8 bar enters the filter head; a deflector swirls it so water is flung out and runs down the clear bowl, a sintered element catches dust, and an automatic drain empties the bowl into a tray when the water level rises. The regulator next to it holds the outlet at the set pressure shown on its gauge.",
  body: [plate(), wall(), pipes(), inletHose(), filterHead(), bowlInside(), `<g data-part="drops">${LANES.map((_, i) => `<circle class="ap-drop" data-drop="${i}" r="0.9" cx="0" cy="0"/>`).join("")}</g>`, bowlGlass(), drain(), `<g data-part="drip">${[0, 1, 2].map((i) => `<circle class="ap-drip" data-drip="${i}" r="1" cx="0" cy="0"/>`).join("")}</g>`, regulator(), outlet(), outHose()],
});

const NEEDLES = Array.from({ length: 101 }, (_, i) => needleAt(i / 10));
const WATER_D = waters.map((w) => S(w, { tone: "lo", crease: "none", className: "ap-water" }));
const CSS = `
.ap-glass .iso-fill,.ap-glass .iso-shade,.ap-glass .iso-top{fill-opacity:.38}
.ap-water .iso-shade,.ap-water .iso-top,.ap-water .iso-fill{fill:#9cc7f0}
.ap-water .iso-edge{stroke:#5b9bd8}
.ap-drop,.ap-drip{fill:#3e8fdd;opacity:0}
.ap-puddle{fill:#9cc7f0;stroke:none;opacity:0;transition:opacity .6s}
.ap-puddle[data-on]{opacity:.8}
.ap-hose-body{fill:none;stroke:var(--anatomy-mid);stroke-width:3.6;stroke-linecap:round;stroke-linejoin:round}
.ap-hose-core{fill:none;stroke:var(--anatomy-card);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.ap-hose-flow{fill:none;stroke:#3e8fdd;stroke-width:1.1;stroke-dasharray:2 5;opacity:1;animation:ap-air .6s linear infinite}
.ap-hose[data-hose="in"] .ap-hose-flow{stroke:#7a9bbd}
@keyframes ap-air{to{stroke-dashoffset:-14}}
.ap-stage{cursor:pointer;touch-action:manipulation}
@media (prefers-reduced-motion:reduce){.ap-hose-flow{animation:none!important}}
`;
const live = `(() => {
const fig = document.currentScript.previousElementSibling;
const stage = fig.querySelector(".ap-stage"), svg = stage.querySelector("svg");
const $ = (s) => svg.querySelector(s), $$ = (s) => [...svg.querySelectorAll(s)];
const NEEDLES = ${JSON.stringify(NEEDLES)}, LANES = ${JSON.stringify(LANES)}, DRIP = ${JSON.stringify(DRIP)}, WATER = ${JSON.stringify(WATER_D)};
const needle = $('[data-part="needle"]'), water = $('[data-part="water"]'), drops = $$("[data-drop]"), drips = $$("[data-drip]"), puddle = svg.querySelector(".ap-puddle");
const readout = fig.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
let set = 6, out = 6, level = 0.25, draining = 0, t = 0, visible = false, frame = 0, last = 0, lastW = -1, pud = 0;
function draw() {
  needle.setAttribute("d", NEEDLES[Math.round(Math.max(0, Math.min(10, out)) * 10)]);
  const w = Math.round(level * (WATER.length - 1));
  if (w !== lastW) { water.innerHTML = WATER[w]; lastW = w; }
  drops.forEach((d, i) => { const ph = (t * 0.7 + i * 0.37) % 1, L = LANES[i]; d.setAttribute("cx", (L.top[0] + (L.bot[0] - L.top[0]) * ph).toFixed(1)); d.setAttribute("cy", (L.top[1] + (L.bot[1] - L.top[1]) * ph * (1 - level * 0.55)).toFixed(1)); d.style.opacity = (Math.sin(ph * Math.PI) * 0.9).toFixed(2); });
  drips.forEach((d, i) => { const ph = (t * 1.6 + i / 3) % 1; d.setAttribute("cx", DRIP.top[0].toFixed(1)); d.setAttribute("cy", (DRIP.top[1] + (DRIP.bot[1] - DRIP.top[1]) * ph).toFixed(1)); d.style.opacity = draining > 0 ? (1 - ph).toFixed(2) : 0; });
  pud > 0.5 ? puddle.setAttribute("data-on", "") : puddle.removeAttribute("data-on");
  const text = "เข้า 8.0 bar · ออก " + out.toFixed(1) + " bar · น้ำในถ้วย " + Math.round(level * 100) + "%" + (draining > 0 ? " · กำลังระบายน้ำ" : "");
  if (readout.textContent !== text) readout.textContent = text;
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60; last = now; t += dt;
  if (draining > 0) { draining -= dt; level = Math.max(0.1, level - dt * 0.6); pud = 1; } else { level += dt * 0.06; if (level >= 1) draining = 1.4; }
  out += (set + Math.sin(t * 1.3) * 0.08 - out) * (still.matches ? 1 : 1 - Math.exp(-dt / 0.5));
  draw();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; visible ? run() : (cancelAnimationFrame(frame), (frame = 0)); }, { rootMargin: "80px 0px" }).observe(stage);
const toggle = () => { set = set === 6 ? 4 : 6; run(); };
stage.addEventListener("click", toggle);
stage.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } });
draw();
})();`;

const figure = k.plateHtml({
  fig: "Fig 1",
  title: "Filter regulator",
  hint: "คลิกเพื่อปรับแรงดันออก 6 ↔ 4 bar",
  readout: "เข้า 8.0 bar · ออก 6.0 bar · น้ำในถ้วย 25%",
  keys: [
    { mark: "lit", label: "ปุ่มปรับแรงดัน (Regulator)" },
    { mark: "blue", label: "น้ำที่ถูกแยกออกจากลม และลมสะอาดขาออก" },
  ],
  caption: "ลมอัด 8 bar ที่มีความชื้นเข้าหัวกรอง ครีบเบี่ยงทำให้ลมหมุนวน น้ำและฝุ่นหนักถูกเหวี่ยงไปที่ผนังถ้วยแล้วไหลลงก้นถ้วย ไส้กรองดักฝุ่นละเอียดอีกชั้น เมื่อน้ำสูงถึงระดับ วาล์วระบายอัตโนมัติจะเปิดทิ้ง จากนั้นตัวปรับแรงดันลดแรงดันลงเหลือค่าที่ตั้งไว้ก่อนเข้าเครื่องจักร",
  body: `<div class="iso-stage ap-stage" tabindex="0" role="button" aria-label="ปรับแรงดันขาออกของตัวปรับแรงดัน (กด Space)">${svg}</div>`,
});

const fragment = `<div class="iso ap-fig" data-theme="light"><style>${k.ISO_CSS}${CSS}</style>${figure}</div><script>${live}</script>`;
writeFileSync(join(HERE, "air-preparation.fragment.html"), fragment);
writeFileSync(join(HERE, "air-preparation.html"), `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Filter regulator</title><style>body{margin:0;background:#f2f2ef;padding:32px 16px}.ap-fig{max-width:720px;margin:0 auto}</style></head><body>${fragment}</body></html>`);
console.log("wrote", (fragment.length / 1024).toFixed(1) + " KB fragment");

if (process.argv.includes("--inject")) {
  const file = join(HERE, "../../../src/data/pages.json");
  const raw = readFileSync(file, "utf8");
  const pages = JSON.parse(raw);
  const page = pages.find((p) => p.route === "air-preparation");
  const marked = /<!-- fig:air-preparation -->[\s\S]*?<!-- \/fig:air-preparation -->/;
  if (!page || !marked.test(page.html)) throw new Error("air-preparation: figure marker not found");
  page.html = page.html.replace(marked, () => `<!-- fig:air-preparation -->\n${fragment}\n<!-- /fig:air-preparation -->`);
  writeFileSync(file, JSON.stringify(pages, null, 2) + (raw.endsWith("\n") ? "\n" : ""));
  console.log("injected into air-preparation");
}
