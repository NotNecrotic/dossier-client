const API = "http://127.0.0.1:5187";


export interface ClientState
{
    onboardingComplete: boolean;
}


export async function getClientState(): Promise<ClientState>
{
    const res = await fetch(
        `${API}/api/state`
    );

    if (!res.ok)
    {
        throw new Error(
            "Failed to load client state"
        );
    }

    return await res.json();
}



export async function updateClientState(
    state: ClientState
)
{
    const res = await fetch(
        `${API}/api/state`,
        {
            method: "PUT",
            headers:
            {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(state)
        }
    );


    if (!res.ok)
    {
        throw new Error(
            "Failed to save client state"
        );
    }
}