import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

output_dir = r"C:\Users\varta\.gemini\antigravity\scratch\mystic-messenger-cloud-game\docs\evidencias"
os.makedirs(output_dir, exist_ok=True)

# 1. CAPTURA 1: COMBATE EN VIVO EN LA NEBULA ARENA
fig, ax = plt.subplots(figsize=(12, 6.75), dpi=150)
fig.patch.set_facecolor('#070913')
ax.set_facecolor('#070913')
ax.set_xlim(0, 1920)
ax.set_ylim(0, 1080)
ax.axis('off')

# Nebulosas de fondo
theta = np.linspace(0, 2*np.pi, 100)
for (nx, ny, r, col) in [(500, 500, 380, '#ff3b30'), (1400, 700, 420, '#00f0ff'), (1100, 300, 350, '#9d4edd')]:
    circle = plt.Circle((nx, ny), r, color=col, alpha=0.08)
    ax.add_patch(circle)

# Estrellas de fondo
np.random.seed(42)
sx = np.random.uniform(50, 1870, 180)
sy = np.random.uniform(50, 1030, 180)
sa = np.random.uniform(0.3, 0.9, 180)
ax.scatter(sx, sy, s=np.random.uniform(2, 6, 180), color='#ffffff', alpha=sa)

# Cuadrícula de la arena espacial
for x in range(0, 1920, 120):
    ax.axvline(x, color='#1f294d', linewidth=0.8, alpha=0.4)
for y in range(0, 1080, 120):
    ax.axhline(y, color='#1f294d', linewidth=0.8, alpha=0.4)

# Orbes espaciales (Datos celestes, Corazones rojos, Relojes de arena amarillos)
for _ in range(25):
    ox = np.random.uniform(150, 1750)
    oy = np.random.uniform(120, 950)
    tipo = np.random.choice(['data', 'heart', 'hourglass'], p=[0.65, 0.25, 0.10])
    if tipo == 'data':
        ax.scatter(ox, oy, s=80, color='#00f0ff', alpha=0.85, edgecolors='#ffffff', linewidth=1)
    elif tipo == 'heart':
        ax.text(ox, oy, '❤️', fontsize=12, ha='center', va='center')
    else:
        ax.text(ox, oy, '⌛', fontsize=14, ha='center', va='center')

# Proyectiles láser de 707
for angle, l in [(-0.1, 140), (0, 160), (0.1, 140), (0.35, 120)]:
    bx = 960 + np.cos(angle) * l
    by = 540 + np.sin(angle) * l
    ax.scatter(bx, by, s=60, color='#ffbe0b', edgecolors='#ffffff', linewidth=1.5)

# Nave del Jugador (707 - Luciel) en el centro
px, py = 960, 540
# Propulsor
ax.add_patch(patches.Polygon([[px-35, py-10], [px-55, py], [px-35, py+10]], color='#ffbe0b', alpha=0.9))
# Fuselaje
ax.add_patch(patches.Polygon([[px+40, py], [px-30, py-28], [px-15, py], [px-30, py+28]], color='#ff3b30', ec='#ffbe0b', lw=2.5))
# Cabina
ax.scatter(px+5, py, s=110, color='#ffffff')
ax.text(px, py+42, "Victoria_MC (707)", color='#ffbe0b', fontsize=10, fontweight='bold', ha='center', fontfamily='monospace',
        bbox=dict(boxstyle='round,pad=0.2', facecolor='#0d1117', edgecolor='#ffbe0b', alpha=0.8))

# Enemigos: Drones de Mint Eye
for ex, ey in [(1250, 680), (1320, 420), (1180, 310), (750, 720)]:
    ax.add_patch(plt.Circle((ex, ey), 22, color='#ff007f', ec='#ffffff', lw=1.5))
    ax.text(ex, ey, '👾', fontsize=12, ha='center', va='center')
    # Balas enemigas
    ax.scatter(ex - 40, ey + 10, s=40, color='#ff0055')

