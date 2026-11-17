# 🎮 Mystic Messenger: RFA Party Defense Protocol
## Proyecto Unidad 3 – Cómputo en la Nube

Videojuego web temático con arquitectura nativa de nube en **Kubernetes**, servidores dedicados gestionados con **Agones**, infraestructura como código con **Terraform**, pruebas de carga masivas con **Locust**, observabilidad con **Prometheus & Grafana**, y servicios **Serverless**.

---

## 📂 Estructura del Repositorio

- **`game/`**: Videojuego web accesible desde el navegador (HTML5, CSS3, JavaScript, Web Audio API, UI fiel a Mystic Messenger).
- **`server/`**: Servidor de partidas dedicado en Node.js con soporte nativo de Agones SDK y métricas para Prometheus.
- **`k8s/`**: Manifiestos de Kubernetes (`Fleet`, `FleetAutoscaler`, `Deployment`, `HPA`, `Service LoadBalancer`).
- **`terraform/`**: Infraestructura como Código para aprovisionar el clúster GKE con Node Pools autoescalables.
- **`load-tests/`**: Pruebas de carga con Locust (1,000 jugadores concurrentes + 500 espectadores y extrapolación a 20,000).
- **`serverless/`**: Función Cloud Serverless para la tabla de líderes y puntuaciones globales.
- **`monitoring/`**: Configuración de scraping de Prometheus y Dashboard de Grafana listo para importar.
- **`.github/workflows/`**: Pipeline de CI/CD automatizado con GitHub Actions.
- **`docs/`**: Reporte técnico formal (6 páginas) y Guion de la presentación de 10 minutos.

---

## ⚡ Guía de Inicio Rápido

### 1. Probar el Videojuego Localmente
```bash
cd server
npm install
npm start
```
Abre en tu navegador: `http://localhost:8080`.

### 2. Desplegar la Infraestructura con Terraform (Google Cloud)
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edita tu project_id en terraform.tfvars
terraform init
terraform plan
terraform apply -auto-approve
```

### 3. Conectar kubectl y Desplegar Agones & Juego
```bash
# Conectar al clúster creado
$(terraform output -raw get_credentials_command)

# Desplegar la Flota y Autoescalador de Agones
kubectl apply -f ../k8s/agones-fleet.yaml
kubectl apply -f ../k8s/agones-autoscaler.yaml
kubectl apply -f ../k8s/frontend-deployment.yaml
kubectl apply -f ../k8s/ingress-service.yaml

# Verificar que los GameServers estén en estado READY
kubectl get fleet
kubectl get gameservers
```

### 4. Ejecutar las Pruebas de Carga (Locust)
```bash
cd load-tests
pip install locust
locust -f locustfile.py --host http://localhost:8080
```
Visita `http://localhost:8089` para iniciar la prueba con 1,500 usuarios.

---

## 📑 Entregables Académicos
- [Reporte Técnico de 6 Páginas](docs/reporte_tecnico_6_paginas.md)
- [Guion de Presentación de 10 Minutos](docs/guion_presentacion_10_min.md)
