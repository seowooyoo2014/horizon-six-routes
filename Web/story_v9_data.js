window.HL=window.HL||{};
(function(){
  "use strict";
  const task=(id,title,description,trigger,options={})=>({id,title,description,trigger,...options});
  const fragment=(id,name,slot,rotation,region,clue,method,difficulty,required=true)=>({id,name,slot,rotation,region,clue,method,difficulty,required});
  const step=(speaker,text,musicKey,extra={})=>({speaker,text,musicKey,duration:24,...extra});
  const scene=(id,chapter,title,trigger,background,kind,steps,options={})=>({id,chapter,title,trigger,background,kind,steps,skippable:true,replayable:true,...options});

  HL.DATA.version=9;
  HL.DATA.gameTitle="두 번째 일몰: 수평선의 장부";
  HL.DATA.seaSpeedScale=1.25;
  HL.DATA.coreStoryPorts=["bella","lume","genoa","ceuta","alexandria","massawa","zanzibar","goa","malacca","guangzhou","sakai","nagasaki","havana","cartagena","recife","salvador"];

  const artRoot="../Assets/Resources/Sprites/Cutscenes/V9/";
  const dedicated={
    cs9_beacon_night:"beacon_night.png",cs9_mansion_raid:"mansion_raid.png",cs9_genoa_archive:"genoa_archive.png",
    cs9_ceuta_rescue:"ceuta_rescue.png",cs9_massawa_storm:"massawa_storm.png",cs9_orso_confession:"orso_confession.png",
    cs9_sakai_calendar:"sakai_calendar.png",cs9_pacific_crossing:"pacific_crossing.png",cs9_cartagena_register:"cartagena_register.png",
    cs9_meridian_fleet:"meridian_fleet.png",cs9_meridian_beacon:"meridian_beacon.png",cs9_lisbon_council:"lisbon_council.png"
  };
  HL.DATA.v9Illustrations={...dedicated};
  for(const[id,file]of Object.entries(dedicated))HL.DATA.sceneAssets[id]={background:artRoot+file,nativeSize:[960,540],fallback:"cinematic"};

  HL.DATA.chartFragments=[
    fragment("glass-cipher","푸른 보험 장부",0,1,"안트베르펜","유리 가격의 끝자리는 날짜이고, 빈 칸은 바람이 멎은 시간을 뜻한다.","교역 장부 암호","easy",true),
    fragment("burnt-margin","불탄 여백의 해도",1,3,"제노바","재가 된 문장보다 살아남은 여백을 이어 붙이면 남서쪽 수로가 나타난다.","기록고 복원","easy",true),
    fragment("blue-seal","안쪽에서 열린 봉인",2,2,"세우타","푸른 봉인의 홈은 사략선의 선창 열쇠이자 세 번째 관측점의 각도다.","해적선 나포","easy",true),
    fragment("alexandria-star","알렉산드리아 성반",3,0,"알렉산드리아","긁혀 나간 별자리 아래의 조류선은 홍해의 바람이 뒤집히는 날을 가리킨다.","천문 기록 대조","medium",true),
    fragment("tide-staff","순례선의 조류표",4,1,"마사와","구조된 선원들의 항해 시간을 합치면 폭풍 안쪽의 잔잔한 고리가 드러난다.","폭풍 구조","medium",true),
    fragment("monsoon-veil","잔지바르의 바람 매듭",5,2,"잔지바르","세 매듭 사이의 간격은 해안선이 아니라 계절풍이 머무는 날짜다.","오르소 개인 항해","medium",false),
    fragment("goa-remedy","고아의 약품 인장",6,0,"고아","의약품 상자의 봉인은 회사가 감춘 보급항과 샘의 위치를 기록한다.","의약품 배분 선택","medium",false),
    fragment("lantern-seal","말라카 등대 통행장",7,3,"말라카","통행료 장부의 야간 면제선은 봉쇄 함대가 비우는 수로와 일치한다.","등대 잠입","medium",true),
    fragment("porcelain-current","쌍룡 도자기 해류도",8,2,"광저우","두 용의 비늘 수와 도자기 시세를 함께 읽어야 동쪽 해류가 완성된다.","시세·문양 추론","hard",true),
    fragment("star-calendar","열아홉 해의 달력",9,1,"사카이","서로 다른 항구의 일몰 그림자를 열아홉 칸 달력에 겹치면 회랑의 개방 시각이 나타난다.","천문 달력 퍼즐","hard",true),
    fragment("rival-half","바르도 가문의 반쪽 해도",10,3,"아바나","붉은 닻은 해적 표식이 아니라 구조를 기다리던 호송대의 집결 신호였다.","난파선 조사","medium",false),
    fragment("amazon-rubbing","세 번째 부표의 탁본",11,0,"사우바도르","동쪽 화살표를 따르지 말고 물살이 사라지는 남쪽 틈을 찾아야 한다.","부표 기록 복원","medium",false)
  ];

  HL.DATA.fragmentByTask={
    "v9-antwerp-ledger":"glass-cipher","v9-genoa-archive":"burnt-margin","v9-rescue-aeron":"blue-seal",
    "v9-alexandria-archive":"alexandria-star","v9-malacca-lighthouse":"lantern-seal",
    "v9-guangzhou-cipher":"porcelain-current","v9-sakai-calendar":"star-calendar"
  };

  HL.DATA.campaign={id:"rian-second-sunset",title:HL.DATA.gameTitle,chapters:[
    {id:"lights-out",title:"제1장 · 꺼진 불빛",tasks:[
      task("v9-claim-ship","새벽까마귀 인수","리스본 조선소에서 오르소와 새벽까마귀를 인수한다.",{type:"action",id:"accept-ship"},{port:"bella",facility:"shipyard",rewardFame:100}),
      task("v9-reach-antwerp","북해로 향하는 첫 항해","유리와 보급을 준비해 안트베르펜에 입항한다.",{type:"dock",port:"lume"},{port:"lume",recommendedThreat:"낮음"}),
      task("v9-antwerp-ledger","푸른 보험 장부","안트베르펜 시장에서 가명으로 일하는 미라와 교역 암호를 푼다.",{type:"facility",id:"market",port:"lume"},{port:"lume",facility:"market",rewardFame:400}),
      task("v9-mira-identity","감사관의 가명","미라의 정체를 회사에 숨길지 결정한다.",{type:"choice",id:"mira-identity"}),
      task("v9-reach-genoa","재가 남은 기록고","제노바로 가서 불탄 항해 기록을 조사한다.",{type:"dock",port:"genoa"},{port:"genoa",recommendedThreat:"보통"})
    ]},
    {id:"blue-ledger-v9",title:"제2장 · 푸른 장부",tasks:[
      task("v9-genoa-archive","불탄 여백","제노바 길드의 기록고에서 남은 장부 조각을 복원한다.",{type:"facility",id:"guild",port:"genoa"},{port:"genoa",facility:"guild",rewardFame:700}),
      task("v9-reach-ceuta","빈 계류장","세우타에 입항해 아에론의 배가 사라진 경로를 찾는다.",{type:"dock",port:"ceuta"},{port:"ceuta"}),
      task("v9-rescue-aeron","안쪽에서 풀린 밧줄","세우타 서쪽의 회색 봉인 사략선을 나포하고 아에론을 구출한다.",{type:"battle",tag:"royal-rescue"},{marker:[-7.8,35.7],spawnFleet:"royal-rescue",recommendedThreat:"위험",rewardFame:1600}),
      task("v9-aeron-joins","푸른 봉인의 증언","세우타 항만 사무소에서 아에론의 증언을 기록하고 천문항해사로 맞이한다.",{type:"facility",id:"harbor",port:"ceuta"},{port:"ceuta",facility:"harbor",rewardFame:500})
    ]},
    {id:"red-strait",title:"제3장 · 붉은 해협",tasks:[
      task("v9-reach-alexandria","통제된 바다","알렉산드리아에 입항해 마티아스의 제안을 듣는다.",{type:"dock",port:"alexandria"},{port:"alexandria"}),
      task("v9-alexandria-archive","긁혀 나간 별자리","알렉산드리아 길드에서 불탄 성반을 복원한다.",{type:"facility",id:"guild",port:"alexandria"},{port:"alexandria",facility:"guild",rewardFame:900}),
      task("v9-reach-massawa","폭풍 속 순례선","마사와에 입항해 폭풍과 실종된 순례선의 소식을 확인한다.",{type:"dock",port:"massawa"},{port:"massawa",recommendedThreat:"위험"}),
      task("v9-massawa-rescue","사람과 관측 기구","순례선의 사람과 해저 관측 기구 중 무엇을 먼저 구할지 결정한다.",{type:"choice",id:"massawa-rescue"}),
      task("v9-massawa-recovery","살아 돌아온 이름","마사와 항만 사무소에서 구조자와 회수품을 확인한다.",{type:"facility",id:"harbor",port:"massawa"},{port:"massawa",facility:"harbor"}),
      task("v9-orso-confession","등대를 끈 손","오르소의 고백을 듣고 계속 배에 태울지 결정한다.",{type:"choice",id:"orso-confession"}),
      task("v9-reach-zanzibar","계절풍을 기다리는 항구","잔지바르에 입항해 동쪽으로 부는 계절풍을 기다린다.",{type:"dock",port:"zanzibar"},{port:"zanzibar"})
    ]},
    {id:"second-sunset-v9",title:"제4장 · 두 번째 일몰",tasks:[
      task("v9-reach-goa","봉인된 의약품","고아에 입항해 회사 창고에 묶인 의약품을 조사한다.",{type:"dock",port:"goa"},{port:"goa"}),
      task("v9-goa-medicine","누구에게 약을 보낼 것인가","항구 환자와 회사 호송대 중 의약품을 우선 배분할 곳을 결정한다.",{type:"choice",id:"goa-medicine"}),
      task("v9-reach-malacca","값을 매긴 등불","말라카의 유료 등대와 봉쇄 수로를 조사한다.",{type:"dock",port:"malacca"},{port:"malacca"}),
      task("v9-malacca-lighthouse","야간 통행장","말라카 항만 사무소에서 등대 통행장과 봉쇄 교대표를 맞춘다.",{type:"facility",id:"harbor",port:"malacca"},{port:"malacca",facility:"harbor",rewardFame:1100}),
      task("v9-reach-guangzhou","도자기에 그린 해류","광저우 시장에서 쌍룡 도자기와 시세 장부를 조사한다.",{type:"dock",port:"guangzhou"},{port:"guangzhou"}),
      task("v9-guangzhou-cipher","쌍룡의 비늘","광저우 시장의 문양·시세 암호를 해독한다.",{type:"challenge",id:"porcelain-current"},{port:"guangzhou",facility:"market",challenge:"porcelain-current",rewardFame:1500}),
      task("v9-reach-sakai","열아홉 해의 그림자","사카이에 입항해 각 항구의 일몰 기록을 대조한다.",{type:"dock",port:"sakai"},{port:"sakai"}),
      task("v9-sakai-calendar","두 번째 일몰","사카이 길드에서 열아홉 해의 천문 달력을 완성한다.",{type:"challenge",id:"star-calendar"},{port:"sakai",facility:"guild",challenge:"star-calendar",rewardFame:2200}),
      task("v9-damian-terms","아버지를 태우는 조건","데미안을 함대에 받아들이되 지휘와 증언의 조건을 정한다.",{type:"choice",id:"damian-terms"}),
      task("v9-reach-nagasaki","태평양을 건널 준비","나가사키에 입항해 대양 횡단을 위한 선원과 보급을 정비한다.",{type:"dock",port:"nagasaki"},{port:"nagasaki",recommendedThreat:"매우 위험"})
    ]},
    {id:"western-letter-v9",title:"제5장 · 서쪽에서 온 편지",tasks:[
      task("v9-depart-nagasaki","서쪽으로 가는 동풍","나가사키에서 출항해 태평양 계절풍 회랑에 진입한다.",{type:"action",id:"depart-nagasaki"}),
      task("v9-reach-havana","붉은 닻의 난파선","아바나에 입항해 바르도 가문의 난파 기록을 찾는다.",{type:"dock",port:"havana"},{port:"havana",recommendedThreat:"매우 위험"}),
      task("v9-reach-cartagena","명부를 훔친 감사관","카르타헤나에 입항해 미라의 구조 신호를 찾는다.",{type:"dock",port:"cartagena"},{port:"cartagena"}),
      task("v9-rescue-mira","닫힌 술집의 지하실","카르타헤나 술집 지하에서 미라와 희생자 명부를 구한다.",{type:"facility",id:"inn",port:"cartagena"},{port:"cartagena",facility:"inn"}),
      task("v9-mira-trust","명부를 함께 읽는 사람","미라의 증거와 마음을 믿을지 결정한다.",{type:"choice",id:"mira-trust"}),
      task("v9-rival-battle","바르도의 검은 돛","카르타헤나 앞바다에서 바르도의 함대와 결판을 낸다.",{type:"battle",tag:"cartagena-rival"},{marker:[-75.9,10.7],spawnFleet:"cartagena-rival",recommendedThreat:"매우 위험",rewardFame:3000}),
      task("v9-bardo-choice","패자의 깃발","바르도를 동맹 선장으로 받아들일지 결정한다.",{type:"choice",id:"bardo-alliance"})
    ]},
    {id:"three-signals",title:"제6장 · 세 개의 신호",tasks:[
      task("v9-reach-recife","돌아오지 못한 선박의 빚","헤시피에 입항해 거짓 해도로 파산한 선원 가족을 돕는다.",{type:"dock",port:"recife"},{port:"recife"}),
      task("v9-recife-records","보험금이 지운 이름","헤시피 길드에서 조난선을 해적으로 바꿔 적은 장부를 복원한다.",{type:"facility",id:"guild",port:"recife"},{port:"recife",facility:"guild",rewardFame:1200}),
      task("v9-reach-salvador","세 번 깜박이는 불빛","사우바도르에 입항해 자오선 해역의 신호 기록을 찾는다.",{type:"dock",port:"salvador"},{port:"salvador"}),
      task("v9-salvador-testimony","데미안의 전부","사우바도르 길드에서 희생자 명부와 데미안의 원본 명령서를 대조한다.",{type:"facility",id:"guild",port:"salvador"},{port:"salvador",facility:"guild",rewardFame:1800}),
      task("v9-chart-assembly","열두 조각의 수평선","황혼 해도편 보드에서 필수 조각 8개를 올바르게 배치한다.",{type:"challenge",id:"chart-assembly"},{port:"salvador",facility:"guild",challenge:"chart-assembly"})
    ]},
    {id:"meridian-fortress",title:"제7장 · 자오선 요새",tasks:[
      task("v9-amazon-channel","물이 사라지는 방향","남미 대하 입구에서 숨은 부표 수로를 수색한다.",{type:"search",near:[-49.5,.2],radius:2},{marker:[-49.5,.2],requiredItem:"chart",minFragments:8,rewardFame:2200}),
      task("v9-final-command","누구를 앞세울 것인가","최종 함대의 진형과 위험을 감당할 선장을 결정한다.",{type:"choice",id:"final-command"}),
      task("v9-meridian-battle","등대 아래의 결전","최대 열 척의 동맹 함대로 자오선 요새 봉쇄선을 격파한다.",{type:"battle",tag:"meridian-final"},{marker:[-50.2,.5],spawnFleet:"meridian-final",minFragments:8,recommendedThreat:"최종 결전",rewardFame:6000}),
      task("v9-father-choice","다시 켜지는 등대","등대에 남은 데미안에게 마지막 대답을 전한다.",{type:"choice",id:"father-forgiveness"}),
      task("v9-return-lisbon","살아 돌아갈 모든 이의 이름","증거와 생존자를 이끌고 리스본에 입항한다.",{type:"dock",port:"bella"},{port:"bella",rewardFame:2500})
    ]},
    {id:"three-horizons",title:"제8장 · 세 개의 수평선",tasks:[
      task("v9-public-testimony","지우지 않는 기록","리스본 저택에서 의회에 제출할 증언과 명부를 정리한다.",{type:"facility",id:"mansion",port:"bella"},{port:"bella",facility:"mansion"}),
      task("v9-ending-choice","항로의 주인","복원한 항로를 관리할 원칙을 결정한다.",{type:"choice",id:"ending"})
    ],completeAfter:true}
  ]};

  HL.DATA.v9Choices={
    "mira-identity":{title:"감사관의 가명",prompt:"미라의 추적자가 시장에 들어왔다. 그녀의 정체를 어떻게 처리하겠는가?",options:[
      {id:"protect",label:"가명을 지켜 준다",warning:"회사의 감시를 받지만 미라의 신뢰가 오른다."},
      {id:"bargain",label:"장부 사본과 교환한다",warning:"증거를 얻지만 미라는 당신의 의도를 의심한다."}]},
    "massawa-rescue":{title:"사람과 관측 기구",prompt:"아에론은 순례선을 먼저 구하지 않으면 자신이 홀로 가겠다고 한다.",options:[
      {id:"people",label:"순례선을 먼저 구한다",warning:"관측 기구 회수가 늦어지지만 아에론이 살아남는다."},
      {id:"instrument",label:"관측 기구를 먼저 건진다",warning:"아에론이 홀로 구조에 나서 사망할 수 있다.",danger:true}]},
    "orso-confession":{title:"등대를 끈 손",prompt:"오르소가 렌즈를 바다에 던졌다고 고백했다. 그의 자리를 어떻게 할 것인가?",options:[
      {id:"keep",label:"끝까지 함께 듣게 한다",warning:"오르소가 배에 남아 구조 항해를 계속한다."},
      {id:"dismiss",label:"배에서 내리게 한다",warning:"오르소는 단독으로 옛 수로를 찾아 나서며 생존이 위태로워진다.",danger:true}]},
    "goa-medicine":{title:"봉인된 의약품",prompt:"약은 항구의 전염병 환자와 회사 호송대 중 한쪽에 먼저 보낼 수 있다.",options:[
      {id:"harbor",label:"항구 환자에게 보낸다",warning:"선원 건강과 미라의 신뢰를 얻고 숨은 보급항 기록을 찾는다."},
      {id:"convoy",label:"호송대 계약을 지킨다",warning:"금화와 회사 통행 허가를 얻지만 항구의 피해가 커진다."}]},
    "damian-terms":{title:"아버지를 태우는 조건",prompt:"데미안이 사카이에서 승선을 요청했다. 어떤 조건으로 받아들일 것인가?",options:[
      {id:"witness",label:"선장이 아닌 증인으로 탄다",warning:"리안의 지휘권이 분명해지고 데미안이 기록 공개에 동의한다."},
      {id:"navigator",label:"항로 안내를 맡긴다",warning:"항해 보너스를 얻지만 부자의 지휘 갈등이 커진다."}]},
    "mira-trust":{title:"명부를 함께 읽는 사람",prompt:"미라는 원본 명부를 리안에게 맡기며 자신의 판단도 믿어 달라고 한다.",options:[
      {id:"trust",label:"명부와 그녀를 믿는다",warning:"미라의 신뢰가 크게 오르고 함께하는 후일담이 열린다."},
      {id:"verify",label:"아에론의 검증을 먼저 받는다",warning:"증거의 공신력은 오르지만 미라와 거리가 생긴다."}]},
    "bardo-alliance":{title:"패자의 깃발",prompt:"바르도는 가족의 복수 대신 구조 함대를 지휘하겠다고 맹세한다.",options:[
      {id:"ally",label:"공동 선장으로 받아들인다",warning:"최종전에 바르도의 함대가 합류한다."},
      {id:"release",label:"홀로 떠나게 한다",warning:"바르도는 봉쇄선을 혼자 추격하며 사망할 수 있다.",danger:true}]},
    "final-command":{title:"최종 함대 명령",prompt:"요새 앞 수로는 한 척만 빠져나갈 만큼 좁다. 위험을 누구에게 맡길 것인가?",options:[
      {id:"united",label:"모든 함대가 함께 진입한다",warning:"전투 난도는 높지만 동료를 미끼로 쓰지 않는다."},
      {id:"bardo-decoy",label:"바르도의 함대를 미끼로 쓴다",warning:"적 진형은 무너지지만 바르도가 사망할 수 있다.",danger:true},
      {id:"orso-guide",label:"오르소에게 수로 선도를 맡긴다",warning:"암초는 피하지만 오르소가 포대 사거리에 홀로 노출된다.",danger:true}]},
    "father-forgiveness":{title:"등대의 마지막 불빛",prompt:"데미안은 대답을 요구하지 않는다. 다만 리안의 목소리를 마지막으로 듣고 싶어 한다.",options:[
      {id:"forgive",label:"용서하겠습니다",warning:"죄를 지우지 않고도 아버지를 사랑했다고 말한다."},
      {id:"distance",label:"이해하지만 잊지 않겠습니다",warning:"공로와 죄를 함께 기록하겠다고 약속한다."},
      {id:"refuse",label:"용서할 수 없습니다",warning:"희생은 존중하되 죄의 대가는 분명히 남긴다."}]},
    ending:{title:"세 개의 수평선",prompt:"두 번째 일몰 항로의 기록과 관리권을 누구에게 맡길 것인가?",options:[
      {id:"crown",label:"왕실의 법과 순찰에 맡긴다",warning:"안전은 늘지만 일부 기록이 다시 봉인될 수 있다."},
      {id:"league",label:"도시동맹에 사본을 나눈다",warning:"독점은 막지만 가난한 항구에 사용료가 남을 수 있다."},
      {id:"free",label:"모든 항해자에게 공개한다",warning:"구조망과 함께 해적에게도 새 길이 열린다."}]}
  };

  HL.DATA.companionQuests=[
    {id:"orso-1",companion:"orso",title:"세 개의 바람 매듭",description:"잔지바르 술집에서 오르소와 옛 바람 매듭을 해독한다.",unlockChapter:2,trigger:{type:"facility",id:"inn",port:"zanzibar"},rewardFragment:"monsoon-veil"},
    {id:"orso-2",companion:"orso",title:"렌즈를 만든 장인",description:"나가사키 조선소에서 등대 렌즈를 복원할 장인을 찾는다.",unlockChapter:3,trigger:{type:"facility",id:"shipyard",port:"nagasaki"}},
    {id:"aeron-1",companion:"aeron",title:"왕실보다 먼저 온 편지",description:"알렉산드리아 숙소에서 아에론의 비밀 보고서를 확인한다.",unlockChapter:2,trigger:{type:"facility",id:"lodge",port:"alexandria"}},
    {id:"aeron-2",companion:"aeron",title:"오차 없는 별은 없다",description:"광저우 길드에서 측량 오차를 숨긴 왕실 기록을 바로잡는다.",unlockChapter:3,trigger:{type:"facility",id:"guild",port:"guangzhou"}},
    {id:"mira-1",companion:"mira",title:"가명으로 남긴 빚",description:"안트베르펜 술집에서 실종 회계원의 가족에게 장부를 전한다.",unlockChapter:1,trigger:{type:"facility",id:"inn",port:"lume"}},
    {id:"mira-2",companion:"mira",title:"열일곱 번째 이름",description:"카르타헤나 길드에서 희생자 명부의 마지막 이름을 복원한다.",unlockChapter:4,trigger:{type:"facility",id:"guild",port:"cartagena"}},
    {id:"bardo-1",companion:"bardo",title:"붉은 닻의 난파선",description:"아바나 항만 사무소에서 바르도 가문의 난파 지점을 찾는다.",unlockChapter:4,trigger:{type:"facility",id:"harbor",port:"havana"},rewardFragment:"rival-half"},
    {id:"bardo-2",companion:"bardo",title:"세 번째 부표",description:"사우바도르 조선소에서 바르도의 반쪽 해도와 부표 탁본을 맞춘다.",unlockChapter:5,trigger:{type:"facility",id:"shipyard",port:"salvador"},rewardFragment:"amazon-rubbing"}
  ];

  const I="illustration",G="ingame";
  HL.DATA.storyCutscenes=[
    scene("v9_ch0_intro",0,"불을 끄라는 명령","prologue:beacon","cs9_beacon_night",I,[
      step("오르소 벤","1511년 성 루시아 해역. 바람은 등대의 돌벽을 뜯어낼 듯 울부짖었고, 수평선에서는 세 척의 호송선이 같은 간격으로 불빛을 올리고 있었습니다.","theme_main"),
      step("데미안 팔코","마티아스의 무장선이 저 빛을 따라오고 있다. 오늘 회랑의 위치가 확정되면 앞으로 이 바다를 건너는 모든 배가 그의 허가를 사야 한다.","theme_main"),
      step("오르소 벤","허나 불을 끄면 호송선도 수로를 잃습니다. 저들에게는 폭풍을 버틸 돛도, 되돌아갈 물도 남지 않았습니다.","theme_main"),
      step("데미안 팔코","나는 먼 훗날의 수천 척을 지키겠다고 맹세했다. 오늘 밤의 세 척을 버리는 죄는 내 이름으로 남겨라. 렌즈를 내려라.","theme_main"),
      step("오르소 벤","명령을 따르겠습니다. 그러나 각하, 꺼진 불빛은 장부에서 지울 수 있어도 사람의 눈에서는 지워지지 않을 것입니다.","theme_main",{sfx:"sail_snap"})
    ],{onComplete:"queue:v9_ch0_turn"}),
    scene("v9_ch0_turn",0,"침입자가 찾던 장부","chain","cs9_mansion_raid",I,[
      step("기록관","1526년 리스본. 팔코 저택의 창문이 깨진 밤, 열다섯 해 동안 실패담으로만 남았던 항로가 다시 사람을 움직이기 시작했습니다.","theme_main"),
      step("리안 팔코","금화와 은촛대는 그대로입니다. 침입자는 서재의 항해 일지만 뒤졌군요. 실패한 항로라면 이토록 비싼 칼을 보낼 까닭이 없지 않습니까.","theme_main"),
      step("데미안 팔코","그 길은 실패한 것이 아니라 내가 세상에서 지운 것이다. 되찾으려 들면 너 또한 사람의 목숨을 숫자로 고르는 자리에 서게 된다.","theme_main"),
      step("리안 팔코","그러면 아버지의 명예부터 믿으라는 말씀은 마십시오. 항로도 죄도 제 눈으로 확인한 뒤, 제 이름으로 판단하겠습니다.","theme_main"),
      step("데미안 팔코","조선소에 오래된 카라벨 한 척이 있다. 오르소가 열쇠를 지니고 있다. 바다가 너를 받아들일지는 그 다음의 일이다.","theme_west_europe")
    ],{onComplete:"finish-v9-prologue"}),
    scene("v9_ch0_end",0,"푸른 장부의 회계원","task:v9-antwerp-ledger","town_lume",G,[
      step("미라","유리 상자 열둘, 보험금 열셋. 이 장부는 틀린 것이 아니라 누군가 한 척을 일부러 더 적어 둔 것입니다.","theme_north_europe"),
      step("리안 팔코","없는 배의 보험금이 항구의 날짜와 풍향을 가리키는군요. 장부를 쓴 회계원은 어디 있습니까?","theme_north_europe"),
      step("미라","어젯밤 회사 사람들이 데려갔습니다. 나는 그의 조수 이레나입니다. 적어도 지금은 그렇게 불러 주십시오.","theme_north_europe"),
      step("마티아스 벨로르","팔코의 아들이 숫자에 밝다는 소문은 참이었군. 장부를 내게 넘기면 네 가문의 항해 허가와 명예를 모두 돌려주겠다.","theme_north_europe"),
      step("리안 팔코","명예가 장부 한 권 값이라면 너무 싸군요. 먼저 이 장부에 지워진 사람의 이름부터 알아보겠습니다.","theme_north_europe")
    ],{onComplete:"show-v9-choice:mira-identity"}),

    scene("v9_ch1_intro",1,"재 속의 여백","task:v9-genoa-archive","cs9_genoa_archive",I,[
      step("제노바 기록관","불은 본문을 먹었으나 가장자리의 바늘구멍은 남았습니다. 찢긴 장을 겹치면 하나의 해안선이 되지요.","theme_west_europe"),
      step("바르도 카인","그 해안선 끝에는 내 아버지의 배가 있다. 데미안 팔코가 구조 명단에서 지운 배다.","theme_west_europe"),
      step("리안 팔코","칼끝으로 재를 뒤흔들면 남은 글자마저 사라집니다. 함께 읽고도 내가 거짓말을 한다면 그때 결투하시죠.","theme_west_europe"),
      step("바르도 카인","말은 번듯하군. 좋다. 네가 복원한 첫 문장이 팔코의 서명이면, 다음에는 칼로 묻겠다.","theme_west_europe"),
      step("기록관","두 장을 포개자 푸른 여백이 세우타 서쪽의 계류장을 가리켰습니다. 그 아래에는 분명 데미안의 서명이 있었습니다.","theme_west_europe")
    ]),
    scene("v9_ch1_turn",1,"안쪽에서 풀린 밧줄","task:v9-rescue-aeron","cs9_ceuta_rescue",I,[
      step("오르소 벤","갈고리를 낮추십시오! 회색 봉인선의 선창에서 세 번 두드리는 소리가 납니다.","theme_battle"),
      step("아에론","늦지 않았군. 나는 납치된 척 회사 조사선에 올랐으나, 이들이 왕실 인장까지 사들였다는 것을 너무 늦게 알았다.","theme_battle"),
      step("리안 팔코","데미안의 서명은 무엇을 뜻합니까. 항로를 숨긴 명령입니까, 사람을 버린 명령입니까.","theme_main"),
      step("아에론","둘 다일 가능성이 크다. 등대는 벨로르의 독점을 막았고, 동시에 구조선의 눈을 멀게 했다. 진실은 어느 한쪽만 고르지 않는다.","theme_main"),
      step("오르소 벤","선장, 푸른 봉인 안쪽에 관측 각도가 새겨져 있습니다. 알렉산드리아의 옛 성반과 맞을 것입니다.","theme_main")
    ]),
    scene("v9_ch1_end",1,"별을 읽는 동료","task:v9-aeron-joins","interior_harbor",G,[
      step("아에론","왕실로 돌아가 보고하면 이 증언은 금고에 잠길 것이다. 나는 그보다 먼저 당신의 배에서 항로를 확인하고 싶다.","theme_west_europe"),
      step("리안 팔코","왕실 항해자가 몰락한 가문의 작은 카라벨에 타겠다니, 선실보다 소문이 먼저 가라앉겠군요.","theme_west_europe"),
      step("아에론","천문항법과 측량은 맡기겠다. 단, 별은 방향만 알려 줄 뿐 무엇이 옳은지는 선장이 정해야 한다.","theme_west_europe"),
      step("오르소 벤","선원 명부에 이름을 올리시오. 이제 새벽까마귀에는 과거를 숨긴 항해사와 왕실을 등진 항해자가 함께 타는군.","theme_west_europe"),
      step("리안 팔코","잘됐습니다. 나까지 셋이면 서로의 거짓말을 감시하기에 충분하겠지요.","theme_west_europe")
    ]),

    scene("v9_ch2_intro",2,"바다를 잠글 권리","task:v9-reach-alexandria","town_alexandria",G,[
      step("마티아스 벨로르","지중해의 난파 기록을 보아라. 위험한 항로를 모든 이에게 열어 두는 것은 자유가 아니라 무책임이다.","theme_africa"),
      step("리안 팔코","허가를 살 수 없는 배의 구조 신호를 지운 뒤, 난파가 많으니 통제가 필요하다고 말하는군요.","theme_africa"),
      step("마티아스 벨로르","질서는 언제나 값을 요구한다. 네 아버지도 그것을 알았기에 등대를 껐다. 우리 둘은 방법만 달랐을 뿐이다.","theme_africa"),
      step("아에론","성반을 확인하기 전까지 어느 쪽의 말도 결론이 될 수 없다. 기록고는 오늘 밤까지만 열린다.","theme_africa"),
      step("마티아스 벨로르","좋다. 별을 읽어라. 다만 별이 사람의 탐욕까지 피하게 해 주지는 않는다는 것을 기억해라.","theme_africa")
    ]),
    scene("v9_ch2_turn",2,"폭풍 속의 두 신호","task:v9-reach-massawa","cs9_massawa_storm",I,[
      step("아에론","북동쪽에 순례선의 횃불! 남쪽 암초 아래에는 우리가 찾던 황동 관측 기구가 있습니다.","theme_africa"),
      step("오르소 벤","파고가 더 오르면 둘 다 잃습니다. 사람을 먼저 구하면 장치는 수심 아래로 가라앉을 것이오.","theme_africa"),
      step("아에론","기구를 택하신다면 나는 작은 보트로 순례선에 가겠습니다. 돌아오지 못할 위험을 숨기지는 않겠습니다.","theme_africa"),
      step("리안 팔코","열다섯 해 전에도 누군가는 먼 훗날의 항로와 눈앞의 사람을 저울에 올렸겠지. 이번 답은 내가 정한다.","theme_africa"),
      step("기록관","번개가 수평선을 가르는 동안, 새벽까마귀의 밧줄은 두 방향 가운데 하나로 던져졌습니다.","theme_africa")
    ],{onComplete:"show-v9-choice:massawa-rescue"}),
    scene("v9_ch2_end",2,"등대를 끈 손","task:v9-massawa-recovery","cs9_orso_confession",I,[
      step("오르소 벤","선장께서 오늘 내린 명령을 보니 더 숨길 수가 없습니다. 열다섯 해 전 등대의 렌즈를 바다에 던진 사람은 나였습니다.","theme_africa"),
      step("리안 팔코","아버지가 명령했고 당신이 실행했군요. 그런데 왜 지금까지 새벽까마귀에 남았습니까.","theme_africa"),
      step("오르소 벤","호송대에는 내 동생도 타고 있었습니다. 나는 수천 척을 구한다는 말을 믿고 눈앞의 신호를 외면했습니다.","theme_africa"),
      step("리안 팔코","죄책감으로 내 배를 조종했다면 그것 또한 거짓입니다. 남으려면 다음 구조 신호를 내 명령보다 먼저 말하십시오.","theme_africa"),
      step("오르소 벤","용서를 구하지 않겠습니다. 다만 살아 있는 동안 한 사람의 이름도 장부에서 지우지 않겠습니다.","theme_africa")
    ],{onComplete:"show-v9-choice:orso-confession"}),

    scene("v9_ch3_intro",3,"봉인된 의약품","task:v9-reach-goa","town_goa",G,[
      step("고아 의사","창고에는 약이 쌓였으나 회사 인장이 찍혀 손댈 수 없습니다. 항구에서는 사흘째 열병으로 아이들이 죽고 있습니다.","theme_asia"),
      step("회사 감독관","그 약은 동쪽 호송대의 계약품이다. 봉인을 뜯으면 모든 포르투갈 항구에서 보급을 거절당할 수 있다.","theme_asia"),
      step("미라의 편지","회사는 약 상자의 봉인에 비상 보급항 좌표를 함께 새깁니다. 항구에 약을 풀면 그 기록도 얻을 수 있을 것입니다.","theme_asia"),
      step("데미안의 편지","선장은 모든 생명을 구할 수 없다. 그러나 무엇을 포기했는지는 반드시 자기 이름으로 적어야 한다.","theme_asia"),
      step("리안 팔코","이번 장부에는 계약보다 먼저 사람의 이름을 쓰겠습니다. 그 대가도 함께 적지요.","theme_asia")
    ],{onComplete:"show-v9-choice:goa-medicine"}),
    scene("v9_ch3_turn",3,"값을 매긴 등불","task:v9-malacca-lighthouse","interior_harbor",G,[
      step("말라카 항만장","밤에 등대를 쓰려면 회사 통행장을 사야 합니다. 통행장이 없는 배는 바깥 암초에서 날이 밝기를 기다립니다.","theme_asia"),
      step("오르소 벤","장부의 면제 시간을 보시오. 달이 없는 밤마다 두 시간씩 요금이 비어 있습니다. 봉쇄선이 교대하는 때입니다.","theme_asia"),
      step("리안 팔코","빛에 값을 매긴 자들은 어둠도 자기 것이라 믿는 모양이군요. 빈 두 시간의 수로를 해도에 옮깁시다.","theme_asia"),
      step("아에론","이 각도는 광저우 쌍룡 도자기의 비늘 수와 맞습니다. 장식처럼 보인 문양이 해류표였던 셈입니다.","theme_asia"),
      step("항만장","통행장을 가져가시오. 오늘 밤부터는 어느 구조선에도 등대 사용료를 받지 않겠습니다.","theme_asia")
    ]),
    scene("v9_ch3_end",3,"열아홉 해의 달력","task:v9-sakai-calendar","cs9_sakai_calendar",I,[
      step("사카이 천문관","리스본의 겨울 그림자와 광저우의 도자기 해류를 이 달력에 겹치면, 열아홉 번째 칸에서 해가 두 번 지는 것처럼 보입니다.","theme_asia"),
      step("아에론","섬이 아니군. 지구를 한 바퀴 돌아온 날짜와 계절풍이 같은 시각에 교차하는 회랑이다.","theme_asia"),
      step("데미안 팔코","마티아스와 나는 이 계산을 함께 완성했다. 나는 그가 항로를 잠글까 두려워 등대를 껐고, 그 뒤의 희생까지 숨겼다.","theme_asia"),
      step("리안 팔코","고백은 리스본의 안전한 서재가 아니라 제 배에서 하십시오. 앞으로의 명령은 제가 내립니다.","theme_asia"),
      step("데미안 팔코","받아들이겠다. 선장이 아니라 증인으로 타라면 그리하마. 다음 개방까지 남은 시간은 넉 달뿐이다.","theme_asia")
    ],{onComplete:"show-v9-choice:damian-terms"}),

    scene("v9_ch4_intro",4,"세 사람의 태평양","task:v9-depart-nagasaki","cs9_pacific_crossing",I,[
      step("기록관","새벽까마귀는 나가사키를 떠나 지도 가장자리의 빈 바다로 들어갔습니다. 뒤에는 동방의 항구, 앞에는 아직 보이지 않는 서쪽 대륙뿐이었습니다.","theme_main"),
      step("데미안 팔코","구름 아래 새 떼가 있다. 북서쪽에 떠도는 배가 있을 것이다. 항로를 벗어나지만 확인해야 한다.","theme_main"),
      step("오르소 벤","예전의 각하라면 회랑의 시간을 잃지 말라 하셨을 겁니다.","theme_main"),
      step("데미안 팔코","예전의 나는 먼 훗날을 핑계로 눈앞의 불빛을 외면했다. 같은 잘못을 두 번 지혜라 부를 수는 없다.","theme_main"),
      step("리안 팔코","침로를 북서로 열 도 돌립니다. 구조가 끝나면 잃은 시간은 우리가 더 나은 항해로 되찾겠습니다.","theme_main")
    ]),
    scene("v9_ch4_turn",4,"붉은 닻의 의미","task:v9-reach-havana","town_havana",G,[
      step("아바나 잠수부","난파선의 돛대에는 붉은 닻이 남아 있었습니다. 해적 표식이라 생각했지만 선창에는 아이들의 신발과 가족 편지가 가득했지요.","theme_main"),
      step("바르도 카인","그 배가 내 아버지의 산타 로사호다. 데미안이 버린 호송대의 마지막 배다.","theme_main"),
      step("데미안 팔코","네 아버지는 마지막까지 다른 두 배에 물을 나눴다. 나는 그 사실까지 기록에서 지웠다.","theme_main"),
      step("바르도 카인","사과는 바다 밑의 사람을 살리지 못한다. 그러나 진실을 말할 기회를 네 아들에게는 주겠다.","theme_main"),
      step("리안 팔코","난파선을 조사합시다. 붉은 닻이 복수가 아니라 구조 신호였다는 것을 세상에 남기겠습니다.","theme_main")
    ]),
    scene("v9_ch4_end",4,"열일곱 번째 이름","task:v9-rescue-mira","cs9_cartagena_register",I,[
      step("미라 소렐","안트베르펜에서 이레나라 불렀던 사람의 진짜 이름은 미라 소렐입니다. 왕립 해운회사의 감사관이었지요.","theme_main"),
      step("리안 팔코","정체보다 먼저 묻겠습니다. 그 명부 때문에 카르타헤나 지하실까지 쫓긴 겁니까.","theme_main"),
      step("미라 소렐","세 척이 아니었습니다. 시험 항해와 봉쇄 때문에 사라진 배는 열일곱 척입니다. 회사는 모두 해적이나 폭풍으로 기록했습니다.","theme_main"),
      step("바르도 카인","내 가족의 이름도 있군. 복수할 사람을 잘못 골랐지만, 그렇다고 팔코의 죄가 사라지는 것은 아니다.","theme_main"),
      step("미라 소렐","그래서 이 명부를 리안에게 맡깁니다. 한쪽의 영웅담으로 바꾸지 않고 모든 이름을 함께 읽어 줄 사람에게.","theme_main")
    ],{onComplete:"show-v9-choice:mira-trust"}),

    scene("v9_ch5_intro",5,"보험금이 지운 가족","task:v9-recife-records","town_recife",G,[
      step("헤시피 어부","아버지의 배는 회사 해도를 따라갔다가 암초에 걸렸습니다. 그런데 장부에는 해적으로 도망쳤다고 적혀 보험금도 받지 못했습니다.","theme_main"),
      step("미라 소렐","같은 필체가 열한 가족의 기록을 바꿨습니다. 조난선을 범죄자로 만들면 회사는 구조 비용과 보험금을 모두 아낄 수 있었죠.","theme_main"),
      step("리안 팔코","원본 항해 시간을 시장의 입항 종 기록과 대조합시다. 배가 암초에 닿은 시각에는 항구 경비도 구조 신호를 보았을 겁니다.","theme_main"),
      step("데미안 팔코","장부의 한 줄은 바다의 포탄보다 오래 사람을 해친다. 내가 기록을 고쳤을 때 이 가족들의 얼굴은 생각하지 않았다.","theme_main"),
      step("어부","금화보다 이름을 돌려주시오. 아이들이 할아버지를 해적으로 기억하지 않게 해 주시오.","theme_main")
    ]),
    scene("v9_ch5_turn",5,"세 번 깜박이는 불빛","task:v9-salvador-testimony","town_salvador",G,[
      step("사우바도르 길드장","남쪽 바다에서 푸른 불이 세 번씩 보입니다. 오래된 구조 신호지만 회사는 밀수선의 암호라며 출항을 금했습니다.","theme_main"),
      step("오르소 벤","새벽까마귀가 열다섯 해 전 쓰던 신호입니다. 누군가 자오선 요새에서 우리를 부르고 있습니다.","theme_main"),
      step("미라 소렐","희생자 명부의 마지막 장과 데미안의 폐기 명령이 여기서 맞습니다. 열두 조각을 모두 모으면 구조 요청의 원문까지 증명할 수 있어요.","theme_main"),
      step("데미안 팔코","나는 세 척을 버린 뒤 더 많은 시험 항해가 계속될 것을 알면서도 침묵했다. 항로를 지킨 것이 아니라 내 선택의 의미를 지키려 했다.","theme_main"),
      step("리안 팔코","그 고백도 해도에 올리겠습니다. 이제 조각을 맞추고, 신호를 보낸 사람에게 갑시다.","theme_main")
    ]),
    scene("v9_ch5_end",5,"완성된 수평선","task:v9-chart-assembly","interior_guild",G,[
      step("아에론","필수 여덟 조각이 하나의 계절풍 회랑을 이루었습니다. 나머지 네 조각은 숨은 샘과 구조 부표, 희생자 명단을 보완합니다.","theme_main"),
      step("미라 소렐","여덟 조각만으로도 요새에 갈 수 있습니다. 열두 조각을 맞추면 누구도 희생자 수를 부정할 수 없습니다.","theme_main"),
      step("바르도 카인","내 함대는 준비됐다. 다만 날 미끼로 쓰려면 지금 말해라. 복수보다 구조가 먼저라는 맹세를 하고 왔다.","theme_main"),
      step("오르소 벤","부표 수로는 한 척 너비입니다. 선두선은 요새 포대에 가장 오래 노출됩니다.","theme_main"),
      step("리안 팔코","항해 일지에 모든 위험을 적습니다. 누구도 모르는 명령으로 사람을 보내지 않겠습니다.","theme_main")
    ]),

    scene("v9_ch6_intro",6,"물이 사라지는 방향","task:v9-amazon-channel","sea",G,[
      step("오르소 벤","첫 번째 부표는 동쪽, 두 번째는 북동쪽을 가리킵니다. 그러나 세 번째 주변에서는 물살이 사라집니다.","theme_main"),
      step("미라 소렐","화살표는 포대 쪽으로 유인하는 거짓 표식입니다. 탁본의 빈 부분처럼 남쪽으로 돌아야 합니다.","theme_main"),
      step("아에론","수심은 기함이 겨우 지날 정도입니다. 전 함대가 붙으면 빠져나오기 어렵지만 누구도 홀로 노출되지는 않습니다.","theme_main"),
      step("바르도 카인","내 브리그는 빠르다. 미끼가 필요하다면 맡겠다. 다만 위험을 숨긴 채 명령하지는 마라.","theme_main"),
      step("리안 팔코","각 선장에게 수로와 포대 사거리를 모두 공개합니다. 그 뒤에 내가 최종 명령을 내리겠습니다.","theme_main")
    ],{onComplete:"show-v9-choice:final-command"}),
    scene("v9_ch6_turn",6,"자오선의 함대","task:v9-meridian-battle","cs9_meridian_fleet",I,[
      step("마티아스 벨로르","리안, 네 뒤의 배들을 보아라. 해도를 공개하면 저들 가운데 누가 구조선이고 누가 다음 해적이 될지 구별할 수 있겠느냐.","theme_battle"),
      step("리안 팔코","구별할 수 없다는 이유로 모두를 침몰시키는 권리를 당신에게 준 사람도 없습니다.","theme_battle"),
      step("마티아스 벨로르","나는 바다의 문을 지켜 수천 척의 질서를 만들었다. 네 자유는 다음 전쟁의 수로가 될 것이다.","theme_battle"),
      step("바르도 카인","질서라는 말 뒤에 우리 가족을 숨기지 마라. 오늘 이 함대는 복수가 아니라 아직 살아 있는 배를 위해 싸운다.","theme_battle"),
      step("리안 팔코","전 함대, 구조 신호를 기준으로 진형을 유지한다. 적 기함보다 민간선의 퇴로를 먼저 연다!","theme_battle")
    ],{onComplete:"queue:v9_ch6_end"}),
    scene("v9_ch6_end",6,"다시 켜지는 등대","battle:meridian-final","cs9_meridian_beacon",I,[
      step("기록관","요새의 포대가 무너진 순간 더 큰 폭풍이 대하 입구를 덮쳤습니다. 민간선들은 꺼진 등대 아래에서 다시 수로를 잃었습니다.","theme_main"),
      step("데미안 팔코","열다섯 해 전 내가 끈 불이다. 발전실을 손으로 돌리면 한 번은 다시 밝힐 수 있다. 그러나 폭풍이 끝날 때까지 내려올 수는 없다.","theme_main"),
      step("리안 팔코","함께 돌아갈 다른 길을 찾겠습니다. 또다시 한 사람을 남겨 두고 수천 명을 구했다 말하지 마십시오.","theme_main"),
      step("데미안 팔코","이번에는 내가 선택당한 것이 아니라 선택한다. 네가 구조선을 이끌고 모든 이름을 살아서 가져가라.","theme_main"),
      step("기록관","등대가 켜지자 마티아스의 기함은 폭풍 속으로 사라졌고, 데미안의 마지막 불빛은 모든 배가 수로를 벗어날 때까지 꺼지지 않았습니다.","theme_main")
    ],{onComplete:"show-v9-choice:father-forgiveness"}),

    scene("v9_ch7_intro",7,"지우지 않는 재판","task:v9-public-testimony","cs9_lisbon_council",I,[
      step("리스본 의장","데미안 팔코는 항로 독점을 막았으나 구조 신호를 외면했고, 마티아스 벨로르는 질서를 세웠으나 희생자의 기록을 지웠다.","theme_main"),
      step("미라 소렐","여기 열일곱 척의 명부와 보험 장부, 항만 종 기록이 있습니다. 어느 한 사람의 영웅담으로 줄일 수 없는 증거입니다.","theme_main"),
      step("오르소 벤","등대를 끈 손은 내 손이었습니다. 나는 명령을 따랐다는 말로 책임을 피하지 않겠습니다.","theme_main"),
      step("리안 팔코","아버지의 공로를 죄의 방패로 쓰지 않겠습니다. 죄를 이유로 그가 마지막에 살린 사람들까지 지우지도 않겠습니다.","theme_main"),
      step("의장","그러면 마지막 질문이 남았다. 복원된 항로와 해도는 누구의 책임 아래 둘 것인가.","theme_main")
    ],{onComplete:"show-v9-choice:ending"}),
    scene("v9_ch7_turn",7,"세 개의 약속","choice:ending","interior_mansion",G,[
      step("아에론","왕실은 순찰과 구조법을 만들 수 있습니다. 동시에 불편한 기록을 봉인할 힘도 지닙니다.","theme_main"),
      step("미라 소렐","도시동맹은 사본을 여러 금고에 나눌 것입니다. 그러나 가난한 항구에 사용료를 요구할지도 모릅니다.","theme_main"),
      step("오르소 벤","모든 항해자에게 공개하면 구조선이 가장 빨리 배울 것입니다. 해적 또한 같은 속도로 배울 것이오.","theme_main"),
      step("리안 팔코","완벽한 선택은 없군요. 그러니 누가 이익을 얻는가만이 아니라 누가 책임을 나누는가를 기준으로 정하겠습니다.","theme_main"),
      step("기록관","리안은 빈 장부의 첫 줄에 선택한 원칙을 적고, 그 아래에 반대 의견까지 지우지 않고 남겼습니다.","theme_main")
    ],{onComplete:"queue:v9_ch7_end"}),
    scene("v9_ch7_end",7,"다음 항해의 자리","chain","town_bella",G,[
      step("기록관","두 번째 일몰 항로는 세상을 완벽하게 만들지 않았습니다. 다만 조난자의 이름을 지우는 일이 전보다 훨씬 어려워졌습니다.","theme_main"),
      step("오르소 벤","새벽까마귀의 용골을 손봤습니다. 다음에는 누구의 과거를 쫓을 생각이오, 선장?","theme_main"),
      step("미라 소렐","내 감사 장부에도 빈 칸이 하나 있습니다. 다음 항해의 목적지를 적기 전까지는 리안의 해도 옆에 두려 합니다.","theme_main"),
      step("리안 팔코","수평선은 소유할 수 없습니다. 우리가 할 수 있는 일은 다음 배가 돌아올 불빛을 남기는 것뿐입니다.","theme_main"),
      step("기록관","새벽까마귀가 다시 돛을 올리자, 리스본의 등대는 낮인데도 한 번 길게 불을 밝혔습니다.","theme_main")
    ])
  ];
  HL.DATA.cutsceneById=Object.fromEntries(HL.DATA.storyCutscenes.map(item=>[item.id,item]));
})();
