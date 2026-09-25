using UnityEngine;
using UnityEngine.UI;

namespace HorizonLedger
{
    public sealed partial class HorizonLedgerGame
    {
        private void ShowEvent(string eventId)
        {
            activeEvent = content.Event(eventId);
            if (activeEvent == null) { notice = "사건 데이터를 찾지 못했습니다."; ShowPort(); return; }
            bool atSea = eventId.Contains("merchant") || eventId.Contains("complete") || eventId.Contains("escape");
            BeginScreen(GameScreen.Event, atSea ? "Sprites/Game/sailing_dawn" : CurrentPortBackground, new Color(0.72f, 0.78f, 0.75f, 1f));
            UiFactory.Image(screenRoot, "Shade", new Color(0.01f, 0.06f, 0.07f, 0.64f), Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);
            RawImage portrait = UiFactory.Texture(screenRoot, "Rian", UiFactory.LoadTexture("Sprites/Game/rian_portrait"),
                new Vector2(0.035f, 0.08f), new Vector2(0.37f, 0.78f), Vector2.zero, Vector2.zero);
            portrait.color = activeEvent.speaker == "리안 팔코" ? Color.white : new Color(0.64f, 0.68f, 0.68f, 1f);
            UiFactory.Image(screenRoot, "Dialogue Panel", UiFactory.Panel, new Vector2(0.34f, 0.08f), new Vector2(0.965f, 0.9f), Vector2.zero, Vector2.zero);
            UiFactory.Text(screenRoot, "Speaker", font, activeEvent.speaker, 13, TextAnchor.MiddleLeft, UiFactory.Gold,
                new Vector2(0.38f, 0.79f), new Vector2(0.92f, 0.87f), Vector2.zero, Vector2.zero);
            UiFactory.Text(screenRoot, "Event Title", font, activeEvent.title, 23, TextAnchor.MiddleLeft, UiFactory.Cream,
                new Vector2(0.38f, 0.67f), new Vector2(0.92f, 0.8f), Vector2.zero, Vector2.zero);
            UiFactory.Text(screenRoot, "Body", font, activeEvent.body, 13, TextAnchor.UpperLeft, UiFactory.Cream,
                new Vector2(0.38f, 0.31f), new Vector2(0.92f, 0.67f), Vector2.zero, Vector2.zero);
            VerticalLayoutGroup choices = UiFactory.Vertical(screenRoot, "Choices", new Vector2(0.4f, 0.12f), new Vector2(0.9f, 0.3f), Vector2.zero, Vector2.zero, 5);
            Button first = null;
            foreach (StoryChoiceData choice in activeEvent.choices)
            {
                StoryChoiceData captured = choice;
                Button button = UiFactory.Button(choices.transform, font, captured.label, () => Choose(captured), 31);
                if (first == null) first = button;
            }
            Select(first);
            PlayEffect("Audio/page_turn", 0.55f);
        }

        private void Choose(StoryChoiceData choice)
        {
            string label = activeEvent.title;
            ExecuteCommand(choice.command);
            AutoSave(label);
            if (!string.IsNullOrEmpty(choice.nextEventId)) ShowEvent(choice.nextEventId);
        }

        private void ExecuteCommand(string command)
        {
            switch (command)
            {
                case "none": return;
                case "begin_port":
                    state.questStage = 1; state.portId = "bella"; notice = "출항 준비를 갖추십시오."; ShowPort(); break;
                case "rescue_merchant":
                    state.rescuedMerchant = true; state.food = Mathf.Max(0, state.food - 1); state.portTrust += 12; state.fame += 80; break;
                case "pass_merchant":
                    state.rescuedMerchant = false; state.portTrust = Mathf.Max(0, state.portTrust - 3); break;
                case "resume_sailing":
                    StartSailing(); break;
                case "arrive_genoa":
                    state.portId = "genoa"; state.routeProgress = 0f; state.questStage = 4; state.fame += 40;
                    notice = "유리를 팔고 소금을 구입하십시오."; PlayEffect("Audio/port_bell"); ShowPort(); break;
                case "find_clue":
                    state.secondSunsetFound = true; state.questStage = 5; state.fame += 120; break;
                case "begin_escape":
                    state.questStage = 6; state.destinationPortId = "open_sea"; state.routeProgress = 0f;
                    state.hull = Mathf.Max(55, state.hull - 8);
                    state.water = Mathf.Max(3, state.water); state.food = Mathf.Max(3, state.food); state.rope = Mathf.Max(1, state.rope);
                    StartSailing(); break;
                case "finish_prologue":
                    state.prologueComplete = true; state.questStage = 6; state.fame += 200; ShowComplete(); break;
            }
        }

