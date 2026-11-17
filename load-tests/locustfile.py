"""
Pruebas de Carga con Locust para Mystic Messenger Cloud Game
Simula:
- 1,000 Jugadores Concurrentes (PlayerUser)
- 500 Espectadores (SpectatorUser)
Métricas medidas: Latencia HTTP/WS, Tasa de Peticiones por Segundo (RPS), Fallos
"""

import time
import json
import random
from locust import HttpUser, task, between, events, tag

class PlayerUser(HttpUser):
    """
    Simula jugadores activos jugando en las salas de chat RFA:
    - Carga la página principal
    - Realiza llamadas a la API de Leaderboard
    - Simula respuestas a diálogos con 707, Jumin, Zen, etc.
    """
    weight = 2  # Proporción de jugadores activos
    wait_time = between(1.0, 2.5)

    def on_start(self):
        self.player_name = f"MC_Player_{random.randint(1000, 99999)}"
        self.score = 0
        # Simula carga inicial de la aplicación web
        self.client.get("/", name="[Frontend] Load Game App")
        self.client.get("/healthz", name="[Probe] Liveness Check")

    @task(3)
    def submit_dialog_response(self):
        """Simula respuesta a un chat y actualización de score"""
        delta = random.choice([5, 10, -5])
        self.score = max(0, self.score + delta)

        payload = {
            "player": self.player_name,
            "score": self.score,
            "action": "DIALOG_CHOICE",
            "timestamp": time.time()
        }

        with self.client.post("/api/leaderboard", json=payload, catch_response=True, name="[API] Submit Score") as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Fallo en leaderboard con código {response.status_code}")

    @task(2)
    def consult_leaderboard(self):
        """Consulta el estado del leaderboard serverless"""
        self.client.get("/api/leaderboard", name="[API] Get Leaderboard")

    @task(1)
    def query_metrics_endpoint(self):
        """Simula el scraping de métricas periódicas del cliente"""
        self.client.get("/metrics", name="[Monitoring] Scrape Metrics")


class SpectatorUser(HttpUser):
    """
    Simula 500 espectadores que observan salas de juego y eventos de gala RFA.
    Enfoque de solo lectura con polling de eventos y estado.
    """
    weight = 1  # Proporción para balancear espectadores
    wait_time = between(0.8, 1.8)

    def on_start(self):
        self.client.get("/", name="[Spectator] Load Stream UI")

    @task(4)
    def poll_game_events(self):
        """Simula consumo continuo de eventos de la sala de juego"""
        self.client.get("/api/leaderboard", name="[Spectator] Live Feed Polling")

    @task(1)
    def check_health(self):
        self.client.get("/healthz", name="[Spectator] Room Health Check")
