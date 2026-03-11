from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)
# Charger le modèle (le téléchargement prendra du temps la première fois)
summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")

@app.route('/resumer', methods=['POST'])
def resumer():
    data = request.json
    texte = data.get('texte', '')
    if not texte:
        return jsonify({"erreur": "Aucun texte fourni"}), 400
    summary = summarizer(texte, max_length=130, min_length=30, do_sample=False)
    return jsonify({"resume": summary[0]['summary_text']})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
