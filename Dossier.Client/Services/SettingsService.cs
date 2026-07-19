using System.Text.Json;
using Dossier.Client.Models;

namespace Dossier.Client.Services;

public class SettingsService
{
    private readonly string _settingsDirectory;
    private readonly string _settingsFile;

    private Settings _settings = new();

    public SettingsService()
    {
        _settingsDirectory = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "Dossier");

        _settingsFile = Path.Combine(_settingsDirectory, "settings.json");

        Directory.CreateDirectory(_settingsDirectory);

        Load();
    }

    public Settings Get()
    {
        return _settings;
    }

    public void Save(Settings settings)
    {
        _settings = settings;

        var json = JsonSerializer.Serialize(
            _settings,
            new JsonSerializerOptions
            {
                WriteIndented = true
            });

        File.WriteAllText(_settingsFile, json);
    }

    private void Load()
    {
        if (!File.Exists(_settingsFile))
        {
            Save(new Settings());
            return;
        }

        try
        {
            var json = File.ReadAllText(_settingsFile);

            _settings =
                JsonSerializer.Deserialize<Settings>(json)
                ?? new Settings();
        }
        catch
        {
            _settings = new Settings();
            Save(_settings);
        }
    }
}