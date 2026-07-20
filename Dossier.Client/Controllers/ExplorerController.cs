using Microsoft.AspNetCore.Mvc;
using Dossier.Client.Models;
using Dossier.Client.Services;

namespace Dossier.Client.Controllers;


[ApiController]
[Route("api/explorer")]
public class ExplorerController : ControllerBase
{

    private readonly ExplorerService _explorer;


    public ExplorerController(ExplorerService explorer)
    {
        _explorer = explorer;
    }



    [HttpGet("tree")]
    public async Task<ActionResult<List<ExplorerNode>>> GetTree()
    {
        var tree = await _explorer.GetTree();

        return Ok(tree);
    }

}