/* VibeBook 공통 스크립트: 테마, 상단 바, 목차, 퀴즈, 캔버스/차트/그래프 도우미.
   <head>에서 동기 로드한다. 장 본문의 인라인 스크립트가 VB.* 도우미를 바로 쓸 수 있도록
   도우미는 즉시 정의하고, 화면 골격은 DOMContentLoaded에서 붙인다. */
(function () {
  "use strict";
  const VB = (window.VB = {});

  VB.CHAPTERS = [
    { slug: "spectrum", num: "01", title: "바이브 코딩이란 무엇인가", desc: "자동완성에서 에이전틱 엔지니어링까지. 코드를 읽지 않아도 되는 때와 반드시 읽어야 하는 때.", tags: ["sim", "game"] },
    { slug: "loop", num: "02", title: "루프의 해부: 프롬프트에서 커밋까지", desc: "생성–실행–관찰–수정 루프의 속도, 전부 수락의 표류, 같은 오류를 맴도는 늪.", tags: ["anim", "sim"] },
    { slug: "spec", num: "03", title: "명세와 계획 먼저", desc: "모호한 프롬프트가 만드는 구현의 부채꼴, 좋은 명세의 요소, 계획 후 실행.", tags: ["sim", "game"] },
    { slug: "context", num: "04", title: "컨텍스트 엔지니어링", desc: "토큰 예산 안에 무엇을 넣을까. 규칙 파일, 긴 세션의 부패, 새로 시작할 때.", tags: ["sim", "game"] },
    { slug: "verify", num: "05", title: "검증: 테스트는 에이전트의 눈", desc: "스위스 치즈 검증 사다리, 같은 맹점을 공유하는 테스트, 테스트를 속이는 에이전트.", tags: ["sim", "game"] },
    { slug: "slice", num: "06", title: "작업 크기와 분해", desc: "과제 지평선과 성공 확률, 체크포인트로 쪼개기, 리뷰할 수 있는 diff 크기.", tags: ["viz", "sim", "game"] },
    { slug: "review", num: "07", title: "리뷰와 신뢰 보정", desc: "느낀 속도와 실제 속도, 자동화 편향, AI가 쓴 diff에서 버그 찾기.", tags: ["sim", "game"] },
    { slug: "parallel", num: "08", title: "병렬 에이전트와 오케스트레이션", desc: "에이전트를 여럿 돌리면 사람이 병목이 된다. 대기열, 충돌, 주의 전환 비용.", tags: ["anim", "sim"] },
    { slug: "debt", num: "09", title: "기술 부채와 이해 부채", desc: "빨리 쌓은 코드의 이자. 중복과 변경 이탈, 아무도 이해하지 못하는 코드.", tags: ["sim", "viz"] },
    { slug: "security", num: "10", title: "보안과 공급망", desc: "환각 패키지 슬롭스쿼팅, 생성 코드의 취약점 깔때기, 자동 승인의 폭발 반경.", tags: ["sim", "game"] },
    { slug: "team", num: "11", title: "팀과 조직의 전략", desc: "토큰 비용 대 사람 시간, 처리량과 안정성, 주니어의 학습 곡선.", tags: ["sim", "viz"] },
    { slug: "playbook", num: "12", title: "전략 플레이북과 용어집", desc: "프로젝트에 맞는 모드와 가드레일을 고르고, 용어와 종합 퀴즈로 정리한다.", tags: ["sim", "game"] },
  ];
  /* 용어집: [용어, 영어, 설명, 장] — 상단 검색과 12장 용어집이 함께 쓴다 */
  VB.GLOSSARY = [
    ["바이브 코딩", "vibe coding", "코드를 거의 읽지 않고 자연어로 요청하고, 결과를 실행해 보고, 느낌으로 수락하며 만드는 방식. 2025년 2월 안드레이 카파시가 이름 붙였다.", "spectrum"],
    ["에이전틱 엔지니어링", "agentic engineering", "코딩 에이전트에게 구현을 맡기되 명세·컨텍스트·검증·리뷰로 결과를 통제하는 전문적인 개발 방식.", "spectrum"],
    ["바이브 엔지니어링", "vibe engineering", "숙련된 개발자가 AI 도구를 쓰면서도 결과에 책임을 지는 방식을 가리키려 사이먼 윌리슨이 제안한 말.", "spectrum"],
    ["폭발 반경", "blast radius", "변경이 잘못됐을 때 피해가 미치는 범위. 바이브 코딩을 허용할지 가르는 첫 기준.", "spectrum"],
    ["피드백 루프", "feedback loop", "변경 → 실행 → 결과 관찰 → 다음 변경. 한 바퀴가 짧을수록 같은 시간에 더 많이 고칠 수 있다.", "loop"],
    ["전부 수락", "accept all", "변경 내용을 읽지 않고 모두 받아들이는 습관. 작은 회귀가 눈에 띄지 않게 쌓인다.", "loop"],
    ["둠 루프", "doom loop", "에이전트가 같은 오류를 고쳤다 깨뜨렸다 하며 진전 없이 맴도는 상태. 컨텍스트를 비우고 새로 시작하는 게 빠를 때가 많다.", "loop"],
    ["체크포인트", "checkpoint", "되돌아갈 수 있는 지점. 작은 커밋, 스냅숏, 브랜치가 모두 체크포인트다.", "loop"],
    ["명세 주도 개발", "spec-driven development", "구현 전에 목표·제약·수용 기준을 문서로 고정하고, 에이전트가 그 문서를 기준으로 일하게 하는 방식.", "spec"],
    ["수용 기준", "acceptance criteria", "작업이 끝났다고 말할 수 있는 검사 가능한 조건. 테스트로 옮기기 좋은 형태로 쓴다.", "spec"],
    ["비목표", "non-goals", "이번 작업에서 하지 않을 일. 에이전트의 과잉 구현과 범위 확장을 막는다.", "spec"],
    ["계획 모드", "plan mode", "코드를 고치기 전에 에이전트가 읽고 계획만 세우게 하는 단계. 사람이 계획을 검토한 뒤 실행한다.", "spec"],
    ["컨텍스트 엔지니어링", "context engineering", "모델이 보는 창에 무엇을, 어떤 순서로, 얼마나 넣을지 설계하는 일.", "context"],
    ["규칙 파일", "AGENTS.md / CLAUDE.md", "저장소 루트에 두는 에이전트용 지침. 빌드·테스트 명령, 관례, 금지 사항을 적는다.", "context"],
    ["컨텍스트 부패", "context rot", "세션이 길어지고 창이 차면서 앞의 지시를 놓치거나 오래된 정보에 끌려가는 현상.", "context"],
    ["압축", "compaction", "긴 대화를 요약해 창을 비우는 일. 세부가 빠질 수 있다.", "context"],
    ["검증 사다리", "verification ladder", "타입 검사, 린트, 단위·통합·종단 테스트, 사람 리뷰로 이어지는 검사의 층. 층마다 잡는 결함이 다르다.", "verify"],
    ["테스트 주도 개발", "test-driven development, TDD", "실패하는 테스트를 먼저 쓰고 그것을 통과시키는 코드를 쓰는 방식. 에이전트에게 분명한 목표를 준다.", "verify"],
    ["보상 해킹", "reward hacking", "에이전트가 의도한 목표 대신 검사 자체를 통과하려고 테스트를 지우거나 기댓값을 하드코딩하는 행동.", "verify"],
    ["상관된 오류", "correlated errors", "코드와 테스트를 같은 모델이 같은 오해로 쓰면 둘이 함께 틀려서 테스트가 버그를 잡지 못한다.", "verify"],
    ["과제 지평선", "task time horizon", "모델이 50% 확률로 끝낼 수 있는 과제의 길이(사람 기준 소요 시간). METR이 측정해 발표한다.", "slice"],
    ["수직 슬라이스", "vertical slice", "UI부터 저장소까지 얇게 관통해 실제로 동작하는 작은 기능 단위.", "slice"],
    ["자동화 편향", "automation bias", "자동화된 시스템의 출력을 지나치게 믿어 스스로 확인하지 않는 경향.", "review"],
    ["신뢰 보정", "trust calibration", "도구를 믿는 정도를 도구의 실제 정확도에 맞추는 일.", "review"],
    ["워크트리", "git worktree", "한 저장소에서 여러 작업 디렉터리를 동시에 꺼내 쓰는 git 기능. 병렬 에이전트가 서로의 파일을 건드리지 않게 한다.", "parallel"],
    ["리틀의 법칙", "Little's law", "대기열 안의 평균 작업 수 = 도착률 × 평균 체류 시간. 리뷰 대기열이 왜 불어나는지 설명한다.", "parallel"],
    ["백그라운드 에이전트", "background agent", "사람이 지켜보지 않는 동안 원격 환경에서 작업하고 PR로 결과를 돌려주는 에이전트.", "parallel"],
    ["이해 부채", "comprehension debt", "코드가 동작은 하지만 팀의 누구도 그 코드를 설명하지 못하는 상태. 고칠 때 이자를 낸다.", "debt"],
    ["변경 이탈", "code churn", "작성된 지 얼마 안 되어 다시 고쳐지거나 지워지는 코드의 비율.", "debt"],
    ["리팩터링 예산", "refactoring budget", "기능 작업 시간 중 구조 개선에 고정으로 떼어 두는 몫.", "debt"],
    ["슬롭스쿼팅", "slopsquatting", "모델이 지어낸 패키지 이름을 공격자가 미리 등록해 악성 코드를 심는 공급망 공격.", "security"],
    ["비밀 유출", "secret leakage", "API 키·토큰이 코드, 로그, 프롬프트에 들어가 외부로 새는 일.", "security"],
    ["자동 승인", "auto-approve / YOLO mode", "에이전트의 명령 실행과 파일 변경을 사람 확인 없이 허용하는 설정.", "security"],
    ["샌드박스", "sandbox", "에이전트가 실행되는 격리 환경. 파일 시스템과 네트워크 접근을 제한한다.", "security"],
    ["DORA 지표", "DORA metrics", "배포 빈도, 변경 리드타임, 변경 실패율, 복구 시간. 처리량과 안정성을 함께 본다.", "team"],
    ["수락률", "acceptance rate", "에이전트가 제안한 변경 중 사람이 받아들인 비율. 높다고 좋은 것만은 아니다.", "team"],
    ["가드레일", "guardrail", "실수해도 피해가 일정 범위를 넘지 않게 하는 장치. 권한, 테스트, 리뷰 규칙, 예산 한도.", "playbook"],
  ];
  VB.BRAND = "VibeBook";

  /* ---------------------------------------------------------------- theme */
  const THEME_KEY = "vibebook-theme";
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) document.documentElement.dataset.theme = saved;
  } catch (e) { /* storage blocked */ }
  const themeCbs = [];
  let colorCache = null;
  VB.onTheme = (cb) => themeCbs.push(cb);
  function themeChanged() { colorCache = null; themeCbs.forEach((cb) => { try { cb(); } catch (e) { console.error(e); } }); }
  VB.isDark = () => {
    const t = document.documentElement.dataset.theme;
    if (t) return t === "dark";
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  };
  VB.toggleTheme = () => {
    const next = VB.isDark() ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    themeChanged();
  };
  if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", themeChanged);

  /** CSS 변수 색을 읽는다. VB.col("accent") 또는 VB.col("--accent") */
  VB.col = (name) => {
    if (!colorCache) colorCache = {};
    const key = name.startsWith("--") ? name : "--" + name;
    if (!(key in colorCache)) colorCache[key] = getComputedStyle(document.documentElement).getPropertyValue(key).trim() || "#888888";
    return colorCache[key];
  };
  /** 색에 투명도를 준다 (#rrggbb만) */
  VB.alpha = (hex, a) => {
    const h = String(hex).replace("#", "");
    if (h.length !== 6) return hex;
    return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
  };
  /* 색 언어: 역할 → CSS 변수 */
  VB.ROLE = { vibe: "accent", eng: "accent-2", code: "ctx", spec: "state", test: "env", cost: "tool", risk: "guard", human: "user" };
  VB.rc = (role) => VB.col(VB.ROLE[role] || role);

  /* ---------------------------------------------------------------- math */
  VB.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  VB.lerp = (a, b, t) => a + (b - a) * t;
  VB.rng = (seed) => {
    let s = seed >>> 0 || 1;
    return () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  VB.fmt = (v, d = 0) => {
    if (!isFinite(v)) return "—";
    return Number(v).toLocaleString("ko-KR", { minimumFractionDigits: d, maximumFractionDigits: d });
  };
  VB.si = (v) => {
    const a = Math.abs(v);
    if (a >= 1e6) return (v / 1e6).toFixed(a >= 1e7 ? 0 : 1) + "M";
    if (a >= 1e3) return (v / 1e3).toFixed(a >= 1e4 ? 0 : 1) + "K";
    return String(Math.round(v));
  };
  VB.pct = (v, d = 0) => (isFinite(v) ? (v * 100).toFixed(d) + "%" : "—");
  VB.ease = (x) => { x = VB.clamp(x, 0, 1); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
  /** 이항계수와 이항분포 꼬리 (투표 계산용) */
  VB.binom = (n, k) => { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r; };
  VB.normal = (r) => { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

  /* ---------------------------------------------------------------- DOM */
  VB.$ = (s, r = document) => r.querySelector(s);
  VB.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  VB.el = (id) => document.getElementById(id);
  VB.val = (id) => +document.getElementById(id).value;
  VB.set = (id, txt, cls) => {
    const e = document.getElementById(id);
    if (!e) return;
    e.textContent = txt;
    if (cls !== undefined) { e.classList.remove("good", "bad", "warn"); if (cls) e.classList.add(cls); }
  };
  VB.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  /** range 입력들을 render에 연결하고, id+"-out" output에 값을 표시한다. */
  VB.wire = (ids, fn, fmts = {}) => {
    const up = () => {
      ids.forEach((id) => {
        const o = document.getElementById(id + "-out");
        if (o) o.textContent = fmts[id] ? fmts[id](VB.val(id)) : document.getElementById(id).value;
      });
      fn();
    };
    ids.forEach((id) => document.getElementById(id).addEventListener("input", up));
    up();
    return up;
  };
  /** .seg 버튼 묶음. data-v 값을 콜백에 넘긴다. */
  VB.seg = (id, cb) => {
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
  VB.canvas = (canvas, opts = {}) => {
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
    VB.onTheme(st.redraw);
    /** 클릭 좌표(CSS px) */
    st.on = (type, fn) => canvas.addEventListener(type, (e) => { const r = canvas.getBoundingClientRect(); fn(e.clientX - r.left, e.clientY - r.top, e); });
    return st;
  };
  /** 보이는 동안만 도는 애니메이션 루프 */
  VB.loop = (el, fn) => {
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
  VB.reduced = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  /** 축과 격자. 반환값 {X,Y,box} */
  VB.axes = (ctx, o) => {
    const b = o.box; // {l,t,r,b} 픽셀 경계
    const [x0, x1] = o.x, [y0, y1] = o.y;
    const lx = o.logx, ly = o.logy;
    const tx = (v) => (lx ? Math.log10(v) : v), ty = (v) => (ly ? Math.log10(v) : v);
    const X = (v) => b.l + ((tx(v) - tx(x0)) / (tx(x1) - tx(x0))) * (b.r - b.l);
    const Y = (v) => b.b - ((ty(v) - ty(y0)) / (ty(y1) - ty(y0))) * (b.b - b.t);
    ctx.save();
    ctx.lineWidth = 1;
    ctx.font = "11px " + VB.monoFont();
    ctx.fillStyle = VB.col("text-faint");
    (o.xt || []).forEach((v) => {
      const px = X(v);
      ctx.strokeStyle = VB.col("grid");
      ctx.beginPath(); ctx.moveTo(px, b.t); ctx.lineTo(px, b.b); ctx.stroke();
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(o.xf ? o.xf(v) : v, px, b.b + 5);
    });
    let maxW = 0;
    (o.yt || []).forEach((v) => {
      const py = Y(v);
      maxW = Math.max(maxW, ctx.measureText(String(o.yf ? o.yf(v) : v)).width);
      ctx.strokeStyle = VB.col("grid");
      ctx.beginPath(); ctx.moveTo(b.l, py); ctx.lineTo(b.r, py); ctx.stroke();
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText(o.yf ? o.yf(v) : v, b.l - 6, py);
    });
    ctx.strokeStyle = VB.col("axis");
    ctx.beginPath(); ctx.moveTo(b.l, b.t); ctx.lineTo(b.l, b.b); ctx.lineTo(b.r, b.b); ctx.stroke();
    ctx.fillStyle = VB.col("text-dim");
    ctx.font = "12px " + VB.bodyFont();
    if (o.xl) { ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText(o.xl, (b.l + b.r) / 2, b.b + 22); }
    if (o.yl) { ctx.save(); ctx.translate(Math.max(8, Math.min(b.l - (o.ylOff || 40), b.l - 15 - maxW)), (b.t + b.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(o.yl, 0, 0); ctx.restore(); }
    ctx.restore();
    return { X, Y, box: b };
  };
  let fontCache = null;
  VB.bodyFont = () => (fontCache || (fontCache = [getComputedStyle(document.body).getPropertyValue("--font"), getComputedStyle(document.body).getPropertyValue("--mono")]))[0];
  VB.monoFont = () => (VB.bodyFont(), fontCache[1]);
  VB.line = (ctx, pts, color, width = 2, dash) => {
    if (!pts.length) return;
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = "round";
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.restore();
  };
  VB.text = (ctx, s, x, y, o = {}) => {
    ctx.save();
    ctx.fillStyle = o.color || VB.col("text");
    ctx.font = `${o.weight || 400} ${o.size || 12}px ${o.mono ? VB.monoFont() : VB.bodyFont()}`;
    ctx.textAlign = o.align || "left";
    ctx.textBaseline = o.base || "middle";
    ctx.fillText(s, x, y);
    ctx.restore();
  };
  VB.rrect = (ctx, x, y, w, h, r) => {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };
  /** 에이전트 노드: 원 + 라벨. role은 VB.ROLE 키 또는 CSS 변수 이름 */
  VB.node = (ctx, x, y, r, role, label, o = {}) => {
    const col = VB.rc(role);
    ctx.save();
    if (o.glow) { ctx.fillStyle = VB.alpha(col, 0.18 * o.glow); ctx.beginPath(); ctx.arc(x, y, r + 9 * o.glow, 0, 7); ctx.fill(); }
    ctx.globalAlpha = o.dim ? 0.3 : 1;
    ctx.fillStyle = VB.col("bg-elev"); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    ctx.fillStyle = VB.alpha(col, o.fill != null ? o.fill : 0.16); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = o.lw || 2; if (o.dash) ctx.setLineDash(o.dash); ctx.stroke();
    ctx.restore();
    if (label != null) VB.text(ctx, label, x, y + (o.below ? r + 11 : 0), { size: o.size || 11.5, weight: 700, align: "center", color: o.dim ? VB.col("text-faint") : (o.below ? VB.col("text-dim") : VB.col("text")) });
  };
  /** 두 점 사이 화살표 (반지름만큼 줄여서) */
  VB.arrow = (ctx, x1, y1, x2, y2, color, o = {}) => {
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
  VB.hbar = (ctx, x, y, w, h, v, color, o = {}) => {
    ctx.fillStyle = VB.col("surface-2"); VB.rrect(ctx, x, y, w, h, h / 2); ctx.fill();
    ctx.fillStyle = color; VB.rrect(ctx, x, y, Math.max(h, w * VB.clamp(v, 0, 1)), h, h / 2); if (v > 0) ctx.fill();
    if (o.label) VB.text(ctx, o.label, x + w + 6, y + h / 2, { size: 11, mono: true, color: VB.col("text-dim") });
  };
  /** 레이더 차트: axes=[{label, v, target}] */
  VB.radar = (ctx, cx, cy, R, axes, o = {}) => {
    const n = axes.length, ang = (i) => -Math.PI / 2 + (i / n) * Math.PI * 2;
    ctx.save();
    for (let k = 1; k <= 4; k++) {
      ctx.strokeStyle = VB.col("grid"); ctx.beginPath();
      for (let i = 0; i <= n; i++) { const a = ang(i % n), r = (R * k) / 4; i ? ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
      ctx.stroke();
    }
    axes.forEach((ax, i) => {
      const a = ang(i);
      ctx.strokeStyle = VB.col("grid"); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
      VB.text(ctx, ax.label, cx + Math.cos(a) * (R + 18), cy + Math.sin(a) * (R + 14), { size: 12, weight: 700, align: Math.abs(Math.cos(a)) < 0.2 ? "center" : Math.cos(a) > 0 ? "left" : "right", color: VB.col("text-dim") });
    });
    const poly = (key, color, fill, dash) => {
      ctx.beginPath();
      axes.forEach((ax, i) => { const a = ang(i), r = R * VB.clamp(ax[key], 0, 1); i ? ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); });
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
    };
    if (axes[0].target != null) poly("target", VB.col("text-faint"), null, [5, 4]);
    poly("v", o.color || VB.col("accent"), VB.alpha(o.color || VB.col("accent"), 0.16));
    ctx.restore();
  };

  /* ---------------------------------------------------------------- shell */
  function root() { return document.body.dataset.root || ""; }
  function buildShell() {
    const r = root();
    const home = r || "./";
    const cur = document.body.dataset.chapter;
    const ch = VB.CHAPTERS.find((c) => c.slug === cur);
    const chapterHref = (c) => `${r}chapters/${c.slug}.html`;

    const top = document.createElement("header");
    top.className = "ca-top";
    top.innerHTML = `<div class="in">
      <button class="ca-iconbtn" id="ca-menu" aria-label="전체 목차 열기" aria-expanded="false">☰</button>
      <a class="ca-brand" href="${home}"><img src="${r}favicon.svg" alt="">${VB.BRAND}</a>
      ${ch ? `<span class="ca-crumb"><b>${ch.num}</b>${ch.title}</span>` : `<span class="ca-crumb">바이브 코딩과 에이전틱 엔지니어링 전략</span>`}
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
      ${VB.CHAPTERS.map((c) => `<a href="${chapterHref(c)}" class="${c.slug === cur ? "cur" : ""}"><span>${c.num}</span>${c.title}</a>`).join("")}
      <h4 style="margin-top:20px">SHELF</h4><a href="${r}../"><span>↩</span>열린 실험서가로 돌아가기</a></nav>`;
    document.body.appendChild(drawer);
    const menu = VB.el("ca-menu");
    const setOpen = (v) => { drawer.classList.toggle("open", v); menu.setAttribute("aria-expanded", v); };
    menu.addEventListener("click", () => setOpen(true));
    drawer.querySelector(".scrim").addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    VB.el("ca-theme").addEventListener("click", VB.toggleTheme);

    const main = document.querySelector("main");
    if (main && !main.id) main.id = "content";
    initSearch(r);
    // 실험 제목 옆에 바로가기 링크
    VB.$$(".sim[id]").forEach((s) => {
      const h = s.querySelector(".sim-head");
      if (h && !h.querySelector(".sim-link")) h.insertAdjacentHTML("beforeend", `<a class="sim-link" href="#${s.id}" title="이 실험으로 가는 링크" aria-label="이 실험으로 가는 링크">#</a>`);
    });

    // 장 페이지: 오른쪽 목차와 이전/다음 장
    const layout = document.querySelector(".ca-layout");
    if (layout && main) {
      const secs = VB.$$("main.chapter > section[id]");
      const toc = document.createElement("aside");
      toc.className = "ca-toc";
      toc.innerHTML = "<h4>ON THIS PAGE</h4>" + secs.map((s) => {
        const h = s.querySelector("h2");
        return h ? `<a href="#${s.id}">${h.textContent.replace(/^\d+\.\d+\s*/, "")}</a>` : "";
      }).join("");
      layout.appendChild(toc);
      const links = VB.$$("a", toc);
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
        const i = VB.CHAPTERS.indexOf(ch);
        const prev = VB.CHAPTERS[i - 1], next = VB.CHAPTERS[i + 1];
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
    foot.innerHTML = `<b>${VB.BRAND}</b> · 그림과 실험으로 배우는 바이브 코딩과 에이전틱 엔지니어링 전략 · <a href="${r}../">열린 실험서가</a> · <a href="https://github.com/jsg1504/books">GitHub ↗</a><br>실험의 수치는 개념을 보이기 위한 단순화된 모형이며, 인용한 연구 수치 외에는 특정 제품의 측정값이 아닙니다.`;
    document.body.appendChild(foot);
  }

  /* ---------------------------------------------------------------- search */
  function initSearch(r) {
    const q = VB.el("hb-q"), box = VB.el("hb-res");
    if (!q) return;
    const items = () => {
      const ch = VB.CHAPTERS.map((c) => ({ k: "CH." + c.num, t: c.title, d: c.desc, href: `${r}chapters/${c.slug}.html` }));
      const gl = VB.GLOSSARY.map((g) => ({ k: "용어", t: g[0] + (g[1] ? " · " + g[1] : ""), d: g[2], href: `${r}chapters/${g[3]}.html` }));
      return ch.concat(gl);
    };
    const render = () => {
      const v = q.value.trim().toLowerCase();
      if (!v) { box.hidden = true; return; }
      const hit = items().filter((it) => (it.t + " " + it.d).toLowerCase().includes(v)).slice(0, 8);
      box.innerHTML = hit.length ? hit.map((it) => `<a href="${it.href}"><span>${it.k}</span><b>${VB.esc(it.t)}</b><small>${VB.esc(it.d)}</small></a>`).join("") : `<div class="none">“${VB.esc(q.value)}”에 맞는 항목이 없습니다</div>`;
      box.hidden = false;
    };
    q.addEventListener("input", render);
    q.addEventListener("focus", render);
    q.addEventListener("keydown", (e) => { if (e.key === "Enter") { const a = box.querySelector("a"); if (a) location.href = a.href; } if (e.key === "Escape") { q.value = ""; render(); q.blur(); } });
    document.addEventListener("click", (e) => { if (!e.target.closest(".hb-search")) box.hidden = true; });
  }

  function initQuiz() {
    VB.$$(".quiz").forEach((quiz) => {
      const qs = VB.$$(".quiz-q", quiz);
      let score = 0, answered = 0;
      const sc = document.createElement("div");
      sc.className = "quiz-score";
      sc.textContent = `0 / ${qs.length}`;
      quiz.appendChild(sc);
      qs.forEach((q) => {
        VB.$$(".opt", q).forEach((b) => b.addEventListener("click", () => {
          if (q.classList.contains("done")) return;
          q.classList.add("done");
          const ok = b.hasAttribute("data-correct");
          VB.$$(".opt", q).forEach((o) => { if (o.hasAttribute("data-correct")) o.classList.add("right"); });
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