        private void ShowComplete()
        {
            BeginScreen(GameScreen.Complete, "Sprites/Game/sailing_dawn", new Color(0.64f, 0.76f, 0.75f, 1f));
            UiFactory.Image(screenRoot, "Shade", new Color(0.01f, 0.07f, 0.08f, 0.62f), Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);
            UiFactory.Text(screenRoot, "Complete", font, "프롤로그 완료", 34, TextAnchor.MiddleCenter, UiFactory.Cream,
                new Vector2(0.12f, 0.66f), new Vector2(0.88f, 0.86f), Vector2.zero, Vector2.zero);
            UiFactory.Text(screenRoot, "Summary", font,
                $"첫 번째 항로가 열렸습니다.\n\n명성 {state.fame} · 항구 신뢰 {state.portTrust}\n은화 {state.money:N0} · 제 {state.day}일\n\n다음 목표\n서아프리카의 붉은 절벽에서 두 번째 일몰을 관측하라.",
                15, TextAnchor.UpperCenter, UiFactory.Cream, new Vector2(0.18f, 0.28f), new Vector2(0.82f, 0.64f), Vector2.zero, Vector2.zero);
            VerticalLayoutGroup menu = UiFactory.Vertical(screenRoot, "Menu", new Vector2(0.35f, 0.1f), new Vector2(0.65f, 0.27f), Vector2.zero, Vector2.zero);
            Button first = UiFactory.Button(menu.transform, font, "저장하고 타이틀로", () => { SaveManual(1); ShowTitle(); });
            UiFactory.Button(menu.transform, font, "항해 기록 보기", () => ShowSaveLoad(false));
            AutoSave("프롤로그 완료");
            Select(first);
        }

        private void ShowSaveLoad(bool fromTitle)
        {
            if (currentScreen != GameScreen.SaveLoad) returnScreen = fromTitle ? GameScreen.Title : currentScreen;
            BeginScreen(GameScreen.SaveLoad, "Sprites/Game/sailing_dawn", new Color(0.42f, 0.5f, 0.5f, 1f));
            UiFactory.Image(screenRoot, "Shade", new Color(0.01f, 0.06f, 0.07f, 0.8f), Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);
            UiFactory.Text(screenRoot, "Title", font, "항해 일지", 26, TextAnchor.MiddleCenter, UiFactory.Cream,
                new Vector2(0.2f, 0.76f), new Vector2(0.8f, 0.9f), Vector2.zero, Vector2.zero);
            VerticalLayoutGroup list = UiFactory.Vertical(screenRoot, "Slots", new Vector2(0.18f, 0.2f), new Vector2(0.82f, 0.74f), Vector2.zero, Vector2.zero, 7);
            Button first = null;
            for (int slot = 1; slot <= SaveSystem.ManualSlotCount; slot++)
            {
                int captured = slot;
                HorizontalLayoutGroup row = UiFactory.Horizontal(list.transform, "Slot " + slot, Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero, 5);
                row.gameObject.AddComponent<LayoutElement>().preferredHeight = 44f;
                Text description = UiFactory.Text(row.transform, "Description", font, $"기록 {slot}\n{saves.Description(slot)}", 11, TextAnchor.MiddleLeft,
                    UiFactory.Cream, Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);
                description.gameObject.AddComponent<LayoutElement>().preferredWidth = 310f;
                Button saveButton = UiFactory.Button(row.transform, font, "저장", () => { SaveManual(captured); ShowSaveLoad(false); }, 34);
                saveButton.interactable = state != null;
                Button loadButton = UiFactory.Button(row.transform, font, "불러오기", () => LoadSlot(captured), 34);
                loadButton.interactable = saves.HasSave(captured);
                if (first == null) first = fromTitle ? loadButton : saveButton;
            }
            Button back = UiFactory.Button(list.transform, font, "돌아가기", ReturnFromOverlay, 32);
            if (first == null || !first.interactable) first = back;
            Select(first);
        }

