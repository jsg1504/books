// Small schematics for the laboratory index. Each diagram previews the actual interaction.
const labPlates = [
  [
    "M26 85 Q48 28 170 17|M26 85 Q48 88 170 91",
    "반복 횟수 k",
    "한 번 이상 / 모두 성공",
  ],
  [
    "M25 82h18V57h18V36h18V23h18V12|M115 81h22v-49h23v-19",
    "통과한 테스트",
    "부분점수 / 완전 해결",
  ],
  [
    "M20 52h41l28-24h32l23 24h27|M61 52l28 24h32l23-24",
    "CRM → 일정",
    "최종 상태 검사",
  ],
  ["M15 52h43m0-24h65v47H58zM123 52h52", "입력 → 함수 → 출력", "블랙박스 관찰"],
  [
    "M18 85 C50 82 64 64 81 54 S130 20 171 17|M18 32 C81 33 93 44 171 84",
    "두 곡선의 교점",
    "허용 오차",
  ],
  [
    "M17 24C94 24 66 84 172 84|M17 82C85 82 90 34 172 34",
    "경로 A / 경로 B",
    "끝점 추적",
  ],
  ["M18 69h33V49h34V28h35V16h38|M18 83h144", "도구 호출 단계", "실행 예산"],
  [
    "M18 75l39-33 39 18 63-42|M18 51l39 7 39-30 63 13",
    "동일 과제 A·B",
    "짝지은 비교",
  ],
  [
    "M22 50h139m-139-14v28m139-28v28|M69 76h45m-45-9v18m45-18v18",
    "표본 수 n",
    "신뢰구간 폭",
  ],
  [
    "M22 82V48h26v34M62 82V22h26v60|M113 82V38h26v44",
    "과제별 가중치",
    "평균의 차이",
  ],
  ["M20 52h35l33-29h40m-73 29h84m-84 0 33 28h56", "검색 → 문서", "답과 근거"],
];
function labPlate(index) {
  const [paths, label, caption] = labPlates[index];
  const lines = paths
    .split("|")
    .map(
      (p, j) =>
        '<path d="' +
        p +
        '" fill="none" stroke="' +
        (j ? "#e7ab83" : "#a8df94") +
        '" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>',
    )
    .join("");
  return (
    '<div class="lab-plate" aria-hidden="true"><svg viewBox="0 0 192 104"><path d="M15 14V92H177 M15 66H177 M15 40H177" stroke="#485451" fill="none"/>' +
    lines +
    "</svg><div><b>" +
    label +
    "</b><small>" +
    caption +
    "</small></div></div>"
  );
}
