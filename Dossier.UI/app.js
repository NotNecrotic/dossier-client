import { getSettings, updateSettings } from "./api/settingsApi.js";

// ===== BOOTSTRAP =====
document.addEventListener("DOMContentLoaded", () => {
    wireUI();
});

// ===== UI WIRING =====
function wireUI() {

    const settingsBtn = document.getElementById("triggerSettingsBtn");

    if (settingsBtn) {
        settingsBtn.onclick = () => openSettingsMenu();
    }
}

// ===== SETTINGS MODAL =====
function openSettingsMenu() {
    const modal = document.getElementById("settingsModal");
    if (modal) {
        modal.classList.add("open");
    }

    const closeBtn = document.getElementById("closeSettingsBtn");
    const saveBtn = document.getElementById("saveSettingsBtn");

    loadSettings();

    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.classList.remove("open");
        };
    }

    if (saveBtn) {
        saveBtn.onclick = async () => {
            await saveSettings();
        };
    }
}

// ===== LOAD SETTINGS FROM CLIENT =====
async function loadSettings() {
    try {
        const settings = await getSettings();

        document.getElementById("serverUrlInput").value = settings.serverUrl || "";
        document.getElementById("serverKeyInput").value = settings.serverKey || "";

        document.getElementById("watchFolderInput").value = settings.watchFolder || "";

        document.getElementById("uploadLimitInput").value = settings.uploadLimitMbps ?? 0;
        document.getElementById("cpuLimitInput").value = settings.cpuLimitPercent ?? 50;
        document.getElementById("frameIntervalInput").value = settings.frameSamplingInterval ?? 5;

        document.getElementById("startOnBootInput").checked = settings.startOnBoot ?? false;
        document.getElementById("startMinimizedInput").checked = settings.startMinimized ?? false;

        document.getElementById("themeInput").value = settings.theme || "ddark";

    } catch (err) {
        console.error("Failed to load settings:", err);
    }
}

// ===== SAVE SETTINGS TO CLIENT =====
async function saveSettings() {
    try {
        const updatedSettings = {
            serverUrl: document.getElementById("serverUrlInput").value,
            serverKey: document.getElementById("serverKeyInput").value,

            watchFolder: document.getElementById("watchFolderInput").value,

            uploadLimitMbps: Number(document.getElementById("uploadLimitInput").value),
            cpuLimitPercent: Number(document.getElementById("cpuLimitInput").value),
            frameSamplingInterval: Number(document.getElementById("frameIntervalInput").value),

            startOnBoot: document.getElementById("startOnBootInput").checked,
            startMinimized: document.getElementById("startMinimizedInput").checked,
            theme: document.getElementById("themeInput").value
        };

        await updateSettings(updatedSettings);

        document.getElementById("settingsModal").classList.remove("open");

        console.log("Settings saved");

    } catch (err) {
        console.error("Failed to save settings:", err);
    }
}