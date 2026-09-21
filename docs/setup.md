# Guide de démarrage — rejoindre le projet Teint d'Afrique Cosmétiques

Ce guide t'amène de zéro à un environnement de développement complet (site public + admin + base de données), identique à celui utilisé pour construire le projet.

> ⚠️ **Pré-requis côté dépôt** : ce guide suppose que le travail décrit ici (dossier `api/`, `src/admin/`, ce dossier `docs/`) a bien été commité et poussé sur le dépôt distant par le reste de l'équipe. Si `git pull` ne te remonte pas ces dossiers, demande avant de continuer — le guide ne fonctionnera pas tant qu'ils ne sont pas là.

## 0. Vue d'ensemble rapide

Le projet a deux parties :
- **Un frontend unique** (`src/`) en React + Vite + TypeScript + Tailwind CSS v4 : le site public **et** l'admin (route `/admin`, chargée à la demande) font partie du **même** projet — un seul `npm install`, un seul serveur de dev.
- **Un backend PHP + MySQL** (`api/`) : une petite API REST maison (pas de framework), qui alimente le site public en données (gammes, textes, coordonnées) et permet à l'admin de tout modifier.

Pour l'architecture complète et le détail des choix techniques, voir [`plan.md`](./plan.md). Pour la mise en production, voir [`host.md`](./host.md). Pour le contrat de l'API, voir [`../api/README.md`](../api/README.md).

## 1. Pré-requis à installer

- **Git**
- **Node.js 22** (voir `.mise.toml`) + npm (fourni avec Node)
- **PHP 8+** avec les extensions `pdo_mysql` et `gd`, et un serveur **MySQL/MariaDB**. Le plus simple : installer **XAMPP** (Linux/Mac/Windows), qui fournit les deux d'un coup.
  - Sur Linux, XAMPP s'installe typiquement dans `/opt/lampp/`. Adapte les chemins `/opt/lampp/bin/php` et `/opt/lampp/bin/mysql` ci-dessous si ton installation est différente (ou si `php`/`mysql` sont déjà dans ton `PATH`, tu peux juste utiliser `php`/`mysql` directement).

## 2. Récupérer le projet

```bash
git clone <url-du-dépôt>
cd "Teint d'Afrique Cosmétiques"
```

Si tu as déjà le dépôt cloné :

```bash
git pull
```

## 3. Installer les dépendances du frontend

Depuis la racine du projet (site public **et** admin sont dans le même `npm install`) :

```bash
npm install
```

## 4. Démarrer MySQL

- Avec XAMPP : ouvre le manager XAMPP et démarre le module MySQL, ou en ligne de commande sur Linux :
  ```bash
  sudo /opt/lampp/lampp startmysql
  ```

## 5. Créer la base de données et les tables

Depuis la racine du projet :

```bash
/opt/lampp/bin/mysql -u root < api/scripts/migrate.sql
```

Ça crée la base `teint_dafrique` avec ses 6 tables (`admin_users`, `gammes`, `produits`, `page_content`, `settings`, `media`, `login_attempts`). Rien à modifier dans ce script.

## 6. Configurer l'API

```bash
cp api/config.php.example api/config.php
```

Les valeurs par défaut (`host: 127.0.0.1`, `user: root`, `pass: ''`) correspondent à une installation XAMPP standard — normalement rien à changer, sauf si ton MySQL local a un autre utilisateur/mot de passe.

**`api/config.php` ne doit jamais être commité** (il est déjà listé dans `.gitignore`) : il contient — ou contiendra en production — des identifiants.

## 7. Peupler le contenu + créer TON compte admin

```bash
/opt/lampp/bin/php api/scripts/seed.php <ton-email> <ton-mot-de-passe>
```

Exemple :

```bash
/opt/lampp/bin/php api/scripts/seed.php prenom@teintdafrique.com UnMotDePasseSolide2026
```

