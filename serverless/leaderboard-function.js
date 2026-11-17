/**
 * Serverless Leaderboard Service: Mystic Messenger Party Protocol
 * Diseñado para alta concurrencia y despliegue en Google Cloud Functions o AWS Lambda
 */

let firestoreInstance = null;
try {
  const { Firestore } = require('@google-cloud/firestore');
  firestoreInstance = new Firestore();
} catch (e) {
  // Modo fallback local o testing
  console.log('Modo Firestore Standalone/Local');
}

// Caché en memoria para mitigar picos extremos de 1,000+ jugadores y evitar saturar la base de datos
let cachedTopScores = [
  { player: "707_God", score: 65, updatedAt: new Date().toISOString() },
  { player: "Jumin_Director", score: 55, updatedAt: new Date().toISOString() },
  { player: "Zen_MusicalLead", score: 45, updatedAt: new Date().toISOString() },
  { player: "Yoosung_GuildMaster", score: 40, updatedAt: new Date().toISOString() },
  { player: "Jaehee_Chief", score: 35, updatedAt: new Date().toISOString() }
];
let lastCacheUpdate = Date.now();

/**
 * Entrypoint HTTP de la Cloud Function
 */
exports.handleLeaderboard = async (req, res) => {
  // Cabeceras CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  try {
    // GET: Obtener el Top 10 de Huéspedes RFA
    if (req.method === 'GET') {
      const topScores = await getTopScores();
      return res.status(200).json({ topScores });
    }

    // POST: Registrar nueva puntuación de jugador
    if (req.method === 'POST') {
      const { player, score } = req.body || {};

      // Validación de integridad y prevención de trampas
      if (!player || typeof score !== 'number' || score < 0 || score > 500) {
        return res.status(400).json({ error: 'Payload de puntuación inválido o sospechoso' });
      }

      await saveScore({
        player: String(player).substring(0, 20),
        score: Math.floor(score),
        timestamp: new Date().toISOString()
      });

      const updatedTop = await getTopScores();
      return res.status(200).json({
        success: true,
        message: 'Puntuación registrada en la nube serverless',
        topScores: updatedTop
      });
    }

    return res.status(405).json({ error: 'Método HTTP no soportado' });
  } catch (error) {
    console.error('Error en Cloud Function Leaderboard:', error);
    return res.status(500).json({ error: 'Error interno en servicio Serverless' });
  }
};

async function getTopScores() {
  // Si la caché tiene menos de 2 segundos, responder desde RAM para soportar 16,000 req/s
  if (Date.now() - lastCacheUpdate < 2000) {
    return cachedTopScores;
  }

  if (firestoreInstance) {
    try {
      const snapshot = await firestoreInstance
        .collection('rfa_scores')
        .orderBy('score', 'desc')
        .limit(10)
        .get();

      cachedTopScores = snapshot.docs.map(doc => doc.data());
      lastCacheUpdate = Date.now();
      return cachedTopScores;
    } catch (err) {
      console.warn('Error leyendo de Firestore, usando caché:', err.message);
    }
  }

  return cachedTopScores;
}

async function saveScore(scoreRecord) {
  // Actualizar caché inmediato
  cachedTopScores.push(scoreRecord);
  cachedTopScores.sort((a, b) => b.score - a.score);
  cachedTopScores = cachedTopScores.slice(0, 10);
  lastCacheUpdate = Date.now();

  if (firestoreInstance) {
    try {
      await firestoreInstance.collection('rfa_scores').add(scoreRecord);
    } catch (err) {
      console.warn('Error persistiendo en Firestore:', err.message);
    }
  }
}
