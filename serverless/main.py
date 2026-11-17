from flask import Flask, request, jsonify
from google.cloud import firestore

app = Flask(__name__)

# Inicialización tolerante a fallos si no se encuentra en GCP
try:
    db = firestore.Client()
except Exception:
    db = None

cached_scores = [
    {"jugador": "707_Luciel", "puntos": 1450},
    {"jugador": "Victoria_MC", "puntos": 1280},
    {"jugador": "Jumin_Cat", "puntos": 980}
]

@app.post("/score")
def guardar():
    d = request.get_json() or {}
    jugador = d.get("jugador", "Anonimo")
    puntos = d.get("puntos", 0)

    if db:
        try:
            db.collection("scores").document(jugador).set(
                {"puntos": firestore.Increment(puntos)}, merge=True
            )
        except Exception as e:
            print("Error en Firestore:", e)
    else:
        cached_scores.append({"jugador": jugador, "puntos": puntos})
        cached_scores.sort(key=lambda x: x["puntos"], reverse=True)

    return "ok", 201

@app.get("/top")
def top():
    if db:
        try:
            q = db.collection("scores").order_by("puntos", direction=firestore.Query.DESCENDING).limit(10)
            return jsonify([{"jugador": d.id, **d.to_dict()} for d in q.stream()])
        except Exception:
            pass
    return jsonify(cached_scores[:10])

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
