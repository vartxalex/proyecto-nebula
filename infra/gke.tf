resource "google_container_cluster" "nebula" {
  name                     = "nebula-${terraform.workspace}"
  location                 = "${var.region}-a"
  network                  = google_compute_network.vpc.id
  remove_default_node_pool = true
  initial_node_count       = 1
  deletion_protection      = false
}

resource "google_container_node_pool" "juego" {
  name               = "game-pool"
  cluster            = google_container_cluster.nebula.id
  initial_node_count = var.nodos_juego

  autoscaling {
    min_node_count = 3
    max_node_count = 20
  }

  node_config {
    machine_type = "e2-standard-4"
    tags         = ["game-server"]
    labels       = { rol = "juego" }
  }
}

resource "google_artifact_registry_repository" "imagenes" {
  location      = var.region
  repository_id = "nebula"
  format        = "DOCKER"
}
