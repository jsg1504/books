/* 표지 3D: 에이전트 합창. 가운데 위에 리더(오케스트레이터)가 떠 있고, 아래 고리에 워커들이 돈다.
   바닥에는 공유 블랙보드 판이 있다. 리더가 작업을 나눠 보내고(위임), 워커는 블랙보드에 쓰고,
   서로 메시지를 주고받고, 결과를 리더에게 돌려준다. 한 워커는 실패해 다른 워커가 이어받는다. */
(function () {
  "use strict";
  const box = document.getElementById("hero");
  if (!box) return;
  const cv = box.querySelector("canvas");
  const logEl = box.querySelector(".term-log");
  const rnd = MA.rng(7);

  const WORKERS = [
    { name: "검색 A", role: "worker" },
    { name: "검색 B", role: "worker" },
    { name: "코드", role: "worker" },
    { name: "검증", role: "judge" },
    { name: "요약", role: "worker" },
  ];
  const N = WORKERS.length;
  WORKERS.forEach((w, i) => { w.base = (i / N) * Math.PI * 2; w.flash = 0; w.dead = 0; });
  const LEAD = { flash: 0 };
  const BOARD = { flash: 0, notes: [] };
  const stars = Array.from({ length: 80 }, () => { const u = rnd() * Math.PI * 2, v = Math.acos(2 * rnd() - 1), r = 1.7 + rnd() * 0.9; return [r * Math.sin(v) * Math.cos(u), r * Math.cos(v) * 0.7, r * Math.sin(v) * Math.sin(u)]; });

  /* 각본: [종류, 출발, 도착, 색 역할], [로그 역할, 로그] ; 출발/도착: "L"=리더, "B"=블랙보드, 숫자=워커, "U"=사용자 */
  const SCRIPT = [
    [[["U", "L", "human"]], ["human", "› 경쟁사 세 곳의 가격 정책을 비교해 줘"]],
    [[["L", "B", "plan"]], ["plan", "lead  계획 3단계 → 블랙보드에 기록"]],
    [[["L", 0, "lead"], ["L", 1, "lead"], ["L", 2, "lead"]], ["lead", "lead  위임 ×3 · 각자 목표·형식·범위"]],
    [[[0, "B", "shared"], [1, "B", "shared"]], ["shared", "worker 발견 7건 → 블랙보드 (참조만 전달)"]],
    [[[2, -1, "fail"]], ["fail", "코드   타임아웃 · 재시도 한도 초과 ✗"]],
    [[["L", 4, "lead"]], ["lead", "lead  실패한 작업을 '요약'에게 재배정"]],
    [[[1, 0, "msg"], [0, 1, "msg"]], ["msg", "검색 A ↔ 검색 B  중복 출처 2건 조율"]],
    [[["B", 3, "shared"]], ["judge", "검증   블랙보드 읽기 · 출처 대조"]],
    [[[3, "L", "judge"]], ["judge", "검증   통과 9 · 반려 1 (근거 없음)"]],
    [[[4, "L", "shared"], [0, "L", "shared"], [1, "L", "shared"]], ["shared", "worker 결과 요약 1–2K 씩 반환"]],
    [[["L", "U", "lead"]], ["lead", "lead  합성 완료 · 토큰 ×12 · 4분 12초"]],
  ];

  const st = MA.canvas(cv, { height: () => box.clientHeight });
  let yaw = 0.4, pitch = 0.5, drag = null, auto = true;
  box.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, yaw, pitch }; box.setPointerCapture(e.pointerId); auto = false; });
  box.addEventListener("pointermove", (e) => {
    if (!drag) return;
    yaw = drag.yaw + (e.clientX - drag.x) * 0.008;
    pitch = MA.clamp(drag.pitch + (e.clientY - drag.y) * 0.006, -0.1, 1.2);
  });
  const endDrag = () => { drag = null; setTimeout(() => (auto = true), 2500); };
  box.addEventListener("pointerup", endDrag);
  box.addEventListener("pointercancel", endDrag);

  function project(p, w, h) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const x1 = p[0] * cy - p[2] * sy, z1 = p[0] * sy + p[2] * cy;
    const y2 = p[1] * cp - z1 * sp, z2 = p[1] * sp + z1 * cp;
    const f = 3.4 / (3.4 + z2), s = Math.min(w * 0.9, h * 1.2) * 0.4;
    return { x: w / 2 + x1 * s * f, y: h * 0.46 - y2 * s * f, f, z: z2 };
  }
  let ringRot = 0;
  const RW = 1.05, YW = 0.05, YL = 0.78, YB = -0.62;
  const wpos = (i) => { const a = WORKERS[i].base + ringRot; return [Math.cos(a) * RW, YW + Math.sin(a * 2 + ringRot) * 0.04, Math.sin(a) * RW]; };
  const posOf = (k) => (k === "L" ? [0, YL, 0] : k === "B" ? [0, YB, 0] : k === "U" ? [0, 1.6, -0.2] : k === -1 ? null : wpos(k));

  let idx = -1, packets = [], lines = [], wait = 0.6;
  const trail = [];
  function log(k, s) {
    lines.push({ k, s });
    const name = { human: "user", lead: "lead", plan: "plan", shared: "share", msg: "msg", fail: "fail", judge: "judge", worker: "work" };
    const cls = { human: "user", lead: "acc", plan: "state", shared: "env", msg: "tool", fail: "guard", judge: "acc2", worker: "ctx" };
    logEl.innerHTML = lines.slice(-3).map((l) => `<div><span class="chip k-${cls[l.k] || "ctx"}">${name[l.k] || l.k}</span> ${MA.esc(l.s)}</div>`).join("");
  }
  function next() {
    idx = (idx + 1) % SCRIPT.length;
    if (idx === 0) { lines = []; WORKERS.forEach((w) => (w.dead = 0)); BOARD.notes = []; }
    const [acts, msg] = SCRIPT[idx];
    log(msg[0], msg[1]);
    packets = acts.map(([a, b, role]) => ({ a, b, role, t: 0, dur: 1.15 }));
  }
  const bez = (p0, p1, t, lift) => {
    const m = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 + lift, (p0[2] + p1[2]) / 2];
    const u = 1 - t;
    return [0, 1, 2].map((k) => u * u * p0[k] + 2 * u * t * m[k] + t * t * p1[k]);
  };

  function draw(dt) {
    const { ctx: c, w, h } = st;
    c.clearRect(0, 0, w, h);
    if (auto && !drag) yaw += dt * 0.1;
    ringRot += dt * 0.12;
    LEAD.flash = Math.max(0, LEAD.flash - dt * 1.3); BOARD.flash = Math.max(0, BOARD.flash - dt * 1.1);
    WORKERS.forEach((wk) => (wk.flash = Math.max(0, wk.flash - dt * 1.3)));

    c.fillStyle = MA.col("text-faint");
    stars.forEach((s) => { const p = project(s, w, h); c.globalAlpha = 0.22 * p.f; c.fillRect(p.x, p.y, 1.6, 1.6); });
    c.globalAlpha = 1;

    // 블랙보드 판 (바닥 평면)
    const env = MA.col("env");
    const corners = [[-1.1, YB, -0.75], [1.1, YB, -0.75], [1.1, YB, 0.75], [-1.1, YB, 0.75]].map((p) => project(p, w, h));
    c.beginPath(); corners.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.closePath();
    c.fillStyle = MA.alpha(env, 0.07 + BOARD.flash * 0.12); c.fill();
    c.strokeStyle = MA.alpha(env, 0.5 + BOARD.flash * 0.4); c.lineWidth = 1.4; c.stroke();
    for (let g = -0.9; g <= 0.91; g += 0.3) {
      const a = project([g, YB, -0.75], w, h), b = project([g, YB, 0.75], w, h);
      c.strokeStyle = MA.alpha(env, 0.12); c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
    }
    BOARD.notes.forEach((n, i) => {
      const p = project([-0.9 + (i % 6) * 0.34, YB, -0.45 + Math.floor(i / 6) * 0.35], w, h);
      c.fillStyle = MA.alpha(MA.rc(n), 0.75); c.fillRect(p.x - 7 * p.f, p.y - 4 * p.f, 14 * p.f, 8 * p.f);
    });
    const bl = project([1.12, YB, 0.72], w, h);
    MA.text(c, "공유 블랙보드", bl.x, bl.y + 12, { size: 11.5, weight: 700, align: "right", color: env });

    // 워커 고리
    const ctxc = MA.col("ctx");
    c.save(); c.strokeStyle = MA.alpha(ctxc, 0.35); c.lineWidth = 1.3; c.setLineDash([5, 5]); c.beginPath();
    for (let i = 0; i <= 96; i++) { const a = (i / 96) * Math.PI * 2, p = project([Math.cos(a) * RW, YW, Math.sin(a) * RW], w, h); i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); }
    c.stroke(); c.restore();

    // 리더 → 워커 실선(위임 구조)
    const lp = project(posOf("L"), w, h);
    const items = [];
    WORKERS.forEach((wk, i) => {
      const p = project(wpos(i), w, h);
      c.strokeStyle = MA.alpha(MA.col("accent"), 0.16); c.lineWidth = 1;
      c.beginPath(); c.moveTo(lp.x, lp.y); c.lineTo(p.x, p.y); c.stroke();
      const drop = project([wpos(i)[0], YB, wpos(i)[2]], w, h);
      c.strokeStyle = MA.alpha(env, 0.14); c.setLineDash([2, 4]); c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(drop.x, drop.y); c.stroke(); c.setLineDash([]);
      items.push({ p, wk, i });
    });
    items.push({ p: lp, lead: true });
    items.sort((a, b) => b.p.z - a.p.z).forEach((it) => {
      if (it.lead) {
        const acc = MA.col("accent");
        const g = c.createRadialGradient(lp.x, lp.y, 2, lp.x, lp.y, 46 * lp.f);
        g.addColorStop(0, MA.alpha(acc, 0.55 + LEAD.flash * 0.4)); g.addColorStop(1, MA.alpha(acc, 0));
        c.fillStyle = g; c.beginPath(); c.arc(lp.x, lp.y, 46 * lp.f, 0, 7); c.fill();
        MA.node(c, lp.x, lp.y, 17 * lp.f, "lead", null, { lw: 2.6, fill: 0.3 });
        MA.text(c, "리더", lp.x, lp.y, { size: 11, weight: 800, align: "center", color: acc });
        MA.text(c, "오케스트레이터", lp.x, lp.y - 26 * lp.f, { size: 11, align: "center", color: MA.col("text-dim") });
        return;
      }
      const { p, wk } = it;
      const role = wk.dead ? "fail" : wk.role;
      MA.node(c, p.x, p.y, 11 * p.f, role, null, { glow: wk.flash, dash: wk.dead ? [3, 3] : null, fill: 0.25 });
      MA.text(c, wk.name, p.x, p.y + 20 * p.f, { size: 10.5, weight: 700, align: "center", color: wk.dead ? MA.col("guard") : MA.col("text-dim") });
    });

    // 패킷
    if (packets.length) {
      let done = true;
      packets.forEach((pk) => {
        pk.t += dt / pk.dur;
        const p0 = posOf(pk.a);
        let p1 = posOf(pk.b), pos;
        if (pk.b === -1) { // 실패: 제자리에서 터진다
          pos = p0; if (pk.t > 0.4 && !pk.hit) { pk.hit = true; WORKERS[pk.a].dead = 1; WORKERS[pk.a].flash = 1; }
        } else {
          const lift = pk.a === "B" || pk.b === "B" ? 0.05 : (typeof pk.a === "number" && typeof pk.b === "number") ? 0.45 : 0.15;
          pos = bez(p0, p1, MA.ease(pk.t), lift);
        }
        if (pk.t < 1) done = false;
        else if (!pk.hit) {
          pk.hit = true;
          if (pk.b === "L") LEAD.flash = 1;
          else if (pk.b === "B") { BOARD.flash = 1; if (BOARD.notes.length < 12) BOARD.notes.push(pk.role === "plan" ? "plan" : "shared"); }
          else if (typeof pk.b === "number") WORKERS[pk.b].flash = 1;
        }
        const pp = project(pos, w, h);
        if (pk.t < 1) trail.push({ x: pp.x, y: pp.y, a: 1, role: pk.role, big: pk.b === -1 });
      });
      if (done) { packets = []; wait = 0.5; }
    } else {
      wait -= dt;
      if (wait <= 0) next();
    }
    for (let i = trail.length - 1; i >= 0; i--) {
      const t = trail[i];
      t.a -= dt * (t.big ? 1.2 : 2.3);
      if (t.a <= 0) { trail.splice(i, 1); continue; }
      c.fillStyle = MA.rc(t.role); c.globalAlpha = t.a * 0.8;
      c.beginPath(); c.arc(t.x, t.y, t.big ? 4 + 16 * (1 - t.a) : 2 + 3.4 * t.a, 0, 7); c.fill();
    }
    c.globalAlpha = 1;
  }
  st.draw = () => draw(0);
  const L = MA.loop(box, draw);
  if (MA.reduced()) { next(); draw(0); }
  else L.start();
})();
