namespace Dossier.Client.Models;

public class UpdateInfo
{
    public bool UpdateAvailable { get; set; }

    public string CurrentVersion { get; set; } = "";

    public string LatestVersion { get; set; } = "";

    public string? DownloadUrl { get; set; }

    public string? ReleaseNotes { get; set; }
}