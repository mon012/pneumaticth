// Fig: 5/2 single-solenoid valve, top half cut away — the coil pulls the spool, the spring returns it,
// and the lands between the five ports switch P→B / A→EA (coil off) to P→A / B→EB (coil on).
// `node scripts/figures/solenoid-valve/build.mjs [--inject]` writes solenoid-valve.html (preview),
// solenoid-valve.fragment.html, and with --inject puts the fragment into the solenoid-valve page.
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WIDTH = 640;
const HEIGHT = 380;

// ── world ──
const PLATE = { x: -112, y: -30, w: 250, d: 104, r: 8 };
const PLATE_H = 8;
const FOOT_H = 4;

const BODY = { x: -62, y: -16, w: 136, d: 32, r: 2 }; // valve body, cut at the bore axis
const CUT = 14; // cut plane = bore axis height
const BORE = { x: -60, y: -7, w: 130, d: 14, r: 1 };
const SPOOL_R = 6;
const SHAFT_R = 3.2;
const LANDS = [-40, -8, 24, 54]; // land centres at rest
const LAND_W = 6;
const SHIFT = -16; // spool travel when the coil pulls
const SPOOL_FROM = -44;
const SPOOL_TO = 58;
const SPRING_END = 70;
const PORTS = [
  { x: -32, name: "EA", kind: "ex" },
  { x: -16, name: "A", kind: "work" },
  { x: 0, name: "P", kind: "supply" },
  { x: 16, name: "B", kind: "work" },
  { x: 32, name: "EB", kind: "ex" },
];
const FRONT = BODY.y + BODY.d;
const PORT_Z = 7;

const COIL = { x: -96, y: -17, w: 32, d: 34, r: 2 };
const COIL_H = 32;
const PLUG = { x: -90, y: -10, w: 18, d: 20, r: 2 };

const CYL = { x: 26, y: 50, w: 64, d: 20, r: 2 };
const CYL_Z = 4;
const CYL_H = 20;
const CAP_W = 6;
const ROD_R = 2.8;
const STROKE = 26;
const AXIS = [CYL.y + CYL.d / 2, CYL_Z + CYL_H / 2];
const CPORT_A = [CYL.x + 10, AXIS[0]];
const CPORT_B = [CYL.x + CYL.w - 10, AXIS[0]];

const INLET = { x: -70, y: 32, w: 18, d: 12, r: 2 }; // supply block, left of the valve

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [COIL.x, COIL.y, COIL_H + 8], [CYL.x + CYL.w + STROKE + 10, AXIS[0], AXIS[1]]],
  WIDTH,
  HEIGHT,
  { pad: 24, azimuth: 38, elevation: 32 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const poly = (pts) => k.pathOf(pts.map(at));
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const screws = (pts, z, r = 1.6) => L(pts.map(([x, y]) => k.ring(x, y, r, z, P, 14)).join(""), { tone: "lo" }) + D(pts.map(([x, y]) => at([x, y, z])), { size: 0.4 });
const topText = (x, y, z, text, size = 2.6, tone = "mid") => k.faceTextSvg(k.topMatrix([x, y], z, P, "x"), text, { size, tone, anchor: "middle" });
const led = (p, name, r = 1.3) => { const [x, y] = at(p); return `<circle class="sv-led" data-led="${name}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}"/>`; };
function bezFrom(p0, c1, c2, p3, n) { return Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [0, 1, 2].map((j) => u * u * u * p0[j] + 3 * u * u * t * c1[j] + 3 * u * t * t * c2[j] + t * t * t * p3[j]); }); }

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 18))) {
    out.push(S(k.cylinder(x, y, 6, -PLATE_H - FOOT_H, 1.4, P, 24), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 4.6, -PLATE_H - FOOT_H + 1.4, FOOT_H - 1.4, P, 24), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.2), { tone: "mid", inner: L(k.sideSeam(PLATE, -PLATE_H / 2, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "faint" }));
  out.push(screws(k.corners(PLATE, 9), 0));
  return out.join("");
}

