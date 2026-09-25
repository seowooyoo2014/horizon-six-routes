window.HL=window.HL||{};
(function(){
  "use strict";
  const copy=value=>JSON.parse(JSON.stringify(value));
  const audioRoot="../Assets/Resources/Audio/";
  const artRoot="../Assets/Resources/Sprites/Cutscenes/V8/";
  const scene=(id,chapter,title,trigger,background,steps,options={})=>({id,chapter,title,trigger,background,steps,skippable:true,replayable:true,...options});
  const step=(speaker,text,musicKey,extra={})=>({speaker,text,musicKey,...extra});

  HL.DATA.version=8;
  HL.DATA.musicTracks={
    theme_main:{videoId:"RXioO-iDEc4",file:"theme_main",gain:.86},
    theme_north_europe:{videoId:"fc2uOHpOtWE",file:"theme_north_europe",gain:.78},
    theme_battle:{videoId:"claLeW3r9x8",file:"theme_battle",gain:.9},
    theme_china:{videoId:"SqT-Y3P2K0I",file:"theme_china",gain:.78},
    theme_west_europe:{videoId:"cxfOE9l6vjM",file:"theme_west_europe",gain:.78},
    theme_africa:{videoId:"viD6wta3Pbw",file:"theme_africa",gain:.8},
    theme_asia:{videoId:"XVLBgI0eMUA",file:"theme_asia",gain:.78}
  };
  HL.DATA.musicCulture={north:"theme_north_europe",iberia:"theme_west_europe",med:"theme_west_europe",europe:"theme_west_europe",ottoman:"theme_africa",arabia:"theme_africa",africa:"theme_africa",china:"theme_china",india:"theme_asia",seasia:"theme_asia",japan:"theme_asia",caribbean:"theme_main",america:"theme_main",pacific:"theme_main"};

  const dedicated={
    cs8_storm_beacon:"storm_beacon.png",cs8_mansion_raid:"mansion_raid.png",cs8_genoa_confrontation:"genoa_confrontation.png",cs8_aeron_rescue:"aeron_rescue.png",cs8_massawa_relic:"massawa_relic.png",cs8_orso_confession:"orso_confession.png",cs8_sakai_observatory:"sakai_observatory.png",cs8_cartagena_cellar:"cartagena_cellar.png",cs8_meridian_archive:"meridian_archive.png",cs8_final_fleet:"final_fleet.png"
  };
  for(const[id,file]of Object.entries(dedicated))HL.DATA.sceneAssets[id]={background:artRoot+file,nativeSize:[960,540]};

  HL.DATA.storyCutscenes=[
    scene("ch0_intro",0,"꺼진 등대","new-game","cs8_storm_beacon",[
      step("기록관","1511년, 성 루시아 해역. 열아홉 해에 한 번 열린다는 계절풍 회랑 앞에서 세 척의 민간 호송대가 폭풍에 갇혔다.","theme_main",{sfx:"wave_click"}),
      step("오르소 벤","등대를 끄면 저 배들은 수로를 찾지 못합니다. 하지만 불을 켜면 벨로르의 무장선이 항로를 차지할 겁니다.","theme_main"),
      step("데미안 팔코","오늘 밤의 죄는 내가 짊어진다. 이 길이 한 사람의 왕관이나 금고에 들어가게 둘 수는 없다.","theme_main",{sfx:"sail_snap"})
    ],{onComplete:"queue:ch0_turn"}),
    scene("ch0_turn",0,"침입자의 흔적","chain","cs8_mansion_raid",[
      step("리안 팔코","누군가 서재를 뒤졌습니다. 아버지의 실패담에 훔칠 만한 것이 있었다는 뜻이군요.","theme_main"),
      step("데미안 팔코","실패가 아니다. 내가 지워 버린 항로다. 그리고 네가 복원한다면 나보다 더 나쁜 선택을 강요받게 될 것이다.","theme_main"),
      step("리안 팔코","가문의 이름이 아니라 진실을 찾겠습니다. 그 뒤에 무엇을 할지는 제가 결정하겠습니다.","theme_main")
    ],{onComplete:"finish-prologue"}),
    scene("ch0_end",0,"새벽까마귀의 흉터","task:claim-ship","cutscene_dawn_raven",[
      step("오르소 벤","이 흉터는 암초가 아니라 꺼진 등대를 찾아 헤매다 생긴 겁니다. 새벽까마귀도 그날 밤을 기억합니다.","theme_west_europe"),
      step("리안 팔코","그렇다면 이 배로 그날의 항로를 다시 지나가죠. 이번에는 아무도 기록에서 지우지 않겠습니다.","theme_west_europe",{sfx:"wood_knock"})
    ]),

    scene("ch1_intro",1,"사라진 회계원","event:lume-ledger","town_lume",[
      step("안트베르펜 상인","푸른 유리 거래를 기록하던 회계원이 어젯밤 사라졌습니다. 남긴 것은 숫자 사이에 끼운 해도 조각뿐입니다.","theme_north_europe"),
      step("오르소 벤","가격표가 아니라 날짜와 풍향입니다. 누군가 장부를 읽는 사람부터 없애고 있습니다.","theme_north_europe")
    ]),
    scene("ch1_turn",1,"제노바의 경쟁자","event:legacy-clue","cs8_genoa_confrontation",[
      step("바르도 카인","팔코의 아들이 장부를 찾는다고 들었다. 네 아버지가 불태운 기록에는 내 가족의 이름도 있었다.","theme_west_europe"),
      step("리안 팔코","칼을 겨누기 전에 함께 기록을 확인해요. 우리 둘 다 같은 거짓말을 쫓고 있을지 모릅니다.","theme_west_europe")
    ]),
    scene("ch1_end",1,"불태우라는 명령","event:legacy-battle","sea",[
      step("추적선 장교","우리가 받은 첫 명령서는 벨로르가 아니라 데미안 팔코의 서명이었다. 장부를 태우고 생존자를 기록하지 말라는 명령이었다.","theme_battle"),
      step("리안 팔코","아버지가 항로만 숨긴 게 아니었어. 리스본으로 돌아가기 전에 더 많은 증거가 필요해.","theme_main")
    ]),

    scene("ch2_intro",2,"빈 계류장","task:hear-royal-rumor","interior_inn",[
      step("아에론의 부관","왕실 항해자 아에론의 배가 세우타에서 발견됐습니다. 밧줄은 끊긴 게 아니라 갑판 안쪽에서 풀려 있었습니다.","theme_west_europe"),
      step("미라 소렐","그는 납치된 척 회사 조사선에 올랐습니다. 내부 장부를 훔치려다 정체가 드러난 거죠.","theme_west_europe")
    ]),
    scene("ch2_turn",2,"푸른 봉인장","task:rescue-aeron","cs8_aeron_rescue",[
      step("아에론","데미안은 항로를 발견했습니다. 그리고 벨로르가 민간선을 버리라는 명령을 내렸을 때 등대를 껐습니다.","theme_battle"),
      step("리안 팔코","사람들을 지키려 항로를 숨겼지만, 바로 그 선택으로 다른 사람들을 버렸다는 말입니까?","theme_main")
    ],{onComplete:"show-story-choice"}),
    scene("ch2_end",2,"반쪽의 자백","task:report-rescue","cutscene_falco_legacy",[
      step("데미안 팔코","항로를 숨긴 것은 인정한다. 하지만 그날의 희생은 폭풍 때문이었다. 내 선택 때문은 아니었다.","theme_west_europe"),
      step("아에론","그렇다면 왜 구조 요청 시간까지 바꾸셨습니까? 아직 말하지 않은 장부가 한 장 더 있습니다.","theme_west_europe")
    ]),

    scene("ch3_intro",3,"불탄 성반","task:receive-staff-order","interior_guild",[
      step("알렉산드리아 기록관","성반의 별자리는 긁혀 나갔지만 가장자리의 조류선은 남았습니다. 마사와에서 건져 올린 장치와 맞을 겁니다.","theme_africa"),
      step("리안 팔코","기록을 없앤 사람과 복원할 길을 남긴 사람이 같은 손이라니. 아버지는 누군가 뒤따라오길 바랐던 겁니다.","theme_africa")
    ]),
    scene("ch3_turn",3,"조류의 지팡이","task:massawa-search","cs8_massawa_relic",[
      step("오르소 벤","순례선 아래에 사람이 있습니다! 유물보다 먼저 밧줄을 내리십시오!","theme_africa",{sfx:"rope_creak"}),
      step("리안 팔코","오늘은 항로 때문에 사람을 버리지 않습니다. 장치는 다시 찾을 수 있어도 생명은 그렇지 않아요.","theme_africa")
    ]),
    scene("ch3_end",3,"오르소의 침묵","task:massawa-defense","cs8_orso_confession",[
      step("오르소 벤","그날 등대의 불을 끈 사람은 데미안이지만, 렌즈를 바다에 던진 사람은 나였습니다. 제 동생도 호송대에 타고 있었죠.","theme_africa"),
      step("리안 팔코","당신을 용서할지는 아직 모르겠습니다. 하지만 다음 구조 요청은 함께 들을 겁니다. 끝까지요.","theme_africa")
    ],{onComplete:"show-story-choice"}),

    scene("ch4_intro",4,"겹쳐진 일몰","task:scholar-request","interior_guild",[
      step("에네오","리스본, 잔지바르, 사카이의 일몰 기록을 겹치면 하나의 나선이 됩니다. 전설이 아니라 날짜와 바람의 계산입니다.","theme_main"),
      step("리안 팔코","그 계산이 맞다면 벨로르는 항로가 열리기 전에 보급항을 모두 사들이고 있겠군요.","theme_main")
    ]),
    scene("ch4_turn",4,"계절풍의 문","task:zanzibar-crossing","sea",[
      step("잔지바르 노항해사","빠른 선장이 먼저 떠나는 것은 아닙니다. 떠날 날을 아는 선장이 먼저 도착하지요.","theme_africa"),
      step("오르소 벤","바람이 동쪽으로 돌아섰습니다. 지금 출항하면 인도양이 문처럼 열릴 겁니다.","theme_asia")
    ]),
    scene("ch4_end",4,"두 번째 일몰","task:sakai-record","cs8_sakai_observatory",[
      step("사카이 천문관","두 번째 일몰은 섬의 위치가 아닙니다. 지구를 한 바퀴 도는 계절풍 회랑의 개방 시각입니다.","theme_asia"),
      step("에네오","벨로르는 19년 주기를 알고 있습니다. 다음 개방까지 남은 시간은 겨우 넉 달입니다.","theme_asia")
    ]),

    scene("ch5_intro",5,"녹은 밀랍","task:western-letter","interior_guild",[
      step("미라 소렐","그들은 항로를 독점하려는 것만이 아닙니다. 버려진 배와 선원들의 숫자를 숨기려 합니다. 명부를 가지고 카르타헤나로 갑니다.","theme_west_europe"),
      step("리안 팔코","우리가 늦으면 미라도 기록 속에서 사라집니다. 서쪽으로 갑시다.","theme_main")
    ]),
    scene("ch5_turn",5,"닫힌 술집","task:tavern-rescue","cs8_cartagena_cellar",[
      step("미라 소렐","이 명부에는 세 척이 아니라 열일곱 척이 있습니다. 벨로르는 시험 항해마다 실패한 배를 해적으로 기록했습니다.","theme_main"),
      step("바르도 카인","그중 하나가 내 아버지의 배다. 팔코의 장부가 아니라 벨로르의 요새를 먼저 찾겠다.","theme_main")
    ]),
    scene("ch5_end",5,"패자의 깃발","task:rival-captain","sea",[
      step("바르도 카인","날 포로로 넘겨도 좋다. 하지만 이 반쪽 해도는 가져가라. 우리 가족이 마지막으로 보낸 구조 항로다.","theme_battle"),
      step("리안 팔코","당신이 함께 간다면 복수의 증인이 아니라 구조선의 선장으로 오십시오.","theme_main")
    ],{onComplete:"show-story-choice"}),

    scene("ch6_intro",6,"검은 부표","task:amazon-mouth","sea",[
      step("미라 소렐","세 번째 부표에서 동쪽으로 돌면 요새의 포대가 기다립니다. 조류가 사라지는 남쪽 틈이 진짜 수로예요.","theme_main"),
      step("오르소 벤","해도편이 맞았습니다. 물살이 멎는 선이 바다 위에 보입니다.","theme_main")
    ],{onComplete:"queue:ch6_turn"}),
    scene("ch6_turn",6,"버려진 구조 요청","event:meridian-archive","cs8_meridian_archive",[
      step("리안 팔코","열일곱 척의 구조 요청, 데미안의 승인, 벨로르의 폐기 명령. 둘 다 이 죽음에서 자유롭지 않아.","theme_main"),
      step("마티아스 벨로르","무질서한 항해자에게 이 길을 열면 더 많은 배가 죽는다. 누군가는 바다의 문을 지켜야 한다.","theme_main")
    ]),
    scene("ch6_end",6,"자오선 결전","task:citadel-battle","cs8_final_fleet",[
      step("마티아스 벨로르","항로를 공개하면 해적도, 전쟁선도 함께 들어온다. 네가 감당할 수 있는 자유인가?","theme_battle"),
      step("리안 팔코","감당할 책임까지 숨기는 독점보다는 낫습니다. 오늘은 어느 배도 기록에서 지우지 않겠습니다.","theme_battle")
    ]),

    scene("ch7_intro",7,"공개 증언","task:return-lisbon","cutscene_falco_legacy",[
      step("데미안 팔코","나는 항로를 숨겨 수천 명을 지킬 수 있다고 믿었다. 그래서 눈앞의 사람들을 숫자로 만들었다.","theme_main"),
      step("리안 팔코","아버지의 공로도 죄도 함께 기록하겠습니다. 어느 한쪽을 지우면 같은 일이 반복됩니다.","theme_main")
    ],{onComplete:"queue:ch7_turn"}),
    scene("ch7_turn",7,"항로의 주인","event:ending-choice","interior_mansion",[
      step("아에론","왕실은 법과 순찰을 약속합니다.","theme_main"),step("미라 소렐","도시동맹은 여러 금고에 사본을 나누겠다고 합니다.","theme_main"),step("오르소 벤","그리고 누구의 허락도 받지 않고 모든 항해자에게 공개하는 길도 있습니다.","theme_main")
    ],{onComplete:"show-story-choice"}),
    scene("ch7_end",7,"세 개의 수평선","ending:any","town_bella",[
      step("기록관","리안의 선택은 바다를 완벽하게 만들지 않았다. 다만 더는 누구도 조난자의 이름을 장부에서 지울 수 없게 했다.","theme_main"),
      step("리안 팔코","수평선은 소유할 수 없다. 우리가 할 수 있는 일은 다음 배가 돌아올 길을 남기는 것뿐이다.","theme_main")
    ])
  ];
  HL.DATA.cutsceneById=Object.fromEntries(HL.DATA.storyCutscenes.map(item=>[item.id,item]));

  HL.RegionMusicRouter=class{
    cultureKey(culture){return HL.DATA.musicCulture[culture]||"theme_main"}
    seaKey(lon,lat){if(lat>=54&&lon>=-18&&lon<=35)return"theme_north_europe";if(lon>=105&&lon<=136&&lat>=18&&lat<=46)return"theme_china";if(lon>=52&&lon<=155&&lat>=-12&&lat<=50)return"theme_asia";if(lon>=-20&&lon<=52&&lat<34&&lat>=-38)return"theme_africa";if(lon>=-25&&lon<=45&&lat>=30)return"theme_west_europe";return"theme_main"}
    key(game){if(!game)return"theme_main";if(["battle","duel","tavernEvent"].includes(game.mode))return"theme_battle";if(game.mode==="cutscene")return game.cutsceneDirector?.currentStep(game)?.musicKey||"theme_main";if(["file","scenario"].includes(game.mode)||!game.s)return"theme_main";if(game.mode==="sea")return this.seaKey(game.s.sea.lon,game.s.sea.lat);return this.cultureKey(HL.DATA.ports[game.s.currentPort]?.culture)}
  };

  HL.MusicDirector=class{
    constructor(engine){this.engine=engine;this.tracks={};this.currentKey=null;this.current=null;this.pending=null;this.volume=+(localStorage.getItem("hl2-volume")||.42);this.fadeTimer=0;for(const[key,data]of Object.entries(HL.DATA.musicTracks))this.tracks[key]=this.makeTrack(key,data)}
    makeTrack(key,data){const audio=new Audio();audio.loop=true;audio.preload="auto";audio.volume=0;audio.dataset&&(audio.dataset.track=key);let triedMp3=false;audio.addEventListener?.("error",()=>{if(!triedMp3){triedMp3=true;audio.src=`${audioRoot}${data.file}.mp3`;audio.load?.()}else audio._missing=true});audio.src=`${audioRoot}${data.file}.wav`;return{audio,data}}
    play(key){if(!HL.DATA.musicTracks[key])key="theme_main";if(this.currentKey===key){this.current?.audio.play().catch(()=>{this.pending=key});return}const next=this.tracks[key];if(!next||next.audio._missing){this.silence();this.currentKey=key;return}const previous=this.current;this.current=next;this.currentKey=key;this.pending=null;next.audio.volume=0;next.audio.play().then(()=>this.crossfade(previous,next)).catch(()=>{this.pending=key})}
    crossfade(previous,next){clearInterval(this.fadeTimer);let frame=0;const target=this.volume*(next.data.gain||1);this.fadeTimer=setInterval(()=>{frame++;const p=Math.min(1,frame/16);next.audio.volume=target*p;if(previous)previous.audio.volume=this.volume*(previous.data.gain||1)*(1-p);if(p>=1){clearInterval(this.fadeTimer);if(previous&&previous!==next){previous.audio.pause();previous.audio.currentTime=0}}},50)}
    unlock(){if(this.pending){const key=this.pending;this.pending=null;this.play(key)}}
    silence(){clearInterval(this.fadeTimer);for(const track of Object.values(this.tracks)){track.audio.pause();track.audio.volume=0}this.current=null}
    setVolume(value){this.volume=value;localStorage.setItem("hl2-volume",value);if(this.current)this.current.audio.volume=value*(this.current.data.gain||1)}
  };

  HL.CutsceneDirector=class{
    ensure(state){state.cutsceneState={seen:[],pending:[],relationships:{orso:0,mira:0,bardo:0,aeron:0,damian:0},evidence:[],...(state.cutsceneState||{})};state.cutsceneState.seen=Array.from(new Set(state.cutsceneState.seen||[]));state.cutsceneState.pending=state.cutsceneState.pending||[];return state.cutsceneState}
    data(id){return HL.DATA.cutsceneById[id]}
    current(game){return this.data(game.cutscene?.id)}
    currentStep(game){return this.current(game)?.steps[game.cutscene?.index||0]}
    enqueue(state,id,reason="event"){const cs=this.ensure(state);if(!this.data(id)||cs.seen.includes(id)||cs.pending.some(item=>item.id===id))return false;cs.pending.push({id,reason});return true}
    safe(game,item){if(game.e.overlay.innerHTML||game.transition)return false;if(["town","interior"].includes(game.mode))return true;if(game.mode==="sea")return game.s.sea.anchor||item.reason==="battle-end"||item.reason==="dock";return false}
    pump(game){if(!game.s||game.mode==="cutscene")return;const cs=this.ensure(game.s),item=cs.pending[0];if(item&&this.safe(game,item)){cs.pending.shift();this.start(game,item.id,false)}}
    start(game,id,replay=false){const data=this.data(id);if(!data)return false;game.modeBeforeCutscene=game.mode;game.mode="cutscene";game.cutscene={id,index:0,elapsed:0,reveal:false,replay,returnMode:game.modeBeforeCutscene||"town"};game.e.close();game.e.hud.innerHTML="";game.e.playMusic(data.steps[0]?.musicKey||"theme_main");if(data.steps[0]?.sfx)game.e.sfx(data.steps[0].sfx,.4);return true}
    advance(game){const data=this.current(game);if(!data)return this.finish(game);if(game.cutscene.index<data.steps.length-1){game.cutscene.index++;game.cutscene.elapsed=0;game.cutscene.reveal=false;const current=this.currentStep(game);game.e.playMusic(current.musicKey||"theme_main");if(current.sfx)game.e.sfx(current.sfx,.4);return}this.finish(game)}
    finish(game,skipped=false){const data=this.current(game),replay=game.cutscene?.replay,returnMode=game.cutscene?.returnMode||"town";game.cutscene=null;if(!replay&&data){const cs=this.ensure(game.s);if(!cs.seen.includes(data.id))cs.seen.push(data.id);this.applyCompletion(game,data,skipped)}game.mode=returnMode==="cutscene"?"town":returnMode;game.e.close();game.syncRegionMusic();if(!replay)game.save();if(!replay&&data?.onComplete?.startsWith("queue:")){this.start(game,data.onComplete.split(":")[1],false)}else if(!replay&&data?.onComplete==="finish-prologue")game.finishV8Prologue();else if(!replay&&data?.onComplete==="show-story-choice"){game.s.pendingStoryChoice=null;game.s.deferredStoryChoice=null;game.nextStoryChoice()}}
    applyCompletion(game,data){if(data.id==="ch2_turn"){game.s.cutsceneState.relationships.aeron++;game.s.cutsceneState.evidence.push("blue-seal-testimony")}if(data.id==="ch3_end")game.s.cutsceneState.relationships.orso++;if(data.id==="ch5_turn"){game.s.cutsceneState.relationships.mira++;game.s.cutsceneState.evidence.push("lost-ships-register")}if(data.id==="ch5_end")game.s.cutsceneState.relationships.bardo++;if(data.id==="ch6_turn")game.s.cutsceneState.evidence.push("damian-signed-orders")}
  };

  HL.migrateStateV8=function(prior){const state=copy(prior||HL.Game.freshState());state.version=8;const director=new HL.CutsceneDirector();director.ensure(state);state.cutsceneState.evidence=state.cutsceneState.evidence||[];const completed=new Set(state.campaign?.completed||[]),mapping={"claim-ship":"ch0_end","hear-royal-rumor":"ch2_intro","rescue-aeron":"ch2_turn","report-rescue":"ch2_end","receive-staff-order":"ch3_intro","massawa-search":"ch3_turn","massawa-defense":"ch3_end","scholar-request":"ch4_intro","zanzibar-crossing":"ch4_turn","sakai-record":"ch4_end","western-letter":"ch5_intro","tavern-rescue":"ch5_turn","rival-captain":"ch5_end","amazon-mouth":"ch6_intro","citadel-battle":"ch6_end","return-lisbon":"ch7_intro"};for(const[task,id]of Object.entries(mapping))if(completed.has(task))state.cutsceneState.seen.push(id);if(state.flags?.cutsceneSeen)state.cutsceneState.seen.push("ch0_intro","ch0_turn");if(state.endingState){state.cutsceneState.seen.push("ch7_turn","ch7_end");state.flags.campaignComplete=true}state.cutsceneState.seen=Array.from(new Set(state.cutsceneState.seen));return state};

  const engine=HL.Engine.prototype,oldDelete=engine.deleteSlot,oldPlay=engine.playMusic;
  engine.v7SlotKey=function(i){return`horizon-ledger-v7-slot-${i}`};engine.slotKey=function(i){return`horizon-ledger-v8-slot-${i}`};
  engine.loadSlot=function(i){try{const value=JSON.parse(localStorage.getItem(this.slotKey(i)));return value&&value.version===8?value:null}catch{return null}};
  engine.migrateOld=function(i){if(this.loadSlot(i))return;try{const keys=[this.v7SlotKey(i),`horizon-ledger-v6-slot-${i}`,`horizon-ledger-v5-slot-${i}`,this.v4SlotKey(i),this.v3SlotKey(i),this.oldSlotKey(i)],prior=keys.map(key=>JSON.parse(localStorage.getItem(key)||"null")).find(Boolean);if(prior)this.saveSlot(i,HL.migrateStateV8(prior))}catch(error){console.warn("v8 save migration failed",error)}};
  engine.deleteSlot=function(i){oldDelete.call(this,i);localStorage.removeItem(this.slotKey(i))};
  engine.enableV8Music=function(){if(this.musicDirector)return;for(const audio of Object.values(this.music||{}))audio.pause?.();this.musicDirector=new HL.MusicDirector(this);this.music={};const unlock=()=>this.musicDirector.unlock();if(typeof addEventListener==="function"){addEventListener("pointerdown",unlock,{passive:true});addEventListener("keydown",unlock,{passive:true})}};
  engine.playMusic=function(key){if(!this.musicDirector)return oldPlay.call(this,key);const aliases={sea:this.musicContextProvider?.()||"theme_main",port:this.musicContextProvider?.()||"theme_west_europe",danger:"theme_battle"};this.musicDirector.play(aliases[key]||key)};
  engine.setVolume=function(value){if(this.musicDirector)return this.musicDirector.setVolume(value);localStorage.setItem("hl2-volume",value)};

  const proto=HL.Game.prototype,oldFresh=HL.Game.freshState,oldEnsure=proto.ensureExpansion,oldShowFiles=proto.showFiles,oldUpdate=proto.update,oldRender=proto.render,oldProgress=proto.progressCampaign,oldDispatch=proto.dispatchAction,oldDock=proto.completeDock,oldWin=proto.winBattle,oldEndingChoices=proto.endingChoices,oldApplyEnding=proto.applyEnding;
  HL.Game.freshState=function(){const state=oldFresh.call(this);state.version=8;new HL.CutsceneDirector().ensure(state);return state};
  proto.ensureExpansion=function(){oldEnsure.call(this);if(!this.musicRouter)this.musicRouter=new HL.RegionMusicRouter();if(!this.cutsceneDirector)this.cutsceneDirector=new HL.CutsceneDirector();if(this.s){this.s.version=8;this.cutsceneDirector.ensure(this.s)}};
  proto.showFiles=function(){this.e.enableV8Music();this.musicRouter=this.musicRouter||new HL.RegionMusicRouter();this.e.musicContextProvider=()=>this.musicRouter.key(this);return oldShowFiles.call(this)};
  proto.syncRegionMusic=function(){this.ensureExpansion();this.e.playMusic(this.musicRouter.key(this))};
  proto.update=function(dt){const result=oldUpdate.call(this,dt);if(this.s){this.ensureExpansion();if(this.e.pressed.size)this.e.musicDirector?.unlock();this.musicSyncClock=(this.musicSyncClock||0)+dt;if(this.musicSyncClock>.6){this.musicSyncClock=0;this.syncRegionMusic()}this.cutsceneDirector.pump(this)}return result};
  proto.render=function(){if(this.mode==="cutscene"){this.help("");this.art.cutscene(this);this.renderHud();return}return oldRender.call(this)};
  proto.startCutscene=function(replay=false){this.ensureExpansion();return this.cutsceneDirector.start(this,"ch0_intro",replay)};
  proto.updateCutscene=function(dt){if(this.e.overlay.innerHTML)return;const current=this.cutsceneDirector.currentStep(this);if(!current)return this.cutsceneDirector.finish(this);this.cutscene.elapsed+=dt;if(this.e.hit("Enter","z","Z"," ")){if(!this.cutscene.reveal&&this.cutscene.elapsed*28<current.text.length){this.cutscene.reveal=true;return}return this.cutsceneDirector.advance(this)}if(this.e.hit("Escape","x","X")){this.e.window(`<h2>이 사건을 건너뛸까요?</h2><p>임무와 선택 결과는 정상적으로 적용됩니다.</p><div class="confirm">${this.e.button("계속 보기","cutscene-continue")}${this.e.button("건너뛰기","cutscene-skip","primary")}</div>`,`center`);return}if(this.cutscene.elapsed>=(current.duration||11))this.cutsceneDirector.advance(this)};
  proto.advanceCutscene=function(){return this.cutsceneDirector.advance(this)};proto.finishCutscene=function(){return this.cutsceneDirector.finish(this)};
  proto.finishV8Prologue=function(){this.mode="town";this.s.flags.metFather=true;this.s.flags.cutsceneSeen=true;this.s.flags.shipGranted=false;this.s.fleet[0].locked=true;this.s.quest.stage=0;this.s.quest.objective="리스본 조선소에서 새벽까마귀와 오르소 벤을 만나라.";this.s.town={x:19.5,y:8.4,dir:4};this.lastSafe={x:19.5,y:8.4};this.spawnTownNpcs();this.syncRegionMusic();this.save();this.e.toast("조선소에서 첫 배를 인수하십시오")};
  proto.progressCampaign=function(event){const before=this.campaignSystem.currentTask(this.s),result=oldProgress.call(this,event);if(result&&before){const id=HL.DATA.storyCutscenes.find(cs=>cs.trigger===`task:${before.id}`)?.id,next=this.campaignSystem.currentTask(this.s);if(id)this.cutsceneDirector.enqueue(this.s,id,event.type==="battle"?"battle-end":"event");if(id&&next?.trigger?.type==="choice"){this.s.pendingStoryChoice=null;this.s.deferredStoryChoice=next.trigger.id}}return result};
  proto.completeDock=function(id){const beforeStage=this.s.quest?.stage,result=oldDock.call(this,id);if(id==="lume"&&beforeStage===1)this.cutsceneDirector.enqueue(this.s,"ch1_intro","dock");return result};
  proto.winBattle=function(result){const legacy=this.s.quest?.stage===5,value=oldWin.call(this,result);if(legacy)this.cutsceneDirector.enqueue(this.s,"ch1_end","battle-end");return value};
  proto.endingChoices=function(){return[{label:"왕실에 맡긴다",action:"story-choice:ending:crown"},{label:"도시동맹이 관리한다",action:"story-choice:ending:league"},{label:"모든 항해자에게 공개한다",action:"story-choice:ending:free"}]};
  proto.applyEnding=function(path){oldApplyEnding.call(this,path);const complete=this.fragmentSystem.interpreted(this.s).length===12;this.s.endingState.variant=complete?"complete-truth":"surviving-record";this.s.endingState.epilogue={crown:complete?"왕실은 독립 조사원을 두고 데미안의 재판 기록까지 공개했다.":"왕실 순찰로 항로는 안전해졌지만 일부 기록은 봉인됐다.",league:complete?"열두 항구의 금고에 사본이 나뉘어 어느 도시도 항로를 독점하지 못했다.":"교역은 번성했지만 가난한 항구에는 해도 사용료가 남았다.",free:complete?"구조 신호와 샘의 위치까지 공개되어 항해자들이 자발적인 구조망을 만들었다.":"항로는 자유로워졌지만 해적도 새 길을 배워 위험이 함께 늘었다."}[path]};
  proto.openCutsceneGallery=function(){const seen=new Set(this.s.cutsceneState.seen),rows=HL.DATA.storyCutscenes.filter(cs=>seen.has(cs.id)).map(cs=>`<div class="row"><span><strong>${cs.title}</strong><small>제${cs.chapter}장 · ${cs.steps.length}개 장면</small></span>${this.e.button("다시 보기",`replay-cutscene:${cs.id}`)}</div>`).join("")||"<p>아직 회상할 사건이 없습니다.</p>";this.e.window(`<h1>사건 회상</h1><div class="rows">${rows}</div><div class="toolbar right">${this.e.button("항해 일지","journal","primary")}</div>`,`center wide cutscene-gallery`)};
  proto.dispatchAction=function(action,button){if(!this.s)return oldDispatch.call(this,action,button);this.ensureExpansion();if(action==="cutscene-skip"){this.e.close();return this.cutsceneDirector.finish(this,true)}if(action==="cutscene-continue"){this.e.close();return}if(action==="cutscene-gallery")return this.openCutsceneGallery();if(action.startsWith("replay-cutscene:")){this.e.close();return this.cutsceneDirector.start(this,action.split(":")[1],true)}if(action==="get-clue")this.cutsceneDirector.enqueue(this.s,"ch1_turn","event");const result=oldDispatch.call(this,action,button);if(action==="accept-ship"||action==="story-accept")this.cutsceneDirector.enqueue(this.s,"ch0_end","event");if(action.startsWith("story-choice:ending:"))this.cutsceneDirector.enqueue(this.s,"ch7_end","event");return result};
  proto.settings=function(){const back=this.s?"close":"files",volume=this.e.musicDirector?.volume??+(localStorage.getItem("hl2-volume")||.42);this.e.window(`<h1>소리 설정</h1><label>음악 음량<input id="volume" type="range" min="0" max="1" step=".05" value="${volume}"></label><p class="music-status">지정한 지역 음악 파일이 없는 슬롯은 무음으로 재생됩니다.</p><div class="toolbar right">${this.e.button("확인",back)}</div>`,`center`);document.querySelector("#volume")?.addEventListener("input",event=>this.e.setVolume(+event.target.value))};

  const oldJournal=proto.openJournal;
  proto.openJournal=function(){oldJournal.call(this);const toolbar=this.e.overlay.querySelector?.(".toolbar.right");if(toolbar)toolbar.insertAdjacentHTML("afterbegin",this.e.button("사건 회상","cutscene-gallery"))};

  const oldArtCutscene=HL.Art.prototype.cutscene;
  HL.Art.prototype.cutscene=function(game){const data=game.cutsceneDirector?.current(game),current=game.cutsceneDirector?.currentStep(game);if(!data||!current)return oldArtCutscene.call(this,game);const e=game.e,c=e.ctx,image=this.assets?.get(current.background||data.background)||(data.background==="sea"?this.images.sea:null),elapsed=game.cutscene.elapsed||0,zoom=current.camera?.zoom||1,pan=current.camera?.pan||[0,0];e.clear("#061219");if(image){const sw=image.naturalWidth/zoom,sh=image.naturalHeight/zoom,sx=(image.naturalWidth-sw)/2+pan[0]*elapsed,sy=(image.naturalHeight-sh)/2+pan[1]*elapsed;c.drawImage(image,sx,sy,sw,sh,0,0,960,540)}else this.title(e);const shade=c.createLinearGradient(0,180,0,540);shade.addColorStop(0,"rgba(2,10,14,0)");shade.addColorStop(.58,"rgba(2,10,14,.42)");shade.addColorStop(1,"rgba(2,10,14,.94)");c.fillStyle=shade;c.fillRect(0,140,960,400);e.text(`제${data.chapter}장 · ${data.title}`,28,52,"#f0cc75","left",15);c.fillStyle="rgba(3,17,23,.95)";c.fillRect(52,376,856,132);c.strokeStyle="#ba914b";c.lineWidth=2;c.strokeRect(53,377,854,130);e.text(current.speaker,78,412,"#edbc5f","left",19);const visible=game.cutscene.reveal?current.text:current.text.slice(0,Math.floor(elapsed*28));this.wrapText(e,visible,78,447,765,25,"#f5e5bb",17);e.text(`${game.cutscene.index+1} / ${data.steps.length}`,884,411,"#a9bbb0","right",12);e.text("Enter/Z 계속 · Esc/X 건너뛰기",884,526,"#cbbd90","right",11)};
})();
