namespace Dossier.Core.Jobs;
using Dossier.Core.Enums;

public class ProcessingJob
{
    public Guid JobId { get; set; } = Guid.NewGuid();

    public string Fingerprint { get; set; } = string.Empty;

    public string FilePath { get; set; } = string.Empty;

    public JobState State { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}