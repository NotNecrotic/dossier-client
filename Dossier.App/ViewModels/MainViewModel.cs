using System.Collections.ObjectModel;
using Dossier.Client.Core.State;

namespace Dossier.App.ViewModels
{
    public class MainViewModel : ViewModelBase
    {
        public AppState State { get; }

        public MainViewModel(AppState state)
        {
            State = state;
        }

        // SETTINGS BINDINGS
        private string _serverUrl = "";
        public string ServerUrl
        {
            get => _serverUrl;
            set => Set(ref _serverUrl, value);
        }

        private string _apiKey = "";
        public string ApiKey
        {
            get => _apiKey;
            set => Set(ref _apiKey, value);
        }

        private string _connectionStatus = "Disconnected";
        public string ConnectionStatus
        {
            get => _connectionStatus;
            set => Set(ref _connectionStatus, value);
        }

        public ObservableCollection<string> Folders { get; } = new();

        // Proxy bindings to AppState (IMPORTANT)
        public ObservableCollection<JobViewModel> Videos => State.Jobs;
        public ObservableCollection<string> Logs => State.Logs;
    }
}