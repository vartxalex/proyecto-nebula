resource "google_compute_network" "vpc" {
  name                    = "nebula-vpc"
  auto_create_subnetworks = true
}

resource "google_compute_firewall" "juego" {
  name          = "nebula-gameservers"
  network       = google_compute_network.vpc.name
  target_tags   = ["game-server"]
  source_ranges = ["0.0.0.0/0"]

  allow {
    protocol = "udp"
    ports    = ["7000-8000"]
  }

  allow {
    protocol = "tcp"
    ports    = ["7000-8000"]
  }
}
