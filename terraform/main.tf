/**
 * Terraform Configuration for Google Kubernetes Engine (GKE) + Agones Game Cluster
 * Materia: Cómputo en la Nube - Unidad 3
 */

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.25.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.13.0"
    }
  }

  # Configuración para estado remoto (puede activarse con bucket GCS)
  # backend "gcs" {
  #   bucket = "mystic-messenger-tf-state"
  #   prefix = "terraform/state"
  # }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Red VPC dedicada para el Clúster
resource "google_compute_network" "game_vpc" {
  name                    = "${var.cluster_name}-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "game_subnet" {
  name          = "${var.cluster_name}-subnet"
  ip_cidr_range = "10.10.0.0/20"
  region        = var.region
  network       = google_compute_network.game_vpc.id

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.20.0.0/16"
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.30.0.0/20"
  }
}

# Regla de Firewall para los puertos dinámicos de Agones GameServers (UDP y TCP)
resource "google_compute_firewall" "agones_game_ports" {
  name    = "${var.cluster_name}-agones-ports"
  network = google_compute_network.game_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["7000-8000", "8080"]
  }

  allow {
    protocol = "udp"
    ports    = ["7000-8000"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["game-server-node"]
}

# Clúster GKE Principal
resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.region

  # Eliminamos el node pool por defecto para gestionarlo explícitamente
  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.game_vpc.name
  subnetwork = google_compute_subnetwork.game_subnet.name

  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  # Soporte para Workload Identity
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  maintenance_policy {
    daily_maintenance_window {
      start_time = "04:00"
    }
  }

  deletion_protection = false
}

# Node Pool del Sistema (Para controladores, ingress y observabilidad)
resource "google_container_node_pool" "system_nodes" {
  name       = "system-node-pool"
  location   = var.region
  cluster    = google_container_cluster.primary.name
  node_count = var.system_node_count

  node_config {
    machine_type = var.system_machine_type
    oauth_scopes = ["https://www.googleapis.com/auth/cloud-platform"]

    labels = {
      role = "system"
    }

    metadata = {
      disable-legacy-endpoints = "true"
    }
  }
}

# Node Pool Dedicado para Agones GameServers con AUTOESCALADO DE NODOS
resource "google_container_node_pool" "game_nodes" {
  name       = "game-node-pool"
  location   = var.region
  cluster    = google_container_cluster.primary.name

  # Autoescalado de Nodos para absorber picos de jugadores (1,000+ jugadores)
  autoscaling {
    min_node_count = var.min_game_nodes
    max_node_count = var.max_game_nodes
  }

  node_config {
    machine_type = var.game_machine_type
    oauth_scopes = ["https://www.googleapis.com/auth/cloud-platform"]
    tags         = ["game-server-node"]

    labels = {
      "agones.dev/agones-system" = "true"
      role                       = "game-server"
    }

    metadata = {
      disable-legacy-endpoints = "true"
    }
  }
}
