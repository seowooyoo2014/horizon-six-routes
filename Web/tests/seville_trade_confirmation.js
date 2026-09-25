const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
require('./boot_v21.js');
vm.runInThisContext(fs.readFileSync(path.join(__dirname,'../seville_trade.js'),'utf8'));
setImmediate(()=>{
  const g=new HL.Game();g.e.selectedSlot=96;g.newGame('ines');g.renderV21Trade=()=>{};
  const good=Object.keys(HL.DATA.ports.seville.market)[0];g.s.tradeState={selected:good,intent:'buy',quantity:1};g.s.money=10000;
  Object.assign(g.s.fleet[0],{food:0,water:0,lumber:0,cannonballs:0,tradeCargo:{}});
  const before=g.s.money;g.dispatchAction('v21-trade-commit');assert(g.sevilleTradeQuote);assert.equal(g.s.money,before);
  g.dispatchAction('seville-trade-cancel');assert.equal(g.s.money,before);
  g.dispatchAction('v21-trade-commit');const amount=g.sevilleTradeQuote.total;g.dispatchAction('seville-trade-confirm');assert.equal(g.s.money,before-amount);
  g.dispatchAction('seville-trade-confirm');assert.equal(g.s.money,before-amount,'double confirmation');
  g.dispatchAction('v21-trade-commit');g.s.classicMarket.ports.seville.goods[good].index+=.5;g.dispatchAction('seville-trade-confirm');assert.equal(g.s.money,before-amount,'changed quote');
  const extra={...g.s.fleet[0],tradeCargo:{[good]:2}};g.s.fleet[0].tradeCargo={};g.s.fleet.push(extra);
  g.s.tradeState.intent='sell';g.dispatchAction('v21-trade-commit');g.dispatchAction('seville-trade-confirm');
  assert.equal(g.s.fleet[0].tradeCargo[good],0,'empty ship cargo remains a finite zero');
  assert.equal(extra.tradeCargo[good],1,'cargo is removed from the actual carrying ship');
  console.log('Seville quoted price, cancel, confirm, replay and stale quote: PASS');
});
