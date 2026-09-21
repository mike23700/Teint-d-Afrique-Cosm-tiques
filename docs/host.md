# Procédure d'hébergement — teintdafrique.com sur LWS Panel

## 0. Situation actuelle du compte (relevée le 21/09/2026)

- Espace client : `LWS-826496`
- Formule : **Perso**
- Espace web : 100 Go — Bases MySQL : 1 — Comptes email : 5
- DNS de la formule : `ns17.lwsdns.com`, `ns18.lwsdns.com`, `ns19.lwsdns.com`, `ns20.lwsdns.com`
- ⚠️ Le panel affiche : **« Votre domaine ne semble pas joignable sur internet »**, et : **« Vous utilisez des serveurs DNS autres que ceux de LWS, vous ne pouvez donc pas modifier votre zone DNS. »**
  → Concrètement : `teintdafrique.com` ne pointe pas (encore) vers l'hébergement LWS. Tant que ce point n'est pas résolu (étape 1), rien de ce qui sera uploadé ne sera visible sur le domaine.
- SSL : **non disponible avec la formule actuelle** (pas de section SSL active dans le panel).
- Terminal / accès SSH : **non disponible avec la formule actuelle**.
- PHP : disponible (section « Configuration php » visible dans le menu).
- Firewall applications web (« Firewall Ip Web ») : activé par défaut — le laisser activé.
- LWSCache (cache serveur type Varnish) : activé par défaut — **penser à vider le cache après chaque déploiement** (bouton « Vider le cache » dans la section LWSCache).

Conséquence pour ce projet : le site (`src/`) est une **application statique** (React/Vite buildé en HTML/CSS/JS) — c'est exactement ce qu'un hébergement mutualisé sans Node.js peut servir sans aucune configuration serveur particulière. Le futur panneau d'admin (voir `plan.md`) s'appuiera sur PHP + MySQL, également disponibles sur cette formule.

---

## 1. Résoudre le problème DNS (préalable obligatoire)

Le message du panel indique que le domaine utilise des serveurs DNS externes à LWS. Deux options :

**Option A — Faire gérer le DNS par LWS (recommandé, plus simple ensuite)**
1. Identifier le registrar chez qui le domaine `teintdafrique.com` a été acheté (le panel indique « Registrar du domaine : non », donc le domaine a probablement été enregistré ailleurs puis rattaché à cet hébergement, ou l'information n'est pas synchronisée — à vérifier auprès du support LWS via ticket si besoin).
2. Chez ce registrar, remplacer les serveurs de noms (nameservers) du domaine par :
   - `ns17.lwsdns.com`
   - `ns18.lwsdns.com`
   - `ns19.lwsdns.com`
   - `ns20.lwsdns.com`
