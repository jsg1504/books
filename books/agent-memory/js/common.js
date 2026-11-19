/* RecallBook 공통 스크립트: 테마, 상단 바, 목차, 퀴즈, 캔버스/차트 도우미.
   <head>에서 동기 로드한다. 장 본문의 인라인 스크립트가 AM.* 도우미를 바로 쓸 수 있도록
   도우미는 즉시 정의하고, 화면 골격은 DOMContentLoaded에서 붙인다. */
(function () {
  "use strict";
  const AM = (window.AM = {});

  AM.CHAPTERS = [
    { slug: "why", num: "01", title: "왜 에이전트에게 기억이 필요한가", desc: "상태 없는 모델, 매 턴 다시 보내는 대화, 그리고 기억의 네 가지 종류.", tags: ["sim", "game"] },
    { slug: "working", num: "02", title: "작업 기억: 컨텍스트 윈도우", desc: "버퍼 전략, KV 캐시의 메모리 비용, 길어질수록 흐려지는 어텐션.", tags: ["sim", "viz"] },
    { slug: "compress", num: "03", title: "압축과 요약", desc: "요약을 거듭할수록 사라지는 사실, 압축 시점, 예산 안에서 남길 것 고르기.", tags: ["sim", "game"] },
    { slug: "retrieval", num: "04", title: "검색 기반 기억", desc: "임베딩 공간, 청킹, 키워드와 의미를 섞는 하이브리드 검색.", tags: ["sim", "viz"] },
    { slug: "writing", num: "05", title: "기억 쓰기: 추출·통합·갱신", desc: "대화에서 사실을 뽑아 ADD·UPDATE·DELETE로 저장소를 고치는 법.", tags: ["sim", "anim"] },
    { slug: "forgetting", num: "06", title: "점수 매기기와 망각", desc: "최근성·중요도·관련성 점수, 망각 곡선, 저장소 정리 정책.", tags: ["sim", "viz"] },
    { slug: "structure", num: "07", title: "구조화된 기억: 그래프·시간·계층", desc: "지식 그래프, 유효 기간이 있는 사실, 운영체제처럼 기억을 페이징하기.", tags: ["sim", "anim"] },
    { slug: "procedural", num: "08", title: "절차 기억: 경험에서 배우기", desc: "실패에서 교훈을 남기는 반성, 스킬 라이브러리, 지침 파일의 예산.", tags: ["sim", "viz"] },
    { slug: "risks", num: "09", title: "오염·프라이버시·평가", desc: "기억에 심어진 인젝션, 지워지지 않는 사본, 기억 능력을 재는 법.", tags: ["sim", "game"] },
    { slug: "design", num: "10", title: "설계 플레이그라운드와 용어집", desc: "부품을 조합해 메모리 시스템을 설계하고, 용어와 종합 퀴즈로 정리한다.", tags: ["sim", "game"] },
  ];
  /* 용어집: [용어, 영어, 설명, 장] — 상단 검색과 10장 용어집이 함께 쓴다 */
  AM.GLOSSARY = [
    ["상태 없음", "stateless", "모델은 호출 사이에 아무것도 저장하지 않는다. 기억은 모두 입력으로 다시 넣어야 한다.", "why"],
    ["작업 기억", "working memory", "지금 컨텍스트 윈도우에 든 정보. 모델이 직접 볼 수 있는 유일한 기억.", "why"],
    ["일화 기억", "episodic memory", "언제 무슨 일이 있었는지에 대한 기록. 대화 로그, 작업 이력.", "why"],
    ["의미 기억", "semantic memory", "시간과 무관하게 참인 사실. 사용자 취향, 사람, 설정.", "why"],
    ["절차 기억", "procedural memory", "일을 하는 방법. 지침, 교훈, 재사용 가능한 스킬과 코드.", "why"],
    ["파라미터 기억", "parametric memory", "학습으로 모델 가중치에 새겨진 지식. 바꾸려면 다시 학습해야 한다.", "why"],
    ["컨텍스트 윈도우", "context window", "모델이 한 번에 입력으로 받을 수 있는 최대 토큰 수.", "working"],
    ["슬라이딩 윈도우", "sliding window", "최근 N턴만 남기고 오래된 대화를 버리는 버퍼 전략.", "working"],
    ["KV 캐시", "KV cache", "이미 처리한 토큰의 키·값 벡터를 저장해 다음 토큰 계산을 빠르게 하는 메모리.", "working"],
    ["GQA", "grouped-query attention", "여러 쿼리 헤드가 키·값 헤드를 공유해 KV 캐시를 줄이는 어텐션 방식.", "working"],
    ["어텐션 희석", "attention dilution", "입력이 길어질수록 관련 토큰 하나에 돌아가는 어텐션 비중이 줄어드는 현상.", "working"],
    ["프롬프트 캐시", "prompt caching", "매 턴 같은 앞부분을 다시 계산하지 않도록 서버가 재사용하는 기능.", "working"],
    ["압축", "compaction", "윈도우가 차면 지난 대화를 요약해 짧게 바꾸는 일.", "compress"],
    ["재귀 요약", "recursive summarization", "요약을 다시 요약해 점점 짧은 기억을 만드는 방식. 정보가 누적 손실된다.", "compress"],
    ["계층 요약", "hierarchical summary", "세부 요약 위에 상위 요약을 쌓아 여러 해상도로 기억하는 구조.", "compress"],
    ["임베딩", "embedding", "텍스트를 의미가 비슷하면 가까워지도록 고정 길이 벡터로 바꾼 것.", "retrieval"],
    ["코사인 유사도", "cosine similarity", "두 벡터 사이 각의 코사인. 방향이 같을수록 1에 가깝다.", "retrieval"],
    ["RAG", "retrieval-augmented generation", "검색한 문서를 컨텍스트에 붙여 답을 생성하는 방식.", "retrieval"],
    ["청킹", "chunking", "긴 문서를 검색 단위로 자르는 일. 크기와 겹침이 검색 품질을 좌우한다.", "retrieval"],
    ["BM25", "BM25", "단어 빈도와 문서 길이로 점수를 매기는 고전 키워드 검색 함수.", "retrieval"],
    ["하이브리드 검색", "hybrid search", "키워드 점수와 의미(벡터) 점수를 섞어 순위를 매기는 검색.", "retrieval"],
    ["ANN 색인", "approximate nearest neighbor", "모든 벡터와 비교하지 않고 근사적으로 최근접 이웃을 찾는 색인(HNSW 등).", "retrieval"],
    ["재순위화", "reranking", "1차 검색 후보를 더 정확한 모델로 다시 정렬하는 단계.", "retrieval"],
    ["기억 추출", "memory extraction", "대화에서 저장할 가치가 있는 사실을 골라 내는 단계.", "writing"],
    ["기억 통합", "consolidation", "새 사실을 기존 기억과 비교해 추가·갱신·삭제·무시를 결정하는 단계.", "writing"],
    ["ADD / UPDATE / DELETE / NOOP", "memory operations", "기억 저장소를 고치는 네 가지 연산.", "writing"],
    ["성찰", "reflection", "쌓인 관찰에서 상위 수준의 결론을 끌어내 새 기억으로 저장하는 일.", "writing"],
    ["중복 제거", "deduplication", "같은 사실을 가리키는 기억을 하나로 합치는 일. 임계값이 너무 낮으면 다른 사실까지 합친다.", "writing"],
    ["최근성", "recency", "기억이 마지막으로 쓰이거나 만들어진 뒤 지난 시간에 따라 줄어드는 점수.", "forgetting"],
    ["중요도", "importance", "기억이 얼마나 의미 있는 사건인지 매긴 점수. 보통 쓸 때 모델이 매긴다.", "forgetting"],
    ["관련성", "relevance", "현재 질문과 기억이 얼마나 관련 있는지. 대개 임베딩 유사도.", "forgetting"],
    ["망각 곡선", "forgetting curve", "시간이 지날수록 기억 유지율이 지수적으로 줄어드는 곡선.", "forgetting"],
    ["TTL", "time to live", "기억이 만료되어 자동 삭제되기까지의 수명.", "forgetting"],
    ["지식 그래프", "knowledge graph", "개체를 노드, 관계를 간선으로 저장하는 구조. 여러 단계 추론에 강하다.", "structure"],
    ["트리플", "triple", "(주어, 관계, 목적어) 한 줄로 표현한 사실.", "structure"],
    ["이중 시간", "bi-temporal", "사실이 참이었던 기간과 시스템이 그것을 안 시점을 따로 기록하는 방식.", "structure"],
    ["가상 컨텍스트 관리", "virtual context management", "운영체제의 가상 메모리처럼 기억을 윈도우 안팎으로 옮기는 방식.", "structure"],
    ["핵심 기억", "core memory", "항상 컨텍스트에 상주하는 작은 기억 영역. 사용자 프로필, 페르소나.", "structure"],
    ["보관 기억", "archival memory", "윈도우 밖 큰 저장소. 필요할 때 검색해서 불러온다.", "structure"],
    ["반성 기반 학습", "Reflexion", "실패한 시도를 언어로 반성하고 그 교훈을 다음 시도의 컨텍스트에 넣는 방법.", "procedural"],
    ["스킬 라이브러리", "skill library", "성공한 행동 절차를 코드나 지침으로 저장해 재사용하는 저장소.", "procedural"],
    ["지침 파일", "instruction file", "에이전트가 매 세션 읽는 프로젝트·사용자 규칙 문서.", "procedural"],
    ["기억 오염", "memory poisoning", "악의적이거나 틀린 내용이 기억에 저장되어 이후 세션에 계속 영향을 주는 것.", "risks"],
    ["출처 표시", "provenance", "기억이 어디서 왔는지(사용자, 도구 결과, 웹 문서)를 함께 저장하는 것.", "risks"],
    ["삭제 전파", "deletion propagation", "원본을 지울 때 요약·임베딩·그래프에 남은 사본까지 함께 지우는 일.", "risks"],
    ["기권", "abstention", "기억에 없는 것을 물으면 지어내지 않고 모른다고 답하는 능력.", "risks"],
    ["지식 갱신", "knowledge update", "바뀐 사실을 반영해 최신 값으로 답하는 능력.", "risks"],
  ];
  AM.BRAND = "RecallBook";

  /* ---------------------------------------------------------------- theme */
  const THEME_KEY = "recallbook-theme";
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) document.documentElement.dataset.theme = saved;
  } catch (e) { /* storage blocked */ }
  const themeCbs = [];
  let colorCache = null;
  AM.onTheme = (cb) => themeCbs.push(cb);
  function themeChanged() { colorCache = null; themeCbs.forEach((cb) => { try { cb(); } catch (e) { console.error(e); } }); }
  AM.isDark = () => {
    const t = document.documentElement.dataset.theme;
    if (t) return t === "dark";
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  };
  AM.toggleTheme = () => {
    const next = AM.isDark() ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    themeChanged();
  };
  if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", themeChanged);

  /** CSS 변수 색을 읽는다. AM.col("accent") 또는 AM.col("--accent") */
  AM.col = (name) => {
    if (!colorCache) colorCache = {};
    const key = name.startsWith("--") ? name : "--" + name;
    if (!(key in colorCache)) colorCache[key] = getComputedStyle(document.documentElement).getPropertyValue(key).trim() || "#888";
    return colorCache[key];
  };
  /** 색에 투명도를 준다 (#rrggbb만) */
  AM.alpha = (hex, a) => {
    const h = hex.replace("#", "");
    if (h.length !== 6) return hex;
    return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
  };
  AM.KIND = { work: "work", epi: "epi", sem: "sem", proc: "proc", fail: "fail", user: "user" };

  /* ---------------------------------------------------------------- math */
  AM.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  AM.lerp = (a, b, t) => a + (b - a) * t;
  AM.rng = (seed) => {
    let s = seed >>> 0 || 1;
    return () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  AM.fmt = (v, d = 0) => {
    if (!isFinite(v)) return "—";
    return Number(v).toLocaleString("ko-KR", { minimumFractionDigits: d, maximumFractionDigits: d });
  };
  AM.si = (v) => {
    const a = Math.abs(v);
    if (a >= 1e6) return (v / 1e6).toFixed(a >= 1e7 ? 0 : 1) + "M";
    if (a >= 1e3) return (v / 1e3).toFixed(a >= 1e4 ? 0 : 1) + "K";
    return String(Math.round(v));
  };
  AM.pct = (v, d = 0) => (isFinite(v) ? (v * 100).toFixed(d) + "%" : "—");
  /** 영어·코드·한국어를 대략 구분해 토큰 수를 어림한다 (책 전체 공통 근사) */
  AM.estTokens = (s) => {
    let ko = 0, other = 0;
    for (const ch of s) { if (/[가-힣]/.test(ch)) ko++; else other++; }
    return Math.ceil(ko * 1.1 + other / 3.6);
  };

  /* ---------------------------------------------------------------- DOM */
  AM.$ = (s, r = document) => r.querySelector(s);
  AM.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  AM.el = (id) => document.getElementById(id);
  AM.val = (id) => +document.getElementById(id).value;
  AM.set = (id, txt, cls) => {
    const e = document.getElementById(id);
    if (!e) return;
    e.textContent = txt;
    if (cls !== undefined) { e.classList.remove("good", "bad", "warn"); if (cls) e.classList.add(cls); }
  };
  AM.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  /** range 입력들을 render에 연결하고, id+"-out" output에 값을 표시한다. */
  AM.wire = (ids, fn, fmts = {}) => {
    const up = () => {
      ids.forEach((id) => {
        const o = document.getElementById(id + "-out");
        if (o) o.textContent = fmts[id] ? fmts[id](AM.val(id)) : document.getElementById(id).value;
      });
      fn();
    };
    ids.forEach((id) => document.getElementById(id).addEventListener("input", up));
    up();
    return up;
  };
  /** .seg 버튼 묶음. data-v 값을 콜백에 넘긴다. */
  AM.seg = (id, cb) => {
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
  AM.canvas = (canvas, opts = {}) => {
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
    AM.onTheme(st.redraw);
    return st;
  };
  /** 보이는 동안만 도는 애니메이션 루프 */
  AM.loop = (el, fn) => {
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
  AM.axes = (ctx, o) => {
    const b = o.box; // {l,t,r,b} 픽셀 경계
    const [x0, x1] = o.x, [y0, y1] = o.y;
    const lx = o.logx, ly = o.logy;
    const tx = (v) => (lx ? Math.log10(v) : v), ty = (v) => (ly ? Math.log10(v) : v);
    const X = (v) => b.l + ((tx(v) - tx(x0)) / (tx(x1) - tx(x0))) * (b.r - b.l);
    const Y = (v) => b.b - ((ty(v) - ty(y0)) / (ty(y1) - ty(y0))) * (b.b - b.t);
    ctx.save();
    ctx.lineWidth = 1;
    ctx.font = "11px " + getComputedStyle(document.body).getPropertyValue("--mono");
    ctx.fillStyle = AM.col("text-faint");
    (o.xt || []).forEach((v) => {
      const px = X(v);
      ctx.strokeStyle = AM.col("grid");
      ctx.beginPath(); ctx.moveTo(px, b.t); ctx.lineTo(px, b.b); ctx.stroke();
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(o.xf ? o.xf(v) : v, px, b.b + 5);
    });
    let maxW = 0;
    (o.yt || []).forEach((v) => {
      const py = Y(v);
      maxW = Math.max(maxW, ctx.measureText(String(o.yf ? o.yf(v) : v)).width);
      ctx.strokeStyle = AM.col("grid");
      ctx.beginPath(); ctx.moveTo(b.l, py); ctx.lineTo(b.r, py); ctx.stroke();
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText(o.yf ? o.yf(v) : v, b.l - 6, py);
    });
    ctx.strokeStyle = AM.col("axis");
    ctx.beginPath(); ctx.moveTo(b.l, b.t); ctx.lineTo(b.l, b.b); ctx.lineTo(b.r, b.b); ctx.stroke();
    ctx.fillStyle = AM.col("text-dim");
    ctx.font = "12px " + getComputedStyle(document.body).getPropertyValue("--font");
    if (o.xl) { ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText(o.xl, (b.l + b.r) / 2, b.b + 22); }
    if (o.yl) { ctx.save(); ctx.translate(Math.max(8, Math.min(b.l - (o.ylOff || 40), b.l - 15 - maxW)), (b.t + b.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(o.yl, 0, 0); ctx.restore(); }
    ctx.restore();
    return { X, Y, box: b };
  };
  AM.line = (ctx, pts, color, width = 2, dash) => {
    if (!pts.length) return;
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = "round";
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.restore();
  };
  AM.text = (ctx, s, x, y, o = {}) => {
    ctx.save();
    ctx.fillStyle = o.color || AM.col("text");
    ctx.font = `${o.weight || 400} ${o.size || 12}px ${o.mono ? getComputedStyle(document.body).getPropertyValue("--mono") : getComputedStyle(document.body).getPropertyValue("--font")}`;
    ctx.textAlign = o.align || "left";
    ctx.textBaseline = o.base || "middle";
    ctx.fillText(s, x, y);
    ctx.restore();
  };
  AM.rrect = (ctx, x, y, w, h, r) => {
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
    const ch = AM.CHAPTERS.find((c) => c.slug === cur);
    const chapterHref = (c) => `${r}chapters/${c.slug}.html`;

    const top = document.createElement("header");
    top.className = "ca-top";
    top.innerHTML = `<div class="in">
      <button class="ca-iconbtn" id="ca-menu" aria-label="전체 목차 열기" aria-expanded="false">☰</button>
      <a class="ca-brand" href="${home}"><img src="${r}favicon.svg" alt="">${AM.BRAND}</a>
      ${ch ? `<span class="ca-crumb"><b>${ch.num}</b>${ch.title}</span>` : `<span class="ca-crumb">에이전트 메모리 교과서</span>`}
      <span class="sp"></span>
      <div class="am-search"><input type="search" id="am-q" placeholder="장 · 용어 검색" aria-label="이 책에서 장과 용어 검색" autocomplete="off"><div class="am-results" id="am-res" hidden></div></div>
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
      ${AM.CHAPTERS.map((c) => `<a href="${chapterHref(c)}" class="${c.slug === cur ? "cur" : ""}"><span>${c.num}</span>${c.title}</a>`).join("")}
      <h4 style="margin-top:20px">SHELF</h4><a href="${r}../"><span>↩</span>열린 실험서가로 돌아가기</a></nav>`;
    document.body.appendChild(drawer);
    const menu = AM.el("ca-menu");
    const setOpen = (v) => { drawer.classList.toggle("open", v); menu.setAttribute("aria-expanded", v); };
    menu.addEventListener("click", () => setOpen(true));
    drawer.querySelector(".scrim").addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    AM.el("ca-theme").addEventListener("click", AM.toggleTheme);

    const main = document.querySelector("main");
    if (main && !main.id) main.id = "content";
    initSearch(r);
    // 실험 제목 옆에 바로가기 링크
    AM.$$(".sim[id]").forEach((s) => {
      const h = s.querySelector(".sim-head");
      if (h && !h.querySelector(".sim-link")) h.insertAdjacentHTML("beforeend", `<a class="sim-link" href="#${s.id}" title="이 실험으로 가는 링크" aria-label="이 실험으로 가는 링크">#</a>`);
    });

    // 장 페이지: 오른쪽 목차와 이전/다음 장
    const layout = document.querySelector(".ca-layout");
    if (layout && main) {
      const secs = AM.$$("main.chapter > section[id]");
      const toc = document.createElement("aside");
      toc.className = "ca-toc";
      toc.innerHTML = "<h4>ON THIS PAGE</h4>" + secs.map((s) => {
        const h = s.querySelector("h2");
        return h ? `<a href="#${s.id}">${h.textContent.replace(/^\d+\.\d+\s*/, "")}</a>` : "";
      }).join("");
      layout.appendChild(toc);
      const links = AM.$$("a", toc);
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
        const i = AM.CHAPTERS.indexOf(ch);
        const prev = AM.CHAPTERS[i - 1], next = AM.CHAPTERS[i + 1];
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
    foot.innerHTML = `<b>${AM.BRAND}</b> · 그림과 실험으로 배우는 에이전트 메모리 · <a href="${r}../">열린 실험서가</a> · <a href="https://github.com/jsg1504/books">GitHub ↗</a><br>실험의 수치는 개념을 보이기 위한 단순화된 모델이며 특정 제품의 측정값이 아닙니다.`;
    document.body.appendChild(foot);
  }


  /* ---------------------------------------------------------------- search */
  function initSearch(r) {
    const q = AM.el("am-q"), box = AM.el("am-res");
    if (!q) return;
    const items = () => {
      const ch = AM.CHAPTERS.map((c) => ({ k: "CH." + c.num, t: c.title, d: c.desc, href: `${r}chapters/${c.slug}.html` }));
      const gl = AM.GLOSSARY.map((g) => ({ k: "용어", t: g[0] + (g[1] ? " · " + g[1] : ""), d: g[2], href: `${r}chapters/${g[3]}.html` }));
      return ch.concat(gl);
    };
    const render = () => {
      const v = q.value.trim().toLowerCase();
      if (!v) { box.hidden = true; return; }
      const hit = items().filter((it) => (it.t + " " + it.d).toLowerCase().includes(v)).slice(0, 8);
      box.innerHTML = hit.length ? hit.map((it) => `<a href="${it.href}"><span>${it.k}</span><b>${AM.esc(it.t)}</b><small>${AM.esc(it.d)}</small></a>`).join("") : `<div class="none">“${AM.esc(q.value)}”에 맞는 항목이 없습니다</div>`;
      box.hidden = false;
    };
    q.addEventListener("input", render);
    q.addEventListener("focus", render);
    q.addEventListener("keydown", (e) => { if (e.key === "Enter") { const a = box.querySelector("a"); if (a) location.href = a.href; } if (e.key === "Escape") { q.value = ""; render(); q.blur(); } });
    document.addEventListener("click", (e) => { if (!e.target.closest(".am-search")) box.hidden = true; });
  }

  function initQuiz() {
    AM.$$(".quiz").forEach((quiz) => {
      const qs = AM.$$(".quiz-q", quiz);
      let score = 0, answered = 0;
      const sc = document.createElement("div");
      sc.className = "quiz-score";
      sc.textContent = `0 / ${qs.length}`;
      quiz.appendChild(sc);
      qs.forEach((q) => {
        AM.$$(".opt", q).forEach((b) => b.addEventListener("click", () => {
          if (q.classList.contains("done")) return;
          q.classList.add("done");
          const ok = b.hasAttribute("data-correct");
          AM.$$(".opt", q).forEach((o) => { if (o.hasAttribute("data-correct")) o.classList.add("right"); });
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
