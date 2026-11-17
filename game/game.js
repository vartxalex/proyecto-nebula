/**
 * RFA Nebula Arena: Cyberspace Battleground
 * Motor de Videojuego Arena Espacial 2D con temática Mystic Messenger
 */

// --- Configuración Global de la Arena ---
const ARENA_WIDTH = 3200;
const ARENA_HEIGHT = 3200;

// Definición de Héroes RFA
const HEROES = {
  707: {
    id: "707",
    name: "707 (Luciel)",
    color: "#ff3b30",
    glowColor: "#ffbe0b",
    speed: 5.2,
    fireRate: 110, // ms entre disparos
    bulletSpeed: 12,
    bulletDamage: 22,
    maxHp: 100,
    specialName: "Honey Buddha Hacker Blast",
    bulletType: "laser"
  },
  jumin: {
    id: "jumin",
    name: "Jumin Han",
    color: "#2a6f97",
    glowColor: "#014f86",
    speed: 4.2,
    fireRate: 180,
    bulletSpeed: 10,
    bulletDamage: 38,
    maxHp: 150,
    specialName: "Elizabeth 3rd Drone Shield",
    bulletType: "cat_drone"
  },
  zen: {
    id: "zen",
    name: "Zen",
    color: "#f8f9fa",
    glowColor: "#e0aaff",
    speed: 6.2,
    fireRate: 140,
    bulletSpeed: 14,
    bulletDamage: 26,
    maxHp: 90,
    specialName: "Starlight Narcissism Dash",
    bulletType: "star"
  },
  yoosung: {
    id: "yoosung",
    name: "Yoosung ★",
    color: "#70e000",
    glowColor: "#38b000",
    speed: 4.8,
    fireRate: 230,
    bulletSpeed: 9,
    bulletDamage: 18,
    maxHp: 110,
    specialName: "LOLOL Critical Multi-Shot",
    bulletType: "cone"
  }
};

// --- Sintetizador Web Audio API ---
class ArenaAudio {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playLaser(pitch = 880) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch(e) {}
  }

  playExplosion() {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch(e) {}
  }

  playOrbCollect() {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.05); // A5
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch(e) {}
  }
}

const sfx = new ArenaAudio();

// --- Motor de Juego Principal ---
class NebulaArena {
  constructor() {
    this.canvas = document.getElementById('arena-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas.getContext('2d');

    this.selectedHero = HEROES["707"];
    this.playerAlias = "Commander_MC";

    this.keys = {};
    this.mouse = { x: 0, y: 0, down: false };

    this.resetState();
    this.initDOM();
    this.initEvents();
    this.initStars();
    this.initWebSocket();
  }

  resetState() {
    this.player = {
      x: ARENA_WIDTH / 2,
      y: ARENA_HEIGHT / 2,
      vx: 0,
      vy: 0,
      radius: 22,
      angle: 0,
      hp: 100,
      maxHp: 100,
      xp: 0,
      xpNext: 100,
      level: 1,
      score: 0,
      kills: 0,
      lastShotTime: 0,
      specialGauge: 0
    };

    this.camera = { x: this.player.x, y: this.player.y };
    this.bullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.orbs = [];
    this.particles = [];
    this.gameRunning = false;
    this.wave = 1;
    this.startTime = Date.now();
    this.gameTimer = 0;
    this.timerInterval = null;

    // Generar orbes de nebulosa iniciales
    for (let i = 0; i < 240; i++) {
      this.spawnOrb();
    }
  }

  initStars() {
    this.stars = [];
    for (let i = 0; i < 350; i++) {
      this.stars.push({
        x: Math.random() * ARENA_WIDTH,
        y: Math.random() * ARENA_HEIGHT,
        size: Math.random() * 2.2 + 0.6,
        alpha: Math.random() * 0.7 + 0.3
      });
    }

    // Nebulosas de fondo con temática Mystic Messenger (Rojo 707, Azul Jumin, Magenta Mint Eye)
    this.nebulaClouds = [
      { x: 800, y: 800, r: 600, color: "rgba(255, 59, 48, 0.12)" },
      { x: 2200, y: 1200, r: 800, color: "rgba(0, 240, 255, 0.10)" },
      { x: 1600, y: 2400, r: 700, color: "rgba(157, 78, 221, 0.12)" },
      { x: 2600, y: 2600, r: 650, color: "rgba(255, 190, 11, 0.10)" }
    ];
  }

  initDOM() {
    this.hud = {
      avatar: document.getElementById('hud-avatar'),
      name: document.getElementById('hud-name'),
      hpBar: document.getElementById('hp-bar'),
      hpText: document.getElementById('hp-text'),
      xpBar: document.getElementById('xp-bar'),
      xpText: document.getElementById('xp-text'),
      score: document.getElementById('score-counter'),
      wave: document.getElementById('wave-counter'),
      timer: document.getElementById('timer-counter'),
      statusPill: document.getElementById('server-status-pill'),
      startModal: document.getElementById('start-modal'),
      gameOverModal: document.getElementById('game-over-modal'),
      btnPlay: document.getElementById('btn-play-arena'),
      btnRetry: document.getElementById('btn-retry-arena'),
      playerAliasInput: document.getElementById('player-alias'),
      heroCards: document.querySelectorAll('.hero-card'),
      finalScore: document.getElementById('final-score-val'),
      finalKills: document.getElementById('final-kills-val'),
      finalTime: document.getElementById('final-time-val'),
      endLeaderboard: document.getElementById('end-leaderboard-list')
    };

    // Ajustar tamaño del canvas
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initEvents() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.code === 'Space') {
        this.triggerSpecialAbility();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.mouse.down = true;
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouse.down = false;
    });

