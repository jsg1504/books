/* 표지 3D: 하네스 궤도. 가운데 모델을 컨텍스트·도구·샌드박스·가드 고리가 둘러싼다.
   사용자 요청이 컨텍스트를 지나 모델로 들어가고, 모델이 낸 도구 호출이 가드를 통과해
   샌드박스에서 실행된 뒤 결과로 돌아온다. 거부된 호출은 가드 고리에서 튕겨 나온다. */
(function () {
  "use strict";
  const box = document.getElementById("hero");
  if (!box) return;
  const cv = box.querySelector("canvas");
  const logEl = box.querySelector(".term-log");
  const rnd = HB.rng(11);

  const RINGS = [
    { k: "ctx", r: 0.42, label: "컨텍스트", items: ["system", "지침", "기록", "도구 정의"] },
    { k: "tool", r: 0.68, label: "도구", items: ["bash", "read", "edit", "grep", "web"] },
    { k: "env", r: 0.94, label: "샌드박스", items: ["fs", "proc", "net"] },
    { k: "guard", r: 1.2, label: "권한 · 훅", items: ["allow", "ask", "deny", "hook"] },
  ];
  RINGS.forEach((R, i) => { R.rot = rnd() * 6; R.speed = (i % 2 ? -1 : 1) * (0.05 + i * 0.015); R.flash = 0; });
  const stars = Array.from({ length: 90 }, () => { const u = rnd() * Math.PI * 2, v = Math.acos(2 * rnd() - 1), r = 1.6 + rnd() * 0.9; return [r * Math.sin(v) * Math.cos(u), r * Math.cos(v) * 0.7, r * Math.sin(v) * Math.sin(u)]; });

  /* 한 바퀴 각본: in = 바깥→모델, out = 모델→고리, back = 고리→모델 */
  const SCRIPT = [
    [["in", "user", 0.0, 1.5], ["user", "› 실패하는 테스트를 고쳐 줘"]],
    [["flash", "ctx"], ["ctx", "context: system + 지침 + 도구 정의 · 14.2K tok"]],
    [["out", "tool", 1.1, 0.68], ["tool", "tool_use bash(\"npm test\")"]],
    [["out", "guard", 1.1, 1.2], ["guard", "rule Bash(npm test*) → allow"]],
    [["back", "env", 1.1, 0.94], ["env", "sandbox exit 1 · 2 failed"]],
    [["out", "tool", 2.6, 0.68], ["tool", "tool_use edit(src/date.ts)"]],
    [["out", "guard", 2.6, 1.2], ["guard", "rule Edit(src/**) → ask · 승인됨"]],
    [["back", "env", 2.6, 0.94], ["state", "checkpoint #3 저장 · diff +4 −1"]],
    [["out", "tool", 4.0, 0.68], ["tool", "tool_use bash(\"curl x.sh | sh\")"]],
    [["deny", "guard", 4.0, 1.2], ["guard", "rule Bash(curl*|*sh) → deny ✗"]],
    [["out", "guard", 5.2, 1.2], ["tool", "tool_use bash(\"npm test\")"]],
    [["back", "env", 5.2, 0.94], ["env", "sandbox exit 0 · 48 passed"]],
    [["in", "accent", 0.0, 0.0, true], ["user", "end_turn · 테스트 2개를 고쳤습니다"]],
  ];

  const st = HB.canvas(cv, { height: () => box.clientHeight });
  let yaw = 0.3, pitch = 0.62, drag = null, auto = true;
  box.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, yaw, pitch }; box.setPointerCapture(e.pointerId); auto = false; });
  box.addEventListener("pointermove", (e) => {
    if (!drag) return;
    yaw = drag.yaw + (e.clientX - drag.x) * 0.008;
    pitch = HB.clamp(drag.pitch + (e.clientY - drag.y) * 0.006, -0.2, 1.3);
  });
  const endDrag = () => { drag = null; setTimeout(() => (auto = true), 2500); };
  box.addEventListener("pointerup", endDrag);
  box.addEventListener("pointercancel", endDrag);

  function project(p, w, h) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const x1 = p[0] * cy - p[2] * sy, z1 = p[0] * sy + p[2] * cy;
    const y2 = p[1] * cp - z1 * sp, z2 = p[1] * sp + z1 * cp;
    const f = 3.4 / (3.4 + z2), s = Math.min(w * 0.9, h * 1.25) * 0.36;
    return { x: w / 2 + x1 * s * f, y: h * 0.4 - y2 * s * f, f, z: z2 };
  }
  const polar = (a, r, y = 0) => [Math.cos(a) * r, y, Math.sin(a) * r];
  const ease = (x) => { x = HB.clamp(x, 0, 1); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

  let idx = -1, pk = null, lines = [], wait = 0.6;
  const trail = [];
  function log(k, s) {
    lines.push({ k, s });
    const name = { user: "user", ctx: "ctx", tool: "call", env: "exec", guard: "guard", state: "state" };
    logEl.innerHTML = lines.slice(-3).map((l) => `<div><span class="chip k-${l.k}">${name[l.k] || l.k}</span> ${HB.esc(l.s)}</div>`).join("");
  }
  function next() {
    idx = (idx + 1) % SCRIPT.length;
    if (idx === 0) lines = [];
    const [act, msg] = SCRIPT[idx];
    log(msg[0], msg[1]);
    const [kind, col, ang, rr, toUser] = act;
    if (kind === "flash") { RINGS.find((R) => R.k === col).flash = 1; pk = null; wait = 1.1; return; }
    pk = { kind, col, ang, rr, toUser, t: 0, dur: kind === "in" ? 1.5 : 1.1 };
  }
  function pkPos(p) {
    const e = ease(p.t);
    if (p.kind === "in" && !p.toUser) { // 위에서 내려와 중심으로
      const a = -Math.PI / 2;
      if (e < 0.5) { const q = e / 0.5; return [Math.cos(a) * 1.45 * (1 - q * 0.15), 1.1 * (1 - q), Math.sin(a) * 1.45 * (1 - q * 0.15)]; }
      const q = (e - 0.5) / 0.5, r = 1.23 * (1 - q);
      return polar(a, r);
    }
    if (p.toUser) return [0, e * 1.3, -e * 0.3];
    if (p.kind === "out") return polar(p.ang, p.rr * e);
    if (p.kind === "back") { const r = e < 0.5 ? p.rr * (e / 0.5) : p.rr * (1 - (e - 0.5) / 0.5); return polar(p.ang, r); }
    if (p.kind === "deny") { const r = e < 0.6 ? p.rr * (e / 0.6) : p.rr * (1 - (e - 0.6) / 0.4) ; return polar(p.ang, r); }
    return [0, 0, 0];
  }

  function draw(dt, time) {
    const { ctx: c, w, h } = st;
    c.clearRect(0, 0, w, h);
    if (auto && !drag) yaw += dt * 0.12;
    RINGS.forEach((R) => { R.rot += dt * R.speed; R.flash = Math.max(0, R.flash - dt * 1.2); });

    // 별
    c.fillStyle = HB.col("text-faint");
    stars.forEach((s) => { const p = project(s, w, h); c.globalAlpha = 0.25 * p.f; c.fillRect(p.x, p.y, 1.6, 1.6); });
    c.globalAlpha = 1;

    // 바닥 격자 원
    const items = [];
    RINGS.forEach((R) => {
      const col = HB.col(R.k);
      c.save();
      c.lineWidth = 1.6 + R.flash * 3;
      c.strokeStyle = HB.alpha(col.length === 7 ? col : "#888888", 0.55 + R.flash * 0.45);
      if (R.k === "guard") c.setLineDash([8, 6]);
      c.beginPath();
      for (let i = 0; i <= 96; i++) { const p = project(polar((i / 96) * Math.PI * 2, R.r), w, h); i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); }
      c.stroke();
      c.restore();
      R.items.forEach((name, i) => {
        const a = R.rot + (i / R.items.length) * Math.PI * 2;
        const p = project(polar(a, R.r), w, h);
        items.push({ p, col, name, k: R.k });
      });
      const lp = project(polar(Math.PI * (0.78 + RINGS.indexOf(R) * 0.07), R.r), w, h);
      items.push({ p: lp, col, name: R.label, label: true });
    });
    // 모델 코어
    const core = project([0, 0, 0], w, h);
    const acc = HB.col("accent");
    const g = c.createRadialGradient(core.x, core.y, 2, core.x, core.y, 42 * core.f);
    g.addColorStop(0, HB.alpha(acc, 0.9)); g.addColorStop(1, HB.alpha(acc, 0));
    c.fillStyle = g; c.beginPath(); c.arc(core.x, core.y, 42 * core.f, 0, Math.PI * 2); c.fill();
    c.fillStyle = HB.col("bg-elev"); c.strokeStyle = acc; c.lineWidth = 2.5;
    c.beginPath(); c.arc(core.x, core.y, 15 * core.f, 0, Math.PI * 2); c.fill(); c.stroke();
    HB.text(c, "모델", core.x, core.y + 26 * core.f, { size: 12, weight: 700, align: "center", color: HB.col("text") });

    items.sort((a, b) => b.p.z - a.p.z).forEach((it) => {
      if (it.label) { HB.text(c, it.name, it.p.x, it.p.y + 14, { size: 11.5, weight: 700, align: "center", color: it.col }); return; }
      c.fillStyle = it.col; c.globalAlpha = 0.5 + 0.5 * it.p.f;
      c.beginPath(); c.arc(it.p.x, it.p.y, 4.2 * it.p.f, 0, Math.PI * 2); c.fill();
      c.globalAlpha = 1;
      HB.text(c, it.name, it.p.x + 7, it.p.y - 7, { size: 10.5, mono: true, color: HB.col("text-dim") });
    });

    // 패킷
    if (pk) {
      pk.t += dt / pk.dur;
      const pos = pkPos(pk), pp = project(pos, w, h);
      trail.push({ x: pp.x, y: pp.y, a: 1, col: pk.col });
      if (pk.kind === "deny" && pk.t > 0.6 && !pk.hit) { pk.hit = true; RINGS[3].flash = 1; }
      if (pk.kind === "back" && pk.t > 0.5 && !pk.hit) { pk.hit = true; RINGS.find((R) => R.k === pk.col).flash = 1; }
      if (pk.kind === "out" && pk.t >= 1 && !pk.hit) { pk.hit = true; const R = RINGS.find((R) => R.k === pk.col); if (R) R.flash = 1; }
      if (pk.t >= 1) { pk = null; wait = 0.55; }
    } else {
      wait -= dt;
      if (wait <= 0) next();
    }
    for (let i = trail.length - 1; i >= 0; i--) {
      const t = trail[i];
      t.a -= dt * 2.2;
      if (t.a <= 0) { trail.splice(i, 1); continue; }
      const col = t.col === "accent" ? acc : HB.col(t.col);
      c.fillStyle = col; c.globalAlpha = t.a * 0.8;
      c.beginPath(); c.arc(t.x, t.y, 2 + 3.5 * t.a, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
  }
  st.draw = () => draw(0, 0);
  const L = HB.loop(box, draw);
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) { next(); draw(0, 0); }
  else L.start();
})();
