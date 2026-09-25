using System;

namespace HorizonLedger
{
    public sealed class TradeSystem
    {
        public const int CargoCapacity = 12;

        private readonly ContentDatabase content;

        public TradeSystem(ContentDatabase contentDatabase)
        {
            content = contentDatabase;
        }

        public bool TryBuy(GameState state, string portId, string goodId, out string message)
        {
            PortMarketEntry market = FindMarket(portId, goodId);
            if (market == null)
            {
                message = "이 항구에서는 취급하지 않는 물품입니다.";
                return false;
            }

            if (state.money < market.buyPrice)
            {
                message = "은화가 부족합니다.";
                return false;
            }

            if (state.CargoUsed() >= CargoCapacity)
            {
                message = "화물칸이 가득 찼습니다.";
                return false;
            }

            if (StockOf(state, portId, goodId) <= 0)
            {
                message = "오늘 준비된 재고가 없습니다.";
                return false;
            }

            state.money -= market.buyPrice;
            state.SetQuantity(goodId, state.QuantityOf(goodId) + 1);
            SetStock(state, portId, goodId, StockOf(state, portId, goodId) - 1);
            if (portId == "genoa" && goodId == "salt") state.saltBoughtAtGenoa = true;
            message = $"{content.Good(goodId).name} 1상자를 샀습니다.";
            return true;
        }

        public bool TrySell(GameState state, string portId, string goodId, out string message)
        {
            PortMarketEntry market = FindMarket(portId, goodId);
            if (market == null || state.QuantityOf(goodId) <= 0)
            {
                message = "팔 수 있는 화물이 없습니다.";
                return false;
            }

            state.money += market.sellPrice;
            state.SetQuantity(goodId, state.QuantityOf(goodId) - 1);
            SetStock(state, portId, goodId, StockOf(state, portId, goodId) + 1);
            if (portId == "genoa" && goodId == "glass") state.glassSoldAtGenoa = true;
            message = $"{content.Good(goodId).name} 1상자를 팔았습니다.";
            return true;
        }

        public int StockOf(GameState state, string portId, string goodId)
        {
            foreach (MarketStockEntry entry in state.marketStocks)
            {
                if (entry.portId == portId && entry.goodId == goodId) return entry.quantity;
            }

            PortMarketEntry market = FindMarket(portId, goodId);
            int initial = market == null ? 0 : market.stock;
            SetStock(state, portId, goodId, initial);
            return initial;
        }

        private void SetStock(GameState state, string portId, string goodId, int quantity)
        {
            for (int i = 0; i < state.marketStocks.Length; i++)
            {
                MarketStockEntry entry = state.marketStocks[i];
                if (entry.portId != portId || entry.goodId != goodId) continue;
                entry.quantity = Math.Max(0, quantity);
                return;
            }

            MarketStockEntry[] expanded = new MarketStockEntry[state.marketStocks.Length + 1];
            Array.Copy(state.marketStocks, expanded, state.marketStocks.Length);
            expanded[expanded.Length - 1] = new MarketStockEntry
            {
                portId = portId,
                goodId = goodId,
                quantity = Math.Max(0, quantity)
            };
            state.marketStocks = expanded;
        }

        private PortMarketEntry FindMarket(string portId, string goodId)
        {
            PortData port = content.Port(portId);
            return port == null ? null : Array.Find(port.market, entry => entry.goodId == goodId);
        }
    }
}
