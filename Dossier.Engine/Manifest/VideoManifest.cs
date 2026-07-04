namespace Dossier.Engine.Manifest;

public class VideoManifest
{
    public string ManifestVersion { get; set; } = "0.1";
    public string Fingerprint { get; set; } = string.Empty;

    public long SizeBytes { get; set; }
    
    public List<string> AudioPaths { get; set; } = new();
    public string ProxyPath { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}