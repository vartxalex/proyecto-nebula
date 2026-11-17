output "cluster" {
  description = "Nombre del clúster GKE creado para Nebula Arena"
  value       = google_container_cluster.nebula.name
}

output "registro" {
  description = "Ruta completa de Artifact Registry para subir la imagen Docker"
  value       = "${var.region}-docker.pkg.dev/${var.proyecto}/nebula"
}
