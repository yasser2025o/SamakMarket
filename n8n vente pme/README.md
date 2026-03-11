# Automatisation de Factures pour PME avec n8n et Streamlit

Ce projet permet d'automatiser l'extraction et l'enregistrement des données de factures PDF pour les PME.

## Prérequis
- n8n installé localement (version 1.0+)
- Python 3.8+ et les dépendances (`streamlit`, `pandas`, `requests`, `python-dotenv`)
- Un LLM local comme Syrealit (optionnel, sinon utilisation de regex)
- Une feuille Google Sheets configurée pour recevoir les données

## Installation
1. Importez le fichier `workflow_factures.json` dans votre instance n8n.
2. Configurez le webhook `factures` pour recevoir les fichiers PDF.
3. Installez les dépendances Python : `pip install -r requirements.txt`.
4. Créez un fichier `.env` avec vos clés API (Google Sheets, SMTP).
5. Lancez l'application Streamlit : `streamlit run app.py`.

## Utilisation
- Upload un fichier PDF via l'interface Streamlit.
- Validez les données extraites.
- Les données sont enregistrées dans Google Sheets et un email de confirmation est envoyé.

## Personnalisation
- Adaptez les regex dans le node `Nettoyer les données` pour correspondre à vos factures.
- Modifiez le prompt du LLM dans le node `Envoyer au LLM Syrealit` si nécessaire.
