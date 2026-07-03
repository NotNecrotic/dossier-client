using Dossier.Core.Enums;

namespace Dossier.Client.Core.State
{
    public class JobViewModel
    {
        public string FilePath { get; set; } = "";

        public string FileName { get; set; } = "";

        public JobState State { get; set; }

        public string? Error { get; set; }

        public double Progress { get; set; }
    }
}