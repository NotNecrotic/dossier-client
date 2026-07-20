using System.Net.Http.Json;
using Dossier.Client.Models;

namespace Dossier.Client.Services;


public class ExplorerService
{
    private readonly SettingsService _settingsService;
    private readonly DatabaseService _databaseService;
    private readonly HttpClient _httpClient;


    public ExplorerService(
        SettingsService settingsService,
        DatabaseService databaseService,
        HttpClient httpClient)
    {
        _settingsService = settingsService;
        _databaseService = databaseService;
        _httpClient = httpClient;
    }


    public async Task<List<ExplorerNode>> GetTree()
    {
        var settings = _settingsService.Get();

        var root = settings.WatchFolder;


        if (string.IsNullOrEmpty(root))
            throw new Exception("WatchFolder not configured");


        if (!Directory.Exists(root))
            throw new Exception($"WatchFolder does not exist: {root}");


        var result = new List<ExplorerNode>();


        ScanDirectory(
            root,
            null,
            result
        );


        await UpdateStatuses(result);


        return result;
    }




    private void ScanDirectory(
        string path,
        string? parentId,
        List<ExplorerNode> output)
    {
        var id = Guid.NewGuid().ToString();


        output.Add(new ExplorerNode
        {
            Id = id,
            Name = Path.GetFileName(path),
            Type = "folder",
            ParentId = parentId
        });



        foreach (var directory in Directory.GetDirectories(path))
        {
            ScanDirectory(
                directory,
                id,
                output
            );
        }



        foreach (var file in Directory.GetFiles(path))
        {
            output.Add(new ExplorerNode
            {
                Id = Guid.NewGuid().ToString(),

                Name = Path.GetFileName(file),

                Path = Path.GetFullPath(file),

                Type = "file",

                ParentId = id,

                Status = "unknown",

                Size = new FileInfo(file).Length,

                Modified = File.GetLastWriteTime(file)
            });
        }
    }




    private async Task UpdateStatuses(
        List<ExplorerNode> nodes)
    {
        var files =
            nodes
            .Where(x => x.Type == "file" && x.Path != null)
            .ToList();


        var fingerprints =
            _databaseService.GetFingerprints(
                files.Select(x => x.Path!).ToList()
            );


        var fingerprintList =
            fingerprints.Values
            .Where(x => x != null)
            .ToList();


        if (fingerprintList.Count == 0)
        {
            return;
        }


        try
        {
            var settings =
                _settingsService.Get();


            var url =
                $"{settings.ServerUrl}/videos/status";


            var response =
                await _httpClient.PostAsJsonAsync(
                    url,
                    new
                    {
                        fingerprints = fingerprintList
                    }
                );


            if (!response.IsSuccessStatusCode)
            {
                SetUnknown(files);
                return;
            }


            var statuses =
                await response.Content
                .ReadFromJsonAsync<Dictionary<string, string>>();


            if (statuses == null)
            {
                SetUnknown(files);
                return;
            }


            foreach (var file in files)
            {
                if (
                    fingerprints.TryGetValue(
                        file.Path!,
                        out var fingerprint
                    )
                    &&
                    fingerprint != null
                    &&
                    statuses.TryGetValue(
                        fingerprint,
                        out var status
                    )
                )
                {
                    file.Status = status;
                }
                else
                {
                    file.Status = "unindexed";
                }
            }
        }
        catch
        {
            SetUnknown(files);
        }
    }



    private void SetUnknown(
        List<ExplorerNode> files)
    {
        foreach (var file in files)
        {
            file.Status = "unknown";
        }
    }
}