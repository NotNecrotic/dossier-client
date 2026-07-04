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
    
    document.getElementById("serverTestResult").textContent = "";

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

// ===== SELECT FOLDER =====
const selectFolderBtn = document.getElementById("selectFolderBtn");

selectFolderBtn.addEventListener("click", async () => {
    const selectedFolder = await window.electronAPI.selectFolder();

    if (selectedFolder) {
        document.getElementById("watchFolderInput").value = selectedFolder;
    }
});

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

        document.getElementById("themeInput").value = settings.theme || "dark";

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

// ===== TEST SERVER CONNECTION =====
document.getElementById("testServerBtn").addEventListener("click", async () => {
    await testServerConnection();
});

async function testServerConnection() {
    const serverUrl = document.getElementById("serverUrlInput").value;
    const serverKey = document.getElementById("serverKeyInput").value;

    const serverTestResult = document.getElementById("serverTestResult");

    const testUrl = `${serverUrl}/api/health`;

    try {
        const response = await fetch(testUrl, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${serverKey}`
            }
        });

        var json = await response.json();

        if (json.Contains("\"serverType\":\"DossierAPI\"")) {
            if (response.status === 401 || response.status === 403) {
            serverTestResult.textContent = "Unauthorized: Invalid server key.";
            serverTestResult.style.color = "red";
            }

            if (!response.ok) {
                serverTestResult.textContent = `Error: ${response.status} ${response.statusText}`;
                serverTestResult.style.color = "red";
                return;
            }

            else {
                serverTestResult.textContent = "Connection successful!";
                serverTestResult.style.color = "green";
            }
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            serverTestResult.textContent = "Request timed out.";
        }
        else {
            serverTestResult.textContent = 'Unreachable: Could not connect to the server.';
            serverTestResult.style.color = "red";
        }
    }
}
