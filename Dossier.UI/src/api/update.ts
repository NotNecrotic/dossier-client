const API = "http://127.0.0.1:5187";

export interface UpdateInfo {
  updateAvailable: boolean;
  currentVersion: string;
  latestVersion: string;
  downloadUrl?: string;
  releaseNotes?: string;
}

export async function checkForUpdates(): Promise<UpdateInfo> {
  const response = await fetch(`${API}/api/update/check`);

  if (!response.ok) {
    throw new Error("Failed to check for updates");
  }

  return await response.json();
}

export async function installUpdate(): Promise<void> {
  const response = await fetch(`${API}/api/update/install`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to install update");
  }
}
