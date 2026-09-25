const fs=require("fs");
const vm=require("vm");
const path=require("path");

global.window=global;
global.HL={};
global.Image=class{set src(value){this._src=value}};
global.Audio=class{play(){return Promise.resolve()}pause(){}};
global.localStorage={values:new Map(),getItem(key){return this.values.get(key)||null},setItem(key,value){this.values.set(key,value)},removeItem(key){this.values.delete(key)}};
const root=path.resolve(__dirname,"..");
for(const file of["data.js","world_data.js","v5_data.js","collision.js","systems.js","v5_systems.js","sea_navigation_v6.js","engine.js","art.js","game.js","expansion.js","v5_art.js","legacy_animation.js","v5_expansion.js","dos_sea_v6.js"])vm.runInThisContext(fs.readFileSync(path.join(root,file),"utf8"),{filename:file});

const failures=[];
const simulation=new HL.SeaSimulation(),navigation=new HL.WorldNavigation(),grid=new HL.SeaNavigationGrid(navigation);
const state=HL.Game.freshState();
state.flags.shipGranted=true;
state.mode="sea";
state.sea={...state.sea,lon:-12,lat:38,x:-12,y:38,heading:2,wind:2,current:2,anchor:false,weather:"맑음"};
simulation.ensure(state);
if(HL.DATA.version!==6||state.version!==6||!state.fleet[0].voyage)failures.push("v6 state shape failed");

const ship=state.fleet[0];
ship.equipment.sail="square";state.sea.heading=state.sea.wind;const squareTail=simulation.fleetSpeed(state);
state.sea.heading=(state.sea.wind+4)%8;const squareHead=simulation.fleetSpeed(state);
ship.equipment.sail="lateen";const lateenHead=simulation.fleetSpeed(state);
if(!(squareTail>squareHead&&lateenHead>squareHead))failures.push("wind and sail relationship failed");

ship.food=20;ship.water=20;ship.voyage.rationFood=90;ship.voyage.rationWater=90;const health=state.crew.health;
simulation.advanceDay(state);
if(!(ship.food<20&&ship.water<20&&state.crew.health===health))failures.push("safe ration consumption failed");
ship.voyage.rationFood=50;simulation.advanceDay(state);
if(state.crew.health>=health)failures.push("low ration health penalty failed");

state.inventory.sextant=false;if(simulation.canAutoSail(state))failures.push("auto sail unlocked without instrument");
state.inventory.sextant=true;state.stats.knowledge=70;if(!simulation.canAutoSail(state))failures.push("auto sail did not unlock");

state.seaSim.weatherEvent={phase:"warning",hours:1,severity:1};state.hour=10;const events=simulation.advanceHour(state);
if(!events.some(event=>event.type==="storm-start")||state.seaSim.weatherEvent.phase!=="storm")failures.push("storm warning transition failed");
state.fleet[0].voyage.rudder=0;state.seaSim.mode="Adrift";state.fleet[0].lumber=1;
const game=Object.create(HL.Game.prototype);game.s=state;game.seaSimulation=simulation;game.navigation=navigation;game.seaGrid=grid;game.save=()=>{};game.e={toast(){},button(){return""},window(){},close(){},playMusic(){},sfx(){},overlay:{innerHTML:""}};game.dosRepair();
if(state.fleet[0].voyage.rudder<=0||state.seaSim.mode==="Adrift")failures.push("rudder repair failed");

let windowHtml="";game.e.button=(label,action)=>`<button data-action="${action}">${label}</button>`;game.e.window=html=>{windowHtml=html};game.nearbyPort=()=>null;game.fleetSystem={ensure:()=>[],visible:()=>[],distance:()=>99,detectionRange:()=>2,ensureStoryFleet(){}};game.openSeaMenu();
if(!windowHtml.includes("해상 명령")||windowHtml.includes("속도 2")||windowHtml.includes("위험 예보"))failures.push("DOS sea command menu failed");
state.hour=12;game.mode="sea";game.startBattle("pirate");
if(game.mode!=="battle"||game.battle.allies.length<1||game.battle.enemies.length<2||!windowHtml.includes("함대전"))failures.push("multi-ship battle state failed");

const second={...JSON.parse(JSON.stringify(ship)),id:"escort",name:"호위선",food:0,water:0,lumber:0};state.fleet.push(second);simulation.ensure(state);const fleetSpeed=simulation.fleetSpeed(state);if(fleetSpeed>simulation.shipSpeed(state,state.fleet[0],0)+1e-9)failures.push("fleet did not use slowest ship");

const old=HL.Game.freshState();old.version=5;old.money=4321;old.bank.balance=900;old.discoveries=[{id:"wreck",name:"난파선",lon:0,lat:0,value:10}];localStorage.setItem("horizon-ledger-v5-slot-1",JSON.stringify(old));const engine=Object.create(HL.Engine.prototype);engine.migrateOld(1);const migrated=JSON.parse(localStorage.getItem("horizon-ledger-v6-slot-1"));
if(!migrated||migrated.version!==6||migrated.money!==4321||migrated.bank.balance!==900||migrated.discoveries[0]?.id!=="wreck")failures.push("v5 migration failed");
if(!localStorage.getItem("horizon-ledger-v5-slot-1"))failures.push("v5 source save removed");

console.log(JSON.stringify({version:HL.DATA.version,squareTail,squareHead,lateenHead,food:ship.food,health:state.crew.health,fleetSpeed,migrated:migrated?.version,failures},null,2));
if(failures.length)process.exitCode=1;
