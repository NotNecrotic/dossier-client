import { getSettings, updateSettings } from "./api/settingsApi.js";

// ===== BOOTSTRAP =====
document.addEventListener("DOMContentLoaded", () => {
    wireUI();
});

// ===== DOM ELEMENTS =====
const introContainer = document.getElementById("introContainer");
const appContainer = document.getElementById("appContainer");

// ===== UI WIRING =====
function wireUI() {

    const settingsBtn = document.getElementById("triggerSettingsBtn");
    const manualExplorerBtn = document.getElementById("manualExploreBtn");
    const exitDashboardBtn = document.getElementById("exitDashboardBtn");

    if (settingsBtn) {
        settingsBtn.onclick = () => openSettingsMenu();
    }
    if (manualExplorerBtn) {
        manualExplorerBtn.onclick = () => switchToDashboard();
    }
    if (exitDashboardBtn) {
        exitDashboardBtn.onclick = () => switchToHomeSearch();
    }
}

// ===== HELPER FUNCTIONS =====
function switchToDashboard() {
    introContainer.classList.add('collapsed');
    appContainer.classList.add('active');
}

function switchToHomeSearch() {
    appContainer.classList.remove('active');
    introContainer.classList.remove('collapsed');
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

// ===== ONBOARDING STATE MANAGEMENT =====
let currentStep = 1;
const totalSteps = 4;

function initOnboarding() {
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");

    nextBtn.onclick = () => {
        if (currentStep < totalSteps) {
            showStep(currentStep + 1);
        } else {
            completeOnboarding();
        }
    };

    prevBtn.onclick = () => {
        if (currentStep > 1) showStep(currentStep - 1);
    };
}

function showStep(stepIndex) {
    document.querySelectorAll(".onboarding-step").forEach(s => s.classList.remove("active"));
    document.getElementById(`step${stepIndex}`).classList.add("active");
    
    currentStep = stepIndex;
    
    // Update button states
    document.getElementById("prevBtn").disabled = (currentStep === 1);
    document.getElementById("nextBtn").textContent = (currentStep === totalSteps) ? "Finish" : "Next";
}

async function completeOnboarding() {
    // Collect all data from onboarding inputs
    const onboardingSettings = {
        watchFolder: document.getElementById("obWatchFolder").value,
        serverUrl: document.getElementById("obServerUrl").value,
        serverKey: document.getElementById("obServerKey").value,
        theme: document.getElementById("obTheme").value,
        // Set defaults for remaining required fields
        uploadLimitMbps: 0,
        cpuLimitPercent: 50,
        frameSamplingInterval: 5,
        startOnBoot: false,
        startMinimized: false
    };

    // Push to your backend API
    await updateSettings(onboardingSettings);

    // Hide onboarding and reveal search screen
    document.getElementById("onboardingOverlay").style.display = "none";
    document.getElementById("introContainer").style.display = "flex";
}

// Ensure you call initOnboarding on load
document.addEventListener("DOMContentLoaded", () => {
    wireUI();
    initOnboarding();
});