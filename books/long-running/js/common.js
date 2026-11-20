/* MarathonBook 공통 스크립트: 테마, 상단 바, 목차, 퀴즈, 캔버스/차트/그래프 도우미.
   <head>에서 동기 로드한다. 장 본문의 인라인 스크립트가 LR.* 도우미를 바로 쓸 수 있도록
   도우미는 즉시 정의하고, 화면 골격은 DOMContentLoaded에서 붙인다. */
(function () {
  "use strict";
  const LR = (window.LR = {});

  LR.CHAPTERS = [
    { slug: "horizon", num: "01", title: "장기 실행 에이전트란 무엇인가", desc: "분 단위에서 시간·일 단위로. 단계마다 99%여도 100단계면 37%가 되는 복리의 법칙.", tags: ["sim", "anim", "game"] },
    { slug: "anatomy", num: "02", title: "긴 실행의 해부: 안쪽 루프와 바깥 루프", desc: "에이전트 루프를 감싸는 세션 루프. 초기화 에이전트, 진행 파일, 한 세션에 기능 하나.", tags: ["anim", "sim", "game"] },
    { slug: "context", num: "03", title: "컨텍스트 창의 한계와 압축", desc: "창이 차오르는 톱니 그래프, 손실 압축, 중간에서 길을 잃는 정보, 컨텍스트 부패.", tags: ["sim", "game"] },
    { slug: "memory", num: "04", title: "외부 기억: 진행 파일과 노트", desc: "기억상실 세션의 재적응 비용, 기능 목록 JSON의 규칙, 오래된 노트의 표류.", tags: ["sim", "game"] },
    { slug: "checkpoint", num: "05", title: "체크포인트, 재개, 멱등성", desc: "최적 체크포인트 간격, 충돌 뒤 다시 보내진 이메일, 이벤트 로그 재생.", tags: ["sim", "anim", "game"] },
    { slug: "plan", num: "06", title: "계획과 분해, 진행 추적", desc: "계획의 표류와 재계획 주기, 의존 그래프와 임계 경로, 작업 목록의 힘.", tags: ["sim", "game"] },
    { slug: "verify", num: "07", title: "스스로 검증하기", desc: "때 이른 완료 선언, 늦게 발견된 버그의 비용, 테스트를 속이는 에이전트 가려내기.", tags: ["sim", "game"] },
    { slug: "drift", num: "08", title: "표류, 맴돌기, 목표 망각", desc: "같은 행동을 반복하는 늪 감지, 목표 재고정, 실행 기록 읽고 진단하기.", tags: ["sim", "anim", "game"] },
    { slug: "cost", num: "09", title: "비용과 예산, 언제 멈출까", desc: "턴마다 다시 읽는 컨텍스트의 제곱 비용, 프롬프트 캐시, 계속할지 멈출지의 경제학.", tags: ["sim", "viz"] },
    { slug: "oversight", num: "10", title: "사람의 감독과 개입", desc: "승인 게이트의 빈도, 막히는 승인과 막히지 않는 승인, 밤새 돈 에이전트의 아침 검토.", tags: ["sim", "game"] },
    { slug: "safety", num: "11", title: "안전, 샌드박스, 폭발 반경", desc: "오래 돌수록 늘어나는 주입 노출, 권한과 피해 반경, 사고 타임라인에서 멈췄어야 할 지점.", tags: ["sim", "game"] },
    { slug: "ops", num: "12", title: "운영 플레이북과 용어집", desc: "트레이스로 긴 실행 들여다보기, 하네스 설계 플레이그라운드, 용어와 종합 퀴즈.", tags: ["sim", "viz", "game"] },
  ];
  /* 용어집: [용어, 영어, 설명, 장] — 상단 검색과 12장 용어집이 함께 쓴다 */
  LR.GLOSSARY = [
    ["장기 실행 에이전트", "long-running agent", "몇 시간에서 며칠에 걸쳐 여러 컨텍스트 창과 세션을 넘나들며 하나의 큰 목표를 향해 일하는 에이전트.", "horizon"],
    ["과제 지평선", "task time horizon", "에이전트가 50% 확률로 해내는 과제의 길이(사람 기준 소요 시간). METR이 제안한 능력 척도.", "horizon"],
    ["신뢰도 복리", "compounding reliability", "단계별 성공 확률이 곱해져 긴 실행 전체의 성공 확률이 급격히 떨어지는 현상. pⁿ.", "horizon"],
    ["자기 교정", "self-correction", "실패를 관찰하고 스스로 되돌리거나 고치는 능력. 단계 실패가 실행 실패로 번지는 것을 막는다.", "horizon"],
    ["안쪽 루프", "inner loop", "한 컨텍스트 창 안에서 도는 모델 호출 → 도구 실행 → 결과 관찰의 반복.", "anatomy"],
    ["바깥 루프", "outer loop", "세션을 끝내고 새 컨텍스트로 다시 시작하는 반복. 상태는 파일과 git으로 넘긴다.", "anatomy"],
    ["초기화 에이전트", "initializer agent", "첫 세션에서 환경, 기능 목록, 진행 파일, 실행 스크립트를 준비하는 에이전트 역할.", "anatomy"],
    ["랄프 루프", "Ralph loop", "같은 프롬프트를 에이전트에 끝없이 다시 넣는 단순한 바깥 루프. 상태는 저장소에만 남는다.", "anatomy"],
    ["컨텍스트 창", "context window", "모델이 한 번에 볼 수 있는 토큰의 최대량. 긴 실행에서는 반드시 넘친다.", "context"],
    ["압축", "compaction", "컨텍스트가 차면 지금까지의 대화를 요약해 새 창의 첫머리로 삼는 기법. 손실이 있다.", "context"],
    ["컨텍스트 부패", "context rot", "입력이 길어질수록 같은 정보를 찾고 쓰는 정확도가 떨어지는 현상.", "context"],
    ["중간 망각", "lost in the middle", "긴 입력의 처음과 끝보다 가운데에 있는 정보를 덜 잘 쓰는 경향.", "context"],
    ["도구 결과 비우기", "tool result clearing", "이미 소화한 오래된 도구 출력을 컨텍스트에서 지워 공간을 되찾는 가벼운 압축.", "context"],
    ["진행 파일", "progress file", "세션이 끝날 때 무엇을 했고 다음에 무엇을 할지 적어 두는 파일. 다음 세션의 첫 읽을거리.", "memory"],
    ["기능 목록", "feature list", "완료 조건이 있는 기능을 모두 적고 통과 여부만 바꾸게 하는 구조화된 작업 목록(보통 JSON).", "memory"],
    ["재적응 비용", "re-orientation cost", "새 세션이 이전 상태를 파악하는 데 드는 토큰과 시간.", "memory"],
    ["체크포인트", "checkpoint", "실행 상태를 되살릴 수 있게 저장한 지점. git 커밋, 스냅숏, 이벤트 로그 위치.", "checkpoint"],
    ["평균 고장 간격", "MTBF", "실패와 실패 사이의 평균 시간. 체크포인트 간격을 정하는 기준.", "checkpoint"],
    ["영의 공식", "Young's formula", "최적 체크포인트 간격 τ ≈ √(2CM). C는 저장 비용, M은 평균 고장 간격.", "checkpoint"],
    ["멱등성", "idempotency", "같은 작업을 두 번 실행해도 결과가 한 번과 같은 성질. 재시도와 재개의 전제.", "checkpoint"],
    ["멱등 키", "idempotency key", "외부 부작용에 붙이는 고유 키. 같은 키의 두 번째 요청은 무시된다.", "checkpoint"],
    ["내구 실행", "durable execution", "단계 결과를 이벤트 로그에 남겨, 프로세스가 죽어도 로그를 재생해 같은 지점부터 이어 가는 실행 방식.", "checkpoint"],
    ["재계획", "re-planning", "실행 중 관찰을 반영해 계획을 다시 세우는 일. 너무 드물면 표류, 너무 잦으면 낭비.", "plan"],
    ["임계 경로", "critical path", "의존 그래프에서 가장 긴 경로. 일꾼을 아무리 늘려도 이보다 빨리 끝낼 수 없다.", "plan"],
    ["작업 목록", "todo list", "에이전트가 스스로 쓰고 갱신하는 할 일 목록. 목표를 컨텍스트 끝에 다시 불러오는 효과가 있다.", "plan"],
    ["때 이른 완료 선언", "premature completion", "실제로 끝나지 않았는데 에이전트가 끝났다고 보고하는 실패.", "verify"],
    ["종단 간 테스트", "end-to-end test", "사용자처럼 실제 화면과 흐름을 끝까지 따라가 확인하는 테스트.", "verify"],
    ["보상 해킹", "reward hacking", "목표 대신 검사기를 만족시키는 행동. 테스트 삭제, 기대값 바꾸기, 건너뛰기 등.", "verify"],
    ["둠 루프", "doom loop", "같은 실패와 같은 수정 시도를 반복하며 진전 없이 맴도는 상태.", "drift"],
    ["목표 표류", "goal drift", "긴 실행 동안 원래 목표에서 조금씩 벗어나 다른 일을 하게 되는 현상.", "drift"],
    ["정체 감지", "stall detection", "최근 행동의 반복, 진척 지표의 정체를 보고 실행이 맴도는지 판정하는 장치.", "drift"],
    ["프롬프트 캐시", "prompt caching", "앞부분이 같은 입력을 다시 보낼 때 저장된 계산을 재사용해 비용과 지연을 줄이는 기능.", "cost"],
    ["예산 상한", "budget cap", "토큰, 돈, 시간, 단계 수에 거는 하드 리밋. 넘으면 멈추고 보고한다.", "cost"],
    ["모델 라우팅", "model routing", "어려운 판단은 큰 모델, 반복 작업은 작은 모델에 맡기는 배분.", "cost"],
    ["승인 게이트", "approval gate", "되돌리기 어려운 행동 앞에서 사람의 승인을 기다리는 지점.", "oversight"],
    ["비차단 승인", "non-blocking approval", "승인을 기다리는 동안 다른 독립 작업을 계속하는 방식.", "oversight"],
    ["자율성 수준", "autonomy level", "에이전트가 사람 확인 없이 할 수 있는 행동의 범위.", "oversight"],
    ["프롬프트 주입", "prompt injection", "에이전트가 읽은 외부 내용에 숨은 지시가 원래 지시를 덮어쓰는 공격.", "safety"],
    ["샌드박스", "sandbox", "파일·네트워크·권한을 제한한 격리된 실행 환경.", "safety"],
    ["킬 스위치", "kill switch", "실행 중인 에이전트를 즉시 멈추고 권한을 회수하는 장치.", "safety"],
    ["권한 확장", "permission creep", "긴 실행 동안 편의를 위해 허용 범위가 조금씩 넓어지는 현상.", "safety"],
    ["트레이스", "trace", "실행의 모든 모델 호출, 도구 호출, 시간, 토큰을 계층으로 기록한 것.", "ops"],
    ["하네스", "harness", "모델을 감싸 도구, 컨텍스트, 상태, 권한, 루프를 관리하는 실행 틀.", "ops"],
  ];
  LR.BRAND = "MarathonBook";

  /* ---------------------------------------------------------------- theme */
  const THEME_KEY = "marathonbook-theme";
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) document.documentElement.dataset.theme = saved;
  } catch (e) { /* storage blocked */ }
  const themeCbs = [];
  let colorCache = null;
  LR.onTheme = (cb) => themeCbs.push(cb);
  function themeChanged() { colorCache = null; themeCbs.forEach((cb) => { try { cb(); } catch (e) { console.error(e); } }); }
  LR.isDark = () => {
    const t = document.documentElement.dataset.theme;
    if (t) return t === "dark";
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  };
  LR.toggleTheme = () => {
    const next = LR.isDark() ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    themeChanged();
  };
  if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", themeChanged);

  /** CSS 변수 색을 읽는다. LR.col("accent") 또는 LR.col("--accent") */
  LR.col = (name) => {
    if (!colorCache) colorCache = {};
    const key = name.startsWith("--") ? name : "--" + name;
    if (!(key in colorCache)) colorCache[key] = getComputedStyle(document.documentElement).getPropertyValue(key).trim() || "#888888";
    return colorCache[key];
  };
  /** 색에 투명도를 준다 (#rrggbb만) */
  LR.alpha = (hex, a) => {
    const h = String(hex).replace("#", "");
    if (h.length !== 6) return hex;
    return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
  };
  /* 색 언어: 역할 → CSS 변수 */
  LR.ROLE = { run: "accent", human: "accent-2", ctx: "ctx", mem: "state", ok: "env", cost: "tool", risk: "guard", idle: "user" };
  LR.rc = (role) => LR.col(LR.ROLE[role] || role);

  /* ---------------------------------------------------------------- math */
  LR.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  LR.lerp = (a, b, t) => a + (b - a) * t;
  LR.rng = (seed) => {
    let s = seed >>> 0 || 1;
    return () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  LR.fmt = (v, d = 0) => {
    if (!isFinite(v)) return "—";
    return Number(v).toLocaleString("ko-KR", { minimumFractionDigits: d, maximumFractionDigits: d });
  };
  LR.si = (v) => {
    const a = Math.abs(v);
    if (a >= 1e6) return (v / 1e6).toFixed(a >= 1e7 ? 0 : 1) + "M";
    if (a >= 1e3) return (v / 1e3).toFixed(a >= 1e4 ? 0 : 1) + "K";
    return String(Math.round(v));
  };
  LR.pct = (v, d = 0) => (isFinite(v) ? (v * 100).toFixed(d) + "%" : "—");
  LR.ease = (x) => { x = LR.clamp(x, 0, 1); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
  /** 이항계수와 이항분포 꼬리 (투표 계산용) */
  LR.binom = (n, k) => { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r; };
  LR.normal = (r) => { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

  /* ---------------------------------------------------------------- DOM */
  LR.$ = (s, r = document) => r.querySelector(s);
  LR.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  LR.el = (id) => document.getElementById(id);
  LR.val = (id) => +document.getElementById(id).value;
  LR.set = (id, txt, cls) => {
    const e = document.getElementById(id);
    if (!e) return;
    e.textContent = txt;
    if (cls !== undefined) { e.classList.remove("good", "bad", "warn"); if (cls) e.classList.add(cls); }
  };
  LR.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  /** range 입력들을 render에 연결하고, id+"-out" output에 값을 표시한다. */
  LR.wire = (ids, fn, fmts = {}) => {
    const up = () => {
      ids.forEach((id) => {
        const o = document.getElementById(id + "-out");
        if (o) o.textContent = fmts[id] ? fmts[id](LR.val(id)) : document.getElementById(id).value;
      });
      fn();
    };
    ids.forEach((id) => document.getElementById(id).addEventListener("input", up));
    up();
    return up;
  };
  /** .seg 버튼 묶음. data-v 값을 콜백에 넘긴다. */
  LR.seg = (id, cb) => {
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
  LR.canvas = (canvas, opts = {}) => {
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
    LR.onTheme(st.redraw);
    /** 클릭 좌표(CSS px) */
    st.on = (type, fn) => canvas.addEventListener(type, (e) => { const r = canvas.getBoundingClientRect(); fn(e.clientX - r.left, e.clientY - r.top, e); });
    return st;
  };
  /** 보이는 동안만 도는 애니메이션 루프 */
  LR.loop = (el, fn) => {
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
  LR.reduced = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  /** 축과 격자. 반환값 {X,Y,box} */
  LR.axes = (ctx, o) => {
    const b = o.box; // {l,t,r,b} 픽셀 경계
    const [x0, x1] = o.x, [y0, y1] = o.y;
    const lx = o.logx, ly = o.logy;
    const tx = (v) => (lx ? Math.log10(v) : v), ty = (v) => (ly ? Math.log10(v) : v);
    const X = (v) => b.l + ((tx(v) - tx(x0)) / (tx(x1) - tx(x0))) * (b.r - b.l);
    const Y = (v) => b.b - ((ty(v) - ty(y0)) / (ty(y1) - ty(y0))) * (b.b - b.t);
    ctx.save();
    ctx.lineWidth = 1;
    ctx.font = "11px " + LR.monoFont();
    ctx.fillStyle = LR.col("text-faint");
    (o.xt || []).forEach((v) => {
      const px = X(v);
      ctx.strokeStyle = LR.col("grid");
      ctx.beginPath(); ctx.moveTo(px, b.t); ctx.lineTo(px, b.b); ctx.stroke();
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(o.xf ? o.xf(v) : v, px, b.b + 5);
    });
    let maxW = 0;
    (o.yt || []).forEach((v) => {
      const py = Y(v);
      maxW = Math.max(maxW, ctx.measureText(String(o.yf ? o.yf(v) : v)).width);
      ctx.strokeStyle = LR.col("grid");
      ctx.beginPath(); ctx.moveTo(b.l, py); ctx.lineTo(b.r, py); ctx.stroke();
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText(o.yf ? o.yf(v) : v, b.l - 6, py);
    });
    ctx.strokeStyle = LR.col("axis");
    ctx.beginPath(); ctx.moveTo(b.l, b.t); ctx.lineTo(b.l, b.b); ctx.lineTo(b.r, b.b); ctx.stroke();
    ctx.fillStyle = LR.col("text-dim");
    ctx.font = "12px " + LR.bodyFont();
    if (o.xl) { ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText(o.xl, (b.l + b.r) / 2, b.b + 22); }
    if (o.yl) { ctx.save(); ctx.translate(Math.max(8, Math.min(b.l - (o.ylOff || 40), b.l - 15 - maxW)), (b.t + b.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(o.yl, 0, 0); ctx.restore(); }
    ctx.restore();
    return { X, Y, box: b };
  };
  let fontCache = null;
  LR.bodyFont = () => (fontCache || (fontCache = [getComputedStyle(document.body).getPropertyValue("--font"), getComputedStyle(document.body).getPropertyValue("--mono")]))[0];
  LR.monoFont = () => (LR.bodyFont(), fontCache[1]);
  LR.line = (ctx, pts, color, width = 2, dash) => {
    if (!pts.length) return;
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = "round";
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.restore();
  };
  LR.text = (ctx, s, x, y, o = {}) => {
    ctx.save();
    ctx.fillStyle = o.color || LR.col("text");
    ctx.font = `${o.weight || 400} ${o.size || 12}px ${o.mono ? LR.monoFont() : LR.bodyFont()}`;
    ctx.textAlign = o.align || "left";
    ctx.textBaseline = o.base || "middle";
    ctx.fillText(s, x, y);
    ctx.restore();
  };
  LR.rrect = (ctx, x, y, w, h, r) => {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };
  /** 에이전트 노드: 원 + 라벨. role은 LR.ROLE 키 또는 CSS 변수 이름 */
  LR.node = (ctx, x, y, r, role, label, o = {}) => {
    const col = LR.rc(role);
    ctx.save();
    if (o.glow) { ctx.fillStyle = LR.alpha(col, 0.18 * o.glow); ctx.beginPath(); ctx.arc(x, y, r + 9 * o.glow, 0, 7); ctx.fill(); }
    ctx.globalAlpha = o.dim ? 0.3 : 1;
    ctx.fillStyle = LR.col("bg-elev"); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    ctx.fillStyle = LR.alpha(col, o.fill != null ? o.fill : 0.16); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = o.lw || 2; if (o.dash) ctx.setLineDash(o.dash); ctx.stroke();
    ctx.restore();
    if (label != null) LR.text(ctx, label, x, y + (o.below ? r + 11 : 0), { size: o.size || 11.5, weight: 700, align: "center", color: o.dim ? LR.col("text-faint") : (o.below ? LR.col("text-dim") : LR.col("text")) });
  };
  /** 두 점 사이 화살표 (반지름만큼 줄여서) */
  LR.arrow = (ctx, x1, y1, x2, y2, color, o = {}) => {
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
  LR.hbar = (ctx, x, y, w, h, v, color, o = {}) => {
    ctx.fillStyle = LR.col("surface-2"); LR.rrect(ctx, x, y, w, h, h / 2); ctx.fill();
    ctx.fillStyle = color; LR.rrect(ctx, x, y, Math.max(h, w * LR.clamp(v, 0, 1)), h, h / 2); if (v > 0) ctx.fill();
    if (o.label) LR.text(ctx, o.label, x + w + 6, y + h / 2, { size: 11, mono: true, color: LR.col("text-dim") });
  };
  /** 레이더 차트: axes=[{label, v, target}] */
  LR.radar = (ctx, cx, cy, R, axes, o = {}) => {
    const n = axes.length, ang = (i) => -Math.PI / 2 + (i / n) * Math.PI * 2;
    ctx.save();
    for (let k = 1; k <= 4; k++) {
      ctx.strokeStyle = LR.col("grid"); ctx.beginPath();
      for (let i = 0; i <= n; i++) { const a = ang(i % n), r = (R * k) / 4; i ? ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
      ctx.stroke();
    }
    axes.forEach((ax, i) => {
      const a = ang(i);
      ctx.strokeStyle = LR.col("grid"); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
      LR.text(ctx, ax.label, cx + Math.cos(a) * (R + 18), cy + Math.sin(a) * (R + 14), { size: 12, weight: 700, align: Math.abs(Math.cos(a)) < 0.2 ? "center" : Math.cos(a) > 0 ? "left" : "right", color: LR.col("text-dim") });
    });
    const poly = (key, color, fill, dash) => {
      ctx.beginPath();
      axes.forEach((ax, i) => { const a = ang(i), r = R * LR.clamp(ax[key], 0, 1); i ? ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); });
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
    };
    if (axes[0].target != null) poly("target", LR.col("text-faint"), null, [5, 4]);
    poly("v", o.color || LR.col("accent"), LR.alpha(o.color || LR.col("accent"), 0.16));
    ctx.restore();
  };

  /** 분류 게임: 카드 [문장, 정답, 해설]를 하나씩 보여 주고 .bins 버튼으로 답한다.
      o = {root, prefix, cards, names}. #prefix-card, -fb, -bar, -o1, -o2 요소가 필요하다. */
  LR.sortGame = (o) => {
    const P = (s) => document.getElementById(o.prefix + "-" + s);
    const N = o.cards.length;
    let i = 0, score = 0, locked = false;
    function show() {
      if (i >= N) { P("card").innerHTML = `<small>완료</small><b>${score} / ${N}</b> 맞혔습니다. 다시 하려면 아무 버튼이나 누르세요.`; return; }
      P("card").innerHTML = `<small>상황 ${i + 1} / ${N}</small>${LR.esc(o.cards[i][0])}`;
    }
    LR.$$(`#${o.root} .bins button`).forEach((b) => b.addEventListener("click", () => {
      if (i >= N) { i = 0; score = 0; LR.set(o.prefix + "-o2", "0"); LR.set(o.prefix + "-o1", `0 / ${N}`); P("fb").textContent = "다시 시작합니다."; P("fb").style.removeProperty("--k"); P("bar").style.width = "0"; show(); return; }
      if (locked) return;
      const [, ans, why] = o.cards[i];
      const ok = b.dataset.v === ans;
      if (ok) score++;
      const fb = P("fb");
      fb.style.setProperty("--k", ok ? "var(--env)" : "var(--guard)");
      fb.innerHTML = `<b>${ok ? "맞았습니다" : "정답: " + o.names[ans]}</b> — ${LR.esc(why)}`;
      locked = true; i++;
      LR.set(o.prefix + "-o1", `${i} / ${N}`); LR.set(o.prefix + "-o2", String(score), score === i ? "good" : "");
      P("bar").style.width = (i / N) * 100 + "%";
      setTimeout(() => { locked = false; show(); }, 1200);
    }));
    LR.set(o.prefix + "-o1", `0 / ${N}`);
    show();
  };
  /** 재생 버튼: 누르면 step(dt)을 프레임마다 부르고, step이 false를 돌려주면 멈춘다. */
  LR.player = (btn, el, step, labels = ["▶ 재생", "❚❚ 멈춤"]) => {
    if (typeof btn === "string") btn = document.getElementById(btn);
    const lp = LR.loop(el, (dt) => { if (step(dt) === false) { lp.stop(); btn.textContent = labels[0]; } });
    btn.addEventListener("click", () => { if (lp.running) { lp.stop(); btn.textContent = labels[0]; } else { lp.start(); btn.textContent = labels[1]; } });
    return lp;
  };

  /* ---------------------------------------------------------------- shell */
  function root() { return document.body.dataset.root || ""; }
  function buildShell() {
    const r = root();
    const home = r || "./";
    const cur = document.body.dataset.chapter;
    const ch = LR.CHAPTERS.find((c) => c.slug === cur);
    const chapterHref = (c) => `${r}chapters/${c.slug}.html`;

    const top = document.createElement("header");
    top.className = "ca-top";
    top.innerHTML = `<div class="in">
      <button class="ca-iconbtn" id="ca-menu" aria-label="전체 목차 열기" aria-expanded="false">☰</button>
      <a class="ca-brand" href="${home}"><img src="${r}favicon.svg" alt="">${LR.BRAND}</a>
      ${ch ? `<span class="ca-crumb"><b>${ch.num}</b>${ch.title}</span>` : `<span class="ca-crumb">장기 실행 에이전트</span>`}
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
      ${LR.CHAPTERS.map((c) => `<a href="${chapterHref(c)}" class="${c.slug === cur ? "cur" : ""}"><span>${c.num}</span>${c.title}</a>`).join("")}
      <h4 style="margin-top:20px">SHELF</h4><a href="${r}../"><span>↩</span>열린 실험서가로 돌아가기</a></nav>`;
    document.body.appendChild(drawer);
    const menu = LR.el("ca-menu");
    const setOpen = (v) => { drawer.classList.toggle("open", v); menu.setAttribute("aria-expanded", v); };
    menu.addEventListener("click", () => setOpen(true));
    drawer.querySelector(".scrim").addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    LR.el("ca-theme").addEventListener("click", LR.toggleTheme);

    const main = document.querySelector("main");
    if (main && !main.id) main.id = "content";
    initSearch(r);
    // 실험 제목 옆에 바로가기 링크
    LR.$$(".sim[id]").forEach((s) => {
      const h = s.querySelector(".sim-head");
      if (h && !h.querySelector(".sim-link")) h.insertAdjacentHTML("beforeend", `<a class="sim-link" href="#${s.id}" title="이 실험으로 가는 링크" aria-label="이 실험으로 가는 링크">#</a>`);
    });

    // 장 페이지: 오른쪽 목차와 이전/다음 장
    const layout = document.querySelector(".ca-layout");
    if (layout && main) {
      const secs = LR.$$("main.chapter > section[id]");
      const toc = document.createElement("aside");
      toc.className = "ca-toc";
      toc.innerHTML = "<h4>ON THIS PAGE</h4>" + secs.map((s) => {
        const h = s.querySelector("h2");
        return h ? `<a href="#${s.id}">${h.textContent.replace(/^\d+\.\d+\s*/, "")}</a>` : "";
      }).join("");
      layout.appendChild(toc);
      const links = LR.$$("a", toc);
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
        const i = LR.CHAPTERS.indexOf(ch);
        const prev = LR.CHAPTERS[i - 1], next = LR.CHAPTERS[i + 1];
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
    foot.innerHTML = `<b>${LR.BRAND}</b> · 그림과 실험으로 배우는 장기 실행 에이전트 · <a href="${r}../">열린 실험서가</a> · <a href="https://github.com/jsg1504/books">GitHub ↗</a><br>실험의 수치는 개념을 보이기 위한 단순화된 모형이며, 인용한 연구 수치 외에는 특정 제품의 측정값이 아닙니다.`;
    document.body.appendChild(foot);
  }

  /* ---------------------------------------------------------------- search */
  function initSearch(r) {
    const q = LR.el("hb-q"), box = LR.el("hb-res");
    if (!q) return;
    const items = () => {
      const ch = LR.CHAPTERS.map((c) => ({ k: "CH." + c.num, t: c.title, d: c.desc, href: `${r}chapters/${c.slug}.html` }));
      const gl = LR.GLOSSARY.map((g) => ({ k: "용어", t: g[0] + (g[1] ? " · " + g[1] : ""), d: g[2], href: `${r}chapters/${g[3]}.html` }));
      return ch.concat(gl);
    };
    const render = () => {
      const v = q.value.trim().toLowerCase();
      if (!v) { box.hidden = true; return; }
      const hit = items().filter((it) => (it.t + " " + it.d).toLowerCase().includes(v)).slice(0, 8);
      box.innerHTML = hit.length ? hit.map((it) => `<a href="${it.href}"><span>${it.k}</span><b>${LR.esc(it.t)}</b><small>${LR.esc(it.d)}</small></a>`).join("") : `<div class="none">“${LR.esc(q.value)}”에 맞는 항목이 없습니다</div>`;
      box.hidden = false;
    };
    q.addEventListener("input", render);
    q.addEventListener("focus", render);
    q.addEventListener("keydown", (e) => { if (e.key === "Enter") { const a = box.querySelector("a"); if (a) location.href = a.href; } if (e.key === "Escape") { q.value = ""; render(); q.blur(); } });
    document.addEventListener("click", (e) => { if (!e.target.closest(".hb-search")) box.hidden = true; });
  }

  function initQuiz() {
    LR.$$(".quiz").forEach((quiz) => {
      const qs = LR.$$(".quiz-q", quiz);
      let score = 0, answered = 0;
      const sc = document.createElement("div");
      sc.className = "quiz-score";
      sc.textContent = `0 / ${qs.length}`;
      quiz.appendChild(sc);
      qs.forEach((q) => {
        LR.$$(".opt", q).forEach((b) => b.addEventListener("click", () => {
          if (q.classList.contains("done")) return;
          q.classList.add("done");
          const ok = b.hasAttribute("data-correct");
          LR.$$(".opt", q).forEach((o) => { if (o.hasAttribute("data-correct")) o.classList.add("right"); });
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
