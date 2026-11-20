/* WikiBook 예제 위키: 여러 장의 실험이 함께 쓰는 작은 연구 위키(“LLM과 검색”).
   본문은 아주 작은 마크다운: "# 제목", "## 소제목", "- 항목", 나머지는 문단. [[id|보이는 이름]]은 위키링크. */
(function () {
  "use strict";
  const WK = window.WK;
  const P = {};
  const add = (id, path, type, title, fm, body, topic) => (P[id] = { id, path, type, title, fm, body: body.trim(), topic });

  add("index", "index.md", "index", "색인", "type: index\nupdated: 2026-11-18", `
# 색인
위키의 모든 페이지를 한 줄 요약과 함께 모아 둔다. 질의할 때 가장 먼저 읽는다.
## 개념
- [[c-rag|검색 증강 생성]] — 질문마다 원문 조각을 찾아 답하는 방식
- [[c-wiki|LLM 위키]] — 에이전트가 쓰고 고치는 누적 지식 베이스
- [[c-ctx|컨텍스트 창]] — 모델이 한 번에 읽는 토큰의 한계
- [[c-bm25|BM25]] — 단어 빈도 기반 키워드 검색 점수
- [[c-emb|임베딩 검색]] — 의미가 가까운 문서를 벡터로 찾기
- [[c-hybrid|하이브리드 검색]] — 키워드와 벡터 결과를 합치기
- [[c-zettel|제텔카스텐]] — 한 장에 한 생각, 번호와 링크의 메모 상자
## 원천 요약
- [[src-rag|Lewis 외 2020]] — 검색 증강 생성 논문
- [[src-lim|Liu 외 2023]] — 긴 문맥의 가운데를 놓치는 모델
- [[src-rrf|Cormack 외 2009]] — 역순위 융합
- [[src-wiki|카파시 2026]] — LLM Wiki 메모
- [[src-memex|부시 1945]] — As We May Think
## 인물 · 도구
- [[e-karpathy|안드레이 카파시]] · [[e-bush|버니바 부시]] · [[e-obsidian|옵시디언]]
## 분석
- [[a-ragwiki|비교: RAG와 LLM 위키]] — 질의에서 나온 답을 저장한 페이지`, [0, 0, 0, 0, 0, 0, 0, 0]);

  add("log", "log.md", "log", "기록", "type: log", `
# 기록
## [2026-11-02] ingest | Lewis 외 2020 검색 증강 생성
요약 페이지 생성, [[c-rag|검색 증강 생성]] 개념 페이지 생성, 색인 갱신. 페이지 4개 수정.
## [2026-11-05] ingest | Liu 외 2023 Lost in the Middle
[[c-ctx|컨텍스트 창]]에 위치 효과 절 추가, [[c-rag|검색 증강 생성]]에 조각 순서 주의 추가. 페이지 5개 수정.
## [2026-11-09] ingest | 카파시 2026 LLM Wiki
[[c-wiki|LLM 위키]] 생성, [[e-karpathy|안드레이 카파시]] 생성, [[e-obsidian|옵시디언]] 생성. 페이지 7개 수정.
## [2026-11-12] query | RAG와 위키는 무엇이 다른가
답을 [[a-ragwiki|비교 페이지]]로 저장.
## [2026-11-15] ingest | Cormack 외 2009 역순위 융합
[[c-hybrid|하이브리드 검색]] 생성, [[c-bm25|BM25]]와 [[c-emb|임베딩 검색]]에 융합 절 추가. 페이지 5개 수정.
## [2026-11-18] lint | 주간 점검
고아 페이지 1개([[c-zettel|제텔카스텐]])에 링크 추가, 빨간 링크 2개 기록(GraphRAG, 니클라스 루만).`, [0, 0, 0, 0, 0, 0, 0, 0]);

  add("src-rag", "sources/lewis-2020-rag.md", "source", "Lewis 외 2020 · 검색 증강 생성", "type: source\nraw: raw/lewis-2020.pdf\nupdated: 2026-11-02", `
# Lewis 외 2020 · 검색 증강 생성
질문이 들어오면 위키백과 문단 수백만 개 가운데 비슷한 문단을 찾아 생성 모델의 입력에 붙이는 방법을 제안했다. 매개변수에 기억된 지식과 검색으로 꺼낸 지식을 함께 쓴다.
## 이 위키에 준 영향
- [[c-rag|검색 증강 생성]] 페이지의 출발점
- 검색기는 질의와 문단을 벡터로 바꾸는 [[c-emb|임베딩 검색]]을 썼다
## 주의
최신 정보 반영과 출처 제시가 장점으로 꼽혔지만, 여러 문서를 엮어야 하는 질문은 여전히 어렵다.`, [0.9, 0.1, 0.2, 0.3, 0.1, 0, 0, 0.1]);

  add("src-lim", "sources/liu-2023-lost-in-the-middle.md", "source", "Liu 외 2023 · 가운데에서 길을 잃다", "type: source\nraw: raw/liu-2023.pdf\nupdated: 2026-11-05", `
# Liu 외 2023 · 가운데에서 길을 잃다
긴 입력 속 정답 문서의 위치를 바꿔 가며 질의응답 정확도를 쟀다. 정답이 맨 앞이나 맨 끝에 있을 때보다 가운데 있을 때 정확도가 눈에 띄게 낮았다. 정확도 곡선이 U자 모양이다.
## 이 위키에 준 영향
- [[c-ctx|컨텍스트 창]]: 창이 크다고 다 읽는 것은 아니다
- [[c-rag|검색 증강 생성]]: 찾은 조각을 많이 넣을수록 좋은 것이 아니다`, [0.4, 0.1, 0.9, 0.2, 0, 0, 0, 0]);

  add("src-wiki", "sources/karpathy-2026-llm-wiki.md", "source", "카파시 2026 · LLM Wiki 메모", "type: source\nraw: raw/karpathy-llm-wiki.md\nupdated: 2026-11-09", `
# 카파시 2026 · LLM Wiki 메모
원천 자료, 위키, 스키마의 세 층으로 개인 지식 베이스를 만드는 패턴. 에이전트가 원천을 읽어 마크다운 페이지를 쓰고 고치며, 사람은 자료를 고르고 질문한다.
## 핵심 작업
- 수집: 원천 하나가 열 페이지 남짓을 바꾼다
- 질의: 색인을 먼저 읽고 페이지를 연다. 좋은 답은 새 페이지로
- 린트: 모순, 낡은 주장, 고아 페이지를 찾는다
## 도구
위키는 git 저장소이고, [[e-obsidian|옵시디언]]으로 보며, 규모가 커지면 로컬 검색 엔진을 붙인다.
## 연결
[[c-wiki|LLM 위키]] · [[e-karpathy|안드레이 카파시]] · [[src-memex|부시 1945]]`, [0.3, 0.9, 0.2, 0, 0.3, 0.6, 0.2, 0.5]);

  add("src-rrf", "sources/cormack-2009-rrf.md", "source", "Cormack 외 2009 · 역순위 융합", "type: source\nraw: raw/cormack-2009.pdf\nupdated: 2026-11-15", `
# Cormack 외 2009 · 역순위 융합
여러 검색 시스템의 결과를 합칠 때, 점수 대신 순위만 써서 문서마다 1/(k + 순위)를 더하는 방법. k = 60이 기본값으로 널리 쓰인다. 점수 보정 없이도 개별 시스템보다 나은 결과를 냈다.
## 이 위키에 준 영향
- [[c-hybrid|하이브리드 검색]] 페이지의 근거
- [[c-bm25|BM25]]와 [[c-emb|임베딩 검색]]을 합치는 기본 방법`, [0.6, 0, 0, 0.9, 0, 0, 0, 0]);

  add("src-memex", "sources/bush-1945-as-we-may-think.md", "source", "부시 1945 · As We May Think", "type: source\nraw: raw/bush-1945.html\nupdated: 2026-11-09", `
# 부시 1945 · As We May Think
과학자가 읽는 문헌이 너무 많아졌다는 문제의식에서, 문서를 저장하고 문서 사이의 연상 경로를 이어 두는 책상 크기의 장치 메멕스를 상상했다.
## 연결
[[e-bush|버니바 부시]] · [[c-wiki|LLM 위키]]의 먼 조상 · [[c-zettel|제텔카스텐]]과 같은 꿈`, [0.1, 0.6, 0, 0, 0.9, 0.1, 0.3, 0.3]);

  add("c-rag", "concepts/rag.md", "concept", "검색 증강 생성", "type: concept\nsources: [src-rag, src-lim]\nupdated: 2026-11-05", `
# 검색 증강 생성 (RAG)
질문이 오면 원문을 잘게 나눈 조각 가운데 비슷한 것 몇 개를 찾아 모델의 컨텍스트에 넣고 답하게 하는 방식. 처음 제안은 [[src-rag|Lewis 외 2020]].
## 장점
- 원문을 그대로 근거로 보여 줄 수 있다
- 자료를 바꾸면 바로 반영된다
## 약점
- 종합을 질문할 때마다 처음부터 한다
- 조각을 많이 넣으면 가운데 것을 놓친다 ([[src-lim|Liu 외 2023]])
## 함께 보기
[[c-emb|임베딩 검색]] · [[c-bm25|BM25]] · [[a-ragwiki|비교: RAG와 LLM 위키]] · [[graphrag|GraphRAG]]`, [1, 0.3, 0.4, 0.4, 0, 0, 0, 0.1]);

  add("c-wiki", "concepts/llm-wiki.md", "concept", "LLM 위키", "type: concept\nsources: [src-wiki, src-memex]\nupdated: 2026-11-09", `
# LLM 위키
에이전트가 원천 자료를 읽어 서로 링크된 마크다운 페이지를 직접 쓰고 고치는 지식 베이스. [[src-wiki|카파시 2026]]이 패턴으로 정리했다.
## 세 층
- 원천: 읽기 전용
- 위키: 에이전트가 소유
- 스키마: 구조와 절차의 규칙 (CLAUDE.md, AGENTS.md)
## 왜 지금
사람이 꾸리는 위키는 정리의 지루함 때문에 버려진다. 에이전트는 지루해하지 않는다. 꿈 자체는 [[e-bush|버니바 부시]]의 메멕스까지 거슬러 올라간다.
## 함께 보기
[[a-ragwiki|비교: RAG와 LLM 위키]] · [[c-zettel|제텔카스텐]] · [[e-obsidian|옵시디언]]`, [0.4, 1, 0.2, 0, 0.3, 0.5, 0.1, 0.6]);

  add("c-ctx", "concepts/context-window.md", "concept", "컨텍스트 창", "type: concept\nsources: [src-lim]\nupdated: 2026-11-05", `
# 컨텍스트 창
모델이 한 번에 읽을 수 있는 토큰의 최대량. 위키의 색인과 열어 본 페이지가 모두 이 창에 들어가야 한다.
## 위치 효과
긴 입력의 가운데에 있는 정보는 덜 쓰인다 ([[src-lim|Liu 외 2023]]). 그래서 짧고 정리된 페이지 몇 개가 긴 원문 조각 여러 개보다 나을 때가 많다.
## 함께 보기
[[c-rag|검색 증강 생성]] · [[c-wiki|LLM 위키]]`, [0.3, 0.2, 1, 0, 0, 0.1, 0, 0]);

  add("c-bm25", "concepts/bm25.md", "concept", "BM25", "type: concept\nsources: [src-rrf]\nupdated: 2026-11-15", `
# BM25
질의의 단어가 문서에 몇 번 나오는지, 그 단어가 전체에서 얼마나 드문지, 문서가 얼마나 긴지를 함께 따지는 키워드 검색 점수. 정확한 용어, 고유명사, 오류 코드를 찾을 때 강하다.
## 매개변수
- k1: 같은 단어가 반복될 때 점수가 포화되는 속도
- b: 긴 문서를 얼마나 깎을지
## 함께 보기
[[c-emb|임베딩 검색]] · [[c-hybrid|하이브리드 검색]]`, [0.7, 0, 0, 1, 0, 0.2, 0, 0]);

  add("c-emb", "concepts/embedding-search.md", "concept", "임베딩 검색", "type: concept\nsources: [src-rag, src-rrf]\nupdated: 2026-11-15", `
# 임베딩 검색
문장을 고차원 벡터로 바꾸고, 질의 벡터와 가까운 문서를 찾는 검색. 단어가 달라도 뜻이 가까우면 찾는다. 대신 정확한 이름이나 숫자에는 약할 수 있다.
## 함께 보기
[[c-bm25|BM25]] · [[c-hybrid|하이브리드 검색]] · [[c-rag|검색 증강 생성]]`, [0.8, 0.1, 0.1, 0.8, 0, 0.1, 0, 0.1]);

  add("c-hybrid", "concepts/hybrid-search.md", "concept", "하이브리드 검색", "type: concept\nsources: [src-rrf]\nupdated: 2026-11-15", `
# 하이브리드 검색
[[c-bm25|BM25]]와 [[c-emb|임베딩 검색]]을 함께 돌리고 결과를 합치는 검색. 합칠 때는 보통 [[src-rrf|역순위 융합]]을 쓴다. 위키가 커져 색인 하나로 버티기 어려울 때 붙이는 첫 도구다.`, [0.8, 0.2, 0, 1, 0, 0.3, 0, 0]);

  add("c-zettel", "concepts/zettelkasten.md", "concept", "제텔카스텐", "type: concept\nsources: []\nupdated: 2026-11-18", `
# 제텔카스텐
사회학자 [[niklas-luhmann|니클라스 루만]]이 쓴 메모 상자 방법. 카드 한 장에 생각 하나, 카드마다 번호, 카드 사이에 참조를 적는다. 원자적 노트와 링크라는 생각이 LLM 위키의 페이지 설계로 이어진다.
## 함께 보기
[[c-wiki|LLM 위키]] · [[src-memex|부시 1945]]`, [0, 0.7, 0, 0, 0.6, 0, 0.2, 0.9]);

  add("e-karpathy", "entities/andrej-karpathy.md", "entity", "안드레이 카파시", "type: entity\nsources: [src-wiki]\nupdated: 2026-11-09", `
# 안드레이 카파시
AI 연구자이자 교육자. 2026년 봄 [[src-wiki|LLM Wiki 메모]]를 공개해 에이전트가 유지하는 개인 위키 패턴을 정리했다.
## 함께 보기
[[c-wiki|LLM 위키]]`, [0, 0.6, 0, 0, 0.1, 0.2, 1, 0.2]);

  add("e-bush", "entities/vannevar-bush.md", "entity", "버니바 부시", "type: entity\nsources: [src-memex]\nupdated: 2026-11-09", `
# 버니바 부시
미국의 공학자이자 과학 행정가. 1945년 에세이 [[src-memex|As We May Think]]에서 메멕스를 상상했다.
## 함께 보기
[[c-wiki|LLM 위키]]`, [0, 0.4, 0, 0, 1, 0, 1, 0.2]);

  add("e-obsidian", "entities/obsidian.md", "entity", "옵시디언", "type: entity\nsources: [src-wiki]\nupdated: 2026-11-09", `
# 옵시디언
로컬 마크다운 폴더를 노트로 보여 주는 앱. 위키링크, 백링크, 그래프 보기를 지원해 LLM 위키를 사람이 둘러보는 창으로 자주 쓰인다. 에이전트가 쓰고, 사람은 옵시디언으로 읽는다.
## 함께 보기
[[c-wiki|LLM 위키]] · [[src-wiki|카파시 2026]]`, [0, 0.6, 0, 0.1, 0, 1, 0.2, 0.5]);

  add("a-ragwiki", "analyses/rag-vs-wiki.md", "analysis", "비교 · RAG와 LLM 위키", "type: analysis\nfrom: query 2026-11-12\nsources: [c-rag, c-wiki, src-lim]\nupdated: 2026-11-12", `
# 비교 · RAG와 LLM 위키
질의 “RAG와 위키는 무엇이 다른가”의 답을 저장한 페이지.
## 요점
- 종합 시점: [[c-rag|RAG]]는 질문할 때, [[c-wiki|위키]]는 원천을 읽을 때
- 컨텍스트: 정리된 페이지 몇 개가 원문 조각 여러 개보다 가운데 손실이 적다 ([[src-lim|Liu 외 2023]])
- 비용: 위키는 선투자가 크고 질문당 비용이 작다
## 열린 질문
두 방식을 섞는 [[graphrag|GraphRAG]] 같은 접근과의 비교는 아직 원천이 없다.`, [0.8, 0.8, 0.5, 0.2, 0, 0.1, 0, 0.2]);

  const ORDER = Object.keys(P);
  const LINK = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  /** 페이지가 가리키는 링크 id (중복 제거, 순서 유지) */
  const links = (id) => { const out = []; let m; const s = P[id].body; LINK.lastIndex = 0; while ((m = LINK.exec(s))) if (!out.includes(m[1])) out.push(m[1]); return out; };
  const backlinks = (id) => ORDER.filter((o) => o !== id && links(o).includes(id));
  /** 미니 마크다운 → HTML. 링크는 span.wl[data-p], 없는 페이지는 .red */
  function render(id) {
    const pg = P[id];
    const inl = (s) => WK.esc(s).replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, a, b) => `<span class="wl${P[a] ? "" : " red"}" data-p="${a}" title="${P[a] ? P[a].path : "아직 없는 페이지"}">${b || a}</span>`);
    let html = "", inList = false;
    pg.body.split("\n").forEach((ln) => {
      const t = ln.trim();
      if (!t) return;
      if (t.startsWith("- ")) { if (!inList) { html += "<ul>"; inList = true; } html += `<li>${inl(t.slice(2))}</li>`; return; }
      if (inList) { html += "</ul>"; inList = false; }
      if (t.startsWith("## ")) html += `<h5>${inl(t.slice(3))}</h5>`;
      else if (t.startsWith("# ")) html += `<h4>${inl(t.slice(2))}</h4>`;
      else html += `<p>${inl(t)}</p>`;
    });
    if (inList) html += "</ul>";
    return html;
  }
  /** 검색용 평문 */
  const plain = (id) => P[id].title + " " + P[id].body.replace(LINK, (_, a, b) => b || a).replace(/[#\-\[\]|]/g, " ");
  const FOLDERS = [["", ["index", "log"]], ["sources/", ORDER.filter((k) => P[k].type === "source")], ["concepts/", ORDER.filter((k) => P[k].type === "concept")], ["entities/", ORDER.filter((k) => P[k].type === "entity")], ["analyses/", ORDER.filter((k) => P[k].type === "analysis")]];
  const TYPE_COL = { index: "accent", log: "accent", source: "tool", concept: "state", entity: "accent-2", analysis: "ctx" };
  WK.wiki = { pages: P, order: ORDER, links, backlinks, render, plain, folders: FOLDERS, typeCol: TYPE_COL,
    TOPICS: ["검색", "지식 베이스", "컨텍스트", "순위", "역사", "도구", "인물", "메모·글쓰기"] };
})();
