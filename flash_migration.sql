-- =============================================================
-- Migration — Table offres_flash
-- Exécuter dans MySQL : source flash_migration.sql
-- =============================================================

ALTER TABLE products
  ADD COLUMN flash_price    DECIMAL(10,2) NULL COMMENT 'Prix flash spécial',
  ADD COLUMN flash_start    DATETIME      NULL COMMENT 'Début offre flash',
  ADD COLUMN flash_end      DATETIME      NULL COMMENT 'Fin offre flash',
  ADD COLUMN is_flash       TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '1 = offre flash active';

-- Index pour requêtes rapides
CREATE INDEX idx_flash ON products (is_flash, flash_end);

-- Exemple : créer une offre flash de 2h sur le produit id=1
-- UPDATE products SET
--   is_flash    = 1,
--   flash_price = 15.00,
--   flash_start = NOW(),
--   flash_end   = DATE_ADD(NOW(), INTERVAL 2 HOUR)
-- WHERE id = 1;
