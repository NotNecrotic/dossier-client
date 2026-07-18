using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dossier.Engine.Services;
using Microsoft.Extensions.Logging;

namespace Dossier.Engine.Runtime
{
    public class ClientEngine
    {
        private readonly SettingsService _settingsService;
        private readonly DatabaseService _dbService;
        private readonly FingerprintService _fingerprintService;
        private readonly UploadService _uploadService;
        private readonly ILogger<ClientEngine> _logger;
        private readonly ILogger<FileWatcherService> _watcherLogger;

        private FileWatcherService? _watcherService;

        public bool IsRunning { get; private set; }

        public ClientEngine(
            SettingsService settingsService,
            DatabaseService dbService,
            FingerprintService fingerprintService,
            UploadService uploadService,
            ILogger<ClientEngine> logger,
            ILoggerFactory loggerFactory)
        {
            _settingsService = settingsService;
            _dbService = dbService;
            _fingerprintService = fingerprintService;
            _uploadService = uploadService;
            _logger = logger;

            _watcherLogger = loggerFactory.CreateLogger<FileWatcherService>();
        }

        public void Start()
        {
            if (IsRunning)
                return;

            var settings = _settingsService.Get();

            if (string.IsNullOrEmpty(settings.WatchFolder))
            {
                throw new Exception(
                    "WatchFolder is not configured"
                );
            }

            IsRunning = true;

            _logger.LogInformation(
                "Starting Dossier engine"
            );

            StartWatching(
                settings.WatchFolder
            );
        }

        public async Task StopAsync()
        {
            if (!IsRunning)
                return;

            _logger.LogInformation(
                "Stopping Dossier engine"
            );

            _watcherService?.Dispose();

            IsRunning = false;

            await Task.CompletedTask;
        }

        private void StartWatching(string folder)
        {
            var existingPaths = _dbService.GetAllVideoPaths();

            _watcherService =
                new FileWatcherService(

                    path =>
                    {
                        _ = ProcessFileAsync(path);
                    },

                    path =>
                    {
                        _dbService.RemoveFingerprint(path);


                        _logger.LogInformation(
                            "Removed deleted file: {Path}",
                            path
                        );
                    },

                    _watcherLogger

                );

            _watcherService.Start(
                folder,
                existingPaths
            );

            _logger.LogInformation(
                "Watching folder: {Folder}",
                folder
            );
        }

        private async Task ProcessFileAsync(string path)
        {
            try
            {
                _logger.LogInformation(
                    "Detected video: {Path}",
                    path
                );

                if (_dbService.Exists(path))
                {
                    _logger.LogDebug(
                        "Already indexed: {Path}",
                        path
                    );

                    return;
                }

                _logger.LogInformation(
                    "Generating fingerprint: {Path}",
                    path
                );

                var fingerprint =
                    _fingerprintService.Generate(
                        path
                    );

                _dbService.RegisterFingerprint(
                    path,
                    fingerprint
                );

                _logger.LogInformation(
                    "Fingerprint created: {Fingerprint}",
                    fingerprint
                );

                await _uploadService.UploadAsync(
                    path,
                    fingerprint
                );

                _logger.LogInformation(
                    "Upload completed: {Path}",
                    path
                );
                
            }
            catch(Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed processing file: {Path}",
                    path
                );
            }
        }
    }
}