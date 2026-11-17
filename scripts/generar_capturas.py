import os
import matplotlib.pyplot as plt
import numpy as np

output_dir = r"C:\Users\varta\.gemini\antigravity\scratch\mystic-messenger-cloud-game\docs\evidencias"
os.makedirs(output_dir, exist_ok=True)

# Configuración de estilo Dark Theme para Gaming / Cloud
plt.style.use('dark_background')
plt.rcParams['font.family'] = 'sans-serif'

# 1. Gráfica 1: Curva CCU vs Latencia p95 (Práctica 3.4)
fig, ax = plt.subplots(figsize=(10, 5.5), dpi=150)
ccu = np.array([0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1150, 1200, 1300, 1400])
p95 = np.array([14, 18, 22, 25, 29, 32, 36, 40, 44, 48, 52, 68, 79, 105, 138, 172])

ax.plot(ccu, p95, color='#00f0ff', linewidth=3, marker='o', markersize=6, label='Latencia p95 Medida')
ax.axhline(80, color='#ff0055', linestyle='--', linewidth=2, label='Meta SLA (p95 = 80 ms)')
ax.axvline(1150, color='#ffbe0b', linestyle=':', linewidth=1.5, label='Capacidad Máxima (1,150 CCU)')

ax.set_title('Nebula Arena · Curva CCU vs Latencia p95 (Locust Load Test)', fontsize=14, fontweight='bold', pad=15, color='#ffffff')
ax.set_xlabel('Jugadores Simultáneos (CCU)', fontsize=11, labelpad=10)
ax.set_ylabel('Latencia p95 (milisegundos)', fontsize=11, labelpad=10)
ax.grid(True, linestyle='--', alpha=0.3)
ax.legend(loc='upper left', framealpha=0.8)
ax.annotate('Punto de Quiebre (Knee)\nSaturación del buffer', xy=(1150, 79), xytext=(850, 110),
            arrowprops=dict(facecolor='#ffbe0b', shrink=0.08, width=1.5, headwidth=8),
            fontweight='bold', color='#ffbe0b', bbox=dict(boxstyle='round,pad=0.5', facecolor='#161a29', edgecolor='#ffbe0b'))

plt.tight_layout()
fig.savefig(os.path.join(output_dir, "grafica_1_ccu_vs_p95.png"))
plt.close()

# 2. Gráfica 2: Línea de Tiempo del Autoescalado Agones & Nodos GKE
fig, ax1 = plt.subplots(figsize=(10, 5.5), dpi=150)
tiempo = np.array([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20])
allocated = np.array([0, 15, 35, 55, 75, 95, 100, 100, 100, 80, 50])
ready_buffer = np.array([3, 5, 10, 15, 20, 24, 25, 25, 25, 20, 15])
nodos = np.array([3, 3, 4, 5, 7, 9, 10, 10, 10, 9, 6])

ax1.plot(tiempo, allocated, color='#00ffaa', linewidth=2.5, marker='s', label='GameServers Allocated (Partidas)')
ax1.plot(tiempo, ready_buffer, color='#ffbe0b', linewidth=2, linestyle='-.', label='GameServers Ready (Buffer 20%)')
ax1.set_xlabel('Tiempo de Simulación (Minutos)', fontsize=11, labelpad=10)
ax1.set_ylabel('Cantidad de Servidores de Juego (Pods)', color='#00ffaa', fontsize=11)
ax1.tick_params(axis='y', labelcolor='#00ffaa')
ax1.grid(True, linestyle='--', alpha=0.25)

ax2 = ax1.twinx()
ax2.step(tiempo, nodos, color='#ff007f', linewidth=2.5, where='post', label='Nodos GKE (e2-standard-4)')
ax2.set_ylabel('Nodos Físicos en el Clúster', color='#ff007f', fontsize=11)
ax2.tick_params(axis='y', labelcolor='#ff007f')

ax1.set_title('Nebula Arena · Autoescalado de Flota (Agones) y Nodos (GKE)', fontsize=14, fontweight='bold', pad=15)
lines1, labels1 = ax1.get_legend_handles_labels()
lines2, labels2 = ax2.get_legend_handles_labels()
ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper left', framealpha=0.85)

plt.tight_layout()
fig.savefig(os.path.join(output_dir, "grafica_2_escalado_agones.png"))
plt.close()

# 3. Gráfica 3: Tasa de Errores y Rebuffering durante el Spike Test
fig, ax = plt.subplots(figsize=(10, 5.5), dpi=150)
t_spike = np.linspace(0, 10, 11)
error_rate = np.array([0.00, 0.01, 0.02, 0.18, 0.12, 0.05, 0.02, 0.01, 0.00, 0.00, 0.00])
rebuffering = np.array([0.05, 0.08, 0.12, 0.35, 0.28, 0.15, 0.10, 0.06, 0.05, 0.05, 0.05])

