using Dossier.Client.Storage;
using Dossier.Client.Queues;

namespace Dossier.Client.Runtime.StartupRecovery
{
    public class RecoveryEngine
    {
        private readonly LocalCache _cache;
        private readonly JobQueue _queue;

        public RecoveryEngine(LocalCache cache, JobQueue queue)
        {
            _cache = cache;
            _queue = queue;
        }

        public void RunRecovery(string[] watchedFolders)
        {
            // STEP 1: load previous state
            var cachedState = _cache; // (we'll expand later)

            // STEP 2: scan filesystem
            var scanner = new FileScanner();
            var diskFiles = scanner.Scan(watchedFolders);

            // STEP 3: reconcile
            var reconciler = new StateReconciler(_cache, _queue);
            reconciler.Reconcile(diskFiles);
        }
    }
}