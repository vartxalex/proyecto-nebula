import json
import pytest
import server

def test_snapshot_incluye_a_los_jugadores():
    server.estado.clear()
    server.estado["victoria_mc"] = {"id": "victoria_mc", "x": 120.0, "y": 340.0}
    snapshot_data = json.loads(server.snapshot())
    assert snapshot_data["e"]["victoria_mc"]["x"] == 120.0
    assert snapshot_data["e"]["victoria_mc"]["y"] == 340.0

def test_partida_es_5_vs_5():
    assert server.MAX_JUGADORES == 10
