-- =============================================================
-- SAMAKMARKET - Script de création de la base de données MySQL
-- =============================================================
-- Ce fichier crée toutes les tables nécessaires au projet.
-- Pour l'exécuter :
--   1. Ouvre MySQL Workbench
--   2. Copie ce fichier entier
--   3. Colle dans l'éditeur et clique sur l'éclair ⚡
-- =============================================================

-- On crée la base de données si elle n'existe pas encore
-- utf8mb4 = supporte l'arabe, les emojis, et tous les caractères spéciaux
CREATE DATABASE IF NOT EXISTS samakmarket
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- On sélectionne cette base pour la suite
USE samakmarket;

-- =============================================================
-- TABLE 1 : users
-- Stocke tous les utilisateurs : admins, vendeurs, acheteurs
-- =============================================================
CREATE TABLE IF NOT EXISTS users (
  -- Identifiant unique, s'incrémente automatiquement (1, 2, 3...)
  id         INT AUTO_INCREMENT PRIMARY KEY,

  -- Nom complet de l'utilisateur
  name       VARCHAR(100) NOT NULL,

  -- Email = identifiant de connexion, doit être unique
  email      VARCHAR(150) NOT NULL UNIQUE,

  -- Mot de passe hashé (jamais en clair !) - bcrypt s'en occupe
  password   VARCHAR(255) NOT NULL,

  -- Numéro de téléphone pour les appels directs
  phone      VARCHAR(20),

  -- Numéro WhatsApp (peut être différent du téléphone)
  whatsapp   VARCHAR(20),

  -- Rôle de l'utilisateur dans la plateforme
  -- admin  = accès total
  -- seller = peut publier des produits
  -- buyer  = peut contacter les vendeurs
  role       ENUM('admin', 'seller', 'buyer') NOT NULL DEFAULT 'buyer',

  -- Photo de profil (URL vers l'image)
  avatar     VARCHAR(255),

  -- Ville de l'utilisateur (pour filtrer par région)
  city       VARCHAR(100),

  -- Compte actif ou suspendu par l'admin
  is_active  BOOLEAN DEFAULT TRUE,

  -- Dates automatiques gérées par MySQL
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================================
-- TABLE 2 : products
-- Les annonces de poisson publiées par les vendeurs
-- =============================================================
CREATE TABLE IF NOT EXISTS products (
  id           INT AUTO_INCREMENT PRIMARY KEY,

  -- Référence vers le vendeur (clé étrangère vers users.id)
  seller_id    INT NOT NULL,

  -- Nom du produit (ex: "Sardine fraîche", "Thon rouge")
  name         VARCHAR(200) NOT NULL,

  -- Description détaillée (origine, qualité, conditions...)
  description  TEXT,

  -- Prix par unité (en dirhams, francs CFA, etc.)
  price        DECIMAL(10, 2) NOT NULL,

  -- Unité de vente : kg, pièce, lot, caisse, etc.
  unit         VARCHAR(50) DEFAULT 'kg',

  -- Quantité disponible en stock
  quantity     INT DEFAULT 0,

  -- Catégorie de poisson (Sardine, Thon, Crevette, Mérou...)
  category     VARCHAR(100),

  -- Liste d'URLs des photos (stockée en JSON)
  -- Exemple : ["https://site.com/photo1.jpg", "https://site.com/photo2.jpg"]
  images       JSON,

  -- Ville où le produit est disponible
  city         VARCHAR(100),

  -- Le produit est-il encore disponible ?
  is_available BOOLEAN DEFAULT TRUE,

  -- Produit sponsorisé = apparaît en premier (option payante)
  is_featured  BOOLEAN DEFAULT FALSE,

  -- Compteur de vues (augmente chaque fois qu'on ouvre le produit)
  views_count  INT DEFAULT 0,

  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Liaison avec la table users
  -- ON DELETE CASCADE = si le vendeur est supprimé, ses produits aussi
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================================
-- TABLE 3 : ads
-- Publicités payantes affichées sur la marketplace
-- =============================================================
CREATE TABLE IF NOT EXISTS ads (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  seller_id    INT NOT NULL,

  -- Titre affiché sur la publicité
  title        VARCHAR(200) NOT NULL,

  -- Image de la bannière publicitaire
  image_url    VARCHAR(255),

  -- Lien vers lequel l'utilisateur est redirigé en cliquant
  link_url     VARCHAR(255),

  -- Emplacement sur le site :
  -- homepage = page d'accueil | sidebar = barre latérale
  -- top = haut de page       | bottom = bas de page
  position     ENUM('homepage', 'sidebar', 'top', 'bottom') DEFAULT 'homepage',

  -- Cycle de vie de la pub :
  -- pending  = soumise, en attente de validation admin
  -- active   = validée et affichée
  -- expired  = période terminée
  -- rejected = refusée par l'admin
  status       ENUM('pending', 'active', 'expired', 'rejected') DEFAULT 'pending',

  -- Montant payé par le vendeur pour cette pub
  price_paid   DECIMAL(10, 2) DEFAULT 0.00,

  -- Période d'affichage
  starts_at    DATETIME,
  ends_at      DATETIME,

  -- Statistiques pour le tableau de bord
  clicks_count INT DEFAULT 0,
  views_count  INT DEFAULT 0,

  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================================
-- TABLE 4 : subscriptions
-- Abonnements premium des vendeurs (modèle SaaS)
-- =============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,

  -- Plan choisi :
  -- free    = gratuit (limité)
  -- basic   = fonctionnalités de base
  -- premium = accès complet
  -- pro     = illimité + support prioritaire
  plan        ENUM('free', 'basic', 'premium', 'pro') DEFAULT 'free',

  -- Prix payé pour cet abonnement
  price       DECIMAL(10, 2) DEFAULT 0.00,

  -- Dates de début et fin d'abonnement
  started_at  DATETIME,
  expires_at  DATETIME,

  -- Abonnement encore valide ?
  is_active   BOOLEAN DEFAULT TRUE,

  -- Référence du paiement (pour Stripe, PayPal, CinetPay...)
  payment_ref VARCHAR(100),

  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================================
-- TABLE 5 : reviews
-- Avis et notes laissés par les acheteurs sur les produits
-- =============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  buyer_id   INT NOT NULL,

  -- Note de 1 à 5 étoiles
  rating     TINYINT NOT NULL,

  -- Commentaire écrit (optionnel)
  comment    TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id)   REFERENCES users(id) ON DELETE CASCADE,

  -- Un acheteur ne peut laisser qu'UN SEUL avis par produit
  UNIQUE KEY un_avis_par_produit (product_id, buyer_id)
);

-- =============================================================
-- DONNÉES DE TEST
-- Insère quelques données pour tester immédiatement
-- =============================================================

-- Un vendeur de test (mot de passe : "password123")
-- Note : en production, le hash est généré par bcrypt dans Node.js
-- Ici on insère un placeholder, utilise l'API /auth/register à la place
INSERT INTO users (name, email, password, phone, whatsapp, role, city) VALUES
('Mohamed Diallo', 'vendeur@samakmarket.com', 'USE_API_REGISTER', '0612345678', '212612345678', 'seller', 'Tanger'),
('Admin SamakMarket', 'admin@samakmarket.com', 'USE_API_REGISTER', '0600000000', '212600000000', 'admin', 'Casablanca');

-- Des produits de démonstration pour le vendeur (id=1)
INSERT INTO products (seller_id, name, description, price, unit, category, city, is_featured) VALUES
(1, 'Sardine fraîche du jour',  'Pêchée ce matin dans le détroit, très fraîche', 15.00, 'kg',    'Sardine',  'Tanger', TRUE),
(1, 'Thon rouge entier',        'Thon rouge de qualité sashimi, 8-12 kg pièce',   85.00, 'kg',    'Thon',     'Tanger', FALSE),
(1, 'Crevettes royales',        'Grosses crevettes fraîches, idéales pour grill',  120.00, 'kg',  'Crevette', 'Tanger', FALSE),
(1, 'Mérou du Maroc',           'Mérou sauvage, chair blanche et ferme',           95.00, 'pièce','Mérou',    'Tanger', FALSE);
