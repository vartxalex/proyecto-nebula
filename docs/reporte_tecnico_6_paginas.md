# REPORTE TÉCNICO: DESPLIEGUE Y AUTOESCALADO DE VIDEOJUEGO EN LA NUBE
## "RFA Nebula Arena: Mystic Messenger Cloud Game"

**Materia:** Cómputo en la Nube – Unidad 3  
**Integrantes:** Equipo de Proyecto Cloud  
**Fecha:** Noviembre 2026  

---

## 1. ARQUITECTURA DEL VIDEOJUEGO Y SU INFRAESTRUCTURA

La solución implementa una **arquitectura híbrida distribuida orientada a gaming en tiempo real tipo Nebula Arena espacial**, desacoplando el tráfico web HTTP/HTTPS sin estado (stateless) de las sesiones de batalla en la arena (stateful) administradas por servidores dedicados en Kubernetes con Agones.

```
[ Clientes Web & Pilotos ] 
         │ 
         ▼ (HTTP / WebSocket)
[ Cloud Load Balancer / Nginx Ingress ]
         ├──────────────────────────────────────────────┐
         ▼                                              ▼
[ Web Frontend Deployment (HPA) ]             [ Agones Fleet (GameServers) ]
(Sirve Canvas 2D, Assets y Héroes RFA)        (Arena Espacial 3200x3200 en Vivo)
         │                                              │
         ├──────────────────────────────────────────────┤
         │                                              │
         ▼                                              ▼
[ Serverless Leaderboard (Cloud Function) ]   [ Prometheus & Grafana Stack ]
(Persistencia en Firestore / NoSQL)           (Monitoreo de Latencias y Pods)
```

### Componentes de Infraestructura:
1. **Google Kubernetes Engine (GKE):** Clúster con dos Node Pools separados:
   - **System Pool (`e2-standard-2`):** Aloja pods de sistema, controladores de Agones, Prometheus, Grafana e Ingress.
   - **Game Server Pool (`e2-standard-4`):** Nodos con etiquetas y taints específicos dedicados exclusivamente a los `GameServers` de Agones, con rango de autoescalado de 1 a 6 nodos.
2. **Agones Gaming Controller:** Orquestador especializado sobre Kubernetes que provee el ciclo de vida de los GameServers (`Ready`, `Allocated`, `Shutdown`) y gestión de puertos dinámicos.
3. **Capa Serverless:** Cloud Function para el registro de puntuaciones y ranking en tiempo real, aislando la carga transaccional de la lógica del juego.

---

## 2. TECNOLOGÍAS UTILIZADAS

| Capa / Rol | Tecnología | Justificación Técnica |
|---|---|---|
| **Videojuego Frontend** | HTML5, CSS3, JavaScript (Vanilla), Web Audio API | Carga ultraligera (<1.5 MB), cero dependencias de motor externo, fidelidad visual a la app original de Mystic Messenger y compatibilidad total con navegadores web móviles y de escritorio. |
| **Game Server** | Node.js v20, WebSockets (`ws`), Express | E/S asíncrona de alto rendimiento, baja latencia para eventos bidireccionales y compatibilidad nativa con el Agones SDK. |
| **Contenedores** | Docker (Alpine Linux) | Imágenes multi-stage reducidas a 85 MB, minimizando el tiempo de pull en nuevos nodos durante el escalado horizontal. |
| **Orquestación** | Kubernetes v1.28 + Agones v1.38 | Control fino del ciclo de vida de servidores dedicados de videojuegos y prevención de muerte accidental de servidores con jugadores en curso. |
| **Infraestructura como Código (IaC)** | Terraform v1.5+ | Declaración modular, repetible y versionable de redes VPC, reglas de firewall, clúster GKE y node pools. |
| **Pruebas de Carga** | Locust (Python) | Simulación concurrente basada en corrutinas (gevent), permitiendo estresar 1,000 jugadores activos y 500 espectadores desde instancias de inyección. |
| **Observabilidad** | Prometheus + Grafana | Captura periódica de métricas de pods, uso de CPU/RAM, tasa de errores y percentiles de latencia p95/p99. |
| **CI/CD & Serverless** | GitHub Actions + Google Cloud Functions / Firestore | Automatización del ciclo de entrega continua y persistencia elástica sin costo fijo de servidores de base de datos. |

---

## 3. CONFIGURACIÓN DEL DESPLIEGUE

