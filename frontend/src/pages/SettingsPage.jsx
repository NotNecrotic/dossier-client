import TitleBar from "@/components/layout/TitleBar";
import SettingsView from "@/components/settings/SettingsView";

const SettingsPage = () => (
  <div className="flex h-screen w-screen flex-col bg-app">
    <TitleBar />
    <div className="flex-1 overflow-y-auto">
      <SettingsView />
    </div>
  </div>
);

export default SettingsPage;
