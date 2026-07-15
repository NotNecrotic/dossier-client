using Microsoft.AspNetCore.Mvc;
using Dossier.Engine.Models;
using Dossier.Engine.Services;

namespace Dossier.Engine.Controllers;

[ApiController]
[Route("api/state")]
public class ClientStateController : ControllerBase
{
    private readonly ClientStateService _clientState;

    public ClientStateController(ClientStateService clientState)
    {
        _clientState = clientState;
    }

    [HttpGet]
    public ActionResult<ClientState> Get()
    {
        return Ok(_clientState.Get());
    }

    [HttpPut]
    public IActionResult Update([FromBody] ClientState clientState)
    {
        _clientState.Save(clientState);

        return Ok(new
        {
            success = true
        });
    }
}