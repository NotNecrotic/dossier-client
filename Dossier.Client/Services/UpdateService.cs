using System.Reflection;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Dossier.Client.Models;

namespace Dossier.Client.Services;

public class UpdateService
{
    private readonly HttpClient _httpClient;

    public UpdateService(HttpClient httpClient)
    {
        _httpClient = httpClient;

        _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd(
            "Dossier"
        );
    }

    public async Task<UpdateInfo> CheckForUpdates()
    {
        var currentVersion =
            Assembly
                .GetEntryAssembly()!
                .GetName()
                .Version!
                .ToString(3);


        var response = await _httpClient.GetAsync(
            "https://api.github.com/repos/NotNecrotic/dossier-client/releases/latest"
        );


        // No releases published yet
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return new UpdateInfo
            {
                CurrentVersion = currentVersion,
                LatestVersion = currentVersion,
                UpdateAvailable = false,
                DownloadUrl = null,
                ReleaseNotes = "No releases available."
            };
        }


        response.EnsureSuccessStatusCode();


        var release =
            await response.Content.ReadFromJsonAsync<GithubRelease>();


        if (release == null)
            throw new Exception("Unable to fetch release.");


        var latest =
            release.TagName.TrimStart('v');


        return new UpdateInfo
        {
            CurrentVersion = currentVersion,

            LatestVersion = latest,

            UpdateAvailable =
                new Version(latest) >
                new Version(currentVersion),

            DownloadUrl = release.HtmlUrl,

            ReleaseNotes = release.Body
        };
    }

    public async Task InstallUpdate()
    {
        //
        // We'll implement this next.
        //
    }

    private class GithubRelease
    {
        [JsonPropertyName("tag_name")]
        public string TagName { get; set; } = "";

        [JsonPropertyName("html_url")]
        public string HtmlUrl { get; set; } = "";

        [JsonPropertyName("body")]
        public string Body { get; set; } = "";
    }
}