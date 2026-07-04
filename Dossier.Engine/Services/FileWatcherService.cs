using System;
using System.Collections.Generic;
using System.IO;

namespace Dossier.Engine.Services
{
    public class FileWatcherService
    {
        private readonly List<FileSystemWatcher> _watchers = new();
        private readonly Action<string> _onFileChanged;
        private readonly Action<string> _onFileDeleted;

        public FileWatcherService(Action<string> onFileChanged, Action<string> onFileDeleted)
        {
            _onFileChanged = onFileChanged;
            _onFileDeleted = onFileDeleted;
        }

        public void Start(string folder, List<string> dbFilePaths)
        {
            if (!Directory.Exists(folder))
                return;
                
                // Initial Sync
                var files = Directory.GetFiles(folder, "*.*", SearchOption.AllDirectories);
                foreach (var file in files)
                {
                    if(IsVideo(file))
                        _onFileChanged?.Invoke(file);
                }

                // Prune Database
                var currentFiles = new HashSet<string>(files, StringComparer.OrdinalIgnoreCase);
                foreach (var dbPath in dbFilePaths)
                {
                    if (!currentFiles.Contains(dbPath))
                    {
                        _onFileDeleted?.Invoke(dbPath);
                    }
                }

                // Watcher
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

        private void OnChanged(object sender, FileSystemEventArgs e)
        {
            if (!IsVideo(e.FullPath))
                return;

            if (e.ChangeType == WatcherChangeTypes.Deleted)
            {
                _onFileDeleted?.Invoke(e.FullPath);
            }
            else 
            {
                _onFileChanged?.Invoke(e.FullPath);
            }
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