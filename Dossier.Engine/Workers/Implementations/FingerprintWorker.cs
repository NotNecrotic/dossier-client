using System;
using System.Threading;
using System.Threading.Tasks;
using Dossier.Engine.Workers.Base;
using Dossier.Engine.Queues;
using Dossier.Engine.Jobs;
using Dossier.Engine.Enums;
using Dossier.Engine.Services;

namespace Dossier.Engine.Workers.Implementations
{
    public class FingerprintWorker : WorkerBase
    {
        private readonly JobQueue _jobQueue;
        private readonly DatabaseService _dbService;

        public FingerprintWorker(JobQueue jobQueue, DatabaseService dbService)
        {
            _jobQueue = jobQueue;
            _dbService = dbService;
        }

        protected override Task<bool> TryProcessNextJobAsync(CancellationToken token)
        {
            if (!_jobQueue.TryDequeue(out ProcessingJob? job) || job == null)
                return Task.FromResult(false);

            if (job.State != JobState.Created)
            {
                _jobQueue.Enqueue(job);
                return Task.FromResult(false);
            }

            ProcessFingerprint(job);

            return Task.FromResult(true);
        }

        private void ProcessFingerprint(ProcessingJob job)
        {
            try
            {
                job.State = JobState.Fingerprinting;
                var fileInfo = new System.IO.FileInfo(job.FilePath);
                string fingerprint = GenerateFingerprint(fileInfo);
                job.Fingerprint = fingerprint;

                _dbService.RegisterFingerprint(job.FilePath, fingerprint);
                job.State = JobState.Fingerprinted;
                _jobQueue.Enqueue(job);
            }
            catch (Exception ex)
            {
                job.State = JobState.Failed;
                OnError(ex);
            }
        }

        private string GenerateFingerprint(System.IO.FileInfo fileInfo)
        {
            const int bufferSize = 4096; // 4KB
            byte[] startBytes = new byte[bufferSize];
            byte[] endBytes = new byte[bufferSize];

            using (var stream = fileInfo.OpenRead())
            {
                stream.ReadExactly(startBytes, 0, bufferSize);
                
                if (stream.Length > bufferSize)
                {
                    stream.Seek(-bufferSize, System.IO.SeekOrigin.End);
                    stream.ReadExactly(endBytes, 0, bufferSize);
                }
            }

            string startHash = Convert.ToBase64String(startBytes);
            string endHash = Convert.ToBase64String(endBytes);

            return $"{fileInfo.Length}-{startHash.Substring(0, 16)}-{endHash.Substring(0, 16)}";
        }
    }
}