"""Dossier backend regression tests.

Covers the settings normalisation fix (iteration 2) plus all previously passing
endpoints so we can catch regressions.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://content-vault-399.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- Health -----------------------------------------------------------------
class TestHealth:
    def test_health_ok(self, client):
        r = client.get(f"{API}/health")
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "ok"
        assert d["engine"] == "dossier-mock"


# --- Settings ---------------------------------------------------------------
class TestSettings:
    def test_get_settings_shape(self, client):
        r = client.get(f"{API}/settings")
        assert r.status_code == 200
        d = r.json()
        for key in [
            "onboarding_complete", "theme", "accent", "server_url", "server_key",
            "video_root", "cpu_limit", "upload_limit_mbps", "frame_sampling",
            "start_on_boot", "tray_mode",
        ]:
            assert key in d, f"missing {key}"

    def test_put_settings_normalises_invalid_server_url_notaurl(self, client):
        # Iteration 2 regression: partial urls MUST be normalised to ""
        r = client.put(f"{API}/settings", json={"server_url": "notaurl"})
        assert r.status_code == 200
        assert r.json()["server_url"] == ""

        # Confirm persisted
        g = client.get(f"{API}/settings")
        assert g.status_code == 200
        assert g.json()["server_url"] == ""

    def test_put_settings_normalises_single_char(self, client):
        r = client.put(f"{API}/settings", json={"server_url": "d"})
        assert r.status_code == 200
        assert r.json()["server_url"] == ""

    def test_put_settings_normalises_ollama_local_no_scheme(self, client):
        r = client.put(f"{API}/settings", json={"server_url": "ollama.local"})
        assert r.status_code == 200
        assert r.json()["server_url"] == ""

    def test_put_settings_accepts_valid_https(self, client):
        r = client.put(f"{API}/settings", json={"server_url": "https://ollama.local:11434"})
        assert r.status_code == 200
        assert r.json()["server_url"] == "https://ollama.local:11434"

    def test_put_settings_accepts_valid_http(self, client):
        r = client.put(f"{API}/settings", json={"server_url": "http://127.0.0.1:8000"})
        assert r.status_code == 200
        assert r.json()["server_url"] == "http://127.0.0.1:8000"

    def test_put_settings_theme_accent(self, client):
        r = client.put(f"{API}/settings", json={"theme": "light", "accent": "Emerald"})
        assert r.status_code == 200
        d = r.json()
        assert d["theme"] == "light"
        assert d["accent"] == "Emerald"
        # revert
        client.put(f"{API}/settings", json={"theme": "dark", "accent": "Sapphire"})


# --- Server test endpoint ---------------------------------------------------
class TestServerTest:
    def test_valid_url_ok(self, client):
        r = client.post(f"{API}/server/test", json={"url": "https://ollama.local:11434"})
        assert r.status_code == 200
        d = r.json()
        assert d["ok"] is True
        assert isinstance(d["latency_ms"], int)

    def test_invalid_url_fails(self, client):
        r = client.post(f"{API}/server/test", json={"url": "notaurl"})
        assert r.status_code == 200
        d = r.json()
        assert d["ok"] is False


# --- Files ------------------------------------------------------------------
class TestFiles:
    def test_folders_shape(self, client):
        r = client.get(f"{API}/files/folders")
        assert r.status_code == 200
        folders = r.json()
        assert isinstance(folders, list) and len(folders) > 0
        ids = {f["id"] for f in folders}
        assert "f-root" in ids
        assert "f-hardware" in ids

    def test_videos_all(self, client):
        r = client.get(f"{API}/files/videos")
        assert r.status_code == 200
        videos = r.json()
        assert len(videos) >= 16
        v1 = next((v for v in videos if v["id"] == "v-1"), None)
        assert v1 is not None
        assert "PC Upgrade" in v1["title"]
        assert v1["stream_url"].startswith("http")

    def test_videos_filtered_by_folder(self, client):
        r = client.get(f"{API}/files/videos", params={"folder_id": "f-hardware"})
        assert r.status_code == 200
        videos = r.json()
        assert len(videos) >= 3
        for v in videos:
            assert v["folder_id"] == "f-hardware"

    def test_get_single_video(self, client):
        r = client.get(f"{API}/video/v-1")
        assert r.status_code == 200
        assert r.json()["id"] == "v-1"

    def test_get_video_404(self, client):
        r = client.get(f"{API}/video/does-not-exist")
        assert r.status_code == 404

    def test_video_subtitles(self, client):
        r = client.get(f"{API}/video/v-1/subtitles")
        assert r.status_code == 200
        d = r.json()
        assert d["video_id"] == "v-1"
        assert isinstance(d["cues"], list) and len(d["cues"]) > 0
        c = d["cues"][0]
        for k in ("start", "end", "text"):
            assert k in c


# --- AI Query ---------------------------------------------------------------
class TestAI:
    def test_ai_query_upgrade(self, client):
        r = client.post(f"{API}/ai/query", json={"query": "upgrading my PC"})
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d["hits"], list) and len(d["hits"]) >= 1
        vids = [h["video_id"] for h in d["hits"]]
        assert "v-1" in vids

    def test_ai_query_empty(self, client):
        r = client.post(f"{API}/ai/query", json={"query": ""})
        assert r.status_code == 200
        assert r.json()["hits"] == []

    def test_ai_query_no_match(self, client):
        r = client.post(f"{API}/ai/query", json={"query": "xyzzy-nomatch"})
        assert r.status_code == 200
        # Either empty or fuzzy fallback
        assert isinstance(r.json()["hits"], list)
