# Teint d'Afrique Cosmétiques

Site vitrine + panneau d'admin de la marque camerounaise de cosmétiques naturels **Teint d'Afrique Cosmétiques**, dont le slogan est *« Votre peau vaut de l'or »*. La marque propose des soins naturels formulés pour sublimer les peaux noires et métissées sans jamais chercher à les éclaircir.

Le projet est composé de deux parties :

- **Un frontend unique** (`src/`) — Réact + Vite + TS + Tailwind v4. Le site public **et** l'admin (`/admin`, chargé à la demande) font partie du même projet : un seul `npm install`, un seul build, un seul hébergement.
- **Un backend PHP + MySQL** (`api/`) — petite API REST maison (sans framework), qui alimente le site public en données (gammes, textes, coordonnées) et permet à l'admin de tout modifier.

## Quoi de neuf ?

Le site est entièrement gérable depuis l'admin, sans toucher au code : produits (ajout, suppression, image, ordre par glisser-déposer), textes de toutes les pages (y compris mise en forme riche), images du hero et du portrait de l'accueil (import direct depuis l'ordinateur), ordre des gammes, coordonnées et réseaux sociaux. Le formulaire de contact fonctionne : les messages arrivent dans l'onglet « Messages » de l'admin (anti-spam intégré). Le détail des évolutions est dans le [CHANGELOG](CHANGELOG.md).

## Pages du site public

- **Accueil** — présentation générale de la marque et de ses gammes
- **Présentation** — la marque, sa mission et sa fondatrice, Minette Kamdem
- **Notre Histoire** — la genèse et la vision de Teint d'Afrique Cosmétiques
- **Boutique** — les 4 gammes de produits, chacune déclinée en savon, lotion, crème de visage et lait corps
  - **ÉCLAT** — Curcuma & Carotte
  - **RÉPARATION** — Huile de Marula & Collagène Marin
  - **HYDRATATION** — Aloe Vera & Concombre
  - **NUTRITION** — Beurre de Mangue & Huile d'Avocat
- **Contact** — coordonnées (Douala, Cameroun), email, réseaux sociaux, WhatsApp et un
  formulaire fonctionnel (les messages sont reçus dans l'admin)

## Admin (`/admin`)

Connexion protégée (anti brute-force + CSRF), puis édition de :

- **Gammes & produits** — couleurs, textes, images (import direct depuis le PC), ajout/suppression
  de produits, réordonnancement par glisser-déposer (produits **et** gammes)
- **Pages** — tous les blocs de texte (y compris les blocs enrichis « richtext ») et les images
  du hero / portrait de l'accueil
- **Messages** — les messages reçus via le formulaire de contact (lu/non lu, suppression,
  réponse par email)
- **Médiathèque** — gestion des images (réencodage serveur, 5 Mo max), alt, suppression
- **Coordonnées** — téléphone, email, adresse, WhatsApp, réseaux sociaux

Toute modification est visible sur le site public. Le site retombe silencieusement sur son contenu statique si l'API est indisponible (jamais de page blanche — voir `docs/plan.md` §6.2).

## Stack technique

- [React 19](https://react.dev/) + [React Router](https://reactrouter.com/)
- [Vite 8](https://vite.dev/) comme outil de build et serveur de développement
- [Tailwind CSS v4](https://tailwindcss.com/) via le plugin `@tailwindcss/vite`
- [TypeScript 5.7](https://www.typescriptlang.org/)
- Gestion de paquets avec [npm](https://www.npmjs.com/)
- PHP 8+ (extensions `pdo_mysql` et `gd`) + MySQL/MariaDB — sans framework

## Prérequis

- Node.js 22 (voir `.mise.toml`) et npm
- PHP 8+ (avec `pdo_mysql` et `gd`) et MySQL/MariaDB — le plus simple : XAMPP, ou Laragon sous Windows

## Démarrage rapide

Le guide complet, pas à pas, est dans **`docs/setup.md`**. En résumé :

```bash
npm install                                        # 1. dépendances front (tout-en-un)
# 2. démarrer MySQL, puis créer la base + tables :
mysql -u root < api/scripts/migrate.sql
cp api/config.php.example api/config.php           # 3. config API (jamais commité)
php api/scripts/seed.php toi@email.com MotDePasse  # 4. seed du contenu + ton compte admin
php -S 127.0.0.1:8100 -t api                        # 5. terminal 1 : lancer l'API PHP
API_URL=http://127.0.0.1:8100 npm run dev           # 6. terminal 2 : site + admin
```

- Site public : `http://localhost:8443/`
- Admin : `http://localhost:8443/admin`

`API_URL` est indispensable : sans lui, le site essaie de joindre l'API sur le port 8000 et reste sur son contenu statique de repli.

## Build de production

```bash
npm run build
```

Génère les fichiers statiques optimisés dans `dist/`, y compris un chunk admin séparé (`AdminApp-*.js`) pour ne pas alourdir le bundle public. Vérifications : `npx tsc --noEmit -p tsconfig.json` et `npm run build`.

## Structure du projet

```
src/
├── main.tsx                # Point d'entrée React
├── App.tsx                 # Composant racine (RouterProvider)
├── routes.tsx              # Routes ; l'admin (/admin) est chargé à la demande
├── data.ts                 # Source de vérité des types + contenu statique de repli
├── index.css               # CSS global + import Tailwind v4 + styles .rich-text
├── lib/api.ts              # Client API (fetch json, repli silencieux)
├── hooks/                  # useGammes, useContent, useRichContent, useSettings,
│                           # useContentImage
├── admin/                  # Panneau d'admin (LoginPage, GammesPage, ContentPage,
│                           # MessagesPage, MediaPage, SettingsPage, Layout, UI)
├── components/             # Nav, Footer, Layout
├── pages/                  # Accueil, Présentation, Histoire, Boutique, Gamme, Contact
└── imports/                # Assets de marque (logo, visuels, étiquettes produits)

api/                        # Backend PHP + MySQL (voir api/README.md)
├── bootstrap.php           # Connexion PDO, CORS, sessions, sanitisation, helpers
├── auth/ gammes/ produits/ content/ settings/ media/ contact/   # Routes REST
├── scripts/migrate.sql     # Schéma de la base (8 tables)
├── scripts/seed.php        # Contenu initial + création du compte admin
├── config.php.example      # Modèle de config (host, user, pass…)
└── uploads/                # Images uploadées via la médiathèque

public/.htaccess            # Routage SPA + mapping /uploads → api/uploads (prod Apache)
docs/                       # plan.md (architecture), setup.md (guide de démarrage),
                            # host.md (déploiement LWS)
```

## Documentation

- `CHANGELOG.md` — tout ce qui a été fait, lot par lot, avec les commits
- `docs/plan.md` — architecture, répartition du travail, contrat des données
- `docs/setup.md` — guide de démarrage complet, de zéro à l'environnement de dev
- `docs/host.md` — procédure de mise en production sur l'hébergement LWS (DNS, SSL, upload)
- `api/README.md` — détail de chaque endpoint de l'API (auth, gammes, produits, contenu,
  messages de contact, médiathèque)

## Origine du projet

Ce projet a été conçu avec [Figma Make](https://www.figma.com/make/).