// ── valve body, cut open along the bore ──
function body() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BODY, 0, CUT, P)}" style="filter:blur(3px)"/>`];
  out.push(S(k.slabOf(BODY, 0, CUT, P, 3, 0.8), { tone: "mid", inner: L(k.sideSeam(BODY, 3, P, 3), { tone: "faint" }) }));
  // the bore trough and the five port passages, cut through the body
  out.push(S(k.slabOf(BORE, CUT - 0.01, 0.01, P, 2), { tone: "lo", flat: true, crease: "none" }));
  out.push(L(k.planOutline(BORE, CUT, P, 2), { tone: "lo" }));
  for (const port of PORTS) {
    const slot = { x: port.x - 3, y: BORE.y + BORE.d, w: 6, d: FRONT - (BORE.y + BORE.d) - 0.01, r: 0.4 };
    out.push(S(k.slabOf(slot, CUT - 0.01, 0.01, P, 2), { tone: "lo", flat: true, crease: "none" }));
    out.push(L(k.lineOnTop([slot.x, slot.y], [slot.x, FRONT], CUT, P) + k.lineOnTop([slot.x + 6, slot.y], [slot.x + 6, FRONT], CUT, P), { tone: "lo" }));
    out.push(topText(port.x, BODY.y + 4.4, CUT, port.name, 2.6, port.kind === "supply" ? "hi" : "mid"));
  }
  // mounting screws on the cut face
  out.push(screws([[BODY.x + 4, BODY.y + 4], [BODY.x + BODY.w - 4, BODY.y + 4]], CUT, 1.4));
  return out.join("");
}

// ── air paths drawn on the cut face, one per connection ──
const FLOW_Y = BORE.y + BORE.d - 1.6;
const flowPath = (from, to) => poly([[from, FRONT, CUT + 0.2], [from, FLOW_Y, CUT + 0.2], [to, FLOW_Y, CUT + 0.2], [to, FRONT, CUT + 0.2]]);
const FLOWS = {
  off: [{ d: flowPath(0, 16), kind: "in" }, { d: flowPath(-16, -32), kind: "out" }],
  on: [{ d: flowPath(0, -16), kind: "in" }, { d: flowPath(16, 32), kind: "out" }],
};
const flows = () => ["off", "on"].map((state) => `<g class="sv-flows" data-state="${state}">${FLOWS[state].map((f) => `<path class="sv-flow" data-kind="${f.kind}" d="${f.d}"/>`).join("")}</g>`).join("");

// ── spool: shaft with four lands, lying in the bore ──
const F = G.frameAlong([0, 0, CUT], [1, 0, 0]);
function spool() {
  const out = [S(G.disc(SPOOL_FROM, SPOOL_TO, SHAFT_R, F, P), { tone: "hi", crease: "none" })];
  for (const c of LANDS) out.push(S(G.disc(c - LAND_W / 2, c + LAND_W / 2, SPOOL_R, F, P), { tone: "hi", lit: true }));
  out.push(S(G.disc(SPOOL_TO - 1, SPOOL_TO, SHAFT_R + 1.6, F, P), { tone: "mid" })); // spring seat
  return out.join("");
}
// spring between the spool end and the end cap — one path set per spool position
const SPRING_STEPS = 17;
const springs = Array.from({ length: SPRING_STEPS }, (_, i) => {
  const s = (SHIFT * i) / (SPRING_STEPS - 1);
  return k.coil(SPOOL_TO + s, SPRING_END, [0, CUT], 4.4, 6, "x", P);
});
const springSvg = (half) => `<path class="iso-line" data-part="spring-${half}" data-tone="${half === "front" ? "hi" : "lo"}" d="${springs[0][half]}" style="stroke-width:${half === "front" ? 1 : 0.8}"/>`;

// ── fittings on the front face: push-ins on A, B, P; silencers on EA, EB ──
function fittings() {
  const out = [];
  for (const port of byDepth(PORTS.map((p) => [p.x, FRONT, p])).map((p) => p[2])) {
    const Fp = G.frameAlong([port.x, FRONT, PORT_Z], [0, 1, 0]);
    if (port.kind === "ex") {
      out.push(S(G.disc(0, 2, 3.2, Fp, P), { tone: "mid" }));
      out.push(S(G.disc(2, 9, 3, Fp, P), { tone: "lo", inner: L(G.ribsOf(Fp, 2.4, 8.6, 3, 14, P), { tone: "faint" }) }));
      out.push(S(G.disc(9, 10, 2.2, Fp, P), { tone: "mid" }));
    } else {
      out.push(S(G.disc(0, 2.4, 3.6, Fp, P), { tone: "mid" }));
      out.push(S(G.disc(2.4, 5.2, 3, Fp, P), { tone: "lo" }));
    }
  }
  return out.join("");
}

