using Microsoft.AspNetCore.Mvc;

namespace Dossier.Engine.Controllers;


[ApiController]
[Route("api/video")]
public class VideoController : ControllerBase
{

    [HttpGet]
    public IActionResult Get([FromQuery] string path)
    {

        if (string.IsNullOrWhiteSpace(path))
            return BadRequest("Path is required");


        if (!System.IO.File.Exists(path))
            return NotFound(path);



        var extension =
            Path.GetExtension(path)
            .ToLowerInvariant();



        var contentType = extension switch
        {
            ".mp4" => "video/mp4",
            ".webm" => "video/webm",
            ".ogg" => "video/ogg",
            ".mov" => "video/quicktime",
            ".mkv" => "video/x-matroska",
            _ => "application/octet-stream"
        };



        return PhysicalFile(
            path,
            contentType,
            enableRangeProcessing: true
        );

    }

}