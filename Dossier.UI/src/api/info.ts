const API = "http://127.0.0.1:5187";

export async function getVersion() {
  const response = await fetch(`${API}/api/info/version`);

  if (!response.ok) {
    throw new Error("Failed to fetch version");
  }

  return (await response.json()) as {
    version: string;
  };
}