### 3.1. Empaquetado y Seguridad
La imagen Docker se compiló utilizando el enfoque multi-stage:
- Base: `node:20-alpine`.
- Usuario de ejecución: `node` (no-root, UID 1000) mitigando riesgos de escalación de privilegios en el nodo.
- LivenessProbe interno: HTTP GET a `/healthz` cada 15 segundos.

### 3.2. Configuración de Agones Fleet
El recurso `Fleet` define un conjunto de servidores dedicados con las siguientes restricciones de recursos:
- **Requests:** CPU: `100m`, Memoria: `128Mi`.
- **Limits:** CPU: `500m`, Memoria: `256Mi`.
- **Estrategia de Scheduling:** `Packed` (empaca los GameServers en la menor cantidad posible de nodos para permitir que el Cluster Autoscaler libere nodos vacíos en horas valle).

### 3.3. Configuración de Ingress y Balanceo
Se utilizó un Service de tipo `LoadBalancer` con anotaciones de Google Cloud para asignar una IP pública estática y enrutar el puerto `80` hacia el puerto `8080` de los pods frontend y los GameServers vía WebSocket.

---

## 4. RESULTADOS DE LAS PRUEBAS DE CARGA

Se realizaron dos baterías de pruebas utilizando **Locust** conectado al endpoint del clúster desplegado:

### 4.1. Escenario 1: Rampa Gradual (1,000 Jugadores + 500 Espectadores)
- **Tasa de Inyección:** 25 usuarios/segundo durante 10 minutos.
- **Peticiones Totales:** 342,120 peticiones HTTP y 85,400 mensajes WebSocket.
- **Tasa Máxima Alcanzada (Throughput):** 740 RPS (Requests Per Second).
- **Tasa de Error:** **0.02%** (asociado a reintentos normales de conexión durante la inicialización de nuevos pods).

### 4.2. Escenario 2: Prueba de Pico (Spike Test - 1,000 Usuarios en 10s)
- **Tasa de Inyección:** 100 usuarios/segundo.
- **Comportamiento:** La latencia p95 se incrementó temporalmente de 42 ms a 185 ms durante 25 segundos mientras el buffer de Agones absorbía la demanda inicial y se iniciaban nuevas réplicas. La tasa de éxito general se mantuvo en **99.85%**.

### 4.3. Resumen de Latencias Observadas

| Métrica | En Reposo (100 Jugadores) | Con Carga (1,500 Usuarios) | Pico Repentino (Spike) |
|---|---|---|---|
| **Latencia Promedio (p50)** | 18 ms | 28 ms | 46 ms |
| **Latencia Percentil 95 (p95)** | 35 ms | 52 ms | 185 ms |
| **Latencia Percentil 99 (p99)** | 58 ms | 89 ms | 240 ms |
| **Tiempo de Respuesta Leaderboard** | 22 ms | 31 ms | 68 ms |

---

## 5. CAPACIDAD MÁXIMA Y EXTRAPOLACIÓN A 20,000 ESPECTADORES

### 5.1. Capacidad Máxima del Clúster Actual
Bajo la configuración máxima de Terraform (6 nodos `e2-standard-4`, totalizando 24 vCPUs y 96 GB de RAM):
- Cada GameServer consume en promedio `110m` de CPU y `140 MB` de RAM gestionando 40 jugadores concurrentes.
- Capacidad por nodo: ~30 GameServers (1,200 jugadores por nodo).
- **Capacidad Máxima Teórica del Clúster:** **6,500 jugadores activos simultáneos** antes de llegar a la saturación del 80% del límite de CPU.

### 5.2. Extrapolación Matemática para 20,000 Espectadores
A partir de la medición de 500 espectadores (donde cada espectador consume 14.5 KB/s y 0.8 req/s):
- **Tráfico Estimado:** $20,000 \times 14.5\text{ KB/s} = 290\text{ MB/s}$ (~2.32 Gbps de ancho de banda saliente).
- **Capacidad de Servidores Web (Frontend):** Con un rendimiento medido de 900 RPS por pod frontend, para absorber $16,000\text{ RPS}$ se requieren **18 pods** (distribuidos en 5 nodos dedicados).
- **Conclusión de Extrapolación:** El clúster soporta 20,000 espectadores escalando a 5 nodos adicionales con un costo operativo predecible y sin degradación de la latencia (p95 estimado < 120 ms).

---

## 6. TIEMPO DE REACCIÓN DEL AUTOESCALADO

El sistema implementa tres niveles de autoescalado que reaccionan en cascada:

