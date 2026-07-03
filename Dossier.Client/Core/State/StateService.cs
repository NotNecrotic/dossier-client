using Dossier.Core.Jobs;
using Dossier.Core.Enums;

namespace Dossier.Client.Core.State
{
    public class StateService
    {
        private readonly AppState _state;

        public StateService(AppState state)
        {
            _state = state;
        }

        public void UpdateJob(ProcessingJob job)
        {
            var vm = new JobViewModel
            {
                FilePath = job.FilePath,
                FileName = System.IO.Path.GetFileName(job.FilePath),
                State = job.State,
                Error = job.State == JobState.Failed ? "Processing failed" : null
            };

            _state.UpsertJob(vm);
        }

        public void Log(string message)
        {
            _state.AddLog(message);
        }
    }
}