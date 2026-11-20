/* WikiBook 공통 스크립트: 테마, 상단 바, 목차, 퀴즈, 캔버스/차트/그래프 도우미.
   <head>에서 동기 로드한다. 장 본문의 인라인 스크립트가 WK.* 도우미를 바로 쓸 수 있도록
   도우미는 즉시 정의하고, 화면 골격은 DOMContentLoaded에서 붙인다. */
(function () {
  "use strict";
  const WK = (window.WK = {});

  WK.CHAPTERS = [
    { slug: "why", num: "01", title: "왜 LLM 위키인가", desc: "질문마다 다시 찾는 검색과 한 번 정리해 두는 위키. 지식이 쌓이는 쪽과 매번 사라지는 쪽.", tags: ["sim", "anim", "game"] },
    { slug: "anatomy", num: "02", title: "위키의 해부: 원천, 위키, 스키마", desc: "건드리지 않는 원천, 에이전트가 소유하는 위키, 규칙을 적은 스키마. index.md와 log.md.", tags: ["viz", "sim", "game"] },
    { slug: "ingest", num: "03", title: "수집: 원천 하나가 열 페이지를 바꾼다", desc: "새 자료를 읽고 요약 페이지를 쓰고, 관련 페이지를 고치고, 색인과 기록을 남기는 한 바퀴.", tags: ["anim", "sim", "game"] },
    { slug: "pages", num: "04", title: "페이지 설계: 원자성과 구조", desc: "엔티티·개념·요약·비교 페이지, 한 페이지에 한 생각, 머리말 메타데이터, 페이지 크기의 경제학.", tags: ["sim", "game"] },
    { slug: "links", num: "05", title: "링크와 그래프", desc: "위키링크와 백링크, 허브와 고아 페이지, 몇 번 건너면 닿는가. 그래프로 보는 지식.", tags: ["viz", "sim", "game"] },
    { slug: "query", num: "06", title: "질의: 색인을 읽고 페이지를 연다", desc: "에이전트가 위키를 탐색하는 방식, 토큰 예산 안에서 고르기, 좋은 답을 다시 위키로.", tags: ["anim", "sim", "game"] },
    { slug: "search", num: "07", title: "검색 도구: grep에서 하이브리드까지", desc: "BM25와 임베딩을 직접 돌려 보고, 순위 융합을 계산하고, 색인 하나로 버티는 규모를 잰다.", tags: ["sim", "viz"] },
    { slug: "lint", num: "08", title: "린트: 위키의 건강 검진", desc: "모순, 낡은 주장, 고아 페이지, 빠진 상호 참조. 얼마나 자주 점검해야 위키가 썩지 않는가.", tags: ["sim", "game"] },
    { slug: "provenance", num: "09", title: "출처와 신뢰: 오류는 복리로 번진다", desc: "인용과 출처 추적, 틀린 페이지에 기대는 페이지, 지식의 반감기, 주장과 근거 대조.", tags: ["sim", "game"] },
    { slug: "schema", num: "10", title: "스키마와 에이전트 지식", desc: "CLAUDE.md·AGENTS.md, 스킬과 점진적 공개, 규칙 하나가 위키 전체의 일관성을 바꾸는 방식.", tags: ["sim", "game"] },
    { slug: "team", num: "11", title: "함께 쓰는 위키: 여러 에이전트와 사람", desc: "동시 편집 충돌, 오염된 원천의 전파와 격리, 누가 어디에 쓸 수 있는가.", tags: ["sim", "game"] },
    { slug: "ops", num: "12", title: "운영 플레이북과 용어집", desc: "30일 위키 키우기 게임, 설계 플레이그라운드, 용어집과 종합 퀴즈.", tags: ["game", "sim", "viz"] },
  ];
  /* 용어집: [용어, 영어, 설명, 장] — 상단 검색과 12장 용어집이 함께 쓴다 */
  WK.GLOSSARY = [
    ["LLM 위키", "LLM wiki", "LLM 에이전트가 원천 자료를 읽어 직접 쓰고 고치며 유지하는, 서로 링크된 마크다운 페이지 묶음. 지식을 질문 때마다 다시 찾지 않고 한 번 정리해 쌓아 둔다.", "why"],
    ["검색 증강 생성", "RAG", "질문이 올 때마다 원문 조각을 검색해 컨텍스트에 넣고 답하는 방식. 종합은 매번 처음부터 다시 한다.", "why"],
    ["지식 컴파일", "knowledge compilation", "흩어진 원문을 읽는 시점에 미리 요약·연결·정리해, 질의 시점의 일을 줄이는 것. 코드를 미리 컴파일하는 것에 빗댄 말.", "why"],
    ["메멕스", "Memex", "1945년 버니바 부시가 상상한 개인 지식 장치. 문서 사이의 연상 경로를 저장한다. LLM 위키의 먼 조상.", "why"],
    ["원천 자료", "raw sources", "논문, 기사, 회의록, 코드처럼 위키의 근거가 되는 원문. 에이전트는 읽기만 하고 고치지 않는다.", "anatomy"],
    ["스키마", "schema", "위키의 구조, 페이지 형식, 수집·질의·린트 절차를 적은 지침 파일. CLAUDE.md나 AGENTS.md가 그 역할을 한다.", "anatomy"],
    ["색인 페이지", "index.md", "모든 페이지를 한 줄 요약과 함께 분류해 둔 목차. 에이전트가 질의할 때 가장 먼저 읽는다.", "anatomy"],
    ["기록 페이지", "log.md", "수집·질의·린트를 시간순으로 덧붙이는 기록. 일정한 머리말 형식이면 grep으로 최근 활동을 뽑을 수 있다.", "anatomy"],
    ["수집", "ingest", "원천 하나를 읽고 요약 페이지를 만들고, 관련 엔티티·개념 페이지를 고치고, 색인과 기록을 갱신하는 작업.", "ingest"],
    ["팬아웃", "fan-out", "수집 한 번이 건드리는 페이지의 수. 위키가 클수록, 원천이 다루는 개체가 많을수록 커진다.", "ingest"],
    ["엔티티 페이지", "entity page", "사람, 조직, 제품, 장소처럼 이름이 있는 대상 하나를 다루는 페이지.", "pages"],
    ["개념 페이지", "concept page", "기법, 이론, 용어처럼 추상적인 생각 하나를 다루는 페이지.", "pages"],
    ["원자적 노트", "atomic note", "한 페이지에 한 생각만 담는 원칙. 링크와 재사용이 쉬워진다. 제텔카스텐의 핵심 규칙.", "pages"],
    ["머리말", "frontmatter", "페이지 맨 위의 YAML 메타데이터. 유형, 태그, 출처, 갱신일 등을 기계가 읽을 수 있게 적는다.", "pages"],
    ["위키링크", "wikilink", "[[페이지 이름]] 형식의 내부 링크. 대상 페이지가 없으면 앞으로 써야 할 페이지 표시가 된다.", "links"],
    ["백링크", "backlink", "이 페이지를 가리키는 다른 페이지들의 목록. 링크를 거꾸로 따라간다.", "links"],
    ["고아 페이지", "orphan page", "아무 페이지도 가리키지 않는 페이지. 색인 말고는 찾아올 길이 없다.", "links"],
    ["허브", "hub", "링크가 많이 몰리는 중심 페이지. 탐색의 지름길이자, 틀리면 피해가 큰 지점.", "links"],
    ["답변 환류", "filing answers back", "질의로 얻은 좋은 답과 비교표를 새 위키 페이지로 저장하는 것. 탐색도 지식으로 쌓인다.", "query"],
    ["에이전트 탐색", "agentic search", "에이전트가 색인을 읽고, 파일을 열고, 링크를 따라가며 스스로 필요한 정보를 찾는 방식.", "query"],
    ["BM25", "BM25", "단어 빈도와 문서 길이를 보정한 고전적인 키워드 검색 점수. 정확한 용어가 있을 때 강하다.", "search"],
    ["임베딩 검색", "embedding search", "문장을 벡터로 바꿔 의미가 가까운 문서를 찾는 검색. 다른 말로 표현된 같은 뜻을 잡는다.", "search"],
    ["역순위 융합", "reciprocal rank fusion", "여러 검색 결과의 순위를 1/(k + 순위)로 합쳐 하나의 순위를 만드는 방법. 보통 k = 60.", "search"],
    ["하이브리드 검색", "hybrid search", "키워드 검색과 임베딩 검색을 함께 돌려 결과를 융합하는 검색.", "search"],
    ["린트", "lint", "위키 전체를 점검해 모순, 낡은 주장, 고아 페이지, 빠진 링크, 근거 없는 주장을 찾아 고치는 작업.", "lint"],
    ["낡은 주장", "stale claim", "새 원천이 들어와 더 이상 맞지 않게 된 기존 페이지의 내용.", "lint"],
    ["출처 추적", "provenance", "위키의 각 주장이 어느 원천의 어느 부분에서 왔는지 따라갈 수 있게 남기는 것.", "provenance"],
    ["오류 전파", "error propagation", "틀린 페이지를 근거로 새 페이지와 답이 쓰이며 오류가 위키 전체로 번지는 현상.", "provenance"],
    ["지식 반감기", "knowledge half-life", "한 분야의 주장이 절반쯤 낡는 데 걸리는 시간. 갱신 주기를 정하는 기준.", "provenance"],
    ["에이전트 지침 파일", "CLAUDE.md · AGENTS.md", "에이전트가 작업을 시작할 때 읽는 저장소 규칙 파일. 위키에서는 스키마가 된다.", "schema"],
    ["스킬", "agent skill", "이름·설명과 지침·스크립트를 묶은 폴더. 필요할 때만 본문을 읽어 들이는 절차적 지식.", "schema"],
    ["점진적 공개", "progressive disclosure", "처음에는 짧은 설명만 보여 주고, 필요해질 때 본문과 부속 파일을 차례로 읽게 하는 설계.", "schema"],
    ["편집 충돌", "edit conflict", "두 작성자가 같은 페이지를 동시에 고쳐 한쪽 변경이 사라지거나 병합이 필요한 상황.", "team"],
    ["격리 구역", "quarantine", "검증되지 않은 원천과 그 원천에서 나온 페이지를 본 위키와 분리해 두는 영역.", "team"],
    ["간접 프롬프트 주입", "indirect prompt injection", "에이전트가 읽는 원천 안에 숨은 지시가 에이전트의 행동을 바꾸는 공격.", "team"],
    ["지식 그래프", "knowledge graph", "개체를 노드, 관계를 간선으로 표현한 구조. 위키의 링크 그래프는 느슨한 지식 그래프다.", "links"],
    ["컨텍스트 엔지니어링", "context engineering", "모델이 일을 잘하도록 컨텍스트 창에 무엇을, 어떤 순서로, 얼마나 넣을지 설계하는 일.", "schema"],
  ];
  WK.BRAND = "WikiBook";

  /* ---------------------------------------------------------------- theme */
  const THEME_KEY = "wikibook-theme";
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) document.documentElement.dataset.theme = saved;
  } catch (e) { /* storage blocked */ }
  const themeCbs = [];
  let colorCache = null;
  WK.onTheme = (cb) => themeCbs.push(cb);
  function themeChanged() { colorCache = null; themeCbs.forEach((cb) => { try { cb(); } catch (e) { console.error(e); } }); }
  WK.isDark = () => {
    const t = document.documentElement.dataset.theme;
    if (t) return t === "dark";
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  };
  WK.toggleTheme = () => {
    const next = WK.isDark() ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    themeChanged();
  };
  if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", themeChanged);

  /** CSS 변수 색을 읽는다. WK.col("accent") 또는 WK.col("--accent") */
  WK.col = (name) => {
    if (!colorCache) colorCache = {};
    const key = name.startsWith("--") ? name : "--" + name;
    if (!(key in colorCache)) colorCache[key] = getComputedStyle(document.documentElement).getPropertyValue(key).trim() || "#888888";
    return colorCache[key];
  };
  /** 색에 투명도를 준다 (#rrggbb만) */
  WK.alpha = (hex, a) => {
    const h = String(hex).replace("#", "");
    if (h.length !== 6) return hex;
    return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
  };
  /* 색 언어: 역할 → CSS 변수 */
  WK.ROLE = { run: "accent", human: "accent-2", ctx: "ctx", mem: "state", ok: "env", cost: "tool", risk: "guard", idle: "user" };
  WK.rc = (role) => WK.col(WK.ROLE[role] || role);

  /* ---------------------------------------------------------------- math */
  WK.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  WK.lerp = (a, b, t) => a + (b - a) * t;
  WK.rng = (seed) => {
    let s = seed >>> 0 || 1;
    return () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  WK.fmt = (v, d = 0) => {
    if (!isFinite(v)) return "—";
    return Number(v).toLocaleString("ko-KR", { minimumFractionDigits: d, maximumFractionDigits: d });
  };
  WK.si = (v) => {
    const a = Math.abs(v);
    if (a >= 1e6) return (v / 1e6).toFixed(a >= 1e7 ? 0 : 1) + "M";
    if (a >= 1e3) return (v / 1e3).toFixed(a >= 1e4 ? 0 : 1) + "K";
    return String(Math.round(v));
  };
  WK.pct = (v, d = 0) => (isFinite(v) ? (v * 100).toFixed(d) + "%" : "—");
  WK.ease = (x) => { x = WK.clamp(x, 0, 1); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
  /** 이항계수와 이항분포 꼬리 (투표 계산용) */
  WK.binom = (n, k) => { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r; };
  WK.normal = (r) => { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

  /* ---------------------------------------------------------------- DOM */
  WK.$ = (s, r = document) => r.querySelector(s);
  WK.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  WK.el = (id) => document.getElementById(id);
  WK.val = (id) => +document.getElementById(id).value;
  WK.set = (id, txt, cls) => {
    const e = document.getElementById(id);
    if (!e) return;
    e.textContent = txt;
    if (cls !== undefined) { e.classList.remove("good", "bad", "warn"); if (cls) e.classList.add(cls); }
  };
  WK.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  /** range 입력들을 render에 연결하고, id+"-out" output에 값을 표시한다. */
  WK.wire = (ids, fn, fmts = {}) => {
    const up = () => {
      ids.forEach((id) => {
        const o = document.getElementById(id + "-out");
        if (o) o.textContent = fmts[id] ? fmts[id](WK.val(id)) : document.getElementById(id).value;
      });
      fn();
    };
    ids.forEach((id) => document.getElementById(id).addEventListener("input", up));
    up();
    return up;
  };
  /** .seg 버튼 묶음. data-v 값을 콜백에 넘긴다. */
  WK.seg = (id, cb) => {
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
  WK.canvas = (canvas, opts = {}) => {
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
    WK.onTheme(st.redraw);
    /** 클릭 좌표(CSS px) */
    st.on = (type, fn) => canvas.addEventListener(type, (e) => { const r = canvas.getBoundingClientRect(); fn(e.clientX - r.left, e.clientY - r.top, e); });
    return st;
  };
  /** 보이는 동안만 도는 애니메이션 루프 */
  WK.loop = (el, fn) => {
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
  WK.reduced = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  /** 축과 격자. 반환값 {X,Y,box} */
  WK.axes = (ctx, o) => {
    const b = o.box; // {l,t,r,b} 픽셀 경계
    const [x0, x1] = o.x, [y0, y1] = o.y;
    const lx = o.logx, ly = o.logy;
    const tx = (v) => (lx ? Math.log10(v) : v), ty = (v) => (ly ? Math.log10(v) : v);
    const X = (v) => b.l + ((tx(v) - tx(x0)) / (tx(x1) - tx(x0))) * (b.r - b.l);
    const Y = (v) => b.b - ((ty(v) - ty(y0)) / (ty(y1) - ty(y0))) * (b.b - b.t);
    ctx.save();
    ctx.lineWidth = 1;
    ctx.font = "11px " + WK.monoFont();
    ctx.fillStyle = WK.col("text-faint");
    (o.xt || []).forEach((v) => {
      const px = X(v);
      ctx.strokeStyle = WK.col("grid");
      ctx.beginPath(); ctx.moveTo(px, b.t); ctx.lineTo(px, b.b); ctx.stroke();
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(o.xf ? o.xf(v) : v, px, b.b + 5);
    });
    let maxW = 0;
    (o.yt || []).forEach((v) => {
      const py = Y(v);
      maxW = Math.max(maxW, ctx.measureText(String(o.yf ? o.yf(v) : v)).width);
      ctx.strokeStyle = WK.col("grid");
      ctx.beginPath(); ctx.moveTo(b.l, py); ctx.lineTo(b.r, py); ctx.stroke();
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText(o.yf ? o.yf(v) : v, b.l - 6, py);
    });
    ctx.strokeStyle = WK.col("axis");
    ctx.beginPath(); ctx.moveTo(b.l, b.t); ctx.lineTo(b.l, b.b); ctx.lineTo(b.r, b.b); ctx.stroke();
    ctx.fillStyle = WK.col("text-dim");
    ctx.font = "12px " + WK.bodyFont();
    if (o.xl) { ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText(o.xl, (b.l + b.r) / 2, b.b + 22); }
    if (o.yl) { ctx.save(); ctx.translate(Math.max(8, Math.min(b.l - (o.ylOff || 40), b.l - 15 - maxW)), (b.t + b.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(o.yl, 0, 0); ctx.restore(); }
    ctx.restore();
    return { X, Y, box: b };
  };
  let fontCache = null;
  WK.bodyFont = () => (fontCache || (fontCache = [getComputedStyle(document.body).getPropertyValue("--font"), getComputedStyle(document.body).getPropertyValue("--mono")]))[0];
  WK.monoFont = () => (WK.bodyFont(), fontCache[1]);
  WK.line = (ctx, pts, color, width = 2, dash) => {
    if (!pts.length) return;
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = "round";
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.restore();
  };
  WK.text = (ctx, s, x, y, o = {}) => {
    ctx.save();
    ctx.fillStyle = o.color || WK.col("text");
    ctx.font = `${o.weight || 400} ${o.size || 12}px ${o.mono ? WK.monoFont() : WK.bodyFont()}`;
    ctx.textAlign = o.align || "left";
    ctx.textBaseline = o.base || "middle";
    ctx.fillText(s, x, y);
    ctx.restore();
  };
  WK.rrect = (ctx, x, y, w, h, r) => {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };
  /** 에이전트 노드: 원 + 라벨. role은 WK.ROLE 키 또는 CSS 변수 이름 */
  WK.node = (ctx, x, y, r, role, label, o = {}) => {
    const col = WK.rc(role);
    ctx.save();
    if (o.glow) { ctx.fillStyle = WK.alpha(col, 0.18 * o.glow); ctx.beginPath(); ctx.arc(x, y, r + 9 * o.glow, 0, 7); ctx.fill(); }
    ctx.globalAlpha = o.dim ? 0.3 : 1;
    ctx.fillStyle = WK.col("bg-elev"); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    ctx.fillStyle = WK.alpha(col, o.fill != null ? o.fill : 0.16); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = o.lw || 2; if (o.dash) ctx.setLineDash(o.dash); ctx.stroke();
    ctx.restore();
    if (label != null) WK.text(ctx, label, x, y + (o.below ? r + 11 : 0), { size: o.size || 11.5, weight: 700, align: "center", color: o.dim ? WK.col("text-faint") : (o.below ? WK.col("text-dim") : WK.col("text")) });
  };
  /** 두 점 사이 화살표 (반지름만큼 줄여서) */
  WK.arrow = (ctx, x1, y1, x2, y2, color, o = {}) => {
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
  WK.hbar = (ctx, x, y, w, h, v, color, o = {}) => {
    ctx.fillStyle = WK.col("surface-2"); WK.rrect(ctx, x, y, w, h, h / 2); ctx.fill();
    ctx.fillStyle = color; WK.rrect(ctx, x, y, Math.max(h, w * WK.clamp(v, 0, 1)), h, h / 2); if (v > 0) ctx.fill();
    if (o.label) WK.text(ctx, o.label, x + w + 6, y + h / 2, { size: 11, mono: true, color: WK.col("text-dim") });
  };
  /** 레이더 차트: axes=[{label, v, target}] */
  WK.radar = (ctx, cx, cy, R, axes, o = {}) => {
    const n = axes.length, ang = (i) => -Math.PI / 2 + (i / n) * Math.PI * 2;
    ctx.save();
    for (let k = 1; k <= 4; k++) {
      ctx.strokeStyle = WK.col("grid"); ctx.beginPath();
      for (let i = 0; i <= n; i++) { const a = ang(i % n), r = (R * k) / 4; i ? ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
      ctx.stroke();
    }
    axes.forEach((ax, i) => {
      const a = ang(i);
      ctx.strokeStyle = WK.col("grid"); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
      WK.text(ctx, ax.label, cx + Math.cos(a) * (R + 18), cy + Math.sin(a) * (R + 14), { size: 12, weight: 700, align: Math.abs(Math.cos(a)) < 0.2 ? "center" : Math.cos(a) > 0 ? "left" : "right", color: WK.col("text-dim") });
    });
    const poly = (key, color, fill, dash) => {
      ctx.beginPath();
      axes.forEach((ax, i) => { const a = ang(i), r = R * WK.clamp(ax[key], 0, 1); i ? ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); });
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
    };
    if (axes[0].target != null) poly("target", WK.col("text-faint"), null, [5, 4]);
    poly("v", o.color || WK.col("accent"), WK.alpha(o.color || WK.col("accent"), 0.16));
    ctx.restore();
  };

  /** 분류 게임: 카드 [문장, 정답, 해설]를 하나씩 보여 주고 .bins 버튼으로 답한다.
      o = {root, prefix, cards, names}. #prefix-card, -fb, -bar, -o1, -o2 요소가 필요하다. */
  WK.sortGame = (o) => {
    const P = (s) => document.getElementById(o.prefix + "-" + s);
    const N = o.cards.length;
    let i = 0, score = 0, locked = false;
    function show() {
      if (i >= N) { P("card").innerHTML = `<small>완료</small><b>${score} / ${N}</b> 맞혔습니다. 다시 하려면 아무 버튼이나 누르세요.`; return; }
      P("card").innerHTML = `<small>상황 ${i + 1} / ${N}</small>${WK.esc(o.cards[i][0])}`;
    }
    WK.$$(`#${o.root} .bins button`).forEach((b) => b.addEventListener("click", () => {
      if (i >= N) { i = 0; score = 0; WK.set(o.prefix + "-o2", "0"); WK.set(o.prefix + "-o1", `0 / ${N}`); P("fb").textContent = "다시 시작합니다."; P("fb").style.removeProperty("--k"); P("bar").style.width = "0"; show(); return; }
      if (locked) return;
      const [, ans, why] = o.cards[i];
      const ok = b.dataset.v === ans;
      if (ok) score++;
      const fb = P("fb");
      fb.style.setProperty("--k", ok ? "var(--env)" : "var(--guard)");
      fb.innerHTML = `<b>${ok ? "맞았습니다" : "정답: " + o.names[ans]}</b> — ${WK.esc(why)}`;
      locked = true; i++;
      WK.set(o.prefix + "-o1", `${i} / ${N}`); WK.set(o.prefix + "-o2", String(score), score === i ? "good" : "");
      P("bar").style.width = (i / N) * 100 + "%";
      setTimeout(() => { locked = false; show(); }, 1200);
    }));
    WK.set(o.prefix + "-o1", `0 / ${N}`);
    show();
  };
  /** 재생 버튼: 누르면 step(dt)을 프레임마다 부르고, step이 false를 돌려주면 멈춘다. */
  WK.player = (btn, el, step, labels = ["▶ 재생", "❚❚ 멈춤"]) => {
    if (typeof btn === "string") btn = document.getElementById(btn);
    const lp = WK.loop(el, (dt) => { if (step(dt) === false) { lp.stop(); btn.textContent = labels[0]; } });
    btn.addEventListener("click", () => { if (lp.running) { lp.stop(); btn.textContent = labels[0]; } else { lp.start(); btn.textContent = labels[1]; } });
    return lp;
  };

  /* ---------------------------------------------------------------- shell */
  function root() { return document.body.dataset.root || ""; }
  function buildShell() {
    const r = root();
    const home = r || "./";
    const cur = document.body.dataset.chapter;
    const ch = WK.CHAPTERS.find((c) => c.slug === cur);
    const chapterHref = (c) => `${r}chapters/${c.slug}.html`;

    const top = document.createElement("header");
    top.className = "ca-top";
    top.innerHTML = `<div class="in">
      <button class="ca-iconbtn" id="ca-menu" aria-label="전체 목차 열기" aria-expanded="false">☰</button>
      <a class="ca-brand" href="${home}"><img src="${r}favicon.svg" alt="">${WK.BRAND}</a>
      ${ch ? `<span class="ca-crumb"><b>${ch.num}</b>${ch.title}</span>` : `<span class="ca-crumb">LLM 위키 · 에이전트 지식</span>`}
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
      ${WK.CHAPTERS.map((c) => `<a href="${chapterHref(c)}" class="${c.slug === cur ? "cur" : ""}"><span>${c.num}</span>${c.title}</a>`).join("")}
      <h4 style="margin-top:20px">SHELF</h4><a href="${r}../"><span>↩</span>열린 실험서가로 돌아가기</a></nav>`;
    document.body.appendChild(drawer);
    const menu = WK.el("ca-menu");
    const setOpen = (v) => { drawer.classList.toggle("open", v); menu.setAttribute("aria-expanded", v); };
    menu.addEventListener("click", () => setOpen(true));
    drawer.querySelector(".scrim").addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    WK.el("ca-theme").addEventListener("click", WK.toggleTheme);

    const main = document.querySelector("main");
    if (main && !main.id) main.id = "content";
    initSearch(r);
    // 실험 제목 옆에 바로가기 링크
    WK.$$(".sim[id]").forEach((s) => {
      const h = s.querySelector(".sim-head");
      if (h && !h.querySelector(".sim-link")) h.insertAdjacentHTML("beforeend", `<a class="sim-link" href="#${s.id}" title="이 실험으로 가는 링크" aria-label="이 실험으로 가는 링크">#</a>`);
    });

    // 장 페이지: 오른쪽 목차와 이전/다음 장
    const layout = document.querySelector(".ca-layout");
    if (layout && main) {
      const secs = WK.$$("main.chapter > section[id]");
      const toc = document.createElement("aside");
      toc.className = "ca-toc";
      toc.innerHTML = "<h4>ON THIS PAGE</h4>" + secs.map((s) => {
        const h = s.querySelector("h2");
        return h ? `<a href="#${s.id}">${h.textContent.replace(/^\d+\.\d+\s*/, "")}</a>` : "";
      }).join("");
      layout.appendChild(toc);
      const links = WK.$$("a", toc);
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
        const i = WK.CHAPTERS.indexOf(ch);
        const prev = WK.CHAPTERS[i - 1], next = WK.CHAPTERS[i + 1];
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
    foot.innerHTML = `<b>${WK.BRAND}</b> · 그림과 실험으로 배우는 LLM 위키와 에이전트 지식 · <a href="${r}../">열린 실험서가</a> · <a href="https://github.com/jsg1504/books">GitHub ↗</a><br>실험의 수치는 개념을 보이기 위한 단순화된 모형이며, 인용한 연구 수치 외에는 특정 제품의 측정값이 아닙니다.`;
    document.body.appendChild(foot);
  }

  /* ---------------------------------------------------------------- search */
  function initSearch(r) {
    const q = WK.el("hb-q"), box = WK.el("hb-res");
    if (!q) return;
    const items = () => {
      const ch = WK.CHAPTERS.map((c) => ({ k: "CH." + c.num, t: c.title, d: c.desc, href: `${r}chapters/${c.slug}.html` }));
      const gl = WK.GLOSSARY.map((g) => ({ k: "용어", t: g[0] + (g[1] ? " · " + g[1] : ""), d: g[2], href: `${r}chapters/${g[3]}.html` }));
      return ch.concat(gl);
    };
    const render = () => {
      const v = q.value.trim().toLowerCase();
      if (!v) { box.hidden = true; return; }
      const hit = items().filter((it) => (it.t + " " + it.d).toLowerCase().includes(v)).slice(0, 8);
      box.innerHTML = hit.length ? hit.map((it) => `<a href="${it.href}"><span>${it.k}</span><b>${WK.esc(it.t)}</b><small>${WK.esc(it.d)}</small></a>`).join("") : `<div class="none">“${WK.esc(q.value)}”에 맞는 항목이 없습니다</div>`;
      box.hidden = false;
    };
    q.addEventListener("input", render);
    q.addEventListener("focus", render);
    q.addEventListener("keydown", (e) => { if (e.key === "Enter") { const a = box.querySelector("a"); if (a) location.href = a.href; } if (e.key === "Escape") { q.value = ""; render(); q.blur(); } });
    document.addEventListener("click", (e) => { if (!e.target.closest(".hb-search")) box.hidden = true; });
  }

  function initQuiz() {
    WK.$$(".quiz").forEach((quiz) => {
      const qs = WK.$$(".quiz-q", quiz);
      let score = 0, answered = 0;
      const sc = document.createElement("div");
      sc.className = "quiz-score";
      sc.textContent = `0 / ${qs.length}`;
      quiz.appendChild(sc);
      qs.forEach((q) => {
        WK.$$(".opt", q).forEach((b) => b.addEventListener("click", () => {
          if (q.classList.contains("done")) return;
          q.classList.add("done");
          const ok = b.hasAttribute("data-correct");
          WK.$$(".opt", q).forEach((o) => { if (o.hasAttribute("data-correct")) o.classList.add("right"); });
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
