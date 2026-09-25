using UnityEngine;
using UnityEngine.UI;

namespace HorizonLedger
{
    public sealed partial class HorizonLedgerGame
    {
        private string CurrentPortBackground => state != null && state.portId == "genoa"
            ? "Sprites/Game/genoa_south_harbor"
            : "Sprites/Game/bella_harbor";

        private void ShowPort()
        {
            if (state == null) { ShowTitle(); return; }
            BeginScreen(GameScreen.Port, CurrentPortBackground, Color.white);
            UiFactory.Image(screenRoot, "Bottom Shade", new Color(0.02f, 0.07f, 0.08f, 0.52f), Vector2.zero, new Vector2(1f, 0.42f), Vector2.zero, Vector2.zero);
            BuildHud();
            PortData port = content.Port(state.portId);
            UiFactory.Text(screenRoot, "Port Name", font, port.name, 28, TextAnchor.UpperLeft, UiFactory.Cream,
                new Vector2(0.04f, 0.65f), new Vector2(0.62f, 0.91f), Vector2.zero, Vector2.zero);
            UiFactory.Text(screenRoot, "Port Desc", font, port.region + "\n" + port.description, 12, TextAnchor.UpperLeft, UiFactory.Muted,
                new Vector2(0.04f, 0.54f), new Vector2(0.62f, 0.76f), Vector2.zero, Vector2.zero);
            VerticalLayoutGroup menu = UiFactory.Vertical(screenRoot, "Facilities", new Vector2(0.04f, 0.07f), new Vector2(0.34f, 0.46f), Vector2.zero, Vector2.zero, 5);
            Button first = UiFactory.Button(menu.transform, font, "시장", ShowMarket);
            UiFactory.Button(menu.transform, font, "조선소", ShowShipyard);
            UiFactory.Button(menu.transform, font, "여관", ShowInn);
            UiFactory.Button(menu.transform, font, "서점", VisitBookstore);
            UiFactory.Button(menu.transform, font, "길드", ShowGuild);
            UiFactory.Button(menu.transform, font, state.portId == "bella" ? "제노아 남항으로 출항" : "출항", TryDepart, 34);
            UiFactory.Button(menu.transform, font, "항해 일지", () => ShowSaveLoad(false));
            BuildQuestPanel(new Vector2(0.38f, 0.07f), new Vector2(0.96f, 0.42f));
            if (!string.IsNullOrEmpty(notice))
                UiFactory.Text(screenRoot, "Notice", font, notice, 12, TextAnchor.MiddleCenter, UiFactory.Gold,
                    new Vector2(0.36f, 0.43f), new Vector2(0.96f, 0.52f), Vector2.zero, Vector2.zero);
            Select(first);
            SetMusicFor("port");
        }

        private void BuildHud()
        {
            UiFactory.Image(screenRoot, "HUD", new Color(0.02f, 0.12f, 0.14f, 0.94f), new Vector2(0f, 0.91f), Vector2.one, Vector2.zero, Vector2.zero);
            string value = $"제 {state.day}일   은화 {state.money:N0}   명성 {state.fame}   신뢰 {state.portTrust}   선체 {state.hull}%   화물 {state.CargoUsed()}/{TradeSystem.CargoCapacity}";
            UiFactory.Text(screenRoot, "HUD Text", font, value, 12, TextAnchor.MiddleLeft, UiFactory.Cream,
                new Vector2(0.025f, 0.915f), new Vector2(0.975f, 0.995f), Vector2.zero, Vector2.zero);
        }

        private void BuildQuestPanel(Vector2 min, Vector2 max)
        {
            UiFactory.Image(screenRoot, "Quest Panel", UiFactory.Panel, min, max, Vector2.zero, Vector2.zero);
            UiFactory.Text(screenRoot, "Quest", font, "항해 목표 · 지워진 성씨\n\n" + ObjectiveText() + "\n\n" + SupplyAndCargoText(), 12,
                TextAnchor.UpperLeft, UiFactory.Cream, min, max, new Vector2(12f, 10f), new Vector2(-12f, -10f));
        }

        private string ObjectiveText()
        {
            if (state == null) return string.Empty;
            string[] objectives = content.Quests[0].objectives;
            int index = Mathf.Clamp(state.questStage, 0, objectives.Length - 1);
            if (state.questStage == 4 || state.questStage == 5)
            {
                string glass = state.glassSoldAtGenoa ? "완료" : "미완료";
                string salt = state.saltBoughtAtGenoa ? "완료" : "미완료";
                return $"{objectives[Mathf.Min(4, index)]}\n유리 판매: {glass} · 소금 구입: {salt}";
            }
            return objectives[index];
        }

        private string SupplyAndCargoText()
        {
            return $"보급  물 {state.water} · 식량 {state.food} · 밧줄 {state.rope} · 피로 {state.fatigue}%\n" + CargoText();
        }

