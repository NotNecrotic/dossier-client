using System.Collections.Concurrent;
using Dossier.Core.Jobs;

namespace Dossier.Client.Queues
{
    public class JobQueue
    {
        private readonly ConcurrentQueue<ProcessingJob> _queue = new();

        /// <summary>
        /// Add a job to the queue.
        /// </summary>
        public void Enqueue(ProcessingJob job)
        {
            _queue.Enqueue(job);
        }

        /// <summary>
        /// Try to get the next job in FIFO order.
        /// Returns null if queue is empty.
        /// </summary>
        public bool TryDequeue(out ProcessingJob? job)
        {
            return _queue.TryDequeue(out job);
        }

        /// <summary>
        /// Number of pending jobs.
        /// </summary>
        public int Count => _queue.Count;

        /// <summary>
        /// Clears all queued jobs (useful for reset/debug).
        /// </summary>
        public void Clear()
        {
            while (_queue.TryDequeue(out _)) { }
        }
    }
}