using System.Collections.Generic;
using System.Threading.Tasks;
using Dossier.Client.Queues;
using Dossier.Client.Workers.Base;

namespace Dossier.Client.Runtime
{
    public class ClientEngine
    {
        private readonly List<WorkerBase> _workers = new();
        private readonly JobQueue _jobQueue;

        public bool IsRunning { get; private set; }

        public ClientEngine()
        {
            _jobQueue = new JobQueue();
        }

        /// <summary>
        /// Starts the entire client runtime.
        /// </summary>
        public void Start()
        {
            if (IsRunning)
                return;

            IsRunning = true;

            InitializeWorkers();

            StartWorkers();
        }

        /// <summary>
        /// Stops all workers and shuts down the system.
        /// </summary>
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

        /// <summary>
        /// Creates all worker instances.
        /// (We will add real workers later.)
        /// </summary>
        private void InitializeWorkers()
        {
            // Workers will be added here later:
            // _workers.Add(new FingerprintWorker(_jobQueue));
            // _workers.Add(new PreprocessingWorker(_jobQueue));
            // _workers.Add(new UploadWorker(_jobQueue));
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
    }
}