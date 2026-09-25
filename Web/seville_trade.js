window.HL=window.HL||{};
(function(){
  "use strict";
  const game=HL.Game.prototype,previous=game.dispatchAction;
  function quote(game){
    const s=game.s,t=s.tradeState;if(!t||!['buy','sell'].includes(t.intent)||!HL.DATA.ports[s.currentPort]?.market[t.selected])return null;
    const model=new HL.ClassicMarketStateV21(s),shipIndex=s.classicMarket.selectedShip||0;
    return{portId:s.currentPort,goodId:t.selected,intent:t.intent,shipIndex,...model.preview(s.currentPort,t.selected,t.intent,t.quantity,shipIndex)};
  }
  game.dispatchAction=function(action,button){
    if(action==='seville-trade-cancel'){this.sevilleTradeQuote=null;return this.renderV21Trade()}
    if(action==='seville-trade-confirm'){
      const pending=this.sevilleTradeQuote;this.sevilleTradeQuote=null;if(!pending)return;
      const current=quote(this);
      if(!current||!current.max||['portId','goodId','intent','shipIndex','quantity','price','total'].some(k=>current[k]!==pending[k])){
        this.renderV21Trade();return this.e.toast('가격이나 화물 조건이 바뀌었습니다. 거래 내용을 다시 확인하십시오.');
      }
      return previous.call(this,'v21-trade-commit',button);
    }
    this.sevilleTradeQuote=null;
    if(action==='v21-trade-commit'&&this.s.currentPort==='seville'){
      const q=quote(this);if(!q)return this.e.toast('교역 품목과 구입·판매 방식을 먼저 선택하십시오.');
      if(!q.max)return this.e.toast(q.intent==='buy'?'금화, 시장 재고 또는 선택한 배의 적재 공간이 부족합니다.':'판매할 화물이 없습니다.');
      this.sevilleTradeQuote=q;const name=HL.DATA.goods.find(g=>g.id===q.goodId).name;
      const after=this.s.money+(q.intent==='buy'?-q.total:q.total);
      return this.e.dialogue('상인의 거래 제안',`${name} ${q.quantity}개를 ${q.intent==='buy'?'구입':'판매'}합니다.\n개당 ${q.price}금, 합계 ${q.total}금.\n거래 후 소지금: ${after}금`,[{label:'거래 확정',action:'seville-trade-confirm',primary:true},{label:'취소',action:'seville-trade-cancel'}]);
    }
    return previous.call(this,action,button);
  };
})();
