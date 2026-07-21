using System.Reflection;
using Microsoft.AspNetCore.Mvc;

namespace Dossier.Client.Controllers;

[ApiController]
[Route("api/info")]
public class InfoController : ControllerBase
{
    [HttpGet("version")]
    public IActionResult Version()
    {
        var version =
            Assembly
                .GetEntryAssembly()!
                .GetName()
                .Version!
                .ToString(3);

        return Ok(new
        {
            version
        });
    }
}