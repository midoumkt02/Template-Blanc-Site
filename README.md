# 🛍️ Template BLANC — Boutique e-commerce réutilisable pour l'Algérie

Template de boutique en ligne pensé pour être **déployé rapidement chez un nouveau client** : tout le site se personnalise depuis un seul fichier, `config.js`, sans toucher au code.

Conçu pour le e-commerce algérien : **paiement à la livraison**, commande sans création de compte, sélection **wilaya → commune** (58 wilayas, 1 541 communes), frais de livraison **à domicile ou en bureau** calculés automatiquement, et commandes reçues directement dans un **Google Sheet**.

> Exemple de configuration incluse : **213Moda**, boutique de mode au style noir et blanc minimaliste.

## Fonctionnalités

### Côté boutique
- Catalogue synchronisé en temps réel, avec filtre par catégorie
- Fiches produit avec plusieurs photos, badges et prix barré (promotion)
- **Formulaire de commande par produit** : plusieurs tailles et quantités dans une même commande, choix de la couleur
- Menu déroulant des communes selon la wilaya choisie
- Choix du mode de livraison (domicile ou point relais) avec tarifs par wilaya
- Récapitulatif automatique : prix produit + frais de livraison + total à payer
- Commandes envoyées vers un Google Sheet via Google Apps Script
- Suivi des conversions **Meta Pixel** et **Google Analytics** (événement déclenché à chaque commande)
- Favicon et logo dynamiques, design responsive

### Espace admin
- Connexion sécurisée (Firebase Authentication)
- Ajout, **modification** et suppression de produits
- Upload de plusieurs photos par produit vers **Cloudinary**, avec barre de progression
- Gestion des prix, anciens prix, catégories, tailles, couleurs et badges
- Filtre des produits par catégorie dans le tableau de bord

## Stack technique

- **HTML, CSS, JavaScript** (vanilla, modules ES), sans framework ni étape de build
- **Firebase** : Authentication et Cloud Firestore
- **Cloudinary** : hébergement et optimisation des images produits
- **Google Sheets + Apps Script** : réception des commandes
- **Meta Pixel / Google Analytics** (optionnels)

## Structure du projet

```
index.html               # boutique
admin.html               # espace admin
config.js                # seul fichier à personnaliser par client
css/
  style.css              # styles de la boutique
  admin.css              # styles de l'admin
js/
  site.js                # catalogue, commande, livraison, analytics
  admin.js               # authentification, gestion des produits, upload
  wilayas-communes.js    # 58 wilayas et 1 541 communes d'Algérie
```

## Démarrage rapide

Les scripts étant des modules ES, le site doit être servi par un serveur local :

```bash
python -m http.server 5173
```

Puis ouvrir `http://localhost:5173` (boutique) et `http://localhost:5173/admin.html` (admin).

## Adapter le template à un nouveau client

1. Dupliquer le dossier du projet
2. Créer un **nouveau projet Firebase**, un preset **Cloudinary** et un **Google Sheet** dédiés au client
3. Renseigner `config.js` : nom de la boutique, textes, images, couleurs, catégories, clés Firebase et Cloudinary, URL Apps Script, tarifs de livraison, identifiants analytics
4. Déployer sur un hébergeur statique (Cloudflare Pages, Netlify, Vercel…)

La procédure détaillée, étape par étape, est dans le [guide de mise en place d'un nouveau client](docs/guide-nouveau-client.md).

## Choix volontaires

Pour rester simple et rapide à livrer, le template n'inclut pas de panier multi-produits, de gestion des stocks ni de comptes clients. Chaque produit possède son propre formulaire de commande, ce qui correspond au parcours d'achat le plus courant dans le e-commerce algérien avec paiement à la livraison.

## Auteur

**Mehdi Meklat** — [GitHub](https://github.com/midoumkt02) · [LinkedIn](https://www.linkedin.com/in/mehdi-meklat-23478b18a/)
