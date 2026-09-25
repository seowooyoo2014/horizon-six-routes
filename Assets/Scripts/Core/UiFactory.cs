using UnityEngine;
using UnityEngine.Events;
using UnityEngine.UI;

namespace HorizonLedger
{
    public static class UiFactory
    {
        public static readonly Color Panel = new Color32(14, 39, 45, 232);
        public static readonly Color PanelLight = new Color32(29, 62, 66, 238);
        public static readonly Color Cream = new Color32(244, 226, 179, 255);
        public static readonly Color Muted = new Color32(177, 196, 184, 255);
        public static readonly Color Gold = new Color32(214, 164, 78, 255);
        public static readonly Color Coral = new Color32(194, 83, 68, 255);

        public static Canvas CreateCanvas()
        {
            GameObject owner = new GameObject("Game Canvas");
            Canvas canvas = owner.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            CanvasScaler scaler = owner.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(640f, 360f);
            scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
            scaler.matchWidthOrHeight = 0.5f;
            owner.AddComponent<GraphicRaycaster>();
            return canvas;
        }

        public static RectTransform Rect(Transform parent, string name, Vector2 anchorMin, Vector2 anchorMax, Vector2 offsetMin, Vector2 offsetMax)
        {
            RectTransform rect = new GameObject(name, typeof(RectTransform)).GetComponent<RectTransform>();
            rect.SetParent(parent, false);
            rect.anchorMin = anchorMin;
            rect.anchorMax = anchorMax;
            rect.offsetMin = offsetMin;
            rect.offsetMax = offsetMax;
            return rect;
        }

        public static Image Image(Transform parent, string name, Color color, Vector2 anchorMin, Vector2 anchorMax, Vector2 offsetMin, Vector2 offsetMax)
        {
            RectTransform rect = Rect(parent, name, anchorMin, anchorMax, offsetMin, offsetMax);
            Image image = rect.gameObject.AddComponent<Image>();
            image.color = color;
            return image;
        }

        public static RawImage Texture(Transform parent, string name, Texture2D texture, Vector2 anchorMin, Vector2 anchorMax, Vector2 offsetMin, Vector2 offsetMax)
        {
            RectTransform rect = Rect(parent, name, anchorMin, anchorMax, offsetMin, offsetMax);
            RawImage image = rect.gameObject.AddComponent<RawImage>();
            image.texture = texture;
            image.color = Color.white;
            return image;
        }

        public static Text Text(Transform parent, string name, Font font, string value, int size, TextAnchor alignment, Color color,
            Vector2 anchorMin, Vector2 anchorMax, Vector2 offsetMin, Vector2 offsetMax)
        {
            RectTransform rect = Rect(parent, name, anchorMin, anchorMax, offsetMin, offsetMax);
            Text text = rect.gameObject.AddComponent<Text>();
            text.font = font;
            text.text = value;
            text.fontSize = size;
            text.alignment = alignment;
            text.color = color;
            text.horizontalOverflow = HorizontalWrapMode.Wrap;
            text.verticalOverflow = VerticalWrapMode.Truncate;
            text.lineSpacing = 1.1f;
            return text;
        }

        public static Button Button(Transform parent, Font font, string label, UnityAction action, int height = 30)
        {
            GameObject owner = new GameObject(label + " Button", typeof(RectTransform), typeof(Image), typeof(Button), typeof(LayoutElement));
            owner.transform.SetParent(parent, false);
            owner.GetComponent<LayoutElement>().preferredHeight = height;
            owner.GetComponent<LayoutElement>().flexibleWidth = 1f;
            Button button = owner.GetComponent<Button>();
            ColorBlock colors = button.colors;
            colors.normalColor = PanelLight;
            colors.highlightedColor = new Color32(48, 93, 94, 255);
            colors.selectedColor = new Color32(48, 93, 94, 255);
            colors.pressedColor = new Color32(159, 113, 55, 255);
            colors.disabledColor = new Color32(44, 50, 49, 180);
            colors.fadeDuration = 0.08f;
            button.colors = colors;
            button.onClick.AddListener(action);
            Text(owner.transform, "Label", font, label, 14, TextAnchor.MiddleCenter, Cream,
                Vector2.zero, Vector2.one, new Vector2(8f, 2f), new Vector2(-8f, -2f));
            return button;
        }

        public static VerticalLayoutGroup Vertical(Transform parent, string name, Vector2 anchorMin, Vector2 anchorMax, Vector2 offsetMin, Vector2 offsetMax, int spacing = 6)
        {
            RectTransform rect = Rect(parent, name, anchorMin, anchorMax, offsetMin, offsetMax);
            VerticalLayoutGroup layout = rect.gameObject.AddComponent<VerticalLayoutGroup>();
            layout.spacing = spacing;
            layout.childControlHeight = true;
            layout.childControlWidth = true;
            layout.childForceExpandHeight = false;
            layout.childForceExpandWidth = true;
            return layout;
        }

        public static HorizontalLayoutGroup Horizontal(Transform parent, string name, Vector2 anchorMin, Vector2 anchorMax, Vector2 offsetMin, Vector2 offsetMax, int spacing = 6)
        {
            RectTransform rect = Rect(parent, name, anchorMin, anchorMax, offsetMin, offsetMax);
            HorizontalLayoutGroup layout = rect.gameObject.AddComponent<HorizontalLayoutGroup>();
            layout.spacing = spacing;
            layout.childControlHeight = true;
            layout.childControlWidth = true;
            layout.childForceExpandHeight = true;
            layout.childForceExpandWidth = true;
            return layout;
        }

        public static Slider Slider(Transform parent, string name, float value, UnityAction<float> action)
        {
            GameObject owner = new GameObject(name, typeof(RectTransform), typeof(Slider), typeof(LayoutElement));
            owner.transform.SetParent(parent, false);
            owner.GetComponent<LayoutElement>().preferredHeight = 24f;
            Slider slider = owner.GetComponent<Slider>();
            slider.minValue = 0f;
            slider.maxValue = 1f;
            slider.value = value;
            Image background = Image(owner.transform, "Track", new Color32(5, 25, 29, 255), new Vector2(0f, 0.35f), new Vector2(1f, 0.65f), Vector2.zero, Vector2.zero);
            Image fill = Image(owner.transform, "Fill", Gold, new Vector2(0f, 0.35f), new Vector2(value, 0.65f), Vector2.zero, Vector2.zero);
            RectTransform handle = Image(owner.transform, "Handle", Cream, new Vector2(0f, 0.5f), new Vector2(0f, 0.5f), new Vector2(-4f, -8f), new Vector2(4f, 8f)).rectTransform;
            slider.targetGraphic = handle.GetComponent<Image>();
            slider.fillRect = fill.rectTransform;
            slider.handleRect = handle;
            slider.onValueChanged.AddListener(action);
            background.raycastTarget = false;
            return slider;
        }

        public static Texture2D LoadTexture(string resourcePath)
        {
            Texture2D texture = Resources.Load<Texture2D>(resourcePath);
            if (texture != null)
            {
                texture.filterMode = FilterMode.Point;
                texture.wrapMode = TextureWrapMode.Clamp;
            }
            return texture;
        }
    }
}
