import { API_BASE } from "../config.js";

export async function getSettings() {
    const res = await fetch(`${API_BASE}/api/settings`);
    if (!res.ok) throw new Error("Failed to load settings");
    return await res.json();
}

export async function updateSettings(settings) {
    const res = await fetch(`${API_BASE}/api/settings`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
    });

    if (!res.ok) throw new Error("Failed to update settings");
    return await res.json();
}