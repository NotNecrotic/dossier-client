using System;
using System.Collections.Generic;
using System.IO;

namespace Dossier.Engine.Runtime.FileWatching
{
    public class FileWatcherService
    {
        private readonly List<FileSystemWatcher> _watchers = new();
        private readonly Action<string> _onFileChanged;

        public FileWatcherService(Action<string> onFileChanged)
        {
            _onFileChanged = onFileChanged;
        }

        public void Start(string[] folders)
        {
            foreach (var folder in folders)
            {
                if (!Directory.Exists(folder))
                    continue;

                var watcher = new FileSystemWatcher(folder)
                {
                    IncludeSubdirectories = true,
                    EnableRaisingEvents = true,
                    NotifyFilter =
                        NotifyFilters.FileName |
                        NotifyFilters.LastWrite |
                        NotifyFilters.CreationTime
                };

                watcher.Created += OnChanged;
                watcher.Deleted += OnChanged;
                watcher.Renamed += OnRenamed;
                watcher.Changed += OnChanged;

                _watchers.Add(watcher);
            }
        }

        private void OnChanged(object sender, FileSystemEventArgs e)
        {
            if (IsVideo(e.FullPath))
                _onFileChanged?.Invoke(e.FullPath);
        }

        private void OnRenamed(object sender, RenamedEventArgs e)
        {
            if (IsVideo(e.FullPath))
                _onFileChanged?.Invoke(e.FullPath);
        }

        private bool IsVideo(string path)
        {
            var ext = Path.GetExtension(path).ToLower();

            return ext is ".mp4" or ".mkv" or ".avi" or ".mov";
        }
    }
}