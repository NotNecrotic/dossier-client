using Microsoft.UI.Xaml;
using Dossier.Client.Core.State;

namespace Dossier.App
{
    public sealed partial class MainWindow : Window
    {
        public AppHost ViewModel { get; private set; }

        public MainWindow()
        {
            this.InitializeComponent();

            ViewModel = new AppHost();
        }
    }
}