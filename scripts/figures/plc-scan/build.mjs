// Fig: PLC scan cycle — push button + proximity sensor → compact PLC → 5/2 solenoid valve → pneumatic cylinder.
// `node scripts/figures/plc-scan/build.mjs` writes plc-scan.html (preview page) and plc-scan.fragment.html
// (the <style>+<figure>+<script> block that goes into the plc-type article in src/data/pages.json).
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--dark") ? "dark" : "light";

const WIDTH = 640;
const HEIGHT = 400;

// ── world (≈1 unit per mm of a small training bench) ──
const PLATE = { x: -186, y: -48, w: 346, d: 98, r: 8 };
const PLATE_H = 10;
const FOOT_H = 5;

const BOX = { x: -170, y: 18, w: 30, d: 24, r: 3 }; // push-button station
const BOX_H = 20;
const BTN = [BOX.x + 15, BOX.y + 12];
const BTN_TRAVEL = 2.4;

const TRACK = { x: -180, y: -40, w: 52, d: 22, r: 2 };
const WP = { w: 13, d: 13 }; // steel workpiece
const SENSOR = [-148, -29];
const SENSOR_FACE = 14; // sensing face height
const SENSOR_TOP = 40;
const WP_H = 10; // workpiece top: 4 mm gap = M12 inductive sensing range
const WP_RANGE = [-178, SENSOR[0] - WP.w / 2]; // left edge travel
const UPRIGHT = { x: -154, y: -48 + 1, w: 12, d: 5, r: 1 };
const ARM_Z = SENSOR_TOP;

const RAIL = { x: -100, y: -5, w: 100, d: 10, r: 0.6 };
const PSU = { x: -96, y: -22, w: 22, d: 44, r: 2 };
const PSU_H = 38;
const PLC = { x: -70, y: -24, w: 64, d: 48, r: 2 };
const PLC_H = 42;
const FRONT = PLC.y + PLC.d; // front face y
const TERM_Z = 35;
const LED_Z = 27;
const IN_X = [-63, -56, -49]; // 24V(+), I0.0, I0.1 terminals
const OUT_X = [-26, -19]; // Q0.0, COM
const LED_IN = [-60, -52];
const LED_OUT = [-22];
const LOOP = [-38, -4]; // scan-ring centre on the PLC top
const LOOP_R = 9;

const MANI = { x: 14, y: -20, w: 52, d: 22, r: 1.5 };
const VALVE = { x: 30, y: -18, w: 34, d: 18, r: 2 };
const VALVE_Z = 8;
const VALVE_H = 14;
const COIL = { x: 15, y: -19, w: 15, d: 20, r: 1.5 };
const COIL_H = 22;
const PLUG = { x: 17, y: -14, w: 11, d: 10, r: 1.5 };
const PORT_A = [42, -9];
const PORT_B = [54, -9];
const SPOOL_WIN = [38, 54];

const CYL = { x: 84, y: -15, w: 56, d: 22, r: 2 };
const CYL_Z = 5;
const CYL_H = 22;
const AXIS = [CYL.y + CYL.d / 2, CYL_Z + CYL_H / 2];
const CAP_W = 6;
const ROD_R = 3;
const ROD_REST = 5;
const STROKE = 24;
const CPORT_A = [CYL.x + 10, AXIS[0]];
const CPORT_B = [CYL.x + CYL.w - 10, AXIS[0]];

const LADDER = { x: 34, y: 18, w: 92, d: 22, r: 1.5 };

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [PLC.x, PLC.y, PLC_H + 4], [SENSOR[0], SENSOR[1], 50], [CYL.x + CYL.w + ROD_REST + STROKE + 6, AXIS[0], AXIS[1]]],
  WIDTH,
  HEIGHT,
  { pad: 26, azimuth: 40 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const seg = (a, b) => k.segment(a, b, P);
const poly = (pts) => k.pathOf(pts.map(at));
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const screws = (pts, z) => L(pts.map(([x, y]) => k.ring(x, y, 1.6, z, P, 14)).join(""), { tone: "lo" }) + D(pts.map(([x, y]) => at([x, y, z])), { size: 0.4 });
const led = (p, name, r = 1.5) => { const [x, y] = at(p); return `<circle class="plc-led" data-led="${name}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}"/>`; };
const frontText = (x, z, y, text, size = 2.2) => k.faceTextSvg(k.sideMatrix([x, y], z, P, "left"), text, { size, tone: "mid", anchor: "middle" });
const topText = (x, y, z, text, size = 2.4) => k.faceTextSvg(k.topMatrix([x, y], z, P, "x"), text, { size, tone: "lo", anchor: "middle" });

// ── base plate ──
function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 20))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.4), { tone: "mid", inner: L(k.sideSeam(PLATE, -PLATE_H / 2, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "faint" }));
  out.push(screws(k.corners(PLATE, 10), 0));
  // front ruler strip
  const strip = { x: -100, y: PLATE.y + PLATE.d - 9, w: 120, d: 5, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.6, 0.6, [1.8, 3.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3, 0.6]), at([strip.x + strip.w - 2, strip.y + 3, 0.6])], { size: 0.4 }));
  return out.join("");
}

