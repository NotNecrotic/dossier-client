using Microsoft.Extensions.Hosting;
using Dossier.Engine.Runtime;

public class EngineBackgroundService : BackgroundService
{
    private readonly ClientEngine _engine;

    public EngineBackgroundService(ClientEngine engine)
    {
        _engine = engine;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _engine.Start();
        await Task.Delay(Timeout.Infinite, stoppingToken);
    }
}