/**
 * Mystic Messenger Dedicated Game Server
 * Integración con Agones SDK (Kubernetes) y Métricas de Prometheus
 */

const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const client = require('prom-client');
const path = require('path');

// --- Configuración e Inicialización ---
const PORT = process.env.PORT || 8080;
const AGONES_ENABLED = process.env.ENABLE_AGONES === 'true' || process.env.AGONES_SDK_HTTP_PORT !== undefined;

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del juego directamente si se despliega como contenedor todo-en-uno
app.use(express.static(path.join(__dirname, '../game')));

// --- Métricas de Prometheus ---
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'rfa_game_' });

const activePlayersGauge = new client.Gauge({
  name: 'rfa_active_players_total',
  help: 'Número actual de jugadores conectados al servidor de partida'
});

const activeSpectatorsGauge = new client.Gauge({
  name: 'rfa_active_spectators_total',
  help: 'Número actual de espectadores en salas de partida'
});

const gamesStartedCounter = new client.Counter({
  name: 'rfa_games_started_total',
  help: 'Total de partidas iniciadas en el clúster'
});

const actionsCounter = new client.Counter({
  name: 'rfa_player_actions_total',
  help: 'Total de acciones y respuestas emitidas por jugadores',
  labelNames: ['action_type']
});

const latencyHistogram = new client.Histogram({
  name: 'rfa_request_duration_seconds',
  help: 'Latencia de peticiones en segundos',
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5]
});

// --- Integración con Agones SDK ---
let agonesSDK = null;

async function setupAgones() {
  if (AGONES_ENABLED) {
    try {
      const AgonesSDK = require('@google-cloud/agones-sdk');
      agonesSDK = new AgonesSDK();
      await agonesSDK.connect();
      console.log('✅ Conectado exitosamente con Agones Sidecar');

      // Indicar que el GameServer está listo para recibir jugadores
      await agonesSDK.ready();
      console.log('✅ Agones State: READY');

      // Heartbeat periódico cada 2 segundos para Agones Health Checking
      setInterval(async () => {
        try {
          await agonesSDK.health();
        } catch (err) {
          console.warn('Fallo enviando health ping a Agones:', err.message);
        }
      }, 2000);

      // Listener para cambios de estado de Agones
      agonesSDK.watchGameServer((result) => {
        console.log(`[Agones Watch] Estado actual del GameServer: ${result.status.state}`);
      });
    } catch (error) {
      console.warn('⚠️ No se pudo inicializar Agones SDK (ejecutando en modo Standalone):', error.message);
      agonesSDK = null;
    }
  } else {
    console.log('ℹ️ Agones deshabilitado o no detectado. Modo Standalone activo.');
  }
}

// --- Endpoints HTTP & Observabilidad ---
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

app.get('/readyz', (req, res) => {
  res.status(200).json({ status: 'ready' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Endpoint de la API Leaderboard local (fallback si no está el serverless externo)
let inMemoryLeaderboard = [
  { player: "707_Luciel", score: 50 },
  { player: "Jumin_CatLover", score: 40 },
  { player: "Zen_Musical", score: 35 },
  { player: "Yoosung_LOLOL", score: 25 },
  { player: "Jaehee_Assistant", score: 20 }
];

app.get('/api/leaderboard', (req, res) => {
  res.json({ topScores: inMemoryLeaderboard });
});

app.post('/api/leaderboard', (req, res) => {
  const { player, score } = req.body;
  if (player && typeof score === 'number') {
    inMemoryLeaderboard.push({ player, score });
    inMemoryLeaderboard.sort((a, b) => b.score - a.score);
    inMemoryLeaderboard = inMemoryLeaderboard.slice(0, 10);
  }
  res.json({ success: true, topScores: inMemoryLeaderboard });
});

// --- Servidor HTTP y WebSockets ---
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

let connectedPlayers = new Map();
let connectedSpectators = new Set();

wss.on('connection', (ws, req) => {
  const isSpectator = req.url.includes('spectator=true');

  if (isSpectator) {
    connectedSpectators.add(ws);
    activeSpectatorsGauge.inc();
    ws.send(JSON.stringify({ type: 'SERVER_EVENT', payload: 'Conectado como espectador a la sala RFA' }));
  } else {
    activePlayersGauge.inc();
    gamesStartedCounter.inc();
    
    // Si Agones está presente y pasa de 0 a 1 jugador, marcamos Allocate si se requiere
    if (agonesSDK && connectedPlayers.size === 0) {
      try {
        agonesSDK.allocate();
        console.log('🕹️ Agones State: ALLOCATED');
      } catch (e) {
        console.warn('Error marcando allocate en Agones:', e.message);
      }
    }
  }

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      actionsCounter.inc({ action_type: data.type || 'unknown' });

      if (data.type === 'PLAYER_JOIN') {
        connectedPlayers.set(ws, data.name || 'Anonymous_MC');
        console.log(`Jugador unido: ${data.name}. Total activos: ${connectedPlayers.size}`);

        // Difundir a espectadores
        broadcastToSpectators({
          type: 'SPECTATOR_UPDATE',
          event: 'PLAYER_JOINED',
          player: data.name,
          activePlayers: connectedPlayers.size
        });
      }

      if (data.type === 'SCORE_UPDATE') {
        broadcastToSpectators({
          type: 'SPECTATOR_UPDATE',
          event: 'SCORE_CHANGED',
          player: data.player,
          score: data.score
        });
      }
    } catch (e) {
      console.error('Error parseando mensaje WS:', e);
    }
  });

  ws.on('close', () => {
    if (isSpectator) {
      connectedSpectators.delete(ws);
      activeSpectatorsGauge.dec();
    } else {
      connectedPlayers.delete(ws);
      activePlayersGauge.dec();
      console.log(`Jugador desconectado. Total activos: ${connectedPlayers.size}`);

      // Si no quedan jugadores y estamos en Agones, podemos marcar Ready o Shutdown según ciclo
      if (agonesSDK && connectedPlayers.size === 0) {
        try {
          agonesSDK.ready();
          console.log('🔄 Agones State regresado a: READY');
        } catch (e) {
          console.warn('Error regresando a Ready en Agones:', e.message);
        }
      }
    }
  });
});

function broadcastToSpectators(data) {
  const payload = JSON.stringify(data);
  for (const client of connectedSpectators) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// Iniciar servidor
server.listen(PORT, async () => {
  console.log(`🎮 RFA Dedicated Game Server corriendo en http://0.0.0.0:${PORT}`);
  console.log(`📊 Endpoint de métricas en http://0.0.0.0:${PORT}/metrics`);
  await setupAgones();
});
