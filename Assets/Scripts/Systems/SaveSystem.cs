using System;
using System.IO;
using UnityEngine;

namespace HorizonLedger
{
    public sealed class SaveSystem
    {
        public const int AutoSlot = 0;
        public const int ManualSlotCount = 3;

        public bool HasSave(int slot)
        {
            return File.Exists(PathFor(slot)) || File.Exists(BackupPathFor(slot));
        }

        public void Save(int slot, GameState state, string label)
        {
            SaveData payload = new SaveData
            {
                version = GameState.CurrentVersion,
                savedAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                label = label,
                state = state
            };

            string directory = Path.GetDirectoryName(PathFor(slot));
            if (!Directory.Exists(directory)) Directory.CreateDirectory(directory);

            string path = PathFor(slot);
            string temp = path + ".tmp";
            string backup = BackupPathFor(slot);
            File.WriteAllText(temp, JsonUtility.ToJson(payload, true));

            if (File.Exists(path))
            {
                try
                {
                    File.Replace(temp, path, backup);
                }
                catch (PlatformNotSupportedException)
                {
                    File.Copy(path, backup, true);
                    File.Delete(path);
                    File.Move(temp, path);
                }
            }
            else
            {
                File.Move(temp, path);
            }
        }

        public SaveData Load(int slot)
        {
            SaveData save = TryLoad(PathFor(slot));
            if (save == null) save = TryLoad(BackupPathFor(slot));
            if (save == null || save.state == null) return null;
            if (save.version > GameState.CurrentVersion) return null;
            save.state.version = GameState.CurrentVersion;
            return save;
        }

        public string Description(int slot)
        {
            SaveData save = Load(slot);
            if (save == null) return "비어 있음";
            return $"{save.label} · {save.savedAt}";
        }

        private static SaveData TryLoad(string path)
        {
            if (!File.Exists(path)) return null;
            try
            {
                return JsonUtility.FromJson<SaveData>(File.ReadAllText(path));
            }
            catch (Exception exception)
            {
                Debug.LogWarning($"저장 파일을 읽지 못했습니다: {exception.Message}");
                return null;
            }
        }

        private static string PathFor(int slot)
        {
            return Path.Combine(Application.persistentDataPath, $"horizon-ledger-slot-{slot}.json");
        }

        private static string BackupPathFor(int slot)
        {
            return PathFor(slot) + ".bak";
        }
    }
}
