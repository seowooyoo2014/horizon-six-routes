const fs=require("fs");
const vm=require("vm");
const path=require("path");
global.window=global;global.HL={};global.Image=class{set src(value){this._src=value}};
const root=path.resolve(__dirname,"..");
for(const file of["data.js","world_data.js","v5_data.js","systems.js","v5_systems.js","sea_navigation_v6.js","art.js","game.js","expansion.js"]){vm.runInThisContext(fs.readFileSync(path.join(root,file),"utf8"),{filename:file})}

const failures=[],navigation=new HL.WorldNavigation(),grid=new HL.SeaNavigationGrid(navigation),guide=new HL.SeaRouteGuide(grid),core=HL.WorldData.activePorts(1);
for(const id of core){const p=HL.DATA.ports[id],approach=grid.portApproach(p);if(grid.blocked(approach.spawn[0],approach.spawn[1],.16))failures.push(`${id}: blocked spawn`);if(grid.blocked(approach.channel[0],approach.channel[1],.16))failures.push(`${id}: blocked channel`)}

const state=HL.Game.freshState();state.mode="sea";state.sea={...state.sea,lon:-10.2,lat:38.72,x:-10.2,y:38.72,heading:2,current:2,autoTarget:"lume"};state.knownPorts=["bella","porto","cadiz","lume","genoa"];
const route=guide.info(state,"lume");if(!route||!route.route.length||!Number.isFinite(route.heading))failures.push("route guide failed");
const beforeHeading=state.sea.heading;guide.info(state,"genoa");if(state.sea.heading!==beforeHeading)failures.push("route guide changed manual heading");

for(const speed of[.04,.12,.32]){const test=HL.Game.freshState(),approach=grid.portApproach(HL.DATA.ports.bella);test.sea={...test.sea,lon:approach.spawn[0],lat:approach.spawn[1],x:approach.spawn[0],y:approach.spawn[1],heading:approach.heading,current:approach.heading};for(let i=0;i<240;i++){grid.move(test,speed);if(grid.blocked(test.sea.lon,test.sea.lat,.14)){failures.push(`movement entered land at ${speed}`);break}}}

const coastState=HL.Game.freshState(),coast=grid.portApproach(HL.DATA.ports.genoa);coastState.sea={...coastState.sea,lon:coast.spawn[0],lat:coast.spawn[1],x:coast.spawn[0],y:coast.spawn[1],heading:(coast.heading+4)%8,current:0};let contacts=0;for(let i=0;i<160;i++){const result=grid.move(coastState,.08);if(result.blocked)contacts++;if(grid.blocked(coastState.sea.lon,coastState.sea.lat,.14)){failures.push("coast slide entered land");break}}if(contacts&&!Number.isFinite(coastState.sea.lon))failures.push("coast slide stalled with invalid position");

for(const type of["caravel","cog","galley","brig"]){const file=path.resolve(root,`../Assets/Resources/Sprites/Game/SeaV6/${type}_8dir.png`);if(!fs.existsSync(file))failures.push(`${type}: missing sea sprite`);else{const header=fs.readFileSync(file).subarray(0,24),size=[header.readUInt32BE(16),header.readUInt32BE(20)];if(size[0]!==768||size[1]!==256)failures.push(`${type}: sprite is ${size.join("x")}`)}}

console.log(JSON.stringify({corePorts:core.length,routeWaypoints:route?.route.length||0,routeHeading:route?HL.DATA.directionNames[route.heading]:null,contacts,failures},null,2));
if(failures.length)process.exitCode=1;
