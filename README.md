# Teint d'Afrique Cosmétiques

Site vitrine de la marque camerounaise de cosmétiques naturels **Teint d'Afrique Cosmétiques**, dont le slogan est *« Votre peau vaut de l'or »*. La marque propose des soins naturels formulés pour sublimer les peaux noires et métissées sans jamais chercher à les éclaircir.

Le site présente la marque, son histoire, sa fondatrice et ses quatre gammes de produits, chacune pensée autour d'un univers d'ingrédients et d'un code couleur propre.

## Aperçu

- **Accueil** — présentation générale de la marque et de ses gammes
- **Présentation** — la marque, sa mission et sa fondatrice, Minette Kamdem
- **Notre Histoire** — la genèse et la vision de Teint d'Afrique Cosmétiques
- **Boutique** — les 4 gammes de produits, chacune déclinée en savon, lotion, crème de visage et lait corps
  - **ÉCLAT** — Curcuma & Carotte
  - **RÉPARATION** — Huile de Marula & Collagène Marin
  - **HYDRATATION** — Aloe Vera & Concombre
  - **NUTRITION** — Beurre de Mangue & Huile d'Avocat
- **Contact** — coordonnées (Douala, Cameroun), email, réseaux sociaux et WhatsApp

## Stack technique

- [React 19](https://react.dev/) + [React Router 8](https://reactrouter.com/)
- [Vite 8](https://vite.dev/) comme outil de build et serveur de développement
- [Tailwind CSS v4](https://tailwindcss.com/) via le plugin `@tailwindcss/vite`
- [TypeScript 5.7](https://www.typescriptlang.org/)
- Gestion de paquets avec [pnpm](https://pnpm.io/)

## Prérequis

- Node.js 22 (voir `.mise.toml`)
- pnpm 10 (peut être obtenu via `corepack enable` puis `corepack prepare pnpm@10 --activate`)

## Installation

```bash
pnpm install
```

## Développement

```bash
pnpm dev
```

Lance le serveur de développement Vite avec rechargement à chaud.

## Build de production

```bash
pnpm build
```

Génère les fichiers statiques optimisés dans le dossier `dist/`.

## Prévisualisation du build

```bash
pnpm preview
```

## Structure du projet

```
src/
├── main.tsx              # Point d'entrée React
├── App.tsx                # Composant racine (RouterProvider)
├── routes.tsx              # Déclaration des routes
├── data.ts                 # Données des gammes de produits
├── index.css                # Entrée CSS globale + import Tailwind v4
├── components/
│   ├── Layout.tsx            # Structure commune (Nav + Footer + Outlet)
│   ├── Nav.tsx                # Barre de navigation
│   ├── Footer.tsx              # Pied de page
│   └── BlackSkinsBanner.tsx     # Bandeau de mise en avant de la marque
├── pages/
│   ├── AccueilPage.tsx
│   ├── PresentationPage.tsx
│   ├── HistoirePage.tsx
│   ├── BoutiquePage.tsx
│   ├── GammePage.tsx
│   └── ContactPage.tsx
└── imports/                # Assets de marque (logo, visuels, étiquettes produits)
```

## Origine du projet

Ce projet a été conçu avec [Figma Make](https://www.figma.com/make/).
