from fastapi.testclient import TestClient

from music_engine.main import app, records

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "music-engine"


def test_generate_midi_and_download() -> None:
    response = client.post("/api/v1/generations", json={"prompt": "warm synth pop", "tempo": 105,
                                                        "bars": 2, "seed": 11})
    assert response.status_code == 201
    result = response.json()
    assert result["tracks"] == ["Chords", "Melody", "Bass", "Drums"]
    download = client.get(result["download_url"])
    assert download.status_code == 200
    assert download.content[:4] == b"MThd"
    records.pop(result["id"], None)


def test_invalid_tempo_is_rejected() -> None:
    response = client.post("/api/v1/generations", json={"tempo": 300})
    assert response.status_code == 422
