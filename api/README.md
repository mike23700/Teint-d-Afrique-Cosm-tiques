# API — Teint d'Afrique Cosmétiques

Backend PHP + MySQL du panneau d'administration décrit dans `../docs/plan.md`. API REST en PHP natif (pas de framework, pas de dépendance Composer), pensée pour un hébergement mutualisé sans Node.js ni accès SSH (voir `../docs/host.md`).

## Démarrage local

Prérequis : PHP 8+ avec les extensions `pdo_mysql` et `gd`, et un serveur MySQL/MariaDB (ce projet a été mis en place avec XAMPP).

```bash
# 1. Créer la base et les tables
mysql -u root < api/scripts/migrate.sql

# 2. Copier la config et l'adapter si besoin (déjà fait pour l'environnement XAMPP local)
cp api/config.php.example api/config.php

# 3. Peupler le contenu initial + créer le premier compte admin
php api/scripts/seed.php admin@teintdafrique.com "un-mot-de-passe-fort-d-au-moins-12-caracteres"

# 4. Lancer un serveur PHP de développement
php -S localhost:8000 -t api
```

`api/config.php` n'est jamais commité (voir `.gitignore`) : chaque développeur (et la production) a le sien.

## Format des réponses

Toutes les réponses sont en JSON :

```json
{ "success": true, "data": ... }
{ "success": false, "error": "code_erreur" }
```

Codes HTTP utilisés : `200` OK, `204` (préflight CORS), `400` requête invalide, `401` non authentifié, `403` CSRF invalide ou action interdite, `404` introuvable, `405` méthode non autorisée, `409` conflit (ex. suppression d'un média encore utilisé), `422` validation échouée, `429` trop de tentatives, `500` erreur interne (jamais de détail technique renvoyé au client, voir les logs serveur).

## Authentification

- Session PHP côté serveur (cookie `HttpOnly`, `SameSite=Strict`), pas de JWT.
- Après connexion, un jeton CSRF est renvoyé une fois et doit être renvoyé par le client dans le header `X-CSRF-Token` sur **toute** requête de modification (`POST`).
- `GET /api/auth/session.php` permet de vérifier si une session est déjà active (et de récupérer le jeton CSRF) au chargement de l'admin.

## Endpoints

### Authentification

| Méthode | URL | Auth | Body / Query | Réponse |
|---|---|---|---|---|
| POST | `/api/auth/login.php` | non | `{email, password}` | `{csrfToken}` |
| POST | `/api/auth/logout.php` | oui | — | `null` |
| GET | `/api/auth/session.php` | non | — | `{authenticated, csrfToken?}` |

### Gammes (lecture publique, écriture admin)

| Méthode | URL | Auth | Body / Query | Réponse |
|---|---|---|---|---|
| GET | `/api/gammes/list.php` | non | — | tableau de gammes (avec `products`) |
| GET | `/api/gammes/get.php?id=eclat` | non | — | une gamme (avec `products`) |
| POST | `/api/gammes/update.php` | admin + CSRF | `{id, nom?, tagline?, ingredients?, color?, colorLight?, colorDark?, description?, ingredientsDetail?, imageId?}` | `{updated: true}` |
| POST | `/api/gammes/reorder.php` | admin + CSRF | `{ids: [...]}` (ids dans le nouvel ordre) | `{reordered: true}` |

`id` doit être l'un de `eclat`, `reparation`, `hydratation`, `nutrition` (ensemble fixe, voir `docs/plan.md`). Les champs `color*` doivent être au format `#RRGGBB`. `imageId` est l'id d'un média existant (voir `media/list.php`) à associer à la gamme, ou `null` pour retirer l'image actuelle.

Forme d'une gamme renvoyée par `list.php` / `get.php` :

```json
{
  "id": "eclat",
  "nom": "ÉCLAT",
  "tagline": "Révélez votre luminosité naturelle",
  "ingredients": "Curcuma & Carotte",
  "color": "#C97B1A",
  "colorLight": "#FEF3DC",
  "colorDark": "#7A4800",
  "description": "...",
  "ingredientsDetail": "...",
  "hasPdfLabel": true,
  "imageId": null,
  "image": null,
  "products": [
    { "id": 1, "type": "Savon", "poids": "180 g", "symbol": "◼", "description": "...", "imageId": null, "image": null }
  ]
}
```

`image` (gamme ou produit) vaut `null` tant qu'aucune photo n'a été téléversée via `/api/media/upload.php` puis associée via `imageId`. Les produits sont triés par `position` croissante ; les nouveaux produits créés sont ajoutés en fin de liste.

### Produits (écriture admin — la lecture passe par `gammes/list.php` ou `gammes/get.php`)

| Méthode | URL | Auth | Body | Réponse |
|---|---|---|---|---|
| POST | `/api/produits/create.php` | admin + CSRF | `{gammeId, type, poids?, symbol?, description}` | produit créé `{id, type, poids, symbol, description, imageId, image}` (HTTP 201) |
| POST | `/api/produits/update.php` | admin + CSRF | `{id, type?, poids?, symbol?, description?, imageId?}` | `{updated: true}` |
| POST | `/api/produits/delete.php` | admin + CSRF | `{id}` | `{deleted: true}` |
| POST | `/api/produits/reorder.php` | admin + CSRF | `{gammeId, ids: [...]}` | `{reordered: true}` |

`gammeId` doit être l'une des 4 gammes (`eclat`, `reparation`, `hydratation`, `nutrition`). Le nouveau produit est placé en fin de liste (`position` = max + 1). `imageId` est l'id d'un média existant à associer au produit, ou `null` pour retirer l'image actuelle. `id` est l'identifiant numérique du produit tel que renvoyé dans `products[].id` par `gammes/list.php` / `gammes/get.php`.

`reorder.php` réattribue les positions de la gamme : `ids` contient les ids de produits dans le nouvel ordre (les produits absents du tableau sont replacés après, ordre relatif conservé). La validation refuse tout id qui n'appartient pas à la gamme (`product_not_in_gamme`), les doublons (`duplicate_ids`) et une gamme inconnue (`invalid_gamme_id`), et l'opération est atomique (transaction).

La suppression d'un produit est définitive. Symétriquement, la suppression d'un média est refusée (`409 media_in_use`) tant qu'une gamme **ou** un produit le référence encore.

### Contenu de pages (lecture publique, écriture admin)

| Méthode | URL | Auth | Body / Query | Réponse |
|---|---|---|---|---|
| GET | `/api/content/list.php?page=accueil` | non | — | tableau de blocs `{blockKey, blockType, value}` |
| POST | `/api/content/update.php` | admin + CSRF | `{page, blockKey, value, blockType?}` | `{updated: true}` |

`page` ∈ `accueil`, `presentation`, `histoire`, `contact`. `blockKey` doit matcher `^[a-z0-9_]+$`. `blockType` (`text`/`richtext`/`image`) n'est utilisé que pour créer un nouveau bloc — sur un bloc existant, le type déjà enregistré en base prévaut (il ne peut pas être changé via cet endpoint). Les blocs `richtext` acceptent uniquement `<p> <strong> <em> <br> <ul> <li> <a>` ; tout le reste est retiré côté serveur.

Les blocs de type `image` stockent l'**id d'un média** dans `value` (ou une chaîne vide si aucun) : `update.php` refuse tout id absent de la médiathèque (`invalid_media_id`). `list.php` ajoute à ces blocs un champ `imageUrl` prêt à l'emploi (`/uploads/...` ou `null`). Deux blocs image existent pour l'accueil : `hero_image` (grande photo du hero) et `fondatrice_image` (portrait de la fondatrice) — tant qu'ils sont vides, le site affiche ses visuels statiques de repli.

### Messages de contact

| Méthode | URL | Auth | Body / Query | Réponse |
|---|---|---|---|---|
| POST | `/api/contact/submit.php` | **public** | `{name, email, phone?, message}` | `{received: true}` (201) |
| GET | `/api/contact/list.php` | admin | — | tableau de messages `{id, name, email, phone, message, is_read, created_at}` |
| POST | `/api/contact/manage.php` | admin + CSRF | `{id, isRead}` ou `{id, delete: true}` | `{updated: true}` / `{deleted: true}` |

`submit.php` est le seul endpoint public d'écriture de tout le projet : il est limité à **5 messages par IP et par tranche de 10 minutes** (429 `too_many_requests` au-delà), avec validation stricte (email valide, message ≤ 5000 caractères) et sanitisation des champs. Les messages arrivent dans l'onglet « Messages » de l'admin (marquer lu/non lu, supprimer, répondre par email via un simple clic sur l'adresse).