// ── solenoid operator on the left end ──
function solenoid() {
  const out = [`<path class="iso-halo" d="${k.haloOf(COIL, 0, COIL_H, P)}" style="filter:blur(3px)"/>`];
  out.push(`<g class="sv-coil-glow" data-part="coil">${S(k.slabOf(COIL, 0, COIL_H, P, 3, 0.8), { tone: "hi", crease: "lo", inner: L(k.sideSeam(COIL, 6, P, 3) + k.sideSeam(COIL, COIL_H - 6, P, 3), { tone: "faint" }) })}</g>`);
  out.push(screws(k.corners(COIL, 3).filter((_, i) => i !== 1), COIL_H, 1.2));
  // DIN connector plug with cable gland and LED
  out.push(S(k.slabOf(PLUG, COIL_H, 8, P, 3, 0.5), { tone: "mid" }));
  out.push(D([at([PLUG.x + PLUG.w / 2, PLUG.y + PLUG.d / 2, COIL_H + 8])], { size: 0.7 }));
  out.push(L(k.ring(PLUG.x + PLUG.w / 2, PLUG.y + PLUG.d / 2, 2.2, COIL_H + 8, P, 16), { tone: "lo" }));
  out.push(led([PLUG.x + PLUG.w - 3, PLUG.y + PLUG.d, COIL_H + 4.4], "coil"));
  const Fg = G.frameAlong([PLUG.x, PLUG.y + PLUG.d / 2, COIL_H + 4], [-1, 0, 0]);
  out.push(S(G.disc(0, 4, 3, Fg, P), { tone: "mid" }));
  // manual override on the end plate
  out.push(S(k.cylinder(COIL.x + COIL.w - 6, COIL.y + 5, 2.4, COIL_H, 1.2, P, 18), { tone: "mid" }));
  out.push(L(k.lineOnTop([COIL.x + COIL.w - 8, COIL.y + 5], [COIL.x + COIL.w - 4, COIL.y + 5], COIL_H + 1.2, P), { tone: "lo" }));
  return out.join("");
}
// end cap on the spring side
function endCap() {
  const cap = { x: BODY.x + BODY.w, y: BODY.y, w: 6, d: BODY.d, r: 2 };
  return S(k.slabOf(cap, 0, CUT + 10, P, 3, 0.6), { tone: "mid" }) + D(k.corners(cap, 2).map(([x, y]) => at([x, y, CUT + 10])), { size: 0.45 });
}
// the cut-away upper half of the coil side end plate (the solenoid sits against a full-height flange)
function flange() {
  const fl = { x: BODY.x - 2, y: BODY.y, w: 4, d: BODY.d, r: 1 };
  return S(k.slabOf(fl, 0, CUT + 10, P, 2, 0.4), { tone: "mid" });
}