// ── ladder rung engraved on a label plate: I0.0 ∥ I0.1 → (Q0.0) ──
const LZ = 0.8;
const rung = (() => {
  const y1 = LADDER.y + 7, y2 = LADDER.y + 15, x0 = LADDER.x + 6, x1 = LADDER.x + LADDER.w - 6;
  const c0 = x0 + 18, c1 = c0 + 8, coil = x1 - 18;
  const contact = (y) => seg([c0, y - 2.4, LZ], [c0, y + 2.4, LZ]) + seg([c1, y - 2.4, LZ], [c1, y + 2.4, LZ]);
  return {
    rails: seg([x0, LADDER.y + 3, LZ], [x0, LADDER.y + LADDER.d - 3, LZ]) + seg([x1, LADDER.y + 3, LZ], [x1, LADDER.y + LADDER.d - 3, LZ]),
    in0: seg([x0, y1, LZ], [c0, y1, LZ]) + contact(y1) + seg([c1, y1, LZ], [c1 + 8, y1, LZ]),
    in1: seg([x0, y2, LZ], [c0, y2, LZ]) + contact(y2) + seg([c1, y2, LZ], [c1 + 8, y2, LZ]) + seg([c1 + 8, y2, LZ], [c1 + 8, y1, LZ]),
    out: seg([c1 + 8, y1, LZ], [coil - 4, y1, LZ]) + k.ring(coil, y1, 4, LZ, P, 24) + seg([coil + 4, y1, LZ], [x1, y1, LZ]),
    labels: [[c0 + 4, y1 - 4.2, "I0.0"], [c0 + 4, y2 + 5.6, "I0.1"], [coil, y1 - 5.4, "Q0.0"]],
  };
})();
function ladder() {
  const out = [S(k.slabOf(LADDER, 0, LZ, P, 3, 0.4), { tone: "lo", crease: "none" })];
  out.push(screws([[LADDER.x + 2.6, LADDER.y + 2.6], [LADDER.x + LADDER.w - 2.6, LADDER.y + 2.6], [LADDER.x + 2.6, LADDER.y + LADDER.d - 2.6], [LADDER.x + LADDER.w - 2.6, LADDER.y + LADDER.d - 2.6]], LZ).replace(/r="0.4"/g, 'r="0.3"'));
  out.push(L(rung.rails, { tone: "mid", free: true }));
  out.push(`<path class="iso-line plc-rung" data-free="both" data-rung="in0" data-tone="lo" d="${rung.in0}"/>`);
  out.push(`<path class="iso-line plc-rung" data-free="both" data-rung="in1" data-tone="lo" d="${rung.in1}"/>`);
  out.push(`<path class="iso-line plc-rung" data-free="both" data-rung="out" data-tone="lo" d="${rung.out}"/>`);
  for (const [x, y, t] of rung.labels) out.push(topText(x, y, LZ, t, 2.2));
  return out.join("");
}

// ── input: push-button station ──
function buttonBox() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BOX, 0, BOX_H, P)}" style="filter:blur(3px)"/>`];
  out.push(S(k.slabOf(BOX, 0, BOX_H, P, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(BOX, BOX_H - 3, P, 4), { tone: "faint" }) }));
  out.push(D(k.corners(BOX, 3).map(([x, y]) => at([x, y, BOX_H])), { size: 0.45 }));
  out.push(S(k.cylinder(BTN[0], BTN[1], 7.2, BOX_H, 1.4, P, 32, 0.4), { tone: "mid" }));
  out.push(L(k.knurl(BTN[0], BTN[1], 7.2, BOX_H, BOX_H + 1.4, 30, P), { tone: "lo" }));
  out.push(`<g data-part="button">${S(k.cylinder(BTN[0], BTN[1], 5, BOX_H + 1.4, 3.4, P, 32, 0.6), { tone: "hi" })}${L(k.ring(BTN[0], BTN[1], 3, BOX_H + 4.8, P, 24), { tone: "faint" })}</g>`);
  out.push(frontText(BOX.x + BOX.w / 2, 9, BOX.y + BOX.d, "START", 2.6));
  return out.join("");
}