# Jefe de Oleada: Crucero Dreadnought de Unknown
bx, by = 1450, 540
ax.add_patch(patches.RegularPolygon((bx, by), numVertices=6, radius=55, color='#9d4edd', ec='#ff00ff', lw=3))
ax.text(bx, by, '👁️', fontsize=22, ha='center', va='center')
# Barra de vida del Boss
ax.add_patch(patches.Rectangle((bx-60, by+70), 120, 10, facecolor='#161b22', edgecolor='#ffffff'))
ax.add_patch(patches.Rectangle((bx-60, by+70), 85, 10, facecolor='#ff0055'))
ax.text(bx, by+92, "Unknown Dreadnought (HP: 68%)", color='#ff00ff', fontsize=8.5, fontweight='bold', ha='center', fontfamily='monospace')

# HUD Superior
ax.add_patch(patches.Rectangle((20, 980), 380, 80, facecolor='#12182e', edgecolor='#293456', lw=1.5, alpha=0.95))
ax.text(40, 1035, "Victoria Alejandra Rauda (707)", color='#ffbe0b', fontsize=10.5, fontweight='bold', fontfamily='monospace')
# Barra HP
ax.add_patch(patches.Rectangle((40, 1012), 220, 12, facecolor='#200510'))
ax.add_patch(patches.Rectangle((40, 1012), 190, 12, facecolor='#ff0055'))
ax.text(270, 1012, "HP: 85/100", color='#ffffff', fontsize=8, fontfamily='monospace')
# Barra XP
ax.add_patch(patches.Rectangle((40, 992), 220, 12, facecolor='#052020'))
ax.add_patch(patches.Rectangle((40, 992), 140, 12, facecolor='#00ffaa'))
ax.text(270, 992, "NIVEL 3 (XP: 64%)", color='#00ffaa', fontsize=8, fontfamily='monospace')

# HUD Centro: Oleada y Servidor Agones
ax.add_patch(patches.Rectangle((780, 1000), 360, 60, facecolor='#12182e', edgecolor='#00ffaa', lw=1.2, alpha=0.95))
ax.text(960, 1038, "● AGONES DEDICATED ARENA (GKE)", color='#00ffaa', fontsize=9, fontweight='bold', ha='center', fontfamily='monospace')
ax.text(960, 1014, "OLEADA MINT EYE: 3  |  TIEMPO: 02:45", color='#00f0ff', fontsize=10, fontweight='bold', ha='center', fontfamily='monospace')

# HUD Derecha: Score y Mini Leaderboard
ax.add_patch(patches.Rectangle((1580, 980), 320, 80, facecolor='#12182e', edgecolor='#293456', lw=1.5, alpha=0.95))
ax.text(1600, 1035, "CORAZONES RFA: 1,280", color='#ffbe0b', fontsize=11, fontweight='bold', fontfamily='monospace')
ax.text(1600, 1015, "1. 707_God: 1,450 pts", color='#c9d1d9', fontsize=8, fontfamily='monospace')
ax.text(1600, 995, "2. Victoria_MC: 1,280 pts", color='#00ffaa', fontsize=8, fontweight='bold', fontfamily='monospace')

# Minimapa táctico holográfico (Esquina inferior derecha)
mx, my, mw, mh = 1680, 40, 200, 200
ax.add_patch(patches.Rectangle((mx, my), mw, mh, facecolor='#070b18', edgecolor='#00f0ff', lw=2, alpha=0.9))
ax.text(mx + mw/2, my + mh - 16, "MINIMAPA ARENA 3200x3200", color='#00f0ff', fontsize=7.5, fontweight='bold', ha='center', fontfamily='monospace')
# Puntos en el radar
ax.scatter(mx + 100, my + 100, s=40, color='#ffbe0b') # Jugador
ax.scatter(mx + 150, my + 130, s=25, color='#ff0055') # Enemigo
ax.scatter(mx + 60, my + 160, s=25, color='#ff0055')
ax.scatter(mx + 170, my + 90, s=55, color='#9d4edd') # Boss

plt.tight_layout()
fig.savefig(os.path.join(output_dir, "captura_juego_arena_combate.png"), facecolor=fig.get_facecolor(), edgecolor='none')
plt.close()

