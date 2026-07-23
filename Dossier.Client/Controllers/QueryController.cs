using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Dossier.Client.Services;

namespace Dossier.Client.Controllers;

[ApiController]
[Route("api/query")]
public class QueryController : ControllerBase
{
    private readonly HttpClient _httpClient;
    private readonly SettingsService _settings;
    private readonly DatabaseService _database;


    public QueryController(
        HttpClient httpClient,
        SettingsService settings,
        DatabaseService database)
    {
        _httpClient = httpClient;
        _settings = settings;
        _database = database;
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
            JsonSerializer.Serialize(serverRequest);


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


        if (!response.IsSuccessStatusCode)
        {
            return StatusCode(
                (int)response.StatusCode,
                body
            );
        }


        var responseObject =
            JsonSerializer.Deserialize<QueryResponse>(
                body,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }
            );


        if (responseObject == null)
        {
            return BadRequest(
                "Invalid query response"
            );
        }


        foreach (var point in responseObject.Keypoints)
        {
            point.FilePath =
                _database.GetPathByFingerprint(
                    point.Fingerprint
                );
        }


        return Ok(responseObject);
    }
}



public class QueryRequest
{
    public string Question { get; set; } = "";

    public string? VideoUuid { get; set; }
}



public class QueryResponse
{
    public string Answer { get; set; } = "";

    public List<QueryKeypoint> Keypoints { get; set; } = [];
}



public class QueryKeypoint
{
    public string Fingerprint { get; set; } = "";

    public double Start { get; set; }

    public double End { get; set; }

    public string Text { get; set; } = "";

    public string Reason { get; set; } = "";

    public string? FilePath { get; set; }
}