// ── input: proximity sensor over a sliding workpiece ──
function track() {
  const out = [S(k.slabOf(TRACK, 0, 1.6, P, 3, 0.4), { tone: "mid" })];
  for (const y of [TRACK.y + 3, TRACK.y + TRACK.d - 5]) out.push(S(k.slabOf({ x: TRACK.x + 3, y, w: TRACK.w - 6, d: 2, r: 0.6 }, 1.6, 1, P, 2), { tone: "mid", crease: "none" }));
  out.push(screws([[TRACK.x + 2, TRACK.y + TRACK.d / 2], [TRACK.x + TRACK.w - 2, TRACK.y + TRACK.d / 2]], 1.6));
  return out.join("");
}
function workpiece() {
  const plan = { x: 0, y: SENSOR[1] - WP.d / 2, w: WP.w, d: WP.d, r: 1 };
  return `<path class="iso-halo" d="${k.haloOf(plan, 2.6, 0.1, P)}" style="filter:blur(2px)"/>` + S(k.slabOf(plan, 2.6, WP_H - 2.6, P, 3, 0.5), { tone: "hi", crease: "lo", inner: L(k.planOutline(k.insetPlan(plan, 2.4), WP_H, P, 3), { tone: "faint" }) });
}
function sensorStand() {
  const out = [S(k.slabOf({ x: UPRIGHT.x - 2, y: UPRIGHT.y - 2, w: UPRIGHT.w + 4, d: UPRIGHT.d + 4, r: 1 }, 0, 2, P, 2), { tone: "lo" })];
  out.push(S(k.slabOf(UPRIGHT, 2, ARM_Z + 4 - 2, P, 2, 0.4), { tone: "mid" }));
  out.push(D([at([UPRIGHT.x + 3, UPRIGHT.y - 1, 1]), at([UPRIGHT.x + UPRIGHT.w - 3, UPRIGHT.y - 1, 1])], { size: 0.4 }));
  return out.join("");
}
function sensor() {
  const [x, y] = SENSOR;
  const out = [];
  out.push(S(k.cylinder(x, y, 2.6, SENSOR_FACE, 1, P, 20), { tone: "mid" })); // sensing face
  out.push(S(k.cylinder(x, y, 3.4, SENSOR_FACE + 1, SENSOR_TOP - SENSOR_FACE - 1, P, 24), { tone: "hi", crease: "none" }));
  out.push(L([18, 21, 24, 27].map((z) => k.sideArc(x, y, 3.4, z, P, 14)).join(""), { tone: "faint" })); // M12 thread
  for (const z of [22, 30]) out.push(S(k.extrude(Array.from({ length: 6 }, (_, i) => [x + 5 * Math.cos((i * Math.PI) / 3 + 0.3), y + 5 * Math.sin((i * Math.PI) / 3 + 0.3)]), z, 2.2, P), { tone: "mid" }));
  out.push(led([x + 2.4, y + 2.4, SENSOR_TOP - 3], "sensor", 1.1));
  return out.join("");
}
function sensorArm() {
  const arm = { x: UPRIGHT.x, y: UPRIGHT.y, w: UPRIGHT.w, d: SENSOR[1] - UPRIGHT.y + 6, r: 1 };
  return S(k.slabOf(arm, ARM_Z, 4, P, 2, 0.4), { tone: "mid" }) + D([at([SENSOR[0], SENSOR[1], ARM_Z + 4])], { size: 0.5 }) + L(k.ring(SENSOR[0], SENSOR[1], 3.4, ARM_Z + 4, P, 18), { tone: "lo" });
}

// ── controller: DIN rail, 24 V supply, compact PLC ──
function rail() {
  const out = [S(k.slabOf(RAIL, 0, 1.4, P, 2), { tone: "mid", crease: "none" })];
  out.push(L(k.lineOnTop([RAIL.x, RAIL.y + 2], [RAIL.x + RAIL.w, RAIL.y + 2], 1.4, P) + k.lineOnTop([RAIL.x, RAIL.y + RAIL.d - 2], [RAIL.x + RAIL.w, RAIL.y + RAIL.d - 2], 1.4, P), { tone: "faint", free: true }));
  out.push(screws([[RAIL.x + 2.5, 0], [RAIL.x + RAIL.w - 2.5, 0]], 1.4));
  return out.join("");
}
function vents(plan, z, from, to, gap) {
  let d = "";
  for (let x = from; x <= to; x += gap) d += k.planOutline({ x, y: plan.y + 6, w: 1.6, d: 12, r: 0.8 }, z, P, 3);
  return L(d, { tone: "lo" });
}
function psu() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PSU, 1.4, PSU_H, P)}" style="filter:blur(3px)"/>`];
  out.push(S(k.slabOf(PSU, 1.4, PSU_H - 1.4, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(PSU, 8, P, 3), { tone: "faint" }) }));
  out.push(vents(PSU, PSU_H, PSU.x + 4, PSU.x + PSU.w - 5, 3.4));
  out.push(screws([[PSU.x + 6, PSU.y + PSU.d - 6], [PSU.x + PSU.w - 6, PSU.y + PSU.d - 6]], PSU_H));
  const fy = PSU.y + PSU.d;
  out.push(D([-91, -85, -79].map((x) => at([x, fy, TERM_Z])), { size: 0.7 }));
  out.push(L(k.sideSeam(PSU, TERM_Z + 3.4, P, 3) + k.sideSeam(PSU, TERM_Z - 3.4, P, 3), { tone: "faint" }));
  out.push(led([-91, fy, 24], "power", 1.2));
  out.push(frontText(-82, 17, fy, "24 VDC", 2.4));
  return out.join("");
}
function plc() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLC, 1.4, PLC_H, P)}" style="filter:blur(3px)"/>`];
  out.push(S(k.slabOf(PLC, 1.4, PLC_H - 1.4, P, 3, 0.8), { tone: "hi", crease: "lo", inner: L(k.sideSeam(PLC, 10, P, 3), { tone: "faint" }) }));
  // DIN clip tab
  out.push(S(k.slabOf({ x: -46, y: FRONT - 0.2, w: 10, d: 2, r: 0.6 }, 1.4, 3, P, 2), { tone: "mid" }));
  // terminal covers (upper strip) on the front face
  const fy = FRONT;
  out.push(L(k.sideSeam(PLC, TERM_Z + 3.6, P, 3) + k.sideSeam(PLC, TERM_Z - 3.6, P, 3), { tone: "lo" }));
  out.push(D([...IN_X, ...OUT_X].map((x) => at([x, fy, TERM_Z])), { size: 0.75 }));
  // LED windows
  for (const [x, n] of [[LED_IN[0], "i0"], [LED_IN[1], "i1"], [LED_OUT[0], "q0"]]) out.push(led([x, fy, LED_Z], n, 1.3));
  out.push(led([-10, fy, LED_Z], "run", 1.1));
  out.push(frontText(-56, 21.5, fy, "IN", 2.2), frontText(-22, 21.5, fy, "OUT", 2.2), frontText(-10, 21.5, fy, "RUN", 1.9));
  // top: vent slots at the back, the scan ring in the middle, a model plate
  out.push(vents({ y: PLC.y - 1 }, PLC_H, PLC.x + 5, PLC.x + PLC.w - 6, 3.4));
  out.push(L(k.ring(LOOP[0], LOOP[1], LOOP_R + 2.6, PLC_H, P, 48), { tone: "faint" }));
  out.push(L(k.ring(LOOP[0], LOOP[1], LOOP_R, PLC_H, P, 48), { tone: "mid" }));
  const marks = [0, 1, 2].map((i) => { const a = (i / 3) * Math.PI * 2; return [LOOP[0] + Math.sin(a) * LOOP_R, LOOP[1] - Math.cos(a) * LOOP_R]; });
  marks.forEach(([x, y], i) => out.push(`<circle class="plc-stage" data-stage="${i}" cx="${at([x, y, PLC_H])[0].toFixed(1)}" cy="${at([x, y, PLC_H])[1].toFixed(1)}" r="1.6"/>`));
  const tags = ["READ", "LOGIC", "WRITE"];
  marks.forEach(([x, y], i) => { const a = (i / 3) * Math.PI * 2; out.push(topText(LOOP[0] + Math.sin(a) * (LOOP_R + 6.4), LOOP[1] - Math.cos(a) * (LOOP_R + 6.4) + 0.8, PLC_H, tags[i], 2.1)); });
  const plateTop = { x: PLC.x + 4, y: PLC.y + PLC.d - 12, w: 16, d: 8, r: 1 };
  out.push(L(k.planOutline(plateTop, PLC_H, P, 3), { tone: "lo" }));
  out.push(L([2.6, 4.2, 5.8].map((dy) => k.lineOnTop([plateTop.x + 2, plateTop.y + dy], [plateTop.x + (dy > 5 ? 9 : 13), plateTop.y + dy], PLC_H, P)).join(""), { tone: "faint", free: true }));
  return out.join("");
}

