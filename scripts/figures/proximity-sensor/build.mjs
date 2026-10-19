// Fig: an M18 inductive proximity sensor clamped in a bracket, facing a steel target on a slide.
// The sensing face radiates a field; when the target comes within Sn = 5 mm the output switches ON
// (LED lights, PLC input lights) and it releases only past 5.5 mm (hysteresis 10%).
// `node scripts/figures/proximity-sensor/build.mjs [--inject]`
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 640;
const HEIGHT = 360;

const PLATE = { x: -122, y: -26, w: 198, d: 52, r: 7 };
const PLATE_H = 7;
const FOOT_H = 4;

const AXZ = 24; // sensor axis height
const R = 9; // M18 thread radius
const FACE_X = 0; // sensing face
const BODY_X = -48; // back end of the threaded body
const CAP_X = BODY_X - 10; // back end of the plastic cap
const BR_X = -26; // bracket upright
const BR_T = 3;
const SN = 5;
const HYST = 0.5;
const TRAVEL = 18;

// slide rail and target carriage
const RAIL = { x: -2, y: -7, w: 60, d: 14, r: 1.5 };
const RAIL_Z = 0, RAIL_H = 5;
const CARR = { x: 0, y: -10, w: 12, d: 20, r: 1.5 }; // x is relative to the gap
const CARR_Z = RAIL_H, CARR_H = 5;
const FLAG = { x: 0, y: -13, w: 2, d: 26, r: 0.6 };
const FLAG_Z = CARR_Z + CARR_H, FLAG_H = 28;
const RULER = { x: -2, y: 12, w: 26, d: 7, r: 1 };

// PLC input card at the back end of the plate
const CARD = { x: -117, y: -18, w: 22, d: 30, r: 1.5 };
const CARD_H = 22;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [0, 0, FLAG_Z + FLAG_H], [-117, -18, CARD_H + 4]],
  WIDTH,
  HEIGHT,
  { pad: 22, azimuth: 40, elevation: 30 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const poly = (pts) => k.pathOf(pts.map(at));
const halo = (plan, z, h) => `<path class="iso-halo" d="${k.haloOf(plan, z, h, P)}" style="filter:blur(3px)"/>`;
const screws = (pts, z, r = 1.3) => L(pts.map(([x, y]) => k.ring(x, y, r, z, P, 14)).join(""), { tone: "lo" }) + D(pts.map(([x, y]) => at([x, y, z])), { size: 0.4 });
const topText = (x, y, z, text, size = 2.4, tone = "lo") => k.faceTextSvg(k.topMatrix([x, y], z, P, "x"), text, { size, tone, anchor: "middle" });
function bez(p0, c1, c2, p3, n = 24) { return Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [0, 1, 2].map((j) => u * u * u * p0[j] + 3 * u * u * t * c1[j] + 3 * u * t * t * c2[j] + t * t * t * p3[j]); }); }

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of k.corners(PLATE, 14).sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P))) {
    out.push(S(k.cylinder(x, y, 5.6, -PLATE_H - FOOT_H, 1.4, P, 24), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 4.3, -PLATE_H - FOOT_H + 1.4, FOOT_H - 1.4, P, 24), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.2), { tone: "mid", inner: L(k.sideSeam(PLATE, -PLATE_H / 2, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 4.5), 0, P), { tone: "faint" }));
  out.push(screws(k.corners(PLATE, 7.5), 0));
  // ruler strip along the slide, 1 mm ticks, Sn mark
  out.push(S(k.slabOf(RULER, 0, 0.8, P, 2, 0.2), { tone: "lo" }));
  const t = k.topTicks(RULER.x + 2, RULER.x + 2 + 20, 1, 5, RULER.y, 0.8, [1.6, 3], P, "x");
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  out.push(`<path class="px-mark" d="${k.lineOnTop([RULER.x + 2 + SN, RULER.y], [RULER.x + 2 + SN, RULER.y + RULER.d], 0.82, P)}"/>`);
  out.push(topText(RULER.x + 2 + SN, RULER.y + 5.6, 0.8, "Sn", 2.2, "mid"));
  return out.join("");
}

