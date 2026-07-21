using Microsoft.AspNetCore.Mvc;
using Dossier.Client.Services;

namespace Dossier.Client.Controllers;

[ApiController]
[Route("api/update")]
public class UpdateController : ControllerBase
{
    private readonly UpdateService _updateService;

    public UpdateController(UpdateService updateService)
    {
        _updateService = updateService;
    }

    [HttpGet("check")]
    public async Task<IActionResult> Check()
    {
        return Ok(
            await _updateService.CheckForUpdates()
        );
    }

    [HttpPost("install")]
    public async Task<IActionResult> Install()
    {
        await _updateService.InstallUpdate();

        return Ok();
    }
}