// ── output: 5/2 single-solenoid valve on a sub-base ──
function valve() {
  const out = [`<path class="iso-halo" d="${k.haloOf(MANI, 0, 8, P)}" style="filter:blur(3px)"/>`];
  out.push(S(k.slabOf(MANI, 0, VALVE_Z, P, 2, 0.5), { tone: "mid", inner: L(k.sideSeam(MANI, 4, P, 2), { tone: "faint" }) }));
  out.push(screws([[MANI.x + 3, MANI.y + MANI.d - 3], [MANI.x + MANI.w - 3, MANI.y + MANI.d - 3]], VALVE_Z));
  out.push(S(k.slabOf(COIL, VALVE_Z, COIL_H, P, 2, 0.5), { tone: "hi", crease: "lo", inner: L(k.sideSeam(COIL, VALVE_Z + COIL_H - 4, P, 2), { tone: "faint" }) }));
  out.push(S(k.slabOf(VALVE, VALVE_Z, VALVE_H, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(VALVE, VALVE_Z + 3, P, 3), { tone: "faint" }) }));
  const top = VALVE_Z + VALVE_H;
  // spool window: a marker inside it shows the spool shifting
  out.push(L(k.planOutline({ x: SPOOL_WIN[0], y: VALVE.y + 2.6, w: SPOOL_WIN[1] - SPOOL_WIN[0], d: 3.4, r: 1.6 }, top, P, 3), { tone: "lo" }));
  // manual override at the far end
  out.push(S(k.cylinder(VALVE.x + VALVE.w - 4, VALVE.y + 4.2, 1.8, top, 1, P, 16), { tone: "mid" }));
  // DIN connector plug on the coil, with its status LED
  out.push(S(k.slabOf(PLUG, VALVE_Z + COIL_H, 6, P, 2, 0.4), { tone: "mid" }));
  out.push(D([at([PLUG.x + PLUG.w / 2, PLUG.y + PLUG.d / 2, VALVE_Z + COIL_H + 6])], { size: 0.6 }));
  out.push(led([PLUG.x + PLUG.w - 2, PLUG.y + PLUG.d, VALVE_Z + COIL_H + 3], "coil", 1.1));
  // push-in fittings A and B
  for (const [x, y] of [PORT_A, PORT_B]) {
    out.push(S(k.cylinder(x, y, 3.2, top, 2.2, P, 20), { tone: "mid" }));
    out.push(S(k.cylinder(x, y, 2.4, top + 2.2, 2.6, P, 20), { tone: "lo" }));
  }
  out.push(topText(PORT_A[0], PORT_A[1] + 6.4, top, "A", 2.4), topText(PORT_B[0], PORT_B[1] + 6.4, top, "B", 2.4));
  return out.join("");
}
const spoolMarker = () => S(k.slabOf({ x: SPOOL_WIN[0] + 1.4, y: VALVE.y + 3.3, w: 4.6, d: 2, r: 0.9 }, VALVE_Z + VALVE_H, 0.4, P, 2), { tone: "hi", lit: true, crease: "none" });

