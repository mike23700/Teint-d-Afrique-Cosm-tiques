-- Teint d'Afrique Cosmétiques — schéma de la base du panneau d'administration
-- Voir plan.md §4 pour le contexte. À exécuter une seule fois pour créer les tables.
-- Le contenu initial est ensuite chargé par api/scripts/seed.php (à partir de src/data.ts).

CREATE DATABASE IF NOT EXISTS teint_dafrique
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE teint_dafrique;

CREATE TABLE IF NOT EXISTS admin_users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME NULL
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Journal des tentatives de connexion, utilisé pour le verrou anti brute-force (voir api/auth/login.php)
CREATE TABLE IF NOT EXISTS login_attempts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL,
  success TINYINT(1) NOT NULL,
  attempted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_login_attempts_email_time (email, attempted_at)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INT UNSIGNED NOT NULL,
  alt_text VARCHAR(255) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gammes (
  id VARCHAR(32) PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  tagline VARCHAR(255) NOT NULL,
  ingredients VARCHAR(255) NOT NULL,
  color CHAR(7) NOT NULL,
  color_light CHAR(7) NOT NULL,
  color_dark CHAR(7) NOT NULL,
  description TEXT NOT NULL,
  ingredients_detail TEXT NOT NULL,
  image_id INT UNSIGNED NULL,
  position INT NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_gammes_image FOREIGN KEY (image_id) REFERENCES media (id) ON DELETE SET NULL
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS produits (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  gamme_id VARCHAR(32) NOT NULL,
  type VARCHAR(100) NOT NULL,
  poids VARCHAR(50) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  description TEXT NOT NULL,
  image_id INT UNSIGNED NULL,
  position INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_produits_gamme FOREIGN KEY (gamme_id) REFERENCES gammes (id) ON DELETE CASCADE,
  CONSTRAINT fk_produits_image FOREIGN KEY (image_id) REFERENCES media (id) ON DELETE SET NULL
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Blocs de contenu éditables des pages fixes (accueil, presentation, histoire, contact).
-- Modèle clé/valeur volontairement souple : on ajoute une ligne par nouveau bloc éditable
-- sans jamais avoir besoin de migration de schéma.
CREATE TABLE IF NOT EXISTS page_content (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  page VARCHAR(50) NOT NULL,
  block_key VARCHAR(100) NOT NULL,
  block_type ENUM('text', 'richtext', 'image') NOT NULL DEFAULT 'text',
  value MEDIUMTEXT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_page_block (page, block_key)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Coordonnées et réseaux sociaux, table clé/valeur unique
CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(100) PRIMARY KEY,
  `value` VARCHAR(500) NOT NULL DEFAULT ''
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Messages reçus via le formulaire de contact du site public (lutis par l'admin).
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(50) NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  ip_address VARCHAR(45) NOT NULL DEFAULT '',
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_contact_messages_created (created_at DESC)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
