using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using Dossier.Engine.Manifest;
using Dossier.Engine.Workers.Base;
using Dossier.Engine.Jobs;
using Dossier.Engine.Queues;
using Dossier.Engine.Enums;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Text.Json;
using System.Security.Cryptography;

namespace Dossier.Engine.Workers.Implementations
{
    public class UploadWorker : WorkerBase
    {
        private readonly JobQueue _jobQueue;
        private readonly HttpClient _httpClient;
        private readonly ILogger<UploadWorker> _logger;

        public UploadWorker(JobQueue jobQueue, HttpClient httpClient, ILogger<UploadWorker> logger)
        {
            _jobQueue = jobQueue;
            _httpClient = httpClient;
            _logger = logger;
        }

        protected override async Task<bool> TryProcessNextJobAsync(CancellationToken token)
        {
            if (!_jobQueue.TryDequeue(out var job) || job == null) return false;
            if (job.State != JobState.Preprocessed && job.State != JobState.AwaitingUpload) return false;

            await ProcessUploadAsync(job, token);
            return true;
        }

        private async Task ProcessUploadAsync(ProcessingJob job, CancellationToken token)
        {
            try
            {
                job.State = JobState.Uploading;
                var manifest = await LoadManifestAsync(job.ManifestPath, token);

                var session = await RequestUploadSessionAsync(manifest, token);
                if (session == null) throw new Exception("Upload session handshake failed.");

                await UploadFile(session.Token, manifest.ProxyPath, token);

                foreach (var audioPath in manifest.AudioPaths)
                {
                    await UploadFile(session.Token, audioPath, token);
                }

                var ManifestHash = GenerateManifestHash(manifest);
                var request = new HttpRequestMessage(HttpMethod.Post, "/api/sessions/validate");
                request.Headers.Add("X-Session-Token", session.Token);
                request.Headers.Add("X-Manifest-Hash", ManifestHash);

                var validateResult = await _httpClient.SendAsync(request, token);
                validateResult.EnsureSuccessStatusCode();

                job.State = JobState.Uploaded;
                _logger.LogInformation("Job {Id} uploaded successfully.", job.JobId);
            }
            catch (Exception ex)
            {
                job.State = JobState.Failed;
                _logger.LogError(ex, "Upload failed for job {JobId}", job.JobId);
            }
        }

        private string GenerateManifestHash(VideoManifest manifest)
        {
            string jsonString = JsonSerializer.Serialize(manifest);
            
            byte[] bytes = Encoding.UTF8.GetBytes(jsonString);
            
            byte[] hashBytes = SHA256.HashData(bytes);
            
            return Convert.ToHexString(hashBytes);
        }
        private async Task<UploadSessionResponse?> RequestUploadSessionAsync(VideoManifest manifest, CancellationToken token)
        {
            var response = await _httpClient.PostAsJsonAsync("/api/sessions/request", manifest, token);
            return response.IsSuccessStatusCode 
                ? await response.Content.ReadFromJsonAsync<UploadSessionResponse>(cancellationToken: token) 
                : null;
        }

        private async Task UploadFile(string sessionToken, string filePath, CancellationToken token)
        {
            var fileInfo = new FileInfo(filePath);
            using var stream = fileInfo.OpenRead();
            var content = new StreamContent(stream);

            var request = new HttpRequestMessage(HttpMethod.Post, "/api/upload");
    
            request.Headers.Add("X-Session-Token", sessionToken);

            var response = await _httpClient.SendAsync(request, token);
            response.EnsureSuccessStatusCode();
        }

        private async Task<VideoManifest> LoadManifestAsync(string path, CancellationToken token)
        {
            var json = await File.ReadAllTextAsync(path, token);
            return JsonSerializer.Deserialize<VideoManifest>(json) ?? throw new InvalidDataException("Invalid manifest file.");
        }
    }

    public class UploadSessionResponse
    {
        public string Token { get; set; } = string.Empty;
    }
}