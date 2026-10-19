// Fig: an 8-pin plug-in relay with its cover off, on a DIN-rail socket. A push button feeds 24 V
// to the coil; the core pulls the armature down, the moving contact (COM) leaves NC and lands on NO,
// so the red NC lamp goes out and the green NO lamp lights. Release and the spring pulls it back.
// `node scripts/figures/relay/build.mjs [--inject]`
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 640;
const HEIGHT = 380;

const PLATE = { x: -72, y: -32, w: 132, d: 62, r: 7 };
const PLATE_H = 7;
const FOOT_H = 4;

const RAIL = { x: -62, y: -16, w: 76, d: 10, r: 0.6 };
const RAIL_H = 2.4;
const SOCK = { x: -42, y: -26, w: 44, d: 30, r: 1.5 };
const SOCK_Z = RAIL_H, SOCK_H = 10;
const BASE = { x: -35, y: -19, w: 30, d: 16, r: 1 };
const BASE_Z = SOCK_Z + SOCK_H, BASE_H = 3;
const FLOOR = BASE_Z + BASE_H;
const COIL = [-24, -11]; // coil axis (vertical)
const COIL_R = 6.5, COIL_H = 20;
const ARM = { x: -31, y: -14, w: 24, d: 6, r: 0.6 }; // armature + moving contact blade
const ARM_Z = FLOOR + COIL_H + 2.6; // at rest (coil off), resting under NC
const PULL = 3; // armature travel when energised
const TIP_X = ARM.x + ARM.w; // contact end of the blade
const POST_X = TIP_X + 2;

