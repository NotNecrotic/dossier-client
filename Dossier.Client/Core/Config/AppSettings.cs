namespace Dossier.Client.Core.Config
{
    public class AppSettings
    {
        public string[] WatchedFolders { get; set; } = new string[0];

        public string ServerUrl { get; set; } = "";

        public string ApiKey { get; set; } = "";
    }
}