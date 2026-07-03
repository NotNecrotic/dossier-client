using Microsoft.UI.Xaml;
using Dossier.App.ViewModels;
using Dossier.Client.Core.State;

namespace Dossier.App
{
    public sealed partial class MainWindow : Window
    {
        public MainViewModel ViewModel { get; }

        public MainWindow()
        {
            this.InitializeComponent();

            var state = new AppState();

            ViewModel = new MainViewModel(state);
        }
    }
}