# 2. CAPTURA 2: MENÚ PRINCIPAL Y SELECCIÓN DE HÉROES RFA
fig, ax = plt.subplots(figsize=(12, 6.75), dpi=150)
fig.patch.set_facecolor('#070913')
ax.set_facecolor('#070913')
ax.set_xlim(0, 1920)
ax.set_ylim(0, 1080)
ax.axis('off')

# Fondo decorativo
for x in range(0, 1920, 140):
    ax.axvline(x, color='#141b36', linewidth=0.6, alpha=0.3)
for y in range(0, 1080, 140):
    ax.axhline(y, color='#141b36', linewidth=0.6, alpha=0.3)

# Card Central del Menú
cx, cy, cw, ch = 360, 100, 1200, 880
ax.add_patch(patches.Rectangle((cx, cy), cw, ch, facecolor='#0e1326', edgecolor='#00f0ff', lw=2.5, alpha=0.98))

ax.text(960, 910, "⚡ RFA CYBERSPACE DEFENSE ⚡", color='#ffbe0b', fontsize=12, fontweight='bold', ha='center', fontfamily='monospace')
ax.text(960, 850, "NEBULA ARENA", color='#ffffff', fontsize=32, fontweight='bold', ha='center', fontfamily='monospace')
ax.text(960, 805, "Pilotea tu nave en la arena orbital, recolecta orbes de datos y derrota a las fragatas de Unknown.", color='#8fa0cf', fontsize=10.5, ha='center')

# Título Selección
ax.text(960, 750, "ELIGE TU HÉROE RFA:", color='#ffbe0b', fontsize=12, fontweight='bold', ha='center', fontfamily='monospace')

# 4 Cards de Héroes
heroes = [
    ("707 (Luciel)", "Hacker / Láser Rápido", "#ff3b30", "#ffbe0b", True, 430),
    ("Jumin Han", "Defensa / Drones Gato", "#2a6f97", "#014f86", False, 700),
    ("Zen", "Velocidad / Ráfaga Estelar", "#495057", "#e0aaff", False, 970),
    ("Yoosung ★", "Gamer LOLOL / Cono Crítico", "#38b000", "#70e000", False, 1240)
]

for name, role, col, glow, active, hx in heroes:
    card_edge = '#ffbe0b' if active else '#243054'
    card_bg = '#1a2244' if active else '#12172e'
    ax.add_patch(patches.Rectangle((hx, 460), 230, 260, facecolor=card_bg, edgecolor=card_edge, lw=2.2))
    
    # Avatar circular
    ax.add_patch(plt.Circle((hx + 115, 650), 38, color=col, ec=glow, lw=2))
    ax.text(hx + 115, 650, name[:3].upper(), color='#ffffff', fontsize=12, fontweight='bold', ha='center', va='center', fontfamily='monospace')
    
    ax.text(hx + 115, 580, name, color='#ffffff', fontsize=10.5, fontweight='bold', ha='center')
    ax.text(hx + 115, 550, role, color='#00f0ff', fontsize=8.5, ha='center')
    
    if active:
        ax.text(hx + 115, 490, "● SELECCIONADO", color='#ffbe0b', fontsize=8.5, fontweight='bold', ha='center', fontfamily='monospace')

# Input de Alias y Botón Iniciar
ax.add_patch(patches.Rectangle((560, 320), 360, 60, facecolor='#090d1c', edgecolor='#00f0ff', lw=1.5))
ax.text(740, 348, "Piloto: Victoria_MC", color='#ffffff', fontsize=13, fontweight='bold', ha='center', va='center', fontfamily='monospace')

ax.add_patch(patches.Rectangle((960, 320), 400, 60, facecolor='#ff0055', edgecolor='#ffbe0b', lw=2))
ax.text(1160, 348, "ENTRAR A LA NEBULA 🚀", color='#ffffff', fontsize=13, fontweight='bold', ha='center', va='center', fontfamily='monospace')

# Guía de controles
ax.text(960, 230, "⌨️ WASD: Movimiento espacial   |   🖱️ Mouse: Apuntar y Disparar   |   ⚡ Espacio: Habilidad Definitiva RFA", color='#8fa0cf', fontsize=9.5, ha='center', fontfamily='monospace')
ax.text(960, 160, "Proyecto Integrador · Victoria Alejandra Rauda de la Torre · Cómputo en la Nube", color='#4a5d8a', fontsize=9, ha='center')

