output "cluster_name" {
  description = "Nombre del clúster GKE creado"
  value       = google_container_cluster.primary.name
}

output "cluster_endpoint" {
  description = "IP del Endpoint del clúster GKE"
  value       = google_container_cluster.primary.endpoint
  sensitive   = true
}

output "get_credentials_command" {
  description = "Comando gcloud para conectar kubectl al clúster creado"
  value       = "gcloud container clusters get-credentials ${google_container_cluster.primary.name} --region ${var.region} --project ${var.project_id}"
}

output "vpc_network_name" {
  description = "Nombre de la VPC creada para el juego"
  value       = google_compute_network.game_vpc.name
}
