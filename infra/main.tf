terraform {
  required_version = ">= 1.6"
  required_providers {
    google = { source = "hashicorp/google", version = "~> 5.25" }
    helm   = { source = "hashicorp/helm", version = "~> 2.13" }
  }

  backend "gcs" {
    bucket = "nebula-tfstate-victoria-rauda"
    prefix = "dev"
  }
}

provider "google" {
  project = var.proyecto
  region  = var.region
}
