using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Dossier.Client.Services
{
    public class FileWatcherService : IDisposable
    {
        private FileSystemWatcher? _watcher;

        private readonly Dictionary<string, CancellationTokenSource> _pendingChanges = new(StringComparer.OrdinalIgnoreCase);
        private readonly object _lock = new();
        private static readonly TimeSpan DebounceDelay =
            TimeSpan.FromSeconds(2);

        private readonly Action<string> _onFileChanged;
        private readonly Action<string> _onFileDeleted;

        private readonly ILogger<FileWatcherService> _logger;

        public FileWatcherService(
            Action<string> onFileChanged,
            Action<string> onFileDeleted,
            ILogger<FileWatcherService> logger)
        {
            _onFileChanged = onFileChanged;
            _onFileDeleted = onFileDeleted;
            _logger = logger;
        }

        public void Start(
            string folder,
            List<string> dbFilePaths)
        {
            _logger.LogInformation("Starting file watcher for {Folder}", folder);

            if (!Directory.Exists(folder))
            {
                _logger.LogWarning( "Watch folder does not exist: {Folder}", folder);
                return;
            }

            try
            {
                var files =
                    Directory.GetFiles(
                        folder,
                        "*.*",
                        SearchOption.AllDirectories
                    );

                int videoCount = 0;

                foreach (var file in files)
                {
                    if (IsVideo(file))
                    {
                        videoCount++;

                        _logger.LogDebug("Initial scan found video: {File}", file);

                        _onFileChanged(file);
                    }
                }

                _logger.LogInformation("Initial scan complete. Found {Count} videos", videoCount);

                var currentFiles =
                    new HashSet<string>(
                        files,
                        StringComparer.OrdinalIgnoreCase
                    );

                foreach (var dbPath in dbFilePaths)
                {
                    if (!currentFiles.Contains(dbPath))
                    {
                        _logger.LogInformation("Removing missing file from database: {Path}", dbPath);

                        _onFileDeleted(dbPath);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Initial file scan failed"
                );
            }

            _watcher = new FileSystemWatcher(folder)
            {
                IncludeSubdirectories = true,

                NotifyFilter =
                    NotifyFilters.FileName |
                    NotifyFilters.LastWrite |
                    NotifyFilters.Size
            };

            _watcher.Created += OnChanged;
            _watcher.Changed += OnChanged;
            _watcher.Deleted += OnChanged;
            _watcher.Renamed += OnRenamed;
            _watcher.Error += OnError;

            _watcher.EnableRaisingEvents = true;

            _logger.LogInformation("File watcher active");
        }

        private void ScheduleChange(string path)
        {
            lock (_lock)
            {
                if (_pendingChanges.TryGetValue(path, out var existing))
                {
                    existing.Cancel();
                }

                var cts = new CancellationTokenSource();

                _pendingChanges[path] = cts;

                _ = ProcessChangedFileAfterDelay(
                    path,
                    cts.Token
                );
            }
        }

        private void CancelPending(string path)
        {
            lock (_lock)
            {
                if (_pendingChanges.TryGetValue(path, out var cts))
                {
                    cts.Cancel();
                    cts.Dispose();
                    _pendingChanges.Remove(path);
                }
            }
        }

        private void OnChanged(
            object sender,
            FileSystemEventArgs e)
        {   
            if (!IsVideo(e.FullPath))
                return;

            if (e.ChangeType == WatcherChangeTypes.Deleted)
            {
                _logger.LogInformation(
                    "Video deleted: {Path}",
                    e.FullPath
                );
                
                CancelPending(e.FullPath);

                _onFileDeleted(e.FullPath);

                return;
            }

            ScheduleChange(e.FullPath);
        }

        private async Task ProcessChangedFileAfterDelay(
            string path,
            CancellationToken token)
        {
            try
            {
                await Task.Delay(
                    DebounceDelay,
                    token
                );

                await WaitForFileReady(path);


                _logger.LogInformation("Video change confirmed: {Path}", path);

                _onFileChanged(path);
            }
            catch (OperationCanceledException)
            {
                _logger.LogDebug("Ignoring duplicate file event: {Path}", path);
            }
            finally
            {
                lock (_lock)
                {
                    if (_pendingChanges.TryGetValue(path, out var cts))
                    {
                        cts.Dispose();
                        _pendingChanges.Remove(path);
                    }
                }
            }
        }

        private async Task WaitForFileReady(
            string path)
        {
            while (true)
            {
                try
                {
                    using var stream =
                        File.Open(
                            path,
                            FileMode.Open,
                            FileAccess.Read,
                            FileShare.None
                        );

                    return;
                }
                catch
                {
                    _logger.LogDebug("Waiting for file lock to release: {Path}", path);

                    await Task.Delay(1000);
                }
            }
        }

        private void OnRenamed(
            object sender,
            RenamedEventArgs e)
        {
            if (!IsVideo(e.FullPath))
                return;

            _logger.LogInformation("Video renamed: {OldPath} -> {NewPath}", e.OldFullPath, e.FullPath);

            ScheduleChange(e.FullPath);
        }

        private void OnError(
            object sender,
            ErrorEventArgs e)
        {
            _logger.LogError(e.GetException(), "File watcher encountered an error");
        }

        private bool IsVideo(string path)
        {
            var ext =
                Path.GetExtension(path)
                .ToLowerInvariant();

            return ext is
                ".mp4" or
                ".mkv" or
                ".mov" or
                ".avi" or
                ".webm" or
                ".m4v" or
                ".wmv" or
                ".flv" or
                ".mpeg" or
                ".mpg" or
                ".ts" or
                ".mts" or
                ".m2ts";
        }

        public void Dispose()
        {
            _logger.LogInformation("Stopping file watcher");

            _watcher?.Dispose();
            _watcher = null;

            lock (_lock)
            {
                foreach (var cts in _pendingChanges.Values)
                {
                    cts.Cancel();
                    cts.Dispose();
                }

                _pendingChanges.Clear();
            }
        }
    }
}