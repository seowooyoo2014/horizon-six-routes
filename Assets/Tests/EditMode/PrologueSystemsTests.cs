using NUnit.Framework;
using UnityEngine;

namespace HorizonLedger.Tests
{
    public sealed class PrologueSystemsTests
    {
        [Test]
        public void ContentDatabaseLoadsCompletePrologue()
        {
            ContentDatabase content = new ContentDatabase();
            Assert.AreEqual(5, content.Goods.Length);
            Assert.AreEqual(2, content.Ports.Length);
            Assert.GreaterOrEqual(content.Events.Length, 9);
            Assert.AreEqual("벨라 항", content.Port("bella").name);
        }

        [Test]
        public void TradeRoundTripPreservesMoneyCargoAndQuestFlags()
        {
            ContentDatabase content = new ContentDatabase();
            TradeSystem trade = new TradeSystem(content);
            GameState state = new GameState();

            Assert.IsTrue(trade.TryBuy(state, "bella", "glass", out _));
            int afterPurchase = state.money;
            Assert.AreEqual(1, state.QuantityOf("glass"));
            Assert.IsTrue(trade.TrySell(state, "genoa", "glass", out _));

            Assert.AreEqual(0, state.QuantityOf("glass"));
            Assert.Greater(state.money, afterPurchase);
            Assert.IsTrue(state.glassSoldAtGenoa);
        }

        [Test]
        public void SavePayloadRoundTripKeepsMarketAndStoryState()
        {
            GameState state = new GameState
            {
                questStage = 5,
                secondSunsetFound = true,
                marketStocks = new[] { new MarketStockEntry { portId = "bella", goodId = "glass", quantity = 3 } }
            };
            state.SetQuantity("salt", 2);
            SaveData original = new SaveData { version = GameState.CurrentVersion, label = "검사", savedAt = "1526-01-01", state = state };

            SaveData restored = JsonUtility.FromJson<SaveData>(JsonUtility.ToJson(original));

            Assert.AreEqual(5, restored.state.questStage);
            Assert.IsTrue(restored.state.secondSunsetFound);
            Assert.AreEqual(2, restored.state.QuantityOf("salt"));
            Assert.AreEqual(3, restored.state.marketStocks[0].quantity);
        }
    }
}
