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

        // Computed property: user-friendly state display
        public string StateDisplay => State switch
        {
            JobState.Created => "Idle",
            JobState.Fingerprinting => "Fingerprinting",
            JobState.Fingerprinted => "Fingerprinted",
            JobState.Preprocessing => "Preprocessing",
            JobState.Preprocessed => "Preprocessed",
            JobState.AwaitingUpload => "Awaiting Upload",
            JobState.Uploading => "Uploading",
            JobState.Uploaded => "Uploaded",
            JobState.Completed => "Completed",
            JobState.Failed => "Failed",
            _ => "Unknown"
        };

        // Computed property: status color code for UI (hex string)
        public string StatusColorHex => State switch
        {
            JobState.Created => "#FF9E9E9E",                // Gray
            JobState.Fingerprinting => "#FF42A5F5",         // Blue
            JobState.Fingerprinted => "#FF9C27B0",          // Purple
            JobState.Preprocessing => "#FF9C27B0",          // Purple
            JobState.Preprocessed => "#FF9C27B0",           // Purple
            JobState.AwaitingUpload => "#FFFF9800",         // Orange
            JobState.Uploading => "#FFFF9800",              // Orange
            JobState.Uploaded => "#FF51CF66",               // Green
            JobState.Completed => "#FF51CF66",              // Green
            JobState.Failed => "#FFFF6B6B",                 // Red
            _ => "#FF9E9E9E"                                // Gray
        };

        // Helper property for processing state
        public bool IsProcessing => State is JobState.Fingerprinting or JobState.Preprocessing or JobState.Uploading;

        // Helper property for error display
        public bool HasError => State == JobState.Failed && !string.IsNullOrWhiteSpace(Error);
    }
}