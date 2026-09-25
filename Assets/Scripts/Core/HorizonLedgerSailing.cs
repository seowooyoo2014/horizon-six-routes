using UnityEngine;
using UnityEngine.UI;

namespace HorizonLedger
{
    public sealed partial class HorizonLedgerGame
    {
        private float sailingInputCooldown;

        private void StartSailing()
        {
            routeCompleting = false;
            windClock = 0f;
            supplyClock = 0f;
            BeginScreen(GameScreen.Sailing, "Sprites/Game/sailing_dawn", Color.white);
            UiFactory.Image(screenRoot, "Top Shade", new Color(0.01f, 0.08f, 0.1f, 0.78f), new Vector2(0f, 0.82f), Vector2.one, Vector2.zero, Vector2.zero);
            UiFactory.Image(screenRoot, "Bottom Shade", new Color(0.01f, 0.08f, 0.1f, 0.7f), Vector2.zero, new Vector2(1f, 0.22f), Vector2.zero, Vector2.zero);
            RawImage shipImage = UiFactory.Texture(screenRoot, "Dawn Raven", UiFactory.LoadTexture("Sprites/Game/dawn_raven"),
                new Vector2(0.08f, 0.2f), new Vector2(0.42f, 0.63f), Vector2.zero, Vector2.zero);
            shipVisual = shipImage.rectTransform;
            sailingStatus = UiFactory.Text(screenRoot, "Status", font, string.Empty, 12, TextAnchor.MiddleLeft, UiFactory.Cream,
                new Vector2(0.025f, 0.84f), new Vector2(0.67f, 0.985f), Vector2.zero, Vector2.zero);
            windText = UiFactory.Text(screenRoot, "Wind", font, string.Empty, 13, TextAnchor.MiddleCenter, UiFactory.Gold,
                new Vector2(0.68f, 0.84f), new Vector2(0.975f, 0.985f), Vector2.zero, Vector2.zero);
            sailingObjective = UiFactory.Text(screenRoot, "Objective", font, string.Empty, 11, TextAnchor.MiddleLeft, UiFactory.Cream,
                new Vector2(0.025f, 0.02f), new Vector2(0.7f, 0.2f), Vector2.zero, Vector2.zero);
            BuildMiniChart();
            Button log = UiFactory.Button(screenRoot, font, "항해 일지", () => ShowSaveLoad(false), 26);
            RectTransform logRect = log.GetComponent<RectTransform>();
            logRect.anchorMin = new Vector2(0.78f, 0.025f); logRect.anchorMax = new Vector2(0.965f, 0.1f);
            logRect.offsetMin = logRect.offsetMax = Vector2.zero;
            UpdateSailingUi();
            SetMusicFor(state.questStage == 6 ? "danger" : "sailing");
        }

        private void BuildMiniChart()
        {
            RectTransform chart = UiFactory.Image(screenRoot, "Mini Chart", new Color(0.04f, 0.12f, 0.13f, 0.9f),
                new Vector2(0.72f, 0.105f), new Vector2(0.97f, 0.21f), Vector2.zero, Vector2.zero).rectTransform;
            UiFactory.Image(chart, "Route Line", UiFactory.Muted, new Vector2(0.05f, 0.47f), new Vector2(0.95f, 0.53f), Vector2.zero, Vector2.zero);
            UiFactory.Image(chart, "Origin", UiFactory.Gold, new Vector2(0.04f, 0.24f), new Vector2(0.07f, 0.76f), Vector2.zero, Vector2.zero);
            UiFactory.Image(chart, "Destination", UiFactory.Gold, new Vector2(0.93f, 0.24f), new Vector2(0.96f, 0.76f), Vector2.zero, Vector2.zero);
            routeMarker = UiFactory.Image(chart, "Ship Marker", UiFactory.Coral, new Vector2(0.05f, 0.25f), new Vector2(0.05f, 0.75f),
                new Vector2(-3f, 0f), new Vector2(3f, 0f)).rectTransform;
        }

