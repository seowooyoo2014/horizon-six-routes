using System.Collections;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace HorizonLedger
{
    public sealed partial class HorizonLedgerGame : MonoBehaviour
    {
        private ContentDatabase content;
        private TradeSystem trade;
        private SaveSystem saves;
        private GameState state;
        private Canvas canvas;
        private RectTransform screenRoot;
        private Font font;
        private GameScreen currentScreen;
        private GameScreen returnScreen;
        private StoryEventData activeEvent;
        private string notice = string.Empty;
        private AudioSource music;
        private AudioSource effects;
        private Coroutine musicFade;

        private Text sailingStatus;
        private Text sailingObjective;
        private Text windText;
        private RectTransform shipVisual;
        private RectTransform routeMarker;
        private int sailLevel = 2;
        private int heading;
        private int windDirection = 1;
        private float windClock;
        private float supplyClock;
        private float bobClock;
        private bool routeCompleting;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void Bootstrap()
        {
            if (FindObjectOfType<HorizonLedgerGame>() == null)
                new GameObject("Horizon Ledger Game").AddComponent<HorizonLedgerGame>();
        }

        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            Application.targetFrameRate = 60;
            font = Font.CreateDynamicFontFromOSFont(new[] { "Apple SD Gothic Neo", "Malgun Gothic", "Arial Unicode MS", "Arial" }, 16);
            content = new ContentDatabase();
            trade = new TradeSystem(content);
            saves = new SaveSystem();
            BuildEventSystem();
            canvas = UiFactory.CreateCanvas();
            DontDestroyOnLoad(canvas.gameObject);
            BuildAudio();
            ShowTitle();
        }

        private void Update()
        {
            if (currentScreen == GameScreen.Sailing) UpdateSailing();
            if (Input.GetKeyDown(KeyCode.F5) && state != null) SaveManual(1);
            if ((Input.GetKeyDown(KeyCode.Escape) || Input.GetKeyDown(KeyCode.JoystickButton1)) &&
                currentScreen != GameScreen.Title && currentScreen != GameScreen.Event)
                HandleBack();
        }

        private void HandleBack()
        {
            switch (currentScreen)
            {
                case GameScreen.CaptainSelect: ShowTitle(); break;
                case GameScreen.Market:
                case GameScreen.Shipyard:
                case GameScreen.Inn:
                case GameScreen.Bookstore:
                case GameScreen.Guild: ShowPort(); break;
                case GameScreen.Sailing: ShowSaveLoad(false); break;
                case GameScreen.SaveLoad:
                case GameScreen.Settings: ReturnFromOverlay(); break;
                case GameScreen.Complete: ShowTitle(); break;
                default: ShowTitle(); break;
            }
        }

        private void BuildEventSystem()
        {
            if (FindObjectOfType<EventSystem>() != null) return;
            GameObject owner = new GameObject("Event System", typeof(EventSystem), typeof(StandaloneInputModule));
            DontDestroyOnLoad(owner);
        }

        private void BuildAudio()
        {
            music = gameObject.AddComponent<AudioSource>();
            music.loop = true;
            music.volume = PlayerPrefs.GetFloat("music-volume", 0.48f);
            effects = gameObject.AddComponent<AudioSource>();
            effects.volume = PlayerPrefs.GetFloat("effects-volume", 0.8f);
            PlayMusic("Audio/horizon_ledger_theme");
        }

        private void BeginScreen(GameScreen screen, string backgroundPath, Color tint)
        {
            currentScreen = screen;
            if (screenRoot != null) Destroy(screenRoot.gameObject);
            screenRoot = UiFactory.Rect(canvas.transform, screen + " Screen", Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);
            RawImage backdrop = UiFactory.Texture(screenRoot, "Backdrop", UiFactory.LoadTexture(backgroundPath), Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);
            backdrop.color = tint;
        }

        private void ShowTitle()
        {
            BeginScreen(GameScreen.Title, "Sprites/Game/sailing_dawn", new Color(0.62f, 0.72f, 0.72f, 1f));
            UiFactory.Image(screenRoot, "Shade", new Color(0.01f, 0.08f, 0.1f, 0.56f), Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);
            UiFactory.Text(screenRoot, "Title", font, "수평선의 장부", 38, TextAnchor.MiddleCenter, UiFactory.Cream,
                new Vector2(0.08f, 0.62f), new Vector2(0.92f, 0.88f), Vector2.zero, Vector2.zero);
            UiFactory.Text(screenRoot, "Subtitle", font, "HORIZON LEDGER · 1526", 13, TextAnchor.UpperCenter, UiFactory.Gold,
                new Vector2(0.15f, 0.53f), new Vector2(0.85f, 0.66f), Vector2.zero, Vector2.zero);
            VerticalLayoutGroup menu = UiFactory.Vertical(screenRoot, "Title Menu", new Vector2(0.35f, 0.13f), new Vector2(0.65f, 0.5f), Vector2.zero, Vector2.zero, 7);
            Button first = UiFactory.Button(menu.transform, font, "새 항해", ShowCaptainSelect, 34);
            Button resume = UiFactory.Button(menu.transform, font, "자동 저장 이어하기", () => LoadSlot(SaveSystem.AutoSlot), 34);
            resume.interactable = saves.HasSave(SaveSystem.AutoSlot);
            UiFactory.Button(menu.transform, font, "저장 기록", () => ShowSaveLoad(true), 34);
            UiFactory.Button(menu.transform, font, "설정", () => ShowSettings(GameScreen.Title), 34);
            UiFactory.Text(screenRoot, "Hint", font, "방향키/스틱 이동 · Enter/A 선택 · Esc/B 뒤로 · F5 빠른 저장", 11, TextAnchor.LowerCenter, UiFactory.Muted,
                new Vector2(0.06f, 0.01f), new Vector2(0.94f, 0.09f), Vector2.zero, Vector2.zero);
            Select(first);
            SetMusicFor("sailing");
        }

        private void ShowCaptainSelect()
        {
            BeginScreen(GameScreen.CaptainSelect, "Sprites/captain_lineup_plate", new Color(0.65f, 0.68f, 0.65f, 1f));
            UiFactory.Image(screenRoot, "Shade", new Color(0.01f, 0.07f, 0.08f, 0.55f), Vector2.zero, Vector2.one, Vector2.zero, Vector2.zero);
            UiFactory.Text(screenRoot, "Header", font, "선장을 선택하십시오", 26, TextAnchor.MiddleCenter, UiFactory.Cream,
                new Vector2(0.05f, 0.8f), new Vector2(0.95f, 0.96f), Vector2.zero, Vector2.zero);
            HorizontalLayoutGroup cards = UiFactory.Horizontal(screenRoot, "Captain Cards", new Vector2(0.04f, 0.19f), new Vector2(0.96f, 0.78f), Vector2.zero, Vector2.zero, 8);
            Button rian = CaptainCard(cards.transform, "리안 팔코\n항해 46 · 지식 62\n새벽까마귀\n\n[프롤로그 시작]", true, StartNewGame);
            CaptainCard(cards.transform, "세레나 아란트\n전투 76 · 지휘 68\n붉은 바람\n\n후속 시나리오", false, null);
            CaptainCard(cards.transform, "마르코 칸토\n교역 70 · 지휘 52\n웃는 저울\n\n후속 시나리오", false, null);
            CaptainCard(cards.transform, "엘린 보레알\n지식 82 · 항해 50\n북극성의 숨\n\n후속 시나리오", false, null);
            Button back = UiFactory.Button(screenRoot, font, "돌아가기", ShowTitle, 28);
            RectTransform backRect = back.GetComponent<RectTransform>();
            backRect.anchorMin = new Vector2(0.38f, 0.06f); backRect.anchorMax = new Vector2(0.62f, 0.14f);
            backRect.offsetMin = backRect.offsetMax = Vector2.zero;
            Select(rian);
        }

        private Button CaptainCard(Transform parent, string label, bool available, UnityEngine.Events.UnityAction action)
        {
            Button button = UiFactory.Button(parent, font, label, action ?? (() => { }), 160);
            button.interactable = available;
            return button;
        }

        private void StartNewGame()
        {
            state = new GameState();
            notice = string.Empty;
            PlayEffect("Audio/captain_select");
            ShowEvent("intro_ledger");
        }

        private void Select(Selectable selectable)
        {
            if (selectable == null || EventSystem.current == null) return;
            EventSystem.current.SetSelectedGameObject(selectable.gameObject);
        }

        private void PlayEffect(string path, float volume = 0.7f)
        {
            AudioClip clip = Resources.Load<AudioClip>(path);
            if (clip == null) clip = Resources.Load<AudioClip>("Audio/wave_click");
            if (clip != null) effects.PlayOneShot(clip, volume);
        }

        private void SetMusicFor(string context)
        {
            string path = context == "port" ? "Audio/harbor_theme" : context == "danger" ? "Audio/chase_theme" : "Audio/horizon_ledger_theme";
            if (Resources.Load<AudioClip>(path) == null) path = "Audio/horizon_ledger_theme";
            PlayMusic(path);
        }

        private void PlayMusic(string path)
        {
            AudioClip clip = Resources.Load<AudioClip>(path);
            if (clip == null || music.clip == clip) return;
            if (musicFade != null) StopCoroutine(musicFade);
            musicFade = StartCoroutine(FadeMusic(clip));
        }

        private IEnumerator FadeMusic(AudioClip next)
        {
            float target = PlayerPrefs.GetFloat("music-volume", 0.48f);
            for (float t = 0f; t < 0.35f; t += Time.unscaledDeltaTime)
            {
                music.volume = Mathf.Lerp(target, 0f, t / 0.35f);
                yield return null;
            }
            music.clip = next;
            music.Play();
            for (float t = 0f; t < 0.55f; t += Time.unscaledDeltaTime)
            {
                music.volume = Mathf.Lerp(0f, target, t / 0.55f);
                yield return null;
            }
            music.volume = target;
            musicFade = null;
        }
    }
}
