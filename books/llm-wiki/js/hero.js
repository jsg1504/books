/* 표지 3D: 돌아가는 지식 그래프. 점 하나가 위키 페이지(보라), 가운데 상자가 index.md다.
   위에서 원천 문서(노랑)가 떨어지면 에이전트(파랑)가 읽고, 관련 페이지 여러 개를 고치고(밝게 깜빡임)
   새 요약 페이지를 만들어 링크를 잇는다(수집). 사람(주황)이 질문하면 청록 빛이 색인에서 페이지를 따라가
   답이 되고, 좋은 답은 초록 새 페이지로 남는다(질의). 가끔 빨간 모순 페이지를 찾아 고친다(린트). */
(function () {
  "use strict";
  const box = document.getElementById("hero");
  if (!box) return;
  const cv = box.querySelector("canvas");
  const logEl = box.querySelector(".term-log");
  const rnd = WK.rng(11);
  const stars = Array.from({ length: 70 }, () => { const u = rnd() * Math.PI * 2, v = Math.acos(2 * rnd() - 1), r = 2.0 + rnd() * 0.8; return [r * Math.sin(v) * Math.cos(u), r * Math.cos(v) * 0.7, r * Math.sin(v) * Math.sin(u)]; });

  /* 페이지 위치: 피보나치 구 + 흔들림, 순서를 섞어 자라는 모습이 고르게 퍼지게 한다 */
  const N = 40, START = 16, R = 1.05;
  const base = Array.from({ length: N }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / N, r = Math.sqrt(1 - y * y), ph = i * 2.39996;
    const j = 0.82 + rnd() * 0.3;
    return [Math.cos(ph) * r * R * j, y * R * 0.8 * j, Math.sin(ph) * r * R * j];
  });
  for (let i = N - 1; i > 0; i--) { const k = Math.floor(rnd() * (i + 1)); [base[i], base[k]] = [base[k], base[i]]; }
  const P = base;
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const E = [];
  for (let i = 1; i < N; i++) {
    const near = Array.from({ length: i }, (_, j) => j).sort((a, b) => dist(P[i], P[a]) - dist(P[i], P[b]));
    E.push([i, near[0]]);
    if (i > 3 && near[1] != null && rnd() < 0.7) E.push([i, near[1]]);
  }
  const NAMES = ["RAG", "LLM 위키", "임베딩", "BM25", "컨텍스트 창", "스키마", "출처", "백링크", "린트", "색인"];
  const INDEX = [0, 0, 0];
  const HUMAN = [1.6, 0.85, -0.25];
  const SRC = [0, 1.75, 0];

  const st = WK.canvas(cv, { height: () => box.clientHeight });
  let yaw = 0.5, pitch = 0.32, drag = null, auto = true;
  box.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, yaw, pitch }; box.setPointerCapture(e.pointerId); auto = false; });
  box.addEventListener("pointermove", (e) => {
    if (!drag) return;
    yaw = drag.yaw + (e.clientX - drag.x) * 0.008;
    pitch = WK.clamp(drag.pitch + (e.clientY - drag.y) * 0.006, -0.3, 1.15);
  });
  const endDrag = () => { drag = null; setTimeout(() => (auto = true), 2500); };
  box.addEventListener("pointerup", endDrag);
  box.addEventListener("pointercancel", endDrag);

  function project(p, w, h) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const x1 = p[0] * cy - p[2] * sy, z1 = p[0] * sy + p[2] * cy;
    const yy = p[1] - 0.1;
    const y2 = yy * cp - z1 * sp, z2 = yy * sp + z1 * cp;
    const H = h - 80, f = 3.6 / (3.6 + z2), s = Math.min(w * 0.85, H * 1.1) * 0.36;
    return { x: w / 2 + x1 * s * f, y: H * 0.52 - y2 * s * f, f, z: z2 };
  }

  /* 상태 */
  let shown, appear, flash, kind, agent, doc, beams, steps, cur, waitT, moveT, cycle, lines;
  const NAME = { src: "source", ingest: "ingest", query: "query", file: "file", lint: "lint", ok: "index", human: "human" };
  const CLS = { src: "tool", ingest: "acc", query: "ctx", file: "state", lint: "guard", ok: "env", human: "acc2" };
  function log(k, s) {
    lines.push({ k, s });
    logEl.innerHTML = lines.slice(-3).map((l) => `<div><span class="chip k-${CLS[l.k]}">${NAME[l.k]}</span> ${WK.esc(l.s)}</div>`).join("");
  }
  function reset() {
    shown = START; appear = P.map((_, i) => (i < START ? 1 : 0)); flash = P.map(() => 0); kind = P.map(() => "n");
    agent = [0.2, 0.3, 0.6]; doc = null; beams = []; steps = []; cur = null; waitT = 0; moveT = 0; cycle = 0; lines = [];
  }
  reset();
  const posOf = (t) => (typeof t === "number" ? P[t] : t);
  const visible = () => Array.from({ length: shown }, (_, i) => i);
  const pickSome = (k, avoid = []) => { const v = visible().filter((i) => !avoid.includes(i)); const out = []; while (out.length < k && v.length) out.push(v.splice(Math.floor(rnd() * v.length), 1)[0]); return out; };
  const MORE = ["재순위화", "GraphRAG", "제텔카스텐", "옵시디언", "프롬프트 캐시", "평가 방법", "컨텍스트 부패", "카파시", "메멕스", "역순위 융합", "청크 크기", "에이전트 탐색", "스킬", "점진적 공개", "격리 구역", "지식 반감기", "엔티티 페이지", "개념 페이지", "요약 페이지", "비교 분석", "고아 페이지", "빨간 링크", "출처 추적", "오류 전파", "편집 충돌", "주입 공격", "BM25F", "TF-IDF", "임베딩 모델", "로컬 검색"];
  const label = (i) => NAMES[i] || MORE[(i - NAMES.length) % MORE.length];
  const beam = (a, b, col) => beams.push({ a: posOf(a).slice(), b: posOf(b).slice(), col, t: 0 });

  const TITLES = ["논문 · 긴 입력의 가운데를 놓치는 모델", "기사 · 새 오픈 가중치 모델 공개", "회의록 · 검색 개선 회의", "블로그 · 하이브리드 검색 실험기", "논문 · 검색 증강 생성", "보고서 · 에이전트 평가 방법론"];
  const QUES = ["RAG와 LLM 위키는 무엇이 다른가?", "임베딩과 BM25를 언제 섞나?", "두 보고서의 결론이 왜 다른가?", "지난달과 달라진 주장은?"];

  function planIngest() {
    const title = TITLES[cycle % TITLES.length];
    const touched = pickSome(3 + (cycle % 2));
    const add = shown < N ? [shown] : [];
    if (shown + 1 < N && cycle % 3 === 0) add.push(shown + 1);
    steps.push({ to: [0, 1.25, 0.25], act: () => { doc = { p: SRC.slice(), t: 0 }; log("src", `raw/ ← ${title}`); }, wait: 0.7 });
    steps.push({ to: [0, 1.2, 0.25], act: () => { doc = null; log("ingest", `원천 읽기 · 엔티티 ${touched.length + 2}개, 주장 9개 추출`); }, wait: 0.3 });
    touched.forEach((i) => steps.push({ to: i, act: () => { flash[i] = 1; }, wait: 0.12 }));
    add.forEach((i) => steps.push({ to: i, act: () => { shown = Math.max(shown, i + 1); kind[i] = "n"; flash[i] = 1; }, wait: 0.15 }));
    steps.push({ to: INDEX, act: () => log("ok", `index.md · log.md 갱신 — 페이지 ${touched.length + add.length}개 수정·생성`), wait: 0.6 });
  }
  function planQuery() {
    const q = QUES[cycle % QUES.length];
    const path = pickSome(3);
    steps.push({ to: INDEX, act: () => { beam(HUMAN, INDEX, "ctx"); log("human", `질문: “${q}”`); }, wait: 0.5 });
    steps.push({ to: INDEX, act: () => log("query", `index.md 읽기 → [[${label(path[0])}]] [[${label(path[1])}]] 열기`), wait: 0.2 });
    path.forEach((i, k) => steps.push({ to: i, act: () => { flash[i] = -1; beam(k ? path[k - 1] : INDEX, i, "ctx"); }, wait: 0.2 }));
    const filed = shown < N && cycle % 2 === 1;
    steps.push({ to: path[path.length - 1], act: () => { beam(path[path.length - 1], HUMAN, "ctx"); if (filed) { kind[shown] = "ans"; shown++; beam(path[path.length - 1], shown - 1, "state"); log("file", "좋은 답 → analyses/ 새 페이지로 저장"); } else log("query", "답 + 인용 링크 3개"); }, wait: 0.8 });
  }
  function planLint() {
    const [a] = pickSome(1, [0]);
    steps.push({ to: INDEX, act: () => { kind[a] = "bad"; log("lint", `모순 발견: [[${label(a)}]]의 수치가 새 원천과 다름`); }, wait: 0.5 });
    steps.push({ to: a, act: () => { kind[a] = "n"; flash[a] = 2; log("lint", `[[${label(a)}]] 고침 · 출처 각주 갱신 · 고아 페이지 0`); }, wait: 0.8 });
  }
  function nextCycle() {
    if (shown >= N) { log("ok", `페이지 ${N}개 · 링크 ${E.length}개 — 처음부터 다시`); steps.push({ to: [0.2, 0.3, 0.6], act: reset, wait: 1.6 }); return; }
    const k = cycle % 3;
    if (k === 0) planIngest(); else if (k === 1) planQuery(); else { planLint(); planIngest(); }
    cycle++;
  }

  function cube(c, cx, cy, cz, W, H, D, col, a, w, h) {
    const Q = {};
    [-1, 1].forEach((sx) => [-1, 1].forEach((sy) => [-1, 1].forEach((sz) => (Q[`${sx},${sy},${sz}`] = project([cx + sx * W, cy + sy * H, cz + sz * D], w, h)))));
    const F = [["-1,-1,-1", "1,-1,-1", "1,1,-1", "-1,1,-1"], ["-1,-1,1", "1,-1,1", "1,1,1", "-1,1,1"], ["-1,-1,-1", "-1,-1,1", "-1,1,1", "-1,1,-1"], ["1,-1,-1", "1,-1,1", "1,1,1", "1,1,-1"], ["-1,1,-1", "1,1,-1", "1,1,1", "-1,1,1"], ["-1,-1,-1", "1,-1,-1", "1,-1,1", "-1,-1,1"]];
    F.map((k) => k.map((q) => Q[q])).map((f) => ({ f, z: f.reduce((s, p) => s + p.z, 0) / 4 })).sort((x, y) => y.z - x.z).forEach(({ f }, i) => {
      c.beginPath(); f.forEach((p, j) => (j ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.closePath();
      c.fillStyle = WK.alpha(col, (i >= 4 ? 0.42 : 0.16) * a); c.fill(); c.strokeStyle = WK.alpha(col, 0.85 * a); c.lineWidth = 1; c.stroke();
    });
  }

  function step(dt) {
    if (!cur) { if (!steps.length) nextCycle(); cur = steps.shift(); moveT = 0; waitT = -1; }
    if (waitT < 0) {
      const tg = posOf(cur.to);
      moveT += dt;
      const k = Math.min(1, dt * 5);
      agent = agent.map((v, i) => v + (tg[i] - v) * k);
      if (dist(agent, tg) < 0.04 || moveT > 1.1) { cur.act && cur.act(); waitT = cur.wait || 0; }
    } else {
      waitT -= dt;
      if (waitT <= 0) cur = null;
    }
  }

  function draw(dt) {
    const { ctx: c, w, h } = st;
    c.clearRect(0, 0, w, h);
    if (auto && !drag) yaw += dt * 0.12;
    if (dt > 0) step(dt);
    appear = appear.map((a, i) => (i < shown ? Math.min(1, a + dt * 2) : 0));
    flash = flash.map((f) => (f > 0 ? Math.max(0, f - dt * 1.3) : f < 0 ? Math.min(0, f + dt * 1.1) : 0));
    beams.forEach((b) => (b.t += dt * 1.3)); beams = beams.filter((b) => b.t < 1.4);
    if (doc) { doc.t = Math.min(1, doc.t + dt * 1.5); doc.p = SRC.map((v, i) => WK.lerp(v, agent[i], WK.ease(doc.t))); }

    c.fillStyle = WK.col("text-faint");
    stars.forEach((s) => { const p = project(s, w, h); c.globalAlpha = 0.2 * p.f; c.fillRect(p.x, p.y, 1.6, 1.6); });
    c.globalAlpha = 1;

    const mem = WK.col("state"), acc = WK.col("accent"), ctxc = WK.col("ctx"), env = WK.col("env"), gd = WK.col("guard"), tool = WK.col("tool");
    const PP = P.map((p) => project(p, w, h));
    /* 간선 */
    E.forEach(([a, b]) => {
      const v = Math.min(appear[a], appear[b]);
      if (v <= 0) return;
      const pa = PP[a], pb = PP[b], depth = (pa.f + pb.f) / 2;
      c.strokeStyle = WK.alpha(mem, (0.16 + 0.28 * (depth - 0.75) / 0.5) * v);
      c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(pa.x, pa.y); c.lineTo(WK.lerp(pa.x, pb.x, v), WK.lerp(pa.y, pb.y, v)); c.stroke();
    });
    /* 색인에서 이름 있는 허브로 가는 옅은 선 */
    const ip = project(INDEX, w, h);
    for (let i = 0; i < Math.min(6, shown); i++) { c.strokeStyle = WK.alpha(mem, 0.12); c.setLineDash([2, 4]); c.beginPath(); c.moveTo(ip.x, ip.y); c.lineTo(PP[i].x, PP[i].y); c.stroke(); c.setLineDash([]); }

    /* 노드와 색인을 깊이순으로 */
    const items = P.map((p, i) => ({ i, z: PP[i].z })).filter((o) => appear[o.i] > 0);
    items.push({ i: -1, z: ip.z });
    items.sort((a, b) => b.z - a.z).forEach(({ i }) => {
      if (i === -1) { cube(c, 0, 0, 0, 0.15, 0.1, 0.11, mem, 1, w, h); WK.text(c, "index.md", ip.x, ip.y + 22 * ip.f, { size: 10.5, mono: true, align: "center", color: mem }); return; }
      const p = PP[i], a = appear[i], fl = flash[i];
      const col = kind[i] === "bad" ? gd : kind[i] === "ans" ? env : mem;
      const r = (i < NAMES.length ? 6.5 : 4.6) * p.f * (0.4 + 0.6 * a);
      if (fl !== 0) {
        const fc = fl > 0 ? (fl > 1 ? env : acc) : ctxc, g = Math.abs(fl > 1 ? fl - 1 : fl);
        c.fillStyle = WK.alpha(fc, 0.35 * g); c.beginPath(); c.arc(p.x, p.y, r + 12 * g, 0, 7); c.fill();
      }
      c.globalAlpha = 0.45 + 0.55 * WK.clamp((p.f - 0.75) / 0.45, 0, 1);
      c.fillStyle = WK.alpha(col, 0.85); c.beginPath(); c.arc(p.x, p.y, r, 0, 7); c.fill();
      if (kind[i] === "bad") { c.strokeStyle = gd; c.lineWidth = 2; c.setLineDash([3, 3]); c.beginPath(); c.arc(p.x, p.y, r + 5, 0, 7); c.stroke(); c.setLineDash([]); }
      c.globalAlpha = 1;
      if (i < NAMES.length && p.z < 0.25) WK.text(c, NAMES[i], p.x + r + 4, p.y, { size: 10.5, weight: 600, color: WK.col("text-dim") });
    });

    /* 질의 빔 */
    beams.forEach((b) => {
      const pa = project(b.a, w, h), pb = project(b.b, w, h), e = WK.ease(Math.min(1, b.t)), col = WK.col(b.col);
      c.strokeStyle = WK.alpha(col, 0.85 * (1 - Math.max(0, b.t - 0.6) / 0.8)); c.lineWidth = 1.8; c.setLineDash([4, 4]);
      c.beginPath(); c.moveTo(pa.x, pa.y); c.lineTo(WK.lerp(pa.x, pb.x, e), WK.lerp(pa.y, pb.y, e)); c.stroke(); c.setLineDash([]);
      if (b.t < 1) { c.fillStyle = col; c.beginPath(); c.arc(WK.lerp(pa.x, pb.x, e), WK.lerp(pa.y, pb.y, e), 3.5, 0, 7); c.fill(); }
    });

    /* 원천 문서 */
    if (doc) {
      const dp = project(doc.p, w, h), s = 11 * dp.f;
      c.fillStyle = WK.alpha(tool, 0.9); WK.rrect(c, dp.x - s * 0.8, dp.y - s, s * 1.6, s * 2, 3); c.fill();
      c.strokeStyle = WK.col("bg"); c.lineWidth = 1.6;
      for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(dp.x - s * 0.5, dp.y - s * 0.45 + k * s * 0.45); c.lineTo(dp.x + s * 0.5, dp.y - s * 0.45 + k * s * 0.45); c.stroke(); }
    }

    /* 에이전트 */
    const ap = project(agent, w, h);
    const g = c.createRadialGradient(ap.x, ap.y, 1, ap.x, ap.y, 24 * ap.f);
    g.addColorStop(0, WK.alpha(acc, 0.55)); g.addColorStop(1, WK.alpha(acc, 0));
    c.fillStyle = g; c.beginPath(); c.arc(ap.x, ap.y, 24 * ap.f, 0, 7); c.fill();
    WK.node(c, ap.x, ap.y, 8 * ap.f, "run", null, { fill: 0.6, lw: 2.4 });
    WK.text(c, "에이전트", ap.x, ap.y + 17 * ap.f, { size: 10.5, weight: 700, align: "center", color: WK.col("text-dim") });

    /* 사람 */
    const hp = project(HUMAN, w, h);
    WK.node(c, hp.x, hp.y, 10 * hp.f, "human", null, { fill: 0.25, glow: beams.some((b) => b.a === HUMAN || dist(b.a, HUMAN) < 0.01) ? 1 : 0 });
    WK.text(c, "사람", hp.x, hp.y + 19 * hp.f, { size: 10.5, weight: 700, align: "center", color: WK.col("text-dim") });
    WK.text(c, `페이지 ${shown} · 링크 ${E.filter(([a, b]) => a < shown && b < shown).length}`, w - 14, 18, { size: 11, mono: true, align: "right", color: mem });
  }
  st.draw = () => draw(0);
  const L = WK.loop(box, draw);
  if (WK.reduced()) {
    shown = 27; appear = P.map((_, i) => (i < shown ? 1 : 0)); kind[20] = "ans"; kind[24] = "ans";
    log("ingest", "원천 읽기 · 엔티티 5개, 주장 9개 추출"); log("ok", "index.md · log.md 갱신 — 페이지 6개 수정·생성"); draw(0);
  } else L.start();
})();
