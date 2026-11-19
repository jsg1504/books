/* ChorusBook 공통 스크립트: 테마, 상단 바, 목차, 퀴즈, 캔버스/차트/그래프 도우미.
   <head>에서 동기 로드한다. 장 본문의 인라인 스크립트가 MA.* 도우미를 바로 쓸 수 있도록
   도우미는 즉시 정의하고, 화면 골격은 DOMContentLoaded에서 붙인다. */
(function () {
  "use strict";
  const MA = (window.MA = {});

  MA.CHAPTERS = [
    { slug: "why", num: "01", title: "왜 여러 에이전트인가", desc: "한 에이전트의 벽: 컨텍스트, 폭, 전문성. 언제 나누고 언제 나누지 말아야 하나.", tags: ["sim", "game"] },
    { slug: "topology", num: "02", title: "토폴로지: 누가 누구와 말하는가", desc: "중앙집중·계층·메시·파이프라인·블랙보드. 채널 수, 지름, 단일 장애점.", tags: ["anim", "sim"] },
    { slug: "decompose", num: "03", title: "작업 분해와 위임", desc: "의존 그래프와 임계 경로, 분해 입도의 U자 곡선, 좋은 위임 지시서.", tags: ["anim", "sim", "game"] },
    { slug: "comms", num: "04", title: "통신과 메시지 프로토콜", desc: "전달될수록 사라지는 정보, 핸드오프 대 도구로서의 에이전트, 구조화 메시지.", tags: ["sim", "anim"] },
    { slug: "state", num: "05", title: "공유 상태와 블랙보드", desc: "블랙보드 아키텍처, 경쟁 조건과 잠금, 무엇을 공유하고 무엇을 가둘까.", tags: ["anim", "sim"] },
    { slug: "consensus", num: "06", title: "조정과 합의", desc: "다수결과 오류 상관, 토론과 동조, 계약망 경매로 일 나누기.", tags: ["sim", "viz"] },
    { slug: "roles", num: "07", title: "역할 설계와 전문화", desc: "전문가 대 만능가, 도구 나눠 주기, 생성자-비평가 루프의 함정.", tags: ["sim", "game"] },
    { slug: "failures", num: "08", title: "실패 모드와 연쇄 오류", desc: "MAST 실패 분류, 파이프라인 오류 전파, 에이전트 사이의 핑퐁 루프.", tags: ["sim", "game"] },
    { slug: "scale", num: "09", title: "비용 · 지연 · 확장성", desc: "토큰 배수, 범용 확장성 법칙, 모델 섞어 쓰기, 예산 나누기.", tags: ["sim", "viz"] },
    { slug: "security", num: "10", title: "신뢰 경계와 보안", desc: "에이전트 사이로 번지는 프롬프트 주입, 치명적 삼중주, 격리 패턴.", tags: ["sim", "anim"] },
    { slug: "evaluation", num: "11", title: "평가와 관측", desc: "다중 에이전트 트레이스, 누구 탓인가(기여도), 몇 번 돌려야 믿을까.", tags: ["viz", "sim"] },
    { slug: "design", num: "12", title: "설계 플레이그라운드와 용어집", desc: "부품을 골라 시스템을 설계하고, 용어와 종합 퀴즈로 정리한다.", tags: ["sim", "game"] },
  ];
  /* 용어집: [용어, 영어, 설명, 장] — 상단 검색과 12장 용어집이 함께 쓴다 */
  MA.GLOSSARY = [
    ["멀티에이전트 시스템", "multi-agent system, MAS", "각자 모델·컨텍스트·도구를 가진 여러 에이전트가 메시지나 공유 상태로 협력해 하나의 일을 하는 시스템.", "why"],
    ["단일 에이전트", "single agent", "한 컨텍스트, 한 루프로 처음부터 끝까지 일하는 에이전트. 멀티에이전트의 기준선.", "why"],
    ["컨텍스트 압박", "context pressure", "필요한 자료가 한 컨텍스트 창보다 커서 잘라 내거나 요약해야 하는 상태.", "why"],
    ["폭 우선 작업", "breadth-first task", "서로 독립적인 여러 방향을 동시에 조사해야 하는 작업. 멀티에이전트가 가장 잘 맞는다.", "why"],
    ["토폴로지", "topology", "에이전트들이 누구와 직접 통신하는지를 나타내는 연결 구조.", "topology"],
    ["오케스트레이터", "orchestrator / lead agent", "작업을 나눠 위임하고 결과를 모아 합성하는 중심 에이전트.", "topology"],
    ["워커", "worker / subagent", "오케스트레이터에게 하위 작업을 받아 자기 컨텍스트에서 수행하고 결과를 돌려주는 에이전트.", "topology"],
    ["계층형", "hierarchical", "관리자 아래 관리자를 두는 나무 구조. 넓은 일을 여러 단계로 나눌 때 쓴다.", "topology"],
    ["메시", "mesh / peer-to-peer", "모든 에이전트가 서로 직접 말할 수 있는 구조. 채널 수가 n(n−1)/2로 늘어난다.", "topology"],
    ["단일 장애점", "single point of failure", "그 하나가 멈추면 전체가 멈추는 구성 요소.", "topology"],
    ["작업 분해", "task decomposition", "큰 목표를 의존 관계가 있는 하위 작업으로 나누는 일.", "decompose"],
    ["의존 그래프", "dependency DAG", "하위 작업을 노드로, '먼저 끝나야 함'을 간선으로 그린 방향 비순환 그래프.", "decompose"],
    ["임계 경로", "critical path", "의존 그래프에서 가장 긴 경로. 워커를 아무리 늘려도 이보다 빨리 끝낼 수 없다.", "decompose"],
    ["입도", "granularity", "하위 작업 하나의 크기. 너무 작으면 조정 비용이, 너무 크면 병렬성 손실이 커진다.", "decompose"],
    ["위임 지시서", "delegation brief", "워커에게 주는 작업 설명. 목표, 출력 형식, 범위, 도구, 완료 기준을 담는다.", "decompose"],
    ["핸드오프", "handoff", "대화의 주도권을 다른 에이전트에게 넘기는 방식. 넘겨받은 쪽이 사용자와 직접 이어 간다.", "comms"],
    ["도구로서의 에이전트", "agent as tool", "다른 에이전트를 함수처럼 호출하고 결과만 돌려받는 방식. 호출한 쪽이 주도권을 유지한다.", "comms"],
    ["전언 게임 효과", "telephone effect", "요약을 거칠 때마다 세부가 빠지고 왜곡이 쌓여, 여러 단계 뒤 원래 정보가 크게 줄어드는 현상.", "comms"],
    ["참조 전달", "pass by reference", "긴 결과를 메시지에 담지 않고 파일·아티팩트로 저장한 뒤 위치만 넘기는 방식.", "comms"],
    ["A2A", "Agent2Agent protocol", "서로 다른 회사·프레임워크의 에이전트가 작업을 주고받기 위한 개방형 통신 규약.", "comms"],
    ["블랙보드", "blackboard", "모든 에이전트가 읽고 쓰는 공유 작업 공간. 에이전트는 칠판의 변화를 보고 스스로 나선다.", "state"],
    ["경쟁 조건", "race condition", "여러 에이전트가 같은 상태를 동시에 읽고 써서, 실행 순서에 따라 결과가 달라지는 문제.", "state"],
    ["갱신 손실", "lost update", "두 에이전트가 같은 값을 읽고 각자 고쳐 쓰는 바람에 한쪽의 변경이 사라지는 일.", "state"],
    ["낙관적 동시성 제어", "optimistic concurrency", "버전 번호를 확인하고 그사이 바뀌었으면 쓰기를 거절해 다시 읽게 하는 방식.", "state"],
    ["다수결", "majority voting", "여러 에이전트(또는 여러 샘플)의 답 중 가장 많은 것을 고르는 방법.", "consensus"],
    ["오류 상관", "error correlation", "에이전트들이 같은 문제에서 함께 틀리는 정도. 높을수록 투표의 이득이 사라진다.", "consensus"],
    ["콩도르세 배심원 정리", "Condorcet jury theorem", "서로 독립이고 각자 절반보다 잘 맞히는 투표자가 많을수록 다수결 정확도가 1에 가까워진다는 정리.", "consensus"],
    ["다중 에이전트 토론", "multi-agent debate", "여러 에이전트가 서로의 답을 보고 여러 라운드에 걸쳐 고쳐 가며 답을 모으는 방법.", "consensus"],
    ["동조", "conformity / sycophancy", "근거보다 다수나 상대의 의견을 따라 자기 답을 바꾸는 경향.", "consensus"],
    ["계약망 프로토콜", "contract net protocol", "관리자가 작업을 공고하고, 에이전트들이 입찰하면 가장 알맞은 쪽에 낙찰하는 작업 배분 방식.", "consensus"],
    ["전문화", "specialization", "에이전트마다 좁은 역할, 전용 지시문, 전용 도구를 주는 설계.", "roles"],
    ["라우터", "router", "들어온 작업을 알맞은 전문 에이전트로 보내는 분류기.", "roles"],
    ["생성자-비평가", "generator-critic", "한 에이전트가 만들고 다른 에이전트가 평가해 고치게 하는 반복 구조.", "roles"],
    ["최소 권한", "least privilege", "각 에이전트에게 그 역할에 꼭 필요한 도구와 권한만 주는 원칙.", "roles"],
    ["MAST", "Multi-Agent System failure Taxonomy", "멀티에이전트 실행 기록을 분석해 실패를 명세·에이전트 간 불일치·검증의 세 범주로 나눈 분류.", "failures"],
    ["연쇄 오류", "cascading error", "앞 에이전트의 실수가 다음 에이전트의 전제가 되어 뒤로 갈수록 커지는 오류.", "failures"],
    ["핑퐁 루프", "ping-pong loop", "두 에이전트가 서로에게 일을 되넘기며 진전 없이 오가는 상태.", "failures"],
    ["검증 관문", "verification gate", "다음 단계로 넘기기 전에 결과를 확인하는 지점. 연쇄 오류를 끊는다.", "failures"],
    ["토큰 배수", "token multiplier", "같은 일을 단일 에이전트(또는 채팅)로 할 때보다 몇 배의 토큰을 쓰는지.", "scale"],
    ["범용 확장성 법칙", "Universal Scalability Law", "경합(σ)과 일관성 비용(κ)으로 n개 작업자의 처리량을 설명하는 모형. κ가 있으면 어느 n부터 오히려 느려진다.", "scale"],
    ["모델 계층화", "model tiering", "리더에는 큰 모델, 단순 워커에는 작은 모델을 쓰는 식으로 역할마다 모델을 다르게 고르는 일.", "scale"],
    ["신뢰 경계", "trust boundary", "신뢰 수준이 다른 데이터나 에이전트가 만나는 지점. 여기서 검사와 제한이 필요하다.", "security"],
    ["프롬프트 주입", "prompt injection", "모델이 읽는 데이터 안에 지시문을 숨겨 원래 지시를 덮어쓰게 하는 공격.", "security"],
    ["치명적 삼중주", "lethal trifecta", "비공개 데이터 접근, 신뢰할 수 없는 입력, 외부 통신이 한 에이전트에 모이면 유출이 가능해진다는 경고.", "security"],
    ["격리 에이전트", "quarantined agent", "신뢰할 수 없는 입력만 다루고 도구 권한이 없는 에이전트. 결과는 구조화된 값으로만 넘긴다.", "security"],
    ["기여도 분석", "credit assignment", "시스템 결과에 각 에이전트가 얼마나 기여했는지(또는 누구 때문에 실패했는지) 가려내는 일.", "evaluation"],
    ["제거 실험", "ablation", "한 구성 요소를 빼거나 바꿔 보고 점수 변화로 그 기여를 재는 방법.", "evaluation"],
    ["최종 상태 평가", "end-state evaluation", "중간 경로 대신 최종 결과물이 요구를 만족하는지로 채점하는 방식. 경로가 매번 다른 시스템에 알맞다.", "evaluation"],
    ["LLM 심판", "LLM-as-judge", "채점 기준표를 주고 언어 모델에게 결과를 평가하게 하는 방법.", "evaluation"],
  ];
  MA.BRAND = "ChorusBook";

  /* ---------------------------------------------------------------- theme */
  const THEME_KEY = "chorusbook-theme";
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) document.documentElement.dataset.theme = saved;
  } catch (e) { /* storage blocked */ }
  const themeCbs = [];
  let colorCache = null;
  MA.onTheme = (cb) => themeCbs.push(cb);
  function themeChanged() { colorCache = null; themeCbs.forEach((cb) => { try { cb(); } catch (e) { console.error(e); } }); }
  MA.isDark = () => {
    const t = document.documentElement.dataset.theme;
    if (t) return t === "dark";
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  };
  MA.toggleTheme = () => {
    const next = MA.isDark() ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    themeChanged();
  };
  if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", themeChanged);

  /** CSS 변수 색을 읽는다. MA.col("accent") 또는 MA.col("--accent") */
  MA.col = (name) => {
    if (!colorCache) colorCache = {};
    const key = name.startsWith("--") ? name : "--" + name;
    if (!(key in colorCache)) colorCache[key] = getComputedStyle(document.documentElement).getPropertyValue(key).trim() || "#888888";
    return colorCache[key];
  };
  /** 색에 투명도를 준다 (#rrggbb만) */
  MA.alpha = (hex, a) => {
    const h = String(hex).replace("#", "");
    if (h.length !== 6) return hex;
    return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
  };
  /* 색 언어: 역할 → CSS 변수 */
  MA.ROLE = { lead: "accent", worker: "ctx", msg: "tool", shared: "env", plan: "state", fail: "guard", human: "user", judge: "accent-2" };
  MA.rc = (role) => MA.col(MA.ROLE[role] || role);

  /* ---------------------------------------------------------------- math */
  MA.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  MA.lerp = (a, b, t) => a + (b - a) * t;
  MA.rng = (seed) => {
    let s = seed >>> 0 || 1;
    return () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  MA.fmt = (v, d = 0) => {
    if (!isFinite(v)) return "—";
    return Number(v).toLocaleString("ko-KR", { minimumFractionDigits: d, maximumFractionDigits: d });
  };
  MA.si = (v) => {
    const a = Math.abs(v);
    if (a >= 1e6) return (v / 1e6).toFixed(a >= 1e7 ? 0 : 1) + "M";
    if (a >= 1e3) return (v / 1e3).toFixed(a >= 1e4 ? 0 : 1) + "K";
    return String(Math.round(v));
  };
  MA.pct = (v, d = 0) => (isFinite(v) ? (v * 100).toFixed(d) + "%" : "—");
  MA.ease = (x) => { x = MA.clamp(x, 0, 1); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
  /** 이항계수와 이항분포 꼬리 (투표 계산용) */
  MA.binom = (n, k) => { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r; };
  MA.normal = (r) => { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

  /* ---------------------------------------------------------------- DOM */
  MA.$ = (s, r = document) => r.querySelector(s);
  MA.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  MA.el = (id) => document.getElementById(id);
  MA.val = (id) => +document.getElementById(id).value;
  MA.set = (id, txt, cls) => {
    const e = document.getElementById(id);
    if (!e) return;
    e.textContent = txt;
    if (cls !== undefined) { e.classList.remove("good", "bad", "warn"); if (cls) e.classList.add(cls); }
  };
  MA.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  /** range 입력들을 render에 연결하고, id+"-out" output에 값을 표시한다. */
  MA.wire = (ids, fn, fmts = {}) => {
    const up = () => {
      ids.forEach((id) => {
        const o = document.getElementById(id + "-out");
        if (o) o.textContent = fmts[id] ? fmts[id](MA.val(id)) : document.getElementById(id).value;
      });
      fn();
    };
    ids.forEach((id) => document.getElementById(id).addEventListener("input", up));
    up();
    return up;
  };
  /** .seg 버튼 묶음. data-v 값을 콜백에 넘긴다. */
  MA.seg = (id, cb) => {
    const root = document.getElementById(id);
    const btns = Array.from(root.querySelectorAll("button"));
    let cur = (btns.find((b) => b.classList.contains("on")) || btns[0]).dataset.v;
    btns.forEach((b) => b.addEventListener("click", () => {
      btns.forEach((x) => x.classList.toggle("on", x === b));
      cur = b.dataset.v;
      cb && cb(cur);
    }));
    return () => cur;
  };

  /* ---------------------------------------------------------------- canvas */
  /** 고해상도 캔버스. opts.height(px 또는 w=>px) 또는 opts.aspect, opts.draw(ctx,w,h) */
  MA.canvas = (canvas, opts = {}) => {
    if (typeof canvas === "string") canvas = document.getElementById(canvas);
    const ctx = canvas.getContext("2d");
    const st = { canvas, ctx, w: 0, h: 0, draw: opts.draw, redraw: () => {} };
    const box = canvas.parentElement;
    function size() {
      const w = Math.max(200, box.clientWidth);
      const h = opts.height ? (typeof opts.height === "function" ? opts.height(w) : opts.height) : Math.round(w * (opts.aspect || 0.56));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      st.w = w; st.h = h;
    }
    st.redraw = () => { ctx.clearRect(0, 0, st.w, st.h); if (st.draw) st.draw(ctx, st.w, st.h); };
    size();
    if (window.ResizeObserver) {
      let last = st.w;
      new ResizeObserver(() => { const w = Math.max(200, box.clientWidth); if (Math.abs(w - last) > 1) { last = w; size(); st.redraw(); } }).observe(box);
    }
    MA.onTheme(st.redraw);
    /** 클릭 좌표(CSS px) */
    st.on = (type, fn) => canvas.addEventListener(type, (e) => { const r = canvas.getBoundingClientRect(); fn(e.clientX - r.left, e.clientY - r.top, e); });
    return st;
  };
  /** 보이는 동안만 도는 애니메이션 루프 */
  MA.loop = (el, fn) => {
    let raf = 0, last = 0, visible = true, running = false;
    const tick = (t) => {
      const dt = Math.min(0.05, (t - (last || t)) / 1000);
      last = t;
      fn(dt, t / 1000);
      raf = requestAnimationFrame(tick);
    };
    const api = {
      start() { if (running) return; running = true; if (visible) { last = 0; raf = requestAnimationFrame(tick); } },
      stop() { running = false; cancelAnimationFrame(raf); },
      get running() { return running; },
    };
    if (window.IntersectionObserver) {
      new IntersectionObserver((es) => {
        visible = es[0].isIntersecting;
        cancelAnimationFrame(raf);
        if (visible && running) { last = 0; raf = requestAnimationFrame(tick); }
      }).observe(el);
    }
    return api;
  };
  MA.reduced = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  /** 축과 격자. 반환값 {X,Y,box} */
  MA.axes = (ctx, o) => {
    const b = o.box; // {l,t,r,b} 픽셀 경계
    const [x0, x1] = o.x, [y0, y1] = o.y;
    const lx = o.logx, ly = o.logy;
    const tx = (v) => (lx ? Math.log10(v) : v), ty = (v) => (ly ? Math.log10(v) : v);
    const X = (v) => b.l + ((tx(v) - tx(x0)) / (tx(x1) - tx(x0))) * (b.r - b.l);
    const Y = (v) => b.b - ((ty(v) - ty(y0)) / (ty(y1) - ty(y0))) * (b.b - b.t);
    ctx.save();
    ctx.lineWidth = 1;
    ctx.font = "11px " + MA.monoFont();
    ctx.fillStyle = MA.col("text-faint");
    (o.xt || []).forEach((v) => {
      const px = X(v);
      ctx.strokeStyle = MA.col("grid");
      ctx.beginPath(); ctx.moveTo(px, b.t); ctx.lineTo(px, b.b); ctx.stroke();
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(o.xf ? o.xf(v) : v, px, b.b + 5);
    });
    let maxW = 0;
    (o.yt || []).forEach((v) => {
      const py = Y(v);
      maxW = Math.max(maxW, ctx.measureText(String(o.yf ? o.yf(v) : v)).width);
      ctx.strokeStyle = MA.col("grid");
      ctx.beginPath(); ctx.moveTo(b.l, py); ctx.lineTo(b.r, py); ctx.stroke();
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText(o.yf ? o.yf(v) : v, b.l - 6, py);
    });
    ctx.strokeStyle = MA.col("axis");
    ctx.beginPath(); ctx.moveTo(b.l, b.t); ctx.lineTo(b.l, b.b); ctx.lineTo(b.r, b.b); ctx.stroke();
    ctx.fillStyle = MA.col("text-dim");
    ctx.font = "12px " + MA.bodyFont();
    if (o.xl) { ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText(o.xl, (b.l + b.r) / 2, b.b + 22); }
    if (o.yl) { ctx.save(); ctx.translate(Math.max(8, Math.min(b.l - (o.ylOff || 40), b.l - 15 - maxW)), (b.t + b.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(o.yl, 0, 0); ctx.restore(); }
    ctx.restore();
    return { X, Y, box: b };
  };
  let fontCache = null;
  MA.bodyFont = () => (fontCache || (fontCache = [getComputedStyle(document.body).getPropertyValue("--font"), getComputedStyle(document.body).getPropertyValue("--mono")]))[0];
  MA.monoFont = () => (MA.bodyFont(), fontCache[1]);
  MA.line = (ctx, pts, color, width = 2, dash) => {
    if (!pts.length) return;
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = "round";
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.restore();
  };
  MA.text = (ctx, s, x, y, o = {}) => {
    ctx.save();
    ctx.fillStyle = o.color || MA.col("text");
    ctx.font = `${o.weight || 400} ${o.size || 12}px ${o.mono ? MA.monoFont() : MA.bodyFont()}`;
    ctx.textAlign = o.align || "left";
    ctx.textBaseline = o.base || "middle";
    ctx.fillText(s, x, y);
    ctx.restore();
  };
  MA.rrect = (ctx, x, y, w, h, r) => {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };
  /** 에이전트 노드: 원 + 라벨. role은 MA.ROLE 키 또는 CSS 변수 이름 */
  MA.node = (ctx, x, y, r, role, label, o = {}) => {
    const col = MA.rc(role);
    ctx.save();
    if (o.glow) { ctx.fillStyle = MA.alpha(col, 0.18 * o.glow); ctx.beginPath(); ctx.arc(x, y, r + 9 * o.glow, 0, 7); ctx.fill(); }
    ctx.globalAlpha = o.dim ? 0.3 : 1;
    ctx.fillStyle = MA.col("bg-elev"); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    ctx.fillStyle = MA.alpha(col, o.fill != null ? o.fill : 0.16); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = o.lw || 2; if (o.dash) ctx.setLineDash(o.dash); ctx.stroke();
    ctx.restore();
    if (label != null) MA.text(ctx, label, x, y + (o.below ? r + 11 : 0), { size: o.size || 11.5, weight: 700, align: "center", color: o.dim ? MA.col("text-faint") : (o.below ? MA.col("text-dim") : MA.col("text")) });
  };
  /** 두 점 사이 화살표 (반지름만큼 줄여서) */
  MA.arrow = (ctx, x1, y1, x2, y2, color, o = {}) => {
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    const s = o.r1 || 0, e = o.r2 || 0;
    const ax = x1 + ux * s, ay = y1 + uy * s, bx = x2 - ux * e, by = y2 - uy * e;
    ctx.save();
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = o.w || 1.6;
    if (o.dash) ctx.setLineDash(o.dash);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.setLineDash([]);
    if (o.head !== false) { const hs = o.hs || 7; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - ux * hs - uy * hs * 0.55, by - uy * hs + ux * hs * 0.55); ctx.lineTo(bx - ux * hs + uy * hs * 0.55, by - uy * hs - ux * hs * 0.55); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  };
  /** 막대 하나 (값 0..1, 가로) */
  MA.hbar = (ctx, x, y, w, h, v, color, o = {}) => {
    ctx.fillStyle = MA.col("surface-2"); MA.rrect(ctx, x, y, w, h, h / 2); ctx.fill();
    ctx.fillStyle = color; MA.rrect(ctx, x, y, Math.max(h, w * MA.clamp(v, 0, 1)), h, h / 2); if (v > 0) ctx.fill();
    if (o.label) MA.text(ctx, o.label, x + w + 6, y + h / 2, { size: 11, mono: true, color: MA.col("text-dim") });
  };
  /** 레이더 차트: axes=[{label, v, target}] */
  MA.radar = (ctx, cx, cy, R, axes, o = {}) => {
    const n = axes.length, ang = (i) => -Math.PI / 2 + (i / n) * Math.PI * 2;
    ctx.save();
    for (let k = 1; k <= 4; k++) {
      ctx.strokeStyle = MA.col("grid"); ctx.beginPath();
      for (let i = 0; i <= n; i++) { const a = ang(i % n), r = (R * k) / 4; i ? ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
      ctx.stroke();
    }
    axes.forEach((ax, i) => {
      const a = ang(i);
      ctx.strokeStyle = MA.col("grid"); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
      MA.text(ctx, ax.label, cx + Math.cos(a) * (R + 18), cy + Math.sin(a) * (R + 14), { size: 12, weight: 700, align: Math.abs(Math.cos(a)) < 0.2 ? "center" : Math.cos(a) > 0 ? "left" : "right", color: MA.col("text-dim") });
    });
    const poly = (key, color, fill, dash) => {
      ctx.beginPath();
      axes.forEach((ax, i) => { const a = ang(i), r = R * MA.clamp(ax[key], 0, 1); i ? ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); });
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
    };
    if (axes[0].target != null) poly("target", MA.col("text-faint"), null, [5, 4]);
    poly("v", o.color || MA.col("accent"), MA.alpha(o.color || MA.col("accent"), 0.16));
    ctx.restore();
  };

  /* ---------------------------------------------------------------- shell */
  function root() { return document.body.dataset.root || ""; }
  function buildShell() {
    const r = root();
    const home = r || "./";
    const cur = document.body.dataset.chapter;
    const ch = MA.CHAPTERS.find((c) => c.slug === cur);
    const chapterHref = (c) => `${r}chapters/${c.slug}.html`;

    const top = document.createElement("header");
    top.className = "ca-top";
    top.innerHTML = `<div class="in">
      <button class="ca-iconbtn" id="ca-menu" aria-label="전체 목차 열기" aria-expanded="false">☰</button>
      <a class="ca-brand" href="${home}"><img src="${r}favicon.svg" alt="">${MA.BRAND}</a>
      ${ch ? `<span class="ca-crumb"><b>${ch.num}</b>${ch.title}</span>` : `<span class="ca-crumb">멀티에이전트 시스템 설계 교과서</span>`}
      <span class="sp"></span>
      <div class="hb-search"><input type="search" id="hb-q" placeholder="장 · 용어 검색" aria-label="이 책에서 장과 용어 검색" autocomplete="off"><div class="hb-results" id="hb-res" hidden></div></div>
      <a class="ca-iconbtn ca-shelf" href="${r}../">← <span class="lbl">전체 서가</span></a>
      <button class="ca-iconbtn" id="ca-theme" aria-label="밝게/어둡게 전환">◐</button>
    </div>`;
    document.body.prepend(top);
    const skip = document.createElement("a");
    skip.className = "skip"; skip.href = "#content"; skip.textContent = "본문으로";
    document.body.prepend(skip);

    const drawer = document.createElement("div");
    drawer.className = "ca-drawer";
    drawer.innerHTML = `<div class="scrim"></div><nav class="panel" aria-label="장 목록"><h4>CHAPTERS</h4>
      <a href="${home}"><span>00</span>표지 · 전체 그림</a>
      ${MA.CHAPTERS.map((c) => `<a href="${chapterHref(c)}" class="${c.slug === cur ? "cur" : ""}"><span>${c.num}</span>${c.title}</a>`).join("")}
      <h4 style="margin-top:20px">SHELF</h4><a href="${r}../"><span>↩</span>열린 실험서가로 돌아가기</a></nav>`;
    document.body.appendChild(drawer);
    const menu = MA.el("ca-menu");
    const setOpen = (v) => { drawer.classList.toggle("open", v); menu.setAttribute("aria-expanded", v); };
    menu.addEventListener("click", () => setOpen(true));
    drawer.querySelector(".scrim").addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    MA.el("ca-theme").addEventListener("click", MA.toggleTheme);

    const main = document.querySelector("main");
    if (main && !main.id) main.id = "content";
    initSearch(r);
    // 실험 제목 옆에 바로가기 링크
    MA.$$(".sim[id]").forEach((s) => {
      const h = s.querySelector(".sim-head");
      if (h && !h.querySelector(".sim-link")) h.insertAdjacentHTML("beforeend", `<a class="sim-link" href="#${s.id}" title="이 실험으로 가는 링크" aria-label="이 실험으로 가는 링크">#</a>`);
    });

    // 장 페이지: 오른쪽 목차와 이전/다음 장
    const layout = document.querySelector(".ca-layout");
    if (layout && main) {
      const secs = MA.$$("main.chapter > section[id]");
      const toc = document.createElement("aside");
      toc.className = "ca-toc";
      toc.innerHTML = "<h4>ON THIS PAGE</h4>" + secs.map((s) => {
        const h = s.querySelector("h2");
        return h ? `<a href="#${s.id}">${h.textContent.replace(/^\d+\.\d+\s*/, "")}</a>` : "";
      }).join("");
      layout.appendChild(toc);
      const links = MA.$$("a", toc);
      if (window.IntersectionObserver) {
        const io = new IntersectionObserver((es) => {
          es.forEach((e) => {
            if (e.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
          });
        }, { rootMargin: "-20% 0px -70% 0px" });
        secs.forEach((s) => io.observe(s));
      }
      // 절 번호
      if (ch) secs.forEach((s, i) => {
        const h = s.querySelector("h2");
        if (h && !s.classList.contains("keypoints") && !s.classList.contains("quiz-sec")) h.insertAdjacentHTML("afterbegin", `<span class="h-num">${+ch.num}.${i + 1}</span>`);
      });
      if (ch) {
        const i = MA.CHAPTERS.indexOf(ch);
        const prev = MA.CHAPTERS[i - 1], next = MA.CHAPTERS[i + 1];
        const pager = document.createElement("nav");
        pager.className = "pager";
        pager.setAttribute("aria-label", "장 이동");
        pager.innerHTML = (prev ? `<a href="${chapterHref(prev)}"><span>← CH.${prev.num}</span>${prev.title}</a>` : `<a href="${home}"><span>← 표지</span>전체 그림</a>`) +
          (next ? `<a class="next" href="${chapterHref(next)}"><span>CH.${next.num} →</span>${next.title}</a>` : `<a class="next" href="${home}"><span>표지 →</span>처음으로 돌아가기</a>`);
        main.appendChild(pager);
      }
    }
    const foot = document.createElement("footer");
    foot.className = "ca-foot";
    foot.innerHTML = `<b>${MA.BRAND}</b> · 그림과 실험으로 배우는 멀티에이전트 시스템 설계 · <a href="${r}../">열린 실험서가</a> · <a href="https://github.com/jsg1504/books">GitHub ↗</a><br>실험의 수치는 개념을 보이기 위한 단순화된 모형이며 특정 제품의 측정값이 아닙니다.`;
    document.body.appendChild(foot);
  }

  /* ---------------------------------------------------------------- search */
  function initSearch(r) {
    const q = MA.el("hb-q"), box = MA.el("hb-res");
    if (!q) return;
    const items = () => {
      const ch = MA.CHAPTERS.map((c) => ({ k: "CH." + c.num, t: c.title, d: c.desc, href: `${r}chapters/${c.slug}.html` }));
      const gl = MA.GLOSSARY.map((g) => ({ k: "용어", t: g[0] + (g[1] ? " · " + g[1] : ""), d: g[2], href: `${r}chapters/${g[3]}.html` }));
      return ch.concat(gl);
    };
    const render = () => {
      const v = q.value.trim().toLowerCase();
      if (!v) { box.hidden = true; return; }
      const hit = items().filter((it) => (it.t + " " + it.d).toLowerCase().includes(v)).slice(0, 8);
      box.innerHTML = hit.length ? hit.map((it) => `<a href="${it.href}"><span>${it.k}</span><b>${MA.esc(it.t)}</b><small>${MA.esc(it.d)}</small></a>`).join("") : `<div class="none">“${MA.esc(q.value)}”에 맞는 항목이 없습니다</div>`;
      box.hidden = false;
    };
    q.addEventListener("input", render);
    q.addEventListener("focus", render);
    q.addEventListener("keydown", (e) => { if (e.key === "Enter") { const a = box.querySelector("a"); if (a) location.href = a.href; } if (e.key === "Escape") { q.value = ""; render(); q.blur(); } });
    document.addEventListener("click", (e) => { if (!e.target.closest(".hb-search")) box.hidden = true; });
  }

  function initQuiz() {
    MA.$$(".quiz").forEach((quiz) => {
      const qs = MA.$$(".quiz-q", quiz);
      let score = 0, answered = 0;
      const sc = document.createElement("div");
      sc.className = "quiz-score";
      sc.textContent = `0 / ${qs.length}`;
      quiz.appendChild(sc);
      qs.forEach((q) => {
        MA.$$(".opt", q).forEach((b) => b.addEventListener("click", () => {
          if (q.classList.contains("done")) return;
          q.classList.add("done");
          const ok = b.hasAttribute("data-correct");
          MA.$$(".opt", q).forEach((o) => { if (o.hasAttribute("data-correct")) o.classList.add("right"); });
          if (!ok) b.classList.add("wrong");
          answered++; if (ok) score++;
          sc.textContent = `${score} / ${qs.length}` + (answered === qs.length ? (score === qs.length ? " · 모두 맞혔습니다" : " · 해설을 확인해 보세요") : "");
        }));
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildShell();
    initQuiz();
  });
  // 상단 바·목차·캔버스가 붙으며 레이아웃이 바뀌므로, 다 그려진 뒤 해시 위치로 다시 이동한다
  window.addEventListener("load", () => {
    if (location.hash.length < 2) return;
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) target.scrollIntoView({ block: "start", behavior: "instant" });
  });
})();
