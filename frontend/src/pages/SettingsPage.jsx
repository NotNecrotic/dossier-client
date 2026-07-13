import TitleBar from "@/components/layout/TitleBar";
import AmbientGlow from "@/components/layout/AmbientGlow";
import SettingsView from "@/components/settings/SettingsView";

const SettingsPage = () => (
  <div className="relative flex h-screen w-screen flex-col bg-app">
    <AmbientGlow />
    <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
      <TitleBar />
      <div className="flex-1 overflow-y-auto">
        <SettingsView />
      </div>
    </div>
  </div>
);

export default SettingsPage;
