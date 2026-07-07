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
└── js/
    ├── site.js             (logique boutique — ne pas modifier)
    └── admin.js              (logique admin — ne pas modifier)
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
1. Créer une nouvelle feuille Google Sheets
2. Extensions → Apps Script → coller le script `doPost` (voir historique de conversation)
3. Déployer → Nouvelle application Web → copier l'URL `/exec`

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
| `deliveryZones` | Liste des wilayas/régions (adapter si hors Algérie) |
| `colors` | Modifier seulement si le client veut une autre palette |
| `categories` | Liste des catégories de produits (valeur + libellé) — alimente le filtre du site et le menu déroulant admin |
| `analytics` | ID Meta Pixel et/ou Google Analytics du client (laisser vide `""` si absent) |

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
