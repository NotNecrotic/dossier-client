export interface ServerTestResult
{
    ok: boolean;

    message?: string;

    latency_ms?: number;
}



export const serverApi =
{

    async test(
        url: string,
        key: string
    ): Promise<ServerTestResult>
    {
        const start = performance.now();

        console.log("Testing server:", `${url}/api/health`);

        try
        {
            const response =
                await fetch(
                    `${url}/api/health`,
                    {
                        headers:
                        {
                            Authorization:
                                `Bearer ${key}`
                        }
                    }
                );


            const latency =
                Math.round(
                    performance.now() - start
                );


            const data =
                await response.json()
                .catch(() => null);



            if(!response.ok)
            {
                return {
                    ok:false,
                    latency_ms:latency,
                    message:
                        data?.detail ??
                        "Authentication failed"
                };
            }

            return {
                ok:true,
                latency_ms:latency,
                message:"Connected",
            };

        }
        catch
        {
            return {
                ok:false,
                message:"Server unreachable"
            };
        }
    }

};