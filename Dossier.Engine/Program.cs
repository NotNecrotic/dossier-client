using Dossier.Engine.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<SettingsService>();

builder.Services.AddControllers();

var app = builder.Build();

app.MapControllers();

app.MapGet("/status", () =>
{
    return Results.Ok(new
    {
        status = "running",
        time = DateTime.UtcNow
    });
});

app.Run("http://127.0.0.1:5127");