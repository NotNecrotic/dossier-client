using Dossier.Engine.Storage;
using Dossier.Engine.Queues;
using Dossier.Engine.Jobs;
using Dossier.Engine.Enums;

namespace Dossier.Engine.Runtime.StartupRecovery
{
    public class StateReconciler
    {
        private readonly LocalCache _cache;
        private readonly JobQueue _queue;

        public StateReconciler(LocalCache cache, JobQueue queue)
        {
            _cache = cache;
            _queue = queue;
        }

        public void Reconcile(System.Collections.Generic.List<string> diskFiles)
        {
            foreach (var file in diskFiles)
            {
                // STEP 1: Create a temporary job for fingerprinting
                var job = new ProcessingJob
                {
                    FilePath = file,
                    State = JobState.Created
                };

                _queue.Enqueue(job);
            }

            // NOTE:
            // Later we will:
            // - compare against SQLite cache
            // - detect moved files
            // - restore partial pipeline jobs
        }
    }
}