// PLC input card: a terminal block with input LEDs
function card() {
  const out = [halo(CARD, 0, CARD_H)];
  out.push(S(k.slabOf({ x: CARD.x - 2, y: CARD.y - 2, w: CARD.w + 4, d: CARD.d + 4, r: 1.5 }, 0, 2, P, 2, 0.3), { tone: "lo" }));
  out.push(S(k.slabOf(CARD, 2, CARD_H - 2, P, 2, 0.5), { tone: "mid", inner: L(k.sideSeam(CARD, 10, P, 2), { tone: "faint" }) }));
  const top = k.insetPlan(CARD, 2.4);
  out.push(L(k.planOutline(top, CARD_H, P, 2), { tone: "lo" }));
  // terminal screws along the front edge, LED windows along the back
  const ys = [CARD.y + 5, CARD.y + 11, CARD.y + 17, CARD.y + 23];
  out.push(screws(ys.map((y) => [CARD.x + CARD.w - 5, y]), CARD_H, 1.6));
  for (let i = 0; i < ys.length; i++) out.push(`<path class="px-in" ${i === 1 ? 'data-part="plc-led"' : ""} d="${k.onTop(k.roundedPlan({ x: CARD.x + 4, y: ys[i] - 1.6, w: 5, d: 3.2, r: 0.8 }, 3), CARD_H + 0.01, P, true)}"/>`);
  out.push(topText(CARD.x + 11, CARD.y + 27.4, CARD_H, "PLC IN", 2.2));
  return out.join("");
}

// sensor cable: rear cap down to the card's second terminal
const CABLE = bez([CAP_X - 4, 0, AXZ], [CAP_X - 22, 0, AXZ], [CARD.x + CARD.w + 14, CARD.y + 11, CARD_H + 2], [CARD.x + CARD.w - 5, CARD.y + 11, CARD_H + 0.5], 30);
const cable = () => { const d = poly(CABLE); return `<g class="px-cable"><path class="px-cable-body" d="${d}"/><path class="px-cable-core" d="${d}"/><path class="px-sig" data-part="sig" d="${d}"/></g>`; };

const F = G.frameAlong([CAP_X, 0, AXZ], [1, 0, 0]);
const sx = (x) => x - CAP_X; // world x to frame s
// threaded body from s0 to s1, thread rings as visible arcs
const threads = (x0, x1) => L(Array.from({ length: Math.floor((x1 - x0) / 1.5) }, (_, i) => G.arcOf(F, sx(x0 + 0.75 + i * 1.5), R, P)).join(""), { tone: "faint" });
const body = (x0, x1) => S(G.disc(sx(x0), sx(x1), R, F, P), { tone: "mid", crease: "lo", inner: threads(x0, x1) });
function rear() {
  const out = [];
  // strain relief, plastic cap with LED band
  out.push(S(G.disc(-6, 0, 3.4, F, P), { tone: "lo", inner: L(G.ribsOf(F, -5.6, -0.4, 3.4, 10, P, { seams: true }), { tone: "faint" }) }));
  out.push(S(G.disc(0, 4, 8.2, F, P), { tone: "lo", crease: "none" }));
  out.push(`<g data-part="led">${S(G.disc(4, 6.4, 8.4, F, P), { tone: "hi", crease: "none", className: "px-led" })}</g>`);
  out.push(S(G.disc(6.4, 10, 8.2, F, P), { tone: "lo", crease: "none" }));
  out.push(body(BODY_X, BR_X - 4));
  return out.join("");
}
const NUT = (x) => S(G.prismOf(F, Array.from({ length: 6 }, (_, i) => [Math.cos((i / 6) * 2 * Math.PI + Math.PI / 6) * 13, Math.sin((i / 6) * 2 * Math.PI + Math.PI / 6) * 13]), sx(x), sx(x + 3.4), P), { tone: "hi", crease: "lo" });
function bracket() {
  const out = [halo({ x: BR_X - 14, y: -16, w: 22, d: 32, r: 2 }, 0, 2)];
  // foot screwed to the plate, upright with a gusset
  out.push(S(k.slabOf({ x: BR_X - 16, y: -16, w: 20, d: 32, r: 1.5 }, 0, BR_T, P, 2, 0.4), { tone: "mid" }));
  out.push(screws([[BR_X - 11, -10], [BR_X - 11, 10]], BR_T, 1.6));
  out.push(NUT(BR_X - 4 - 3.4));
  out.push(body(BR_X - 4, BR_X));
  out.push(S(k.slabOf({ x: BR_X, y: -16, w: BR_T, d: 32, r: 0.6 }, BR_T, AXZ + 12 - BR_T, P, 2, 0.4), { tone: "mid", inner: L(k.planOutline({ x: BR_X - 0.01, y: -16, w: BR_T + 0.02, d: 32, r: 0.6 }, AXZ + 12, P, 2), { tone: "faint" }) }));
  return out.join("");
}
function front() {
  const out = [];
  out.push(body(BR_X + BR_T, BR_X + BR_T + 4));
  out.push(NUT(BR_X + BR_T));
  out.push(body(BR_X + BR_T + 3.4, FACE_X - 3));
  // sensing face: plastic cap with coil rings
  out.push(S(G.solidOf([[sx(FACE_X - 3), 0], [sx(FACE_X - 3), 8.6], [sx(FACE_X - 0.8), 8.6, 1], [sx(FACE_X), 7.6], [sx(FACE_X), 0]], F, P), { tone: "hi", crease: "lo" }));
  out.push(L([3, 5, 6.6].map((r) => G.circleOf(F, sx(FACE_X), r, P, 48)).join(""), { tone: "lo" }));
  return out.join("");
}
// field lobes in front of the face, brightened while the target is close
const field = () => `<g class="px-field" data-part="field">${[1.2, 2.6, 4, 5.2].map((s, i) => L(G.circleOf(F, sx(FACE_X) + s, 7 - i * 1.5, P, 48), { tone: "lo" })).join("")}</g>`;