// ── actuator: compact double-acting cylinder ──
function cylinderBody() {
  const out = [`<path class="iso-halo" d="${k.haloOf(CYL, 0, CYL_Z + CYL_H, P)}" style="filter:blur(3px)"/>`];
  for (const x of [CYL.x + 2, CYL.x + CYL.w - 10]) out.push(S(k.slabOf({ x, y: CYL.y - 2, w: 8, d: CYL.d + 4, r: 1 }, 0, CYL_Z, P, 2, 0.4), { tone: "lo" }));
  const caps = [{ x: CYL.x, y: CYL.y - 1, w: CAP_W, d: CYL.d + 2, r: 1.5 }, { x: CYL.x + CYL.w - CAP_W, y: CYL.y - 1, w: CAP_W, d: CYL.d + 2, r: 1.5 }];
  const barrel = { x: CYL.x + CAP_W, y: CYL.y + 1, w: CYL.w - 2 * CAP_W, d: CYL.d - 2, r: 3 };
  out.push(S(k.slabOf(caps[0], CYL_Z - 1, CYL_H + 2, P, 3, 0.5), { tone: "mid" }));
  out.push(S(k.slabOf(barrel, CYL_Z + 1, CYL_H - 2, P, 6, 0.6), { tone: "hi", crease: "lo" }));
  out.push(S(k.slabOf(caps[1], CYL_Z - 1, CYL_H + 2, P, 3, 0.5), { tone: "mid" }));
  // tie-rod nuts on the cap tops
  for (const c of caps) out.push(D(k.corners(c, 1.8).map(([x, y]) => at([x, y, CYL_Z + CYL_H + 1])), { size: 0.5 }));
  // ports
  for (const [x, y] of [CPORT_A, CPORT_B]) {
    out.push(S(k.cylinder(x, y, 3, CYL_Z + CYL_H + 1, 2.2, P, 20), { tone: "mid" }));
    out.push(S(k.cylinder(x, y, 2.3, CYL_Z + CYL_H + 3.2, 2.4, P, 20), { tone: "lo" }));
  }
  // engraved scale along the barrel top
  const t = k.topTicks(barrel.x + 4, barrel.x + barrel.w - 4, 4, 5, barrel.y + barrel.d - 4, CYL_Z + CYL_H - 1, [1.4, 2.6], P);
  out.push(L(k.lineOnTop([barrel.x + 3, barrel.y + barrel.d - 4], [barrel.x + barrel.w - 3, barrel.y + barrel.d - 4], CYL_Z + CYL_H - 1, P), { tone: "lo", free: true }));
  out.push(L(t.minor, { tone: "faint" }), L(t.major, { tone: "lo" }));
  return out.join("");
}
const F = G.frameAlong([CYL.x + CYL.w, AXIS[0], AXIS[1]], [1, 0, 0]);
const ROD = G.rodOut(F, 0, ROD_REST, ROD_R, P, { stroke: STROKE });
function rod() {
  const nut = G.disc(ROD_REST, ROD_REST + 4, 4.4, F, P);
  const eye = G.disc(ROD_REST + 4, ROD_REST + 6, 2.6, F, P);
  return `<clipPath id="plc-rod-clip"><path data-hold d="${ROD.clip}"/></clipPath><g clip-path="url(#plc-rod-clip)">${S(ROD.paths, { tone: "hi", crease: "none", lit: true })}</g>${S(nut, { tone: "mid" })}${S(eye, { tone: "mid" })}`;
}
const gland = () => S(G.disc(-0.01, 1.2, ROD_R + 1.6, F, P), { tone: "mid" });

// ── wires and hoses ──
const expand = (pts) => pts.reduce((acc, p) => (p && p.__bez ? acc.push(...bezFrom(acc.at(-1), p.c1, p.c2, p.p3, p.n)) : acc.push(p), acc), []);
const wire = (raw, name, tone = "lo", pts = expand(raw)) => `<g class="iso-wire plc-wire" data-wire="${name}" data-tone="${tone}">${L(poly(pts), { tone })}<circle class="iso-wire-end" cx="${at(pts[0])[0].toFixed(1)}" cy="${at(pts[0])[1].toFixed(1)}" r="1"/><circle class="iso-wire-end" cx="${at(pts.at(-1))[0].toFixed(1)}" cy="${at(pts.at(-1))[1].toFixed(1)}" r="1"/></g>`;
const FLOOR_Y = 40;
// cubic Bézier from the previous point p0 (implicit) — returns samples after p0
function bezFrom(p0, c1, c2, p3, n) { return Array.from({ length: n }, (_, i) => { const t = (i + 1) / n, u = 1 - t; return [0, 1, 2].map((j) => u * u * u * p0[j] + 3 * u * u * t * c1[j] + 3 * u * t * t * c2[j] + t * t * t * p3[j]); }); }
const bez = (c1, c2, p3, n) => ({ c1, c2, p3, n, __bez: true });
const W_I0 = [[BOX.x + BOX.w, BOX.y + 12, 0.3], [IN_X[1], BOX.y + 12, 0.3], [IN_X[1], FRONT, 0.3]];
const W_I1 = [[-124, -12, 0.3], [-124, FLOOR_Y + 2, 0.3], [IN_X[2], FLOOR_Y + 2, 0.3], [IN_X[2], FRONT, 0.3]];
const W_Q0 = [[OUT_X[0], FRONT, 0.3], [OUT_X[0], FLOOR_Y - 6, 0.3], [PLUG.x + 4, FLOOR_Y - 6, 0.3], [PLUG.x + 4, COIL.y + COIL.d, 0.3]];
const line = (pts, name) => `<g class="iso-wire plc-wire" data-wire="${name}" data-tone="lo">${L(poly(pts), { tone: "lo" })}</g>`;
const floorWires = () => [line(W_I0, "i0"), line(W_I1, "i1"), line(W_Q0, "q0")].join("");
const sensorCable = () => wire([[SENSOR[0], SENSOR[1], SENSOR_TOP + 4], bez([SENSOR[0], SENSOR[1], SENSOR_TOP + 12], [SENSOR[0], SENSOR[1] + 22, SENSOR_TOP + 10], [SENSOR[0], -12, 0.3], 14), [-124, -12, 0.3]], "i1");
const wires = () => [
  wire([W_I0.at(-1), [IN_X[1], FRONT, TERM_Z]], "i0"),
  wire([W_I1.at(-1), [IN_X[2], FRONT, TERM_Z]], "i1"),
  wire([[-79, PSU.y + PSU.d, TERM_Z], [-79, PSU.y + PSU.d + 3, TERM_Z], [IN_X[0], FRONT + 3, TERM_Z], [IN_X[0], FRONT, TERM_Z]], "pwr"),
  wire([[OUT_X[0], FRONT, TERM_Z], W_Q0[0]], "q0"),
].join("");
const coilWire = () => wire([W_Q0.at(-1), [PLUG.x + 4, COIL.y + COIL.d, VALVE_Z + COIL_H], [PLUG.x + 4, PLUG.y + PLUG.d, VALVE_Z + COIL_H + 3]], "q0");
const hose = (pts, name) => { const d = poly(pts); return `<g class="plc-hose" data-hose="${name}"><path class="plc-hose-body" d="${d}"/><path class="plc-hose-core" d="${d}"/><path class="plc-hose-flow" d="${d}"/></g>`; };
const VTOP = VALVE_Z + VALVE_H + 4.8;
const CTOP = CYL_Z + CYL_H + 5.6;
const hoses = () => [
  hose(expand([[PORT_B[0], PORT_B[1], VTOP], bez([PORT_B[0], PORT_B[1], VTOP + 26], [CPORT_B[0], CPORT_B[1], CTOP + 30], [CPORT_B[0], CPORT_B[1], CTOP], 28)]), "b"),
  hose(expand([[PORT_A[0], PORT_A[1], VTOP], bez([PORT_A[0], PORT_A[1], VTOP + 16], [CPORT_A[0], CPORT_A[1], CTOP + 16], [CPORT_A[0], CPORT_A[1], CTOP], 24)]), "a"),
].join("");

