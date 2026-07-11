<!-- START_SECTION:clocks -->
<div align="center">
  <img src="https://shields.io🗼%20Tokyo-02:43-111111?style=for-the-badge" alt="Tokyo" />
  <img src="https://shields.io🇲🇦%20Tanger-18:43-111111?style=for-the-badge" alt="Tanger" />
  <img src="https://shields.io🗽%20New%20York-13:43-111111?style=for-the-badge" alt="New York" />
  <img src="https://shields.io🇸🇬%20Singapour-01:43-111111?style=for-the-badge" alt="Singapour" />
  <br />
  <sub><i>Dernière mise à jour : 11/07/2026 17:43 UTC</i></sub>
</div>
<!-- END_SECTION:clocks -->
# <img src="https://img.icons8.com/fluency/48/fish.png" width="32" valign="middle"/> SamakMarket

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0077b6&height=220&section=header&text=SamakMarket%20%F0%9F%90%9F&subtitle=La%20Plateforme%20Digitale%20des%20Produits%20de%20la%20Mer%20au%20Maroc&fontSize=42&fontColor=ffffff&subFontSize=18" alt="SamakMarket Header"/>
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

## 📸 Aperçu Visuel et Animations
---

## 📊 Métriques & Objectifs du Projet (Metrics)

### 📈 Phase de Lancement (Juin/Juillet 2026)
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
* **Mise en cache Pinia :** Réduction de **40%** des requêtes réseau redondantes pour la gestion des listes de poissons et la traduction des interfaces.

---
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

## 🛠️ Pile Technique

L'architecture est construite pour être rapide, robuste et légère, sans surcharge de conteneurs :

* **Frontend :** Vue 3 (Composition API), Vite, Pinia (Mise en cache intelligente), Tailwind CSS, Three.js, Leaflet.
* **Backend :** Node.js, Express (Architecture MVC), API Baileys (Passerelle WhatsApp).
* **Données :** MySQL (Hébergement Cloud Aiven) / PostgreSQL (Neon).
* **Automation & Scripts IA :** n8n Workflow Engine, Python (Scraping dynamique et ingestion de photos d'illustration).

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
│   └── src/stores/                # Gestion d'états Pinia locaux
└── n8n json file & script & bat/  # Workflows automatisés & Scripts Python IA
