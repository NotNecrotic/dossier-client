namespace Dossier.Engine.Manifest;

public class VideoManifest
{
    public string Fingerprint { get; set; } = string.Empty;

    public long SizeBytes { get; set; }

    public TimeSpan Duration { get; set; }

    public string AudioPath { get; set; } = string.Empty;

    public List<string> FramePaths { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}