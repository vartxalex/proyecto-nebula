# UNIDAD 3 · AUTOEVALUACIÓN DE APRENDIZAJE
## Cómputo en la Nube: Despliegue, Escalado y Métricas en Videojuegos

**Estudiante:** Victoria Alejandra Rauda de la Torre  
**Materia:** Cómputo en la Nube – Unidad 3  
**Fecha:** Noviembre 2026  
**Caso de Estudio:** Nebula Arena  

---

### Pregunta 1
**¿Por qué no conviene ejecutar un servidor de partida en instancias Spot, pero sí el entrenamiento de un bot?**

> **Respuesta:**  
> Las instancias **Spot (o Preemptibles)** ofrecen descuentos de entre 60% y 90%, pero la nube puede reclamarlas y apagarlas en cualquier momento con un aviso de tan solo 30 segundos (en GCP) o 2 minutos (en AWS).  
> - **En el servidor de partida:** Si la máquina se apaga abruptamente, la partida en curso (que mantiene el estado de 10 jugadores en memoria RAM) se corta de golpe, expulsando a los jugadores y arruinando la experiencia. Por ello, los servidores de juego deben ejecutarse siempre en instancias *Bajo Demanda*.
> - **En el entrenamiento de bots de IA:** El entrenamiento es tolerante a fallos porque los algoritmos de aprendizaje por refuerzo (como PPO) guardan **checkpoints periódicos** en disco. Si la instancia Spot es revocada, el trabajo simplemente se reanuda desde el último punto de control guardado en otra instancia sin perder horas de cómputo.

---

### Pregunta 2
**Si cada partida tiene 10 jugadores, hay 4,300 jugadores conectados y quieres un buffer de 20 % sobre los servidores en uso, ¿cuántos GameServers deben existir?**

> **Respuesta y Cálculo Matemático:**  
> 1. Servidores ocupados en partidas activas:
>    $$\text{Servidores en uso} = \frac{4,300\text{ jugadores}}{10\text{ jugadores/partida}} = 430\text{ servidores}$$
> 2. Cálculo del buffer del 20%:
>    - **Enfoque Aditivo (sobre servidores en uso):**
>      $$\text{Buffer} = 430 \times 0.20 = 86\text{ servidores}$$
>      $$\text{Total GameServers} = 430 + 86 = \mathbf{516\text{ servidores}}$$
>    - **Enfoque Agones (`bufferSize: 20%` sobre la flota total):**
>      Agones define que el 20% de toda la flota debe estar en estado `Ready`:
>      $$\text{Total} = \left\lceil \frac{430}{1 - 0.20} \right\rceil = \left\lceil \frac{430}{0.80} \right\rceil = \mathbf{538\text{ servidores (108 en Ready)}}$$
> *(Ambas respuestas son válidas según el criterio de cálculo especificado en la pág. 24 del libro de la unidad).*

---

### Pregunta 3
**¿Qué diferencia hay entre el HPA, el FleetAutoscaler de Agones y el Cluster Autoscaler?**

> **Respuesta:**  
> El sistema implementa autoescalado en **tres capas distintas**, cada una guiada por métricas y objetos específicos:
> 1. **Agones FleetAutoscaler (Capa de Partidas con Estado):** Ajusta el número de réplicas de `GameServer` listos en función de un **buffer de servidores en estado `Ready`**, garantizando que los servidores con partidas activas (`Allocated`) nunca sean destruidos al reducir la flota.
> 2. **Horizontal Pod Autoscaler - HPA (Capa de Servicios sin Estado):** Ajusta réplicas de pods comunes (como el matchmaking, login o la web) guiándose por **métricas de uso promedio de CPU, memoria o peticiones por segundo**.
> 3. **Cluster Autoscaler (Capa de Infraestructura Física):** Agrega o elimina **máquinas virtuales (nodos del clúster)** cuando detecta que hay pods en estado `Pending` que no caben por falta de recursos de CPU o memoria en los nodos existentes.

---

### Pregunta 4
**¿Qué métrica de streaming eleva más el costo y cómo se reduce?**

