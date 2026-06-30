/* ============================================================
   CONFIG.JS — Fichier unique à modifier pour chaque nouveau client
   ============================================================
   C'est le SEUL fichier à éditer pour personnaliser un nouveau site.
   Tout le reste (style.css, site.js, admin.js) reste identique
   d'un client à l'autre.
   ============================================================ */

const SITE_CONFIG = {

  // ── IDENTITÉ DE LA BOUTIQUE ──
  shopName: "BLANC",
  shopTagline: "La mode sans bruit",
  shopDescription: "Des pièces intemporelles pensées pour durer. Matières nobles, coupes épurées, fabrication responsable.",
  shopFooterText: "Mode minimaliste, fabriquée avec des matières sélectionnées.",
  contactEmail: "contact@blanc-mode.com",
  contactHours: "Lun–Ven, 9h–18h",
  footerNote: "Paiement à la livraison · Livraison partout en Algérie",

  // ── IMAGE HERO (bannière d'accueil) ──
  heroImage: "https://res.cloudinary.com/djikeohkg/image/upload/v1782746468/ddbe6d64623ccc6cb5e2c147a420a6dc_hc7rld.jpg",

  // ── COULEURS (laisser tel quel pour garder le style noir/blanc minimaliste) ──
  colors: {
    black:   "#111111",
    white:   "#FFFFFF",
    gray100: "#F5F5F3",
    gray200: "#E8E8E4",
    gray400: "#AAAAAA",
    gray600: "#666666"
  },

  // ── TYPOGRAPHIE (laisser tel quel sauf demande spécifique du client) ──
  fonts: {
    display: "'Cormorant Garamond', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Inter:wght@400;500&display=swap"
  },

  // ── FIREBASE (un projet Firebase DIFFÉRENT par client — voir README) ──
  firebase: {
    apiKey: "AIzaSyAtCzEBCCtTVNQxBiSZTAesFa4EEbxER6k",
    authDomain: "blanc-boutique.firebaseapp.com",
    projectId: "blanc-boutique",
    storageBucket: "blanc-boutique.firebasestorage.app",
    messagingSenderId: "279528112650",
    appId: "1:279528112650:web:ff800b44f63adb72c195f3"
  },

  // ── CLOUDINARY (un compte/preset différent par client recommandé) ──
  cloudinary: {
    cloudName: "djikeohkg",
    uploadPreset: "ml_default"
  },

  // ── GOOGLE SHEETS — Apps Script URL pour recevoir les commandes ──
  ordersScriptUrl: "https://script.google.com/macros/s/AKfycbz0WTn952EGJd9wceHCmE1ZU1T1j4k8VZ357MGn1RapwDQ50-iQA75g0VftayPk-OlMnQ/exec",

  // ── ZONES DE LIVRAISON (modifier selon le pays/région du client) ──
  deliveryZones: [
    "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar",
    "Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Alger",
    "Djelfa","Jijel","Sétif","Saïda","Skikda","Sidi Bel Abbès","Annaba","Guelma",
    "Constantine","Médéa","Mostaganem","M'Sila","Mascara","Ouargla","Oran","El Bayadh",
    "Illizi","Bordj Bou Arréridj","Boumerdès","El Tarf","Tindouf","Tissemsilt","El Oued",
    "Khenchela","Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma","Aïn Témouchent",
    "Ghardaïa","Relizane"
  ],
  deliveryZoneLabel: "Wilaya",

  // ── DEVISE ──
  currency: "DA",
  currencyLocale: "fr-DZ",

  // ── TEXTES DU FORMULAIRE DE COMMANDE ──
  orderForm: {
    title: "Commander ce produit",
    sizeLabel: "Taille",
    colorLabel: "Couleur",
    qtyLabel: "Quantité",
    firstNameLabel: "Prénom *",
    lastNameLabel: "Nom",
    phoneLabel: "Téléphone *",
    addressLabel: "Adresse de livraison *",
    notesLabel: "Notes (optionnel)",
    submitPrefix: "Commander — ",
    submitSuffix: " / unité",
    successTitle: "Commande reçue !",
    successText: "Nous vous contactons dans les 24h pour confirmer et organiser la livraison."
  },

  // ── FOOTER LIENS (modifiable par client) ──
  footerLinks: [
    { label: "Guide des tailles", url: "#" },
    { label: "Livraison & retours", url: "#" },
    { label: "Entretien des pièces", url: "#" }
  ]
};

// Ne pas modifier — rend la config accessible aux autres fichiers
window.SITE_CONFIG = SITE_CONFIG;
