import { ref } from "vue";

export const serverReachable = ref<boolean | null>(null);

const API = "http://127.0.0.1:5187";

export interface ExplorerNode {
  id: string;

  name: string;

  path: string;

  type: "folder" | "file";

  parentId: string | null;

  status?: "indexed" | "processing" | "unindexed";
}

export async function getExplorerTree(): Promise<ExplorerNode[]> {
  const response = await fetch(`${API}/api/explorer/tree`);

  if (!response.ok) {
    throw new Error("Failed loading explorer tree");
  }

  const headerValue = response.headers.get("X-Server-Reachable");

  if (headerValue === "true") {
    serverReachable.value = true;
  } else if (headerValue === "false") {
    serverReachable.value = false;
  } else {
    serverReachable.value = null;
  }

  return await response.json();
}
