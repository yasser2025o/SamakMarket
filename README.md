# <img src="https://img.icons8.com/fluency/48/fish.png" width="32" valign="middle"/> SamakMarket

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0077b6&height=220&section=header&text=SamakMarket%20%F0%9F%90%9F&subtitle=La%20Plateforme%20Digitale%20des%20Produits%20de%20la%20Mer%20au%20Maroc&fontSize=42&fontColor=ffffff&subFontSize=18" alt="SamakMarket Header"/>
</p>

<!-- Horloges Dynamiques Mondiales (SVG Animé) -->
<p align="center">
  <svg width="450" height="80" viewBox="0 0 450 80" xmlns="http://www.w3.org/2000/svg">
    <style>
      .clock-face { fill: #03045e; stroke: #00b4d8; stroke-width: 1.5; }
      .clock-text { fill: #ffffff; font-family: 'Segoe UI', sans-serif; font-size: 11px; font-weight: bold; text-anchor: middle; }
      .hand { stroke: #00f5d4; stroke-linecap: round; transform-origin: center; }
      .hour { stroke-width: 2.5; }
      .minute { stroke-width: 1.5; }
    </style>

    <!-- HORLOGE 1 : TANGER -->
    <g transform="translate(75, 35)">
      <circle r="25" class="clock-face"/>
      <line x1="25" y1="25" x2="25" y2="13" class="hand hour">
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="43200s" repeatCount="indefinite"/>
      </line>
      <line x1="25" y1="25" x2="25" y2="8" class="hand minute">
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3600s" repeatCount="indefinite"/>
      </line>
      <circle cx="25" cy="25" r="2" fill="#ffffff"/>
      <text x="25" y="42" class="clock-text">TANGER (WET)</text>
    </g>

    <!-- HORLOGE 2 : NEW YORK -->
    <g transform="translate(225, 35)">
      <circle r="25" class="clock-face"/>
      <line x1="25" y1="25" x2="25" y2="13" class="hand hour" transform="rotate(-150 25 25)">
        <animateTransform attributeName="transform" type="rotate" from="-150" to="210" dur="43200s" repeatCount="indefinite"/>
      </line>
      <line x1="25" y1="25" x2="25" y2="8" class="hand minute">
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3600s" repeatCount="indefinite"/>
      </line>
      <circle cx="25" cy="25" r="2" fill="#ffffff"/>
      <text x="25" y="42" class="clock-text">NEW YORK (EST)</text>
    </g>

    <!-- HORLOGE 3 : TOKYO -->
    <g transform="translate(375, 35)">
      <circle r="25" class="clock-face"/>
      <line x1="25" y1="25" x2="25" y2="13" class="hand hour" transform="rotate(240 25 25)">
        <animateTransform attributeName="transform" type="rotate" from="240" to="600" dur="43200s" repeatCount="indefinite"/>
      </line>
      <line x1="25" y1="25" x2="25" y2="8" class="hand minute">
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3600s" repeatCount="indefinite"/>
      </line>
      <circle cx="25" cy="25" r="2" fill="#ffffff"/>
      <text x="25" y="42" class="clock-text">TOKYO (JST)</text>
    </g>
  </svg>
</p>

<p align="center">
  <a href="#-fonctionnalités-clés"><img src="https://img.shields.io/badge/Version-2.0.0-blue?style=for-the-badge&logo=github" alt="Version"/></a>
  <img src="https://img.shields.io/badge/Environnement-Local-orange?style=for-the-badge&logo=powershell" alt="Environnement"/>
  <img src="https://img.shields.io/badge/Langues-FR%20%7C%20AR%20%7C%20Darija%20%7C%20Amazigh-success?style=for-the-badge" alt="Multilingue"/>
</p>

---

## 🌊 À Propos du Projet

**SamakMarket** est une place de marché numérique (*Pure Marketplace*) spécialisée et optimisée pour la mise en relation directe entre les vendeurs de produits de la mer locaux au Maroc et les acheteurs particuliers.

> 🎯 **Règle métier fondamentale :** La plateforme fait office de passerelle numérique et de tiers de confiance géolocalisé. **SamakMarket n'est pas responsable de la logistique ni de la livraison** ; le contact et la transaction s'effectuent directement de vendeur à client.

---

## ✨ Fonctionnalités Clés

| Fonctionnalité | Description | Statut |
| :--- | :--- | :---: |
| 📍 **Recherche Géolocalisée** | Filtres précis par région/ville avec calcul de distance dynamique (Haversine). | `Opérationnel` |
| 🪸 **Aquarium Privé 3D** | Expérience utilisateur immersive en 3D (Three.js) mettant en avant les valeurs clés (0% commission). | `Opérationnel` |
| 🤖 **Agent WhatsApp Bot** | Prise de commande automatisée et gestion de tunnel d'achat sans quitter WhatsApp. | `Opérationnel` |
| 🌍 **Interface Multilingue** | Support intégral du Français, de l'Arabe (RTL), du Darija et de l'Amazigh. | `Opérationnel` |
| 📰 **IA Content Aggregator** | Script autonome de curation de médias et de génération de résumés automatiques. | `Opérationnel` |

---

## ⚡ La Fonctionnalité Phare : Le Radar Géo-Maritime (Modèle Uber / inDrive)

À l'instar d'**Uber** ou d'**inDrive**, *SamakMarket* repose sur un moteur de mise en relation géolocalisé en temps réel. La plateforme n'intervient pas dans le transport : elle agit comme un **radar numérique** connectant instantanément l'acheteur au stock de poisson frais disponible le plus proche.

<p align="center">
  <!-- Animation Radar SVG Fluide -->
  <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="radarSweep" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00b4d8" stop-opacity="0.6"/>
        <stop offset="50%" stop-color="#0077b6" stop-opacity="0.1"/>
        <stop offset="100%" stop-color="#03045e" stop-opacity="0"/>
      </linearGradient>
    </defs>
    
    <circle cx="100" cy="100" r="95" fill="#03045e" stroke="#00b4d8" stroke-width="2"/>
    <circle cx="100" cy="100" r="70" fill="none" stroke="#0077b6" stroke-width="1" stroke-dasharray="4 4"/>
    <circle cx="100" cy="100" r="45" fill="none" stroke="#0077b6" stroke-width="1"/>
    <circle cx="100" cy="100" r="20" fill="none" stroke="#0077b6" stroke-width="1"/>
    
    <line x1="5" y1="100" x2="195" y2="100" stroke="#0077b6" stroke-width="0.5"/>
    <line x1="100" y1="5" x2="100" y2="195" stroke="#0077b6" stroke-width="0.5"/>
    
    <circle cx="65" cy="75" r="4" fill="#00f5d4">
      <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="140" cy="120" r="5" fill="#00f5d4">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="110" cy="50" r="3" fill="#00f5d4">
      <animate attributeName="opacity" values="0.1;0.9;0.1" dur="2.5s" repeatCount="indefinite"/>
    </circle>
    
    <g transform="translate(100,100)">
      <polygon points="0,0 -20,-95 20,-95" fill="url(#radarSweep)"/>
      <line x1="0" y1="0" x2="0" y2="-95" stroke="#00f5d4" stroke-width="1.5"/>
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite"/>
    </g>
    <circle cx="100" cy="100" r="3" fill="#ffffff"/>
  </svg>
</p>

### 📡 Comment fonctionne le "Scan de Proximité" ?

* **Calcul de Distance Dynamique (Formule Haversine) :** Le backend Express calcule instantanément la distance vectorielle entre les coordonnées GPS de l'acheteur et celles des marchands via la courbure terrestre.
* **Ajustement en Temps Réel :** L'utilisateur définit son périmètre de recherche via un curseur dynamique (ex: de 1 à 20 km) synchronisé instantanément avec le store réactif **Pinia**.
* **L'Esprit "inDrive" (Liberté Totale) :** 0% de commission prélevée. Dès que le radar trouve le produit, un clic bascule l'acheteur sur une discussion WhatsApp automatisée pour convenir en direct des modalités de récupération.

---

## 📸 Aperçu Visuel et Animations

### 🖥️ Expérience Client & Aquarium Interactif
<p align="center">
  <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2I1bTZicnd4ZzVwMXM2YmtvOXAwZm1oYm5yd2tsMHZ0ZHZtcTZpayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/31K08Lp36Xv9W915K2/giphy.gif" width="800" alt="Animation UI Aquarium et Produits Secs"/>
  <br>
  <i>Interface fluide combinant cartographie interactive Leaflet et vitrine produit immersive.</i>
</p>

### 💬 Automatisation et Connecteur WhatsApp Agent
<p align="center">
  <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3hpeDRub2o0YTZsOGE4Y3JldzdwbXRmdXpyOWM3ZDJqNm5md2E0byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/d1E2Vyh9n9N9K/giphy.gif" width="320" alt="WhatsApp Automation Flow Animation"/>
  <br>
  <i>Orchestration des commandes en temps réel via l'agent n8n relié à WhatsApp Web.</i>
</p>

---

## 📊 Métriques & Objectifs du Projet (Metrics)

### 📈 Phase de Lancement
Le projet suit une stratégie de déploiement local progressive et ciblée afin de stabiliser le site avant l'échelle nationale.

| Métrique | Objectif Actuel | Statut |
| :--- | :---: | :---: |
| 🏪 Vendeurs Pilotes | **5 Marchands locaux** | `En cours (Test)` |
| 🛡️ Taux de Commission | **0% (Pure Gateway)** | `Garanti` |
| ⚡ Temps de Réponse API | **< 150ms** | `Optimisé` |
| 🌍 Couverture Linguistique | **4 Langues (FR, AR, Darija, Amazigh)** | `100% Implémenté` |

### 🛠️ Indicateurs Techniques & Architecture
* **Zéro Conteneurisation :** 100% optimisé pour un environnement d'exécution local natif (PowerShell) afin de maximiser les performances disque et CPU sur machine hôte.
* **Algorithme Wilson Score :** Fiabilité des avis clients calculée mathématiquement pour éviter les manipulations de notes.
* **Mise en cache Pinia :** Réduction de **40%** des requêtes réseau redondantes pour la gestion des listes de poissons.

---

## 🛠️ Pile Technique

L'architecture est construite pour être rapide, robuste et légère, sans surcharge de conteneurs :
* **Frontend :** Vue 3 (Composition API), Vite, Pinia, Tailwind CSS, Three.js, Leaflet.
* **Backend :** Node.js, Express (Architecture MVC), API Baileys (Passerelle WhatsApp).
* **Données :** MySQL (Cloud Aiven) / PostgreSQL (Neon).
* **Automation & Scripts IA :** n8n Workflow Engine, Python (Scraping dynamique et ingestion de photos).

---

## 📂 Architecture Globale

```text
├── backend/                       # API Serveur Node.js & Logique Métier
│   ├── config/                    # Connexions MySQL/PostgreSQL (Cloud Aiven)
│   ├── controllers/               # Authentification, Annonces, Publicités, Modération
│   ├── models/                    # Modèles de données (User, Product, Ad, Review)
│   └── whatsapp-agent.js          # Serveur de gestion de session WhatsApp
├── frontend/                      # Client Single Page Application (Vue 3)
│   ├── src/components/            # Composants UI réutilisables (Cartes, Évaluations)
│   ├── src/locales/               # Fichiers i18n (fr, ar, darija, amazigh)
│   └── src/stores/                # Gestion d'état global avec Pinia (i18n, radar)
└── n8n json file & script & bat/  # Workflows automatisés & Scripts Python IA
