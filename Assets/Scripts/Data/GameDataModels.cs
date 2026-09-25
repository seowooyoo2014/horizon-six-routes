using System;

namespace HorizonLedger
{
    public enum GameScreen
    {
        Title,
        CaptainSelect,
        Port,
        Market,
        Shipyard,
        Inn,
        Bookstore,
        Guild,
        Sailing,
        Event,
        Settings,
        SaveLoad,
        Complete
    }

    [Serializable]
    public sealed class GameState
    {
        public const int CurrentVersion = 1;

        public int version = CurrentVersion;
        public string captainId = "rian_falco";
        public string portId = "bella";
        public string destinationPortId = "genoa";
        public int day = 1;
        public int money = 900;
        public int fame;
        public int portTrust;
        public int hull = 100;
        public int water;
        public int food;
        public int rope;
        public int fatigue;
        public int questStage;
        public float routeProgress;
        public bool driftingMerchantResolved;
        public bool rescuedMerchant;
        public bool glassSoldAtGenoa;
        public bool saltBoughtAtGenoa;
        public bool secondSunsetFound;
        public bool prologueComplete;
        public CargoEntry[] cargo = Array.Empty<CargoEntry>();
        public MarketStockEntry[] marketStocks = Array.Empty<MarketStockEntry>();

        public int CargoUsed()
        {
            int total = 0;
            foreach (CargoEntry entry in cargo) total += entry.quantity;
            return total;
        }

        public int QuantityOf(string goodId)
        {
            foreach (CargoEntry entry in cargo)
            {
                if (entry.goodId == goodId) return entry.quantity;
            }
            return 0;
        }

        public void SetQuantity(string goodId, int quantity)
        {
            for (int i = 0; i < cargo.Length; i++)
            {
                if (cargo[i].goodId != goodId) continue;
                cargo[i].quantity = Math.Max(0, quantity);
                return;
            }

            CargoEntry[] expanded = new CargoEntry[cargo.Length + 1];
            Array.Copy(cargo, expanded, cargo.Length);
            expanded[expanded.Length - 1] = new CargoEntry { goodId = goodId, quantity = Math.Max(0, quantity) };
            cargo = expanded;
        }
    }

    [Serializable]
    public sealed class MarketStockEntry
    {
        public string portId;
        public string goodId;
        public int quantity;
    }

    [Serializable]
    public sealed class CargoEntry
    {
        public string goodId;
        public int quantity;
    }

    [Serializable]
    public sealed class SaveData
    {
        public int version = GameState.CurrentVersion;
        public string savedAt;
        public string label;
        public GameState state;
    }

    [Serializable]
    public sealed class TradeGoodData
    {
        public string id;
        public string name;
        public int weight = 1;
        public string description;
    }

    [Serializable]
    public sealed class GoodsDatabase
    {
        public TradeGoodData[] goods;
    }

    [Serializable]
    public sealed class PortMarketEntry
    {
        public string goodId;
        public int buyPrice;
        public int sellPrice;
        public int stock;
    }

    [Serializable]
    public sealed class PortData
    {
        public string id;
        public string name;
        public string region;
        public string description;
        public PortMarketEntry[] market;
    }

    [Serializable]
    public sealed class PortsDatabase
    {
        public PortData[] ports;
    }

    [Serializable]
    public sealed class QuestData
    {
        public string id;
        public string title;
        public string[] objectives;
    }

    [Serializable]
    public sealed class QuestDatabase
    {
        public QuestData[] quests;
    }

    [Serializable]
    public sealed class StoryChoiceData
    {
        public string label;
        public string command;
        public string nextEventId;
    }

    [Serializable]
    public sealed class StoryEventData
    {
        public string id;
        public string speaker;
        public string title;
        public string body;
        public string condition;
        public StoryChoiceData[] choices;
    }

    [Serializable]
    public sealed class EventDatabase
    {
        public StoryEventData[] events;
    }
}
