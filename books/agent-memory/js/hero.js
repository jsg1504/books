/* 표지 3D: 기억 성좌. 일화(주황)·의미(초록)·절차(보라) 기억이 공간에 떠 있고,
   질문이 들어오면 가까운 기억을 찾아(분홍 빔) 컨텍스트 윈도우(아래 막대)로 불러온다.
   대화가 끝나면 새 기억을 쓰고, 오래된 기억은 희미해진다. */
(function () {
  "use strict";
  const box = document.getElementById("hero");
  if (!box) return;
  const cv = box.querySelector("canvas");
  const logEl = box.querySelector(".term-log");
  const rnd = AM.rng(7);

  const CL = {
    epi: { c: [-0.85, 0.4, 0.3], label: "일화 기억" },
    sem: { c: [0.85, 0.3, -0.25], label: "의미 기억" },
    proc: { c: [0.05, -0.7, -0.6], label: "절차 기억" },
  };
  const SEEDS = {
    epi: ["3월 출장: 김포→부산 KTX", "지난 회의에서 예산 20% 삭감 결정", "어제 배포 후 로그인 오류 신고", "4월 2일 노트북 A/S 접수", "주말에 등산 일정 취소", "지난주 발표 자료 v3 공유"],
    sem: ["좌석은 통로 쪽을 선호", "노트북: 14인치, 메모리 32GB", "팀장은 박서연", "사무실은 판교", "견과류 알레르기 있음", "보고서는 한국어로 작성"],
    proc: ["예약 전 일정표 확인 후 승인 받기", "배포 전 스테이징에서 테스트", "회의록은 결정·담당·기한 순", "비용 50만 원 넘으면 확인 요청"],
  };
  const nodes = [];
  const byLabel = {};
  Object.entries(SEEDS).forEach(([k, arr]) => {
    arr.forEach((label) => add(k, label));
    for (let i = 0; i < 10; i++) add(k, null);
  });
  function add(k, label) {
    const c = CL[k].c, u = rnd() * Math.PI * 2, v = Math.acos(2 * rnd() - 1), rr = 0.18 + rnd() * 0.42;
    const n = { k, label, p: [c[0] + rr * Math.sin(v) * Math.cos(u), c[1] + rr * Math.cos(v) * 0.8, c[2] + rr * Math.sin(v) * Math.sin(u)], a: label ? 1 : 0.55, glow: 0, born: 0 };
    nodes.push(n);
    if (label) byLabel[label] = n;
    return n;
  }
  const edges = [];
  nodes.forEach((a, i) => nodes.forEach((b, j) => { if (j > i && a.k === b.k && dist(a.p, b.p) < 0.38) edges.push([a, b]); }));
  function dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); }

  const SCRIPT = [
    { q: "다음 주 부산 출장 기차 예약해 줘", hit: ["3월 출장: 김포→부산 KTX", "좌석은 통로 쪽을 선호", "예약 전 일정표 확인 후 승인 받기"], write: ["epi", "5월 12일 부산 출장 KTX 예약"] },
    { q: "회의 끝났어. 회의록 정리해 줘", hit: ["회의록은 결정·담당·기한 순", "보고서는 한국어로 작성", "지난 회의에서 예산 20% 삭감 결정"], write: ["epi", "5월 회의: 출시일 6월로 연기"] },
    { q: "점심 메뉴 추천해 줄래?", hit: ["견과류 알레르기 있음", "사무실은 판교"], write: null, decay: true },
    { q: "새 노트북 사도 될까? 120만 원이야", hit: ["노트북: 14인치, 메모리 32GB", "비용 50만 원 넘으면 확인 요청", "4월 2일 노트북 A/S 접수"], write: ["sem", "새 노트북 구매 검토 중"] },
  ];

  const st = AM.canvas(cv, { height: () => box.clientHeight });
  let yaw = 0.5, pitch = 0.28, drag = null, auto = true;
  box.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, yaw, pitch }; box.setPointerCapture(e.pointerId); auto = false; });
  box.addEventListener("pointermove", (e) => {
    if (!drag) return;
    yaw = drag.yaw + (e.clientX - drag.x) * 0.008;
    pitch = AM.clamp(drag.pitch + (e.clientY - drag.y) * 0.006, -1.2, 1.2);
  });
  const endDrag = () => { drag = null; setTimeout(() => (auto = true), 2500); };
  box.addEventListener("pointerup", endDrag);
  box.addEventListener("pointercancel", endDrag);

  let step = -1, phase = "idle", t = 0, lines = [], ctxSlots = [], flyers = [], probe = null, hits = [];
  const SLOTS = 6;
  function log(k, s) { lines.push({ k, s }); logEl.innerHTML = lines.slice(-3).map((l) => `<div><span class="chip k-${l.k}">${{ user: "user", work: "recall", epi: "write", sem: "write", fail: "decay" }[l.k]}</span> ${AM.esc(l.s)}</div>`).join(""); }
  function next() {
    step = (step + 1) % SCRIPT.length;
    if (step === 0) { ctxSlots = []; }
    const s = SCRIPT[step];
    log("user", "› " + s.q);
    hits = s.hit.map((l) => byLabel[l]).filter(Boolean);
    const c = [0, 0, 0];
    hits.forEach((n) => { c[0] += n.p[0] / hits.length; c[1] += n.p[1] / hits.length; c[2] += n.p[2] / hits.length; });
    probe = { from: [0, 1.6, 0], to: c, t: 0 };
    phase = "probe"; t = 0;
  }
  function project(p, w, h) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const x1 = p[0] * cy - p[2] * sy, z1 = p[0] * sy + p[2] * cy;
    const y2 = p[1] * cp - z1 * sp, z2 = p[1] * sp + z1 * cp;
    const f = 3.2 / (3.2 + z2), s = Math.min(w, h * 1.2) * 0.26;
    return { x: w / 2 + x1 * s * f, y: h * 0.4 - y2 * s * f, f, z: z2 };
  }
  const ease = (x) => 1 - Math.pow(1 - AM.clamp(x, 0, 1), 3);

  function frame(dt) {
    t += dt;
    if (auto && !drag) yaw += dt * 0.12;
    if (phase === "idle" && t > 0.8) next();
    else if (phase === "probe") {
      probe.t = ease(t / 1.1);
      if (t > 1.1) { phase = "beam"; t = 0; hits.forEach((n) => (n.glow = 1)); log("work", "검색: " + hits.map((n) => n.label).join(" · ")); }
    } else if (phase === "beam" && t > 0.9) {
      phase = "fly"; t = 0;
      hits.forEach((n, i) => flyers.push({ n, t: -i * 0.18 }));
    } else if (phase === "fly" && t > 1.6) {
      phase = "write"; t = 0;
      const s = SCRIPT[step];
      if (s.write) {
        const n = add(s.write[0], s.write[1]);
        n.born = 1; n.glow = 1;
        log(s.write[0], "새 기억 쓰기: " + s.write[1]);
      }
      if (s.decay) {
        const old = nodes.filter((n) => !n.label && n.a > 0.3).slice(0, 6);
        old.forEach((n) => (n.fade = true));
        log("fail", "오래 안 쓴 기억 6개 희미해짐");
      }
    } else if (phase === "write" && t > 2.2) { phase = "idle"; t = 0; probe = null; }

    nodes.forEach((n) => {
      n.glow = Math.max(0, n.glow - dt * 0.35);
      n.born = Math.max(0, n.born - dt * 0.5);
      if (n.fade) n.a = Math.max(0.12, n.a - dt * 0.25);
    });
    flyers.forEach((f) => (f.t += dt));
    flyers = flyers.filter((f) => {
      if (f.t > 1.1) {
        ctxSlots.push(f.n);
        if (ctxSlots.length > SLOTS) ctxSlots.shift();
        return false;
      }
      return true;
    });
    st.redraw();
  }

  st.draw = (c, w, h) => {
    const P = nodes.map((n) => project(n.p, w, h));
    const pi = new Map(nodes.map((n, i) => [n, P[i]]));
    // 군집 이름
    Object.entries(CL).forEach(([k, cl]) => {
      const q = project([cl.c[0], cl.c[1] + 0.66, cl.c[2]], w, h);
      AM.text(c, cl.label, q.x, q.y, { size: 12, align: "center", weight: 700, color: AM.alpha(AM.col(k), 0.9) });
    });
    c.lineWidth = 1;
    edges.forEach(([a, b]) => {
      const A = pi.get(a), B = pi.get(b);
      c.strokeStyle = AM.alpha(AM.col(a.k), 0.12 * Math.min(a.a, b.a) * A.f);
      c.beginPath(); c.moveTo(A.x, A.y); c.lineTo(B.x, B.y); c.stroke();
    });
    // 질문 탐침과 빔
    if (probe) {
      const p = probe.from.map((v, i) => AM.lerp(v, probe.to[i], probe.t));
      const q = project(p, w, h);
      if (phase !== "probe") hits.forEach((n) => {
        const A = pi.get(n);
        c.strokeStyle = AM.alpha(AM.col("accent-2"), 0.75); c.lineWidth = 2;
        c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(A.x, A.y); c.stroke();
      });
      c.fillStyle = AM.col("accent-2");
      c.beginPath(); c.arc(q.x, q.y, 7 * q.f, 0, 7); c.fill();
      c.strokeStyle = AM.alpha(AM.col("accent-2"), 0.35); c.lineWidth = 6;
      c.beginPath(); c.arc(q.x, q.y, 14 * q.f, 0, 7); c.stroke();
    }
    const order = nodes.map((n, i) => i).sort((a, b) => P[b].z - P[a].z);
    order.forEach((i) => {
      const n = nodes[i], q = P[i];
      const r = (n.label ? 5.5 : 3.6) * q.f + n.born * 10;
      if (n.glow > 0 || n.born > 0) {
        c.fillStyle = AM.alpha(AM.col(n.k), 0.25 * Math.max(n.glow, n.born));
        c.beginPath(); c.arc(q.x, q.y, r + 10, 0, 7); c.fill();
      }
      c.fillStyle = AM.alpha(AM.col(n.k), n.a);
      c.beginPath(); c.arc(q.x, q.y, r, 0, 7); c.fill();
    });
    // 컨텍스트 윈도우 막대
    const bx = 14, bw = w - 28, by = h - 128, bh = 30, sw = bw / SLOTS;
    AM.text(c, "컨텍스트 윈도우 (작업 기억)", bx, by - 10, { size: 11, mono: true, color: AM.col("text-faint") });
    c.strokeStyle = AM.col("border"); c.lineWidth = 1;
    AM.rrect(c, bx, by, bw, bh, 7); c.stroke();
    ctxSlots.forEach((n, i) => {
      c.fillStyle = AM.alpha(AM.col(n.k), 0.18); AM.rrect(c, bx + i * sw + 3, by + 3, sw - 6, bh - 6, 5); c.fill();
      c.save(); c.beginPath(); c.rect(bx + i * sw + 6, by, sw - 12, bh); c.clip();
      AM.text(c, n.label, bx + i * sw + 9, by + bh / 2, { size: 11, color: AM.col("text") });
      c.restore();
    });
    flyers.forEach((f) => {
      if (f.t < 0) return;
      const A = pi.get(f.n), k = ease(f.t / 1.1), slot = Math.min(ctxSlots.length, SLOTS - 1);
      const tx = bx + slot * sw + sw / 2, ty = by + bh / 2;
      const x = AM.lerp(A.x, tx, k), y = AM.lerp(A.y, ty, k) - Math.sin(k * Math.PI) * 30;
      c.fillStyle = AM.col(f.n.k); c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill();
    });
  };

  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loop = AM.loop(box, frame);
  if (reduce) { next(); phase = "write"; hits.forEach((n) => (n.glow = 1)); ctxSlots = hits.slice(); st.redraw(); }
  else loop.start();
})();
