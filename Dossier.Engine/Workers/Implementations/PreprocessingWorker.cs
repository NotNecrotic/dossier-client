using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using System.Text;
using System.Diagnostics;
using Dossier.Engine.Workers.Base;
using Dossier.Engine.Queues;
using Dossier.Engine.Jobs;
using Dossier.Engine.Enums;
using Dossier.Engine.Manifest;
using Dossier.Engine.Services;

namespace Dossier.Engine.Workers.Implementations
{
    public class PreprocessingWorker : WorkerBase
    {
        private readonly JobQueue _jobQueue;
        private readonly SettingsService _settingsService;

        public PreprocessingWorker(JobQueue jobQueue, SettingsService settingsService)
        {
            _jobQueue = jobQueue;
            _settingsService = settingsService;
        }

        protected override Task<bool> TryProcessNextJobAsync(CancellationToken token)
        {
            if (!_jobQueue.TryDequeue(out ProcessingJob? job) || job == null)
                return Task.FromResult(false);

            if (job.State != JobState.Fingerprinted)
                return Task.FromResult(false);

            ProcessVideo(job, token);

            return Task.FromResult(true);
        }

        private void ProcessVideo(ProcessingJob job, CancellationToken token)
        {
            try
            {
                job.State = JobState.Preprocessing;

                //var tempFolder = Path.Combine(Path.GetTempPath(), "Dossier", job.Fingerprint);
                var tempFolder = Path.Combine(@"C:\DossierTest", job.Fingerprint);
                Directory.CreateDirectory(tempFolder);

                var audioPaths = ExtractAudio(job.FilePath, tempFolder, token);
                var proxyPath = GenerateVideoProxy(job.FilePath, tempFolder, token);

                var manifest = new VideoManifest
                {
                    Fingerprint = job.Fingerprint,
                    SizeBytes = new FileInfo(job.FilePath).Length,
                    AudioPaths = audioPaths,
                    ProxyPath = proxyPath,
                };

                SaveManifest(manifest, tempFolder);

                job.State = JobState.Preprocessed;
            }
            catch (Exception ex)
            {
                job.State = JobState.Failed;
                OnError(ex);
            }
        }

        private List<string> ExtractAudio(string videoPath, string outputFolder, CancellationToken token)
        {
            var extractedFiles = new List<string>();
            var ffmpegPath = Path.Combine(AppContext.BaseDirectory, "ffmpeg.exe");
            if (!File.Exists(ffmpegPath))
                throw new FileNotFoundException("ffmpeg.exe missing from application directory.");
            var ffprobePath = Path.Combine(AppContext.BaseDirectory, "ffprobe.exe");
            if (!File.Exists(ffprobePath))
                throw new FileNotFoundException("ffprobe.exe missing from application directory.");

            var probeArgs = $"-v error -show_entries stream=index -select_streams a -of csv=p=0 \"{videoPath}\"";
            
            var probeInfo = new ProcessStartInfo
            {
                FileName = ffprobePath,
                Arguments = probeArgs,
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            string[] streamIndexes;
            using (var probeProcess = Process.Start(probeInfo))
            {
                var output = probeProcess?.StandardOutput.ReadToEnd() ?? string.Empty;
                probeProcess?.WaitForExit();
                streamIndexes = output.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
            }

            foreach (var index in streamIndexes)
            {
                var output = Path.Combine(outputFolder, $"audio_stream_{index}.opus");
                
                var args = $"-nostats -loglevel error -i \"{videoPath}\" -map 0:{index} -vn -ac 1 -ar 24000 -c:a libopus -b:a 32k -vbr off \"{output}\" -y";

                var startInfo = new ProcessStartInfo
                {
                    FileName = ffmpegPath,
                    Arguments = args,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using (var process = Process.Start(startInfo))
                {
                    if (process != null)
                    {
                        process.WaitForExit();
                        if (process.ExitCode != 0)
                        {
                            var error = process.StandardError.ReadToEnd();
                            throw new Exception($"FFmpeg failed on stream {index}: {error}");
                        }
                    }
                }
                extractedFiles.Add(output);
            }

            return extractedFiles;
        }

        private string GenerateVideoProxy(string videoPath, string outputFolder, CancellationToken token)
        {
            var ffmpegPath = Path.Combine(AppContext.BaseDirectory, "ffmpeg.exe");
            var proxyPath = Path.Combine(outputFolder, "proxy.mp4");

            var args = $"-nostats -loglevel verbose -i \"{videoPath}\" -vf \"fps=1,scale=1280:720\" -c:v libx264 -crf 28 -preset fast -an -movflags +faststart \"{proxyPath}\" -y";
            var startInfo = new ProcessStartInfo
            {
                FileName = ffmpegPath,
                Arguments = args,
                RedirectStandardOutput = false,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using (var process = new Process { StartInfo = startInfo })
            {
                var errorBuilder = new StringBuilder();
                process.ErrorDataReceived += (sender, e) => { if (e.Data != null) errorBuilder.AppendLine(e.Data); };

                process.Start();
                process.BeginErrorReadLine();

                while (!process.WaitForExit(200))
                {
                    if (token.IsCancellationRequested)
                    {
                        process.Kill(true);
                        token.ThrowIfCancellationRequested();
                    }
                }

                if (process.ExitCode != 0)
                    throw new Exception($"Proxy generation failed: {errorBuilder}");
            }

            return proxyPath;
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