using Dossier.Engine.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<SettingsService>();

builder.Services.AddControllers();

var app = builder.Build();

var url = app.Urls.FirstOrDefault();

app.MapControllers();

app.MapGet("/status", () =>
{
    return Results.Ok(new
    {
        status = "running",
        time = DateTime.UtcNow
    });
});

app.Run(url);