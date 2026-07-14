const API_URL = "http://127.0.0.1:5187"


export async function apiGet(path:string)
{
    const response = await fetch(
        API_URL + path
    );

    if(!response.ok)
        throw new Error(await response.text());

    return response.json();
}


export async function apiPost(
    path:string,
    data:any
)
{
    const response = await fetch(
        API_URL + path,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(data)
        }
    );

    return response.json();
}