// ── what the valve drives: a small double-acting cylinder ──
const CF = G.frameAlong([CYL.x + CYL.w, AXIS[0], AXIS[1]], [1, 0, 0]);
const ROD = G.rodOut(CF, 0, 4, ROD_R, P, { stroke: STROKE });
function cylinderBody() {
  const out = [`<path class="iso-halo" d="${k.haloOf(CYL, 0, CYL_Z + CYL_H, P)}" style="filter:blur(3px)"/>`];
  for (const x of [CYL.x + 2, CYL.x + CYL.w - 10]) out.push(S(k.slabOf({ x, y: CYL.y - 2, w: 8, d: CYL.d + 4, r: 1 }, 0, CYL_Z, P, 2, 0.4), { tone: "lo" }));
  const caps = [{ x: CYL.x, y: CYL.y - 1, w: CAP_W, d: CYL.d + 2, r: 1.5 }, { x: CYL.x + CYL.w - CAP_W, y: CYL.y - 1, w: CAP_W, d: CYL.d + 2, r: 1.5 }];
  const barrel = { x: CYL.x + CAP_W, y: CYL.y + 1, w: CYL.w - 2 * CAP_W, d: CYL.d - 2, r: 3 };
  out.push(S(k.slabOf(caps[0], CYL_Z - 1, CYL_H + 2, P, 3, 0.5), { tone: "mid" }));
  out.push(S(k.slabOf(barrel, CYL_Z + 1, CYL_H - 2, P, 6, 0.6), { tone: "hi", crease: "lo" }));
  out.push(S(k.slabOf(caps[1], CYL_Z - 1, CYL_H + 2, P, 3, 0.5), { tone: "mid" }));
  for (const c of caps) out.push(D(k.corners(c, 1.8).map(([x, y]) => at([x, y, CYL_Z + CYL_H + 1])), { size: 0.5 }));
  for (const [x, y] of [CPORT_A, CPORT_B]) {
    out.push(S(k.cylinder(x, y, 3, CYL_Z + CYL_H + 1, 2.2, P, 20), { tone: "mid" }));
    out.push(S(k.cylinder(x, y, 2.3, CYL_Z + CYL_H + 3.2, 2.4, P, 20), { tone: "lo" }));
  }
  out.push(L(k.lineOnTop([barrel.x + 3, barrel.y + barrel.d - 4], [barrel.x + barrel.w - 3, barrel.y + barrel.d - 4], CYL_Z + CYL_H - 1, P), { tone: "lo", free: true }));
  const t = k.topTicks(barrel.x + 4, barrel.x + barrel.w - 4, 4, 5, barrel.y + barrel.d - 4, CYL_Z + CYL_H - 1, [1.4, 2.6], P);
  out.push(L(t.minor, { tone: "faint" }), L(t.major, { tone: "lo" }));
  return out.join("");
}
const rod = () => `<clipPath id="sv-rod-clip"><path data-hold d="${ROD.clip}"/></clipPath><g clip-path="url(#sv-rod-clip)">${S(ROD.paths, { tone: "hi", crease: "none" })}</g>${S(G.disc(4, 8, 4, CF, P), { tone: "mid" })}`;
const gland = () => S(G.disc(-0.01, 1.2, ROD_R + 1.6, CF, P), { tone: "mid" });

// ── air inlet (bulkhead block at the plate edge) ──
function inlet() {
  const out = [`<path class="iso-halo" d="${k.haloOf(INLET, 0, 10, P)}" style="filter:blur(2px)"/>`, S(k.slabOf(INLET, 0, 10, P, 3, 0.6), { tone: "mid" })];
  const Fi = G.frameAlong([INLET.x + INLET.w / 2, INLET.y + INLET.d, 5], [0, 1, 0]);
  out.push(S(G.disc(0, 2.6, 3.4, Fi, P), { tone: "lo" }), S(G.disc(2.6, 5, 2.6, Fi, P), { tone: "mid" }));
  out.push(S(k.cylinder(INLET.x + INLET.w / 2, INLET.y + 4, 3, 10, 2.2, P, 20), { tone: "mid" }));
  out.push(topText(INLET.x + INLET.w / 2, INLET.y + 9.6, 10, "6 bar", 2.2, "lo"));
  return out.join("");
}

// ── hoses ──
const hose = (pts, name) => { const d = poly(pts); return `<g class="sv-hose" data-hose="${name}"><path class="sv-hose-body" d="${d}"/><path class="sv-hose-core" d="${d}"/><path class="sv-hose-flow" d="${d}"/></g>`; };
const portTip = (x) => [x, FRONT + 5.2, PORT_Z];
const CTOP = CYL_Z + CYL_H + 5.6;
const hoses = () => [
  hose(bezFrom(portTip(0), [0, FRONT + 16, PORT_Z], [INLET.x + INLET.w / 2, INLET.y + 4, 30], [INLET.x + INLET.w / 2, INLET.y + 4, 12.2], 28), "p"),
  hose(bezFrom(portTip(-16), [-16, FRONT + 14, PORT_Z], [CPORT_A[0], CPORT_A[1], CTOP + 26], [CPORT_A[0], CPORT_A[1], CTOP], 30), "a"),
  hose(bezFrom(portTip(16), [16, FRONT + 10, PORT_Z], [CPORT_B[0], CPORT_B[1], CTOP + 20], [CPORT_B[0], CPORT_B[1], CTOP], 30), "b"),
].join("");

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A 5/2 single-solenoid valve with the top half of its body cut away to show the spool. When the coil is off, a spring holds the spool so supply port P feeds B and A exhausts to EA. When the coil is energised it pulls the spool 16 mm: P feeds A and B exhausts to EB, and the small cylinder in front extends.",
  body: [
    plate(),
    inlet(),
    solenoid(),
    flange(),
    body(),
    flows(),
    springSvg("back"),
    `<g data-part="spool">${spool()}</g>`,
    springSvg("front"),
    endCap(),
    fittings(),
    cylinderBody(),
    `<g data-part="rod">${rod()}</g>`,
    gland(),
    hoses(),
  ],
});

