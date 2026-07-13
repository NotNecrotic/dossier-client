/**
 * Central Dossier app store.
 *
 * Responsibilities:
 *   - Load & cache engine settings on boot
 *   - Manage theme (dark/light) + accent color as CSS variables
 *   - Track UI state: selected folder, selected video, panel collapses
 *   - Expose actions to update settings and complete onboarding
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { settingsApi, engineApi } from "./api";

/** Accent color palette — kept in sync with backend design guidelines. */
export const ACCENTS = {
  Sapphire:  { name: "Sapphire",  main: "#3B82F6", hover: "#2563EB", light: "#60A5FA", glow: "rgba(59,130,246,0.15)" },
  Amethyst:  { name: "Amethyst",  main: "#8B5CF6", hover: "#7C3AED", light: "#A78BFA", glow: "rgba(139,92,246,0.15)" },
  Emerald:   { name: "Emerald",   main: "#10B981", hover: "#059669", light: "#34D399", glow: "rgba(16,185,129,0.15)" },
  Ruby:      { name: "Ruby",      main: "#EF4444", hover: "#DC2626", light: "#F87171", glow: "rgba(239,68,68,0.15)"  },
  Amber:     { name: "Amber",     main: "#F59E0B", hover: "#D97706", light: "#FBBF24", glow: "rgba(245,158,11,0.15)" },
  Slate:     { name: "Slate",     main: "#64748B", hover: "#475569", light: "#94A3B8", glow: "rgba(100,116,139,0.18)"},
};

const applyThemeVars = (theme, accent) => {
  const root = document.documentElement;
  const a = ACCENTS[accent] || ACCENTS.Sapphire;
  root.style.setProperty("--accent-500", a.main);
  root.style.setProperty("--accent-600", a.hover);
  root.style.setProperty("--accent-400", a.light);
  root.style.setProperty("--accent-glow", a.glow);

  document.body.classList.remove("theme-dark", "theme-light", "dark");
  if (theme === "light") {
    document.body.classList.add("theme-light");
  } else {
    document.body.classList.add("theme-dark", "dark");
  }
};

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [engineStatus, setEngineStatus] = useState("checking"); // checking | online | offline
  const [selectedFolderId, setSelectedFolderId] = useState("f-root");
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [seekTarget, setSeekTarget] = useState(null); // { videoId, timestamp }
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(true);

  // Bootstrap
  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      try {
        await engineApi.health();
        if (!mounted) return;
        setEngineStatus("online");
        const s = await settingsApi.get();
        if (!mounted) return;
        setSettings(s);
        applyThemeVars(s.theme, s.accent);
      } catch {
        if (!mounted) return;
        setEngineStatus("offline");
        // Fallback default theme
        applyThemeVars("dark", "Sapphire");
      }
    };
    boot();
    return () => {
      mounted = false;
    };
  }, []);

  const updateSettings = useCallback(async (patch) => {
    const next = await settingsApi.update(patch);
    setSettings(next);
    applyThemeVars(next.theme, next.accent);
    return next;
  }, []);

  const openVideoAt = useCallback((videoId, timestamp = 0) => {
    setSelectedVideoId(videoId);
    setSeekTarget({ videoId, timestamp, seq: Date.now() });
  }, []);

  const closeVideo = useCallback(() => {
    setSelectedVideoId(null);
    setSeekTarget(null);
  }, []);

  const value = useMemo(
    () => ({
      settings,
      engineStatus,
      selectedFolderId,
      selectedVideoId,
      seekTarget,
      explorerOpen,
      aiOpen,
      setSelectedFolderId,
      setSelectedVideoId,
      setExplorerOpen,
      setAiOpen,
      updateSettings,
      openVideoAt,
      closeVideo,
    }),
    [
      settings,
      engineStatus,
      selectedFolderId,
      selectedVideoId,
      seekTarget,
      explorerOpen,
      aiOpen,
      updateSettings,
      openVideoAt,
      closeVideo,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
};
