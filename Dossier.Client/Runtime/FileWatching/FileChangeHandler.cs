using Dossier.Client.Queues;
using Dossier.Core.Jobs;
using Dossier.Core.Enums;

namespace Dossier.Client.Runtime.FileWatching
{
    public class FileChangeHandler
    {
        private readonly JobQueue _queue;

        public FileChangeHandler(JobQueue queue)
        {
            _queue = queue;
        }

        public void Handle(string filePath)
        {
            var job = new ProcessingJob
            {
                FilePath = filePath,
                State = JobState.Created
            };

            _queue.Enqueue(job);
        }
    }
}