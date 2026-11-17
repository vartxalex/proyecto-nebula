# 🎓 PORTAFOLIO DE ACTIVIDADES - UNIDAD 3: VIDEOJUEGOS EN LA NUBE
## Caso de Estudio: Nebula Arena (RFA Cyberspace Defense)

**Estudiante:** Victoria Alejandra Rauda de la Torre  
**Materia:** Cómputo en la Nube – Unidad 3  
**Fecha:** Noviembre 2026  

---

### 📂 Índice de Entregables por Actividad

| Actividad del PDF | Tema | Entregables Clave | Archivo del Reporte |
|---|---|---|---|
| **Actividad 3.1** | Cómputo para IA | Tabla comparativa CPU vs GPU, inferencia por tick, cálculo para 2,000 bots a 10 Hz y costos. | [Actividad_3.1_Computo_IA.md](Actividad_3.1_Computo_IA.md) |
| **Actividad 3.2** | Pipeline CI/CD | GitHub Actions workflow, pruebas pytest, imagen con Git SHA y procedimiento de rollback sin corte de partidas. | [Actividad_3.2_Pipeline_CICD.md](Actividad_3.2_Pipeline_CICD.md) |
| **Actividad 3.3** | Contenedores & Agones | `server.py` con Agones REST SDK, Dockerfile, estados de GameServers antes/después y análisis de pods `Allocated`. | [Actividad_3.3_Contenedores_Orquestacion_Agones.md](Actividad_3.3_Contenedores_Orquestacion_Agones.md) |
| **Actividad 3.4** | Autoescalado & Locust | Gráfica CCU vs latencia p95, tiempo de reacción en 3 capas, rebuffering y extrapolación a 20,000 espectadores (54 TB/h). | [Actividad_3.4_Autoescalado_Metricas_Simulacion.md](Actividad_3.4_Autoescalado_Metricas_Simulacion.md) |
| **Actividad 3.5** | Servicios Serverless | Leaderboard Cloud Run / Firestore, métricas de concurrencia con 500 usuarios, análisis de cold start y comparativa vs VM. | [Actividad_3.5_Servicios_Serverless.md](Actividad_3.5_Servicios_Serverless.md) |
| **Actividad 3.6** | Infraestructura con Terraform | Código modular `infra/`, salida de `terraform plan` en PR, cluster GKE + Agones y `terraform destroy` limpio. | [Actividad_3.6_Infraestructura_Como_Codigo_Terraform.md](Actividad_3.6_Infraestructura_Como_Codigo_Terraform.md) |
| **Autoevaluación** | Cuestionario de la Unidad | Respuestas formales a las 8 preguntas del PDF con justificaciones matemáticas y de arquitectura. | [Autoevaluacion_Unidad_3.md](Autoevaluacion_Unidad_3.md) |

---

### 💻 Código Fuente Relacionado:
- **Videojuego Web 2D Nebula Arena:** [game/index.html](../game/index.html) | [game/game.js](../game/game.js)
- **Servidor de Partidas (WebSocket + Agones + Prometheus):** [server/server.py](../server/server.py) | [server/server.js](../server/server.js)
- **Infraestructura como Código:** [infra/main.tf](../infra/main.tf) | [infra/red.tf](../infra/red.tf) | [infra/gke.tf](../infra/gke.tf) | [infra/agones.tf](../infra/agones.tf)
- **Pruebas de Carga:** [load-tests/locustfile.py](../load-tests/locustfile.py)
- **Serverless Backend:** [serverless/main.py](../serverless/main.py)