function rail() {
  const out = [halo(RAIL, 0, RAIL_H)];
  out.push(S(k.slabOf(RAIL, RAIL_Z, RAIL_H, P, 2, 0.5), { tone: "mid", inner: L(k.planOutline(k.insetPlan(RAIL, 4), RAIL_H, P, 2), { tone: "faint" }) }));
  out.push(screws([[RAIL.x + 4, 0], [RAIL.x + RAIL.w - 4, 0]], RAIL_H, 1.2));
  out.push(S(k.slabOf({ x: RAIL.x + RAIL.w - 3, y: -9, w: 3, d: 18, r: 0.6 }, RAIL_H, 6, P, 2, 0.3), { tone: "lo" })); // end stop
  return out.join("");
}
function target() {
  const out = [];
  const c = { ...CARR, x: CARR.x };
  out.push(halo(c, CARR_Z, CARR_H));
  out.push(S(k.slabOf(c, CARR_Z, CARR_H, P, 2, 0.5), { tone: "mid" }));
  out.push(screws([[c.x + 8, c.y + 3], [c.x + 8, c.y + c.d - 3]], CARR_Z + CARR_H, 1));
  out.push(S(k.slabOf(FLAG, FLAG_Z, FLAG_H, P, 2, 0.3), { tone: "hi", lit: true }));
  // thumb knob on the carriage
  out.push(S(k.cylinder(c.x + 8, 0, 2.6, CARR_Z + CARR_H, 3, P, 24, 0.3), { tone: "mid", inner: L(k.knurl(c.x + 8, 0, 2.6, CARR_Z + CARR_H + 0.4, CARR_Z + CARR_H + 2.6, 16, P), { tone: "lo" }) }));
  return out.join("");
}

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "An M18 inductive proximity sensor clamped by two lock nuts in a bracket, its cable running to a PLC input card. A steel target on a slide moves toward and away from the sensing face. When the target is within the 5 mm sensing distance the sensor output switches on, its LED lights and the PLC input lights; it switches off again past 5.5 mm.",
  body: [plate(), card(), cable(), rear(), bracket(), front(), field(), rail(), `<g data-part="target">${target()}</g>`],
});

const EX = k.axisVector(P, [1, 0, 0]);
const CSS = `
.px-mark{fill:none;stroke:var(--anatomy-red);stroke-width:1.2;stroke-linecap:round}
.px-cable-body{fill:none;stroke:var(--anatomy-lo);stroke-width:3.6;stroke-linecap:round;stroke-linejoin:round}
.px-cable-core{fill:none;stroke:var(--anatomy-card);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.px-sig{fill:none;stroke:#e5a50a;stroke-width:1.1;stroke-dasharray:2 5;opacity:0;transition:opacity .2s}
.px-fig[data-on] .px-sig{opacity:1;animation:px-sig .5s linear infinite}
@keyframes px-sig{to{stroke-dashoffset:7}}
.px-in{fill:var(--anatomy-card);stroke:var(--anatomy-lo);stroke-width:.6;transition:fill .15s}
.px-fig[data-on] [data-part="plc-led"]{fill:#30a46c}
.px-fig[data-on] [data-part="led"] path{fill:#f5a623!important}
.px-field{opacity:.35;transition:opacity .25s}
.px-field .iso-line{stroke:#3e8fdd}
.px-fig[data-near] .px-field{opacity:1}
.px-stage{cursor:ew-resize;touch-action:pan-y}
@media (prefers-reduced-motion:reduce){.px-sig{animation:none!important}}
`;
const live = `(() => {
const fig = document.currentScript.previousElementSibling;
const stage = fig.querySelector(".px-stage"), svg = stage.querySelector("svg");
const tg = svg.querySelector('[data-part="target"]'), readout = fig.querySelector("[data-readout]");
const EX = ${JSON.stringify(EX)}, SN = ${SN}, HYST = ${HYST}, TRAVEL = ${TRAVEL};
const still = matchMedia("(prefers-reduced-motion: reduce)");
let gap = 12, goal = 12, on = false, held = false, t = 0, visible = false, frame = 0, last = 0, idle = 0;
function draw() {
  tg.setAttribute("transform", "translate(" + (EX[0] * gap).toFixed(2) + " " + (EX[1] * gap).toFixed(2) + ")");
  if (!on && gap <= SN) on = true; else if (on && gap > SN + HYST) on = false;
  on ? fig.setAttribute("data-on", "") : fig.removeAttribute("data-on");
  gap < SN * 1.6 ? fig.setAttribute("data-near", "") : fig.removeAttribute("data-near");
  const text = "ระยะ " + gap.toFixed(1) + " mm · " + (on ? "ON · PLC อินพุตติด" : "OFF") + " · Sn 5 mm";
  if (readout.textContent !== text) readout.textContent = text;
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60; last = now; t += dt;
  if (!held && (idle += dt) > 1.5) goal = 8 + 7 * Math.sin(t * 0.7);
  gap += (goal - gap) * (still.matches ? 1 : 1 - Math.exp(-dt / 0.25));
  draw();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; visible ? run() : (cancelAnimationFrame(frame), (frame = 0)); }, { rootMargin: "80px 0px" }).observe(stage);
const fromPointer = (e) => { const r = stage.getBoundingClientRect(); goal = Math.max(0.5, Math.min(TRAVEL, ((e.clientX - r.left) / r.width - 0.5) * 2.2 * TRAVEL)); held = true; idle = 0; run(); };
stage.addEventListener("pointermove", fromPointer);
stage.addEventListener("pointerdown", fromPointer);
stage.addEventListener("pointerleave", () => { held = false; idle = 0; });
stage.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); goal = Math.max(0.5, Math.min(TRAVEL, gap + (e.key === "ArrowRight" ? 1 : -1))); held = true; idle = 0; run(); } });
stage.addEventListener("blur", () => { held = false; });
draw();
})();`;

