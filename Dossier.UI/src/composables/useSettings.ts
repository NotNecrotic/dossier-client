import { ref } from "vue";
import type { DossierSettings } from "../types/settings";

import {
    getSettings,
    saveSettings
} from "../services/settingsApi";


const settings = ref<DossierSettings | null>(null);


export function useSettings()
{
    async function loadSettings()
    {
        try
        {
            settings.value = await getSettings();
        }
        catch(error)
        {
            console.error(
                "Failed loading settings",
                error
            );
        }
    }


    async function updateSettings(
        patch: Partial<DossierSettings>
    )
    {
        if (!settings.value)
            return;


        settings.value = {
            ...settings.value,
            ...patch
        };


        await saveSettings(settings.value);
        settings.value = await getSettings();
    }


    return {
        settings,
        loadSettings,
        updateSettings
    };
}