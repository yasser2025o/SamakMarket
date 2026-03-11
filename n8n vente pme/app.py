import streamlit as st
import requests
import pandas as pd
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Titre
st.title("📄 Automatisation de Factures pour PME")
st.markdown("Uploadiez une facture PDF pour extraire les données automatiquement.")

# Upload de fichier
uploaded_file = st.file_uploader("Choisissez un PDF", type=["pdf"])

if uploaded_file:
    # Bouton pour déclencher l'extraction
    if st.button("Extraire les données"):
        files = {"file": uploaded_file.read()}
        response = requests.post(
            "http://localhost:5678/webhook/factures",
            files=files
        )
        if response.status_code == 200:
            data = response.json()
            df = pd.DataFrame([data])
            st.write("### Données extraites (à valider)")
            edited_df = st.data_editor(df)

            # Bouton de validation
            if st.button("Valider et enregistrer"):
                save_response = requests.post(
                    "http://localhost:5678/webhook/save-facture",
                    json=edited_df.to_dict("records")[0]
                )
                if save_response.status_code == 200:
                    st.success("Facture enregistrée avec succès !")
                else:
                    st.error("Erreur lors de l'enregistrement.")
        else:
            st.error("Échec de l'extraction. Vérifiez le format du PDF.")
