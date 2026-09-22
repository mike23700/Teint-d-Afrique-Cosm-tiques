# Plan de développement — Panneau d'administration (CMS) Teint d'Afrique Cosmétiques

## 1. Contexte

Le site vitrine actuel (`src/`) est une application **React 19 + Vite + Tailwind CSS v4** entièrement statique : tous les textes, gammes, produits et couleurs de marque sont codés en dur dans `src/data.ts` et dans les pages (`src/pages/*.tsx`). Toute modification de contenu nécessite aujourd'hui une intervention d'un développeur.

**Objectif de ce chantier** : ajouter un panneau d'administration (type mini-CMS) permettant à la marque de modifier elle-même, sans toucher au code :

- les textes des pages (Accueil, Présentation, Notre Histoire, Contact)
- les 4 gammes de produits (nom, tagline, couleurs, description, ingrédients) et leurs produits (savon, lotion, crème, lait)
- les images (logo, visuels de gammes, étiquettes produits)
- les coordonnées de contact et les liens réseaux sociaux (Facebook, Instagram, WhatsApp, email, adresse)

## 2. Contrainte d'hébergement (déterminante pour l'architecture)

Le site est hébergé chez **LWS**, sur une offre mutualisée **sans Node.js et sans accès Terminal/SSH** (voir `host.md`). En revanche PHP et une base **MySQL** sont disponibles (1 base MySQL incluse). L'architecture retenue est donc :

```
┌─────────────────────┐       ┌───────────────────────┐       ┌──────────────┐
│  Site public (SPA)   │──────▶│   API PHP (/api)       │──────▶│  MySQL (1 DB) │
│  React + Vite build  │  HTTP │   PDO, JSON REST        │       │               │
│  → dist/ statique    │  JSON │   Auth session admin    │       └──────────────┘
└─────────────────────┘       └───────────────────────┘
          ▲                              ▲
          │                              │
┌─────────────────────┐                  │
│  Admin (SPA séparée) │──────────────────┘
│  React + Vite build  │
│  → dist/ dans /admin  │
└─────────────────────┘
```

- Le site public et l'admin restent des **builds statiques** (`npm run build`), déposés sur l'hébergement via FTP/gestionnaire de fichiers (aucun serveur Node en production).
- Seul le dossier `/api` tourne réellement côté serveur, en PHP pur (pas de framework lourd, pas de `composer` requis si la formule LWS ne le permet pas facilement — à confirmer, sinon PHP natif + PDO).
- Le site public passe de données statiques (`data.ts`) à des données **récupérées via l'API** au chargement, avec un mécanisme de repli (voir §5.4).

> **Note de mise à jour (implémentation réelle) :** pour que le site public et l'admin partagent exactement la même URL/le même serveur — y compris en développement — l'admin n'a finalement **pas** été livré comme une seconde application Vite déployée sous `/admin`. Elle vit dans `src/admin/` au sein du **même** projet React que le site public, montée comme une route (`/admin/*`) chargée en *lazy* (`React.lazy`) dans `src/routes.tsx`, en dehors du `Layout` public (donc sans le Nav/Footer du site). Conséquences :
> - Un seul `npm install` / `npm run dev` / `npm run build` pour tout le front (site + admin) — un seul `dist/` à déployer.
> - Le code de l'admin ne pèse pas sur le chargement initial du site public : il n'est téléchargé que si un visiteur va sur `/admin` (chunk séparé, vérifié à la compilation).
> - Le schéma d'architecture ci-dessus reste vrai pour l'API PHP (`/api`) et la base MySQL, qui n'ont pas changé.
> La répartition Dev A / Dev B ci-dessous reste pertinente comme découpage du travail (backend vs. front+admin), même si les deux ont été livrés par la même personne dans cette itération.

## 3. Répartition entre les deux développeurs

| | **Dev A — Backend & Données** | **Dev B — Admin & Intégration site public** |
|---|---|---|
| Périmètre | API PHP, base MySQL, authentification, upload d'images | Interface d'administration, branchement du site public sur l'API |
| Dossiers sous sa responsabilité | `api/` | `admin/`, modifications dans `src/` |
| Livrable | API REST documentée et testable indépendamment (via Postman/curl) | Admin fonctionnel + site public qui consomme l'API |

