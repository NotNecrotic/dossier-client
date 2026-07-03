using System;
using System.Threading;
using System.Threading.Tasks;
using Dossier.Client.Workers.Base;
using Dossier.Client.Queues;
using Dossier.Core.Jobs;
using Dossier.Core.Enums;

namespace Dossier.Client.Workers.Implementations
{
    public class FingerprintWorker : WorkerBase
    {
        private readonly JobQueue _jobQueue;

        public FingerprintWorker(JobQueue jobQueue)
        {
            _jobQueue = jobQueue;
        }

        protected override Task<bool> TryProcessNextJobAsync(CancellationToken token)
        {
            if (!_jobQueue.TryDequeue(out ProcessingJob? job) || job == null)
                return Task.FromResult(false);

            // Only handle fingerprint-related jobs (we'll formalize job types later)
            if (job.State != JobState.Fingerprinting && job.State != JobState.Created)
                return Task.FromResult(false);

            ProcessFingerprint(job);

            return Task.FromResult(true);
        }

        private void ProcessFingerprint(ProcessingJob job)
        {
            try
            {
                job.State = JobState.Fingerprinting;

                // SIMPLE FINGERPRINT (phase 1 approach)
                var fileInfo = new System.IO.FileInfo(job.FilePath);

                string fingerprint = GenerateSimpleFingerprint(fileInfo);

                job.Fingerprint = fingerprint;

                job.State = JobState.Fingerprinted;

                // NOTE:
                // Later we will:
                // - store in SQLite cache
                // - check against server UUID
                // - route to next worker stage

            }
            catch (Exception ex)
            {
                job.State = JobState.Failed;
                OnError(ex);
            }
        }

        private string GenerateSimpleFingerprint(System.IO.FileInfo fileInfo)
        {
            // VERY basic fingerprint for now
            return $"{fileInfo.Length}-{fileInfo.Name}-{fileInfo.LastWriteTimeUtc.Ticks}";
        }
    }
}