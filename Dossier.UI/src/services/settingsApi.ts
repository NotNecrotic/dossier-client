import type { DossierSettings } from "../types/settings";


const API: string = "http://127.0.0.1:5187";


export async function getSettings(): Promise<DossierSettings>
{
    const res = await fetch(
        `${API}/api/settings`
    );

    if (!res.ok)
    {
        throw new Error(`Failed to fetch settings: ${res.status}`);
    }

    return await res.json() as DossierSettings;
}



export async function saveSettings(data:any)
{
    const response = await fetch(
        `${API}/api/settings`,
        {
            method:"PUT",
            headers:
            {
                "Content-Type":"application/json"
            },
            body:
                JSON.stringify(data)
        }
    );


    if(!response.ok)
    {
        throw new Error(
            `Failed saving settings: ${response.status}`
        );
    }


    return await response.json();
}