        private string CargoText()
        {
            string result = "화물";
            foreach (TradeGoodData good in content.Goods)
            {
                int quantity = state.QuantityOf(good.id);
                if (quantity > 0) result += $"  {good.name} {quantity}";
            }
            return result == "화물" ? "화물  없음" : result;
        }

        private void ShowMarket()
        {
            BeginScreen(GameScreen.Market, CurrentPortBackground, new Color(0.72f, 0.76f, 0.7f, 1f));
            UiFactory.Image(screenRoot, "Shade", new Color(0.02f, 0.08f, 0.09f, 0.72f), Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);
            BuildHud();
            PortData port = content.Port(state.portId);
            UiFactory.Text(screenRoot, "Title", font, port.name + " 시장", 23, TextAnchor.MiddleLeft, UiFactory.Cream,
                new Vector2(0.04f, 0.8f), new Vector2(0.96f, 0.9f), Vector2.zero, Vector2.zero);
            VerticalLayoutGroup list = UiFactory.Vertical(screenRoot, "Goods", new Vector2(0.04f, 0.22f), new Vector2(0.96f, 0.8f), Vector2.zero, Vector2.zero, 4);
            Button first = null;
            foreach (PortMarketEntry entry in port.market)
            {
                TradeGoodData good = content.Good(entry.goodId);
                HorizontalLayoutGroup row = UiFactory.Horizontal(list.transform, good.name, Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero, 5);
                row.gameObject.AddComponent<LayoutElement>().preferredHeight = 34f;
                Text label = UiFactory.Text(row.transform, "Info", font,
                    $"{good.name}  재고 {trade.StockOf(state, port.id, good.id)}  보유 {state.QuantityOf(good.id)}\n매입 {entry.buyPrice} / 매도 {entry.sellPrice}",
                    11, TextAnchor.MiddleLeft, UiFactory.Cream, Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);
                label.gameObject.AddComponent<LayoutElement>().preferredWidth = 310f;
                Button buy = UiFactory.Button(row.transform, font, "구입", () => TradeAction(true, port.id, good.id), 32);
                UiFactory.Button(row.transform, font, "판매", () => TradeAction(false, port.id, good.id), 32);
                if (first == null) first = buy;
            }
            HorizontalLayoutGroup supplies = UiFactory.Horizontal(screenRoot, "Supplies", new Vector2(0.04f, 0.105f), new Vector2(0.72f, 0.195f), Vector2.zero, Vector2.zero, 5);
            UiFactory.Button(supplies.transform, font, "물 +1 (8)", () => BuySupply("water"));
            UiFactory.Button(supplies.transform, font, "식량 +1 (10)", () => BuySupply("food"));
            UiFactory.Button(supplies.transform, font, "밧줄 +1 (28)", () => BuySupply("rope"));
            Button back = UiFactory.Button(screenRoot, font, "항구로", ShowPort);
            RectTransform backRect = back.GetComponent<RectTransform>();
            backRect.anchorMin = new Vector2(0.76f, 0.105f); backRect.anchorMax = new Vector2(0.96f, 0.195f); backRect.offsetMin = backRect.offsetMax = Vector2.zero;
            if (!string.IsNullOrEmpty(notice)) UiFactory.Text(screenRoot, "Notice", font, notice, 11, TextAnchor.MiddleCenter, UiFactory.Gold,
                new Vector2(0.04f, 0.01f), new Vector2(0.96f, 0.095f), Vector2.zero, Vector2.zero);
            Select(first);
        }

        private void TradeAction(bool buying, string portId, string goodId)
        {
            bool success = buying ? trade.TryBuy(state, portId, goodId, out notice) : trade.TrySell(state, portId, goodId, out notice);
            if (success)
            {
                PlayEffect("Audio/coin_trade");
                if (state.portId == "genoa" && state.glassSoldAtGenoa && state.saltBoughtAtGenoa) state.questStage = 5;
            }
            ShowMarket();
        }

        private void BuySupply(string type)
        {
            int price = type == "water" ? 8 : type == "food" ? 10 : 28;
            if (state.money < price) notice = "은화가 부족합니다.";
            else
            {
                state.money -= price;
                if (type == "water") state.water++;
                if (type == "food") state.food++;
                if (type == "rope") state.rope++;
                notice = "보급품을 실었습니다.";
                PlayEffect("Audio/rope_creak");
            }
            ShowMarket();
        }

        private void ShowShipyard()
        {
            ShowFacility("조선소", "선체를 5% 수리합니다. 비용: 은화 20", "수리하기", () =>
            {
                if (state.hull >= 100) notice = "선체는 이미 최상의 상태입니다.";
                else if (state.money < 20) notice = "수리비가 부족합니다.";
                else { state.money -= 20; state.hull = Mathf.Min(100, state.hull + 5); notice = "목수들이 선체 틈을 메웠습니다."; PlayEffect("Audio/wood_knock"); }
                ShowShipyard();
            });
        }