        private void UpdateSailing()
        {
            if (routeCompleting || state == null) return;
            sailingInputCooldown = Mathf.Max(0f, sailingInputCooldown - Time.deltaTime);
            float horizontal = Input.GetAxisRaw("Horizontal");
            float vertical = Input.GetAxisRaw("Vertical");
            if (sailingInputCooldown <= 0f)
            {
                if (horizontal < -0.5f) { heading = Mathf.Max(-1, heading - 1); sailingInputCooldown = 0.22f; }
                if (horizontal > 0.5f) { heading = Mathf.Min(1, heading + 1); sailingInputCooldown = 0.22f; }
                if (vertical > 0.5f) { sailLevel = Mathf.Min(3, sailLevel + 1); sailingInputCooldown = 0.22f; }
                if (vertical < -0.5f) { sailLevel = Mathf.Max(0, sailLevel - 1); sailingInputCooldown = 0.22f; }
            }

            windClock += Time.deltaTime;
            bobClock += Time.deltaTime;
            supplyClock += Time.deltaTime;
            if (windClock >= 11f)
            {
                windClock = 0f;
                windDirection *= -1;
                PlayEffect("Audio/sail_snap", 0.32f);
            }

            float efficiency = heading == windDirection ? 1f : heading == 0 ? 0.58f : 0.28f;
            if (state.questStage == 6) efficiency = heading == windDirection ? 0.92f : heading == 0 ? 0.33f : 0.18f;
            if (state.water <= 0 || state.food <= 0) efficiency *= 0.35f;
            float speed = (sailLevel / 3f) * efficiency * (state.questStage == 6 ? 0.025f : 0.018f);
            state.routeProgress = Mathf.Clamp01(state.routeProgress + speed * Time.deltaTime);

            if (supplyClock >= 18f)
            {
                supplyClock = 0f;
                state.water = Mathf.Max(0, state.water - 1);
                state.food = Mathf.Max(0, state.food - 1);
                state.day++;
                state.fatigue = Mathf.Min(100, state.fatigue + (sailLevel == 3 ? 5 : 2));
                if (state.water == 0 || state.food == 0) state.fatigue = Mathf.Min(100, state.fatigue + 12);
                AutoSave("항해 중");
            }

            if (state.questStage == 2 && !state.driftingMerchantResolved && state.routeProgress >= 0.35f)
            {
                state.driftingMerchantResolved = true;
                ShowEvent("drifting_merchant");
                return;
            }

            if (state.routeProgress >= 1f)
            {
                routeCompleting = true;
                ShowEvent(state.questStage == 6 ? "prologue_complete" : "arrival_genoa");
                return;
            }
            UpdateSailingUi();
        }

        private void UpdateSailingUi()
        {
            if (sailingStatus == null) return;
            string headingName = heading < 0 ? "좌현 사행" : heading > 0 ? "우현 사행" : "직진";
            string windName = windDirection < 0 ? "↙ 남서풍" : "↘ 남동풍";
            sailingStatus.text = $"새벽까마귀   돛 {sailLevel}/3   {headingName}\n물 {state.water} · 식량 {state.food} · 피로 {state.fatigue}% · 선체 {state.hull}%";
            windText.text = $"풍향 {windName}\n진행 {Mathf.RoundToInt(state.routeProgress * 100f)}%";
            sailingObjective.text = ObjectiveText() + "\nW/S 돛 · A/D 사행 · 방향키/게임패드 지원";
            float x = Mathf.Lerp(-18f, 355f, state.routeProgress);
            shipVisual.anchoredPosition = new Vector2(x, Mathf.Sin(bobClock * 2.3f) * 3f);
            if (routeMarker != null)
            {
                float marker = Mathf.Lerp(0.05f, 0.95f, state.routeProgress);
                routeMarker.anchorMin = new Vector2(marker, 0.25f);
                routeMarker.anchorMax = new Vector2(marker, 0.75f);
            }
        }
    }
}