3. Attendre la propagation (jusqu'à 24-48h, souvent beaucoup plus rapide).
4. Une fois propagé, la section **Zone DNS** du panel LWS devient modifiable pour gérer les enregistrements (A, CNAME, MX...).

**Option B — Garder le DNS actuel et pointer manuellement vers LWS**
1. Demander à LWS (via un ticket dans « Aide en ligne » / Assistance) l'adresse IP du serveur mutualisé associé à l'espace `LWS-826496`.
2. Chez le fournisseur DNS actuel du domaine, créer/modifier un enregistrement **A** pointant `teintdafrique.com` (et `www.teintdafrique.com`) vers cette IP.
3. Attendre la propagation DNS.

Tant que l'une de ces deux options n'est pas faite, le site restera injoignable même après upload des fichiers.

---

## 2. Build de production en local

Depuis la racine du projet :

```bash
npm install
npm run build
```

Cela génère un dossier `dist/` contenant les fichiers statiques prêts à être déployés (`index.html`, `assets/`, etc.). C'est le **contenu de `dist/`** qui doit être envoyé sur l'hébergement — jamais le dossier `dist/` lui-même, ni `node_modules/`, ni le code source `src/`.

## 3. Envoi des fichiers sur LWS

Deux méthodes possibles depuis le panel :

**Via le Gestionnaire de fichiers (le plus simple pour un premier déploiement)**
1. Dans le panel LWS : *Fichiers → Gestionnaire de fichiers*.
2. Aller dans le dossier racine du site (généralement `www` ou `public_html` selon la formule — vérifier le nom exact dans le gestionnaire de fichiers).
3. Uploader tout le **contenu** de `dist/` (pas le dossier `dist` lui-même) à la racine de ce dossier.

**Via FTP (plus pratique pour des mises à jour régulières)**
1. Dans le panel : *Fichiers → Compte(s) FTP*, créer ou récupérer les identifiants FTP.
2. Se connecter avec un client FTP (FileZilla, Cyberduck, etc.) à l'hôte fourni par LWS, avec les identifiants du compte FTP.
3. Transférer le contenu de `dist/` dans le dossier racine web (`www`/`public_html`).

## 4. Fichier `.htaccess` pour le routing côté client (React Router)

Le site utilise `createBrowserRouter` (React Router), qui gère la navigation côté client via l'historique du navigateur. Sans configuration serveur, un rechargement de page sur une URL comme `teintdafrique.com/boutique/eclat` renverra une 404 Apache, puisque ce fichier n'existe pas physiquement.

Créer un fichier `.htaccess` à la racine du dossier web (`www`/`public_html`, au même niveau que `index.html`) avec ce contenu :

```apacheconf
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Ne pas réécrire les fichiers/dossiers qui existent réellement (assets, images, etc.)
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  # Laisser passer les appels à l'API PHP (une fois le panneau d'admin déployé, voir plan.md)
  # — /admin n'a pas besoin d'exclusion : c'est une route gérée par le même React Router que
  # le reste du site (voir src/routes.tsx), donc elle doit retomber sur index.html comme les autres.
  RewriteCond %{REQUEST_URI} !^/api/

  # Toutes les autres routes retombent sur index.html (SPA)
  RewriteRule ^ index.html [L]
</IfModule>
```

À uploader manuellement (il n'est pas généré par `npm run build`).

## 5. SSL (HTTPS)

La formule actuelle n'inclut pas de SSL natif. Deux options, sans changer de formule dans l'immédiat :
- **Cloudflare** (proposé directement dans le panel LWS, section « Optimisez la performance et la sécurité avec Cloudflare ») : en pointant le domaine vers Cloudflare et en activant le proxy, Cloudflare fournit un certificat SSL gratuit entre le visiteur et son CDN. Attention : cela ajoute une étape de configuration DNS supplémentaire (chez Cloudflare cette fois) et peut retarder la visibilité des mises à jour à cause de son cache — à désactiver le cache Cloudflare (mode « Development ») pendant les phases de mise à jour fréquente.
- **Changer de formule LWS** pour une offre incluant un certificat SSL natif, si la marque préfère rester uniquement chez LWS sans intermédiaire.

Recommandation : démarrer avec Cloudflare (gratuit, rapide à mettre en place) une fois le DNS stabilisé (étape 1).

## 6. Panneau d'admin (voir `plan.md`)

**Un seul domaine, un seul build, un seul hébergement.** L'admin n'est pas une application séparée : c'est une route (`/admin`) du même projet React, chargée à la demande (`src/admin/`, voir `src/routes.tsx`). Le `npm run build` de l'étape 2 produit déjà un `dist/` unique qui contient le site public **et** l'admin — il n'y a rien de plus à builder ni à uploader séparément pour le front. Seul le backend PHP (`api/`) est un dépôt distinct sur le serveur.

Étapes additionnelles, à faire uniquement quand le lot admin (`plan.md`) est prêt à être déployé :

1. **Base de données** : dans le panel, *Base de données & PHP → MySql & PhpMyadmin*, créer la base (1 seule disponible sur cette formule) et un utilisateur associé. Noter host, nom de base, utilisateur, mot de passe — **ne jamais les committer dans Git**.
2. Importer le schéma (`api/scripts/migrate.sql`) via phpMyAdmin, puis exécuter le script de seed une seule fois (`api/scripts/seed.php`) pour reprendre le contenu actuel de `src/data.ts`.
3. Créer un `api/config.php` sur le serveur (jamais dans le dépôt Git) à partir de `api/config.php.example`, avec les vrais identifiants MySQL.
4. Uploader le dossier `api/` à la racine du site (`www/api/`), à côté du `dist/` déjà déployé à l'étape 3 de la section précédente.
5. Créer le premier compte admin (email + mot de passe) — via `api/scripts/seed.php` en ligne de commande si un accès shell est possible, sinon directement en base via phpMyAdmin (avec un hash généré via `password_hash()` en PHP), puis via l'écran de connexion ensuite.
6. Résultat : `teintdafrique.com` affiche le site, `teintdafrique.com/admin` affiche l'écran de connexion de l'admin — un seul domaine, un seul déploiement front, comme prévu.

## 7. Vérifications post-déploiement (à chaque mise en ligne)

1. Vider le cache LWSCache (*Optimisation et performance → LWSCache → Vider le cache*) — sinon d'anciennes versions des fichiers peuvent continuer à être servies.
2. Visiter `https://teintdafrique.com` et vérifier :
   - la page d'accueil s'affiche correctement,
   - la navigation entre les pages fonctionne,
   - un rechargement de page sur une route interne (ex. `/boutique/eclat`) ne renvoie pas de 404 (test du `.htaccess`),
   - les images et le logo se chargent.
3. Si l'admin est déployé, tester une connexion et une modification simple de bout en bout.

## 8. Bonnes pratiques de sécurité pour l'hébergement

- Ne jamais committer d'identifiants (FTP, MySQL, admin) dans le dépôt Git — tous les fichiers de config réels doivent rester en dehors du contrôle de version (`.gitignore`).
- Changer le mot de passe du compte LWS régulièrement (*Assistance → Changement de mot de passe* dans le panel).
- Garder le Firewall Ip Web activé (déjà le cas par défaut).
- Une fois la formule permettant les sauvegardes automatiques dépassée en volume (>20 Go), envisager l'option de sauvegarde payante proposée par LWS, ou mettre en place des exports MySQL manuels réguliers via phpMyAdmin en complément.
