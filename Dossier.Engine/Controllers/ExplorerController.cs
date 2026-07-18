using Microsoft.AspNetCore.Mvc;
using Dossier.Engine.Models;
using Dossier.Engine.Services;

namespace Dossier.Engine.Controllers;


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
    public ActionResult<List<ExplorerNode>> GetTree()
    {
        return Ok(_explorer.GetTree());
    }

}