    // Selección de Héroe
    this.hud.heroCards.forEach(card => {
      card.addEventListener('click', () => {
        this.hud.heroCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const heroKey = card.getAttribute('data-hero');
        this.selectedHero = HEROES[heroKey];
      });
    });

    // Iniciar Juego
    this.hud.btnPlay.addEventListener('click', () => {
      sfx.init();
      const alias = this.hud.playerAliasInput.value.trim();
      if (alias) this.playerAlias = alias;
      this.startGame();
    });

    // Reiniciar Juego
    this.hud.btnRetry.addEventListener('click', () => {
      this.hud.gameOverModal.classList.add('hidden');
      this.resetState();
      this.startGame();
    });
  }

  initWebSocket() {
    const host = window.location.hostname || "localhost";
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${host}:8080/ws`;

    try {
      this.ws = new WebSocket(wsUrl);
      this.ws.onopen = () => {
        this.hud.statusPill.textContent = "● AGONES DEDICATED ARENA (SYNC)";
        this.hud.statusPill.style.color = "#00ffaa";
        this.ws.send(JSON.stringify({ type: "PLAYER_JOIN", name: this.playerAlias }));
      };
      this.ws.onerror = () => {
        this.hud.statusPill.textContent = "● STANDALONE ARENA MODE";
        this.hud.statusPill.style.color = "#ffbe0b";
      };
    } catch(e) {
      this.hud.statusPill.textContent = "● STANDALONE";
    }
  }

  startGame() {
    this.hud.startModal.classList.add('hidden');
    this.hud.avatar.textContent = this.selectedHero.name.substring(0, 3).toUpperCase();
    this.hud.avatar.style.background = this.selectedHero.color;
    this.hud.name.textContent = `${this.playerAlias} (${this.selectedHero.name})`;
    this.player.maxHp = this.selectedHero.maxHp;
    this.player.hp = this.player.maxHp;

    this.gameRunning = true;
    this.startTime = Date.now();

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.gameRunning) return;
      this.gameTimer++;
      const mm = String(Math.floor(this.gameTimer / 60)).padStart(2, '0');
      const ss = String(this.gameTimer % 60).padStart(2, '0');
      this.hud.timer.textContent = `${mm}:${ss}`;

      // Avanzar oleadas cada 30 segundos
      if (this.gameTimer % 30 === 0) {
        this.wave++;
        this.hud.wave.textContent = this.wave;
        this.spawnWave();
      }
    }, 1000);

    // Bucle inicial de enemigos
    this.spawnWave();
    requestAnimationFrame((ts) => this.loop(ts));
  }

  spawnOrb() {
    const types = ['data', 'heart', 'hourglass'];
    const weights = [0.70, 0.22, 0.08];
    const rand = Math.random();
    let type = 'data';
    if (rand > weights[0] + weights[1]) type = 'hourglass';
    else if (rand > weights[0]) type = 'heart';

    this.orbs.push({
      x: Math.random() * (ARENA_WIDTH - 100) + 50,
      y: Math.random() * (ARENA_HEIGHT - 100) + 50,
      type: type,
      radius: type === 'hourglass' ? 10 : 7,
      pulse: Math.random() * Math.PI * 2
    });
  }

  spawnWave() {
    const count = 6 + this.wave * 4;
    for (let i = 0; i < count; i++) {
      // Spawn en los bordes alejados del jugador
      const angle = Math.random() * Math.PI * 2;
      const dist = 900 + Math.random() * 400;
      const ex = Math.min(Math.max(80, this.player.x + Math.cos(angle) * dist), ARENA_WIDTH - 80);
      const ey = Math.min(Math.max(80, this.player.y + Math.sin(angle) * dist), ARENA_HEIGHT - 80);

      const isBoss = (i === 0 && this.wave % 2 === 0);

      this.enemies.push({
        x: ex,
        y: ey,
        radius: isBoss ? 42 : 18,
        hp: isBoss ? 280 + this.wave * 120 : 35 + this.wave * 15,
        maxHp: isBoss ? 280 + this.wave * 120 : 35 + this.wave * 15,
        speed: isBoss ? 2.2 : 3.0 + Math.random() * 1.2,
        isBoss: isBoss,
        name: isBoss ? "Unknown Dreadnought" : "Mint Eye Drone",
        color: isBoss ? "#9d4edd" : "#ff007f",
        lastFireTime: Date.now() + Math.random() * 1000
      });
    }
  }

  triggerSpecialAbility() {
    if (!this.gameRunning || this.player.specialGauge < 100) return;
    this.player.specialGauge = 0;

    sfx.playLaser(1200);

    // Ráfaga especial según héroe
    if (this.selectedHero.id === '707') {
      // 16 proyectiles en círculo omnidireccional
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
        this.bullets.push({
          x: this.player.x,
          y: this.player.y,
          vx: Math.cos(a) * 16,
          vy: Math.sin(a) * 16,
          damage: 55,
          color: "#ffbe0b",
          radius: 8,
          life: 70
        });
      }
    } else if (this.selectedHero.id === 'jumin') {
      // Recuperar 50% de HP y emitir onda de choque
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.maxHp * 0.5);
      this.enemies.forEach(e => {
        const dx = e.x - this.player.x;
        const dy = e.y - this.player.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 450) {
          e.hp -= 90;
          e.x += (dx / dist) * 120;
          e.y += (dy / dist) * 120;
        }
      });
    } else {
      // Zen / Yoosung: Hiperdisparo concentrado
      for (let i = -3; i <= 3; i++) {
        const spread = this.player.angle + (i * 0.12);
        this.bullets.push({
          x: this.player.x,
          y: this.player.y,
          vx: Math.cos(spread) * 18,
          vy: Math.sin(spread) * 18,
          damage: 60,
          color: "#00f0ff",
          radius: 7,
          life: 80
        });
      }
    }
  }

  // --- Ciclo Principal de Ejecución (Update & Render) ---
  loop() {
    if (!this.gameRunning) return;

    this.update();
    this.render();

    requestAnimationFrame(() => this.loop());
  }

  update() {
    // 1. Movimiento del Jugador
    let moveX = 0;
    let moveY = 0;
    if (this.keys['w'] || this.keys['arrowup']) moveY -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveY += 1;
    if (this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveX += 1;

    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.7071;
      moveY *= 0.7071;
    }

    const accel = 0.8;
    this.player.vx += moveX * accel;
    this.player.vy += moveY * accel;

    // Fricción espacial
    this.player.vx *= 0.88;
    this.player.vy *= 0.88;

    // Velocidad máxima
    const currentSpeed = Math.hypot(this.player.vx, this.player.vy);
    if (currentSpeed > this.selectedHero.speed) {
      this.player.vx = (this.player.vx / currentSpeed) * this.selectedHero.speed;
      this.player.vy = (this.player.vy / currentSpeed) * this.selectedHero.speed;
    }

    this.player.x += this.player.vx;
    this.player.y += this.player.vy;

    // Límites de la Arena
    this.player.x = Math.max(this.player.radius, Math.min(ARENA_WIDTH - this.player.radius, this.player.x));
    this.player.y = Math.max(this.player.radius, Math.min(ARENA_HEIGHT - this.player.radius, this.player.y));

    // Ángulo apuntando al cursor
    const screenCenterX = this.canvas.width / 2;
    const screenCenterY = this.canvas.height / 2;
    this.player.angle = Math.atan2(this.mouse.y - screenCenterY, this.mouse.x - screenCenterX);

    // Cámara centrada en el jugador con interpolación suave
    this.camera.x += (this.player.x - this.camera.x) * 0.1;
    this.camera.y += (this.player.y - this.camera.y) * 0.1;

    // 2. Disparo Continuo con el Mouse
    const now = Date.now();
    if (this.mouse.down && now - this.player.lastShotTime >= this.selectedHero.fireRate) {
      this.player.lastShotTime = now;
      this.shootPlayerBullet();
    }

    // 3. Actualizar Balas del Jugador
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      if (b.life <= 0 || b.x < 0 || b.x > ARENA_WIDTH || b.y < 0 || b.y > ARENA_HEIGHT) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Colisión con enemigos
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        const dist = Math.hypot(b.x - enemy.x, b.y - enemy.y);
        if (dist < b.radius + enemy.radius) {
          enemy.hp -= b.damage;
          this.bullets.splice(i, 1);
          this.createHitParticles(b.x, b.y, b.color);

          if (enemy.hp <= 0) {
            this.killEnemy(j);
          }
          break;
        }
      }
    }

    // 4. Actualizar Balas de Enemigos
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const eb = this.enemyBullets[i];
      eb.x += eb.vx;
      eb.y += eb.vy;
      eb.life--;

      if (eb.life <= 0 || eb.x < 0 || eb.x > ARENA_WIDTH || eb.y < 0 || eb.y > ARENA_HEIGHT) {
        this.enemyBullets.splice(i, 1);
        continue;
      }

      // Colisión con el Jugador
      const dist = Math.hypot(eb.x - this.player.x, eb.y - this.player.y);
      if (dist < eb.radius + this.player.radius) {
        this.player.hp -= eb.damage;
        this.enemyBullets.splice(i, 1);
        this.createHitParticles(this.player.x, this.player.y, "#ff0055");
        sfx.playExplosion();

        if (this.player.hp <= 0) {
          this.endGame(false);
          return;
        }
      }
    }

    // 5. Actualizar Enemigos
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      const dx = this.player.x - e.x;
      const dy = this.player.y - e.y;
      const dist = Math.hypot(dx, dy);

      // Movimiento hacia el jugador
      if (dist > 0) {
        e.x += (dx / dist) * e.speed;
        e.y += (dy / dist) * e.speed;
      }

      // Disparos periódicos del enemigo
      if (dist < 600 && now - e.lastFireTime > (e.isBoss ? 800 : 1800)) {
        e.lastFireTime = now;
        const bulletAngle = Math.atan2(dy, dx);
        this.enemyBullets.push({
          x: e.x,
          y: e.y,
          vx: Math.cos(bulletAngle) * 7,
          vy: Math.sin(bulletAngle) * 7,
          damage: e.isBoss ? 20 : 10,
          radius: e.isBoss ? 7 : 5,
          color: "#ff007f",
          life: 90
        });
      }

      // Colisión por impacto directo con la nave
      if (dist < this.player.radius + e.radius) {
        this.player.hp -= e.isBoss ? 0.8 : 0.4;
        if (this.player.hp <= 0) {
          this.endGame(false);
          return;
        }
      }
    }

    // 6. Recolección de Orbes
    for (let i = this.orbs.length - 1; i >= 0; i--) {
      const orb = this.orbs[i];
      orb.pulse += 0.05;
      const dist = Math.hypot(orb.x - this.player.x, orb.y - this.player.y);

      // Atracción gravitatoria / magnética si está cerca
      if (dist < 140) {
        orb.x += (this.player.x - orb.x) * 0.12;
        orb.y += (this.player.y - orb.y) * 0.12;
      }

      if (dist < this.player.radius + orb.radius) {
        this.collectOrb(orb);
        this.orbs.splice(i, 1);
        this.spawnOrb(); // Reponer orbe
      }
    }

    // 7. Partículas
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.025;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }

    // Actualizar HUD
    this.updateHUD();

    // Notificar al GameServer si está sincronizado
    if (this.ws && this.ws.readyState === WebSocket.OPEN && Math.random() < 0.1) {
      this.ws.send(JSON.stringify({
        type: "PLAYER_STATE",
        name: this.playerAlias,
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        score: this.player.score,
        hp: Math.round(this.player.hp)
      }));
    }
  }

  shootPlayerBullet() {
    sfx.playLaser(this.selectedHero.id === '707' ? 950 : 750);

    const bSpeed = this.selectedHero.bulletSpeed;
    const bDamage = this.selectedHero.bulletDamage;
    const angle = this.player.angle;

    if (this.selectedHero.id === 'yoosung') {
      // Disparo triple en cono
      for (let offset of [-0.15, 0, 0.15]) {
        this.bullets.push({
          x: this.player.x + Math.cos(angle) * this.player.radius,
          y: this.player.y + Math.sin(angle) * this.player.radius,
          vx: Math.cos(angle + offset) * bSpeed,
          vy: Math.sin(angle + offset) * bSpeed,
          damage: bDamage,
          radius: 5,
          color: this.selectedHero.glowColor,
          life: 60
        });
      }
    } else {
      // Disparo estándar o dual de 707 / Jumin / Zen
      this.bullets.push({
        x: this.player.x + Math.cos(angle) * this.player.radius,
        y: this.player.y + Math.sin(angle) * this.player.radius,
        vx: Math.cos(angle) * bSpeed,
        vy: Math.sin(angle) * bSpeed,
        damage: bDamage,
        radius: 6,
        color: this.selectedHero.glowColor,
        life: 70
      });
    }
  }

  collectOrb(orb) {
    sfx.playOrbCollect();
    if (orb.type === 'data') {
      this.player.xp += 15;
      this.player.score += 10;
    } else if (orb.type === 'heart') {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 20);
      this.player.score += 25;
    } else if (orb.type === 'hourglass') {
      this.player.specialGauge = Math.min(100, this.player.specialGauge + 40);
      this.player.score += 50;
    }

    // Subir de nivel
    if (this.player.xp >= this.player.xpNext) {
      this.player.level++;
      this.player.xp -= this.player.xpNext;
      this.player.xpNext = Math.floor(this.player.xpNext * 1.4);
      this.player.maxHp += 15;
      this.player.hp = this.player.maxHp;
      this.player.radius = Math.min(38, this.player.radius + 1.2); // Expansión de tamaño estilo Agar.io/Arena
      this.createHitParticles(this.player.x, this.player.y, "#00ffaa", 25);
    }
  }

  killEnemy(index) {
    const enemy = this.enemies[index];
    this.enemies.splice(index, 1);
    this.player.kills++;
    this.player.score += enemy.isBoss ? 250 : 40;
    this.player.specialGauge = Math.min(100, this.player.specialGauge + (enemy.isBoss ? 50 : 15));
    sfx.playExplosion();
    this.createHitParticles(enemy.x, enemy.y, enemy.color, enemy.isBoss ? 40 : 15);

    // Si se eliminan todos los enemigos, adelantar siguiente oleada
    if (this.enemies.length === 0) {
      this.wave++;
      this.hud.wave.textContent = this.wave;
      this.spawnWave();
    }
  }

  createHitParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = Math.random() * 4 + 1;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        color: color,
        radius: Math.random() * 3 + 1,
        alpha: 1.0
      });
    }
  }

  updateHUD() {
    const hpPct = Math.max(0, Math.min(100, (this.player.hp / this.player.maxHp) * 100));
    this.hud.hpBar.style.width = `${hpPct}%`;
    this.hud.hpText.textContent = `HP: ${Math.round(this.player.hp)} / ${this.player.maxHp}`;

    const xpPct = Math.min(100, (this.player.xp / this.player.xpNext) * 100);
    this.hud.xpBar.style.width = `${xpPct}%`;
    this.hud.xpText.textContent = `NIVEL ${this.player.level} (${Math.round(this.player.xp)} / ${this.player.xpNext} XP)`;

    this.hud.score.textContent = this.player.score;
  }

  // --- Renderizado Gráfico de la Arena ---
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    this.ctx.save();
    this.ctx.translate(cx - this.camera.x, cy - this.camera.y);

    // 1. Nebulosas de Fondo
    this.nebulaClouds.forEach(n => {
      const grad = this.ctx.createRadialGradient(n.x, n.y, 50, n.x, n.y, n.r);
      grad.addColorStop(0, n.color);
      grad.addColorStop(1, "transparent");
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // 2. Estrellas
    this.ctx.fillStyle = "#fff";
    this.stars.forEach(s => {
      this.ctx.globalAlpha = s.alpha;
      this.ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    this.ctx.globalAlpha = 1.0;

    // 3. Cuadrícula de la Arena
    this.ctx.strokeStyle = "rgba(41, 52, 86, 0.4)";
    this.ctx.lineWidth = 1;
    const gridSize = 120;
    for (let x = 0; x <= ARENA_WIDTH; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, ARENA_HEIGHT);
      this.ctx.stroke();
    }
    for (let y = 0; y <= ARENA_HEIGHT; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(ARENA_WIDTH, y);
      this.ctx.stroke();
    }

    // 4. Bordes de la Arena
    this.ctx.strokeStyle = "#ff0055";
    this.ctx.lineWidth = 6;
    this.ctx.strokeRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

    // 5. Renderizar Orbes
    this.orbs.forEach(orb => {
      this.ctx.save();
      this.ctx.translate(orb.x, orb.y);
      const scale = 1 + Math.sin(orb.pulse) * 0.15;
      this.ctx.scale(scale, scale);

      if (orb.type === 'data') {
        this.ctx.fillStyle = "#00f0ff";
        this.ctx.shadowColor = "#00f0ff";
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, orb.radius, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (orb.type === 'heart') {
        this.ctx.fillStyle = "#ff0055";
        this.ctx.shadowColor = "#ff0055";
        this.ctx.shadowBlur = 12;
        this.ctx.font = "14px Arial";
        this.ctx.fillText("❤️", -7, 5);
      } else if (orb.type === 'hourglass') {
        this.ctx.fillStyle = "#ffbe0b";
        this.ctx.shadowColor = "#ffbe0b";
        this.ctx.shadowBlur = 14;
        this.ctx.font = "16px Arial";
        this.ctx.fillText("⌛", -8, 6);
      }
      this.ctx.restore();
    });

    // 6. Renderizar Balas
    this.bullets.forEach(b => {
      this.ctx.fillStyle = b.color;
      this.ctx.shadowColor = b.color;
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.enemyBullets.forEach(eb => {
      this.ctx.fillStyle = eb.color;
      this.ctx.shadowColor = eb.color;
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(eb.x, eb.y, eb.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.shadowBlur = 0;

    // 7. Renderizar Enemigos
    this.enemies.forEach(e => {
      this.ctx.save();
      this.ctx.translate(e.x, e.y);

      // Cuerpo del Enemigo (Mint Eye / Unknown)
      this.ctx.fillStyle = e.color;
      this.ctx.strokeStyle = "#fff";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      if (e.isBoss) {
        // Crucero hexagonal con pinchos
        const sides = 6;
        for (let s = 0; s < sides; s++) {
          const a = (s / sides) * Math.PI * 2;
          const px = Math.cos(a) * e.radius;
          const py = Math.sin(a) * e.radius;
          if (s === 0) this.ctx.moveTo(px, py);
          else this.ctx.lineTo(px, py);
        }
        this.ctx.closePath();
      } else {
        // Triángulo estelar agresivo
        this.ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
      }
      this.ctx.fill();
      this.ctx.stroke();

      // Barra de vida del enemigo
      const barW = e.radius * 2;
      const hpRatio = Math.max(0, e.hp / e.maxHp);
      this.ctx.fillStyle = "rgba(0,0,0,0.6)";
      this.ctx.fillRect(-barW / 2, -e.radius - 12, barW, 5);
      this.ctx.fillStyle = "#ff0055";
      this.ctx.fillRect(-barW / 2, -e.radius - 12, barW * hpRatio, 5);

      this.ctx.restore();
    });

    // 8. Renderizar Partículas
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // 9. Renderizar la Nave del Jugador
    this.ctx.save();
    this.ctx.translate(this.player.x, this.player.y);
    this.ctx.rotate(this.player.angle);

    // Propulsor de plasma
    this.ctx.fillStyle = "#ffbe0b";
    this.ctx.beginPath();
    this.ctx.moveTo(-this.player.radius, -8);
    this.ctx.lineTo(-this.player.radius - (Math.random() * 12 + 6), 0);
    this.ctx.lineTo(-this.player.radius, 8);
    this.ctx.fill();

    // Fuselaje de la Nave RFA
    this.ctx.fillStyle = this.selectedHero.color;
    this.ctx.strokeStyle = this.selectedHero.glowColor;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(this.player.radius + 6, 0);
    this.ctx.lineTo(-this.player.radius, -this.player.radius + 4);
    this.ctx.lineTo(-this.player.radius + 6, 0);
    this.ctx.lineTo(-this.player.radius, this.player.radius - 4);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Cabina
    this.ctx.fillStyle = "#fff";
    this.ctx.beginPath();
    this.ctx.arc(2, 0, 6, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();

    this.ctx.restore(); // Termina cámara virtual

    // 10. Renderizar Minimapa
    this.renderMinimap();
  }

  renderMinimap() {
    const mw = this.minimapCanvas.width;
    const mh = this.minimapCanvas.height;
    this.minimapCtx.clearRect(0, 0, mw, mh);

    const scaleX = mw / ARENA_WIDTH;
    const scaleY = mh / ARENA_HEIGHT;

    // Orbes
    this.minimapCtx.fillStyle = "rgba(0, 240, 255, 0.4)";
    this.orbs.forEach(o => {
      this.minimapCtx.fillRect(o.x * scaleX, o.y * scaleY, 1.5, 1.5);
    });

    // Enemigos
    this.minimapCtx.fillStyle = "#ff0055";
    this.enemies.forEach(e => {
      this.minimapCtx.fillRect(e.x * scaleX, e.y * scaleY, e.isBoss ? 5 : 3, e.isBoss ? 5 : 3);
    });

    // Jugador (Punto Dorado Brillante)
    this.minimapCtx.fillStyle = "#ffbe0b";
    this.minimapCtx.beginPath();
    this.minimapCtx.arc(this.player.x * scaleX, this.player.y * scaleY, 4, 0, Math.PI * 2);
    this.minimapCtx.fill();
  }

  // --- Fin del Juego ---
  async endGame(victory) {
    this.gameRunning = false;
    clearInterval(this.timerInterval);

    this.hud.gameOverModal.classList.remove('hidden');
    this.hud.finalScore.textContent = this.player.score;
    this.hud.finalKills.textContent = this.player.kills;
    this.hud.finalTime.textContent = this.hud.timer.textContent;

    // Sincronizar Puntuación con Cloud Serverless
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player: `${this.playerAlias} [${this.selectedHero.name}]`,
          score: this.player.score,
          kills: this.player.kills
        })
      });
      const data = await res.json();
      this.renderEndLeaderboard(data.topScores);
    } catch(err) {
      this.renderEndLeaderboard([
        { player: `${this.playerAlias} [${this.selectedHero.name}]`, score: this.player.score },
        { player: "707_God [707]", score: 1450 },
        { player: "Jumin_Cat [Jumin]", score: 1120 },
        { player: "Unknown_Rebel", score: 980 }
      ]);
    }
  }

  renderEndLeaderboard(scores) {
    if (!scores) return;
    this.hud.endLeaderboard.innerHTML = scores.map((s, idx) => `
      <div style="display:flex; justify-content:space-between; padding:3px 0; border-bottom:1px solid #1f2742;">
        <span>#${idx + 1} ${s.player}</span>
        <span style="color:#ffbe0b; font-weight:bold;">${s.score} pts</span>
      </div>
    `).join('');
  }
}

// Inicializar cuando cargue la página
window.addEventListener('DOMContentLoaded', () => {
  window.arena = new NebulaArena();
});