> **Respuesta:**  
> La métrica que más eleva el costo es el **Egress (Salida de datos hacia internet)**, ya que los proveedores de nube cobran por cada Gigabyte transferido hacia los usuarios.  
> Se reduce mediante:
> 1. **Redes de Distribución de Contenido (CDN):** Servir los fragmentos de video (HLS) desde servidores de borde en caché, evitando descargar repetidamente el video desde el origen.
> 2. **Bitrate Adaptativo (ABR):** Generar perfiles de resolución escalonada (ej. 360p, 720p, 1080p), de modo que solo los usuarios con pantallas grandes y alta velocidad consuman streams de alto bitrate.
> 3. **Códecs de video modernos:** Utilizar H.265 (HEVC) o AV1 para reducir el tamaño de los datos manteniendo alta fidelidad visual.

---

### Pregunta 5
**15,000 espectadores a 4,500 kbps durante 2 horas, ¿cuántos TB de egress generan?**

> **Respuesta y Procedimiento:**  
> Aplicando la fórmula oficial:
> $$\text{GB} = \frac{\text{CCV} \times \text{bitrate (kbps)} \times \text{segundos}}{8 \times 10^6}$$
> - $\text{CCV} = 15,000$
> - $\text{Bitrate} = 4,500\text{ kbps}$
> - $\text{Tiempo} = 2\text{ horas} = 7,200\text{ segundos}$
> 
> $$\text{GB} = \frac{15,000 \times 4,500 \times 7,200}{8,000,000} = \frac{486,000,000,000}{8,000,000} = \mathbf{60,750\text{ GB}}$$
> $$\text{Transferencia en Terabytes} = \frac{60,750\text{ GB}}{1,000} = \mathbf{60.75\text{ Terabytes (TB)}}$$

---

### Pregunta 6
**Menciona tres funciones de Nebula Arena adecuadas para serverless y una que no lo es, con su razón.**

> **Respuesta:**  
> - **Adecuadas para Serverless:**
>   1. *Tabla de líderes y rankings (`/top`):* Operación ligera de lectura y escritura en base de datos NoSQL con tráfico en ráfagas.
>   2. *Login y autenticación de usuarios:* Proceso sin estado que valida credenciales y entrega tokens JWT.
>   3. *Generación de clips y miniaturas de video:* Proceso asíncrono disparado únicamente cuando se sube un nuevo archivo al bucket.
> - **NO adecuada para Serverless:**
>   - *El Servidor de Partidas en Tiempo Real:* Requiere mantener las físicas y colisiones del juego en memoria a 20-60 ticks por segundo, manteniendo conexiones WebSocket o UDP de larga duración. Las funciones serverless tienen límites estrictos de tiempo de ejecución (máximo 15 min en Lambda) y sufren de arranque en frío (cold start), lo cual congelaría el juego.

---

### Pregunta 7
**¿Qué es el drift en Terraform y con qué comando se detecta?**

> **Respuesta:**  
> El **Drift (Deriva de configuración)** es la discrepancia que surge entre el estado definido en los archivos de código (`.tf`) y la infraestructura real existente en la nube, producida generalmente cuando un usuario o administrador modifica, agrega o elimina recursos directamente desde la consola web del proveedor o mediante scripts manuales.  
> Se detecta ejecutando:
> ```bash
> terraform plan
> ```
> O mediante `terraform refresh` / `terraform plan -refresh-only`, el cual consulta las APIs de la nube, compara los recursos vivos contra el archivo de estado (`terraform.tfstate`) y lista las diferencias.

---

### Pregunta 8
**En la curva CCU vs latencia p95, ¿cómo identificas la capacidad máxima de un nodo?**

> **Respuesta:**  
> La capacidad máxima se identifica localizando el **punto de inflexión de la curva ("knee of the curve")**, que es el número exacto de jugadores concurrentes donde la latencia p95 comienza a crecer de forma exponencial o supera el umbral del acuerdo de nivel de servicio (SLA, típicamente **80 ms**).  
> Una vez identificado el total de jugadores en ese punto crítico (por ejemplo, 1,150 jugadores antes del quiebre), se divide dicho valor entre el número de nodos activos en ese instante:
> $$\text{Capacidad por nodo} = \frac{\text{CCU en el punto de inflexión}}{\text{Nodos físicos activos}}$$
> En nuestro caso de estudio: $\frac{1,150\text{ CCU}}{10\text{ nodos}} \approx \mathbf{115\text{ jugadores por nodo}}$ (aproximadamente 12 servidores de partida por máquina).
