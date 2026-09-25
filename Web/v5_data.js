window.HL=window.HL||{};
(function(){
  HL.DATA.version=5;

  const task=(id,title,description,trigger,options={})=>({id,title,description,trigger,...options});
  HL.DATA.campaign={
    id:"rian-meridian-ledger",
    title:"수평선의 장부",
    chapters:[
      {id:"inherited-route",title:"제0장 · 상속된 항로",tasks:[
        task("claim-ship","새벽까마귀 인수","리스본 조선소에서 오르소 벤을 만나 첫 배를 인수한다.",{type:"action",id:"accept-ship"},{port:"bella",facility:"shipyard",rewardFame:100})
      ]},
      {id:"blue-ledger",title:"제1장 · 푸른 장부",legacyQuest:true,tasks:[]},
      {id:"missing-navigator",title:"제2장 · 사라진 왕실 항해자",tasks:[
        task("hear-royal-rumor","왕실의 소문","탐험 명성 2,000을 쌓고 아무 술집에서 왕실 항해자의 실종 소문을 듣는다.",{type:"facility",id:"inn"},{minFame:2000,facility:"inn",region:"유럽과 지중해",rewardFame:300}),
        task("reach-ceuta","세우타의 목격자","세우타에 입항해 항만 관리인에게 실종자의 마지막 항로를 묻는다.",{type:"dock",port:"ceuta"},{port:"ceuta",facility:"harbor",recommendedThreat:"보통"}),
        task("rescue-aeron","검은 돛 추격","세우타 서쪽에서 왕실 항해자 아에론을 억류한 사략선을 나포한다.",{type:"battle",tag:"royal-rescue"},{marker:[-7.8,35.7],spawnFleet:"royal-rescue",recommendedThreat:"위험",rewardFame:1500}),
        task("report-rescue","귀환 보고","리스본 저택에서 아에론의 푸른 봉인장을 데미안에게 전달한다.",{type:"facility",id:"mansion",port:"bella"},{port:"bella",facility:"mansion",rewardFame:700})
      ]},
      {id:"tide-staff",title:"제3장 · 조류의 지팡이",tasks:[
        task("receive-staff-order","황동 관측구","탐험 명성 10,000을 달성한 뒤 리스본 저택에서 새 임무를 받는다.",{type:"facility",id:"mansion",port:"bella"},{port:"bella",facility:"mansion",minFame:10000}),
        task("alexandria-archive","알렉산드리아 기록고","알렉산드리아 길드에서 황동 관측구의 동방 항로 기록을 조사한다.",{type:"facility",id:"guild",port:"alexandria"},{port:"alexandria",facility:"guild",rewardFame:600}),
        task("massawa-search","붉은 해협 수색","마사와 연안의 표시된 해역에서 조류의 지팡이를 수색한다.",{type:"search",near:[39.2,15.4],radius:1.4},{port:"massawa",marker:[39.2,15.4],requiredItem:"sextant",rewardFame:1800}),
        task("massawa-defense","마사와 방어","유물을 노리는 붉은 돛 함대를 격파한다.",{type:"battle",tag:"massawa-defense"},{marker:[39.8,15.2],spawnFleet:"massawa-defense",recommendedThreat:"매우 위험",rewardFame:2200})
      ]},
      {id:"eastbound-scholar",title:"제4장 · 동쪽으로 간 학자",tasks:[
        task("scholar-request","동방행 동료","탐험 명성 30,000을 달성하고 술집에서 학자 에네오의 호송 의뢰를 받는다.",{type:"facility",id:"inn"},{minFame:30000,facility:"inn"}),
        task("nagasaki-arrival","나가사키의 첫 일몰","에네오를 태우고 나가사키에 입항한다.",{type:"dock",port:"nagasaki"},{port:"nagasaki",recommendedThreat:"위험",rewardFame:1600}),
        task("sakai-record","사카이 천문 기록","사카이 길드에서 두 번째 일몰이 날짜선과 계절풍을 함께 기록한 암호임을 확인한다.",{type:"facility",id:"guild",port:"sakai"},{port:"sakai",facility:"guild",rewardFame:2400})
      ]},
      {id:"western-river",title:"제5장 · 서쪽 강의 성채",tasks:[
        task("western-letter","서쪽에서 온 편지","탐험 명성 40,000을 달성하고 리스본 길드에서 에네오의 편지를 받는다.",{type:"facility",id:"guild",port:"bella"},{port:"bella",facility:"guild",minFame:40000}),
        task("cartagena-contact","카르타헤나의 도망자","카르타헤나에 입항해 왕립 해운회사의 도망자 미라 소렐을 찾는다.",{type:"dock",port:"cartagena"},{port:"cartagena",rewardFame:800}),
        task("tavern-rescue","술집의 칼부림","카르타헤나 술집에서 미라를 억류한 해적들과 맞선다.",{type:"facility",id:"inn",port:"cartagena"},{port:"cartagena",facility:"inn"}),
        task("rival-captain","경쟁자의 동맹","항구 밖에서 바르도 함대를 이기고 자오선 요새의 위치를 얻는다.",{type:"battle",tag:"cartagena-rival"},{marker:[-75.9,10.7],spawnFleet:"cartagena-rival",recommendedThreat:"매우 위험",rewardFame:3000})
      ]},
      {id:"meridian-citadel",title:"제6장 · 자오선 요새",tasks:[
        task("amazon-mouth","대하의 검은 표식","남미 대하 입구에서 미라의 암호와 일치하는 수로를 수색한다.",{type:"search",near:[-49.5,0.2],radius:2},{marker:[-49.5,0.2],requiredItem:"chart",rewardFame:2200}),
        task("citadel-battle","자오선 요새 결전","강 하구를 봉쇄한 왕립 해운회사 전투 함대를 격파한다.",{type:"battle",tag:"meridian-final"},{marker:[-50.2,0.5],spawnFleet:"meridian-final",recommendedThreat:"최종 결전",rewardFame:5000}),
        task("return-lisbon","증거와 함께 귀환","리스본으로 돌아가 데미안에게 원본 장부와 생존자 증언을 전달한다.",{type:"facility",id:"mansion",port:"bella"},{port:"bella",facility:"mansion",rewardFame:2500})
      ]},
      {id:"homecoming",title:"종장 · 귀환",complete:true,tasks:[]}
    ]
  };

  const frameRects=(w,h)=>Object.fromEntries(Array.from({length:8},(_,direction)=>[
    direction,Array.from({length:10},(_,frame)=>({x:frame*w,y:direction*h,w,h,pivot:[Math.floor(w/2),h-3]}))
  ]));
  HL.DATA.spriteSheets={
    rian:{
      town:{src:"../Assets/Resources/Sprites/Game/V5/rian_town_v5.png",frameWidth:48,frameHeight:72,frames:frameRects(48,72)},
      interior:{src:"../Assets/Resources/Sprites/Game/V5/rian_interior_v5.png",frameWidth:64,frameHeight:96,frames:frameRects(64,96)},
      directions:["N","NE","E","SE","S","SW","W","NW"],idleFrames:[0,1,2,3],walkFrames:[4,5,6,7,8,9],fps:{idle:3,walk:10},hitRadius:.28
    }
  };
  for(const id of["orso","damian","mira","vardo"])HL.DATA.spriteSheets[id]={
    town:{src:`../Assets/Resources/Sprites/Game/V5/${id}_town_v5.png`,frameWidth:48,frameHeight:72,frames:frameRects(48,72)},
    interior:{src:`../Assets/Resources/Sprites/Game/V5/${id}_interior_v5.png`,frameWidth:64,frameHeight:96,frames:frameRects(64,96)},
    directions:["N","NE","E","SE","S","SW","W","NW"],idleFrames:[0,1,2,3],walkFrames:[4,5,6,7,8,9],fps:{idle:3,walk:10},hitRadius:.28
  };
  HL.DATA.spriteMeta=HL.DATA.spriteSheets.rian;

  HL.DATA.worldChunks={
    width:8192,height:4096,tileSize:1024,columns:8,rows:4,
    path:(row,column)=>`../Assets/Resources/Sprites/Game/V5/WorldChunks/world_${row}_${column}.png`,
    overview:"../Assets/Resources/Sprites/Game/V5/world_map_source_v5.png"
  };

  HL.DATA.storyFleets={
    "royal-rescue":{name:"회색 봉인 사략선",lon:-7.8,lat:35.7,strength:1.1,shipType:"brig"},
    "massawa-defense":{name:"붉은 해협 함대",lon:39.8,lat:15.2,strength:1.55,shipType:"galley"},
    "cartagena-rival":{name:"바르도의 검은 돛",lon:-75.9,lat:10.7,strength:1.8,shipType:"brig"},
    "meridian-final":{name:"자오선 요새 전단",lon:-50.2,lat:.5,strength:2.3,shipType:"brig"}
  };
})();
