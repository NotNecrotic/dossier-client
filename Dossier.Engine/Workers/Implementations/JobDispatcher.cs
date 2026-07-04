using Dossier.Engine.Jobs;
using Dossier.Engine.Enums;

namespace Dossier.Engine.Queues
{
    public class JobDispatcher
    {
        private readonly JobQueue _queue;

        public JobDispatcher(JobQueue queue)
        {
            _queue = queue;
        }

        /// <summary>
        /// Called by workers when a job is completed or reaches a milestone.
        /// </summary>
        public void OnJobUpdated(ProcessingJob job)
        {
            switch (job.State)
            {
                case JobState.Created:
                    MoveToFingerprint(job);
                    break;

                case JobState.Fingerprinted:
                    MoveToPreprocess(job);
                    break;

                case JobState.Preprocessed:
                    MoveToUpload(job);
                    break;

                case JobState.Uploaded:
                    Complete(job);
                    break;

                case JobState.Failed:
                    HandleFailure(job);
                    break;
            }
        }

        private void MoveToFingerprint(ProcessingJob job)
        {
            job.State = JobState.Fingerprinting;
            _queue.Enqueue(job);
        }

        private void MoveToPreprocess(ProcessingJob job)
        {
            job.State = JobState.Preprocessing;
            _queue.Enqueue(job);
        }

        private void MoveToUpload(ProcessingJob job)
        {
            job.State = JobState.Uploading;
            _queue.Enqueue(job);
        }

        private void Complete(ProcessingJob job)
        {
            // Job finished fully
            // later: notify cache + server sync layer
        }

        private void HandleFailure(ProcessingJob job)
        {
            // later we add retry/backoff logic here
        }
    }
}