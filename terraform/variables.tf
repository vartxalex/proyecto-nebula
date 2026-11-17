variable "project_id" {
  description = "ID del proyecto en Google Cloud Platform"
  type        = string
  default     = "mystic-messenger-cloud-prod"
}

variable "region" {
  description = "Región de GCP para el clúster (ej. us-central1)"
  type        = string
  default     = "us-central1"
}

variable "cluster_name" {
  description = "Nombre del clúster GKE para el videojuego"
  type        = string
  default     = "mystic-messenger-gke"
}

variable "system_node_count" {
  description = "Cantidad fija de nodos para cargas del sistema y frontend"
  type        = number
  default     = 1
}

variable "system_machine_type" {
  description = "Tipo de máquina para los nodos del sistema"
  type        = string
  default     = "e2-standard-2"
}

variable "min_game_nodes" {
  description = "Número mínimo de nodos en el pool de Agones (autoescalado)"
  type        = number
  default     = 1
}

variable "max_game_nodes" {
  description = "Número máximo de nodos en el pool de Agones para picos de carga (1,000 jugadores)"
  type        = number
  default     = 6
}

variable "game_machine_type" {
  description = "Tipo de máquina para los nodos de GameServers (ej. e2-standard-4)"
  type        = string
  default     = "e2-standard-4"
}
