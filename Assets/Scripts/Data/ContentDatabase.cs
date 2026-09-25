using System;
using UnityEngine;

namespace HorizonLedger
{
    public sealed class ContentDatabase
    {
        public readonly TradeGoodData[] Goods;
        public readonly PortData[] Ports;
        public readonly QuestData[] Quests;
        public readonly StoryEventData[] Events;

        public ContentDatabase()
        {
            Goods = Load<GoodsDatabase>("Data/Prologue/trade_goods").goods;
            Ports = Load<PortsDatabase>("Data/Prologue/ports").ports;
            Quests = Load<QuestDatabase>("Data/Prologue/quests").quests;
            Events = Load<EventDatabase>("Data/Prologue/events").events;
        }

        public TradeGoodData Good(string id)
        {
            return Array.Find(Goods, item => item.id == id);
        }

        public PortData Port(string id)
        {
            return Array.Find(Ports, item => item.id == id);
        }

        public StoryEventData Event(string id)
        {
            return Array.Find(Events, item => item.id == id);
        }

        private static T Load<T>(string path)
        {
            TextAsset asset = Resources.Load<TextAsset>(path);
            if (asset == null) throw new InvalidOperationException($"필수 데이터가 없습니다: Resources/{path}.json");
            T value = JsonUtility.FromJson<T>(asset.text);
            if (value == null) throw new InvalidOperationException($"데이터를 읽을 수 없습니다: {path}");
            return value;
        }
    }
}
