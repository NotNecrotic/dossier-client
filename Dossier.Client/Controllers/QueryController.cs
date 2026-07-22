using System.Net.Http.Headers;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Dossier.Client.Services;

namespace Dossier.Client.Controllers;

[ApiController]
[Route("api/query")]
public class QueryController : ControllerBase
{
    private readonly HttpClient _httpClient;
    private readonly SettingsService _settings;

    public QueryController(
        HttpClient httpClient,
        SettingsService settings)
    {
        _httpClient = httpClient;
        _settings = settings;
    }

    [HttpPost]
    public async Task<IActionResult> Query(
        [FromBody] QueryRequest request)
    {
        var settings = _settings.Get();

        var serverRequest = new
        {
            question = request.Question,
            video_uuid = request.VideoUuid
        };

        var json =
            System.Text.Json.JsonSerializer.Serialize(
                serverRequest
            );

        var message = new HttpRequestMessage(
            HttpMethod.Post,
            $"{settings.ServerUrl}/api/query"
        );

        message.Content = new StringContent(
            json,
            Encoding.UTF8,
            "application/json"
        );

        message.Headers.Authorization =
            new AuthenticationHeaderValue(
                "Bearer",
                settings.ServerKey
            );

        var response =
            await _httpClient.SendAsync(message);

        var body =
            await response.Content.ReadAsStringAsync();

        return Content(
            body,
            "application/json"
        );
    }
}

public class QueryRequest
{
    public string Question { get; set; } = "";
    public string? VideoUuid { get; set; }
}