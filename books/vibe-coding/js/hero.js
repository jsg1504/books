/* 표지 3D: 코드 타워. 위에는 사람의 의도(바이브)가 물결치고, 고리를 도는 코딩 에이전트가
   코드 블록을 만들어 탑에 쌓는다. 탑을 감싼 검증 고리가 위아래로 훑으며 블록을 검사하고,
   실패한 블록은 튕겨 나간다. 명세 블록이 바닥을 받치고, 사람의 리뷰와 커밋이 체크포인트를 남긴다. */
(function () {
  "use strict";
  const box = document.getElementById("hero");
  if (!box) return;
  const cv = box.querySelector("canvas");
  const logEl = box.querySelector(".term-log");
  const rnd = VB.rng(11);
  const stars = Array.from({ length: 70 }, () => { const u = rnd() * Math.PI * 2, v = Math.acos(2 * rnd() - 1), r = 1.8 + rnd() * 0.8; return [r * Math.sin(v) * Math.cos(u), r * Math.cos(v) * 0.7, r * Math.sin(v) * Math.sin(u)]; });

  const Y0 = -0.78, BH = 0.12, GAP = 0.025, YORB = 1.12, YAG = 0.5, RAG = 1.08;
  const st = VB.canvas(cv, { height: () => box.clientHeight });
  let yaw = 0.5, pitch = 0.42, drag = null, auto = true;
  box.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, yaw, pitch }; box.setPointerCapture(e.pointerId); auto = false; });
  box.addEventListener("pointermove", (e) => {
    if (!drag) return;
    yaw = drag.yaw + (e.clientX - drag.x) * 0.008;
    pitch = VB.clamp(drag.pitch + (e.clientY - drag.y) * 0.006, -0.1, 1.15);
  });
  const endDrag = () => { drag = null; setTimeout(() => (auto = true), 2500); };
  box.addEventListener("pointerup", endDrag);
  box.addEventListener("pointercancel", endDrag);

  function project(p, w, h) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const x1 = p[0] * cy - p[2] * sy, z1 = p[0] * sy + p[2] * cy;
    const yy = p[1] - 0.18;
    const y2 = yy * cp - z1 * sp, z2 = yy * sp + z1 * cp;
    // 아래쪽 로그 상자(약 80px)를 피해 그 위 영역에 장면을 맞춘다
    const H = h - 80, f = 3.4 / (3.4 + z2), s = Math.min(w * 0.85, H * 1.1) * 0.33;
    return { x: w / 2 + x1 * s * f, y: H * 0.46 - y2 * s * f, f, z: z2 };
  }

  /* 탑의 블록: {kind, y(목표 층), cy(현재 높이), x,z(떨어지는 위치), state, tilt, a} */
  let blocks = [], agentA = 0, ring = { y: Y0, on: 0, col: "test", dir: 1 }, orbPulse = 0, revPulse = 0, marks = [];
  const trail = [];
  let lines = [];
  const NAME = { human: "you", vibe: "vibe", spec: "spec", code: "agent", test: "test", risk: "fail", eng: "review", cost: "cost" };
  const CLS = { human: "user", vibe: "acc", spec: "state", code: "ctx", test: "env", risk: "guard", eng: "acc2", cost: "tool" };
  function log(k, s) {
    lines.push({ k, s });
    logEl.innerHTML = lines.slice(-3).map((l) => `<div><span class="chip k-${CLS[l.k]}">${NAME[l.k]}</span> ${VB.esc(l.s)}</div>`).join("");
  }
  const agentPos = () => [Math.cos(agentA) * RAG, YAG + Math.sin(agentA * 2) * 0.05, Math.sin(agentA) * RAG];
  const topY = () => Y0 + blocks.filter((b) => b.state !== "gone" && b.state !== "eject").length * (BH + GAP);
  function addBlock(kind, opts = {}) {
    const ap = agentPos();
    const layer = topY();
    blocks.push({ kind, ty: layer, cy: kind === "spec" ? layer : ap[1], x: kind === "spec" ? 0 : ap[0], z: kind === "spec" ? 0 : ap[2], t: 0, state: "drop", tilt: opts.tilt || 0, bad: !!opts.bad, a: 1, w: opts.w || 1 });
    if (kind !== "spec") trail.push({ from: [0, YORB, 0], to: ap, t: 0, role: "vibe" });
  }
  function sweep(col) { ring = { y: Y0 - 0.05, on: 1, col, dir: 1 }; }

  const SCRIPT = [
    () => { log("human", "› 습관 추적 앱 만들어 줘. 매일 체크하고 연속 기록 보여 주고"); orbPulse = 1; },
    () => { log("spec", "plan   AGENTS.md 로드 · 명세 6줄 · 수용 기준 4개 · 비목표 2개"); addBlock("spec", { w: 1.1 }); },
    () => { log("code", "agent  src/habits.ts  +84  (연속 기록 계산)"); addBlock("code", { bad: true }); },
    () => { log("test", "test   npm test → 12 passed · 1 failed  ✗ 자정 경계"); sweep("risk"); },
    () => { log("code", "agent  같은 블록 수정  +6 −2  (시간대 처리)"); addBlock("code"); },
    () => { log("test", "test   13 passed  ✓  · tsc 0 errors"); sweep("test"); },
    () => { log("eng", "review 사람이 diff 140줄 읽음 → 이름 하나 고치고 승인"); revPulse = 1; },
    () => { log("eng", "git    commit a3f9c1  · 체크포인트"); marks.push(topY()); },
    () => { log("code", "agent  src/ui/*.tsx  +210  (오늘 화면, 달력)"); addBlock("code"); },
    () => { log("vibe", "vibe   “버튼 좀 더 귀엽게” → 읽지 않고 수락"); addBlock("vibe", { tilt: 0.12 }); },
    () => { log("test", "test   21 passed  ✓  (UI 스타일은 검사 밖)"); sweep("test"); },
    () => { log("cost", "done   1시간 50분 · 토큰 1.6M · 사람 리뷰 18분"); orbPulse = 0.6; },
  ];
  let idx = -1, wait = 0.8;
  function next() {
    idx = (idx + 1) % (SCRIPT.length + 1);
    if (idx === SCRIPT.length) { // 다시 시작: 탑을 비운다
      blocks.forEach((b) => { if (b.state !== "gone") { b.state = "fade"; } });
      marks = []; lines = []; wait = 1.4; return;
    }
    SCRIPT[idx]();
    wait = 1.7;
  }

  function face(c, pts, fill, stroke) {
    c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.closePath();
    c.fillStyle = fill; c.fill(); c.strokeStyle = stroke; c.lineWidth = 1; c.stroke();
  }
  function drawBox(c, b, w, h) {
    const W = 0.46 * b.w, D = 0.3, H = BH / 2;
    const ca = Math.cos(b.tilt), sa = Math.sin(b.tilt);
    const corner = (sx, sy, sz) => { const lx = sx * W, lz = sz * D; return project([b.x + lx * ca - lz * sa, b.cy + sy * H + lx * b.tilt * 0.4, b.z + lx * sa + lz * ca], w, h); };
    const P = {};
    [-1, 1].forEach((sx) => [-1, 1].forEach((sy) => [-1, 1].forEach((sz) => (P[`${sx}${sy}${sz}`] = corner(sx, sy, sz)))));
    const role = b.state === "bad" || b.state === "eject" ? "risk" : b.kind;
    const col = VB.rc(role);
    const A = b.a;
    const faces = [
      ["-1-1-1", "1-1-1", "11-1", "-11-1"], ["-1-11", "1-11", "111", "-111"],
      ["-1-1-1", "-1-11", "-111", "-11-1"], ["1-1-1", "1-11", "111", "11-1"],
      ["-11-1", "11-1", "111", "-111"],
    ].map((k) => k.map((key) => P[key.replace(/(-?1)(-?1)(-?1)/, "$1$2$3")]));
    faces.map((f) => ({ f, z: f.reduce((s, p) => s + p.z, 0) / 4 })).sort((a, b2) => b2.z - a.z).forEach(({ f }, i) => {
      face(c, f, VB.alpha(col, (i === 4 ? 0.42 : 0.2) * A + (b.flash || 0) * 0.3), VB.alpha(col, 0.85 * A));
    });
    if (b.bad && b.state === "set") { /* 아직 모르는 버그: 작은 점 */ const p = P["111"]; c.fillStyle = VB.alpha(VB.col("guard"), 0.5 + 0.5 * Math.sin(performance.now() / 200)); c.beginPath(); c.arc(p.x, p.y, 3, 0, 7); c.fill(); }
  }

  function draw(dt) {
    const { ctx: c, w, h } = st;
    c.clearRect(0, 0, w, h);
    if (auto && !drag) yaw += dt * 0.12;
    agentA += dt * 0.55;
    orbPulse = Math.max(0, orbPulse - dt * 0.8); revPulse = Math.max(0, revPulse - dt * 0.7);

    c.fillStyle = VB.col("text-faint");
    stars.forEach((s) => { const p = project(s, w, h); c.globalAlpha = 0.2 * p.f; c.fillRect(p.x, p.y, 1.6, 1.6); });
    c.globalAlpha = 1;

    // 바닥 격자
    const env = VB.col("env");
    for (let g = -1.2; g <= 1.21; g += 0.3) {
      const a = project([g, Y0 - BH, -1.2], w, h), b = project([g, Y0 - BH, 1.2], w, h);
      const a2 = project([-1.2, Y0 - BH, g], w, h), b2 = project([1.2, Y0 - BH, g], w, h);
      c.strokeStyle = VB.alpha(VB.col("text-faint"), 0.14); c.lineWidth = 1;
      c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.moveTo(a2.x, a2.y); c.lineTo(b2.x, b2.y); c.stroke();
    }

    // 의도 구름(바이브): 위쪽 물결 고리
    const acc = VB.col("accent");
    const op = project([0, YORB, 0], w, h);
    for (let k = 0; k < 3; k++) {
      c.strokeStyle = VB.alpha(acc, 0.5 - k * 0.13); c.lineWidth = 2 - k * 0.4; c.beginPath();
      for (let i = 0; i <= 80; i++) {
        const a = (i / 80) * Math.PI * 2, r = 0.42 + k * 0.16 + Math.sin(a * 5 + performance.now() / 600 + k) * 0.05;
        const p = project([Math.cos(a) * r, YORB + Math.sin(a * 3 + k) * 0.05 + k * 0.03, Math.sin(a) * r], w, h);
        i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y);
      }
      c.stroke();
    }
    const g = c.createRadialGradient(op.x, op.y, 2, op.x, op.y, 40 * op.f);
    g.addColorStop(0, VB.alpha(acc, 0.6 + orbPulse * 0.35)); g.addColorStop(1, VB.alpha(acc, 0));
    c.fillStyle = g; c.beginPath(); c.arc(op.x, op.y, 40 * op.f, 0, 7); c.fill();
    VB.node(c, op.x, op.y, 14 * op.f, "vibe", null, { fill: 0.35, lw: 2.4 });
    VB.text(c, "의도", op.x, op.y, { size: 10.5, weight: 800, align: "center", color: acc });

    // 에이전트 궤도
    const ctxc = VB.col("ctx");
    c.save(); c.strokeStyle = VB.alpha(ctxc, 0.32); c.setLineDash([5, 5]); c.lineWidth = 1.2; c.beginPath();
    for (let i = 0; i <= 90; i++) { const a = (i / 90) * Math.PI * 2, p = project([Math.cos(a) * RAG, YAG, Math.sin(a) * RAG], w, h); i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); }
    c.stroke(); c.restore();

    // 블록 상태 갱신
    blocks.forEach((b) => {
      if (b.state === "drop") {
        b.t = Math.min(1, b.t + dt * 1.4);
        const e = VB.ease(b.t);
        b.cy = VB.lerp(b.cy, b.ty, e * 0.25 + (b.t >= 1 ? 1 : 0));
        b.x = VB.lerp(b.x, 0, e * 0.25); b.z = VB.lerp(b.z, 0, e * 0.25);
        if (b.t >= 1) { b.cy = b.ty; b.x = 0; b.z = 0; b.state = "set"; b.flash = 0.6; }
      } else if (b.state === "eject") {
        b.t += dt; b.x += dt * 1.6; b.cy -= dt * (0.4 + b.t * 1.4); b.tilt += dt * 3; b.a = Math.max(0, 1 - b.t * 0.9);
        if (b.a <= 0) b.state = "gone";
      } else if (b.state === "fade") {
        b.a = Math.max(0, b.a - dt * 1.2); if (b.a <= 0) b.state = "gone";
      }
      b.flash = Math.max(0, (b.flash || 0) - dt * 1.5);
    });
    blocks = blocks.filter((b) => b.state !== "gone");

    // 검증 고리가 훑으며 블록을 검사
    if (ring.on) {
      ring.y += dt * 1.25;
      blocks.forEach((b) => {
        if (b.state === "set" && Math.abs(b.cy - ring.y) < 0.03) {
          b.flash = 1;
          if (b.bad) { b.state = "eject"; b.t = 0; }
        }
      });
      if (ring.y > topY() + 0.1) ring.on = 0;
    }

    // 사람 리뷰 펄스 (오른쪽 위 눈)
    const ep = project([-1.0, 0.95, 0.3], w, h);
    const a2 = VB.col("accent-2");
    VB.node(c, ep.x, ep.y, 11 * ep.f, "eng", null, { glow: revPulse, fill: 0.25 });
    VB.text(c, "사람", ep.x, ep.y + 20 * ep.f, { size: 10.5, weight: 700, align: "center", color: VB.col("text-dim") });
    if (revPulse > 0) {
      const tp = project([0, topY(), 0], w, h);
      c.strokeStyle = VB.alpha(a2, revPulse * 0.8); c.setLineDash([4, 4]); c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(ep.x, ep.y); c.lineTo(tp.x, tp.y); c.stroke(); c.setLineDash([]);
    }

    // 그리기: 블록(아래→위), 고리, 에이전트 (z 정렬은 단순화)
    const ap = agentPos(), app = project(ap, w, h);
    const agentBehind = app.z > 0;
    if (agentBehind) drawAgent();
    blocks.slice().sort((a, b) => a.cy - b.cy).forEach((b) => drawBox(c, b, w, h));
    // 체크포인트 표시
    marks.forEach((my) => {
      const l = project([-0.62, my - GAP / 2, 0.36], w, h), r = project([0.62, my - GAP / 2, 0.36], w, h);
      c.strokeStyle = a2; c.lineWidth = 2; c.beginPath(); c.moveTo(l.x, l.y); c.lineTo(r.x, r.y); c.stroke();
      VB.text(c, "commit", r.x + 6, r.y, { size: 10, mono: true, color: a2 });
    });
    if (ring.on) {
      const rc = VB.rc(ring.col);
      c.strokeStyle = VB.alpha(rc, 0.9); c.lineWidth = 2.4; c.beginPath();
      for (let i = 0; i <= 64; i++) { const a = (i / 64) * Math.PI * 2, p = project([Math.cos(a) * 0.72, ring.y, Math.sin(a) * 0.5], w, h); i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); }
      c.stroke();
    }
    // 바닥 검증 받침 고리(항상)
    c.strokeStyle = VB.alpha(env, 0.35); c.lineWidth = 1.4; c.setLineDash([3, 5]); c.beginPath();
    for (let i = 0; i <= 64; i++) { const a = (i / 64) * Math.PI * 2, p = project([Math.cos(a) * 0.78, Y0 - BH, Math.sin(a) * 0.56], w, h); i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); }
    c.stroke(); c.setLineDash([]);
    if (!agentBehind) drawAgent();
    function drawAgent() {
      VB.node(c, app.x, app.y, 12 * app.f, "code", null, { fill: 0.3, glow: 0.4 });
      VB.text(c, "에이전트", app.x, app.y + 21 * app.f, { size: 10.5, weight: 700, align: "center", color: VB.col("text-dim") });
    }
    const bl = project([1.15, Y0 - BH, 1.15], w, h);
    VB.text(c, "검증 받침", bl.x, bl.y + 12, { size: 11, weight: 700, align: "right", color: env });

    // 의도 → 에이전트 패킷
    for (let i = trail.length - 1; i >= 0; i--) {
      const t = trail[i];
      t.t += dt * 1.6;
      if (t.t >= 1) { trail.splice(i, 1); continue; }
      const e = VB.ease(t.t), p = project([VB.lerp(t.from[0], ap[0], e), VB.lerp(t.from[1], ap[1], e) + Math.sin(e * Math.PI) * 0.2, VB.lerp(t.from[2], ap[2], e)], w, h);
      c.fillStyle = acc; c.globalAlpha = 1 - t.t * 0.5; c.beginPath(); c.arc(p.x, p.y, 4, 0, 7); c.fill(); c.globalAlpha = 1;
    }

    wait -= dt;
    if (wait <= 0) next();
  }
  st.draw = () => draw(0);
  const L = VB.loop(box, draw);
  if (VB.reduced()) { for (let i = 0; i < 11; i++) next(); blocks.forEach((b) => { b.state = b.bad ? "gone" : "set"; b.cy = b.ty; b.x = 0; b.z = 0; }); blocks = blocks.filter((b) => b.state !== "gone"); draw(0); }
  else L.start();
})();