Les deux développeurs doivent se mettre d'accord sur le **contrat d'API** (§5) avant de commencer, et ne plus le modifier unilatéralement une fois le développement lancé — toute évolution du contrat doit être actée par les deux parties.

---

## 4. Modèle de données (MySQL)

Base unique (celle fournie par la formule LWS). Toutes les tables en `utf8mb4_unicode_ci`. Toutes les requêtes doivent utiliser des **requêtes préparées (PDO)**, jamais de concaténation de SQL.

### `admin_users`
| Colonne | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| email | VARCHAR(190) UNIQUE | |
| password_hash | VARCHAR(255) | `password_hash()` (bcrypt/argon2), jamais de mot de passe en clair |
| created_at | DATETIME | |
| last_login_at | DATETIME NULL | |

### `gammes`
| Colonne | Type | Notes |
|---|---|---|
| id | VARCHAR(32) PK | slug stable : `eclat`, `reparation`, `hydratation`, `nutrition` |
| nom | VARCHAR(100) | |
| tagline | VARCHAR(255) | |
| ingredients | VARCHAR(255) | résumé court affiché dans les menus |
| color | CHAR(7) | hex `#RRGGBB` |
| color_light | CHAR(7) | |
| color_dark | CHAR(7) | |
| description | TEXT | |
| ingredients_detail | TEXT | |
| image_id | INT NULL | FK → `media.id` |
| position | INT | ordre d'affichage |
| updated_at | DATETIME | |

### `produits`
| Colonne | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| gamme_id | VARCHAR(32) | FK → `gammes.id` |
| type | VARCHAR(100) | ex. "Savon", "Lotion Visage" |
| poids | VARCHAR(50) | ex. "180 g" |
| symbol | VARCHAR(10) | glyphe utilisé dans l'UI (◼ ◻ ◇ ○) |
| description | TEXT | |
| image_id | INT NULL | FK → `media.id` (image de la carte produit) |
| position | INT | ordre au sein de la gamme (modifiable par glisser-déposer) |

### `page_content`
Contenu éditable des pages fixes (Accueil, Présentation, Notre Histoire, Contact), sous forme de blocs clé/valeur pour rester flexible sans migration à chaque nouveau champ.

| Colonne | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| page | VARCHAR(50) | `accueil`, `presentation`, `histoire`, `contact` |
| block_key | VARCHAR(100) | ex. `hero_title`, `fondatrice_bio`, `histoire_intro` |
| block_type | ENUM('text','richtext','image') | `richtext` = HTML limité (voir §6.3) |
| value | MEDIUMTEXT | texte, HTML sanitized, ou id média sérialisé |
| updated_at | DATETIME | |

Contrainte unique : (`page`, `block_key`).

