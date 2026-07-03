using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Dossier.Client.Workers.Base;
using Dossier.Client.Queues;
using Dossier.Core.Jobs;
using Dossier.Core.Enums;
using Dossier.Core.Manifest;

namespace Dossier.Client.Workers.Implementations
{
    public class PreprocessingWorker : WorkerBase
    {
        private readonly JobQueue _jobQueue;

        public PreprocessingWorker(JobQueue jobQueue)
        {
            _jobQueue = jobQueue;
        }

        protected override Task<bool> TryProcessNextJobAsync(CancellationToken token)
        {
            if (!_jobQueue.TryDequeue(out ProcessingJob? job) || job == null)
                return Task.FromResult(false);

            if (job.State != JobState.Preprocessing && job.State != JobState.Fingerprinted)
                return Task.FromResult(false);

            ProcessVideo(job, token);

            return Task.FromResult(true);
        }

        private void ProcessVideo(ProcessingJob job, CancellationToken token)
        {
            try
            {
                job.State = JobState.Preprocessing;

                var tempFolder = Path.Combine(Path.GetTempPath(), "Dossier", job.Fingerprint);
                Directory.CreateDirectory(tempFolder);

                // STEP 1: Extract audio (placeholder for FFmpeg later)
                var audioPath = ExtractAudio(job.FilePath, tempFolder);

                // STEP 2: Sample frames (placeholder logic for now)
                var framePaths = SampleFrames(job.FilePath, tempFolder);

                // STEP 3: Build manifest
                var manifest = new VideoManifest
                {
                    Fingerprint = job.Fingerprint,
                    AudioPath = audioPath,
                    FramePaths = framePaths
                };

                // STEP 4: Save manifest locally (temp for now)
                SaveManifest(manifest, tempFolder);

                job.State = JobState.Preprocessed;
            }
            catch (Exception ex)
            {
                job.State = JobState.Failed;
                OnError(ex);
            }
        }

        private string ExtractAudio(string videoPath, string outputFolder)
        {
            // Placeholder for FFmpeg (we will replace this later)
            var output = Path.Combine(outputFolder, "audio.aac");

            File.WriteAllText(output, "AUDIO_PLACEHOLDER");

            return output;
        }

        private System.Collections.Generic.List<string> SampleFrames(string videoPath, string outputFolder)
        {
            // Placeholder logic (real version will use FFmpeg)
            var frames = new System.Collections.Generic.List<string>();

            for (int i = 0; i < 5; i++)
            {
                var framePath = Path.Combine(outputFolder, $"frame_{i}.jpg");
                File.WriteAllText(framePath, "FRAME_PLACEHOLDER");

                frames.Add(framePath);
            }

            return frames;
        }

        private void SaveManifest(VideoManifest manifest, string folder)
        {
            var path = Path.Combine(folder, "manifest.json");

            var json = System.Text.Json.JsonSerializer.Serialize(manifest, new System.Text.Json.JsonSerializerOptions
            {
                WriteIndented = true
            });

            File.WriteAllText(path, json);
        }
    }
}