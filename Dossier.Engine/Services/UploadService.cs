using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Dossier.Engine.Services;
using Dossier.Engine.Models;
using Microsoft.Extensions.Logging;

namespace Dossier.Engine.Services
{
    public class UploadService
    {
        private readonly HttpClient _httpClient;
        private readonly SettingsService _settingsService;
        private readonly ILogger<UploadService> _logger;


        private const int ChunkSize = 8 * 1024 * 1024; // 8MB


        public UploadService(
            HttpClient httpClient,
            SettingsService settingsService,
            ILogger<UploadService> logger)
        {
            _httpClient = httpClient;
            _settingsService = settingsService;
            _logger = logger;
        }



        public async Task UploadAsync(
            string filePath,
            string fingerprint,
            CancellationToken token = default)
        {   
            var fileInfo = new FileInfo(filePath);


            _logger.LogInformation(
                "Starting upload: {File} ({Size} bytes)",
                fileInfo.Name,
                fileInfo.Length
            );


            var begin =
                await BeginUploadAsync(
                    fingerprint,
                    fileInfo.Length,
                    token
                );


            if (begin.Status == "exists")
            {
                _logger.LogInformation(
                    "Video already exists on server. Skipping upload."
                );

                return;
            }


            if (begin.Status != "upload_required")
            {
                throw new Exception(
                    "Server rejected upload."
                );
            }


            await UploadChunksAsync(
                filePath,
                begin.UploadId!,
                token
            );


            await FinishUploadAsync(
                begin.UploadId!,
                fingerprint,
                token
            );


            _logger.LogInformation(
                "Upload completed successfully."
            );
        }






        private async Task<BeginUploadResponse> BeginUploadAsync(
            string fingerprint,
            long fileSize,
            CancellationToken token)
        {
            var settings =
                _settingsService.Get();


            var url =
                $"{settings.ServerUrl}/api/upload/begin";


            var request =
                new HttpRequestMessage(
                    HttpMethod.Post,
                    url
                );


            request.Headers.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    settings.ServerKey
                );


            request.Content =
                JsonContent.Create(
                    new
                    {
                        fingerprint,
                        fileSize
                    }
                );


            var response =
                await _httpClient.SendAsync(
                    request,
                    token
                );


            response.EnsureSuccessStatusCode();


            return
                await response.Content
                    .ReadFromJsonAsync<BeginUploadResponse>(
                        cancellationToken: token
                    )
                ?? throw new Exception(
                    "Invalid server response"
                );
        }







        private async Task UploadChunksAsync(
            string filePath,
            string uploadId,
            CancellationToken token)
        {
            var settings =
                _settingsService.Get();


            await using var stream =
                new FileStream(
                    filePath,
                    FileMode.Open,
                    FileAccess.Read,
                    FileShare.Read,
                    ChunkSize,
                    true
                );


            byte[] buffer =
                new byte[ChunkSize];


            int index = 0;


            while(true)
            {
                int bytesRead =
                    await stream.ReadAsync(
                        buffer,
                        token
                    );


                if(bytesRead == 0)
                    break;


                using var content =
                    new ByteArrayContent(
                        buffer,
                        0,
                        bytesRead
                    );


                content.Headers.ContentType =
                    new MediaTypeHeaderValue(
                        "application/octet-stream"
                    );


                var request =
                    new HttpRequestMessage(
                        HttpMethod.Put,
                        $"{settings.ServerUrl}/api/uploads/{uploadId}/chunk"
                    );


                request.Headers.Authorization =
                    new AuthenticationHeaderValue(
                        "Bearer",
                        settings.ServerKey
                    );


                request.Headers.Add(
                    "X-Chunk-Index",
                    index.ToString()
                );


                request.Content = content;


                var response =
                    await _httpClient.SendAsync(
                        request,
                        token
                    );


                response.EnsureSuccessStatusCode();


                _logger.LogInformation(
                    "Uploaded chunk {Chunk}",
                    index
                );


                index++;
            }
        }







        private async Task FinishUploadAsync(
            string uploadId,
            string fingerprint,
            CancellationToken token)
        {
            var settings =
                _settingsService.Get();


            var request =
                new HttpRequestMessage(
                    HttpMethod.Post,
                    $"{settings.ServerUrl}/api/uploads/{uploadId}/finish"
                );


            request.Headers.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    settings.ServerKey
                );


            request.Content =
                JsonContent.Create(
                    new
                    {
                        fingerprint
                    }
                );


            var response =
                await _httpClient.SendAsync(
                    request,
                    token
                );


            response.EnsureSuccessStatusCode();
        }
    }
}

/*
 * TODO: UploadService improvements
 *
 * Upload reliability:
 * - Add resumable uploads:
 *      - Query server for already received chunks
 *      - Skip chunks that already exist
 *      - Resume interrupted uploads
 *
 * - Add chunk retry logic:
 *      - Retry failed chunk uploads
 *      - Exponential backoff
 *      - Handle temporary network failures
 *
 * - Add upload cancellation cleanup:
 *      - Notify server when user cancels
 *      - Delete abandoned upload sessions after cancellation
 *
 *
 * Progress reporting:
 * - Add upload progress callbacks/events:
 *      - Current bytes uploaded
 *      - Total bytes
 *      - Percentage complete
 *      - Current chunk
 *
 *
 * Performance:
 * - Allow configurable chunk size
 * - Consider parallel chunk uploads
 * - Limit upload bandwidth if needed
 *
 *
 * Validation:
 * - Add client-side chunk hashing
 * - Send final file hash/fingerprint verification
 * - Verify server accepted complete upload
 *
 *
 * User experience:
 * - Store upload state locally
 * - Resume uploads after application restart
 * - Show upload status in UI
 *
 *
 * Security:
 * - Handle expired server keys
 * - Handle unauthorized responses cleanly
 * - Validate server responses
 *
 *
 * Server protocol dependencies:
 * - Requires:
 *      POST /api/uploads/begin
 *      PUT  /api/uploads/{id}/chunk
 *      GET  /api/uploads/{id}
 *      POST /api/uploads/{id}/finish
 */