Les blocs de type `image` stockent l'id d'un média dans `value` (vide tant qu'aucune photo
n'est importée) ; `content/list.php` y ajoute un champ `imageUrl` prêt à l'emploi. Deux blocs
image existent pour l'accueil : `hero_image` et `fondatrice_image`.

### `settings`
Table clé/valeur unique pour les coordonnées et réseaux sociaux.

| Colonne | Type | Notes |
|---|---|---|
| `key` | VARCHAR(100) PK | `contact_phone`, `contact_email`, `contact_address`, `whatsapp_number`, `facebook_url`, `instagram_url` |
| `value` | VARCHAR(500) | |

### `media`
| Colonne | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| filename | VARCHAR(255) | nom du fichier stocké (généré, jamais le nom original brut) |
| original_name | VARCHAR(255) | |
| mime_type | VARCHAR(100) | |
| size_bytes | INT | |
| alt_text | VARCHAR(255) | |
| created_at | DATETIME | |

Fichiers physiques stockés hors `public_html/api` dans un dossier `uploads/` servi statiquement, jamais dans un dossier exécutable PHP.

### `contact_messages` (ajouté en lot 2)
| Colonne | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| name | VARCHAR(190) | expéditeur |
| email | VARCHAR(190) | validé côté serveur |
| phone | VARCHAR(50) | facultatif |
| message | TEXT | max 5 000 caractères |
| ip_address | VARCHAR(45) | sert à la limite anti-spam (5 msg / 10 min / IP) |
| is_read | TINYINT(1) | suivi lu / non lu dans l'admin |
| created_at | DATETIME | |

**Seed initial** : Dev A écrit un script `api/scripts/seed.php` (exécuté une fois manuellement) qui recopie l'intégralité du contenu actuel de `src/data.ts` et des pages (`AccueilPage.tsx`, `PresentationPage.tsx`, `HistoirePage.tsx`, `ContactPage.tsx`) dans ces tables, pour que la mise en production n'efface aucun contenu existant.

---

## 5. Spécification Dev A — API Backend (PHP + MySQL)

### 5.1 Structure de dossiers attendue

```
api/
  config.php.example      # gabarit, sans secrets — le vrai config.php n'est JAMAIS commité
  bootstrap.php            # connexion PDO, headers CORS/JSON communs
  auth/
    login.php
    logout.php
    session.php            # helper « require_admin() »
  gammes/
    list.php               # GET  /api/gammes/list.php
    get.php                # GET  /api/gammes/get.php?id=eclat
    update.php              # POST /api/gammes/update.php (admin only)
  produits/
    update.php
  content/
    list.php                # GET  /api/content/list.php?page=accueil
    update.php               # POST /api/content/update.php (admin only)
  settings/
    list.php
    update.php
  media/
    upload.php               # POST multipart (admin only)
    delete.php
  uploads/                   # fichiers médias servis statiquement (hors code exécutable si possible)
  scripts/
    seed.php
    migrate.sql               # schéma SQL complet, versionné
```

### 5.2 Authentification

- Un seul rôle « admin » suffit pour ce périmètre (pas de gestion de rôles multiples).
- Login par email + mot de passe (`password_verify`), session PHP côté serveur (cookie `HttpOnly`, `Secure`, `SameSite=Strict`).
- Toutes les routes de modification (`update.php`, `upload.php`, `delete.php`) doivent appeler un helper `require_admin()` qui coupe la requête (401) si aucune session valide.
- **Protection brute-force** : limiter les tentatives de login (ex. verrou de 5 minutes après 5 échecs consécutifs par IP/email).
- **CSRF** : un jeton CSRF généré à la connexion doit être renvoyé par le front sur chaque requête de modification (header `X-CSRF-Token`), vérifié côté serveur.
- **Formulaire de contact public** : unique endpoint d'écriture publique du projet (`contact/submit.php`), protégé par une limite de débit par IP (5 messages / 10 minutes) et une validation stricte côté serveur ; les messages s'accumulent dans `contact_messages` et se lisent dans l'admin.
- Aucun mot de passe, secret, ou identifiant de base de données ne doit apparaître dans le dépôt Git : `config.php` doit être listé dans `.gitignore`, seul `config.php.example` (avec des valeurs bidons) est commité.

### 5.3 Contrat API (JSON)

Toutes les réponses au format `{"success": true, "data": ...}` ou `{"success": false, "error": "message"}`, avec les codes HTTP appropriés (200, 400, 401, 403, 404, 422, 500).

**Lecture publique (site public, pas d'auth requise)**
- `GET /api/gammes/list.php` → liste des gammes + leurs produits
- `GET /api/content/list.php?page=accueil` → blocs de contenu d'une page
- `GET /api/settings/list.php` → coordonnées, réseaux sociaux

**Écriture (admin uniquement)**
- `POST /api/auth/login.php` `{email, password}` → `{success, csrfToken}`
- `POST /api/auth/logout.php`
- `POST /api/gammes/update.php` `{id, nom, tagline, color, ... }`
- `POST /api/produits/update.php` `{id?, gammeId, type, poids, description, position}`
- `POST /api/content/update.php` `{page, blockKey, value}`
- `POST /api/settings/update.php` `{key, value}`
- `POST /api/media/upload.php` (multipart/form-data, champ `file`) → `{id, url}`
- `POST /api/media/delete.php` `{id}`

Dev A doit documenter chaque endpoint dans un fichier `api/README.md` (méthode, payload, réponse, codes d'erreur) — c'est ce document qui sert de contrat avec Dev B.

### 5.4 Validation et sécurité (obligatoire, non négociable)

- **SQL injection** : uniquement des requêtes préparées PDO, jamais de valeur interpolée directement dans une chaîne SQL.
- **XSS stocké** : les champs `richtext` (ex. bio de la fondatrice) doivent être filtrés côté serveur avec une liste blanche de balises (`<p>`, `<strong>`, `<em>`, `<br>`, `<ul>`, `<li>`, `<a>` avec `rel="noopener noreferrer"`) — pas de HTML libre.
- **Upload d'images** : vérifier le type MIME réel (pas seulement l'extension), limiter la taille (ex. 5 Mo), re-encoder l'image côté serveur (GD/Imagick) pour neutraliser tout code embarqué, générer un nom de fichier aléatoire (ne jamais réutiliser le nom envoyé par le client tel quel).
- **CORS** : n'autoriser que l'origine du site public et de l'admin (pas de wildcard `*` sur les routes qui nécessitent des identifiants/cookies).
- Toute erreur inattendue doit renvoyer un message générique côté client (`"error": "internal_error"`) et logguer le détail côté serveur uniquement — ne jamais renvoyer une trace PHP au client.

---

## 6. Spécification Dev B — Admin front + intégration du site public

### 6.1 Admin (nouvelle application)

*(Voir la note de mise à jour en §2 : livré en pratique comme une route `/admin` du même projet, dans `src/admin/`, plutôt que comme un second projet Vite — la spécification fonctionnelle ci-dessous reste inchangée.)*

Même stack que le site public pour rester cohérent : **React 19 + TypeScript + Tailwind CSS v4**.

Écrans requis :
1. **Connexion** — formulaire email/mot de passe, gestion des erreurs (identifiants invalides, compte verrouillé), redirection vers le dashboard si déjà connecté.
2. **Dashboard / Gammes** — liste des 4 gammes avec aperçu couleur, édition de chaque gamme (nom, tagline, couleurs via color-picker, description, ingrédients) et de ses 4 produits associés (type, poids, description). Aperçu en direct du rendu (réutiliser les couleurs et la mise en page du site public pour que l'aperçu soit fidèle).
3. **Pages** — édition des blocs de contenu par page (Accueil, Présentation, Notre Histoire, Contact) : champs texte simples et zones de texte riche limitées (gras, italique, listes, liens) pour les blocs `richtext`.
4. **Médiathèque** — upload d'image (drag & drop + sélecteur), aperçu, suppression, association d'une image à une gamme ou à un bloc de contenu.
5. **Coordonnées & réseaux sociaux** — formulaire simple pour téléphone, adresse, email, WhatsApp, liens Facebook/Instagram.

Exigences transverses de l'admin :
- Toute action de sauvegarde affiche un état de chargement et un retour de succès/erreur explicite (pas de sauvegarde silencieuse).
- Confirmation avant toute suppression (image, produit).
- Formulaires validés côté client (champs requis, formats couleur hex, format email/téléphone) **en plus** de la validation serveur — jamais l'un sans l'autre.
- Le jeton CSRF renvoyé au login doit être conservé (mémoire, pas de `localStorage` pour un token sensible) et envoyé sur chaque requête de modification.
- Responsive (utilisable sur tablette au minimum, la marque pouvant éditer depuis un iPad).
- Aucune donnée sensible (mot de passe) stockée en `localStorage`.

### 6.2 Intégration du site public (`src/`)

- Remplacer l'import statique de `GAMMES` depuis `src/data.ts` par un appel à `GET /api/gammes/list.php` (idem pour les blocs de contenu et les coordonnées de contact).
- Prévoir un état de chargement (skeleton ou spinner discret cohérent avec la charte) et un état d'erreur réseau qui n'empêche pas le reste du site de fonctionner.
- **Mécanisme de repli obligatoire** : conserver `src/data.ts` comme contenu par défaut/fallback si l'API est indisponible (panne serveur, maintenance) — le site vitrine ne doit jamais afficher une page blanche si l'API ne répond pas.
- Ne pas casser le typage existant : les types `Gamme` / `Product` de `src/data.ts` doivent rester la source de vérité des types TypeScript ; l'API doit renvoyer des données conformes à cette forme (Dev A et Dev B alignent le contrat JSON sur ces interfaces).
- Conserver les routes actuelles (`src/routes.tsx`) et la structure des composants (`Layout`, `Nav`, `Footer`, `BlackSkinsBanner`) inchangées dans leur fonctionnement ; seule la source des données change.

### 6.3 Cohérence graphique et code (obligatoire pour les deux développeurs)

Respecter les règles déjà en vigueur dans le projet (voir `AGENTS.md`) :
- Guillemets doubles pour toute chaîne contenant une apostrophe (`"C'est parti"`), ou apostrophe échappée dans une chaîne simple.
- JSX toujours bien fermé, accolades équilibrées.
- Export par défaut pour chaque composant.
- Tailwind CSS v4 en utilitaires directement dans le JSX ; pas de nouveau fichier de config Tailwind.
- Réutiliser la palette de couleurs par gamme (`color`, `colorLight`, `colorDark`) et les polices déjà en place (`DM Serif Display` pour les titres, `Outfit` pour le reste) pour que l'admin reste visuellement cohérent avec le site public, sans dupliquer inutilement de styles.

---

## 7. Environnements et configuration

- **Local (dev)** : chaque développeur lance son propre serveur PHP (`php -S localhost:8000 -t api`) et MySQL local (ou une base de dev partagée), avec un `api/config.php` local non commité.
- **Production (LWS)** : base MySQL unique fournie par l'hébergeur, `config.php` déposé manuellement via FTP/gestionnaire de fichiers (jamais via Git), voir `host.md` pour la procédure complète.
- Variables sensibles concernées : identifiants MySQL, secret de session, identifiants admin initiaux — tous à définir uniquement sur le serveur, jamais dans le dépôt.

## 8. Jalons proposés

1. **Socle** (Dev A) : schéma SQL, connexion PDO, auth login/logout, `require_admin()`.
2. **Socle** (Dev B, en parallèle) : squelette de l'admin (routing, écran de connexion branché sur l'auth de Dev A dès qu'elle est prête), squelette du site public avec appel API + fallback sur `data.ts`.
3. **CRUD Gammes/Produits** : endpoints + écran admin correspondant + branchement site public.
4. **CRUD Contenu de pages + Médiathèque** : endpoints upload/contenu + écrans admin + branchement site public.
5. **Coordonnées & réseaux sociaux**.
6. **Durcissement sécurité** : revue croisée CSRF/upload/validation, tests des cas d'erreur (accès non authentifié, payload invalide, upload de fichier non image).
7. **Déploiement** selon `host.md`, seed du contenu actuel, recette finale sur `teintdafrique.com`.

## 9. Definition of Done

- Toutes les données actuellement en dur dans `src/data.ts` et dans les pages sont éditables depuis l'admin, sans régression visuelle sur le site public.
- Le site public reste fonctionnel si l'API est indisponible (fallback statique).
- Aucun identifiant, mot de passe ou secret n'est présent dans l'historique Git.
- `npm run build` (site public) et le build de `admin/` réussissent sans erreur TypeScript.
- Les endpoints d'écriture refusent toute requête non authentifiée (testé manuellement).
- Les uploads d'images refusent les fichiers non image.

## 10. Hors périmètre (explicitement exclu de ce lot)

- Paiement en ligne / panier d'achat.
- Multi-langue.
- Gestion de plusieurs comptes admin avec rôles différenciés.
- Historique de versions / rollback du contenu.

Ces points pourront faire l'objet d'un lot ultérieur si besoin.
