using Dossier.Engine.Models;

namespace Dossier.Engine.Services;


public class ExplorerService
{

    private readonly SettingsService _settingsService;


    public ExplorerService(SettingsService settingsService)
    {
        _settingsService = settingsService;
    }



    public List<ExplorerNode> GetTree()
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


        return result;

    }





    private void ScanDirectory(
        string path,
        string? parentId,
        List<ExplorerNode> output
    )
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

                Status = GetStatus(file),

                Size = new FileInfo(file).Length,

                Modified = File.GetLastWriteTime(file)

            });

        }

    }





    private string GetStatus(string file)
    {
        // TODO:
        // lookup indexed state from database

        return "unindexed";
    }

}