import { PanelsTopLeft, PanelRightOpen } from "lucide-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import TitleBar from "@/components/layout/TitleBar";
import ExplorerPanel from "@/components/layout/ExplorerPanel";
import MainPanel from "@/components/layout/MainPanel";
import AIPanel from "@/components/ai/AIPanel";
import { useStore } from "@/lib/store";

const CollapsedStrip = ({ side, label, onOpen, testId }) => (
  <button
    type="button"
    onClick={onOpen}
    data-testid={testId}
    className="flex h-full w-8 flex-col items-center justify-between border-r border-app bg-panel py-3 text-muted transition-fast hover:text-app"
    style={side === "right" ? { borderRight: "none", borderLeft: "1px solid var(--border)" } : {}}
  >
    {side === "left" ? <PanelsTopLeft className="h-3.5 w-3.5" /> : <PanelRightOpen className="h-3.5 w-3.5" />}
    <span
      className="font-mono text-[10px] uppercase tracking-widest"
      style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
    >
      {label}
    </span>
    <span className="opacity-0">·</span>
  </button>
);

const ResizeHandle = () => (
  <PanelResizeHandle className="group relative w-px bg-app transition-fast hover:accent-bg">
    <span className="absolute inset-y-0 -left-1 -right-1" />
  </PanelResizeHandle>
);

const WorkspacePage = () => {
  const { explorerOpen, aiOpen, setExplorerOpen, setAiOpen } = useStore();

  return (
    <div className="flex h-screen w-screen flex-col bg-app">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        {!explorerOpen && (
          <CollapsedStrip
            side="left"
            label="Explorer"
            onOpen={() => setExplorerOpen(true)}
            testId="explorer-open-strip"
          />
        )}

        <PanelGroup direction="horizontal" autoSaveId="dossier-panels">
          {explorerOpen && (
            <>
              <Panel defaultSize={20} minSize={14} maxSize={35} id="explorer">
                <ExplorerPanel />
              </Panel>
              <ResizeHandle />
            </>
          )}
          <Panel defaultSize={aiOpen ? 55 : 80} minSize={35} id="main">
            <MainPanel />
          </Panel>
          {aiOpen && (
            <>
              <ResizeHandle />
              <Panel defaultSize={25} minSize={18} maxSize={40} id="ai">
                <AIPanel />
              </Panel>
            </>
          )}
        </PanelGroup>

        {!aiOpen && (
          <CollapsedStrip
            side="right"
            label="Assistant"
            onOpen={() => setAiOpen(true)}
            testId="ai-open-strip"
          />
        )}
      </div>
    </div>
  );
};

export default WorkspacePage;
