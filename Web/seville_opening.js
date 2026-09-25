window.HL=window.HL||{};
(function(){
  "use strict";
  // Load after v21_systems.js and seville_quality.js; installation is repeatable.
  if(HL.SevilleOpening?.installed)return;
  const D=HL.DATA,game=HL.Game.prototype,cs=HL.CampaignSystem.prototype;
  const order=["work","news","consult","prepare"];
  const scenes={
    caller:{title:"평범했던 아침",speaker:"마엘",text:"세리아, 일어나요. 아래층에 빵을 남겨 뒀어요. 오늘은 공방에서 조수표 사본을 부두에 보내는 날이잖아요.\n\n어제 적어 온 수위 쪽지는 작업대에 놓았어요. 오르델 선생님이 오시면 함께 볼 수 있게, 먼저 숫자를 맞춰 둘까요?",objective:"숙소 2층 세리아의 방에서 마엘에게 오늘 맡은 일을 물어라."},
    work:{title:"지도 공방의 아침",speaker:"세리아",text:"작업대에 어제의 부두 관측 쪽지와 조수표 사본을 나란히 펼쳤다. 만조 시각은 맞는데, 사본의 수위가 줄마다 한 뼘씩 높았다.\n\n세리아는 부두 말뚝의 기준 표시를 대조했다. 옛 눈금에서 잰 높이를 새 눈금의 높이처럼 옮겨 적은 것이다. 원래 수치를 지우지 않고 보정값과 기준점을 옆에 적었다.\n\n'숫자를 고쳤으면, 왜 고쳤는지도 남겨라.' 오르델의 말이 떠올랐다. 사본을 묶으려는데 마엘이 문을 밀고 들어왔다. 손에는 접힌 종이 한 장이 있었다.",objective:"세비야 지도 공방(길드) 1층의 조수표 작업대에서 관측 쪽지와 사본을 대조하라."},
    news:{title:"압수 목록의 행선지",speaker:"마엘",text:"선생님이 오늘 못 오신대요. 왕실 서기관이 오르델 선생님을 조사실로 데려갔어요. 해도에 없는 해안을 그렸다는 이유라는데, 저도 직접 들은 건 여기까지예요.\n\n접수원이 보관할 압수 목록을 한 장 더 베껴 줬어요. '측량 기록 여섯 권'. 첫 권 옆에는 '카디스 항만 제3창고, 이송 17호'라고 적혀 있어요. 아래에는 인수 서명과 붉은 봉인 자국도 있어요.\n\n세리아는 종이를 빛 쪽으로 돌렸다. 첫 권의 제목은 스승과 함께 읽었던 조수 관측 기록이었다. 어느 배에 실었는지는 빈칸이었다.",objective:"공방 1층의 압수 목록에서 마엘이 가져온 소식과 기록의 이송처를 확인하라."},
    consult:{title:"직접 확인할 이유",speaker:"마엘과 세리아",text:"마엘이 물었다. '이 목록만으로 선생님이 옳았다고 할 수 있을까요?'\n\n'아니. 오늘 고친 조수표처럼, 선생님 기록에도 틀린 곳이 있을 수 있어. 그래서 원본과 실제 바다를 함께 봐야 해.' 세리아는 목록의 이송 번호를 손으로 짚었다. '카디스 항만에서 인수 장부를 찾자. 첫 권이 남아 있다면 그곳 조수 높이와 대조할 수 있어.'\n\n마엘은 고개를 끄덕였다. '공방에 남길 사본은 제가 만들게요. 원본을 못 돌려받더라도 무엇을 확인했는지는 남겨요.' 세리아는 아직 마르지 않은 보정값 옆에 자신의 이름을 적었다.",objective:"공방 1층에서 마엘과 상의해 카디스의 인수 장부와 조수 기록을 확인할 계획을 세워라."},
    prepare:{title:"첫 항해의 준비",speaker:"세리아",text:"세리아는 출항 준비 장부에 카디스와 이송 17호를 적었다. 압수 목록 사본은 기름 먹인 천으로 감싸고, 육분의의 눈금과 관측 쪽지를 확인했다.\n\n마엘이 공방에 남길 사본을 받아 들었다. '돌아오면 같은 책상에서 맞춰 봐요.'\n\n세리아는 선원 명부와 보급표를 챙겼다. 항만에서 실제 승선 인원과 식량, 물을 대조한 뒤 떠날 차례다. 첫 목적은 카디스 항만의 인수 장부를 묻고 조수 높이를 측량하는 것이다.",objective:"공방 1층의 출항 준비 장부에서 목록 사본, 육분의, 선원 명부와 보급표를 점검하라."}
  };
  const departure="세비야 항만에서 선원·식량·물을 확인한 뒤 카디스로 출항하라. 카디스 항만에서 이송 17호의 인수 장부를 묻고 조수 높이를 측량하라.";
  const old={};
  for(const name of ["beginWakeOpeningV21","handleWakeV21","handleOpeningV21","handleOpeningV19","ensureExpansion","save","setSail","progressCampaign","dispatchAction","executeV10InteriorAction"])old[name]=game[name];
  const oldSync=cs.syncQuest,oldCurrent=cs.currentTask,oldEvaluate=cs.evaluate,oldEvaluateV18=cs.evaluateV18;
  const isInes=s=>s?.captainId==="ines"&&s.campaignId==="ines-atlas"&&!s.legacyCampaign;
  const owns=s=>isInes(s)&&!!s.openingWakeV21&&(!s.openingWakeV21.captainId||s.openingWakeV21.captainId==="ines");
  const progressed=s=>!!(s.flags?.campaignComplete||s.careerProgress?.waiting||
    (s.campaign?.chapterId&&s.campaign.chapterId!=="i1")||s.campaign?.taskIndex>0||s.campaign?.completed?.length);
  const active=s=>owns(s)&&s.openingWakeV21.completed===false&&!progressed(s);
  function steps(s){
    const w=s.openingWakeV21;
    if(Array.isArray(w.completedSteps))return order.filter(step=>w.completedSteps.includes(step));
    // Stage 1 can mean only the caller; the work checkpoint disambiguates old saves.
    const count=w.stage>=3?3:w.stage>=2?2:w.checkpoints?.some(c=>c.id==="daily-work")?1:0;
    return order.slice(0,count);
  }
  function next(s){return !s.openingWakeV21.heardCall?"caller":order.find(step=>!steps(s).includes(step))||"prepare";}
  function openingTask(s){
    if(!active(s))return null;
    const key=next(s),scene=scenes[key];
    return{id:key==="caller"?"v21-wake:caller":`v21-opening:${key}`,title:scene.title,description:scene.objective,port:"seville",facility:key==="caller"?"lodge":"guild",rewardFame:0};
  }
  function sync(s,mode=s?.mode){
    const task=openingTask(s);
    if(task){s.quest=s.quest||{};s.quest.title=task.title;s.quest.objective=task.description;return true;}
    if(owns(s)&&s.openingWakeV21.sevillePrepared&&s.campaign?.chapterId==="i1"&&s.campaign.taskIndex===1&&!s.careerProgress?.waiting&&!s.flags?.campaignComplete){
      s.quest=s.quest||{};
      s.quest.objective=s.currentPort==="cadiz"?"카디스 항만에서 이송 17호의 인수 장부를 묻고 조수 높이를 측량하라.":mode==="sea"?"카디스로 항해하라. 카디스 항만에서 이송 17호의 인수 장부를 묻고 조수 높이를 측량하라.":departure;
      return true;
    }
    return false;
  }
  function finishLegacyOpening(s){
    if(!s.openingV19)return;
    if(!s.openingV19.completed){s.openingV19.completed=true;s.openingV19.step=Math.max(3,s.openingV19.step||0);}
  }
  function reconcile(s,mode=s?.mode){
    if(!owns(s))return;
    if(s.openingWakeV21.completed||progressed(s))finishLegacyOpening(s);
    sync(s,mode);
  }
  function inRoom(g,building,floor){
    const p=g.s.interior;
    return g.mode==="interior"&&g.s.currentPort==="seville"&&(p?.buildingId||p?.id)===building&&p.floorId===floor;
  }
  function remind(g){return g.e.toast(openingTask(g.s)?.description||g.s.quest?.objective||"이미 마친 일입니다. 항해 일지의 다음 목적을 확인하라.");}
  function checkpoint(s,id){
    const w=s.openingWakeV21;
    w.checkpoints=Array.isArray(w.checkpoints)?w.checkpoints:[];
    if(!w.checkpoints.some(c=>c.id===id))w.checkpoints.push({id,at:Date.now(),port:s.currentPort,floor:s.interior?.floorId});
    w.checkpoints=w.checkpoints.slice(-8);
  }
  function show(g,key){const scene=scenes[key];return g.e.dialogue(scene.speaker,scene.text,[{label:key==="prepare"?"항만으로 갈 준비를 한다":"계속",action:"close",primary:true}]);}

  D.openingWakeDefinitionsV21.calls.ines={...D.openingWakeDefinitionsV21.calls.ines,caller:"마엘",wake:"세리아, 일어나요. 오늘 보낼 조수표를 함께 확인해요.",task:scenes.work.objective};
  game.beginWakeOpeningV21=function(id){const result=old.beginWakeOpeningV21.apply(this,arguments);if(id==="ines"){sync(this.s);this.save();}return result;};
  game.handleWakeV21=function(action){
    if(!isInes(this.s))return old.handleWakeV21.apply(this,arguments);
    if(action!=="bed"&&action!=="caller")return;
    if(!active(this.s))return remind(this);
    if(!inRoom(this,"lodge","2f"))return remind(this);
    if(action==="bed")return this.e.dialogue("세리아","창틀에 아침빛이 걸렸다. 책상에는 어젯밤 접어 둔 연습 해도, 문밖에는 익숙한 마엘의 발소리가 있다.",[{label:"일어난다",action:"close",primary:true}]);
    const w=this.s.openingWakeV21;
    if(w.heardCall)return remind(this);
    w.heardCall=true;w.stage=Math.max(w.stage||0,1);checkpoint(this.s,"first-call");sync(this.s);this.save();return show(this,"caller");
  };
  game.handleOpeningV21=function(step){
    if(!isInes(this.s))return old.handleOpeningV21.apply(this,arguments);
    if(!order.includes(step))return;
    if(!active(this.s))return remind(this);
    const s=this.s,w=s.openingWakeV21,done=steps(s);
    if(!w.heardCall||!inRoom(this,"guild","1f")||done.includes(step)||order.slice(0,order.indexOf(step)).some(previous=>!done.includes(previous)))return remind(this);
    w.completedSteps=order.filter(item=>done.includes(item)||item===step);
    w.stage=Math.max(w.stage||0,order.indexOf(step)+1);
    checkpoint(s,{work:"daily-work",news:"concrete-news",consult:"consultation",prepare:"departure-ready"}[step]);
    if(step==="prepare"){
      w.completed=true;w.sevillePrepared=true;finishLegacyOpening(s);
      s.prologueV16={...(s.prologueV16||{}),completed:true};
      s.flags=s.flags||{};s.flags.cutsceneSeen=true;s.flags.shipGranted=true;
      if(s.fleet?.[0])s.fleet[0].locked=false;
      // Use the existing task reward once, without replaying its older cutscene.
      if(s.campaign?.chapterId==="i1"&&s.campaign.taskIndex===0&&!s.campaign.completed?.includes("i1-1"))this.campaignSystem.evaluateV18(s,{type:"facility",id:"guild",port:"seville"});
    }
    sync(s);this.save();return show(this,step);
  };
  game.handleOpeningV19=function(part){
    if(!isInes(this.s)||!this.s.openingWakeV21)return old.handleOpeningV19.apply(this,arguments);
    // Old hotspots remain valid, but cannot skip consultation or preparation.
    const mapped={work:"work",witness:"news",confirm:"consult"}[part];
    if(mapped)return this.handleOpeningV21(mapped);
  };
  cs.syncQuest=function(s){const result=oldSync.apply(this,arguments);sync(s);return result;};
  cs.currentTask=function(s){return openingTask(s)||oldCurrent.apply(this,arguments);};
  cs.evaluate=function(s){if(active(s))return false;return oldEvaluate.apply(this,arguments);};
  cs.evaluateV18=function(s){if(active(s))return false;return oldEvaluateV18.apply(this,arguments);};
  game.ensureExpansion=function(){const result=old.ensureExpansion.apply(this,arguments);reconcile(this.s,this.mode);return result;};
  game.save=function(){reconcile(this.s,this.mode);return old.save.apply(this,arguments);};
  game.setSail=function(){if(active(this.s))return remind(this);return old.setSail.apply(this,arguments);};
  game.progressCampaign=function(){if(active(this.s))return false;reconcile(this.s);return old.progressCampaign.apply(this,arguments);};
  const routes=Object.assign(Object.create(null),{"v21-wake:bed":["handleWakeV21","bed"],"v21-wake:caller":["handleWakeV21","caller"]});
  for(const step of order)routes[`v21-opening:${step}`]=["handleOpeningV21",step];
  for(const part of ["work","witness","confirm"])routes[`v19-opening:${part}`]=["handleOpeningV19",part];
  for(const name of ["dispatchAction","executeV10InteriorAction"]){
    game[name]=function(action){const route=isInes(this.s)&&routes[action];if(route)return this[route[0]](route[1]);return old[name].apply(this,arguments);};
  }
  HL.SevilleOpening={installed:true,actions:Object.keys(routes),wrappers:{...Object.fromEntries(Object.keys(old).map(name=>[name,game[name]])),syncQuest:cs.syncQuest,currentTask:cs.currentTask,evaluate:cs.evaluate,evaluateV18:cs.evaluateV18}};
})();
