using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Dossier.Engine.Workers.Base;
using Dossier.Engine.Queues;
using Dossier.Engine.Jobs;
using Dossier.Engine.Enums;

namespace Dossier.Engine.Workers.Implementations
{
    public class UploadWorker : WorkerBase
    {
        private readonly JobQueue _jobQueue;

        public UploadWorker(JobQueue jobQueue)
        {
            _jobQueue = jobQueue;
        }

        protected override Task<bool> TryProcessNextJobAsync(CancellationToken token)
        {
            if (!_jobQueue.TryDequeue(out ProcessingJob? job) || job == null)
                return Task.FromResult(false);

            if (job.State != JobState.Preprocessed && job.State != JobState.AwaitingUpload)
                return Task.FromResult(false);

            ProcessUpload(job, token);

            return Task.FromResult(true);
        }

        private void ProcessUpload(ProcessingJob job, CancellationToken token)
        {
            try
            {
                job.State = JobState.Uploading;

                // STEP 1: Request upload session from server
                var uploadToken = RequestUploadSession(job);

                if (uploadToken == null)
                {
                    job.State = JobState.AwaitingUpload;
                    return;
                }

                // STEP 2: Upload manifest
                UploadFile(uploadToken, "manifest.json");

                // STEP 3: Upload audio
                UploadFile(uploadToken, "audio.aac");

                // STEP 4: Upload frames
                UploadFrames(uploadToken);

                // STEP 5: Finalise upload
                var serverUuid = FinaliseUpload(uploadToken);

                job.State = JobState.Uploaded;
                job.Fingerprint = job.Fingerprint; // already set
                job.FilePath = job.FilePath;

                // NOTE:
                // later we will store:
                // fingerprint ↔ UUID mapping in SQLite cache

            }
            catch (Exception ex)
            {
                job.State = JobState.Failed;
                OnError(ex);
            }
        }

        private string? RequestUploadSession(ProcessingJob job)
        {
            // Placeholder for server API call
            // In real system:
            // - HTTP request with fingerprint + size + manifest info

            return Guid.NewGuid().ToString(); // simulate approved session
        }

        private void UploadFile(string token, string fileName)
        {
            // Placeholder upload logic
            // Real version: HTTP chunk streaming

            File.WriteAllText(Path.Combine(Path.GetTempPath(), fileName), "UPLOADED");
        }

        private void UploadFrames(string token)
        {
            // Placeholder batch upload
            for (int i = 0; i < 5; i++)
            {
                // simulate frame upload
            }
        }

        private string FinaliseUpload(string token)
        {
            // Placeholder server confirmation
            return Guid.NewGuid().ToString();
        }
    }
}