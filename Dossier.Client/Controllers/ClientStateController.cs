using Microsoft.AspNetCore.Mvc;
using Dossier.Client.Models;
using Dossier.Client.Services;

namespace Dossier.Client.Controllers;

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