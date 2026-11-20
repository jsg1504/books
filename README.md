# 열린 실험서가

그림과 실험으로 배우는 한국어 책을 주제별로 출간하는 프로젝트입니다. 첫 책은 AI 에이전트의 과제와 채점 방식을 다룹니다. 각 책은 고유한 주소, 목차, 본문과 시각 자료를 가지며 루트 서가에서 발견할 수 있습니다.

**[전체 서가](https://jsg1504.github.io/books/)** · [첫 책 펼치기](https://jsg1504.github.io/books/agent-benchmarks/) · [코딩 에이전트 교과서](https://jsg1504.github.io/books/coding-agents/) · [에이전트 메모리 교과서](https://jsg1504.github.io/books/agent-memory/) · [에이전트 하네스 교과서](https://jsg1504.github.io/books/agent-harness/) · [멀티에이전트 시스템 설계 교과서](https://jsg1504.github.io/books/multi-agent/) · [바이브 코딩과 에이전틱 엔지니어링 전략 교과서](https://jsg1504.github.io/books/vibe-coding/) · [장기 실행 에이전트 교과서](https://jsg1504.github.io/books/long-running/) · [LLM 위키와 에이전트 지식 교과서](https://jsg1504.github.io/books/llm-wiki/)

## 서가와 책

| 위치 | 역할 |
|---|---|
| `books/<slug>/book.json` | 표지, 제목, 주제, 소개, 출간 여부와 책 형식 |
| `books/<slug>/manuscript/` | 기본 형식 책의 장별 HTML 본문 |
| `books/<slug>/assets/` | 해당 책의 이미지, 데이터, 독립 실험 페이지 |
| `books/agent-benchmarks/` | 독자적인 실험실과 점수 비교 화면을 가진 첫 책 |
| `books/coding-agents/` | 장별 HTML 페이지와 27개 실험으로 구성된 코딩 에이전트 교과서(LoopBook). 공통 도우미는 `js/common.js`, 장 목록은 같은 파일의 `CA.CHAPTERS` |
| `books/agent-memory/` | 10개 장과 28개 실험으로 구성된 에이전트 메모리 교과서(RecallBook). LoopBook의 틀을 이어받아 공통 도우미는 `js/common.js`의 `AM.*`, 장 목록은 `AM.CHAPTERS`, 용어집은 `AM.GLOSSARY` |
| `books/agent-harness/` | 10개 장과 28개 실험으로 구성된 에이전트 하네스 설계 교과서(HarnessBook). RecallBook의 틀을 이어받아 공통 도우미는 `js/common.js`의 `HB.*`, 장 목록은 `HB.CHAPTERS`, 용어집은 `HB.GLOSSARY` |
| `books/multi-agent/` | 12개 장과 36개 실험으로 구성된 멀티에이전트 시스템 설계 교과서(ChorusBook). HarnessBook의 틀을 이어받아 공통 도우미는 `js/common.js`의 `MA.*`(그래프 노드·화살표·레이더 차트 도우미 포함), 장 목록은 `MA.CHAPTERS`, 용어집은 `MA.GLOSSARY` |
| `books/vibe-coding/` | 12개 장과 36개 실험으로 구성된 바이브 코딩과 에이전틱 엔지니어링 전략 교과서(VibeBook). ChorusBook의 틀을 이어받아 공통 도우미는 `js/common.js`의 `VB.*`, 장 목록은 `VB.CHAPTERS`, 용어집은 `VB.GLOSSARY`. 리뷰 diff·체크리스트용 스타일은 `css/style.css` 끝의 VibeBook 전용 요소 |
| `books/long-running/` | 12개 장과 36개 실험으로 구성된 장기 실행 에이전트 교과서(MarathonBook). VibeBook의 틀을 이어받아 공통 도우미는 `js/common.js`의 `LR.*`(분류 게임 `LR.sortGame`, 재생 버튼 `LR.player` 포함), 장 목록은 `LR.CHAPTERS`, 용어집은 `LR.GLOSSARY`. 트레이스·JSON·기록 발췌용 스타일은 `css/style.css` 끝의 MarathonBook 전용 요소 |
| `books/llm-wiki/` | 12개 장과 36개 실험으로 구성된 LLM 위키와 에이전트 지식 교과서(WikiBook). MarathonBook의 틀을 이어받아 공통 도우미는 `js/common.js`의 `WK.*`, 장 목록은 `WK.CHAPTERS`, 용어집은 `WK.GLOSSARY`. 여러 장이 함께 쓰는 예제 위키(18페이지, 위키링크·백링크·주제 벡터)는 `js/wiki.js`의 `WK.wiki`. 위키 페이지 뷰어·파일 트리·검색 결과용 스타일은 `css/style.css` 끝의 WikiBook 전용 요소 |
| `templates/`, `shared/` | 서가와 기본 책의 공통 레이아웃·스타일 |
| `tools/shelf.py` | 초안 생성과 정적 사이트 빌드 |

## 다른 주제의 책 시작하기

Python 3.9 이상에서 실행합니다. 다음 명령은 예시로 **컴파일러 패스 실험 노트**의 초안을 만듭니다.

```sh
python3 tools/shelf.py new compiler-passes \
  --title '컴파일러 패스 실험 노트' --topic '컴파일러' \
  --description '작은 IR 예제로 변환 전후의 의미와 비용을 비교합니다.'
```

1. `books/compiler-passes/manuscript/introduction.html`에 본문을 씁니다. 문단, 그림, 표와 수식 표기 등을 HTML로 작성할 수 있습니다.
2. 다음 장은 `manuscript/canonicalization.html`을 만들고 `book.json`의 `chapters` 배열에 `{"id":"canonicalization","title":"정규화 패스"}`를 추가합니다. 배열 순서로 목차와 장 이동 링크가 생성됩니다.
3. 그림은 `assets/`에 넣고 본문에서 `../assets/그림파일명`으로 참조합니다. 브라우저 실험은 같은 폴더에 HTML로 만들고 `<iframe title="패스 실행 실험" src="../assets/pass-lab.html"></iframe>`처럼 삽입합니다.
4. 책 표지를 쓰려면 책 폴더에 이미지를 넣고 `book.json`에 `"cover": "cover.png"`를 지정합니다. 생략하면 제목으로 표지를 만듭니다.
5. 초안이 완성되면 `"published": true`로 바꿉니다. 서가가 출간된 책을 자동으로 찾아 카드와 링크를 만듭니다.

```sh
python3 tools/shelf.py build --drafts
python3 -m http.server 8000 --directory _preview
```

브라우저에서 `http://localhost:8000/`을 엽니다. 초안도 포함한 미리보기입니다. 초안의 원고는 공개 저장소에 커밋하면 GitHub에서 열람할 수 있습니다.

## 독립적인 인터랙티브 책

전용 화면이나 자체 라우터가 필요한 책에는 `"format": "custom"`을 사용합니다. 같은 폴더에 `index.html`과 필요한 파일을 두고, 내부에서 전체 서가로 돌아가는 링크 `../`를 제공합니다. 메타데이터의 `details`와 `links`로 권별 정보와 장·실험 바로가기를 지정할 수 있습니다. [첫 책의 설정](books/agent-benchmarks/book.json)을 참고하세요.

## 출간

```sh
python3 tools/shelf.py build
python3 -m http.server 8000 --directory _site
```

`main`에 푸시하면 GitHub Actions가 같은 명령으로 정적 파일을 생성해 GitHub Pages에 배포합니다. 빌드 산출물은 커밋할 필요가 없습니다. 사이트 루트(`https://jsg1504.github.io/books/`)는 서가, 각 책의 주소는 `<slug>/`입니다. `shared`는 서가가 사용하므로 책 경로로 쓸 수 없습니다. 이미 공유한 첫 책의 `/#chapter/…`, `/#lab/…`, `/#catalog`, `/#compare` 등은 새 책 주소로 연결됩니다. 출간 후에는 외부 링크에 사용되는 책과 장의 ID를 유지하세요.
