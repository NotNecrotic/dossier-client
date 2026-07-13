import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const http = axios.create({
  baseURL: API,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

/** Settings ------------------------------------------------------------- */
export const settingsApi = {
  get: () => http.get("/settings").then((r) => r.data),
  update: (patch) => http.put("/settings", patch).then((r) => r.data),
};

/** Server -------------------------------------------------------------- */
export const serverApi = {
  test: ({ url, key }) => http.post("/server/test", { url, key }).then((r) => r.data),
};

/** Files --------------------------------------------------------------- */
export const filesApi = {
  folders: () => http.get("/files/folders").then((r) => r.data),
  videos: (folderId, q) =>
    http
      .get("/files/videos", { params: { folder_id: folderId, q } })
      .then((r) => r.data),
};

/** Video --------------------------------------------------------------- */
export const videoApi = {
  get: (id) => http.get(`/video/${id}`).then((r) => r.data),
  subtitles: (id) => http.get(`/video/${id}/subtitles`).then((r) => r.data),
};

/** AI ------------------------------------------------------------------ */
export const aiApi = {
  query: (query) => http.post("/ai/query", { query }).then((r) => r.data),
};

/** Health -------------------------------------------------------------- */
export const engineApi = {
  health: () => http.get("/health").then((r) => r.data),
};

export default http;
