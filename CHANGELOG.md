# Journal des modifications (CHANGELOG)

Toutes les évolutions notables du projet sont documentées ici, par ordre chronologique inverse.
Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/) ; les hashes correspondent
aux commits sur `main`.

---

## [Non versionné] — Lot 2 « site dynamique » (21 septembre 2026)

Deuxième grand chantier, après le CMS de base : rendre le site plus vivant et réduire le recours
au code pour toute évolution de contenu.

### Ajouté

- **Produits dynamiques** (`261d972`)
  - Ajout et suppression de produits depuis l'admin (`api/produits/create.php`, `delete.php`).
  - Image par produit : nouvelle colonne `produits.image_id` (FK vers `media`), association
    via `produits/update.php`, remontée `imageId`/`image` dans `gammes/list.php` et `get.php`.
  - Compteurs dynamiques partout : badge « {n} produit(s) » des cartes (Accueil, Boutique),
    total de la boutique, titre « Les {n} Produits » de la page gamme, listes de produits
    lues depuis la base (plus de « Savon/Lotion/Crème/Lait » en dur).
  - Priorité d'affichage d'une carte produit : image du produit → étiquette PDF → image de gamme.

- **Réordonnancement des produits** (`9c26174`, puis `2629c5e`)
  - `api/produits/reorder.php` : réécrit les positions d'une gamme en une transaction,
    refuse les ids hors gamme / doublons / gamme inconnue.
  - D'abord des boutons monter/descendre, remplacés ensuite par du **glisser-déposer natif
    HTML5** (poignée ⠿, carte source estompée, cible surlignée en orange, mise à jour
    optimiste avec rollback visuel si l'appel échoue). Aucune dépendance ajoutée.

- **Import d'image direct depuis l'ordinateur** (`2922dc9`)
  - Le sélecteur d'image des gammes et produits ne passe plus par la médiathèque :
    bouton « Importer depuis l'ordinateur » + zone de glisser-déposer de fichier.
    Téléverse puis associe en un seul geste, en réutilisant `media/upload.php`
    (type MIME vérifié, réencodage serveur, 5 Mo max).

- **Réordonnancement des gammes** (`64d20e5`)
  - `api/gammes/reorder.php` (transaction, mêmes garanties que les produits).
  - Les onglets de gamme de l'admin sont glissables ; l'ordre se répercute sur la boutique.

- **Images de la page Accueil éditables** (`64d20e5`)
  - Deux blocs `image` nouveaux : `hero_image` (grande photo du hero) et `fondatrice_image`
    (portrait), gérés depuis l'onglet Pages avec import direct depuis l'ordinateur.
  - `api/content/list.php` résout `imageUrl` pour les blocs image ; le hook
    `src/hooks/useContentImage.ts` branche le site public avec repli statique
    (les visuels Unsplash restent affichés tant que rien n'est importé).

- **Formulaire de contact fonctionnel** (`64d20e5`)
  - Nouvelle table `contact_messages` ; endpoint **public** `api/contact/submit.php`
    (limite 5 messages / IP / 10 min, email validé, champs nettoyés, max 5 000 caractères).
  - Nouvel onglet **« Messages »** dans l'admin : liste (non lus d'abord, badge « Nouveau »),
    marquer lu/non lu, suppression, réponse par email en cliquant sur l'adresse.
  - Le formulaire du site envoie réellement (fini le `setSent(true)` décoratif),
    avec messages d'erreur en français.

- **Documentation** (`e1ec611`, puis ce fichier)
  - README réécrit (les deux parties du projet, admin, démarrage rapide, structure).
  - Préparation du déploiement LWS : `public/.htaccess` (routage SPA + mapping
    `/uploads/* → api/uploads/*`, copié automatiquement dans `dist/` par `vite build`),
    `api/.htaccess` (interdit `config.php`, `scripts/`, l'exécution PHP sous `uploads/`,
    le listing de répertoire), `api/.user.ini` (limites d'upload PHP à 6 Mo).
  - `docs/host.md` mis à jour en conséquence (§4, §6, §7) ; `api/README.md` tenu à jour
    à chaque nouvel endpoint.

### Corrigé

- **`vite.config.ts` plantait hors de Figma Make** (`f41fc6a`) : il importe
  `.figma/make/site.json`, absent du dépôt → `npm run dev` et `npm run build` échouaient
  sur toute autre machine. Le fichier est maintenant commité (règle `.gitignore` affinée :
  seul `site.json` est suivi, le reste de `.figma/` reste local).
- **Suppression d'image impossible** (`2922dc9`) : la vérification « gamme **ou** produit
  utilise ce média » utilisait deux fois le même placeholder `:id` dans une requête — interdit
  avec `PDO::ATTR_EMULATE_PREPARES = false` → `internal_error`. Deux placeholders distincts.
- **Branchement des textes Accueil/Présentation** (`84ce807`) : création du hook
  `useRichContent` pour rendre les blocs `richtext` (HTML nettoyé côté serveur) via
  `dangerouslySetInnerHTML`, avec repli statique. 26 des 27 blocs seedés sont branchés ;
  `hero_title` reste volontairement statique (mise en page multi-lignes colorée).

### Assets

- Fichiers de marque mis à jour et commités (`f41fc6a`) : étiquettes PDF ÉCLAT/NUTRITION,
  logo, affiche, manifeste RSE (`src/imports/`, suivis via Git LFS).

---

## [1f04383] — Lot 1 « CMS » (panneau d'admin + backend)

Travail initial de l'équipe (détail dans `docs/plan.md`) :

- Backend PHP + MySQL sans framework (`api/`) : auth par session (anti brute-force
  5 échecs / 5 min, CSRF, `password_hash`), CRUD gammes/produits/contenu/paramètres,
  médiathèque (upload réencodé, suppression protégée), `migrate.sql` + `seed.php`.
- Panneau d'admin React (`src/admin/`) : connexion, Gammes, Pages, Médiathèque, Coordonnées.
- Site public branché sur l'API avec repli statique garanti (jamais de page blanche).
- Guides `docs/setup.md` (démarrage) et `docs/host.md` (déploiement LWS).

---

## Reste à faire

- **Contenu réel de la marque** : visuels produits + portrait (importer via l'admin pour
  remplacer les placeholders Unsplash), numéro WhatsApp réel, liens Facebook/Instagram,
  email/téléphone de contact.
- **Mise en production** (voir `docs/host.md`) : pointeur DNS `teintdafrique.com` → LWS,
  SSL (Cloudflare), création de la base LWS + import `migrate.sql`, `config.php` distant,
  upload `api/` + `dist/`, puis activer `'secure' => true` sur le cookie de session
  (`api/bootstrap.php`).
- À nettoyer avant mise en ligne : le produit « Nouveau produit » (id 19) présent dans la
  gamme ÉCLAT de la base locale, et les étiquettes PDF qui restent codées en dur par gamme
  (aucun champ en base pour le moment).
