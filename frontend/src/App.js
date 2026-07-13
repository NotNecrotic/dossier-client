import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { StoreProvider, useStore } from "@/lib/store";
import WorkspacePage from "@/pages/WorkspacePage";
import SettingsPage from "@/pages/SettingsPage";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import EngineOfflineOverlay from "@/components/layout/EngineOfflineOverlay";

const Shell = () => {
  const { settings, engineStatus } = useStore();

  if (engineStatus === "checking" && !settings) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-app">
        <div className="flex items-center gap-3 text-2nd">
          <span className="h-2 w-2 rounded-full accent-bg dossier-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest">
            Connecting to Dossier engine…
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      {engineStatus === "offline" && <EngineOfflineOverlay />}
      <Routes>
        <Route path="/" element={<WorkspacePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {settings && !settings.onboarding_complete && engineStatus === "online" && (
        <OnboardingModal />
      )}
      <Toaster position="bottom-right" theme="dark" />
    </>
  );
};

function App() {
  return (
    <div className="App">
      <StoreProvider>
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </StoreProvider>
    </div>
  );
}

export default App;
