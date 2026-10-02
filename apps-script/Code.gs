/**
 * SAKHO ÉLECTRONIC – réception des commandes du site
 * Deux façons de l'installer (voir INSTRUCTIONS.md) :
 *  - dans un Google Sheet via Extensions > Apps Script ;
 *  - ou directement sur https://script.google.com (Nouveau projet) :
 *    lancez alors la fonction « setup » une fois, elle crée le tableau
 *    « Commandes Sakho Électronic » dans votre Google Drive.
 * Puis déployez en « Application Web ».
 */

const SHEET_NAME = 'Commandes';
const HEADERS = ['Date', 'N° de commande', 'Nom', 'Téléphone', 'Adresse', 'Ville',
  'Paiement', 'Produits', 'Total', 'Note', 'Statut'];
const PAYMENTS = ['Wave', 'Orange Money', 'Espèces à la livraison'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const order = JSON.parse(e.postData.contents);
    const error = validate_(order);
    if (error) return json_({ ok: false, error: error });

    const sheet = getSheet_();
    sheet.appendRow([
      new Date(),
      clean_(order.orderId, 30),
      clean_(order.name, 80),
      clean_(order.phone, 20),
      clean_(order.address, 150),
      clean_(order.city || 'Dakar', 60),
      clean_(order.payment, 40),
      clean_(order.itemsText, 1000),
      clean_(order.total, 80),
      clean_(order.note, 500),
      'Nouvelle',
    ]);
    return json_({ ok: true, orderId: order.orderId });
  } catch (err) {
    return json_({ ok: false, error: 'Erreur serveur' });
  } finally {
    lock.releaseLock();
  }
}

// Permet de vérifier dans le navigateur que le déploiement fonctionne.
function doGet() {
  return json_({ ok: true, message: 'Sakho Électronic – service de commandes actif' });
}

function validate_(o) {
  if (!o || typeof o !== 'object') return 'Commande invalide';
  if (!/^SAK-\d{8}-\d{4}$/.test(String(o.orderId))) return 'Numéro de commande invalide';
  if (!o.name || String(o.name).trim().length < 2) return 'Nom manquant';
  if (!/^(?:\+221|00221)?(?:7[015678]\d{7}|33\d{7})$/.test(String(o.phone))) return 'Téléphone invalide';
  if (!o.address || String(o.address).trim().length < 3) return 'Adresse manquante';
  if (PAYMENTS.indexOf(o.payment) === -1) return 'Mode de paiement invalide';
  if (!o.itemsText) return 'Panier vide';
  return '';
}

// Limite la longueur et empêche qu'un texte soit interprété comme une formule.
function clean_(value, max) {
  let s = String(value == null ? '' : value).trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

// À lancer une fois (bouton « Exécuter ») si le script a été créé sur script.google.com.
function setup() {
  const ss = getSpreadsheet_();
  getSheet_();
  Logger.log('Tableau des commandes : ' + ss.getUrl());
}

function getSpreadsheet_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('SHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  const ss = SpreadsheetApp.create('Commandes Sakho Électronic');
  props.setProperty('SHEET_ID', ss.getId());
  return ss;
}

function getSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#f26a0f').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    // Liste déroulante pour la colonne Statut
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Nouvelle', 'Confirmée', 'Livrée', 'Annulée'], true).build();
    sheet.getRange(2, HEADERS.length, sheet.getMaxRows() - 1, 1).setDataValidation(rule);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