const VX = k.axisVector(P, [1, 0, 0]);
const CSS = `
.sv-led{fill:var(--anatomy-paper);stroke:var(--anatomy-mid);stroke-width:.5}
.sv-led[data-on]{fill:#f2b33d;stroke:#b07a12}
.sv-coil-glow .iso-shade,.sv-coil-glow .iso-top{transition:fill .25s}
.sv-coil-glow[data-on] .iso-shade{fill:#f6d58c}
.sv-coil-glow[data-on] .iso-top{fill:#fae6b8}
.sv-flows{opacity:0;transition:opacity .25s}
.sv-flows[data-on]{opacity:1}
.sv-flow{fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:3 4;animation:sv-air .6s linear infinite}
.sv-flow[data-kind="in"]{stroke:#3e8fdd}
.sv-flow[data-kind="out"]{stroke:var(--anatomy-mid)}
.sv-hose-body{fill:none;stroke:var(--anatomy-mid);stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}
.sv-hose-core{fill:none;stroke:var(--anatomy-card);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.sv-hose-flow{fill:none;stroke:#3e8fdd;stroke-width:1;stroke-dasharray:2 5;opacity:0;transition:opacity .2s}
.sv-hose[data-flow="in"] .sv-hose-flow{opacity:1;animation:sv-air .6s linear infinite}
.sv-hose[data-flow="out"] .sv-hose-flow{opacity:.6;stroke:var(--anatomy-mid);animation:sv-air .6s linear infinite reverse}
@keyframes sv-air{to{stroke-dashoffset:-14}}
.sv-stage{cursor:pointer;touch-action:manipulation}
@media (prefers-reduced-motion:reduce){.sv-flow,.sv-hose-flow{animation:none!important}}
`;

const live = `(() => {
const fig = document.currentScript.previousElementSibling;
const stage = fig.querySelector(".sv-stage"), svg = stage.querySelector("svg");
const $ = (s) => svg.querySelector(s);
const VX = ${JSON.stringify(VX)}, SHIFT = ${SHIFT}, STROKE = ${STROKE}, STEPS = ${SPRING_STEPS};
const springs = ${JSON.stringify(springs)};
const spool = $('[data-part="spool"]'), rod = $('[data-part="rod"]'), clip = $("#sv-rod-clip path"), coil = $('[data-part="coil"]'), ledC = $('[data-led="coil"]');
const springB = $('[data-part="spring-back"]'), springF = $('[data-part="spring-front"]');
const flows = { off: $('[data-state="off"]'), on: $('[data-state="on"]') };
const hoses = {}; svg.querySelectorAll("[data-hose]").forEach((n) => (hoses[n.dataset.hose] = n));
const readout = fig.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const on = (n, v) => (v ? n.setAttribute("data-on", "") : n.removeAttribute("data-on"));
const mv = (s) => "translate(" + (VX[0] * s).toFixed(2) + " " + (VX[1] * s).toFixed(2) + ")";
let energised = false, x = 0, rodX = 0, touring = !still.matches, clock = 0, idle = 0, visible = false, frame = 0, last = 0, lastStep = -1;
function draw() {
  spool.setAttribute("transform", mv(x));
  const step = Math.round((x / SHIFT) * (STEPS - 1));
  if (step !== lastStep) { springB.setAttribute("d", springs[step].back); springF.setAttribute("d", springs[step].front); lastStep = step; }
  rod.setAttribute("transform", mv(rodX)); clip.setAttribute("transform", mv(-rodX));
  on(coil, energised); on(ledC, energised);
  const shifted = Math.abs(x - (energised ? SHIFT : 0)) < 2;
  on(flows.on, energised && shifted); on(flows.off, !energised && shifted);
  const moving = Math.abs(rodX - (energised ? STROKE : 0)) > 0.4;
  hoses.p.dataset.flow = moving ? "in" : "";
  hoses.a.dataset.flow = moving ? (energised ? "in" : "out") : "";
  hoses.b.dataset.flow = moving ? (energised ? "out" : "in") : "";
  const text = energised ? "คอยล์ ON · P→A · B→EB · กระบอกลมยืดออก" : "คอยล์ OFF · P→B · A→EA · กระบอกลมหดเข้า";
  if (readout.textContent !== text) readout.textContent = text;
}
function tick(t) {
  const dt = last ? Math.min((t - last) / 1000, 1 / 20) : 1 / 60; last = t;
  if (touring) { clock += dt; energised = Math.floor(clock / 3.2) % 2 === 1; } else if ((idle += dt) > 7) { touring = !still.matches; clock = energised ? 3.2 : 0; }
  const f = (tau) => (still.matches ? 1 : 1 - Math.exp(-dt / tau));
  x += ((energised ? SHIFT : 0) - x) * f(energised ? 0.05 : 0.08);
  rodX += ((energised ? STROKE : 0) - rodX) * f(0.3);
  draw();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; visible ? run() : (cancelAnimationFrame(frame), (frame = 0)); }, { rootMargin: "80px 0px" }).observe(stage);
const toggle = () => { touring = false; idle = 0; energised = !energised; run(); };
stage.addEventListener("click", toggle);
stage.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } });
draw();
})();`;

