# 🎤 GUION DE PRESENTACIÓN FINAL (10 MINUTOS)
## Proyecto Unidad 3: Videojuego en la Nube con Kubernetes, Agones y Terraform
### "RFA Party Protocol: Mystic Messenger Defense"

**Distribución de Tiempo Total:** 10:00 minutos exactos.

---

### Minuto 0:00 – 1:00 | Diapositiva 1: Portada, Presentación del Equipo y Concepto
- **Visual en Pantalla:** Logo de la universidad, integrantes del equipo, título del proyecto y captura de la interfaz de *Mystic Messenger: RFA Party Protocol*.
- **Guion Oral:**
  > "Buenas tardes profesor y compañeros. Hoy les presentamos nuestro proyecto final de Cómputo en la Nube: **RFA Party Protocol**, un videojuego web temático inspirado en *Mystic Messenger*, diseñado y desplegado sobre una arquitectura nativa de nube utilizando **Docker, Kubernetes, Agones, Terraform, Servicios Serverless y Autoescalado** de alto rendimiento.
  > El objetivo principal del proyecto fue demostrar cómo una aplicación lúdica en tiempo real puede desplegarse mediante Infraestructura como Código, mantenerse resiliente frente a miles de conexiones concurrentes y autoescalar sus recursos de manera rentable y transparente."

---

### Minuto 1:00 – 2:00 | Diapositiva 2: Tecnologías y Arquitectura en la Nube
- **Visual en Pantalla:** Diagrama de arquitectura (Load Balancer -> Kubernetes GKE -> Agones Fleet -> Prometheus/Grafana -> Serverless Leaderboard).
- **Guion Oral:**
  > "Para lograr este objetivo, dividimos nuestra solución en cuatro capas principales:
  > 1. **El Frontend Web:** Desarrollado con tecnologías estándar de la web y Web Audio sintetizado, lo que garantiza una ejecución inmediata desde cualquier navegador sin plugins pesados.
  > 2. **Orquestación con Agones:** Un proyecto de código abierto creado por Google Cloud que extiende Kubernetes mediante Custom Resource Definitions (CRDs) para administrar servidores de juego dedicados con control de estado y puertos dinámicos.
  > 3. **Infraestructura como Código con Terraform:** Toda nuestra VPC, reglas de firewall y clúster GKE con dos node pools autoescalables están automatizados en archivos declarativos `.tf`.
  > 4. **Capa Serverless y Observabilidad:** Una función serverless para persistir el ranking de jugadores y una pila de Prometheus y Grafana para monitorear el comportamiento del clúster en tiempo real."

---

### Minuto 2:00 – 4:00 | DEMO EN VIVO PARTE 1: El Videojuego en Acción
- **Visual en Pantalla:** Compartir pantalla del navegador ejecutando el juego en vivo a través de la URL pública.
- **Acciones en la Demo:**
  1. Ingresar el alias del jugador (`MC_Commander`).
  2. Mostrar la barra de estado con la conexión al Game Server.
  3. Contestar interacciones en tiempo real con *707* y *Jumin Han*.
  4. Provocar el evento de intrusión de *Unknown* y presionar el botón de sobreescritura hacker.
  5. Asegurar invitados VIP y mostrar la actualización en la **Tabla de Líderes Serverless**.
- **Guion Oral:**
  > "Pasamos a la demostración en vivo del juego. Como pueden observar en la pantalla, la interfaz recrea la experiencia de mensajería de Mystic Messenger.
  > El jugador debe coordinar a los miembros de la RFA para asegurar a los invitados de la fiesta mientras el servidor mantiene una sesión activa. Si respondemos adecuadamente, sumamos invitados VIP y afinidad.
  > Miren aquí: Unknown intenta hackear los pods de Kubernetes; el jugador debe activar la contramedida de 707 antes de que el temporizador venza.
  > Al terminar la partida, el resultado se envía de forma asíncrona a nuestra función serverless, actualizando el Top 10 global en milisegundos."

---

### Minuto 4:00 – 6:00 | DEMO EN VIVO PARTE 2: Evidencia de Kubernetes, Agones y Autoescalado
- **Visual en Pantalla:** Terminal dividida con `kubectl` y el dashboard de Grafana.
- **Comandos a Ejecutar en la Demo:**
  ```bash
  kubectl get fleet
  kubectl get gameservers -o wide
  kubectl get pods -l app=mystic-messenger
  ```
