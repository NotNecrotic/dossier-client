import { getSettings, updateSettings } from "./api/settingsApi.js";

// ===== BOOTSTRAP =====
document.addEventListener("DOMContentLoaded", () => {
    wireUI();
    initStartup();
});

// ===== VARIABLES =====
const BACKEND_BASE_URL = 'http://127.0.0.1:5187';
let currentDirectoryPath = "";
let currentlyPlayingUrl = "";
let fileListContainer = document.getElementById("fileListContainer");

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

// ===== STARTUP =====
async function initStartup() {
    const settings = await getSettings();
    const onboarding = settings.Onboarding ?? true;

    if (onboarding) {
        initOnboarding();
    } else {
        switchToHomeSearch();
    }
}

// ===== HELPER FUNCTIONS =====
function switchToDashboard() {
    introContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');
    loadDirectory("");
}

function switchToHomeSearch() {
    appContainer.classList.add('hidden');
    introContainer.classList.remove('hidden');
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
        document.getElementById("obWatchFolder").value = selectedFolder;
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
    const onboardingOverlay = document.getElementById("onboardingOverlay");
    onboardingOverlay.classList.remove("hidden");
    console.log("Onboarding initialized. Current step:", currentStep);

    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    
    updateProgressBar();

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
    updateProgressBar();
    
    // Update button states
    document.getElementById("prevBtn").disabled = (currentStep === 1);
    document.getElementById("nextBtn").textContent = (currentStep === totalSteps) ? "Finish" : "Next";
}

function updateProgressBar() {
    const progressFill = document.getElementById("onboardingProgress");

    const percent = (currentStep - 1) / (totalSteps - 1) * 100;

    progressFill.style.width = `${percent}%`;
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
    document.getElementById("onboardingOverlay").classList.add("hidden");
    document.getElementById("introContainer").classList.remove("hidden");
}





// --- File System Operations ---
async function loadDirectory(path = "") {
    // Base API endpoint
    const baseUrl = 'http://127.0.0.1:5187/api/files';
    
    // If a path is requested, append it as a query string; otherwise, request root
    const url = path ? `${baseUrl}?path=${encodeURIComponent(path)}` : baseUrl;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Server responded with ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update state based on what the controller provides
        currentDirectoryPath = data.currentPath || ""; 
        
        // Update UI displays
        currentPathDisplay.textContent = `/${currentDirectoryPath || 'root'}`;
        backBtn.style.display = currentDirectoryPath ? "block" : "none";
        
        // Render the items returned by C#
        renderFileSystemItems(data.items || []);
        
    } catch (err) {
        console.error("Layout load failure:", err);
        fileListContainer.innerHTML = `
            <div class="error-msg">
                Dossier service unreachable or error loading directory: ${err.message}
            </div>`;
    }
}

// Example of how folder clicking links back into this function inside renderFileSystemItems:
function handleItemClick(item, rowElement) {
    const type = item.type || item.Type;

    if (type === 'directory') {
        // Pass the relative path returned by C# back into loadDirectory
        loadDirectory(item.path);
    } else if (type === 'video') {
        const targetVideoUrl = `${BACKEND_BASE_URL}/api/video/${item.path}`;
        
        // Trigger your video player
        playTargetVideo(targetVideoUrl, item);
        
        // Update visual active state in the list
        document.querySelectorAll('.file-item.active').forEach(el => el.classList.remove('active'));
        if (rowElement) {
            rowElement.classList.add('active');
        }
    }
}

function renderFileSystemItems(items) {
    fileListContainer.innerHTML = "";
    
    if (!items || items.length === 0) {
        fileListContainer.innerHTML = `<div class="no-video-placeholder">Empty Directory</div>`;
        return;
    }

    items.forEach(item => {
        // Standardize property access (handles both camelCase and PascalCase from C#)
        const type = item.type || item.Type; 
        const name = item.name || item.Name;
        const isVideo = type === 'video';

        // Construct the exact video URL for active state checking
        const itemVideoUrl = `${BACKEND_BASE_URL}/api/video/${item.path}`;

        // Accessing metadata safely
        const metadata = item.metadata || item.Metadata || {};
        const hasSubs = isVideo && metadata.has_subtitles;
        const isScanned = metadata.has_metadata;

        const row = document.createElement('div');
        
        // Check if this row is the currently playing video
        const isActive = isVideo && (currentlyPlayingUrl === itemVideoUrl);
        row.className = `file-item ${type} ${isActive ? 'active' : ''}`;

        // Create badges
        const subBadge = hasSubs ? `<span class="sub-badge">CC</span>` : '';
        const unscannedBadge = !isScanned ? `<span class="unscanned-badge">No Metadata</span>` : '';
        
        row.innerHTML = `
            <span class="file-icon">${type === 'directory' ? '📁' : '🎞️'}</span>
            <span class="file-name">${name}${subBadge}${unscannedBadge}</span>
            <span class="file-meta">${item.size_mb || 0} MB</span>
        `;

        // Attach clean event listener that passes the item and the UI row element
        row.addEventListener('click', () => {
            handleItemClick(item, row);
        });

        fileListContainer.appendChild(row);
    });
}