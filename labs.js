/* Offline teaching experiments. All numeric examples are synthetic. */
(() => {
  'use strict';
  const labs = [];
  const percent = n => (100 * n).toFixed(1) + '%';
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  function metrics(values) {
    return '<dl class="ba-metrics">' + values.map(([label, value]) => '<div><dt>' + label + '</dt><dd>' + value + '</dd></div>').join('') + '</dl>';
  }
  const note = s => '<p class="ba-note">' + s + '</p>';
  const button = (action, label) => '<button type="button" data-action="' + action + '">' + label + '</button>';
  const range = (key, label, min, max, value) => '<label>' + label + ' <input type="range" data-key="' + key + '" min="' + min + '" max="' + max + '" value="' + value + '"></label>';
  function register(title, summary, intro, controls, setup) {
    labs.push({title, summary, mount(container) {
      container.innerHTML = '<section class="ba-lab" aria-label="' + escape(title) + '"><p class="ba-intro">' + intro + '</p>' + controls + '<div class="ba-output" aria-live="polite"></div></section>';
      const root = container.firstElementChild;
      const out = root.querySelector('.ba-output');
      const key = name => root.querySelector('[data-key="' + name + '"]');
      setup({root,out,key,action(fn) {
        root.addEventListener('click', e => {
          const el = e.target.closest('button[data-action]');
          if (el && root.contains(el)) fn(el.dataset.action);
        });
      }});
    }});
  }
  function curve(points, color, dash='') {
    return '<polyline points="' + points.map(([x,y]) => x + ',' + y).join(' ') + '" fill="none" stroke="' + color + '" stroke-width="3" ' + dash + '/>';
  }
  register('재시도와 일관성','한 번이라도 성공할 확률과 매번 성공할 확률을 비교합니다.',
    '각 시도가 독립이고 성공 확률 p가 일정하다고 가정합니다. 시도 횟수를 늘려 두 지표가 어떻게 갈라지는지 보세요.',
    '<div class="ba-controls">' + range('p','단일 시도 성공률',0,100,55) + range('k','시도 횟수',1,10,3) + '</div>',
    ({root,out,key}) => {
      function draw(){
        const p = +key('p').value / 100, k = +key('k').value;
        const best = i => 1-Math.pow(1-p,i), all = i => Math.pow(p,i);
        const xs = i => 46+(i-1)*34, ys = v => 150-126*v;
        const line = f => Array.from({length:10},(_,i)=>[xs(i+1),ys(f(i+1))]);
        out.innerHTML = metrics([['시도 조건',percent(p)+' × '+k],['pass@'+k,percent(best(k))],['pass^'+k,percent(all(k))]]) +
          '<svg viewBox="0 0 390 178" role="img" aria-label="횟수에 따른 한 번 이상 성공과 전부 성공 확률"><path d="M46 24V150H352" fill="none" stroke="#aab9b8"/><text x="0" y="30">100%</text><text x="18" y="152">0%</text><text x="42" y="173">1회</text><text x="333" y="173">10회</text><path d="M'+xs(k)+' 20V150" stroke="#768c89" stroke-dasharray="3 3"/>'+curve(line(best),'#08776f')+curve(line(all),'#a95725','stroke-dasharray="6 3"')+'</svg>' +
          '<div class="ba-chartkey"><span>한 번 이상 성공 · 1 − (1 − p)ᵏ</span><span>모두 성공 · pᵏ</span></div>'+note('실제 벤치마크는 과제별 반복 표본에서 추정합니다. 위 곡선은 동일 확률 모형의 이론값입니다.');
      }
      root.addEventListener('input',draw); draw();
    });
  register('테스트 채점기','같은 테스트 결과를 두 가지 지표로 채점합니다.',
    '저장소 3개의 테스트 결과를 체크하세요. 한 저장소의 마지막 실패 한 건을 통과로 바꾸면 어느 점수가 더 크게 오를까요?',
    '<div class="ba-testgrid">'+[2,4,5].map((n,i)=>'<fieldset><legend>저장소 '+String.fromCharCode(65+i)+'</legend>'+Array.from({length:n},(_,j)=>'<label><input type="checkbox" '+(j<n-1 || i===0?'checked':'')+'>테스트 '+(j+1)+'</label>').join('')+'</fieldset>').join('')+'</div>',
    ({root,out}) => {
      function draw() {
        const rates = [...root.querySelectorAll('fieldset')].map(el=>el.querySelectorAll(':checked').length/el.querySelectorAll('input').length);
        const avg = rates.reduce((s,v)=>s+v,0)/rates.length;
        out.innerHTML=metrics([['전체 통과 저장소',percent(rates.filter(r=>r===1).length/3)],['저장소별 통과율 평균',percent(avg)]])+
          '<div class="ba-bars">'+rates.map((v,i)=>'<div>'+String.fromCharCode(65+i)+' · '+percent(v)+'<div class="ba-bar"><i style="width:'+percent(v)+'"></i></div></div>').join('')+'</div>'+
          note('세 저장소에 같은 가중치를 줍니다. 평균 통과율에서는 테스트 수가 서로 달라도 저장소 하나가 차지하는 비중이 같습니다.');
      }
      root.addEventListener('change',draw);draw();
    });
  register('업무 상태 검증기','CRM과 캘린더를 바꾸고 세 가지 업무 조건을 검증합니다.',
    '고객 “해솔”을 담당자 민지에게 배정하고 상담 일정을 예약한 뒤, 예약 번호가 담긴 안내를 발송하세요.',
    '<div class="ba-controls">'+button('assign','민지에게 배정')+button('book','일정 예약')+button('mail','안내 발송')+button('grade','최종 검증')+button('reset','초기화')+'</div>',
    ({out,action}) => {
      let assigned = false, booked = false, mailed = false, validMail = false, message = '작업을 시작하세요.';
      function draw(){
        out.innerHTML='<div class="ba-cells">'+[['CRM 담당자',assigned?'민지':'미정',assigned],['상담 예약',booked?'R-17':'없음',booked],['보낸 안내',mailed?(validMail?'예약 번호 포함':'예약 번호 누락'):'미발송',validMail]].map(([l,v,ok])=>'<div class="ba-cell '+(ok?'ok':'')+'">'+l+'<br><b>'+v+'</b></div>').join('')+'</div><p>'+message+'</p>'+note('모의 업무에서는 올바른 담당자, 생성된 예약, 예약 번호가 포함된 안내가 동시에 충족되어야 통과합니다.');
      }
      action(a=>{
        if(a==='assign'){assigned=true;message='담당자가 지정되었습니다.';}
        if(a==='book'){booked=true;message='예약 R-17이 준비되었습니다.';}
        if(a==='mail'){mailed=true;validMail=booked;message=booked?'예약 R-17을 포함해 발송했습니다.':'예약 없이 발송했습니다. 예약 후 안내를 다시 보낼 수 있습니다.';}
        if(a==='grade'){const count=[assigned,booked,validMail].filter(Boolean).length;message='<strong>'+ (count===3?'통과':'미통과')+'</strong> · 필수 조건 '+count+'/3개 충족';}
        if(a==='reset'){assigned=booked=mailed=validMail=false;message='초기 상태로 돌아왔습니다.';}
        draw();
      });draw();
    });
  register('블랙박스 프로그램','입출력을 관찰해 원본 프로그램의 규칙을 복원합니다.',
    '쉼표로 구분한 단어를 넣어 출력 순서와 중복 처리를 관찰하세요. 예상 규칙을 고른 뒤 숨겨진 예제로 검사할 수 있습니다.',
    '<div class="ba-controls"><label>입력 <input data-key="words" value="pear, fig, pear, apple" maxlength="160"></label>'+button('probe','원본 실행')+'</div><div class="ba-controls"><label>예상 규칙 <select data-key="rule"><option value="sort">알파벳순 정렬</option><option value="unique">중복 제거 후 입력 순서</option><option value="both">중복 제거 후 알파벳순</option></select></label>'+button('test','예제로 검증')+'</div>',
    ({out,key,action}) => {
      const execute=(arr,rule)=>{const items=rule==='sort'?arr.slice():[...new Set(arr)];return rule==='unique'?items:items.sort();};
      let log=[],verdict='';
      function probe(){const arr=key('words').value.split(',').map(v=>v.trim()).filter(Boolean);log.unshift(escape(arr.join(', '))+' → '+escape(execute(arr,'both').join(', ')||'∅'));log=log.slice(0,4);}
      function draw(){out.innerHTML='<strong>최근 관찰</strong><pre>'+log.join('\n')+'</pre><p>'+verdict+'</p>'+note('이 실습에서는 규칙 후보 중 하나를 선택합니다. ProgramBench에서는 실행 파일을 관찰하고 프로그램 전체를 구현합니다.');}
      action(a=>{if(a==='probe')probe();else {const tests=[['b','a'],['x','x'],['c','a','c'],['s']];const n=tests.filter(arr=>execute(arr,key('rule').value).join('|')===execute(arr,'both').join('|')).length;verdict='검증 예제 '+n+'/4개 통과. '+(n===4?'모든 관찰과 일치합니다.':'순서와 중복을 각각 바꿔 다시 관찰해 보세요.');}draw();});probe();draw();
    });
  register('차트 판독 현미경','곡선의 교점에서 값을 추정하고 허용 오차 안에 들어가는지 확인합니다.',
    '그래프에서 가로축의 목표 지점에 해당하는 세로축 값을 읽으세요. 점선을 켜면 축을 맞춰 읽기 쉽습니다.',
    '<div class="ba-controls"><label>목표 지점 <select data-key="x"><option value="3">x = 3</option><option value="5">x = 5</option><option value="7">x = 7</option></select></label><label><input type="checkbox" data-key="guide">수직 안내선</label><label>추정값 <input type="number" data-key="answer" min="0" max="100" value="50"></label>'+button('check','판독 확인')+'</div>',
    ({root,out,key,action})=>{
      const points=[12,20,32,45,64,76,70,58,44];let checked=false;
      const x=i=>38+i*36, y=v=>160-v*1.34;
      function draw(){
        const i=+key('x').value,val=points[i],ans=key('answer').valueAsNumber;
        const grid=[0,25,50,75,100].map(v=>'<path d="M38 '+y(v)+' H326" stroke="#dce5e1"/><text x="4" y="'+(y(v)+4)+'">'+v+'</text>').join('');
        const ticks=points.map((_,i)=>'<text x="'+(x(i)-4)+'" y="179">'+i+'</text>').join('');
        const guide=key('guide').checked?'<path d="M'+x(i)+' 20V160" stroke="#a95725" stroke-dasharray="4 3"/>':'';
        const feedback=checked?(Number.isFinite(ans)?(Math.abs(ans-val)<=3?'통과':'다시 판독')+' · 기준값 '+val+', 오차 '+Math.abs(ans-val)+' (허용 ±3)':'숫자를 입력하세요.'):'x = '+i+'에서 세로축 값을 추정해 보세요.';
        out.innerHTML='<svg viewBox="0 0 355 188" role="img" aria-label="x가 0부터 5까지 상승한 후 하락하는 선 그래프">'+grid+ticks+guide+curve(points.map((v,i)=>[x(i),y(v)]),'#08776f')+'</svg><p>'+feedback+'</p>'+note('실습용 합성 차트입니다. Chartography 원문은 문항별로 전문가가 정한 허용 오차를 사용합니다.');
      }
      root.addEventListener('input',()=>{checked=false;draw();});action(()=>{checked=true;draw();});draw();
    });
  register('교차선 추적','선을 따라 도착점을 찾고 경로를 강조해 검산합니다.',
    '왼쪽에서 지정된 선을 따라 오른쪽 끝번호를 고르세요. 교차점에서 원래 선을 계속 따라갑니다.',
    '<div class="ba-controls"><label>출발 <select data-key="start"><option>A</option><option>B</option><option>C</option></select></label>'+[1,2,3].map(v=>button(String(v),'끝점 '+v)).join('')+button('hint','경로 강조 전환')+'</div>',
    ({root,out,key,action})=>{
      const paths=['M30 36 C110 36 80 98 145 98 S200 158 290 158','M30 97 C92 97 80 149 143 149 S205 35 290 35','M30 156 C99 156 91 44 147 44 S214 96 290 96'];
      let selected=0,hint=false;
      function draw(){const i='ABC'.indexOf(key('start').value),answer=[3,1,2][i];
        let lines=paths.map((d,j)=>'<path d="'+d+'" fill="none" stroke="'+(hint&&i===j?'#aa4818':'#477771')+'" stroke-width="'+(hint&&i===j?5:3)+'"/>');
        if(hint){lines.push(lines[i]);}
        out.innerHTML='<svg viewBox="0 0 330 190" role="img" aria-label="서로 교차하는 세 경로의 시작점과 끝점">'+lines.join('')+[0,1,2].map(j=>'<text x="8" y="'+(42+60*j)+'">'+'ABC'[j]+'</text><text x="300" y="'+(42+60*j)+'">'+(j+1)+'</text>').join('')+'</svg><p>'+(selected?(selected===answer?'정답입니다. ':'다시 따라가 보세요. ')+'선택한 끝점 '+selected:'출발점 '+key('start').value+'의 끝점을 골라 보세요.')+'</p>'+note('같은 경로를 확대·강조해 확인할 수 있는 시각 지각 예제입니다. 실제 BabyVision 문항은 별도 데이터셋에서 제공합니다.');
      }
      root.addEventListener('change',()=>{selected=0;hint=false;draw();});action(a=>{if(a==='hint')hint=!hint;else selected=+a;draw();});draw();
    });
  register('터미널 실행 예산','관찰·수정·검증을 제한된 횟수 안에 완료합니다.',
    '작업은 “설정값을 2로 고치고 로컬 검증을 통과시키기”입니다. 각 명령은 한 단계의 예산을 소비합니다. 실제 셸 대신 교육용 상태 기계를 사용합니다.',
    '<div class="ba-controls"><label>단계 한도 <select data-key="budget"><option>3</option><option selected>4</option><option>6</option></select></label>'+button('read','파일 읽기')+button('edit','설정 수정')+button('run','테스트 실행')+button('reset','새 실행')+'</div>',
    ({root,out,key,action}) => {
      let seen=false,fixed=false,passed=false,log=[];
      function reset(){seen=fixed=passed=false;log=[];}
      function draw(){const cap=+key('budget').value,left=cap-log.length;
        root.querySelectorAll('button').forEach(b=>{if(b.dataset.action!=='reset')b.disabled=passed||left===0;});
        out.innerHTML=metrics([['남은 실행',left+' / '+cap],['검증 상태',passed?'통과':left===0?'예산 소진':'진행 중']])+'<pre>'+ (log.length?log.map((v,i)=>'['+(i+1)+'] '+v).join('\n'):'명령을 선택하면 여기에 관찰 결과가 표시됩니다.')+'</pre>'+
          note('이 모형에서는 파일 위치를 읽어야 수정할 수 있습니다. 실행 한도를 바꾸면 과제를 처음부터 시작합니다.');
      }
      root.addEventListener('change',()=>{reset();draw();});
      action(a=>{
        if(a==='reset')reset();
        else if(!passed&&log.length<+key('budget').value){
          if(a==='read'){seen=true;log.push('read config → workers='+ (fixed?'2':'1'));}
          if(a==='edit'){if(seen)fixed=true;log.push(seen?'edit config → workers=2':'edit → 파일 위치를 먼저 확인하세요');}
          if(a==='run'){passed=fixed;log.push(fixed?'test → PASS':'test → FAIL (expected 2 workers)');}
        }draw();
      });draw();
    });
  register('하네스 교차 비교','과제별 승패와 실행 비용을 같은 조건에서 대조합니다.',
    '같은 모델을 두 모의 하네스에서 실행한 예입니다. 성공한 실행과 비용을 바꿔 어느 과제에서 차이가 생겼는지 확인하세요.',
    '<div class="ba-table-wrap"><table><thead><tr><th>과제</th><th>A 성공</th><th>B 성공</th></tr></thead><tbody>'+
      ['파서 수정','회귀 테스트','빌드 설정','로그 변환','패키지 설치','옵션 추가'].map((v,i)=>'<tr><th scope="row">'+v+'</th>'+['A','B'].map((h,j)=>'<td><input type="checkbox" aria-label="'+v+' 하네스 '+h+' 성공" data-side="'+h+'" data-task="'+i+'" '+((j===0?[0,1,2,5]:[0,2,3,4,5]).includes(i)?'checked':'')+'></td>').join('')+'</tr>').join('')+
      '</tbody></table></div><div class="ba-controls">'+range('ca','A 과제당 비용 (포인트)',1,20,5)+range('cb','B 과제당 비용 (포인트)',1,20,8)+'</div>',
    ({root,out,key})=>{
      function draw(){
        const a=[...root.querySelectorAll('[data-side=A]')].map(e=>e.checked),b=[...root.querySelectorAll('[data-side=B]')].map(e=>e.checked);
        const n=a.length,sa=a.filter(Boolean).length,sb=b.filter(Boolean).length;
        const ac=+key('ca').value,bc=+key('cb').value;
        const wa=a.filter((ok,i)=>ok&&!b[i]).length,wb=b.filter((ok,i)=>ok&&!a[i]).length;
        const cost=(points,s)=>s?(points*n/s).toFixed(1)+' pt':'산출 불가';
        out.innerHTML=metrics([['A 성공률',percent(sa/n)],['B 성공률',percent(sb/n)],['B − A',((sb-sa)/n*100).toFixed(1)+'%p']])+
          '<div class="ba-cells"><div class="ba-cell">A만 성공<br><b>'+wa+'개</b></div><div class="ba-cell">B만 성공<br><b>'+wb+'개</b></div><div class="ba-cell">동일 결과<br><b>'+(n-wa-wb)+'개</b></div></div>'+
          '<p>성공 1건당 비용은 A <b>'+cost(ac,sa)+'</b>, B <b>'+cost(bc,sb)+'</b>입니다.</p>'+
          note('총비용 = 시도한 6개 과제 × 설정한 과제당 비용(A '+ac+', B '+bc+' 포인트). 이 자료는 가상의 단일 실행으로, 실제 모델 우열이나 통계적 유의성을 뜻하지 않습니다.');
      }
      root.addEventListener('input',draw);draw();
    });
  register('표본 크기와 오차','관측 성공률이 같아도 표본 수에 따라 불확실성이 달라집니다.',
    '성공률과 표본 수를 정하고 95% 윌슨 구간을 확인하세요. 작은 표본에서는 관측 비율이 조금만 바뀌어도 구간이 넓게 움직입니다.',
    '<div class="ba-controls">'+range('s','목표 성공률 (%)',0,100,60)+'<label>독립 과제 수 <select data-key="n"><option>10</option><option selected>50</option><option>100</option><option>500</option></select></label></div>',
    ({root,out,key})=>{
      function draw(){
        const n=+key('n').value,k=Math.round(n*(+key('s').value/100)),p=k/n,z=1.96,z2=z*z,d=1+z2/n;
        const center=(p+z2/(2*n))/d,radius=z*Math.sqrt((p*(1-p)+z2/(4*n))/n)/d;
        const low=Math.max(0,center-radius),high=Math.min(1,center+radius),x=v=>25+v*300;
        out.innerHTML=metrics([['성공한 과제',k+' / '+n],['관측 성공률',percent(p)]])+
          '<svg viewBox="0 0 350 65" role="img" aria-label="관측 성공률과 95% 윌슨 신뢰구간"><path d="M25 24H325" stroke="#d9e2df" stroke-width="7"/><path d="M'+x(low)+' 24H'+x(high)+'" stroke="#378979" stroke-width="7"/><circle cx="'+x(p)+'" cy="24" r="7" fill="#955020"/><text x="20" y="52">0%</text><text x="292" y="52">100%</text></svg>'+
          '<p>95% 윌슨 구간 <b>'+percent(low)+' ~ '+percent(high)+'</b></p>'+
          note('각 과제를 동일한 성공 확률을 가진 독립 시행으로 보는 예시입니다. 성공 개수는 가까운 정수로 반올림합니다. 고정된 벤치마크의 과제 간 난이도 차이나 반복 실행 간 상관은 반영하지 않습니다.');
      }
      root.addEventListener('input',draw);draw();
    });
  register('매크로와 마이크로 평균','두 과제의 크기를 조절해 같은 결과를 다른 가중치로 집계합니다.',
    '짧은 프로젝트와 긴 프로젝트의 테스트 수가 다를 때 어떤 점수가 긴 프로젝트에 더 민감한지 살펴보세요.',
    '<div class="ba-controls">'+range('a','A 성공 개수 (총 10개)',0,10,9)+range('b','B 성공률 (%)',0,100,50)+'<label>B 테스트 수 <select data-key="n"><option>10</option><option selected>100</option><option>1000</option></select></label></div>',
    ({root,out,key})=>{
      function draw(){const a=+key('a').value,n=+key('n').value,b=Math.round(n*+key('b').value/100),macro=(a/10+b/n)/2,micro=(a+b)/(10+n);
        out.innerHTML=metrics([['매크로 평균',percent(macro)],['마이크로 평균',percent(micro)]])+
        '<div class="ba-bars">'+[['A',a,10],['B',b,n]].map(([l,v,t])=>'<div>'+l+' · '+v+'/'+t+' 통과<div class="ba-bar"><i style="width:'+percent(v/t)+'"></i></div></div>').join('')+
        '</div><p>매크로 평균 = ('+percent(a/10)+' + '+percent(b/n)+') ÷ 2<br>마이크로 평균 = '+(a+b)+' ÷ '+(n+10)+'</p>'+note('매크로 평균은 각 프로젝트에, 마이크로 평균은 각 테스트에 같은 비중을 줍니다. 성공 수는 정수로 반올림합니다.');}
      root.addEventListener('input',draw);draw();
    });
  window.labs=labs;
})();
