using Dossier.Engine.Services;
using Dossier.Engine.Runtime;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient();

builder.Services.AddSingleton<ClientStateService>();
builder.Services.AddSingleton<ExplorerService>();

builder.Services.AddSingleton<SettingsService>();

builder.Services.AddSingleton<DatabaseService>();
builder.Services.AddSingleton<FingerprintService>();
builder.Services.AddSingleton<UploadService>();

builder.Services.AddSingleton<ClientEngine>();


builder.Services.AddHostedService<EngineBackgroundService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("DossierPolicy", policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:8000"
            );
    });
});
builder.Services.AddControllers();

var app = builder.Build();

var url = app.Urls.FirstOrDefault();

app.UseCors("DossierPolicy");

app.MapControllers();
app.Run(url);