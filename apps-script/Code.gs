/**
 * SAKHO ÉLECTRONIC – réception des commandes du site
 * Deux façons de l'installer (voir INSTRUCTIONS.md) :
 *  - dans un Google Sheet via Extensions > Apps Script ;
 *  - ou directement sur https://script.google.com (Nouveau projet) :
 *    lancez alors la fonction « setup » une fois, elle crée le tableau
 *    « Commandes Sakho Électronic » dans votre Google Drive.
 * Puis déployez en « Application Web ».
 */

// E-mail(s) qui reçoivent chaque nouvelle commande, séparés par des virgules.
// Laissez vide ('') pour envoyer au propriétaire du compte Google du script.
const NOTIFY_EMAIL = '';
const SHOP_NAME = 'Sakho Électronic';

const SHEET_NAME = 'Commandes';
const HEADERS = ['Date', 'N° de commande', 'Nom', 'Téléphone', 'Adresse', 'Ville',
  'Paiement', 'Produits', 'Total', 'Note', 'Statut'];
const PAYMENTS = ['Wave', 'Orange Money', 'Espèces à la livraison'];

function doPost(e) {
  let order;
  let sheet;
  const lock = LockService.getScriptLock();
  try {
    order = JSON.parse(e.postData.contents);
    const error = validate_(order);
    if (error) return json_({ ok: false, error: error });

    lock.waitLock(10000);
    sheet = getSheet_();
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
  } catch (err) {
    return json_({ ok: false, error: 'Erreur serveur' });
  } finally {
    lock.releaseLock();
  }

  // La commande est enregistrée : un échec de l'e-mail ne doit pas la faire échouer.
  try {
    notify_(order, sheet.getParent().getUrl());
  } catch (err) {
    console.error('E-mail de commande non envoyé : ' + err);
  }
  return json_({ ok: true, orderId: order.orderId });
}

function notify_(order, sheetUrl) {
  const to = NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
  if (!to) return;
  const v = function (x, max) { return esc_(String(x == null ? '' : x).trim().slice(0, max)); };
  const items = Array.isArray(order.items) ? order.items.slice(0, 50) : [];
  const rows = [
    ['Client', v(order.name, 80)],
    ['Téléphone', '<a href="tel:' + v(order.phone, 20) + '">' + v(order.phone, 20) + '</a>'],
    ['Adresse', v(order.address, 150) + ', ' + v(order.city || 'Dakar', 60)],
    ['Paiement', v(order.payment, 40)],
    ['Total', v(order.total, 80)],
  ];
  if (order.note) rows.push(['Note', v(order.note, 500)]);

  const html =
    '<div style="font-family:Arial,sans-serif;max-width:560px;color:#1f1f1f">' +
    '<h2 style="margin:0 0 4px;color:#f26a0f">Nouvelle commande ' + v(order.orderId, 30) + '</h2>' +
    '<p style="margin:0 0 16px;color:#5f6368">Reçue sur le site ' + esc_(SHOP_NAME) + '</p>' +
    '<table style="border-collapse:collapse;width:100%">' +
    rows.map(function (r) {
      return '<tr><td style="padding:6px 10px;background:#f7f7f8;font-weight:bold;width:110px">' + r[0] +
        '</td><td style="padding:6px 10px">' + r[1] + '</td></tr>';
    }).join('') +
    '</table>' +
    '<h3 style="margin:18px 0 6px">Produits</h3><ul style="margin:0;padding-left:18px">' +
    items.map(function (i) { return '<li>' + v(i.name, 100) + ' × ' + v(i.qty, 3) + '</li>'; }).join('') +
    '</ul>' +
    '<p style="margin-top:20px"><a href="' + sheetUrl + '" style="background:#f26a0f;color:#fff;padding:10px 16px;' +
    'border-radius:8px;text-decoration:none;font-weight:bold">Voir toutes les commandes</a></p>' +
    '</div>';

  const text = 'Nouvelle commande ' + order.orderId + '\n' +
    rows.map(function (r) { return r[0] + ' : ' + unesc_(r[1].replace(/<[^>]+>/g, '')); }).join('\n') +
    '\nProduits : ' + String(order.itemsText || '').slice(0, 1000) + '\n\nToutes les commandes : ' + sheetUrl;

  MailApp.sendEmail({
    to: to,
    subject: '🛒 Nouvelle commande ' + String(order.orderId).slice(0, 30) + ' – ' + String(order.name).slice(0, 80),
    body: text,
    htmlBody: html,
    name: SHOP_NAME + ' – Site',
  });
}

function esc_(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function unesc_(s) {
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
}

// Envoie un e-mail de test (bouton « Exécuter ») pour vérifier la réception.
function testEmail() {
  notify_({
    orderId: 'SAK-00000000-0000', name: 'Client test', phone: '+221770000000',
    address: 'Médina', city: 'Dakar', payment: 'Wave', total: 'Prix sur demande',
    items: [{ name: 'iPhone', qty: 1 }], itemsText: 'iPhone × 1', note: 'Ceci est un test',
  }, getSpreadsheet_().getUrl());
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
