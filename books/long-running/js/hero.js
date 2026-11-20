/* 표지 3D: 세션 나선. 에이전트(주황)가 나선을 따라 위로 달린다. 나선의 한 바퀴는 컨텍스트 창 하나(세션)이고,
   달리는 동안 창이 차오른다(청록 호). 가운데 기둥은 저장소의 기능 목록(보라)이다. 세션은 진행 파일을 읽고 시작해
   기능 하나를 끝내면 블록을 초록으로 바꾸고 커밋(체크포인트)을 남긴다. 가끔 충돌(빨강)이 나면 마지막 체크포인트에서
   다시 시작하고, 사람(파랑)은 가끔 승인을 해 준다. */
(function () {
  "use strict";
  const box = document.getElementById("hero");
  if (!box) return;
  const cv = box.querySelector("canvas");
  const logEl = box.querySelector(".term-log");
  const rnd = LR.rng(7);
  const stars = Array.from({ length: 70 }, () => { const u = rnd() * Math.PI * 2, v = Math.acos(2 * rnd() - 1), r = 1.9 + rnd() * 0.8; return [r * Math.sin(v) * Math.cos(u), r * Math.cos(v) * 0.7, r * Math.sin(v) * Math.sin(u)]; });

  const NS = 5, Y0 = -0.82, DY = 0.36, R = 1.02, NF = 10, FH = 0.11;
  const st = LR.canvas(cv, { height: () => box.clientHeight });
  let yaw = 0.6, pitch = 0.36, drag = null, auto = true;
  box.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, yaw, pitch }; box.setPointerCapture(e.pointerId); auto = false; });
  box.addEventListener("pointermove", (e) => {
    if (!drag) return;
    yaw = drag.yaw + (e.clientX - drag.x) * 0.008;
    pitch = LR.clamp(drag.pitch + (e.clientY - drag.y) * 0.006, -0.1, 1.15);
  });
  const endDrag = () => { drag = null; setTimeout(() => (auto = true), 2500); };
  box.addEventListener("pointerup", endDrag);
  box.addEventListener("pointercancel", endDrag);

  function project(p, w, h) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const x1 = p[0] * cy - p[2] * sy, z1 = p[0] * sy + p[2] * cy;
    const yy = p[1] - 0.05;
    const y2 = yy * cp - z1 * sp, z2 = yy * sp + z1 * cp;
    const H = h - 80, f = 3.6 / (3.6 + z2), s = Math.min(w * 0.85, H * 1.1) * 0.33;
    return { x: w / 2 + x1 * s * f, y: H * 0.5 - y2 * s * f, f, z: z2 };
  }
  /* 나선 위의 점: 세션 k, 진행 u(0..1) */
  const ringY = (k) => Y0 + k * DY;
  const helix = (k, u) => { const a = u * Math.PI * 2 - Math.PI / 2; return [Math.cos(a) * R, ringY(k) + u * DY * 0.92, Math.sin(a) * R]; };

  /* 상태 */
  let ses = 0, u = 0, speed = 0.16, pause = 0, feats = [], commits = [], crash = 0, beam = null, human = 0, flash = 0;
  let lines = [], fired = {};
  const NAME = { run: "agent", mem: "memory", ok: "commit", ctx: "context", risk: "crash", human: "human", cost: "cost" };
  const CLS = { run: "acc", mem: "state", ok: "env", ctx: "ctx", risk: "guard", human: "acc2", cost: "tool" };
  function log(k, s) {
    lines.push({ k, s });
    logEl.innerHTML = lines.slice(-3).map((l) => `<div><span class="chip k-${CLS[l.k]}">${NAME[l.k]}</span> ${LR.esc(l.s)}</div>`).join("");
  }
  function reset() {
    ses = 0; u = 0; feats = Array.from({ length: NF }, () => 0); commits = []; crash = 0; lines = []; fired = {};
  }
  reset();
  const doneCount = () => feats.filter((f) => f >= 1).length;

  /* 세션마다 일어나는 일: [진행 u, 이벤트] */
  const EVENTS = [
    [0.02, () => { log("mem", `session ${ses + 1} · 진행 파일과 git log 읽기 → 다음 기능 #${doneCount() + 1}`); beam = { dir: "in", t: 0 }; }],
    [0.3, () => { if (ses === 1) log("run", "브라우저로 종단 간 테스트 · 로그인 흐름 클릭"); else if (ses === 3) log("human", "배포 설정 변경 요청 → 사람이 승인"); else log("run", `기능 #${doneCount() + 1} 구현 · 테스트 작성`); if (ses === 3) human = 1; }],
    [0.55, () => { if (ses === 2 && !fired.crashed) { fired.crashed = 1; crash = 1; log("risk", "프로세스 충돌 · 마지막 커밋에서 재개"); u = 0.1; } else log("ctx", `컨텍스트 ${Math.round(55 + ses * 6)}% · 오래된 도구 결과 비움`); }],
    [0.82, () => { const i = doneCount(); feats[i] = 0.01; flash = 1; log("ok", `feature #${i + 1} passes:true · commit ${(0x3a7f1 + ses * 7919).toString(16).slice(-5)}`); commits.push({ k: ses, u: 0.82 }); beam = { dir: "out", t: 0 }; }],
    [0.97, () => { log("ctx", ses < NS - 1 ? "창 92% → 진행 파일 갱신 후 새 세션" : `기능 ${doneCount()}/${NF} 통과 · 총 ${NS}세션 · 토큰 ${(NS * 0.42).toFixed(1)}M`); }],
  ];

  function face(c, pts, fill, stroke) {
    c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.closePath();
    c.fillStyle = fill; c.fill(); c.strokeStyle = stroke; c.lineWidth = 1; c.stroke();
  }
  function cube(c, cx, cy, cz, W, H, D, col, a, w, h) {
    const P = {};
    [-1, 1].forEach((sx) => [-1, 1].forEach((sy) => [-1, 1].forEach((sz) => (P[`${sx},${sy},${sz}`] = project([cx + sx * W, cy + sy * H, cz + sz * D], w, h)))));
    const F = [["-1,-1,-1", "1,-1,-1", "1,1,-1", "-1,1,-1"], ["-1,-1,1", "1,-1,1", "1,1,1", "-1,1,1"], ["-1,-1,-1", "-1,-1,1", "-1,1,1", "-1,1,-1"], ["1,-1,-1", "1,-1,1", "1,1,1", "1,1,-1"], ["-1,1,-1", "1,1,-1", "1,1,1", "-1,1,1"]];
    F.map((k) => k.map((q) => P[q])).map((f) => ({ f, z: f.reduce((s, p) => s + p.z, 0) / 4 })).sort((x, y) => y.z - x.z).forEach(({ f }, i) => face(c, f, LR.alpha(col, (i === 4 ? 0.45 : 0.2) * a), LR.alpha(col, 0.85 * a)));
  }

  function draw(dt) {
    const { ctx: c, w, h } = st;
    c.clearRect(0, 0, w, h);
    if (auto && !drag) yaw += dt * 0.12;

    /* 진행 */
    if (pause > 0) pause -= dt;
    else {
      const prev = u;
      u += dt * speed;
      EVENTS.forEach(([at, fn]) => { if (prev < at && u >= at) fn(); });
      if (u >= 1) {
        ses++; u = 0;
        if (ses >= NS) { pause = 2.2; ses = NS - 1; u = 0.999; setTimeout(reset, 2100); }
      }
    }
    feats = feats.map((f) => (f > 0 && f < 1 ? Math.min(1, f + dt * 1.2) : f));
    crash = Math.max(0, crash - dt * 0.7); human = Math.max(0, human - dt * 0.5); flash = Math.max(0, flash - dt * 1.2);
    if (beam) { beam.t += dt * 1.4; if (beam.t >= 1) beam = null; }

    c.fillStyle = LR.col("text-faint");
    stars.forEach((s) => { const p = project(s, w, h); c.globalAlpha = 0.2 * p.f; c.fillRect(p.x, p.y, 1.6, 1.6); });
    c.globalAlpha = 1;

    /* 바닥 격자 */
    for (let g = -1.3; g <= 1.31; g += 0.325) {
      const a = project([g, Y0 - 0.12, -1.3], w, h), b = project([g, Y0 - 0.12, 1.3], w, h);
      const a2 = project([-1.3, Y0 - 0.12, g], w, h), b2 = project([1.3, Y0 - 0.12, g], w, h);
      c.strokeStyle = LR.alpha(LR.col("text-faint"), 0.13); c.lineWidth = 1;
      c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.moveTo(a2.x, a2.y); c.lineTo(b2.x, b2.y); c.stroke();
    }

    const ctxc = LR.col("ctx"), acc = LR.col("accent"), env = LR.col("env"), mem = LR.col("state"), gd = LR.col("guard");
    /* 세션 고리: 지난 세션은 꽉 찬 창(흐리게), 현재 세션은 진행만큼 청록으로 차오른다 */
    const ap = helix(ses, u), app = project(ap, w, h);
    const drawRings = (front) => {
      for (let k = 0; k < NS; k++) {
        const fill = k < ses ? 1 : k === ses ? u : 0;
        for (let i = 0; i < 96; i++) {
          const u0 = i / 96, u1 = (i + 1) / 96;
          const p0 = project(helix(k, u0), w, h), p1 = project(helix(k, u1), w, h);
          if ((p0.z < 0) !== front) continue;
          const on = u1 <= fill;
          c.strokeStyle = on ? LR.alpha(ctxc, k === ses ? 0.95 : 0.4) : LR.alpha(LR.col("text-faint"), 0.22);
          c.lineWidth = on ? (k === ses ? 3.2 : 2) : 1.2;
          c.beginPath(); c.moveTo(p0.x, p0.y); c.lineTo(p1.x, p1.y); c.stroke();
        }
      }
    };
    drawRings(false);

    /* 가운데 기둥: 기능 목록 */
    for (let i = 0; i < NF; i++) {
      const y = Y0 + i * (FH * 1.45) + FH / 2, f = feats[i];
      const col = f >= 1 ? env : f > 0 ? LR.col("accent") : mem;
      cube(c, 0, y, 0, 0.17, FH / 2, 0.12, col, f > 0 ? 1 : 0.6, w, h);
    }
    const top = project([0, Y0 + NF * FH * 1.45 + 0.06, 0], w, h);
    LR.text(c, `기능 ${doneCount()}/${NF}`, top.x, top.y - 4, { size: 11, weight: 700, align: "center", color: mem });

    /* 진행 파일 빔 */
    if (beam) {
      const fp = project([0, Y0 + doneCount() * FH * 1.45, 0], w, h);
      const a = beam.dir === "in" ? fp : app, b = beam.dir === "in" ? app : fp;
      const e = LR.ease(beam.t);
      c.strokeStyle = LR.alpha(beam.dir === "in" ? mem : env, 0.8 * (1 - beam.t * 0.6)); c.setLineDash([4, 4]); c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(LR.lerp(a.x, b.x, e), LR.lerp(a.y, b.y, e)); c.stroke(); c.setLineDash([]);
      c.fillStyle = beam.dir === "in" ? mem : env; c.beginPath(); c.arc(LR.lerp(a.x, b.x, e), LR.lerp(a.y, b.y, e), 3.5, 0, 7); c.fill();
    }

    /* 커밋(체크포인트) 표식 */
    commits.forEach((m) => {
      const p = project(helix(m.k, m.u), w, h), q = project([helix(m.k, m.u)[0] * 1.14, helix(m.k, m.u)[1], helix(m.k, m.u)[2] * 1.14], w, h);
      c.strokeStyle = env; c.lineWidth = 2; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke();
      c.fillStyle = env; c.beginPath(); c.arc(q.x, q.y, 3.4 * q.f, 0, 7); c.fill();
    });

    drawRings(true);

    /* 에이전트 */
    const runCol = crash > 0 ? gd : acc;
    const g = c.createRadialGradient(app.x, app.y, 1, app.x, app.y, 26 * app.f);
    g.addColorStop(0, LR.alpha(runCol, 0.55)); g.addColorStop(1, LR.alpha(runCol, 0));
    c.fillStyle = g; c.beginPath(); c.arc(app.x, app.y, 26 * app.f, 0, 7); c.fill();
    LR.node(c, app.x, app.y, 9 * app.f, crash > 0 ? "risk" : "run", null, { fill: 0.6, lw: 2.4 });
    if (crash > 0) { c.strokeStyle = gd; c.lineWidth = 2.4; const s = 7; c.beginPath(); c.moveTo(app.x - s, app.y - s - 16); c.lineTo(app.x + s, app.y + s - 16); c.moveTo(app.x + s, app.y - s - 16); c.lineTo(app.x - s, app.y + s - 16); c.stroke(); }
    LR.text(c, "에이전트", app.x, app.y + 18 * app.f, { size: 10.5, weight: 700, align: "center", color: LR.col("text-dim") });

    /* 세션 라벨 */
    for (let k = 0; k < NS; k++) {
      const p = project([-R - 0.18, ringY(k) + 0.02, 0], w, h);
      LR.text(c, `S${k + 1}`, p.x, p.y, { size: 10, mono: true, align: "right", color: k === ses ? ctxc : LR.col("text-faint") });
    }
    /* 사람 */
    const hp = project([1.25, 0.95, -0.3], w, h);
    LR.node(c, hp.x, hp.y, 10 * hp.f, "human", null, { glow: human, fill: 0.25 });
    LR.text(c, "사람", hp.x, hp.y + 19 * hp.f, { size: 10.5, weight: 700, align: "center", color: LR.col("text-dim") });
    if (human > 0) { c.strokeStyle = LR.alpha(LR.col("accent-2"), human * 0.8); c.setLineDash([4, 4]); c.lineWidth = 1.6; c.beginPath(); c.moveTo(hp.x, hp.y); c.lineTo(app.x, app.y); c.stroke(); c.setLineDash([]); }
    if (flash > 0) { c.fillStyle = LR.alpha(env, flash * 0.12); c.fillRect(0, 0, w, h - 80); }
  }
  st.draw = () => draw(0);
  const L = LR.loop(box, draw);
  if (LR.reduced()) {
    ses = 3; u = 0.6; feats = feats.map((f, i) => (i < 3 ? 1 : 0)); commits = [0, 1, 2].map((k) => ({ k, u: 0.82 }));
    log("mem", "session 4 · 진행 파일 읽기 → 다음 기능 #4"); log("ok", "feature #3 passes:true · commit"); draw(0);
  } else L.start();
})();