// push button (24 V coil feed) and two pilot lamps
const PB = { x: -64, y: 10, w: 18, d: 18, r: 2 };
const PB_H = 10;
const LAMPS = { nc: [42, -16], no: [42, 14] };
const LAMP_H = 12;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [-24, -11, ARM_Z + 6], [42, -16, LAMP_H + 4]],
  WIDTH,
  HEIGHT,
  { pad: 22, azimuth: 40, elevation: 32 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const poly = (pts) => k.pathOf(pts.map(at));
const halo = (plan, z, h) => `<path class="iso-halo" d="${k.haloOf(plan, z, h, P)}" style="filter:blur(3px)"/>`;
const screws = (pts, z, r = 1.3) => L(pts.map(([x, y]) => k.ring(x, y, r, z, P, 14)).join(""), { tone: "lo" }) + D(pts.map(([x, y]) => at([x, y, z])), { size: 0.4 });
const topText = (x, y, z, text, size = 2.2, tone = "lo") => k.faceTextSvg(k.topMatrix([x, y], z, P, "x"), text, { size, tone, anchor: "middle" });

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

// DIN rail with mounting slots, socket with 8 terminal screws (A1 A2 on the back row)
const TERM = {
  a2: [SOCK.x + 6, SOCK.y + 4], x1: [SOCK.x + 14, SOCK.y + 4], x2: [SOCK.x + 30, SOCK.y + 4], nc: [SOCK.x + 38, SOCK.y + 4],
  a1: [SOCK.x + 6, SOCK.y + SOCK.d - 4], com: [SOCK.x + 14, SOCK.y + SOCK.d - 4], x3: [SOCK.x + 30, SOCK.y + SOCK.d - 4], no: [SOCK.x + 38, SOCK.y + SOCK.d - 4],
};
function rail() {
  const out = [S(k.slabOf(RAIL, 0, RAIL_H, P, 2, 0.3), { tone: "lo" })];
  out.push(L(k.planOutline(k.insetPlan(RAIL, 2.2), RAIL_H, P, 2), { tone: "faint" }));
  for (let x = RAIL.x + 6; x < RAIL.x + RAIL.w - 4; x += 12) if (x < SOCK.x - 3 || x > SOCK.x + SOCK.w + 1) out.push(L(k.onTop(k.roundedPlan({ x, y: RAIL.y + 3.2, w: 6, d: 3.6, r: 1.6 }, 4), RAIL_H, P, true), { tone: "lo" }));
  return out.join("");
}
function socket() {
  const out = [halo(SOCK, SOCK_Z, SOCK_H)];
  out.push(S(k.slabOf(SOCK, SOCK_Z, SOCK_H, P, 2, 0.6), { tone: "mid", inner: L(k.sideSeam(SOCK, SOCK_Z + 4, P, 2), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(BASE, -1.6), SOCK_Z + SOCK_H, P, 2), { tone: "lo" }));
  out.push(screws(Object.values(TERM), SOCK_Z + SOCK_H, 1.7));
  for (const [name, [x, y]] of Object.entries(TERM)) if (!name.startsWith("x")) out.push(topText(x, y + (y < SOCK.y + 10 ? 3.4 : -2.4), SOCK_Z + SOCK_H, name.toUpperCase(), 1.6));
  return out.join("");
}
// relay base, coil, yoke and the two fixed contacts
function relayBack() {
  const out = [S(k.slabOf(BASE, BASE_Z, BASE_H, P, 2, 0.4), { tone: "lo" })];
  // L-shaped yoke behind the coil, hinge for the armature on its top
  out.push(S(k.slabOf({ x: ARM.x - 3, y: ARM.y, w: 3, d: ARM.d, r: 0.4 }, FLOOR, ARM_Z - FLOOR - 0.3, P, 2, 0.3), { tone: "mid" }));
  // coil: bobbin flanges and the winding with turns
  out.push(S(k.cylinder(...COIL, COIL_R + 1.2, FLOOR, 1.2, P, 32, 0.3), { tone: "mid" }));
  const turns = Array.from({ length: 12 }, (_, i) => k.sideArc(...COIL, COIL_R, FLOOR + 2 + i * 1.05, P)).join("");
  out.push(S(k.cylinder(...COIL, COIL_R, FLOOR + 1.2, COIL_H - 2.4, P, 32), { tone: "hi", inner: L(turns, { tone: "faint" }), className: "ry-coil" }));
  out.push(S(k.cylinder(...COIL, COIL_R + 1.2, FLOOR + COIL_H - 1.2, 1.2, P, 32, 0.3), { tone: "mid" }));
  out.push(S(k.cylinder(...COIL, 2.2, FLOOR + COIL_H, 0.6, P, 24), { tone: "lo" })); // core face
  // NO contact post (below the blade tip)
  out.push(S(k.slabOf({ x: POST_X, y: ARM.y + 1, w: 2, d: 4, r: 0.3 }, FLOOR, ARM_Z - PULL - FLOOR - 1.2, P, 2, 0.2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: TIP_X - 2.4, y: ARM.y + 1.4, w: POST_X - TIP_X + 4.4, d: 3.2, r: 0.4 }, ARM_Z - PULL - 1.2, 1, P, 2, 0.2), { tone: "mid", className: "ry-pad", inner: "" }) .replace('class="iso-solid', 'data-pad="no" class="iso-solid'));
  out.push(S(k.slabOf({ x: TIP_X - 6.2, y: ARM.y + 1.6, w: 2.4, d: 2.8, r: 0.3 }, FLOOR, 0.8, P, 2), { tone: "lo" })); // spring seat
  return out.join("");
}
// vertical return spring between its seat and the armature, ends dotted onto both
const helix = (top) => { const [cx, cy] = [TIP_X - 5, ARM.y + 3], z0 = FLOOR + 0.8, n = 7 * 16; const pts = Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * 7 * 2 * Math.PI; return [cx + 1.2 * Math.cos(a), cy + 1.2 * Math.sin(a), z0 + (top - z0) * (i / n)]; }); return L(poly(pts), { tone: "lo" }) + D([at(pts[0]), at(pts.at(-1))], { size: 0.4 }); };
const SPRINGS = [helix(ARM_Z), helix(ARM_Z - PULL)];
const armature = () => S(k.slabOf(ARM, ARM_Z, 1.2, P, 2, 0.2), { tone: "hi", lit: true }) + D([at([TIP_X - 1.2, ARM.y + 3, ARM_Z + 1.2])], { size: 0.9 });
function relayFront() {
  const out = [];
  // NC contact: post rising past the blade, pad hanging over the tip
  out.push(S(k.slabOf({ x: POST_X, y: ARM.y + 1, w: 2, d: 4, r: 0.3 }, FLOOR, ARM_Z + 2.4 - FLOOR, P, 2, 0.2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: TIP_X - 2.4, y: ARM.y + 1.4, w: POST_X - TIP_X + 4.4, d: 3.2, r: 0.4 }, ARM_Z + 1.4, 1, P, 2, 0.2), { tone: "mid" }).replace('class="iso-solid', 'data-pad="nc" class="iso-solid'));
  // status LED on the base front
  out.push(`<path class="ry-led" d="${k.onTop(k.roundedPlan({ x: BASE.x + BASE.w - 5, y: BASE.y + BASE.d - 4, w: 3, d: 2.4, r: 0.8 }, 3), FLOOR + 0.01, P, true)}"/>`);
  return out.join("");
}