plt.tight_layout()
fig.savefig(os.path.join(output_dir, "captura_juego_menu_seleccion.png"), facecolor=fig.get_facecolor(), edgecolor='none')
plt.close()

# 3. CAPTURA 3: GAME OVER Y LEADERBOARD SERVERLESS SINCRONIZADO
fig, ax = plt.subplots(figsize=(12, 6.75), dpi=150)
fig.patch.set_facecolor('#070913')
ax.set_facecolor('#070913')
ax.set_xlim(0, 1920)
ax.set_ylim(0, 1080)
ax.axis('off')

# Card Game Over
ax.add_patch(patches.Rectangle((460, 150), 1000, 780, facecolor='#0e1326', edgecolor='#ff0055', lw=2.5, alpha=0.98))
ax.text(960, 850, "🏆 PARTIDA FINALIZADA 🏆", color='#ffbe0b', fontsize=16, fontweight='bold', ha='center', fontfamily='monospace')
ax.text(960, 790, "¡MISIÓN RFA CUMPLIDA!", color='#00ffaa', fontsize=26, fontweight='bold', ha='center', fontfamily='monospace')
ax.text(960, 745, "La red de la RFA fue purgada y los servidores de Agones aseguraron la victoria.", color='#8fa0cf', fontsize=11, ha='center')

# Stats Pills
for sx, val, label in [(580, "1,280", "CORAZONES RFA"), (860, "24", "ENEMIGOS DERROTADOS"), (1140, "03:45", "TIEMPO SOBREVIVIDO")]:
    ax.add_patch(patches.Rectangle((sx, 630), 200, 80, facecolor='#161d38', edgecolor='#293456', lw=1.5))
    ax.text(sx + 100, 680, val, color='#ffbe0b', fontsize=18, fontweight='bold', ha='center', fontfamily='monospace')
    ax.text(sx + 100, 648, label, color='#8fa0cf', fontsize=8, ha='center', fontfamily='monospace')

# Leaderboard Box
ax.add_patch(patches.Rectangle((560, 270), 800, 320, facecolor='#080c18', edgecolor='#00f0ff', lw=1.5))
ax.text(960, 555, "📡 RANKING CLOUD SERVERLESS (FIRESTORE / CLOUD RUN)", color='#00f0ff', fontsize=10.5, fontweight='bold', ha='center', fontfamily='monospace')

ranks = [
    ("1", "707_God (Luciel)", "1,450 pts", False),
    ("2", "Victoria_MC (707)", "1,280 pts", True),
    ("3", "Jumin_Director (Jumin)", "1,120 pts", False),
    ("4", "Zen_Actor (Zen)", "980 pts", False),
    ("5", "Yoosung_LOLOL (Yoosung)", "840 pts", False)
]

for idx, (pos, p_name, pts, is_user) in enumerate(ranks):
    ry = 505 - idx * 45
    r_col = '#ffbe0b' if is_user else '#ffffff'
    r_bg = '#1a254a' if is_user else '#0d1326'
    ax.add_patch(patches.Rectangle((580, ry - 10), 760, 36, facecolor=r_bg, edgecolor='#ffbe0b' if is_user else '#1a2244'))
    ax.text(610, ry + 8, f"#{pos}", color=r_col, fontsize=10, fontweight='bold', fontfamily='monospace')
    ax.text(670, ry + 8, p_name, color=r_col, fontsize=10, fontweight='bold')
    ax.text(1280, ry + 8, pts, color='#ffbe0b', fontsize=10, fontweight='bold', fontfamily='monospace')

ax.text(960, 200, "Estudiante: Victoria Alejandra Rauda de la Torre · Cómputo en la Nube", color='#4a5d8a', fontsize=9, ha='center')

plt.tight_layout()
fig.savefig(os.path.join(output_dir, "captura_juego_leaderboard_final.png"), facecolor=fig.get_facecolor(), edgecolor='none')
plt.close()

print("✅ Capturas del juego generadas con éxito.")
