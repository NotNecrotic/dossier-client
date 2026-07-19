namespace Dossier.Client.Models;

public class ExplorerNode
{
    public string Id { get; set; } = "";
    
    public string Name { get; set; } = "";

    public string Path { get; set; } = "";

    public string Type { get; set; } = ""; 
    // folder | file

    public string? ParentId { get; set; }


    public string? Status { get; set; }
    // indexed | processing | unindexed


    public long? Size { get; set; }

    public DateTime Modified { get; set; }
}