/* 표지 3D: 저장소의 파일 그래프 위를 에이전트가 오가며 읽고(파랑) 고치고(주황) 테스트한다(초록/빨강). */
(function () {
  "use strict";
  const box = document.getElementById("hero");
  if (!box) return;
  const cv = box.querySelector("canvas");
  const logEl = box.querySelector(".term-log");
  const rnd = CA.rng(11);

  const DIRS = [
    { name: "src/auth", c: [-1.25, 0.55, 0.25], files: ["session.ts", "token.ts", "login.ts", "middleware.ts", "oauth.ts", "hash.ts"] },
    { name: "src/api", c: [1.15, 0.75, -0.35], files: ["routes.ts", "users.ts", "orders.ts", "errors.ts", "client.ts", "rate.ts"] },
    { name: "src/db", c: [0.25, -0.95, 0.95], files: ["schema.ts", "migrate.ts", "pool.ts", "query.ts", "models.ts"] },
    { name: "src/ui", c: [-0.45, -0.45, -1.35], files: ["App.tsx", "Login.tsx", "Header.tsx", "Form.tsx", "hooks.ts", "theme.ts"] },
    { name: "tests", c: [1.35, -0.55, 0.95], files: ["session.test.ts", "users.test.ts", "orders.test.ts", "login.test.ts", "db.test.ts"] },
    { name: "docs", c: [-1.35, -1.05, 1.0], files: ["README.md", "ARCHITECTURE.md", "CHANGELOG.md"] },
  ];
  const nodes = [{ name: "repo", dir: true, p: [0, 0, 0], r: 7 }];
  const edges = [];
  const byName = {};
  DIRS.forEach((d) => {
    const di = nodes.length;
    nodes.push({ name: d.name + "/", dir: true, p: d.c.slice(), r: 6 });
    edges.push([0, di, "tree"]);
    d.files.forEach((f) => {
      const u = rnd() * Math.PI * 2, v = Math.acos(2 * rnd() - 1), rr = 0.35 + rnd() * 0.3;
      const p = [d.c[0] + rr * Math.sin(v) * Math.cos(u), d.c[1] + rr * Math.cos(v), d.c[2] + rr * Math.sin(v) * Math.sin(u)];
      const n = { name: f, path: d.name + "/" + f, dir: false, p, r: 4, heat: 0, kind: null, visited: null, edited: false };
      byName[f] = nodes.length;
      nodes.push(n);
      edges.push([di, nodes.length - 1, "tree"]);
    });
  });
  const fileIdx = nodes.map((n, i) => (n.dir ? -1 : i)).filter((i) => i >= 0);
  for (let k = 0; k < 34; k++) {
    const a = fileIdx[Math.floor(rnd() * fileIdx.length)], b = fileIdx[Math.floor(rnd() * fileIdx.length)];
    if (a !== b) edges.push([a, b, "import"]);
  }
  [["session.ts", "token.ts"], ["session.ts", "middleware.ts"], ["session.test.ts", "session.ts"], ["session.ts", "schema.ts"], ["login.ts", "session.ts"]].forEach(([a, b]) => edges.push([byName[a], byName[b], "import"]));

  const tests = ["session.test.ts", "users.test.ts", "orders.test.ts", "login.test.ts", "db.test.ts"];
  const SCRIPT = [
    { k: "user", t: "› 로그인 세션이 만료되지 않는 버그를 고쳐 줘" },
    { k: "think", t: "만료 판정이 어디서 일어나는지부터 찾는다", to: 0 },
    { k: "read", t: 'Grep "expires"  → 4개 파일', to: ["session.ts", "token.ts", "schema.ts", "session.test.ts"] },
    { k: "read", t: "Read src/auth/session.ts", to: "session.ts" },
    { k: "read", t: "Read src/auth/token.ts", to: "token.ts" },
    { k: "edit", t: "Edit src/auth/session.ts  (+3 −1)", to: "session.ts" },
    { k: "fail", t: "Bash npm test  → 1 failed · session.test.ts:41", to: "session.test.ts" },
    { k: "read", t: "Read tests/session.test.ts", to: "session.test.ts" },
    { k: "edit", t: "Edit src/auth/session.ts  (+1 −1)", to: "session.ts" },
    { k: "run", t: "Bash npm test  → 42 passed", to: tests },
    { k: "think", t: "✓ 완료: 만료 시각을 UTC 밀리초로 비교하도록 수정" },
  ];

  const st = CA.canvas(cv, { height: () => box.clientHeight });
  let yaw = 0.6, pitch = 0.32, drag = null, auto = true;
  box.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, yaw, pitch }; box.setPointerCapture(e.pointerId); auto = false; });
  box.addEventListener("pointermove", (e) => {
    if (!drag) return;
    yaw = drag.yaw + (e.clientX - drag.x) * 0.008;
    pitch = CA.clamp(drag.pitch + (e.clientY - drag.y) * 0.006, -1.2, 1.2);
  });
  const endDrag = () => { drag = null; setTimeout(() => (auto = true), 2500); };
  box.addEventListener("pointerup", endDrag);
  box.addEventListener("pointercancel", endDrag);

  const probe = { p: [0, 0, 0], from: [0, 0, 0], to: [0, 0, 0], t: 1, trail: [] };
  let step = -1, wait = 0.6, lines = [], targets = [];

  function setLog() {
    logEl.innerHTML = lines.slice(-4).map((l) => `<div><span class="chip k-${l.k}">${{ user: "user", think: "think", read: "read", edit: "edit", run: "test", fail: "test" }[l.k]}</span> ${CA.esc(l.t)}</div>`).join("");
  }
  function reset() {
    nodes.forEach((n) => { n.heat = 0; n.kind = null; n.visited = null; n.edited = false; n.failed = false; });
    lines = []; step = -1; wait = 0.8; setLog();
  }
  function advance() {
    step++;
    if (step >= SCRIPT.length) { reset(); return; }
    const s = SCRIPT[step];
    lines.push(s); setLog();
    const to = s.to === undefined ? null : Array.isArray(s.to) ? s.to.map((n) => byName[n]) : typeof s.to === "number" ? [s.to] : [byName[s.to]];
    targets = to || [];
    if (targets.length) {
      const last = nodes[targets[targets.length - 1]];
      probe.from = probe.p.slice(); probe.to = last.p.slice(); probe.t = 0;
    }
    targets.forEach((i, j) => setTimeout(() => {
      const n = nodes[i];
      if (n.dir) return;
      n.heat = 1; n.kind = s.k;
      if (s.k === "read") n.visited = "read";
      if (s.k === "edit") n.edited = true;
      if (s.k === "fail") n.failed = true;
      if (s.k === "run") n.failed = false;
      if (s.k === "run" || s.k === "fail") n.visited = s.k;
    }, 120 * j + (targets.length > 1 ? 0 : 500)));
    wait = s.k === "user" ? 1.6 : 1.5;
  }

  function project(p, w, h) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const x = p[0] * cy - p[2] * sy, z1 = p[0] * sy + p[2] * cy;
    const y = p[1] * cp - z1 * sp, z = p[1] * sp + z1 * cp;
    const f = 4 / (4 + z);
    const s = Math.min(w, h) * 0.27;
    return { x: w / 2 + x * f * s, y: h * 0.44 - y * f * s, z, f };
  }

  const KC = (k) => CA.col(k === "fail" ? "fail" : k);
  function draw(ctx, w, h) {
    const P = nodes.map((n) => project(n.p, w, h));
    // edges
    edges.forEach(([a, b, kind]) => {
      const pa = P[a], pb = P[b];
      const depth = CA.clamp(0.75 - (pa.z + pb.z) / 6, 0.15, 1);
      ctx.strokeStyle = kind === "tree" ? CA.alpha(CA.col("text-faint"), 0.35 * depth) : CA.alpha(CA.col("accent-2"), 0.28 * depth);
      ctx.lineWidth = kind === "tree" ? 1 : 0.8;
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
    });
    // nodes by depth
    const order = nodes.map((_, i) => i).sort((a, b) => P[b].z - P[a].z);
    order.forEach((i) => {
      const n = nodes[i], p = P[i];
      const r = n.r * p.f * (1 + n.heat * 0.9);
      if (n.heat > 0.02 && n.kind) {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4.5);
        g.addColorStop(0, CA.alpha(KC(n.kind), 0.55 * n.heat));
        g.addColorStop(1, CA.alpha(KC(n.kind), 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r * 4.5, 0, 7); ctx.fill();
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7);
      if (n.dir) { ctx.fillStyle = CA.col("surface-2"); ctx.strokeStyle = CA.col("text-dim"); ctx.lineWidth = 1.3; ctx.fill(); ctx.stroke(); }
      else {
        const base = n.failed ? CA.col("fail") : n.visited === "run" ? CA.col("run") : n.visited === "read" ? CA.col("read") : CA.col("text-faint");
        ctx.fillStyle = n.visited || n.failed ? base : CA.alpha(CA.col("text-faint"), 0.55);
        ctx.fill();
        if (n.edited) { ctx.strokeStyle = CA.col("edit"); ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(p.x, p.y, r + 3, 0, 7); ctx.stroke(); }
      }
      if (n.dir && i > 0) CA.text(ctx, n.name, p.x + 9, p.y - 8, { size: 11, mono: true, color: CA.col("text-dim") });
      else if (n.heat > 0.25 || n.edited) CA.text(ctx, n.name, p.x + 8, p.y + 10, { size: 11, mono: true, color: n.edited ? CA.col("edit") : CA.col("text") });
    });
    // probe
    const pp = project(probe.p, w, h);
    probe.trail.forEach((q, j) => {
      const tp = project(q, w, h);
      ctx.fillStyle = CA.alpha(CA.col("accent"), (j / probe.trail.length) * 0.35);
      ctx.beginPath(); ctx.arc(tp.x, tp.y, 2.2 * tp.f, 0, 7); ctx.fill();
    });
    const g = ctx.createRadialGradient(pp.x, pp.y, 0, pp.x, pp.y, 16);
    g.addColorStop(0, CA.alpha(CA.col("accent"), 0.9)); g.addColorStop(1, CA.alpha(CA.col("accent"), 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(pp.x, pp.y, 16, 0, 7); ctx.fill();
    ctx.fillStyle = CA.col("accent"); ctx.beginPath(); ctx.arc(pp.x, pp.y, 4.5, 0, 7); ctx.fill();
  }
  st.draw = draw;
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loop = CA.loop(box, (dt) => {
    if (auto && !drag && !reduce) yaw += dt * 0.18;
    wait -= dt;
    if (wait <= 0) advance();
    if (probe.t < 1) {
      probe.t = Math.min(1, probe.t + dt * 1.6);
      const e = probe.t < 0.5 ? 2 * probe.t * probe.t : 1 - Math.pow(-2 * probe.t + 2, 2) / 2;
      const arc = Math.sin(Math.PI * probe.t) * 0.35;
      probe.p = [CA.lerp(probe.from[0], probe.to[0], e), CA.lerp(probe.from[1], probe.to[1], e) + arc, CA.lerp(probe.from[2], probe.to[2], e)];
      probe.trail.push(probe.p.slice());
    }
    if (probe.trail.length > 26 || (probe.t >= 1 && probe.trail.length)) probe.trail.shift();
    nodes.forEach((n) => (n.heat *= Math.pow(0.3, dt)));
    st.redraw();
  });
  loop.start();
})();
