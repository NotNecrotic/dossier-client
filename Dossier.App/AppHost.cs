using Dossier.Client.Core.State;
using Dossier.Client.Runtime;

namespace Dossier.App
{
    public class AppHost
    {
        public AppState State { get; private set; }
        public ClientEngine Engine { get; private set; }

        public AppHost()
        {
            State = new AppState();
            Engine = new ClientEngine();
        }
    }
}