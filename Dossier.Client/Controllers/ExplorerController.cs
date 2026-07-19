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
    public ActionResult<List<ExplorerNode>> GetTree()
    {
        return Ok(_explorer.GetTree());
    }

}