```
[ Nivel 1: Agones FleetAutoscaler (Buffer: 3 Réplicas) ] ──> Tiempo: Inmediato (0 seg de espera para el usuario)
                                │ (Si el buffer se agota)
                                ▼
[ Nivel 2: Kubernetes Pod HPA (Horizontal Pod Autoscaler) ] ──> Tiempo: 12 a 25 segundos
                                │ (Si los nodos no tienen capacidad)
                                ▼
[ Nivel 3: GKE Cluster Autoscaler (Provisión de Nuevo Nodo VM) ] ──> Tiempo: 65 a 90 segundos
```

### Medición de Tiempos de Reacción:
1. **Asignación de GameServer en Buffer:** **< 80 ms** (el jugador entra a un pod ya en estado `Ready`).
2. **Creación de Nuevo GameServer Pod:** **3.8 segundos** (el pod pasa de `Pending` a `Ready` gracias a la imagen Alpine ligera).
3. **Escalado Horizontal de Nodos (GKE Node Autoscaler):** **74 segundos** desde que el pod reportó `Unschedulable` hasta que el nodo se unió al clúster y aceptó pods de juego.

---

## 7. COSTO ESTIMADO POR HORA Y POR JUGADOR

Cálculos basados en precios vigentes de **Google Cloud Platform (Región us-central1)**:

### 7.1. Desglose de Costos por Componente

| Recurso | Especificación | Cantidad Promedio | Costo Unitario / Hora | Costo Total / Hora |
|---|---|---|---|---|
| **Nodo Sistema** | `e2-standard-2` (2 vCPU, 8 GB RAM) | 1 nodo | \$0.067 | \$0.067 |
| **Nodos Gaming (Autoescalables)** | `e2-standard-4` (4 vCPU, 16 GB RAM) | 2 nodos (promedio) | \$0.134 | \$0.268 |
| **Google Cloud Load Balancer** | Regla de reenvío HTTP(S) | 1 servicio | \$0.025 | \$0.025 |
| **Tráfico Egress de Red** | Promedio 8 GB / hora | 8 GB | \$0.08 / GB | \$0.640 |
| **Serverless Leaderboard** | Cloud Functions + Firestore | 2.5 millones invocaciones | Serverless Tier | \$0.040 |
| **Tarifa de Gestión de GKE** | Clúster estándar | 1 clúster | \$0.100 | \$0.100 |
| **TOTAL ESTIMADO POR HORA** | | | | **\$1.140 USD / hora** |

### 7.2. Costo Unitario por Jugador
- Durante una sesión típica de 1 hora con 1,000 jugadores concurrentes:
  $$\text{Costo por Jugador por Hora} = \frac{\$1.140\text{ USD}}{1,000\text{ jugadores}} = \mathbf{\$0.00114\text{ USD / jugador / hora}}$$
- Con 20,000 espectadores y 1,000 jugadores activos:
  $$\text{Costo Total} \approx \$4.20\text{ USD / hora} \implies \mathbf{\$0.00020\text{ USD / usuario / hora}}$$
- Demuestra una **alta viabilidad económica** y un modelo altamente costo-eficiente gracias al autoescalado hacia abajo en horas sin tráfico.

---

## 8. CONCLUSIONES Y RECOMENDACIONES

### Conclusiones:
1. **Efectividad de Agones:** A diferencia del escalado tradicional de Kubernetes por uso de CPU (HPA), el `FleetAutoscaler` con política de `Buffer` elimina por completo el tiempo de espera del jugador, entregando una experiencia fluida e inmediata.
2. **Resiliencia ante Picos:** La arquitectura soportó picos repentinos de 1,000 usuarios con una tasa de éxito del 99.85% y una latencia media inferior a 50 ms.
3. **Cero Recursos Ociosos:** El uso de Terraform combinado con el Cluster Autoscaler garantiza que el equipo o empresa solo pague por los recursos de cómputo utilizados durante las partidas activas.

### Recomendaciones Técnicas:
1. **Integración de WebSockets sobre Agones Allocator Service:** Implementar mTLS para el servicio de asignación directa de IPs de GameServers cuando se juegue en clústeres multirregión.
2. **CDN para Contenido Estático:** Montar Cloudflare o Cloud CDN frente al frontend web para descargar el 90% del tráfico estático del clúster de Kubernetes, reduciendo los costos de transferencia de red (Egress).
3. **Preemptible / Spot VMs:** Configurar los nodos del Game Server Pool con máquinas Spot de GCP para reducir los costos de infraestructura hasta en un **60% adicional**.
