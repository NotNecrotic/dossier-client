using Microsoft.AspNetCore.Mvc;
using Dossier.Client.Models;
using Dossier.Client.Services;

namespace Dossier.Client.Controllers;

[ApiController]
[Route("api/settings")]
public class SettingsController : ControllerBase
{
    private readonly SettingsService _settings;

    public SettingsController(SettingsService settings)
    {
        _settings = settings;
    }

    [HttpGet]
    public ActionResult<Settings> Get()
    {
        return Ok(_settings.Get());
    }

    [HttpPut]
    public IActionResult Update([FromBody] Settings settings)
    {
        _settings.Save(settings);

        return Ok(new
        {
            success = true
        });
    }
}