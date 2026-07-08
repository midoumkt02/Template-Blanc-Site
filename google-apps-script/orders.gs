/* ============================================================
   ORDERS.GS — Script Apps Script à coller dans le Google Sheet du client
   (Extensions → Apps Script → coller ce fichier → Déployer →
   Nouvelle application Web → exécuter en tant que moi, accès tout le monde)

   Correspond exactement aux champs envoyés par submitOrder() dans js/site.js.
   1ère ligne du Sheet attendue :
   Date | Produit | Prénom | Nom | Téléphone | Wilaya | Commune | Adresse | Taille | Couleur | Quantité | Type livraison | Frais livraison | Notes
   ============================================================ */

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.produit, data.prenom, data.nom, data.telephone,
    data.wilaya, data.commune, data.adresse, data.taille, data.couleur,
    data.quantite, data.typeLivraison, data.fraisLivraison, data.notes
  ]);
  return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