// ── scan ring dot path (screen points) ──
const RING = Array.from({ length: 96 }, (_, i) => { const a = (i / 96) * Math.PI * 2; return at([LOOP[0] + Math.sin(a) * LOOP_R, LOOP[1] - Math.cos(a) * LOOP_R, PLC_H]).map((v) => +v.toFixed(1)); });

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A PLC training bench: a START push button and an inductive proximity sensor are wired to the inputs of a compact PLC on a DIN rail, powered by a 24 V supply. The PLC output drives a 5/2 solenoid valve that sends air to a double-acting pneumatic cylinder. A dot circling the PLC top shows the scan cycle: read inputs, run the program, write outputs.",
  body: [
    plate(),
    ladder(),
    floorWires(),
    buttonBox(),
    track(),
    `<g data-part="workpiece">${workpiece()}</g>`,
    sensorStand(),
    sensor(),
    sensorArm(),
    sensorCable(),
    rail(),
    psu(),
    plc(),
    `<circle class="plc-dot" data-part="scan" cx="${RING[0][0]}" cy="${RING[0][1]}" r="2.1"/>`,
    wires(),
    valve(),
    `<g data-part="spool">${spoolMarker()}</g>`,
    coilWire(),
    cylinderBody(),
    `<g data-part="rod">${rod()}</g>`,
    gland(),
    hoses(),
  ],
});

const ROD_V = k.axisVector(P, [1, 0, 0]);
const WP_V = k.axisVector(P, [1, 0, 0]);
const BTN_V = k.axisVector(P, [0, 0, -1]);

const CSS = `
.plc-led{fill:var(--anatomy-paper);stroke:var(--anatomy-mid);stroke-width:.5;transition:fill .12s}
.plc-led[data-on]{fill:#30c46c;stroke:#1f8a4a}
.plc-led[data-led="power"],.plc-led[data-led="run"]{fill:#30c46c;stroke:#1f8a4a}
.plc-led[data-led="coil"][data-on]{fill:#f2b33d;stroke:#b07a12}
.plc-stage{fill:var(--anatomy-paper);stroke:var(--anatomy-mid);stroke-width:.5}
.plc-stage[data-on]{fill:var(--anatomy-lit);stroke:var(--anatomy-lit)}
.plc-dot{fill:var(--anatomy-lit)}
.plc-rung[data-on]{stroke:#30a46c;stroke-width:1.1}
.plc-wire[data-on] .iso-line{stroke:#30a46c;stroke-width:1}
.plc-hose-body{fill:none;stroke:var(--anatomy-mid);stroke-width:3.6;stroke-linecap:round;stroke-linejoin:round}
.plc-hose-core{fill:none;stroke:var(--anatomy-card);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.plc-hose-flow{fill:none;stroke:#3e8fdd;stroke-width:1.1;stroke-dasharray:2 5;opacity:0;transition:opacity .2s}
.plc-hose[data-flow="in"] .plc-hose-flow{opacity:1;animation:plc-air .7s linear infinite}
.plc-hose[data-flow="out"] .plc-hose-flow{opacity:.55;stroke:var(--anatomy-mid);animation:plc-air .7s linear infinite reverse}
@keyframes plc-air{to{stroke-dashoffset:-14}}
.plc-stage-wrap{touch-action:none;cursor:default}
.plc-stage-wrap [data-part="button"],.plc-stage-wrap [data-part="workpiece"]{cursor:pointer}
.plc-toggle{all:unset;cursor:pointer;color:var(--anatomy-text);border-bottom:1px dotted var(--anatomy-mid);pointer-events:auto}
@media (prefers-reduced-motion:reduce){.plc-hose .plc-hose-flow{animation:none!important}}
`;

