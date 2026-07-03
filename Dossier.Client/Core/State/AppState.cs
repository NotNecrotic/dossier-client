using System.Collections.Generic;
using System.Collections.ObjectModel;
using Dossier.Core.Jobs;

namespace Dossier.Client.Core.State
{
    public class AppState
    {
        // Live job list (UI binds to this)
        public ObservableCollection<JobViewModel> Jobs { get; } = new();

        // Simple log stream for debug panel
        public ObservableCollection<string> Logs { get; } = new();

        public void AddLog(string message)
        {
            Logs.Add(message);
        }

        public void UpsertJob(JobViewModel job)
        {
            var existing = Find(job.FilePath);

            if (existing == null)
            {
                Jobs.Add(job);
            }
            else
            {
                existing.State = job.State;
                existing.Error = job.Error;
            }
        }

        private JobViewModel? Find(string filePath)
        {
            foreach (var job in Jobs)
            {
                if (job.FilePath == filePath)
                    return job;
            }

            return null;
        }
    }
}