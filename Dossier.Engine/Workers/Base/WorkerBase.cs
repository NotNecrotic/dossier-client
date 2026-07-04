using System;
using System.Threading;
using System.Threading.Tasks;

namespace Dossier.Engine.Workers.Base
{
    public abstract class WorkerBase
    {
        private CancellationTokenSource? _cts;
        private Task? _workerTask;

        public bool IsRunning { get; private set; }

        /// <summary>
        /// Start the worker loop.
        /// </summary>
        public void Start()
        {
            if (IsRunning)
                return;

            _cts = new CancellationTokenSource();
            IsRunning = true;

            _workerTask = Task.Run(() => RunAsync(_cts.Token));
        }

        /// <summary>
        /// Request the worker to stop gracefully.
        /// </summary>
        public async Task StopAsync()
        {
            if (!IsRunning)
                return;

            _cts?.Cancel();

            if (_workerTask != null)
                await _workerTask;

            IsRunning = false;
        }

        /// <summary>
        /// Main worker loop (shared for all workers).
        /// </summary>
        private async Task RunAsync(CancellationToken token)
        {
            OnStarted();

            try
            {
                while (!token.IsCancellationRequested)
                {
                    try
                    {
                        var jobFound = await TryProcessNextJobAsync(token);

                        // If no work was found, avoid CPU spinning
                        if (!jobFound)
                        {
                            await Task.Delay(500, token); // idle throttle
                        }
                    }
                    catch (OperationCanceledException)
                    {
                        // Normal shutdown
                        break;
                    }
                    catch (Exception ex)
                    {
                        OnError(ex);

                        // Small delay to prevent tight error loops
                        await Task.Delay(1000, token);
                    }
                }
            }
            finally
            {
                OnStopped();
                IsRunning = false;
            }
        }

        /// <summary>
        /// Each worker must implement how it processes ONE job type.
        /// Return true if a job was processed, false if idle.
        /// </summary>
        protected abstract Task<bool> TryProcessNextJobAsync(CancellationToken token);

        /// <summary>
        /// Optional lifecycle hooks
        /// </summary>
        protected virtual void OnStarted() { }

        protected virtual void OnStopped() { }

        protected virtual void OnError(Exception exception)
        {
            // Default: do nothing (we will plug logging later)
        }
    }
}