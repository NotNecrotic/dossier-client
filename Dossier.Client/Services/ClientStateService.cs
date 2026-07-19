using System.Text.Json;
using Dossier.Client.Models;

namespace Dossier.Client.Services;

public class ClientStateService
{
    private readonly string _clientStateDirectory;
    private readonly string _clientStateFile;

    private ClientState _clientState = new();

    public ClientStateService()
    {
        _clientStateDirectory = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "Dossier");

        _clientStateFile = Path.Combine(_clientStateDirectory, "clientState.json");

        Directory.CreateDirectory(_clientStateDirectory);

        Load();
    }

    public ClientState Get()
    {
        return _clientState;
    }

    public void Save(ClientState clientState)
    {
        _clientState = clientState;

        var json = JsonSerializer.Serialize(
            _clientState,
            new JsonSerializerOptions
            {
                WriteIndented = true
            });

        File.WriteAllText(_clientStateFile, json);
    }

    private void Load()
    {
        if (!File.Exists(_clientStateFile))
        {
            Save(new ClientState());
            return;
        }

        try
        {
            var json = File.ReadAllText(_clientStateFile);

            _clientState =
                JsonSerializer.Deserialize<ClientState>(json)
                ?? new ClientState();
        }
        catch
        {
            _clientState = new ClientState();
            Save(_clientState);
        }
    }
}