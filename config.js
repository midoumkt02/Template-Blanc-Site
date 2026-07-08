/* ============================================================
   CONFIG.JS — Fichier unique à modifier pour chaque nouveau client
   ============================================================
   C'est le SEUL fichier à éditer pour personnaliser un nouveau site.
   Tout le reste (style.css, site.js, admin.js) reste identique
   d'un client à l'autre.
   ============================================================ */

const SITE_CONFIG = {

  // ── IDENTITÉ DE LA BOUTIQUE ──
  shopName: "Hijabouki.",
  shopTagline: "La mode sans bruit",
  shopDescription: "Des pièces intemporelles pensées pour durer. Matières nobles, coupes épurées, fabrication responsable.",
  shopFooterText: "Mode minimaliste, fabriquée avec des matières sélectionnées.",
  contactEmail: "contact@Hijabi-mode.com",
  contactHours: "Lun–Ven, 9h–18h",
  footerNote: "Paiement à la livraison · Livraison partout en Algérie",

  // ── FAVICON (icône affichée dans l'onglet du navigateur — laisser vide "" si absent) ──
  logoImage: "https://res.cloudinary.com/djikeohkg/image/upload/v1783512882/Logo_xio75f.png",

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
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Inter:wght@400;500&family=Playfair+Display:wght@500;600&display=swap"
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
  ordersScriptUrl: "https://script.google.com/macros/s/AKfycbyAG0byTCiS170phs87Ofq2ejq-fFr2Uo0nWOc_-rePJpOZUUjfmYAbD_gQRYhQ2SFwWQ/exec",

  // ── ZONES DE LIVRAISON (modifier selon le pays/région du client) ──
  // Les 58 wilayas actuelles — doit correspondre aux clés de js/wilayas-communes.js
  // pour que le menu déroulant des communes fonctionne. Si le client n'est pas en
  // Algérie, remplacez cette liste : le champ commune se masquera automatiquement.
  deliveryZones: [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi",
    "Batna", "Béjaïa", "Biskra", "Béchar",
    "Blida", "Bouira", "Tamanrasset", "Tébessa",
    "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger",
    "Djelfa", "Jijel", "Sétif", "Saïda",
    "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
    "Constantine", "Médéa", "Mostaganem", "M'Sila",
    "Mascara", "Ouargla", "Oran", "El Bayadh",
    "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf",
    "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
    "Souk Ahras", "Tipaza", "Mila", "Aïn Defla",
    "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane",
    "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès",
    "In Salah", "In Guezzam", "Touggourt", "Djanet",
    "El M'Ghair", "El Meniaa"
  ],
  deliveryZoneLabel: "Wilaya",
  communeLabel: "Commune",

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
    successTitle: "Commande reçue !",
    successText: "Nous vous contactons dans les 24h pour confirmer et organiser la livraison.",
    deliveryTypeLabel: "Mode de livraison",
    deliveryHomeLabel: "À domicile",
    deliveryOfficeLabel: "Bureau (point relais)",
    summaryProductLabel: "Prix produit",
    summaryDeliveryLabel: "Frais de livraison",
    summaryTotalLabel: "Total à payer"
  },

  // ── TARIFS DE LIVRAISON (par wilaya + type) ──
  // "default" s'applique à toutes les wilayas sauf celles listées dans "overrides".
  // Remplacez ces montants par les tarifs réels négociés avec le transporteur du client.
  // Si ce champ est absent ou vide, le mode de livraison et le résumé de commande
  // ne s'affichent pas (comportement rétrocompatible pour les anciens clients).
  deliveryRates: {
    default: { domicile: 600, bureau: 400 },
    overrides: {
      "Adrar": { domicile: 1200, bureau: 900 },
      "Tamanrasset": { domicile: 1400, bureau: 1000 },
      "Illizi": { domicile: 1400, bureau: 1000 },
      "Tindouf": { domicile: 1400, bureau: 1000 },
      "In Salah": { domicile: 1400, bureau: 1000 },
      "In Guezzam": { domicile: 1400, bureau: 1000 },
      "Djanet": { domicile: 1400, bureau: 1000 },
      "Bordj Badji Mokhtar": { domicile: 1400, bureau: 1000 }
    }
  },

  // ── FOOTER LIENS (modifiable par client) ──
  footerLinks: [
    { label: "Guide des tailles", url: "#" },
    { label: "Livraison & retours", url: "#" },
    { label: "Entretien des pièces", url: "#" }
  ],

  // ── CATÉGORIES DE PRODUITS (utilisées dans le formulaire admin et le filtre du site) ──
  categories: [
    { value: "femme", label: "Femme" },
    { value: "homme", label: "Homme" },
    { value: "accessoires", label: "Accessoires" }
  ],

  // ── ANALYTICS (laisser vide "" si le client n'a pas de compte) ──
  analytics: {
    googleAnalyticsId: "", // ex: "G-XXXXXXXXXX"
    metaPixelId: ""        // ex: "1234567890123456"
  }
};

// Ne pas modifier — rend la config accessible aux autres fichiers
window.SITE_CONFIG = SITE_CONFIG;
