"""
Servidor de Partida Nebula Arena (WebSocket + Agones SDK + Prometheus Metrics)
Caso de Estudio: Unidad 3 - Videojuegos en la Nube
Estudiante: Victoria Alejandra Rauda de la Torre
"""

import asyncio
import json
import os
import time
import urllib.request
import websockets
from prometheus_client import Gauge, Histogram, start_http_server

MAX_JUGADORES = 10  # Partida 5 vs 5
TICK_S = 0.05       # 20 ticks por segundo (20 Hz)

# Métricas Prometheus
JUGADORES = Gauge("nebula_players_connected", "Jugadores conectados")
TICK = Histogram("nebula_tick_seconds", "Duración del tick", buckets=(.001, .0025, .005, .01, .025, .05, .1))

estado, conexiones = {}, set()
partida = {"iniciada": False}
SDK = f"http://localhost:{os.getenv('AGONES_SDK_HTTP_PORT', '9358')}"

def agones(ruta):
    """Llama al SDK REST de Agones (contenedor auxiliar/sidecar). Fuera de Agones se ignora."""
    try:
        req = urllib.request.Request(
            SDK + ruta,
            data=b"{}",
            method="POST",
            headers={"Content-Type": "application/json"}
        )
        urllib.request.urlopen(req, timeout=1)
    except Exception:
        pass

def snapshot():
    """Genera el estado comprimido de la arena para los jugadores"""
    return json.dumps({"t": time.time(), "e": estado})

async def jugador(ws):
    if len(conexiones) >= MAX_JUGADORES:
        await ws.close(code=4000, reason="partida llena")
        return

    conexiones.add(ws)
    JUGADORES.set(len(conexiones))
    partida["iniciada"] = True
    mi_id = None

    try:
        async for msg in ws:
            d = json.loads(msg)
            if "ping" in d:
                # Medición de latencia: responde de inmediato
                await ws.send(json.dumps({"pong": d["ping"]}))
            else:
                # Posición y disparo del jugador en Nebula Arena
                mi_id = d.get("id", "desconocido")
                estado[mi_id] = d
    finally:
        conexiones.discard(ws)
        JUGADORES.set(len(conexiones))
        estado.pop(mi_id, None)

async def bucle():
    n = 0
    while True:
        t = time.perf_counter()
        if conexiones:
            websockets.broadcast(conexiones, snapshot())
        TICK.observe(time.perf_counter() - t)
        n += 1

        if n % 40 == 0:  # Latido de salud a Agones cada 2 segundos
            await asyncio.to_thread(agones, "/health")

        if partida["iniciada"] and not conexiones:
            # Fin de partida al desconectarse todos los jugadores
            await asyncio.to_thread(agones, "/shutdown")
            partida["iniciada"] = False

        await asyncio.sleep(TICK_S)

async def main():
    start_http_server(9100)  # Puerto /metrics para Prometheus
    async with websockets.serve(jugador, "0.0.0.0", 7654):
        agones("/ready")     # Servidor listo para ser asignado en Agones
        print("🚀 Servidor Nebula Arena escuchando en ws://0.0.0.0:7654 (Métricas en :9100)")
        await bucle()

if __name__ == "__main__":
    asyncio.run(main())
