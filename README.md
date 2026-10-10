# Sakho Électronic – site vitrine

Site statique (HTML/CSS/JS, sans outil de compilation) pour la boutique Sakho Électronic, Médina – Dakar.

- Adresse du site : https://mariedieng105-dotcom.github.io/sakho-electronique/
- Hébergement : GitHub Pages, depuis la branche `main`. Chaque modification enregistrée sur `main`
  est en ligne 1 à 2 minutes plus tard.

## Modifier les produits (mode admin)
Les produits sont stockés dans **Supabase** et se gèrent depuis le site, en mode admin
(petit cadenas discret en bas de page, ou `#admin` à la fin de l'adresse) protégé par mot de passe.
Les changements apparaissent en temps réel chez tous les visiteurs.
Installation : voir `supabase/INSTRUCTIONS.md`. Configuration : `assets/js/config.js`.

Tant que Supabase n'est pas configuré, le site affiche la liste de secours `DEFAULT_PRODUCTS`
de `assets/js/main.js`.

## Panier et commandes
- Le client ajoute des produits au panier (icône en haut à droite), modifie les quantités,
  puis remplit le formulaire : nom, téléphone, adresse, ville, mode de paiement, note.
- Le panier est gardé dans le navigateur du client, même s'il recharge la page.
- La commande est enregistrée dans un **Google Sheet** (une ligne par commande, avec un
  numéro du type `SAK-20261002-4821` et un statut Nouvelle / Confirmée / Livrée / Annulée).
- Aucun paiement en ligne : paiement à la livraison, Wave ou Orange Money après confirmation.
- Si l'envoi échoue, le client peut envoyer sa commande par WhatsApp en dernier recours.

Déjà en place pour Sakho Électronic : l'adresse du script est dans `ORDER_ENDPOINT`, en haut de
`assets/js/main.js`. Pour une autre boutique, suivez `apps-script/INSTRUCTIONS.md`.

## Images
- `assets/img/logo.jpg` : logo officiel fourni (non modifié).
- Les autres visuels sont provisoires : remplacez-les par vos propres photos (même nom de fichier).

## Faire évoluer le site
Tout le site est sur GitHub : il continue de fonctionner sans abonnement à Claude.

### 1. Petits changements, sans aucun outil (directement sur GitHub)
1. Sur https://github.com/mariedieng105-dotcom/sakho-electronique, ouvrez le fichier à modifier.
2. Cliquez sur le crayon ✏️ (« Edit this file »).
3. Faites la modification (Ctrl + F pour chercher un texte).
4. Cliquez sur **Commit changes…** puis encore sur **Commit changes**.
5. Attendez 1 à 2 minutes, puis rechargez le site avec Ctrl + F5.

Exemples :
- **Un texte** (titre, slogan, adresse…) : dans `index.html`.
- **Un numéro de téléphone** : il apparaît à plusieurs endroits de `index.html` (cherchez l'ancien numéro),
  et dans `WHATSAPP_NUMBER` en haut de `assets/js/main.js` (format `221779329678`, sans + ni espaces).
- **Important** : si vous modifiez `assets/css/style.css` ou un fichier `assets/js/…`, changez aussi le
  numéro `?v=…` des 4 lignes qui chargent ces fichiers dans `index.html` (par ex. `?v=20261011` → `?v=20261101`).
  Sinon les navigateurs garderont l'ancienne version.

Les produits, eux, se gèrent depuis le site (mode admin) : pas besoin de toucher au code.

### 2. Avec Claude Code (offre payante)
Ouvrez une nouvelle session sur https://claude.ai/code avec le dépôt `mariedieng105-dotcom/sakho-electronique`.
Claude lit automatiquement le fichier `CLAUDE.md`, qui lui explique tout le projet.
Demandez-lui de publier les changements sur la branche `main`.

### 3. Avec Claude gratuit (claude.ai)
Copiez le contenu du fichier à modifier dans la conversation (et, pour le contexte, celui de `CLAUDE.md`),
décrivez le changement voulu et demandez le fichier **complet** modifié. Recollez-le ensuite sur GitHub
(✏️ → Ctrl + A → coller → Commit changes). Procédez par petites modifications, un fichier à la fois.
