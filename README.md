# 🐟 SamakMarket — Guide d'installation complet

## Architecture du projet

```
SamakMarket/
│
├── backend/                    ← API Node.js + Express
│   ├── .env.example            ← Copier en .env et remplir
│   ├── database.sql            ← Script SQL à exécuter dans MySQL Workbench
│   ├── server.js               ← Point d'entrée du serveur
│   │
│   ├── config/
│   │   └── database.js         ← Connexion MySQL via Sequelize
│   │
│   ├── models/                 ← Structure des tables en JavaScript
│   │   ├── index.js            ← Import + associations (relations)
│   │   ├── User.js             ← Table users
│   │   ├── Product.js          ← Table products
│   │   ├── Ad.js               ← Table ads (publicités)
│   │   ├── Subscription.js     ← Table subscriptions
│   │   └── Review.js           ← Table reviews (avis)
│   │
│   ├── controllers/            ← Logique métier (ce que fait chaque route)
│   │   ├── authController.js   ← Inscription, connexion
│   │   ├── productController.js ← CRUD produits
│   │   └── adController.js     ← Gestion publicités
│   │
│   ├── routes/                 ← Définition des URLs
│   │   ├── auth.js             ← /api/auth/*
│   │   ├── products.js         ← /api/products/*
│   │   └── ads.js              ← /api/ads/*
│   │
│   └── middleware/
│       └── auth.js             ← Vérification JWT + rôles
│
└── frontend/                   ← Application Vue.js
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.js             ← Point d'entrée Vue
        ├── App.vue             ← Composant racine
        ├── style.css           ← Styles globaux + Tailwind
        │
        ├── router/
        │   └── index.js        ← Navigation (URLs → pages)
        │
        ├── stores/             ← État global Pinia
        │   ├── auth.js         ← Données utilisateur connecté
        │   └── products.js     ← Données produits
        │
        ├── services/
        │   └── api.js          ← Axios configuré (appels API)
        │
        ├── views/              ← Pages de l'application
        │   ├── MarketplaceView.vue   ← Page d'accueil
        │   ├── LoginView.vue         ← Connexion
        │   ├── RegisterView.vue      ← Inscription
        │   ├── DashboardView.vue     ← Dashboard vendeur
        │   └── ProductDetailView.vue ← Détail d'un produit
        │
        └── components/         ← Composants réutilisables
            ├── NavBar.vue      ← Barre de navigation
            └── ProductCard.vue ← Carte produit
```

---

## Installation étape par étape

### Étape 1 — Base de données MySQL

1. Ouvre **MySQL Workbench**
2. Connecte-toi avec ton compte root
3. Ouvre le fichier `backend/database.sql`
4. Clique sur l'éclair ⚡ pour exécuter
5. Vérifie que la base `samakmarket` apparaît dans le panneau gauche

---

### Étape 2 — Configurer le Backend

```bash
# Aller dans le dossier backend
cd backend

# Copier le fichier de configuration
cp .env.example .env
```

Ouvre le fichier `.env` et remplace les valeurs :
```
DB_PASSWORD=TON_VRAI_MOT_DE_PASSE_MYSQL
```

```bash
# Installer les dépendances
npm install

# Lancer le serveur (terminal 1)
npm run dev
```

✅ **Résultat attendu :**
```
✅ Connexion à MySQL réussie !
✅ Tables MySQL synchronisées !
🚀 SamakMarket API démarrée sur http://localhost:3000
```

---

### Étape 3 — Configurer le Frontend

```bash
# Aller dans le dossier frontend (terminal 2)
cd frontend

# Installer les dépendances
npm install

# Lancer le frontend
npm run dev
```

✅ **Résultat attendu :**
```
VITE v5.x.x  ready in 500ms
Local: http://localhost:5173/
```

---

### Étape 4 — Tester

Ouvre ton navigateur :
- **http://localhost:5173** → La marketplace s'affiche
- **http://localhost:3000/api/health** → `{"status":"OK ✅"}`
- **http://localhost:3000/api/products** → Liste des produits

---

## Endpoints API

| Méthode | URL | Auth | Description |
|---------|-----|------|-------------|
| POST | `/api/auth/register` | ❌ | Inscription |
| POST | `/api/auth/login` | ❌ | Connexion |
| GET | `/api/auth/me` | ✅ | Mon profil |
| GET | `/api/products` | ❌ | Tous les produits |
| GET | `/api/products/:id` | ❌ | Un produit |
| GET | `/api/products/mine` | Vendeur | Mes produits |
| POST | `/api/products` | Vendeur | Créer produit |
| PUT | `/api/products/:id` | Vendeur | Modifier produit |
| DELETE | `/api/products/:id` | Vendeur | Supprimer produit |
| GET | `/api/ads` | ❌ | Pubs actives |
| POST | `/api/ads` | Vendeur | Créer pub |
| PUT | `/api/ads/:id/status` | Admin | Valider pub |

---

## Créer un compte vendeur pour tester

Via l'API (terminal ou REST Client VS Code) :
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Ahmed Vendeur",
  "email": "ahmed@test.com",
  "password": "password123",
  "role": "seller",
  "phone": "0612345678",
  "whatsapp": "212612345678",
  "city": "Tanger"
}
```

Ou directement via l'interface : http://localhost:5173/register

---

## En cas de problème

**❌ Erreur MySQL au démarrage :**
→ Vérifie que MySQL est bien démarré et que le mot de passe dans `.env` est correct

**❌ CORS error dans la console du navigateur :**
→ Vérifie que le backend tourne sur le port 3000

**❌ "Cannot find module" :**
→ Lance `npm install` dans le dossier concerné
