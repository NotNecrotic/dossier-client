namespace Dossier.Client.Models;

public class Settings
{
    public string ServerUrl { get; set; } = "";

    public string ServerKey { get; set; } = "";

    public string WatchFolder { get; set; } = "";

    public bool StartOnBoot { get; set; } = false;

    public bool StartMinimized { get; set; } = false;

    public int CpuLimitPercent { get; set; } = 50;

    public string Theme { get; set; } = "dark";
    
    public string Accent { get; set; } = "blue";
}