const live = `(() => {
const root = document.currentScript ? document.currentScript.previousElementSibling : document.querySelector(".plc-fig");
const fig = root.matches(".plc-fig") ? root : document.querySelector(".plc-fig");
const stage = fig.querySelector(".plc-stage-wrap"), svg = stage.querySelector("svg");
const $ = (s) => svg.querySelector(s);
const ring = ${JSON.stringify(RING)};
const ROD_V = ${JSON.stringify(ROD_V)}, WP_V = ${JSON.stringify(WP_V)}, BTN_V = ${JSON.stringify(BTN_V)};
const STROKE = ${STROKE}, BTN_TRAVEL = ${BTN_TRAVEL}, WP_RANGE = ${JSON.stringify(WP_RANGE)}, SENSOR_X = ${SENSOR[0]}, WP_W = ${WP.w};
const SCAN_MS = 4, SLOW = 450, SCAN = SCAN_MS * SLOW / 1000;
const parts = { scan: $('[data-part="scan"]'), rod: $('[data-part="rod"]'), clip: $('#plc-rod-clip path'), spool: $('[data-part="spool"]'), btn: $('[data-part="button"]'), wp: $('[data-part="workpiece"]') };
const leds = {}; svg.querySelectorAll("[data-led]").forEach((n) => (leds[n.dataset.led] = n));
const stages = [...svg.querySelectorAll(".plc-stage")];
const rung = {}; svg.querySelectorAll("[data-rung]").forEach((n) => (rung[n.dataset.rung] = n));
const wires = {}; svg.querySelectorAll("[data-wire]").forEach((n) => (wires[n.dataset.wire] = wires[n.dataset.wire] || []).push(n));
const hoses = {}; svg.querySelectorAll("[data-hose]").forEach((n) => (hoses[n.dataset.hose] = n));
const readout = fig.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const on = (n, v) => n && (Array.isArray(n) ? n.forEach((m) => on(m, v)) : v ? n.setAttribute("data-on", "") : n.removeAttribute("data-on"));
const mv = (v, s) => "translate(" + (v[0] * s).toFixed(2) + " " + (v[1] * s).toFixed(2) + ")";
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
// world state
let btn = false, wpX = WP_RANGE[0], wpTarget = wpX, btnZ = 0;
// PLC state: process images update only at their phase of the scan
let phase = 0, scanN = 1, I0 = 0, I1 = 0, logic = 0, Q0 = 0;
let rodX = 0, spool = 0;
let touring = !still.matches, tourT = 0, idle = 0, visible = false, frame = 0, last = 0;
const sensed = () => Math.abs(wpX + WP_W / 2 - SENSOR_X) < WP_W * 0.42;
const TOUR = 13;
function tour(t) {
  btn = t > 1.2 && t < 3.6;
  wpTarget = t > 6 && t < 10 ? WP_RANGE[1] : WP_RANGE[0];
}
const names = ["READ INPUT", "RUN PROGRAM", "WRITE OUTPUT"];
function step(dt) {
  const before = Math.floor(phase * 3);
  phase += dt / SCAN;
  if (phase >= 1) { phase -= 1; scanN++; }
  const now = Math.floor(phase * 3);
  if (now !== before) {
    if (now === 0) { I0 = btn ? 1 : 0; I1 = sensed() ? 1 : 0; }
    if (now === 1) logic = I0 || I1 ? 1 : 0;
    if (now === 2) Q0 = logic;
  }
}
function draw() {
  const p = ring[Math.floor(phase * ring.length) % ring.length];
  parts.scan.setAttribute("cx", p[0]); parts.scan.setAttribute("cy", p[1]);
  const st = Math.floor(phase * 3); stages.forEach((n, i) => on(n, i === st));
  parts.btn.setAttribute("transform", mv(BTN_V, btnZ));
  parts.wp.setAttribute("transform", mv(WP_V, wpX));
  on(leds.sensor, sensed()); on(leds.i0, I0); on(leds.i1, I1); on(leds.q0, Q0); on(leds.coil, Q0);
  on(rung.in0, I0); on(rung.in1, I1); on(rung.out, logic);
  on(wires.i0, btn); on(wires.i1, sensed()); on(wires.q0, Q0); on(wires.pwr, 1);
  parts.spool.setAttribute("transform", mv(ROD_V, spool * 9));
  parts.rod.setAttribute("transform", mv(ROD_V, rodX));
  parts.clip.setAttribute("transform", mv(ROD_V, -rodX));
  const moving = Math.abs(rodX - Q0 * STROKE) > 0.3;
  hoses.a.dataset.flow = moving ? (Q0 ? "in" : "out") : ""; hoses.b.dataset.flow = moving ? (Q0 ? "out" : "in") : "";
  const text = "SCAN #" + scanN + " · " + names[st] + " · I0.0=" + I0 + " I0.1=" + I1 + " → Q0.0=" + Q0;
  if (readout.textContent !== text) readout.textContent = text;
}
function tick(t) {
  const dt = last ? Math.min((t - last) / 1000, 1 / 20) : 1 / 60; last = t;
  if (touring) { tourT = (tourT + dt) % TOUR; tour(tourT); } else if ((idle += dt) > 6) { touring = !still.matches; tourT = 0; }
  const calm = still.matches;
  const f = (tau) => (calm ? 1 : 1 - Math.exp(-dt / tau));
  btnZ += ((btn ? BTN_TRAVEL : 0) - btnZ) * f(0.05);
  wpX += (wpTarget - wpX) * f(0.3);
  step(calm ? SCAN / 3 : dt);
  spool += (Q0 - spool) * f(0.06);
  rodX += (Q0 * STROKE - rodX) * f(0.32);
  draw();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; visible ? run() : (cancelAnimationFrame(frame), (frame = 0)); }, { rootMargin: "80px 0px" }).observe(stage);
const take = () => { touring = false; idle = 0; };
parts.btn.addEventListener("pointerdown", (e) => { take(); btn = true; e.preventDefault(); });
addEventListener("pointerup", () => { if (!touring) btn = false; });
let drag = null;
parts.wp.addEventListener("pointerdown", (e) => { take(); drag = { x: e.clientX, from: wpTarget }; e.preventDefault(); });
addEventListener("pointermove", (e) => {
  if (!drag) return;
  const box = svg.getBoundingClientRect(), scale = box.width / svg.viewBox.baseVal.width;
  const ux = WP_V[0] * scale, uy = WP_V[1] * scale;
  wpTarget = clamp(drag.from + (e.clientX - drag.x) / ux, WP_RANGE[0], WP_RANGE[1]);
  idle = 0;
});
addEventListener("pointerup", () => (drag = null));
stage.addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "Enter") { take(); btn = true; e.preventDefault(); }
  if (e.key === "ArrowRight") { take(); wpTarget = WP_RANGE[1]; e.preventDefault(); }
  if (e.key === "ArrowLeft") { take(); wpTarget = WP_RANGE[0]; e.preventDefault(); }
});
stage.addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") btn = false; });
draw();
})();`;

