namespace Dossier.Engine.Models;
using Dossier.Engine.Enums;

public class Video
{
    public string Fingerprint { get; set; } = string.Empty;
    public string? ServerUuid { get; set; }

    public string FilePath { get; set; } = string.Empty;

    public long SizeBytes { get; set; }

    public TimeSpan Duration { get; set; }

    public VideoState State { get; set; }
}