const figure = k.plateHtml({
  fig: "Fig 1",
  title: "Proximity sensor",
  hint: "เลื่อนเมาส์ซ้าย-ขวาเพื่อขยับชิ้นงาน",
  readout: "ระยะ 12.0 mm · OFF · Sn 5 mm",
  keys: [
    { mark: "lit", label: "ชิ้นงานโลหะ (Target)" },
    { mark: "red", label: "ระยะตรวจจับ Sn 5 mm" },
    { mark: "green", label: "อินพุต PLC ติดเมื่อเซ็นเซอร์ ON" },
  ],
  caption: "Inductive Proximity Sensor ขนาด M18 ยึดด้วยน็อตล็อก 2 ตัว หน้าเซ็นเซอร์ปล่อยสนามแม่เหล็กไฟฟ้าความถี่สูงออกมา เมื่อชิ้นงานโลหะเข้ามาใกล้ภายในระยะ 5 mm สนามถูกดูดพลังงาน วงจรภายในสั่งเอาต์พุต ON ไฟ LED ท้ายเซ็นเซอร์และอินพุต PLC ติด และจะดับเมื่อถอยออกเกิน 5.5 mm (Hysteresis ป้องกันสัญญาณกระพือ)",
  body: `<div class="iso-stage px-stage" tabindex="0" role="slider" aria-label="ระยะชิ้นงานจากหน้าเซ็นเซอร์ (ใช้ปุ่มลูกศรซ้าย-ขวา)" aria-valuemin="0" aria-valuemax="${TRAVEL}">${svg}</div>`,
});

const fragment = `<div class="iso px-fig" data-theme="light"><style>${k.ISO_CSS}${CSS}</style>${figure}</div><script>${live}</script>`;
writeFileSync(join(HERE, "proximity-sensor.fragment.html"), fragment);
writeFileSync(join(HERE, "proximity-sensor.html"), `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Proximity sensor</title><style>body{margin:0;background:#f2f2ef;padding:32px 16px}.px-fig{max-width:740px;margin:0 auto}</style></head><body>${fragment}</body></html>`);
console.log("wrote", (fragment.length / 1024).toFixed(1) + " KB fragment");

if (process.argv.includes("--inject")) {
  const file = join(HERE, "../../../src/data/pages.json");
  const raw = readFileSync(file, "utf8");
  const pages = JSON.parse(raw);
  const page = pages.find((p) => p.route === "proximity-sensor");
  const marked = /<!-- fig:proximity-sensor -->[\s\S]*?<!-- \/fig:proximity-sensor -->/;
  if (!page || !marked.test(page.html)) throw new Error("proximity-sensor: figure marker not found");
  page.html = page.html.replace(marked, () => `<!-- fig:proximity-sensor -->\n${fragment}\n<!-- /fig:proximity-sensor -->`);
  writeFileSync(file, JSON.stringify(pages, null, 2) + (raw.endsWith("\n") ? "\n" : ""));
  console.log("injected into proximity-sensor");
}
