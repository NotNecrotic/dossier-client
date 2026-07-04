using Dossier.Engine.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<SettingsService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("DossierPolicy", policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .WithOrigins(
                "http://localhost:5187",
                "http://127.0.0.1:5187",
                "http://localhost:8000"
            );
    });
});

builder.Services.AddControllers();

var app = builder.Build();

var url = app.Urls.FirstOrDefault();

app.UseCors("DossierPolicy");

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