function button() {
  const out = [halo(PB, 0, PB_H)];
  out.push(S(k.slabOf(PB, 0, PB_H, P, 2, 0.6), { tone: "mid", inner: L(k.sideSeam(PB, 4, P, 2), { tone: "faint" }) }));
  out.push(screws(k.corners(PB, 2.4), PB_H, 0.9));
  out.push(S(k.cylinder(PB.x + 9, PB.y + 9, 6, PB_H, 1.4, P, 32, 0.3), { tone: "lo" }));
  out.push(`<g data-part="cap">${S(k.cylinder(PB.x + 9, PB.y + 9, 4.4, PB_H + 1.4, 3, P, 32, 0.4), { tone: "hi", className: "ry-cap" })}</g>`);
  out.push(topText(PB.x + 9, PB.y + 16.4, PB_H, "24V", 1.8));
  return out.join("");
}
function lamp(name) {
  const [x, y] = LAMPS[name];
  const out = [halo({ x: x - 7, y: y - 7, w: 14, d: 14, r: 7 }, 0, LAMP_H)];
  out.push(S(k.cylinder(x, y, 7, 0, 2, P, 32, 0.4), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, 5.4, 2, LAMP_H - 4, P, 32, 0.4), { tone: "mid", inner: L(k.sideArc(x, y, 5.4, 6, P), { tone: "faint" }) }));
  out.push(S(k.cylinder(x, y, 4.6, LAMP_H - 2, 3.4, P, 32, 1.4), { tone: "hi", className: `ry-lens ry-lens-${name}` }));
  out.push(topText(x, y + 9.6, 0, name.toUpperCase(), 2));
  return out.join("");
}
// cables: bezier from a terminal screw to the device, drawn as an insulated core
function bez(p0, c1, c2, p3, n = 24) { return Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [0, 1, 2].map((j) => u * u * u * p0[j] + 3 * u * u * t * c1[j] + 3 * u * t * t * c2[j] + t * t * t * p3[j]); }); }
const ST = SOCK_Z + SOCK_H;
const cable = (from, fz, to, tz, lift, name) => { const d = poly(bez([...from, fz], [...from, fz + lift], [to[0], to[1], tz + lift], [...to, tz])); return `<g class="ry-cable" data-wire="${name}"><path class="ry-cable-body" d="${d}"/><path class="ry-cable-core" d="${d}"/></g>`; };
const cables = () => [
  cable(TERM.nc, ST, [LAMPS.nc[0] - 3, LAMPS.nc[1]], LAMP_H - 2, 10, "nc"),
  cable([PB.x + 15, PB.y + 3], PB_H, TERM.a1, ST, 12, "coil"),
  cable(TERM.no, ST, [LAMPS.no[0] - 3, LAMPS.no[1]], LAMP_H - 2, 10, "no"),
].join("");

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A plug-in relay with its cover off, on a DIN-rail socket. A 24 V push button is wired to the coil terminal A1, the NC terminal to a red lamp and the NO terminal to a green lamp. Pressing the button energises the coil, the core pulls the armature down, the moving contact leaves NC and touches NO: the red lamp goes out and the green lamp lights. Releasing the button lets the spring return the contact to NC.",
  body: [plate(), rail(), socket(), relayBack(), `<g data-part="spring">${SPRINGS[0]}</g>`, `<g data-part="arm">${armature()}</g>`, relayFront(), lamp("nc"), button(), cables(), lamp("no")],
});

