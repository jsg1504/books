/* A small, deterministic retrieval exercise. No external search requests. */
window.labs.push({
 title:"근거를 찾는 검색 에이전트",
 summary:"버전이 다른 문서에서 올바른 근거를 찾아 수치와 출처를 제출합니다.",
 mount(container){
  const docs=[
    {name:"A · Atlas SDK 1.2 설명서",keys:"기본값 재시도 SDK 1.2",body:"1.2에서 클라이언트는 실패한 요청을 최대 두 번 재시도한다."},
    {name:"B · 서버 운영 일지",keys:"서버 오류 재시도 2.0",body:"2.0 전환 점검 중 운영자가 수동으로 3회 재실행했다."},
    {name:"C · Atlas SDK 2.0 변경 기록",keys:"기본값 재시도 2.0 SDK 변경 기록",body:"2.0부터 클라이언트의 기본 재시도 횟수는 4회다. 서버 측 복구 정책은 별도로 관리한다."},
    {name:"D · 2.1 설계안",keys:"기본값 재시도 제안 2.1",body:"재시도를 한 번으로 줄이는 안을 검토 중이다."}
  ];
  container.innerHTML='<section class="ba-lab"><p>가상 제품 Atlas SDK 2.0에서 클라이언트의 기본 재시도 횟수는 몇 회일까요? 문서의 버전과 상태를 확인하세요.</p><div class="ba-controls"><label>색인 검색 <input type="search" placeholder="예: 재시도, 2.0"></label></div><div class="results"></div><div class="ba-controls"><label>답 <input type="number" min="0" max="20" value="0"> 회</label><label>근거 문서 <select><option value="">선택</option>'+docs.map((d,i)=>'<option value="'+i+'">'+d.name+'</option>').join('')+'</select></label><button type="button">검증하기</button></div><p role="status" class="ba-note"></p></section>';
  const query=container.querySelector("input"), results=container.querySelector(".results");
  function find(){const terms=query.value.toLowerCase().split(/[,\s]+/).filter(Boolean);const matches=docs.filter(d=>terms.every(t=>(d.name+d.keys+d.body).toLowerCase().includes(t)));results.innerHTML=matches.map(d=>'<details><summary>'+d.name+'</summary><p>'+d.body+'</p></details>').join("")||'<p>일치하는 문서가 없습니다.</p>'}
  query.oninput=find;find();
  container.querySelector("button").onclick=()=>{const answer=container.querySelector('[type=number]').value==="4",source=container.querySelector("select").value==="2";container.querySelector("[role=status]").textContent=(answer&&source?"통과 · 답과 근거가 모두 일치합니다.":"재검토 · ")+(answer&&source?"":(answer?"수치 ✓":"수치 ✗")+" / "+(source?"근거 ✓":"근거 ✗")+". 출시된 버전의 클라이언트 설정을 찾으세요.")};
 }
});
