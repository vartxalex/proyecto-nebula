variable "proyecto" {
  description = "ID del proyecto en Google Cloud Platform"
  type        = string
  default     = "mystic-messenger-cloud-prod"
}

variable "region" {
  description = "Región de despliegue para Nebula Arena"
  type        = string
  default     = "us-central1"
}

variable "nodos_juego" {
  description = "Nodos iniciales del pool de servidores de juego"
  type        = number
  default     = 3
}