const figure = k.plateHtml({
  fig: "Fig 1",
  title: "PLC scan cycle",
  hint: "กดปุ่ม START หรือลากชิ้นงานเข้าใต้เซนเซอร์",
  readout: "SCAN #1 · READ INPUT · I0.0=0 I0.1=0 → Q0.0=0",
  keys: [
    { mark: "lit", label: "จุดวิ่งรอบ PLC = Scan Cycle: อ่านอินพุต → ประมวลผล → สั่งเอาต์พุต" },
    { mark: "green", label: "สัญญาณที่ทำงานอยู่ (สาย, ไฟ LED, เส้น Ladder)" },
    { mark: "blue", label: "ลมอัดไหลเข้ากระบอกลม" },
  ],
  caption:
    "PLC ไม่ได้ตอบสนองทันทีที่กดปุ่ม แต่ทำงานเป็นรอบ: ต้นรอบอ่านสถานะอินพุตทั้งหมดเก็บไว้ จากนั้นประมวลผลตามโปรแกรม (I0.0 OR I0.1 → Q0.0) แล้วจึงสั่งเอาต์พุตพร้อมกันตอนท้ายรอบ รอบจริงใช้เวลาราว 1–10 ms ภาพนี้แสดงรอบละ 4 ms ช้าลง 450 เท่าเพื่อให้มองเห็น",
  body: `<div class="iso-stage plc-stage-wrap" tabindex="0" role="img" aria-label="PLC scan cycle: กด Space เพื่อกดปุ่ม START, ลูกศรซ้าย/ขวาเพื่อเลื่อนชิ้นงาน">${svg}</div>`,
});

const scoped = k.ISO_CSS;
const fragment = `<div class="iso plc-fig" data-theme="${theme}"><style>${scoped}${CSS}</style>${figure}</div><script>${live}</script>`;
writeFileSync(join(HERE, "plc-scan.fragment.html"), fragment);
writeFileSync(join(HERE, theme === "light" ? "plc-scan.html" : "plc-scan-dark.html"), `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PLC scan cycle</title><style>body{margin:0;background:${theme === "light" ? "#f2f2ef" : "#0b0b0b"};padding:32px 16px}.plc-fig{max-width:720px;margin:0 auto}</style></head><body>${fragment}</body></html>`);
console.log("wrote", (fragment.length / 1024).toFixed(1) + " KB fragment");

// `--inject` writes the figure into the plc-type article, between markers, right before the components heading.
if (process.argv.includes("--inject")) {
  const { readFileSync } = await import("node:fs");
  const file = join(HERE, "../../../src/data/pages.json");
  const raw = readFileSync(file, "utf8");
  const pages = JSON.parse(raw);
  const page = pages.find((p) => p.route === "plc-type");
  const block = `<!-- fig:plc-scan -->\n${fragment}\n<!-- /fig:plc-scan -->\n\n`;
  const marked = /<!-- fig:plc-scan -->[\s\S]*?<!-- \/fig:plc-scan -->\n\n/;
  const anchor = '<h2 class="wp-block-heading" id="plc-components">';
  if (marked.test(page.html)) page.html = page.html.replace(marked, () => block);
  else if (page.html.includes(anchor)) page.html = page.html.replace(anchor, () => block + anchor);
  else throw new Error("plc-type: components heading not found");
  writeFileSync(file, JSON.stringify(pages, null, 2) + (raw.endsWith("\n") ? "\n" : ""));
  console.log("injected into plc-type");
}