### Paramètres — coordonnées & réseaux sociaux (lecture publique, écriture admin)

| Méthode | URL | Auth | Body | Réponse |
|---|---|---|---|---|
| GET | `/api/settings/list.php` | non | — | `{contact_phone, contact_email, contact_address, whatsapp_number, facebook_url, instagram_url}` |
| POST | `/api/settings/update.php` | admin + CSRF | `{key, value}` | `{updated: true}` |

`key` doit être l'une des 6 clés ci-dessus. `contact_email` doit être un email valide, `facebook_url`/`instagram_url` doivent être des URLs valides (ou une chaîne vide).

### Médiathèque (admin uniquement)

| Méthode | URL | Auth | Body | Réponse |
|---|---|---|---|---|
| GET | `/api/media/list.php` | admin | — | tableau de médias `{id, url, originalName, mimeType, sizeBytes, altText, createdAt}` |
| POST | `/api/media/upload.php` | admin + CSRF | `multipart/form-data` : champ `file` (image ≤ 5 Mo, jpeg/png/webp), champ optionnel `altText` | `{id, url}` |
| POST | `/api/media/delete.php` | admin + CSRF | `{id}` | `{deleted: true}` |

Les images sont réencodées côté serveur à l'upload (neutralise tout payload caché, ignore les métadonnées EXIF) et stockées sous un nom aléatoire dans `api/uploads/`. La suppression est refusée (`409 media_in_use`) tant qu'une gamme référence encore l'image.

## Sécurité — ce qui est déjà en place

- Requêtes préparées PDO partout (aucune concaténation SQL).
- Mots de passe admin hashés (`password_hash`/`password_verify`), jamais stockés en clair.
- Verrou anti brute-force sur la connexion (5 échecs / 5 minutes par email, table `login_attempts`).
- CSRF obligatoire sur toute route de modification.
- CORS restreint aux origines listées dans `config.php` (pas de wildcard sur les routes avec cookies).
- Upload d'images : vérification du type MIME réel (pas l'extension), taille limitée, réencodage systématique, nom de fichier généré aléatoirement.
- Sanitisation systématique des entrées texte (`strip_tags`) et liste blanche de balises pour les blocs `richtext`.
- Aucune trace d'erreur PHP renvoyée au client (`display_errors` désactivé, erreurs journalisées côté serveur uniquement).

## À faire par Dev B (admin + intégration site public)

Voir `docs/plan.md` §6 pour le détail complet des écrans admin et de l'intégration du site public (remplacement de l'import statique `src/data.ts` par ces endpoints, avec repli sur les données statiques si l'API est indisponible).
