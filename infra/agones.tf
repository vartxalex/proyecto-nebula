data "google_client_config" "actual" {}

provider "helm" {
  kubernetes {
    host                   = "https://${google_container_cluster.nebula.endpoint}"
    token                  = data.google_client_config.actual.access_token
    cluster_ca_certificate = base64decode(google_container_cluster.nebula.master_auth[0].cluster_ca_certificate)
  }
}

resource "helm_release" "agones" {
  name             = "agones"
  repository       = "https://agones.dev/chart/stable"
  chart            = "agones"
  namespace        = "agones-system"
  create_namespace = true
  depends_on       = [google_container_node_pool.juego]
}
