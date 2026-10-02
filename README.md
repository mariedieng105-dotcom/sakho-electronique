# Sakho Électronic – site vitrine

Site statique (HTML/CSS/JS, sans dépendance) pour la boutique Sakho Électronic, Médina – Dakar.

- Ouvrir `index.html` dans un navigateur pour le consulter.
- Hébergement : n'importe quel hébergeur statique (GitHub Pages, Netlify…).

## Modifier les produits
Éditer la liste `PRODUCTS` en haut de `assets/js/main.js` :
nom, description, prix (`null` = « Prix sur demande »), image (dans `assets/img/`) et catégorie.
Gardez un `id` unique (sans espace) pour chaque produit : il sert au panier.

## Panier et commandes
- Le client ajoute des produits au panier (icône en haut à droite), modifie les quantités,
  puis remplit le formulaire : nom, téléphone, adresse, ville, mode de paiement, note.
- Le panier est gardé dans le navigateur du client, même s'il recharge la page.
- La commande est enregistrée dans un **Google Sheet** (une ligne par commande, avec un
  numéro du type `SAK-20261002-4821` et un statut Nouvelle / Confirmée / Livrée / Annulée).
- Aucun paiement en ligne : paiement à la livraison, Wave ou Orange Money après confirmation.
- Si l'envoi échoue, le client peut envoyer sa commande par WhatsApp en dernier recours.

**Mise en place (une seule fois)** : suivez `apps-script/INSTRUCTIONS.md`, puis collez l'URL
obtenue dans `ORDER_ENDPOINT` en haut de `assets/js/main.js`.
Tant que cette URL n'est pas renseignée, les commandes ne peuvent pas être enregistrées.

## Images
- `assets/img/logo.jpg` : logo officiel fourni (non modifié).
- Les autres visuels sont provisoires : remplacez-les par vos propres photos (même nom de fichier).