- **Guion Oral:**
  > "Ahora veamos lo que ocurre detrás de escena en Kubernetes.
  > Al consultar `kubectl get fleet`, vemos nuestra flota `mystic-messenger-fleet` administrada por Agones.
  > A diferencia de los pods comunes, los `GameServers` tienen estados especializados: `Ready`, `Allocated` y `Shutdown`.
  > Noten nuestra política de autoescalado en el `FleetAutoscaler`: tenemos un **Buffer de 3 servidores de reserva**. Esto significa que cuando un nuevo jugador entra, no tiene que esperar a que se cree un pod desde cero; el sistema le asigna un servidor que ya estaba caliente en memoria.
  > Cuando el buffer detecta que los servidores libres disminuyen, Agones ordena automáticamente la creación de nuevas instancias, y si los nodos físicos se saturan, el Cluster Autoscaler de GKE aprovisiona máquinas virtuales adicionales en la nube."

---

### Minuto 6:00 – 7:30 | Diapositiva 3: Pruebas de Carga con Locust y Monitoreo en Grafana
- **Visual en Pantalla:** Gráfica de Locust con 1,500 usuarios (1,000 jugadores + 500 espectadores) y métricas de Grafana.
- **Guion Oral:**
  > "Para certificar la robustez del clúster, ejecutamos pruebas de carga masivas con **Locust**:
  > - Simulamos **1,000 jugadores activos** enviando comandos y respuestas continuas.
  > - Agregamos **500 espectadores concurrentes** consumiendo el feed de eventos.
  > Logramos un throughput de más de **740 peticiones por segundo** con una latencia promedio de **28 milisegundos** y un percentil 95 de solo **52 ms**.
  > La tasa de fallos fue prácticamente nula: **0.02%**.
  > Además, mediante nuestro modelo de consumo de red, extrapolamos el escenario a **20,000 espectadores simultáneos**: requeriría aproximadamente 2.3 Gbps de ancho de banda y 18 pods en 5 nodos GKE, demostrando que la solución escala de forma horizontal y lineal sin cuellos de botella."

---

### Minuto 7:30 – 8:30 | Diapositiva 4: Pipeline de CI/CD y Serverless
- **Visual en Pantalla:** Captura de GitHub Actions con los checks verdes de los tres stages (`test`, `build-and-push`, `deploy-to-k8s`).
- **Guion Oral:**
  > "La agilidad del desarrollo está respaldada por un pipeline de **CI/CD con GitHub Actions**:
  > Cada cambio enviado a la rama `main` ejecuta pruebas unitarias y validación sintáctica de manifiestos, compila la imagen Docker multi-stage optimizada y actualiza el clúster sin tiempo de inactividad mediante una estrategia de Rolling Update.
  > Por su parte, la tabla de líderes opera sobre una arquitectura serverless desacoplada, garantizando que un tráfico viral en las puntuaciones nunca comprometa el rendimiento del servidor de partida."

---

### Minuto 8:30 – 9:30 | Diapositiva 5: Análisis de Costos y Eficiencia
- **Visual en Pantalla:** Tabla comparativa de costos de Google Cloud por hora y por jugador.
- **Guion Oral:**
  > "Uno de los aspectos más importantes en Cómputo en la Nube es la eficiencia de costos:
  > En Google Cloud (us-central1), mantener este clúster activo cuesta aproximadamente **\$1.14 USD por hora** bajo una carga normal de 1,000 jugadores.
  > Esto representa un costo unitario de apenas **\$0.00114 USD por jugador por hora** (menos de un décimo de centavo de dólar).
  > Y gracias a que Terraform permite destruir y crear los recursos bajo demanda, no incurrimos en gastos residuales cuando el juego no está en uso."

---

### Minuto 9:30 – 10:00 | Diapositiva 6: Conclusiones y Preguntas
- **Visual en Pantalla:** Resumen de logros alcanzados y enlace al repositorio de GitHub.
- **Guion Oral:**
  > "En conclusión:
  > - Logramos un videojuego temático 100% funcional y accesible desde la web.
  > - Demostramos el ciclo de vida de servidores dedicados con Kubernetes y Agones.
  > - Validamos el autoescalado reactivo ante 1,000 jugadores y 500 espectadores.
  > - Y automatizamos todo el ciclo de vida mediante Terraform y CI/CD.
  > Muchas gracias por su atención, quedamos a su disposición para cualquier pregunta."
