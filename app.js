"use strict";
const main = document.querySelector("main");
const cardURL = "https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017";
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const chapters = [
  [
    "실험의 단위",
    "모델과 하네스",
    "같은 모델도 실행 환경과 도구가 바뀌면 다른 실험이 된다.",
    "모델은 다음 행동을 제안하고 하네스는 그 행동을 실행해 관찰값을 되돌려 준다. 채점기는 실행이 끝난 뒤 파일, 응답, 환경 상태를 검사한다. 세 역할을 구분하면 리더보드의 한 줄을 실험 조건으로 읽을 수 있다.",
    "1017 모델의 Terminal-Bench 4.0은 Claude Code, DeepSWE v1.1은 Mini-SWE-V2에서 측정했다. 두 점수의 차이에는 과제와 하네스가 함께 바뀐 효과가 들어 있다.",
    ["과제와 초기 상태", "도구 호출과 관찰", "종료 후 독립 검증"],
    "하네스의 효과만 보려면?",
    "같은 모델·과제·예산에서 하네스를 교체한다",
    "두 모델의 최고 점수를 비교한다",
    "모델과 환경을 고정하면 하네스 변화의 효과를 더 잘 분리할 수 있다.",
    "DeepSWE",
    "코딩",
  ],
  [
    "저장소와 테스트",
    "코딩 에이전트",
    "패치, 프로그램 재구현, 저장소 생성의 출발점을 비교한다.",
    "DeepSWE에서는 이미 존재하는 코드의 맥락을 찾아 수정한다. ProgramBench에서는 실행 파일을 관찰해 동작을 재구현한다. NL2Repo에서는 요구사항에서 패키지 구조와 구현을 함께 설계한다.",
    "테스트 100개 중 97개를 통과한 구현은 완전 해결 기준에서는 실패한다. Almost 기준에서는 통과할 수 있고, 테스트 비율 기준에서는 0.97의 부분점수를 얻는다.",
    ["입력 계약 파악", "코드 작성·실행", "숨겨진 테스트"],
    "원본 CLI의 행동을 관찰해서 재구현하는 평가는?",
    "ProgramBench",
    "DeepSWE",
    "ProgramBench는 원본 바이너리에 입력을 넣어 동작을 파악할 수 있다.",
    "ProgramBench",
    "코딩",
  ],
  [
    "행동과 상태",
    "업무 자동화",
    "보고서와 앱의 최종 상태로 업무 성공을 판정한다.",
    "업무 에이전트는 여러 앱에 흩어진 정보를 찾아 기록을 바꾸거나 산출물을 만든다. 상태 기반 평가에서는 완료했다고 답한 뒤에도 실제 레코드가 요청한 값인지 검사할 수 있다.",
    "고객 연락처를 갱신하고 후속 일정을 만들라는 요청이라면 연락처만 바꾼 경우와 두 작업을 끝낸 경우를 구분해야 한다. 정책 준수와 업무 성공을 별도 기준으로 기록하는 설계도 가능하다.",
    ["요청과 업무 정책", "앱 상태 변경", "결과 조건 검사"],
    "일정 생성 성공을 확인할 관찰값은?",
    "캘린더에 저장된 날짜와 참석자",
    "에이전트의 완료 메시지 길이",
    "환경의 실제 이벤트가 요청과 일치하는지 확인한다.",
    "Automation",
    "업무",
  ],
  [
    "그림과 도구",
    "시각 추론",
    "차트 판독과 공간 추론에서 도구 허용 조건을 살펴본다.",
    "Chartography는 실무 도표에서 답을 읽게 하고, BabyVision은 경로 추적이나 패턴 구분 같은 기초 지각을 묻는다. ZeroBench-main은 복수의 시각 단서를 결합하는 문제를 다룬다.",
    "1017 카드의 세 시각 점수에는 모두 도구가 허용된다. 특히 ZeroBench-main의 51.0은 문제당 다섯 기회를 주는 Pass@5다. 도구와 시도 횟수는 결과 옆에 함께 기록해야 한다.",
    ["그림에서 단서 찾기", "확대·계산·추론", "답안 대조"],
    "ZeroBench-main 51.0의 시도 조건은?",
    "다섯 번 중 한 번 이상 정답",
    "다섯 번 모두 정답",
    "공식 릴리스 노트가 Pass@5라고 명시한다.",
    "ZeroBench",
    "시각",
  ],
  [
    "브라우저와 탐색",
    "정보를 찾는 에이전트",
    "정답을 찾는 탐색과 웹 앱의 상태를 바꾸는 행동을 구별한다.",
    "브라우저 에이전트에는 무엇을 찾을지 판단하는 능력과 올바른 페이지를 조작하는 능력이 모두 필요하다. BrowseComp처럼 탐색 끝에 낸 짧은 답을 평가할 수도 있고, WebArena처럼 웹 앱에 남긴 결과를 검사할 수도 있다.",
    "같은 검색창을 써도 제품 가격을 알아오는 과제와 제품을 장바구니에 담는 과제는 검증 방법이 다르다. 전자는 답의 값, 후자는 장바구니 상태가 근거가 된다.",
    ["질문 또는 목표", "검색·이동·조작", "정답 또는 상태 검사"],
    "웹 앱에서 주문 수정 여부를 확인하려면?",
    "저장된 주문 정보를 검사한다",
    "검색한 페이지 수를 센다",
    "페이지 방문 횟수만으로는 주문이 바뀌었는지 알 수 없다.",
    "WebArena",
    "탐색",
  ],
  [
    "반복과 불확실성",
    "점수를 읽는 법",
    "한 번의 성공, 재시도 성공, 반복 신뢰성이 왜 다른지 본다.",
    "독립적이고 성공 확률 p가 같은 시도를 k번 한다고 가정하면 한 번 이상 성공할 확률은 1−(1−p)ᵏ, 모두 성공할 확률은 pᵏ이다. 도구나 환경이 같은 방식으로 계속 실패하면 이 독립 가정은 깨질 수 있다.",
    "p=0.5인 문제에 다섯 번 시도하면 한 번 이상 성공할 확률은 약 96.9%, 매번 성공할 확률은 약 3.1%다. 이 계산은 확률 모형의 예시다. 실제 리더보드는 문제별 실행 결과로 지표를 추정한다.",
    ["문제별 반복 실행", "성공·실패 기록", "문제 간 집계"],
    "독립 시도에서 k를 늘리면 항상 성공할 확률 pᵏ는? (0<p<1)",
    "낮아진다",
    "높아진다",
    "모든 시도가 성공해야 하므로 곱하는 횟수가 늘수록 값이 줄어든다.",
    "ZeroBench",
    "추론",
  ],
];
const scores = [
  [
    "HLE · 전체",
    [42.6, 36.8, 43.5, null, 44.5, 56.3],
    "도구 없이 · 전체 문항 정답률",
  ],
  [
    "HLE · 텍스트",
    [44, 39.1, null, 42, null, null],
    "도구 없이 · 텍스트 문항 정답률",
  ],
  [
    "Terminal-Bench 4.0",
    [42.3, 31.2, 12.6, 37.9, 39.9, 51.8],
    "과제 해결률 · 1017은 Claude Code 사용",
  ],
  [
    "DeepSWE v1.1",
    [77, 74.2, 67.5, 66.9, 73, 74],
    "과제 해결률 · 1017은 Mini-SWE-V2 사용",
  ],
  [
    "ProgramBench",
    [29.1, 20.3, 17.5, 19, 23, 37],
    "동작 재구현 · 이전 모델 카드 지표 Almost@1",
  ],
  [
    "NL2Repo-Bench",
    [68.2, 65.4, 58, 58, 56.8, 75.3],
    "프로젝트별 테스트 통과 비율의 평균",
  ],
  [
    "Automation-Bench v1.0.6",
    [60.5, 54.8, 46.7, 48.8, 45.8, 50.3],
    "업무 워크플로 완료",
  ],
  [
    "Agents’ Last Exam",
    [35.4, 31.8, 27.6, 28.5, 26.7, 28.6],
    "전체 과제 통과율",
  ],
  [
    "Apex Bench v1.1",
    [72.1, 64.6, 47.8, 56.6, 54.3, 65.8],
    "모델 카드 보고값 · 세부 채점 기준 미확인",
  ],
  [
    "Chartography",
    [83, 78.9, 68.1, null, 79.9, 84],
    "전문 차트 판독 · 도구 허용",
  ],
  [
    "BabyVision",
    [92.5, 89.6, 85.7, null, 88.9, 94.1],
    "기초 시각 인지 · 도구 허용",
  ],
  ["ZeroBench-main", [51, 49, 41, null, 53, 52], "도구 허용 · Pass@5"],
];
const models = [
  "Flash 1017",
  "이전 Flash",
  "Kimi K3",
  "GLM-5.3",
  "GPT-5.6 Sol",
  "Opus 5",
];
const palettes = [
  "#b7ef89",
  "#8cd2cf",
  "#e7ba83",
  "#b6a9ed",
  "#a2c9ef",
  "#e99f9a",
];
const nums = (n) => Array.from({ length: n }, (_, i) => i);
function poster(i) {
  const c = palettes[i],
    grid =
      '<pattern id="g' +
      i +
      '" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M18 0H0V18" fill="none" stroke="' +
      c +
      '" opacity=".11"/></pattern>';
  const shapes = [
    () =>
      nums(4)
        .map(
          (j) =>
            '<path d="m90 ' +
            (78 - j * 12) +
            ' 65 -32 65 32 -65 32z" fill="#263732" stroke="' +
            c +
            '" stroke-width="2"/>',
        )
        .join(""),
    () =>
      nums(5)
        .map(
          (j) =>
            '<rect x="' +
            (64 + (j % 2) * 21) +
            '" y="' +
            (23 + j * 17) +
            '" width="' +
            (85 + ((j * 37) % 88)) +
            '" height="6" rx="3" fill="' +
            c +
            '" opacity="' +
            (0.45 + j * 0.11) +
            '"/>',
        )
        .join(""),
    () =>
      '<path d="M50 65H120L169 34H242M120 65L169 96H242" fill="none" stroke="' +
      c +
      '" stroke-width="3"/>' +
      [
        [50, 65],
        [120, 65],
        [169, 34],
        [242, 34],
        [169, 96],
        [242, 96],
      ]
        .map(
          ([x, y]) =>
            '<circle cx="' +
            x +
            '" cy="' +
            y +
            '" r="9" stroke="' +
            c +
            '" fill="#28312d"/>',
        )
        .join(""),
    () =>
      nums(7)
        .map(
          (j) =>
            '<ellipse cx="154" cy="66" rx="' +
            (92 - j * 10) +
            '" ry="' +
            (47 - j * 5) +
            '" fill="none" stroke="' +
            c +
            '" transform="rotate(' +
            (j * 8 - 20) +
            ' 154 66)"/>',
        )
        .join(""),
    () =>
      '<path d="M67 94L121 45L175 83L230 35M67 94L175 83M121 45L230 35" fill="none" stroke="' +
      c +
      '" stroke-width="2"/>' +
      [
        [67, 94],
        [121, 45],
        [175, 83],
        [230, 35],
      ]
        .map(
          ([x, y]) =>
            '<circle cx="' + x + '" cy="' + y + '" r="10" fill="' + c + '"/>',
        )
        .join(""),
    () =>
      nums(18)
        .map((j) => {
          const h = 77 * Math.exp(-((j - 9) ** 2) / 25) + 5;
          return (
            '<rect x="' +
            (53 + j * 11) +
            '" y="' +
            (102 - h) +
            '" width="7" height="' +
            h +
            '" rx="2" fill="' +
            c +
            '"/>'
          );
        })
        .join(""),
  ];
  return (
    '<div class="poster" aria-hidden="true"><svg viewBox="0 0 310 130"><defs>' +
    grid +
    '</defs><rect width="310" height="130" fill="url(#g' +
    i +
    ')"/>' +
    shapes[i]() +
    "</svg></div>"
  );
}
function chapterCard(c, i) {
  return (
    '<a class="card" href="#chapter/' +
    i +
    '">' +
    poster(i) +
    '<div class="cardbody"><span class="counter">CH. ' +
    String(i + 1).padStart(2, "0") +
    "　/　" +
    c[0] +
    "</span><h3>" +
    c[1] +
    " ↗</h3><p>" +
    c[2] +
    "</p></div></a>"
  );
}
function drawMatrix() {
  const k = Number(document.querySelector("#threshold").value);
  let blocks = "",
    count = 0;
  for (let s = 0; s <= 18; s++)
    for (let x = 0; x < 10; x++) {
      let y = s - x;
      if (y < 0 || y > 9) continue;
      const id = x * 10 + y,
        v = 1 + (((id * 37) % 100) % 5),
        pass = v >= k;
      count += pass;
      const xx = 240 + (x - y) * 19,
        yy = 28 + s * 9,
        h = pass ? 13 : 5;
      blocks +=
        '<g transform="translate(' +
        xx +
        " " +
        yy +
        ')"><path d="m-18 0 18 8.6 18-8.6v' +
        h +
        'l-18 8.6-18-8.6z" fill="' +
        (pass ? "#648851" : "#374443") +
        '"/><path d="m0 -8.5 18 8.5-18 8.5-18-8.5z" fill="' +
        (pass ? ["#b4ea88", "#95c677", "#c7eea5"][id % 3] : "#52605e") +
        '"/></g>';
    }
  const svg = document.querySelector(".visual");
  svg.innerHTML =
    '<svg role="img" aria-label="합성 과제 100개 중 ' +
    count +
    '개 통과" viewBox="0 0 480 237">' +
    blocks +
    '<text x="23" y="220" fill="#a7b6af" font-family="monospace" font-size="10">100 TASKS　 /　 GREEN = PASS</text></svg>';
  document.querySelector("#cut").textContent = k + "/5";
  document.querySelector("#passed").textContent = count + " / 100";
}
function home() {
  main.innerHTML =
    '<div class="shell hero"><div><div class="eyebrow">INTERACTIVE FIELD GUIDE</div><h1>에이전트는 어떻게<br><em>평가될까?</em></h1><p>기존 코드를 고치고, 웹을 탐색하고, 업무를 끝내는 AI.<br>과제를 직접 풀고 채점기를 조작하며 점수의 의미를 읽어보세요.</p><div class="actions"><a class="btn primary" href="#chapter/0">첫 장 읽기　→</a><a class="btn" href="#experiments">실험 고르기　↗</a></div></div><div class="instrument"><div class="ibar"><span class="tiny">FIG. 01　/　채점 기준 실험</span><span class="live">●　합성 과제 100개</span></div><div class="visual"></div><p class="matrix-note">블록 하나가 과제 하나입니다. 통과에 필요한 조건 수를 바꿔보세요.</p><div class="ifoot"><label for="threshold">최소 통과 항목　<input type="range" id="threshold" min="1" max="5" value="3"> <b id="cut"></b></label><output id="passed" aria-live="polite"></output></div></div></div><section class="section"><div class="shell"><div class="secthead"><div><span class="eyebrow">CHAPTER INDEX</span><h2>여섯 장으로 읽는 평가 설계</h2></div><a href="#catalog">도감 열기 ↗</a></div><div class="cards">' +
    chapters.map(chapterCard).join("") +
    '</div></div></section><section class="section"><div class="shell"><div class="secthead"><div><span class="eyebrow">LAB NOTES</span><h2>점수를 바꿔보는 실험</h2></div><a href="#experiments">실험 11개 보기 ↗</a></div><div class="cards">' +
    [0, 3, 7]
      .map(
        (j) =>
          '<a class="card" href="#lab/' +
          j +
          '">' +
          labPlate(j) +
          '<div class="cardbody"><h3>' +
          window.labs[j].title +
          " ↗</h3><p>" +
          window.labs[j].summary +
          "</p></div></a>",
      )
      .join("") +
    "</div></div></section>";
  drawMatrix();
  document.querySelector("#threshold").oninput = drawMatrix;
}
function head(k, title, sub) {
  return (
    '<a class="crumb" href="#home">← Bench Atlas</a><div class="pagehead"><div class="eyebrow" style="margin-top:24px">' +
    k +
    "</div><h1>" +
    title +
    '</h1><p class="sub">' +
    sub +
    "</p></div>"
  );
}
function page(body) {
  main.innerHTML = '<div class="shell page">' + body + "</div>";
}
function chapter(i) {
  const c = chapters[i];
  page(
    head("CHAPTER " + (i + 1) + " / 6", c[1], c[2]) +
      '<div class="chapterlayout"><div>' +
      poster(i) +
      '<article class="panel"><h2>' +
      c[0] +
      "</h2><p>" +
      c[3] +
      "</p><p>" +
      c[4] +
      '</p></article><div class="stages">' +
      c[5]
        .map(
          (x, j) => '<div class="stage"><b>0' + (j + 1) + "</b>" + x + "</div>",
        )
        .join("") +
      '</div></div><aside><section class="panel"><span class="tiny">CHECKPOINT</span><h2>' +
      esc(c[6]) +
      '</h2><div class="controls">' +
      (i % 2 ? [8, 7] : [7, 8])
        .map(
          (j) =>
            '<button class="choice" data-correct="' +
            (j === 7) +
            '">' +
            esc(c[j]) +
            "</button>",
        )
        .join("") +
      '</div><p class="quizout" role="status"></p></section><section class="panel"><h2>직접 확인하기</h2><p><a class="inline-link" href="#catalog/' +
      encodeURIComponent(c[10]) +
      '">' +
      esc(c[10]) +
      ' 도감 →</a></p><p><a class="inline-link" href="#lab/' +
      ([7, 1, 2, 4, 10, 0][i] < window.labs.length
        ? [7, 1, 2, 4, 10, 0][i]
        : 0) +
      '">관련 원리 실험 →</a></p></section></aside></div><div class="pageturn"><a href="#chapters">전체 목차</a><a href="' +
      (i < 5 ? "#chapter/" + (i + 1) : "#compare") +
      '">' +
      (i < 5 ? "다음 장 읽기" : "발표 점수 비교") +
      " →</a></div>",
  );
  document.querySelectorAll("[data-correct]").forEach(
    (b) =>
      (b.onclick = () => {
        document.querySelector(".quizout").textContent =
          b.dataset.correct === "true"
            ? "정답입니다. " + c[9]
            : "다시 생각해 보세요. " + c[9];
      }),
  );
}
function experiments(i) {
  const ls = window.labs;
  if (ls[i]) {
    page(
      head(
        "EXPERIMENT " + String(i + 1).padStart(2, "0"),
        esc(ls[i].title),
        esc(ls[i].summary),
      ) +
        '<a class="inline-link" href="#experiments">← 실험 목록</a><section class="labbox"></section><div class="pageturn"><a href="#experiments">전체 실험</a><a href="#lab/' +
        ((i + 1) % ls.length) +
        '">다음 실험 →</a></div>',
    );
    ls[i].mount(document.querySelector(".labbox"));
    return;
  }
  page(
    head(
      "LABORATORY",
      "인터랙티브 실험실",
      "교육용 예제로 검증기와 측정 방식을 직접 바꿔보세요.",
    ) +
      '<div class="lablist">' +
      ls
        .map(
          (l, j) =>
            '<a class="card" href="#lab/' +
            j +
            '">' +
            labPlate(j) +
            '<span class="counter">LAB ' +
            String(j + 1).padStart(2, "0") +
            "</span><h3>" +
            esc(l.title) +
            " ↗</h3><p>" +
            esc(l.summary) +
            "</p></a>",
        )
        .join("") +
      "</div>",
  );
}
function catalog(query) {
  page(
    head(
      "FIELD CATALOG",
      "벤치마크 도감",
      "과제의 입력, 에이전트가 하는 일, 검증 방법을 펼쳐서 비교하세요.",
    ) +
      '<input class="search" type="search" aria-label="벤치마크 검색" placeholder="이름이나 평가 방식 검색"><div class="chips"></div><p id="found" class="muted" role="status"></p><div id="entries"></div>',
  );
  let group = "전체";
  const search = document.querySelector(".search");
  search.value = query || "";
  const groups = ["전체", ...new Set(window.catalog.map((c) => c.group))];
  const chips = document.querySelector(".chips");
  chips.innerHTML = groups
    .map((x) => "<button>" + esc(x) + "</button>")
    .join("");
  function update() {
    const q = search.value.trim().toLowerCase();
    const cs = window.catalog.filter(
      (c) =>
        (group === "전체" || group === c.group) &&
        [c.name, c.input, c.action, c.grade, c.metric]
          .join(" ")
          .toLowerCase()
          .includes(q),
    );
    document.querySelector("#found").textContent = cs.length + "개 벤치마크";
    chips.querySelectorAll("button").forEach((b) => {
      b.classList.toggle("active", b.textContent === group);
      b.setAttribute("aria-pressed", String(b.textContent === group));
    });
    document.querySelector("#entries").innerHTML =
      cs
        .map(
          (c) =>
            "<details " +
            (cs.length === 1 ? "open" : "") +
            '><summary><span class="tag">' +
            esc(c.group) +
            "</span>" +
            esc(c.name) +
            "</summary><dl>" +
            [
              ["입력", c.input],
              ["에이전트의 작업", c.action],
              ["채점 방법", c.grade],
              ["지표", c.metric],
              ["1017 보고값", c.score],
              ["해석", c.note],
            ]
              .filter((a) => a[1])
              .map(([k, v]) => "<dt>" + k + "</dt><dd>" + esc(v) + "</dd>")
              .join("") +
            '<dt>출처</dt><dd><a href="' +
            esc(c.source) +
            '" target="_blank" rel="noopener">원문 확인 ↗</a></dd></dl></details>',
        )
        .join("") ||
      '<p class="panel">조건에 맞는 항목이 없습니다. 검색어나 분류를 바꿔보세요.</p>';
  }
  chips.onclick = (e) => {
    if (e.target.tagName === "BUTTON") {
      group = e.target.textContent;
      update();
    }
  };
  search.oninput = update;
  update();
}
function compare() {
  page(
    head(
      "RELEASE COMPARISON",
      "모델 카드 점수 비교",
      "2026년 10월 17일 DeepSeek가 발표한 표에서 같은 과제의 모델별 점수를 살펴보세요.",
    ) +
      '<section class="panel"><label for="bench">벤치마크 선택　</label><select id="bench">' +
      scores
        .map((s, i) => '<option value="' + i + '">' + s[0] + "</option>")
        .join("") +
      '</select><p class="sub" id="metric"></p><div id="bars"></div><p class="muted">막대 범위 0–100 · 미보고 항목은 빈 막대로 표시합니다.</p></section><a class="source" href="' +
      cardURL +
      '">DeepSeek 공식 모델 카드 ↗</a>',
  );
  const sel = document.querySelector("#bench");
  sel.value = "2";
  function draw() {
    const [, vals, metric] = scores[sel.value];
    document.querySelector("#metric").textContent = metric;
    document.querySelector("#bars").innerHTML = vals
      .map(
        (v, j) =>
          '<div class="barrow"><span>' +
          models[j] +
          '</span><span class="track"><i class="fill" style="width:' +
          (v ?? 0) +
          '%"></i></span><b>' +
          (v === null ? "—" : v.toFixed(1)) +
          "</b></div>",
      )
      .join("");
  }
  sel.onchange = draw;
  draw();
}
function route() {
  const [key, arg] = location.hash.slice(1).split("/");
  if (key === "chapter" && /^\d+$/.test(arg) && chapters[+arg]) chapter(+arg);
  else if (key === "chapters")
    page(
      head(
        "CONTENTS",
        "교과서 목차",
        "각 장에서 개념을 읽고, 확인 문제와 실험으로 이어가세요.",
      ) +
        '<div class="cards">' +
        chapters.map(chapterCard).join("") +
        "</div>",
    );
  else if (key === "experiments" || key === "lab") experiments(Number(arg));
  else if (key === "catalog") {
    let q = "";
    try {
      q = decodeURIComponent(arg || "");
    } catch {}
    catalog(q);
  } else if (key === "compare") compare();
  else home();
  document
    .querySelectorAll("nav a")
    .forEach((a) =>
      a.classList.toggle(
        "active",
        a.hash ===
          "#" + ({ chapter: "chapters", lab: "experiments" }[key] || key),
      ),
    );
  document.title =
    (document.querySelector("main h1")?.textContent || "홈") + " · Bench Atlas";
  window.scrollTo({ top: 0, behavior: "instant" });
}
window.addEventListener("hashchange", () => {
  route();
  main.focus({ preventScroll: true });
});
route();

document.querySelector(".skip").onclick = (event) => {
  event.preventDefault();
  main.focus();
  main.scrollIntoView();
};