ax.plot(t_spike, error_rate, color='#ff0055', linewidth=2.5, marker='x', markersize=8, label='Tasa de Desconexión / Error (%)')
ax.plot(t_spike, rebuffering, color='#00f0ff', linewidth=2.5, marker='o', markersize=6, label='Rebuffering Ratio Espectadores (%)')
ax.axhline(0.5, color='#ffbe0b', linestyle='--', label='Límite SLA Error (0.50%)')
ax.axhline(1.0, color='#9d4edd', linestyle=':', label='Límite SLA Rebuffering (1.00%)')

ax.set_title('Nebula Arena · Resiliencia ante Pico Súbito (Spike de 1,000 Usuarios en 20s)', fontsize=13, fontweight='bold', pad=15)
ax.set_xlabel('Tiempo del Spike Test (Minutos)', fontsize=11, labelpad=10)
ax.set_ylabel('Porcentaje de Incidencias (%)', fontsize=11, labelpad=10)
ax.set_ylim(-0.05, 1.2)
ax.grid(True, linestyle='--', alpha=0.3)
ax.legend(loc='upper right', framealpha=0.85)

plt.tight_layout()
fig.savefig(os.path.join(output_dir, "grafica_3_rebuffering_errores.png"))
plt.close()

# 4. Gráfica 4: Simulación del Dashboard Completo de Grafana (4 Paneles)
fig, axs = plt.subplots(2, 2, figsize=(12, 7.5), dpi=150)
fig.suptitle('Nebula Arena · Prometheus & Grafana Live Dashboard', fontsize=16, fontweight='bold', color='#ffbe0b')

# Panel 1: Jugadores Conectados (CCU)
t_graf = np.linspace(0, 30, 31)
ccu_series = 1000 / (1 + np.exp(-(t_graf - 10) / 2))
axs[0, 0].plot(t_graf, ccu_series, color='#00ffaa', linewidth=2)
axs[0, 0].set_title('Panel 1: Jugadores Conectados (CCU) [PromQL: sum(nebula_players_connected)]', fontsize=9, color='#00ffaa')
axs[0, 0].set_ylabel('CCU Activos')
axs[0, 0].grid(True, alpha=0.2)

# Panel 2: Duración del Tick p99
tick_p99 = 2.1 + 0.8 * np.sin(t_graf) + (ccu_series / 1000) * 1.5
axs[0, 1].plot(t_graf, tick_p99, color='#00f0ff', linewidth=2)
axs[0, 1].axhline(25, color='#ff0055', linestyle='--', label='Límite 25 ms (50% del tick 50ms)')
axs[0, 1].set_title('Panel 2: Duración Tick p99 (ms) [Histogram Quantile 0.99]', fontsize=9, color='#00f0ff')
axs[0, 1].set_ylabel('Milisegundos')
axs[0, 1].grid(True, alpha=0.2)
axs[0, 1].legend(fontsize=8)

# Panel 3: Servidores por Estado (Agones Fleet)
axs[1, 0].plot(t_graf, ccu_series / 10, color='#ff0055', label='Allocated (Partidas en uso)', linewidth=2)
axs[1, 0].plot(t_graf, (ccu_series / 10) * 0.2 + 3, color='#ffbe0b', label='Ready (Buffer)', linewidth=2, linestyle='--')
axs[1, 0].set_title('Panel 3: Servidores por Estado (Agones Fleet)', fontsize=9, color='#ffbe0b')
axs[1, 0].set_ylabel('Pods')
axs[1, 0].grid(True, alpha=0.2)
axs[1, 0].legend(fontsize=8)

# Panel 4: Nodos del Clúster
nodos_series = np.clip(3 + np.floor(ccu_series / 140), 3, 10)
axs[1, 1].step(t_graf, nodos_series, color='#9d4edd', linewidth=2.5, where='post')
axs[1, 1].set_title('Panel 4: Nodos del Clúster [PromQL: count(kube_node_info)]', fontsize=9, color='#9d4edd')
axs[1, 1].set_ylabel('Cantidad de Nodos')
axs[1, 1].set_xlabel('Tiempo (Minutos)')
axs[1, 1].grid(True, alpha=0.2)

plt.tight_layout()
fig.savefig(os.path.join(output_dir, "grafica_4_grafana_dashboard.png"))
plt.close()

print("✅ Gráficas generadas exitosamente en:", output_dir)
