# Template BLANC — Boutique E-commerce

Structure réutilisable pour créer rapidement un site e-commerce
pour un nouveau client. Ne modifier **que `config.js`** dans la
majorité des cas.

## Structure du projet

```
blanc-template/
├── index.html          ← Page boutique (ne pas modifier)
├── admin.html           ← Page admin (ne pas modifier)
├── config.js             ← LE SEUL FICHIER À MODIFIER PAR CLIENT
├── css/
│   ├── style.css          (styles boutique — ne pas modifier)
│   └── admin.css            (styles admin — ne pas modifier)
├── js/
│   ├── site.js             (logique boutique — ne pas modifier)
│   ├── admin.js              (logique admin — ne pas modifier)
│   └── wilayas-communes.js    (données communes par wilaya — ne pas modifier)
└── google-apps-script/
    └── orders.gs              (script à coller dans le Google Sheet du client)
```

## Checklist pour un nouveau client

### 1. Dupliquer le dossier
Copiez tout le dossier `blanc-template/` et renommez-le au nom du client.

### 2. Créer les comptes du client (séparés du compte précédent)

**Firebase** — un nouveau projet à chaque client :
1. [console.firebase.google.com](https://console.firebase.google.com) → Créer un projet
2. Activer **Firestore Database** (mode test, puis sécuriser les règles)
3. Activer **Authentication → Email/Password**
4. Créer l'utilisateur admin (email + mot de passe du client ou le vôtre)
5. Récupérer le `firebaseConfig` dans Paramètres du projet → Vos applications

**Règles Firestore à publier** :
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /produits/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Cloudinary** — un compte ou au minimum un upload preset différent par client :
1. [cloudinary.com](https://cloudinary.com) → nouveau compte ou nouveau preset
2. Settings → Upload → Upload presets → Add upload preset → **Unsigned**
3. Noter le `cloud name` et le nom du preset

**Google Sheets + Apps Script** — pour recevoir les commandes :
1. Créer une nouvelle feuille Google Sheets, avec en 1ère ligne :
   `Date | Produit | Prénom | Nom | Téléphone | Wilaya | Commune | Adresse | Taille | Couleur | Quantité | Type livraison | Frais livraison | Notes`
2. Extensions → Apps Script → coller le contenu de [`google-apps-script/orders.gs`](google-apps-script/orders.gs)
3. Déployer → Nouvelle application Web → exécuter en tant que **moi**, accès **Tout le monde** → copier l'URL `/exec`

### 3. Remplir `config.js`

Ouvrez `config.js` et modifiez uniquement les valeurs (jamais les noms de clés) :

| Champ | Quoi mettre |
|---|---|
| `shopName` | Nom de la boutique du client |
| `shopTagline` | Accroche principale (hero) |
| `shopDescription` | Phrase sous l'accroche |
| `heroImage` | URL Cloudinary de la photo bannière |
| `firebase` | Le `firebaseConfig` du **nouveau** projet Firebase |
| `cloudinary` | `cloudName` + `uploadPreset` du **nouveau** compte |
| `ordersScriptUrl` | URL Apps Script du **nouveau** Google Sheet |
| `deliveryZones` | Liste des wilayas/régions — les 58 wilayas d'Algérie par défaut, correspondant aux clés de `js/wilayas-communes.js` (voir ci-dessous). Adapter si hors Algérie. |
| `colors` | Modifier seulement si le client veut une autre palette |
| `categories` | Liste des catégories de produits (valeur + libellé) — alimente le filtre du site et le menu déroulant admin |
| `analytics` | ID Meta Pixel et/ou Google Analytics du client (laisser vide `""` si absent) |
| `deliveryRates` | Tarifs de livraison réels du client par wilaya et type (domicile/bureau) — voir section dédiée ci-dessous |

### 4. Déployer sur Cloudflare Pages (recommandé — gratuit, bande passante illimitée)

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages**
2. Soit glissez **tout le dossier** du client (**Upload assets**), soit connectez un repo GitHub dédié à ce client
3. Aucune commande de build à renseigner (site statique) — dossier de sortie : `/`
4. Le site est en ligne sur `nom-du-projet.pages.dev`
5. Optionnel : **Custom domains** → connecter le nom de domaine du client (gratuit, SSL inclus)

Pourquoi Cloudflare Pages plutôt que Netlify : bande passante illimitée même
sur le plan gratuit (Netlify plafonne à 100 Go/mois cumulés sur tout le
compte), ce qui compte dès que vous gérez plusieurs sites clients sur un
même compte.

**Alternative — Netlify** (interface glisser-déposer parfois jugée plus simple pour un client non-technique) :
1. Glissez **tout le dossier** sur [app.netlify.com](https://app.netlify.com)
2. Ou connectez un nouveau repo GitHub dédié à ce client
3. Le site est en ligne sur `nom-aleatoire.netlify.app`
4. Optionnel : connecter un nom de domaine personnalisé du client

### 5. Tester avant livraison

- [ ] Le hero affiche la bonne photo et le bon texte
- [ ] Connexion admin fonctionne avec le bon email
- [ ] Ajout d'un produit test → apparaît bien sur le site en quelques secondes
- [ ] Commande test → bien reçue dans le Google Sheet du client
- [ ] Suppression du produit test après validation

## Champ commune (cascade wilaya → commune)

Le formulaire de commande affiche automatiquement un menu déroulant des
communes de la wilaya sélectionnée, à partir de `js/wilayas-communes.js`
(1541 communes, 58 wilayas). Ce fichier est partagé entre tous les clients
Algérie et ne doit pas être modifié.

- Si le client est en Algérie et que `deliveryZones` reste la liste par
  défaut, le champ commune apparaît automatiquement — rien à faire.
- Si le client est hors Algérie (ou si `deliveryZones` a été remplacé par
  une liste personnalisée), le champ commune reste masqué automatiquement
  puisqu'aucune donnée ne correspond à ces zones.
- **Important pour un client déjà en production** : si vous ajoutez ce
  champ à un site existant, pensez à ajouter la colonne `Commune` dans le
  Google Sheet du client et à redéployer son Apps Script avec la version à
  jour de `google-apps-script/orders.gs` (sinon la donnée est bien envoyée
  mais atterrit dans la mauvaise colonne).

## Mode de livraison et tarifs (domicile / bureau)

Le formulaire de commande propose un choix **À domicile** / **Bureau (point
relais)**, et affiche un résumé (prix produit + frais de livraison + total)
calculé automatiquement à partir de `deliveryRates` dans `config.js`.

- `deliveryRates.default` s'applique à toutes les wilayas non listées dans
  `overrides`.
- `deliveryRates.overrides` permet de fixer un tarif différent pour des
  wilayas spécifiques (ex : Sud algérien plus cher).
- **Remplacez les montants d'exemple par les tarifs réels négociés avec le
  transporteur du client** (Yalidine, ZR Express, ou autre) avant livraison.
- Si `deliveryRates` est absent ou vide, le mode de livraison et le résumé
  ne s'affichent pas du tout — rétrocompatible avec les sites déjà en
  production qui n'ont pas encore ce champ.
- **Important pour un client déjà en production** : ajoutez les colonnes
  `Type livraison` et `Frais livraison` dans son Google Sheet et redéployez
  son Apps Script avec la version à jour de `google-apps-script/orders.gs`.

## Pourquoi un projet Firebase séparé par client ?

Chaque client a ses propres quotas gratuits (50K lectures/jour, 20K
écritures/jour), ses propres règles de sécurité, et aucune fuite de
données possible vers un autre client. Ne jamais réutiliser le même
projet Firebase pour plusieurs clients.

## Ce qui n'est volontairement PAS dans ce template

- Panier multi-produits (chaque produit a son propre formulaire de commande)
- Gestion des stocks
- Authentification multi-rôles (un seul compte admin par client)

Ces fonctionnalités peuvent être ajoutées au besoin, mais elles
doivent être développées une fois puis reportées dans `site.js` /
`admin.js` pour rester réutilisables sur tous les futurs clients.
