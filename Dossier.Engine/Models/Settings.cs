namespace Dossier.Engine.Models;

public class Settings
{
    public string ServerUrl { get; set; } = "";

    public string WatchFolder { get; set; } = "";

    public bool StartOnBoot { get; set; } = false;

    public bool StartMinimized { get; set; } = false;

    public int UploadLimitMbps { get; set; } = 0;

    public int CpuLimitPercent { get; set; } = 50;

    public int FrameSamplingInterval { get; set; } = 5;

    public string Theme { get; set; } = "dark";
}