        private void SaveManual(int slot)
        {
            if (state == null) return;
            saves.Save(slot, state, state.prologueComplete ? "프롤로그 완료" : ObjectiveText());
            notice = $"기록 {slot}에 저장했습니다.";
            PlayEffect("Audio/page_turn", 0.45f);
        }

        private void AutoSave(string label)
        {
            if (state != null) saves.Save(SaveSystem.AutoSlot, state, label);
        }

        private void LoadSlot(int slot)
        {
            SaveData loaded = saves.Load(slot);
            if (loaded == null) { notice = "불러올 수 있는 기록이 없습니다."; ShowTitle(); return; }
            state = loaded.state;
            notice = "항해 기록을 불러왔습니다.";
            if (state.prologueComplete) ShowComplete();
            else if (state.questStage == 2 || state.questStage == 6) StartSailing();
            else ShowPort();
        }

        private void ShowSettings(GameScreen back)
        {
            returnScreen = back;
            BeginScreen(GameScreen.Settings, "Sprites/Game/sailing_dawn", new Color(0.38f, 0.46f, 0.46f, 1f));
            UiFactory.Image(screenRoot, "Shade", new Color(0.01f, 0.06f, 0.07f, 0.82f), Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);
            UiFactory.Image(screenRoot, "Panel", UiFactory.Panel, new Vector2(0.23f, 0.18f), new Vector2(0.77f, 0.82f), Vector2.zero, Vector2.zero);
            UiFactory.Text(screenRoot, "Title", font, "소리 설정", 24, TextAnchor.MiddleCenter, UiFactory.Cream,
                new Vector2(0.28f, 0.68f), new Vector2(0.72f, 0.79f), Vector2.zero, Vector2.zero);
            VerticalLayoutGroup layout = UiFactory.Vertical(screenRoot, "Controls", new Vector2(0.31f, 0.28f), new Vector2(0.69f, 0.66f), Vector2.zero, Vector2.zero, 8);
            UiFactory.Text(layout.transform, "Music Label", font, "음악", 12, TextAnchor.MiddleLeft, UiFactory.Cream, Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero).gameObject.AddComponent<LayoutElement>().preferredHeight = 20;
            Slider musicSlider = UiFactory.Slider(layout.transform, "Music", music.volume, value => { music.volume = value; PlayerPrefs.SetFloat("music-volume", value); });
            UiFactory.Text(layout.transform, "Effects Label", font, "효과음", 12, TextAnchor.MiddleLeft, UiFactory.Cream, Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero).gameObject.AddComponent<LayoutElement>().preferredHeight = 20;
            UiFactory.Slider(layout.transform, "Effects", effects.volume, value => { effects.volume = value; PlayerPrefs.SetFloat("effects-volume", value); });
            UiFactory.Button(layout.transform, font, "돌아가기", ReturnFromOverlay, 32);
            Select(musicSlider);
        }

        private void ReturnFromOverlay()
        {
            if (returnScreen == GameScreen.Title) ShowTitle();
            else if (returnScreen == GameScreen.Sailing) StartSailing();
            else if (returnScreen == GameScreen.Complete) ShowComplete();
            else ShowPort();
        }
    }
}
