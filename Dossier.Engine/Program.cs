var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.MapGet("/status", () =>
{
    return Results.Ok(new
    {
        status = "running",
        time = DateTime.UtcNow
    });
});

app.Run("http://127.0.0.1:5127");