        private void ShowInn()
        {
            ShowFacility("바닷바람 여관", "선원 피로를 모두 회복하고 하루를 보냅니다. 비용: 은화 15", "묵어가기", () =>
            {
                if (state.money < 15) notice = "숙박비가 부족합니다.";
                else { state.money -= 15; state.fatigue = 0; state.day++; notice = "선원들이 충분히 쉬었습니다."; PlayEffect("Audio/port_bell"); AutoSave("여관에서 휴식"); }
                ShowInn();
            });
        }

        private void ShowFacility(string title, string body, string actionLabel, UnityEngine.Events.UnityAction action)
        {
            BeginScreen(title == "조선소" ? GameScreen.Shipyard : GameScreen.Inn, CurrentPortBackground, new Color(0.7f, 0.74f, 0.68f, 1f));
            UiFactory.Image(screenRoot, "Shade", new Color(0.02f, 0.08f, 0.09f, 0.7f), Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);
            BuildHud();
            UiFactory.Image(screenRoot, "Panel", UiFactory.Panel, new Vector2(0.2f, 0.2f), new Vector2(0.8f, 0.78f), Vector2.zero, Vector2.zero);
            UiFactory.Text(screenRoot, "Title", font, title, 24, TextAnchor.MiddleCenter, UiFactory.Cream,
                new Vector2(0.24f, 0.62f), new Vector2(0.76f, 0.75f), Vector2.zero, Vector2.zero);
            UiFactory.Text(screenRoot, "Body", font, body + "\n\n" + notice, 13, TextAnchor.UpperCenter, UiFactory.Muted,
                new Vector2(0.24f, 0.38f), new Vector2(0.76f, 0.6f), Vector2.zero, Vector2.zero);
            VerticalLayoutGroup menu = UiFactory.Vertical(screenRoot, "Menu", new Vector2(0.34f, 0.22f), new Vector2(0.66f, 0.38f), Vector2.zero, Vector2.zero);
            Button first = UiFactory.Button(menu.transform, font, actionLabel, action);
            UiFactory.Button(menu.transform, font, "항구로", ShowPort);
            Select(first);
        }

        private void VisitBookstore()
        {
            if (state.portId == "genoa" && state.glassSoldAtGenoa && state.saltBoughtAtGenoa) { ShowEvent("bookstore_clue"); return; }
            notice = state.portId == "genoa" ? "서점 주인은 거래를 마친 상인만 안쪽 서고로 들입니다." : "압류 명부에는 아버지의 장부가 이미 지워져 있습니다.";
            ShowPort();
        }

        private void ShowGuild()
        {
            BeginScreen(GameScreen.Guild, CurrentPortBackground, new Color(0.7f, 0.74f, 0.68f, 1f));
            UiFactory.Image(screenRoot, "Shade", new Color(0.02f, 0.08f, 0.09f, 0.72f), Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);
            UiFactory.Image(screenRoot, "Panel", UiFactory.Panel, new Vector2(0.12f, 0.14f), new Vector2(0.88f, 0.84f), Vector2.zero, Vector2.zero);
            UiFactory.Text(screenRoot, "Text", font, "항해자 길드\n\n현재 의뢰: 지워진 성씨\n" + ObjectiveText() + "\n\n" + SupplyAndCargoText(), 14,
                TextAnchor.UpperLeft, UiFactory.Cream, new Vector2(0.17f, 0.3f), new Vector2(0.83f, 0.78f), Vector2.zero, Vector2.zero);
            Button back = UiFactory.Button(screenRoot, font, "항구로", ShowPort);
            RectTransform rect = back.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(0.36f, 0.17f); rect.anchorMax = new Vector2(0.64f, 0.27f); rect.offsetMin = rect.offsetMax = Vector2.zero;
            Select(back);
        }

        private void TryDepart()
        {
            if (state.portId == "genoa")
            {
                notice = state.secondSunsetFound ? "서점 사건에서 즉시 출항할 수 있습니다." : "먼저 교역을 마치고 남항 서점에서 단서를 찾으십시오.";
                ShowPort();
                return;
            }
            if (state.water < 4 || state.food < 4 || state.rope < 1 || state.QuantityOf("glass") < 1)
            {
                notice = "출항 준비: 물 4, 식량 4, 밧줄 1, 유리 공예품 1이 필요합니다.";
                ShowPort();
                return;
            }
            state.questStage = 2;
            state.destinationPortId = "genoa";
            state.routeProgress = 0f;
            state.driftingMerchantResolved = false;
            StartSailing();
            AutoSave("벨라 항 출항");
        }
    }
}
