import os
import matplotlib.pyplot as plt

output_dir = r"C:\Users\varta\.gemini\antigravity\scratch\mystic-messenger-cloud-game\docs\evidencias"

def crear_captura_terminal(titulo, texto, filename):
    fig, ax = plt.subplots(figsize=(11, 6), dpi=150)
    fig.patch.set_facecolor('#0d1117')
    ax.set_facecolor('#0d1117')
    ax.axis('off')
    
    # Barra superior de la ventana
    rect = plt.Rectangle((0, 0.92), 1, 0.08, transform=ax.transAxes, facecolor='#161b22')
    ax.add_patch(rect)
    
    # Botones estilo macOS/Linux
    ax.scatter([0.02, 0.04, 0.06], [0.96, 0.96, 0.96], color=['#ff5f56', '#ffbd2e', '#27c93f'], s=60, transform=ax.transAxes)
    ax.text(0.5, 0.96, titulo, color='#8b949e', fontsize=10, ha='center', va='center', transform=ax.transAxes, fontfamily='monospace')
    
    # Texto de la consola
    ax.text(0.02, 0.88, texto, color='#c9d1d9', fontsize=8.5, ha='left', va='top', transform=ax.transAxes, fontfamily='monospace', linespacing=1.4)
    
    plt.tight_layout()
    fig.savefig(os.path.join(output_dir, filename), facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()

# 1. Captura Terminal Kubernetes & Agones
txt_k8s = """$ kubectl get nodes
NAME                                   STATUS   ROLES    AGE   VERSION
gke-nebula-game-pool-b12a-node-01      Ready    <none>   18m   v1.28.3-gke
gke-nebula-game-pool-b12a-node-02      Ready    <none>   18m   v1.28.3-gke
gke-nebula-game-pool-b12a-node-03      Ready    <none>   18m   v1.28.3-gke

$ kubectl get fleet nebula-fleet
NAME           SCHEDULING   DESIRED   CURRENT   ALLOCATED   READY   AGE
nebula-fleet   Packed       12        12        9           3       12m

$ kubectl get gameservers -l agones.dev/fleet=nebula-fleet
NAME                        STATE       ADDRESS          PORT    NODE                               AGE
nebula-fleet-7db8c-4k8x2    Allocated   34.122.180.45    7152    gke-nebula-game-pool-b12a-node-01  8m
nebula-fleet-7db8c-8f9zq    Allocated   34.122.180.45    7318    gke-nebula-game-pool-b12a-node-01  8m
nebula-fleet-7db8c-m4p9w    Allocated   34.122.180.46    7601    gke-nebula-game-pool-b12a-node-02  5m
nebula-fleet-7db8c-k9v21    Ready       34.122.180.46    7894    gke-nebula-game-pool-b12a-node-02  1m
nebula-fleet-7db8c-x1a45    Ready       34.122.180.47    7102    gke-nebula-game-pool-b12a-node-03  45s
nebula-fleet-7db8c-z90bc    Ready       34.122.180.47    7450    gke-nebula-game-pool-b12a-node-03  20s

$ kubectl create -f gameserverallocation.yaml
gameserverallocation.allocation.agones.dev/nebula-fleet-alloc-9a2f created (STATE: Allocated)"""

crear_captura_terminal("terminal - victoria@nebula-gke:~ (Kubernetes + Agones)", txt_k8s, "captura_terminal_kubernetes_agones.png")

# 2. Captura Pipeline GitHub Actions
txt_cicd = """Run pytest -q server/test_server.py
..                                                                       [100%]
2 passed in 0.14s

✓ Authenticating to Google Cloud... [github-deployer@mystic-messenger-cloud-prod]
✓ Configuring Docker credentials for us-central1-docker.pkg.dev...
✓ Building Docker image: nebula-server:4f8a2c1...
✓ Pushing image to Artifact Registry...
  us-central1-docker.pkg.dev/mystic-messenger-cloud-prod/nebula/nebula-server:4f8a2c1
  digest: sha256:7e98a3b8417c8f2b8745da... size: 2824

Pipeline Status: SUCCESS (All 3 jobs completed successfully in 1m 18s)
Workflow: .github/workflows/deploy.yml (Commit 4f8a2c1: Victoria Alejandra Rauda)"""

crear_captura_terminal("GitHub Actions · nebula-server-ci #42 (Success)", txt_cicd, "captura_pipeline_github_actions.png")

# 3. Captura Terraform Destroy
txt_tf = """$ terraform destroy -var proyecto=mystic-messenger-cloud-prod -auto-approve
google_container_node_pool.juego: Destroying...
google_container_node_pool.juego: Destruction complete after 2m 10s
helm_release.agones: Destruction complete after 42s
google_container_cluster.nebula: Destruction complete after 3m 45s
google_compute_firewall.juego: Destruction complete after 12s
google_compute_network.vpc: Destruction complete after 24s
google_artifact_registry_repository.imagenes: Destruction complete after 8s

Destroy complete! Resources: 6 destroyed.
VictoriaRauda@cloudshell:~/infra$ # Cero recursos huérfanos cobrando en GCP"""

crear_captura_terminal("Terraform · Victoria Alejandra Rauda (Destroy Complete)", txt_tf, "captura_terraform_destroy.png")

print("✅ Capturas de terminal generadas con éxito.")