const figure = k.plateHtml({
  fig: "Fig 1",
  title: "5/2 solenoid valve",
  hint: "คลิกที่ภาพเพื่อจ่ายไฟเข้าคอยล์",
  readout: "คอยล์ OFF · P→B · A→EA · กระบอกลมหดเข้า",
  keys: [
    { mark: "lit", label: "สปูล (Spool) เลื่อนเปลี่ยนทางลม" },
    { mark: "blue", label: "ลมอัดจากพอร์ต P" },
    { mark: "dim", label: "ลมระบายออกทางพอร์ต EA / EB" },
  ],
  caption:
    "ภาพตัดครึ่งบนของโซลินอยด์วาล์ว 5/2 แบบคอยล์เดี่ยว เมื่อไม่มีไฟ สปริงดันสปูลค้างไว้ ลมจาก P ไหลออก B และ A ระบายทิ้งทาง EA เมื่อจ่ายไฟ คอยล์ดึงสปูลเลื่อนไป ลมจาก P เปลี่ยนไปออก A และ B ระบายทาง EB กระบอกลมจึงยืดออก ตัดไฟเมื่อไร สปริงก็ดันสปูลกลับทันที",
  body: `<div class="iso-stage sv-stage" tabindex="0" role="button" aria-label="จ่ายหรือตัดไฟคอยล์ของโซลินอยด์วาล์ว (กด Space)">${svg}</div>`,
});

const fragment = `<div class="iso sv-fig" data-theme="light"><style>${k.ISO_CSS}${CSS}</style>${figure}</div><script>${live}</script>`;
writeFileSync(join(HERE, "solenoid-valve.fragment.html"), fragment);
writeFileSync(join(HERE, "solenoid-valve.html"), `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Solenoid valve</title><style>body{margin:0;background:#f2f2ef;padding:32px 16px}.sv-fig{max-width:720px;margin:0 auto}</style></head><body>${fragment}</body></html>`);
console.log("wrote", (fragment.length / 1024).toFixed(1) + " KB fragment");

if (process.argv.includes("--inject")) {
  const file = join(HERE, "../../../src/data/pages.json");
  const raw = readFileSync(file, "utf8");
  const pages = JSON.parse(raw);
  const page = pages.find((p) => p.route === "solenoid-valve");
  const marked = /<!-- fig:solenoid-valve -->[\s\S]*?<!-- \/fig:solenoid-valve -->/;
  if (!page || !marked.test(page.html)) throw new Error("solenoid-valve: figure marker not found");
  page.html = page.html.replace(marked, () => `<!-- fig:solenoid-valve -->\n${fragment}\n<!-- /fig:solenoid-valve -->`);
  writeFileSync(file, JSON.stringify(pages, null, 2) + (raw.endsWith("\n") ? "\n" : ""));
  console.log("injected into solenoid-valve");
}