Choisis **ton propre** email et mot de passe (au moins 12 caractères) — ce compte n'existe que dans **ta** base MySQL locale, il n'a pas besoin d'être identique à celui d'un autre développeur. Le script reprend automatiquement le contenu actuel des 4 gammes/16 produits, une trentaine de blocs de texte des pages, et les coordonnées de contact.

Le script refuse de s'exécuter si la table `gammes` contient déjà des données (protection anti-doublon en cas de relance accidentelle). Pour repartir de zéro :

```bash
/opt/lampp/bin/mysql -u root -e "DROP DATABASE teint_dafrique;"
```

puis refaire les étapes 5 et 7.

## 8. Lancer l'API PHP

Dans un premier terminal, **à garder ouvert** :

```bash
/opt/lampp/bin/php -S 127.0.0.1:8100 -t api
```

> Pourquoi le port 8100 et pas le classique 8000 ? Parce que 8000 est parfois déjà pris par un autre projet local (ça a été le cas en développant ce projet). Si 8000 est libre chez toi, tu peux l'utiliser à la place — adapte alors `API_URL` à l'étape suivante en conséquence.

## 9. Lancer le site public + l'admin

Dans un **second** terminal :

```bash
API_URL=http://127.0.0.1:8100 npm run dev
```

- Site public : http://localhost:8443/
- Admin : http://localhost:8443/admin — connecte-toi avec l'email/mot de passe choisis à l'étape 7.

⚠️ **Le `API_URL=...` est indispensable.** Sans lui, le site essaie de parler à l'API sur le port 8000 par défaut. Si ce n'est pas le bon port chez toi, le site échoue silencieusement à charger les données dynamiques et retombe sur son contenu statique de secours (comportement voulu pour ne jamais planter, voir `plan.md` §6.2) — mais tu ne verras alors jamais tes modifications faites depuis l'admin sur le site public.

## 10. Vérifier que tout fonctionne

```bash
npx tsc --noEmit -p tsconfig.json   # aucune erreur attendue
npm run build                        # doit se terminer par "✓ built in ...ms"
```

Dans le build, tu dois voir un chunk séparé du type `AdminApp-xxxxx.js` (~20 Ko) : ça confirme que le code de l'admin n'est pas mélangé au bundle principal du site public.

Ensuite, en navigateur :
1. Va sur http://localhost:8443/admin, connecte-toi.
2. Modifie un champ (ex. la tagline de la gamme ÉCLAT), enregistre.
3. Va sur http://localhost:8443/, recharge la page : le changement doit apparaître (uniquement pour les textes déjà branchés à l'API — voir `plan.md` §6.2 et `../api/README.md` pour la liste).

## 11. Pièges fréquents

- **« Une erreur est survenue » à la connexion admin** → l'API n'est pas joignable depuis le front. Vérifie que le terminal de l'étape 8 tourne toujours, et que `API_URL` (étape 9) pointe bien vers le bon port.
- **Une modification en admin n'apparaît pas sur le site public** → soit le proxy `API_URL` n'est pas configuré (voir ci-dessus), soit ce texte précis n'a pas encore été branché à l'API côté site public (certains textes restent volontairement statiques pour préserver une mise en forme colorée — voir `plan.md` §6.2).
- **Erreur de connexion MySQL au lancement du terminal de l'étape 8** → MySQL n'est pas démarré (retour à l'étape 4).
- **`git pull` ne ramène pas `api/`, `src/admin/` ou `docs/`** → ce travail n'a pas encore été poussé sur le dépôt distant, voir l'avertissement en haut de ce fichier.

## 12. Pour aller plus loin

- Architecture, répartition du travail, contrat de données : [`plan.md`](./plan.md)
- Mise en production sur l'hébergement LWS : [`host.md`](./host.md)
- Détail de chaque endpoint de l'API (auth, gammes, contenu, médiathèque...) : [`../api/README.md`](../api/README.md)