const EZ = k.axisVector(P, [0, 0, 1]);
const CSS = `
.ry-cable-body{fill:none;stroke:var(--anatomy-lo);stroke-width:2.6;stroke-linecap:round}
.ry-cable-core{fill:none;stroke:var(--anatomy-card);stroke-width:1.2;stroke-linecap:round;transition:stroke .15s}
.ry-fig[data-on] [data-wire="coil"] .ry-cable-core,.ry-fig[data-on] [data-wire="no"] .ry-cable-core{stroke:#30a46c}
.ry-fig:not([data-on]) [data-wire="nc"] .ry-cable-core{stroke:#e5484d}
.ry-led{fill:var(--anatomy-card);stroke:var(--anatomy-lo);stroke-width:.5}
.ry-fig[data-on] .ry-led{fill:#e5a50a}
.ry-fig[data-on] .ry-coil :is(.iso-fill,.iso-shade,.iso-top){fill:#f6e7c8!important}

.ry-fig:not([data-on]) .ry-lens-nc :is(.iso-fill,.iso-shade,.iso-top){fill:#f2a7a9!important}
.ry-fig[data-on] .ry-lens-no :is(.iso-fill,.iso-shade,.iso-top){fill:#9fdcb9!important}
.ry-stage{cursor:pointer;touch-action:manipulation}
`;
const live = `(() => {
const fig = document.currentScript.previousElementSibling;
const stage = fig.querySelector(".ry-stage"), svg = stage.querySelector("svg");
const arm = svg.querySelector('[data-part="arm"]'), spring = svg.querySelector('[data-part="spring"]'), cap = svg.querySelector('[data-part="cap"]');
const readout = fig.querySelector("[data-readout]");
const EZ = ${JSON.stringify(EZ)}, PULL = ${PULL}, SPRINGS = ${JSON.stringify(SPRINGS)};
const still = matchMedia("(prefers-reduced-motion: reduce)");
let coil = false, pos = 0, held = false, t = 0, visible = false, frame = 0, last = 0, idle = 0;
const mv = (s) => "translate(" + (EZ[0] * s).toFixed(2) + " " + (EZ[1] * s).toFixed(2) + ")";
function draw() {
  arm.setAttribute("transform", mv(-pos * PULL));
  const sp = pos > 0.5 ? 1 : 0; if (spring.dataset.s != sp) { spring.innerHTML = SPRINGS[sp]; spring.dataset.s = sp; }
  cap.setAttribute("transform", mv(coil ? -1.4 : 0));
  const contact = pos > 0.95 ? "no" : pos < 0.05 ? "nc" : "";
  contact === "no" ? fig.setAttribute("data-on", "") : fig.removeAttribute("data-on");
  const text = "คอยล์ " + (coil ? "ON" : "OFF") + " · " + (contact === "no" ? "COM–NO ต่อ · ไฟเขียวติด" : contact === "nc" ? "COM–NC ต่อ · ไฟแดงติด" : "หน้าสัมผัสกำลังสลับ");
  if (readout.textContent !== text) readout.textContent = text;
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60; last = now; t += dt;
  if (!held && (idle += dt) > 2.2) { coil = !coil; idle = 0; }
  pos += ((coil ? 1 : 0) - pos) * (still.matches ? 1 : 1 - Math.exp(-dt / 0.035));
  draw();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; visible ? run() : (cancelAnimationFrame(frame), (frame = 0)); }, { rootMargin: "80px 0px" }).observe(stage);
const toggle = () => { coil = !coil; held = true; idle = 0; run(); };
stage.addEventListener("click", toggle);
stage.addEventListener("pointerleave", () => { held = false; });
stage.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } });
draw();
})();`;

const figure = k.plateHtml({
  fig: "Fig 1",
  title: "Relay",
  hint: "คลิกเพื่อกดปุ่มจ่ายไฟเข้าคอยล์",
  readout: "คอยล์ OFF · COM–NC ต่อ · ไฟแดงติด",
  keys: [
    { mark: "lit", label: "อาร์เมเจอร์และหน้าสัมผัสเคลื่อนที่ (COM)" },
    { mark: "red", label: "วงจร NC ต่ออยู่เมื่อคอยล์ไม่มีไฟ" },
    { mark: "green", label: "วงจรคอยล์และ NO เมื่อจ่ายไฟ 24 V" },
  ],
  caption: "รีเลย์แบบเสียบซ็อกเก็ตที่ถอดฝาครอบออก เมื่อกดปุ่มจ่ายไฟ 24 V เข้าขา A1–A2 คอยล์กลายเป็นแม่เหล็กดูดอาร์เมเจอร์ลง หน้าสัมผัส COM จากเดิมที่แตะ NC (ไฟแดงติด) ย้ายลงไปแตะ NO (ไฟเขียวติด) เมื่อปล่อยปุ่ม สปริงดึงหน้าสัมผัสกลับไปที่ NC",
  body: `<div class="iso-stage ry-stage" tabindex="0" role="button" aria-label="จ่ายหรือตัดไฟเข้าคอยล์รีเลย์ (กด Space)">${svg}</div>`,
});

const fragment = `<div class="iso ry-fig" data-theme="light"><style>${k.ISO_CSS}${CSS}</style>${figure}</div><script>${live}</script>`;
writeFileSync(join(HERE, "relay.fragment.html"), fragment);
writeFileSync(join(HERE, "relay.html"), `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Relay</title><style>body{margin:0;background:#f2f2ef;padding:32px 16px}.ry-fig{max-width:740px;margin:0 auto}</style></head><body>${fragment}</body></html>`);
console.log("wrote", (fragment.length / 1024).toFixed(1) + " KB fragment");

if (process.argv.includes("--inject")) {
  const file = join(HERE, "../../../src/data/pages.json");
  const raw = readFileSync(file, "utf8");
  const pages = JSON.parse(raw);
  const page = pages.find((p) => p.route === "relay");
  const marked = /<!-- fig:relay -->[\s\S]*?<!-- \/fig:relay -->/;
  if (!page || !marked.test(page.html)) throw new Error("relay: figure marker not found");
  page.html = page.html.replace(marked, () => `<!-- fig:relay -->\n${fragment}\n<!-- /fig:relay -->`);
  writeFileSync(file, JSON.stringify(pages, null, 2) + (raw.endsWith("\n") ? "\n" : ""));
  console.log("injected into relay");
}
