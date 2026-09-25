using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace HorizonLedger.Editor
{
    [InitializeOnLoad]
    public static class HorizonLedgerProjectSetup
    {
        private const string BootScenePath = "Assets/Scenes/Boot.unity";

        static HorizonLedgerProjectSetup()
        {
            EditorApplication.delayCall += EnsureProjectReady;
        }

        private static void EnsureProjectReady()
        {
            PlayerSettings.productName = "수평선의 장부";
            PlayerSettings.companyName = "Horizon Ledger Studio";
            PlayerSettings.defaultScreenWidth = 1280;
            PlayerSettings.defaultScreenHeight = 720;
            PlayerSettings.resizableWindow = true;
            PlayerSettings.fullScreenMode = FullScreenMode.Windowed;

            if (!File.Exists(BootScenePath))
            {
                Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
                scene.name = "Boot";
                EditorSceneManager.SaveScene(scene, BootScenePath);
                AssetDatabase.Refresh();
            }

            EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(BootScenePath, true) };
            if (!EditorApplication.isPlayingOrWillChangePlaymode && SceneManager.GetActiveScene().path != BootScenePath)
                EditorSceneManager.OpenScene(BootScenePath, OpenSceneMode.Single);
        }
    }

    public sealed class HorizonLedgerTextureImporter : AssetPostprocessor
    {
        private void OnPreprocessTexture()
        {
            if (!assetPath.Contains("/Resources/Sprites/Game/")) return;
            TextureImporter importer = (TextureImporter)assetImporter;
            importer.textureType = TextureImporterType.Default;
            importer.filterMode = FilterMode.Point;
            importer.textureCompression = TextureImporterCompression.Uncompressed;
            importer.mipmapEnabled = false;
            importer.maxTextureSize = 2048;
        }
    }
}
