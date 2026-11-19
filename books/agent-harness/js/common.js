/* HarnessBook 공통 스크립트: 테마, 상단 바, 목차, 퀴즈, 캔버스/차트 도우미.
   <head>에서 동기 로드한다. 장 본문의 인라인 스크립트가 HB.* 도우미를 바로 쓸 수 있도록
   도우미는 즉시 정의하고, 화면 골격은 DOMContentLoaded에서 붙인다. */
(function () {
  "use strict";
  const HB = (window.HB = {});

  HB.CHAPTERS = [
    { slug: "what", num: "01", title: "하네스란 무엇인가", desc: "모델 + 하네스 = 에이전트. 같은 모델도 하네스에 따라 다른 에이전트가 된다.", tags: ["sim", "game"] },
    { slug: "loop", num: "02", title: "에이전트 루프와 종료 조건", desc: "while 루프 하나, stop_reason, 턴 상한과 예산, 헛도는 루프 감지.", tags: ["anim", "sim"] },
    { slug: "prompt", num: "03", title: "프롬프트 조립과 컨텍스트", desc: "매 호출의 입력을 쌓는 순서, 프롬프트 캐시, 압축이 시작되는 시점.", tags: ["sim", "viz"] },
    { slug: "tools", num: "04", title: "도구 설계: 에이전트-컴퓨터 인터페이스", desc: "스키마, 도구 개수, 긴 출력 자르기, 다음 행동을 이끄는 오류 메시지.", tags: ["sim", "game"] },
    { slug: "sandbox", num: "05", title: "실행 환경과 샌드박스", desc: "격리 수준과 피해 반경, 네트워크 출구 통제, 샌드박스 풀과 콜드 스타트.", tags: ["sim", "game"] },
    { slug: "permissions", num: "06", title: "권한 · 훅 · 가드레일", desc: "allow/ask/deny 규칙 평가, 수명 주기 훅, 묻기만 하면 안전할까.", tags: ["sim", "anim"] },
    { slug: "state", num: "07", title: "상태 · 세션 · 체크포인트", desc: "중단된 작업 이어 가기, 되감기, 재시도해도 안전한 도구.", tags: ["sim", "anim"] },
    { slug: "orchestration", num: "08", title: "워크플로와 하위 에이전트", desc: "다섯 가지 워크플로 패턴, 컨텍스트 격리, 팬아웃의 속도와 비용.", tags: ["anim", "sim"] },
    { slug: "reliability", num: "09", title: "오류 처리 · 재시도 · 관측성", desc: "곱해지는 실패, 지수 백오프와 지터, 트레이스로 병목 찾기.", tags: ["sim", "viz"] },
    { slug: "design", num: "10", title: "설계 플레이그라운드와 용어집", desc: "부품을 골라 하네스를 설계하고, 용어와 종합 퀴즈로 정리한다.", tags: ["sim", "game"] },
  ];
  /* 용어집: [용어, 영어, 설명, 장] — 상단 검색과 10장 용어집이 함께 쓴다 */
  HB.GLOSSARY = [
    ["하네스", "harness", "모델을 감싸 입력을 조립하고, 도구를 실행하고, 루프를 돌리고, 행동을 제한하는 프로그램 전체.", "what"],
    ["스캐폴드", "scaffold", "하네스와 거의 같은 뜻. 벤치마크에서 모델 바깥의 실행 틀을 가리킬 때 자주 쓴다.", "what"],
    ["에이전트", "agent", "모델이 스스로 다음 행동을 고르고, 그 결과를 보고 다시 고르는 루프로 일하는 시스템.", "what"],
    ["결정과 강제", "decide vs. enforce", "판단은 모델에게, 반드시 지켜야 할 규칙은 하네스 코드에 두라는 설계 원칙.", "what"],
    ["에이전트 루프", "agent loop", "모델 호출 → 도구 실행 → 결과 추가를 종료 조건까지 반복하는 while 루프.", "loop"],
    ["stop_reason", "stop reason", "모델 응답이 왜 끝났는지 알려 주는 값. tool_use면 도구를 실행하고, end_turn이면 루프를 끝낸다.", "loop"],
    ["tool_use / tool_result", "tool call block", "모델이 도구 호출을 요청하는 블록과, 하네스가 실행 결과를 돌려주는 블록. id로 짝을 맞춘다.", "loop"],
    ["턴 상한", "max turns", "루프가 돌 수 있는 최대 횟수. 끝나지 않는 작업의 비용을 묶어 둔다.", "loop"],
    ["헛도는 루프", "doom loop", "같은 행동을 같은 결과로 반복하며 진전이 없는 상태.", "loop"],
    ["시스템 프롬프트", "system prompt", "역할, 규칙, 환경 정보를 담아 매 호출 맨 앞에 들어가는 지시문.", "prompt"],
    ["컨텍스트 엔지니어링", "context engineering", "매 호출에 무엇을, 어떤 순서로, 얼마나 넣을지 설계하는 일.", "prompt"],
    ["프롬프트 캐시", "prompt caching", "이전 호출과 똑같은 앞부분(접두사)의 계산을 재사용해 비용과 지연을 줄이는 기능.", "prompt"],
    ["캐시 접두사", "cache prefix", "캐시가 적용되는 입력의 앞부분. 한 글자라도 바뀌면 그 뒤는 모두 다시 계산한다.", "prompt"],
    ["압축", "compaction", "컨텍스트가 차면 지난 대화를 요약하거나 오래된 도구 결과를 지워 공간을 만드는 일.", "prompt"],
    ["지침 파일", "instruction file", "프로젝트 규칙을 적어 두고 매 세션 시스템 프롬프트에 붙이는 파일.", "prompt"],
    ["ACI", "agent-computer interface", "에이전트가 쓰기 좋게 설계한 도구와 출력 형식. 사람용 UI처럼 에이전트용 인터페이스도 설계 대상이다.", "tools"],
    ["입력 스키마", "input schema", "도구 인자의 이름, 타입, 필수 여부를 적은 JSON Schema. 하네스는 실행 전에 이것으로 검증한다.", "tools"],
    ["도구 검색", "tool search / deferred loading", "모든 도구 정의를 미리 넣지 않고, 필요할 때 검색해 불러오는 방식.", "tools"],
    ["출력 자르기", "truncation", "긴 도구 결과를 앞뒤만 남기거나 파일로 빼서 컨텍스트를 보호하는 일.", "tools"],
    ["MCP", "Model Context Protocol", "도구와 데이터 소스를 표준 방식으로 하네스에 연결하는 개방형 프로토콜.", "tools"],
    ["샌드박스", "sandbox", "에이전트의 명령이 실행되는 격리된 환경. 파일·프로세스·네트워크 접근을 제한한다.", "sandbox"],
    ["피해 반경", "blast radius", "잘못된 행동 하나가 영향을 줄 수 있는 범위.", "sandbox"],
    ["출구 통제", "egress control", "샌드박스에서 나가는 네트워크 요청을 허용 목록으로 제한하는 일. 데이터 유출을 막는다.", "sandbox"],
    ["마이크로VM", "microVM", "가벼운 가상 머신. 컨테이너보다 격리가 강하고 일반 VM보다 빨리 뜬다.", "sandbox"],
    ["콜드 스타트", "cold start", "새 샌드박스를 처음 띄울 때 드는 지연. 미리 띄워 둔 풀(warm pool)로 줄인다.", "sandbox"],
    ["권한 규칙", "permission rule", "도구 호출 패턴마다 allow · ask · deny를 지정한 규칙. 보통 deny가 가장 우선한다.", "permissions"],
    ["권한 모드", "permission mode", "규칙에 없는 호출을 기본적으로 어떻게 처리할지 정한 하네스 전체 설정.", "permissions"],
    ["훅", "hook", "도구 실행 전후, 세션 시작·종료 같은 수명 주기 이벤트에 끼워 넣는 사용자 코드.", "permissions"],
    ["승인 피로", "approval fatigue", "확인 요청이 잦을수록 사람이 내용을 읽지 않고 승인하게 되는 현상.", "permissions"],
    ["가드레일", "guardrail", "모델의 판단과 무관하게 위험한 입출력을 막는 결정적 검사.", "permissions"],
    ["세션", "session", "한 작업의 대화 기록과 상태 묶음. 저장해 두면 나중에 이어 갈 수 있다.", "state"],
    ["체크포인트", "checkpoint", "특정 시점의 대화와 파일 상태 스냅숏. 되감기와 재개의 기준점.", "state"],
    ["되감기", "rewind", "체크포인트로 대화나 코드를 되돌리는 일. 외부로 나간 부작용은 되돌릴 수 없다.", "state"],
    ["멱등성", "idempotency", "같은 요청을 여러 번 보내도 한 번 보낸 것과 결과가 같은 성질.", "state"],
    ["멱등 키", "idempotency key", "재시도한 요청이 같은 요청임을 서버가 알아보도록 붙이는 고유 키.", "state"],
    ["프롬프트 체이닝", "prompt chaining", "작업을 정해진 단계로 나눠 앞 단계 출력을 다음 단계 입력으로 넘기는 워크플로.", "orchestration"],
    ["라우팅", "routing", "입력을 분류해 알맞은 전용 프롬프트나 모델로 보내는 워크플로.", "orchestration"],
    ["오케스트레이터-워커", "orchestrator-workers", "중심 모델이 하위 작업을 동적으로 나눠 워커에게 맡기고 결과를 합치는 패턴.", "orchestration"],
    ["평가자-최적화자", "evaluator-optimizer", "한 모델이 만들고 다른 모델이 평가·피드백하는 반복 패턴.", "orchestration"],
    ["하위 에이전트", "subagent", "독립된 컨텍스트에서 하위 작업을 수행하고 요약만 돌려주는 에이전트.", "orchestration"],
    ["컨텍스트 격리", "context isolation", "탐색의 잡음을 하위 에이전트 안에 가둬 메인 컨텍스트를 깨끗하게 유지하는 일.", "orchestration"],
    ["지수 백오프", "exponential backoff", "실패할 때마다 대기 시간을 두 배씩 늘려 재시도하는 방식.", "reliability"],
    ["지터", "jitter", "재시도 대기 시간에 무작위성을 더해 여러 클라이언트가 동시에 몰리지 않게 하는 것.", "reliability"],
    ["폴백", "fallback", "주 모델이나 도구가 실패할 때 대신 쓰는 대체 경로.", "reliability"],
    ["트레이스 · 스팬", "trace · span", "한 실행의 전체 기록(트레이스)과 그 안의 개별 단계(스팬). 지연과 비용의 원인을 찾는 데 쓴다.", "reliability"],
    ["관측성", "observability", "로그·메트릭·트레이스로 하네스 안에서 일어난 일을 사후에 재구성할 수 있는 정도.", "reliability"],
  ];
  HB.BRAND = "HarnessBook";

  /* ---------------------------------------------------------------- theme */
  const THEME_KEY = "harnessbook-theme";
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) document.documentElement.dataset.theme = saved;
  } catch (e) { /* storage blocked */ }
  const themeCbs = [];
  let colorCache = null;
  HB.onTheme = (cb) => themeCbs.push(cb);
  function themeChanged() { colorCache = null; themeCbs.forEach((cb) => { try { cb(); } catch (e) { console.error(e); } }); }
  HB.isDark = () => {
    const t = document.documentElement.dataset.theme;
    if (t) return t === "dark";
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  };
  HB.toggleTheme = () => {
    const next = HB.isDark() ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    themeChanged();
  };
  if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", themeChanged);

  /** CSS 변수 색을 읽는다. HB.col("accent") 또는 HB.col("--accent") */
  HB.col = (name) => {
    if (!colorCache) colorCache = {};
    const key = name.startsWith("--") ? name : "--" + name;
    if (!(key in colorCache)) colorCache[key] = getComputedStyle(document.documentElement).getPropertyValue(key).trim() || "#888";
    return colorCache[key];
  };
  /** 색에 투명도를 준다 (#rrggbb만) */
  HB.alpha = (hex, a) => {
    const h = hex.replace("#", "");
    if (h.length !== 6) return hex;
    return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
  };
  HB.KIND = { ctx: "ctx", tool: "tool", env: "env", state: "state", guard: "guard", user: "user" };

  /* ---------------------------------------------------------------- math */
  HB.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  HB.lerp = (a, b, t) => a + (b - a) * t;
  HB.rng = (seed) => {
    let s = seed >>> 0 || 1;
    return () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  HB.fmt = (v, d = 0) => {
    if (!isFinite(v)) return "—";
    return Number(v).toLocaleString("ko-KR", { minimumFractionDigits: d, maximumFractionDigits: d });
  };
  HB.si = (v) => {
    const a = Math.abs(v);
    if (a >= 1e6) return (v / 1e6).toFixed(a >= 1e7 ? 0 : 1) + "M";
    if (a >= 1e3) return (v / 1e3).toFixed(a >= 1e4 ? 0 : 1) + "K";
    return String(Math.round(v));
  };
  HB.pct = (v, d = 0) => (isFinite(v) ? (v * 100).toFixed(d) + "%" : "—");
  /** 영어·코드·한국어를 대략 구분해 토큰 수를 어림한다 (책 전체 공통 근사) */
  HB.estTokens = (s) => {
    let ko = 0, other = 0;
    for (const ch of s) { if (/[가-힣]/.test(ch)) ko++; else other++; }
    return Math.ceil(ko * 1.1 + other / 3.6);
  };

  /* ---------------------------------------------------------------- DOM */
  HB.$ = (s, r = document) => r.querySelector(s);
  HB.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  HB.el = (id) => document.getElementById(id);
  HB.val = (id) => +document.getElementById(id).value;
  HB.set = (id, txt, cls) => {
    const e = document.getElementById(id);
    if (!e) return;
    e.textContent = txt;
    if (cls !== undefined) { e.classList.remove("good", "bad", "warn"); if (cls) e.classList.add(cls); }
  };
  HB.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  /** range 입력들을 render에 연결하고, id+"-out" output에 값을 표시한다. */
  HB.wire = (ids, fn, fmts = {}) => {
    const up = () => {
      ids.forEach((id) => {
        const o = document.getElementById(id + "-out");
        if (o) o.textContent = fmts[id] ? fmts[id](HB.val(id)) : document.getElementById(id).value;
      });
      fn();
    };
    ids.forEach((id) => document.getElementById(id).addEventListener("input", up));
    up();
    return up;
  };
  /** .seg 버튼 묶음. data-v 값을 콜백에 넘긴다. */
  HB.seg = (id, cb) => {
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
  HB.canvas = (canvas, opts = {}) => {
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
    HB.onTheme(st.redraw);
    return st;
  };
  /** 보이는 동안만 도는 애니메이션 루프 */
  HB.loop = (el, fn) => {
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
  /** 축과 격자. 반환값 {X,Y,box} */
  HB.axes = (ctx, o) => {
    const b = o.box; // {l,t,r,b} 픽셀 경계
    const [x0, x1] = o.x, [y0, y1] = o.y;
    const lx = o.logx, ly = o.logy;
    const tx = (v) => (lx ? Math.log10(v) : v), ty = (v) => (ly ? Math.log10(v) : v);
    const X = (v) => b.l + ((tx(v) - tx(x0)) / (tx(x1) - tx(x0))) * (b.r - b.l);
    const Y = (v) => b.b - ((ty(v) - ty(y0)) / (ty(y1) - ty(y0))) * (b.b - b.t);
    ctx.save();
    ctx.lineWidth = 1;
    ctx.font = "11px " + getComputedStyle(document.body).getPropertyValue("--mono");
    ctx.fillStyle = HB.col("text-faint");
    (o.xt || []).forEach((v) => {
      const px = X(v);
      ctx.strokeStyle = HB.col("grid");
      ctx.beginPath(); ctx.moveTo(px, b.t); ctx.lineTo(px, b.b); ctx.stroke();
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(o.xf ? o.xf(v) : v, px, b.b + 5);
    });
    let maxW = 0;
    (o.yt || []).forEach((v) => {
      const py = Y(v);
      maxW = Math.max(maxW, ctx.measureText(String(o.yf ? o.yf(v) : v)).width);
      ctx.strokeStyle = HB.col("grid");
      ctx.beginPath(); ctx.moveTo(b.l, py); ctx.lineTo(b.r, py); ctx.stroke();
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText(o.yf ? o.yf(v) : v, b.l - 6, py);
    });
    ctx.strokeStyle = HB.col("axis");
    ctx.beginPath(); ctx.moveTo(b.l, b.t); ctx.lineTo(b.l, b.b); ctx.lineTo(b.r, b.b); ctx.stroke();
    ctx.fillStyle = HB.col("text-dim");
    ctx.font = "12px " + getComputedStyle(document.body).getPropertyValue("--font");
    if (o.xl) { ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText(o.xl, (b.l + b.r) / 2, b.b + 22); }
    if (o.yl) { ctx.save(); ctx.translate(Math.max(8, Math.min(b.l - (o.ylOff || 40), b.l - 15 - maxW)), (b.t + b.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(o.yl, 0, 0); ctx.restore(); }
    ctx.restore();
    return { X, Y, box: b };
  };
  HB.line = (ctx, pts, color, width = 2, dash) => {
    if (!pts.length) return;
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = "round";
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.restore();
  };
  HB.text = (ctx, s, x, y, o = {}) => {
    ctx.save();
    ctx.fillStyle = o.color || HB.col("text");
    ctx.font = `${o.weight || 400} ${o.size || 12}px ${o.mono ? getComputedStyle(document.body).getPropertyValue("--mono") : getComputedStyle(document.body).getPropertyValue("--font")}`;
    ctx.textAlign = o.align || "left";
    ctx.textBaseline = o.base || "middle";
    ctx.fillText(s, x, y);
    ctx.restore();
  };
  HB.rrect = (ctx, x, y, w, h, r) => {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  /* ---------------------------------------------------------------- shell */
  function root() { return document.body.dataset.root || ""; }
  function buildShell() {
    const r = root();
    const home = r || "./";
    const cur = document.body.dataset.chapter;
    const ch = HB.CHAPTERS.find((c) => c.slug === cur);
    const chapterHref = (c) => `${r}chapters/${c.slug}.html`;

    const top = document.createElement("header");
    top.className = "ca-top";
    top.innerHTML = `<div class="in">
      <button class="ca-iconbtn" id="ca-menu" aria-label="전체 목차 열기" aria-expanded="false">☰</button>
      <a class="ca-brand" href="${home}"><img src="${r}favicon.svg" alt="">${HB.BRAND}</a>
      ${ch ? `<span class="ca-crumb"><b>${ch.num}</b>${ch.title}</span>` : `<span class="ca-crumb">에이전트 하네스 교과서</span>`}
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
      ${HB.CHAPTERS.map((c) => `<a href="${chapterHref(c)}" class="${c.slug === cur ? "cur" : ""}"><span>${c.num}</span>${c.title}</a>`).join("")}
      <h4 style="margin-top:20px">SHELF</h4><a href="${r}../"><span>↩</span>열린 실험서가로 돌아가기</a></nav>`;
    document.body.appendChild(drawer);
    const menu = HB.el("ca-menu");
    const setOpen = (v) => { drawer.classList.toggle("open", v); menu.setAttribute("aria-expanded", v); };
    menu.addEventListener("click", () => setOpen(true));
    drawer.querySelector(".scrim").addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    HB.el("ca-theme").addEventListener("click", HB.toggleTheme);

    const main = document.querySelector("main");
    if (main && !main.id) main.id = "content";
    initSearch(r);
    // 실험 제목 옆에 바로가기 링크
    HB.$$(".sim[id]").forEach((s) => {
      const h = s.querySelector(".sim-head");
      if (h && !h.querySelector(".sim-link")) h.insertAdjacentHTML("beforeend", `<a class="sim-link" href="#${s.id}" title="이 실험으로 가는 링크" aria-label="이 실험으로 가는 링크">#</a>`);
    });

    // 장 페이지: 오른쪽 목차와 이전/다음 장
    const layout = document.querySelector(".ca-layout");
    if (layout && main) {
      const secs = HB.$$("main.chapter > section[id]");
      const toc = document.createElement("aside");
      toc.className = "ca-toc";
      toc.innerHTML = "<h4>ON THIS PAGE</h4>" + secs.map((s) => {
        const h = s.querySelector("h2");
        return h ? `<a href="#${s.id}">${h.textContent.replace(/^\d+\.\d+\s*/, "")}</a>` : "";
      }).join("");
      layout.appendChild(toc);
      const links = HB.$$("a", toc);
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
        const i = HB.CHAPTERS.indexOf(ch);
        const prev = HB.CHAPTERS[i - 1], next = HB.CHAPTERS[i + 1];
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
    foot.innerHTML = `<b>${HB.BRAND}</b> · 그림과 실험으로 배우는 에이전트 하네스 설계 · <a href="${r}../">열린 실험서가</a> · <a href="https://github.com/jsg1504/books">GitHub ↗</a><br>실험의 수치는 개념을 보이기 위한 단순화된 모델이며 특정 제품의 측정값이 아닙니다.`;
    document.body.appendChild(foot);
  }


  /* ---------------------------------------------------------------- search */
  function initSearch(r) {
    const q = HB.el("hb-q"), box = HB.el("hb-res");
    if (!q) return;
    const items = () => {
      const ch = HB.CHAPTERS.map((c) => ({ k: "CH." + c.num, t: c.title, d: c.desc, href: `${r}chapters/${c.slug}.html` }));
      const gl = HB.GLOSSARY.map((g) => ({ k: "용어", t: g[0] + (g[1] ? " · " + g[1] : ""), d: g[2], href: `${r}chapters/${g[3]}.html` }));
      return ch.concat(gl);
    };
    const render = () => {
      const v = q.value.trim().toLowerCase();
      if (!v) { box.hidden = true; return; }
      const hit = items().filter((it) => (it.t + " " + it.d).toLowerCase().includes(v)).slice(0, 8);
      box.innerHTML = hit.length ? hit.map((it) => `<a href="${it.href}"><span>${it.k}</span><b>${HB.esc(it.t)}</b><small>${HB.esc(it.d)}</small></a>`).join("") : `<div class="none">“${HB.esc(q.value)}”에 맞는 항목이 없습니다</div>`;
      box.hidden = false;
    };
    q.addEventListener("input", render);
    q.addEventListener("focus", render);
    q.addEventListener("keydown", (e) => { if (e.key === "Enter") { const a = box.querySelector("a"); if (a) location.href = a.href; } if (e.key === "Escape") { q.value = ""; render(); q.blur(); } });
    document.addEventListener("click", (e) => { if (!e.target.closest(".hb-search")) box.hidden = true; });
  }

  function initQuiz() {
    HB.$$(".quiz").forEach((quiz) => {
      const qs = HB.$$(".quiz-q", quiz);
      let score = 0, answered = 0;
      const sc = document.createElement("div");
      sc.className = "quiz-score";
      sc.textContent = `0 / ${qs.length}`;
      quiz.appendChild(sc);
      qs.forEach((q) => {
        HB.$$(".opt", q).forEach((b) => b.addEventListener("click", () => {
          if (q.classList.contains("done")) return;
          q.classList.add("done");
          const ok = b.hasAttribute("data-correct");
          HB.$$(".opt", q).forEach((o) => { if (o.hasAttribute("data-correct")) o.classList.add("right"); });
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
