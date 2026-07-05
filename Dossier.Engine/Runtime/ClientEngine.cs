using System.Collections.Generic;
using System.Threading.Tasks;
using Dossier.Engine.Queues;
using Dossier.Engine.Workers.Base;
using Dossier.Engine.Services;
using Dossier.Engine.Workers.Implementations;
using Dossier.Engine.Jobs;
using Dossier.Engine.Enums;

namespace Dossier.Engine.Runtime
{
    public class ClientEngine
    {
        private readonly SettingsService _settingsService;
        private readonly DatabaseService _dbService;
        private readonly HttpClient _httpClient;
        private readonly ILogger<UploadWorker> _logger;

        private readonly List<WorkerBase> _workers = new();
        private readonly JobQueue _jobQueue;
        private FileWatcherService? _watcherService;

        public bool IsRunning { get; private set; }

        public ClientEngine(SettingsService settingsService, DatabaseService dbService, HttpClient httpClient, ILogger<UploadWorker> logger)
        {
            _settingsService = settingsService;
            _dbService = dbService;
            _httpClient = httpClient;
            _logger = logger;
            _jobQueue = new JobQueue();
        }

        /// Starts the client runtime.
        public void Start()
        {
            var settings = _settingsService.Get();

            if (IsRunning)
                return;

            IsRunning = true;

            InitializeWorkers();

            StartWorkers();

            if (!string.IsNullOrEmpty(settings.WatchFolder))
            {
                StartWatching(settings.WatchFolder);
            }
        }

        /// Stops all workers and shuts down the system.
        public async Task StopAsync()
        {
            if (!IsRunning)
                return;

            var stopTasks = new List<Task>();

            foreach (var worker in _workers)
            {
                stopTasks.Add(worker.StopAsync());
            }

            await Task.WhenAll(stopTasks);

            IsRunning = false;
        }

        /// Creates all worker instances.
        private void InitializeWorkers()
        {
            _workers.Clear();

            // Fingerprint worker
            _workers.Add(new FingerprintWorker(_jobQueue, _dbService));
            _workers.Add(new PreprocessingWorker(_jobQueue, _settingsService));
            _workers.Add(new UploadWorker(_jobQueue, _settingsService, _httpClient, _logger));
        }
        
        /// <summary>
        /// Starts all workers.
        /// </summary>
        private void StartWorkers()
        {
            foreach (var worker in _workers)
            {
                worker.Start();
            }
        }

        /// <summary>
        /// Expose queue for other systems (like FileWatcher later)
        /// </summary>
        public JobQueue GetJobQueue()
        {
            return _jobQueue;
        }

        public void StartWatching(string folder)
        {   
            var existingPaths = new List<string>();
            _dbService.GetAllFingerprintPaths(existingPaths);

            _watcherService = new FileWatcherService(path => 
            {
                var job = new ProcessingJob { FilePath = path, State = JobState.Created };
                _jobQueue.Enqueue(job);
            },

            path =>
            {
               _dbService.RemoveFingerprint(path); 
            });

            _watcherService.Start(folder, existingPaths);
        }
    }
}