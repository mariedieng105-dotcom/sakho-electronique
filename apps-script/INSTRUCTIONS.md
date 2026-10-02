# Recevoir les commandes du site dans Google Sheets

Durée : environ 5 minutes. À faire une seule fois.

## 1. Créer le tableau
1. Allez sur https://sheets.google.com avec le compte Google de la boutique.
2. Créez une feuille vierge et nommez-la par exemple **Commandes Sakho Électronic**.

## 2. Coller le script
1. Dans le tableau : menu **Extensions → Apps Script**.
2. Effacez tout le code affiché, puis collez le contenu du fichier `apps-script/Code.gs`.
3. Cliquez sur l'icône **Enregistrer** (disquette).

## 3. Publier le script en « Application Web »
1. En haut à droite : **Déployer → Nouveau déploiement**.
2. Cliquez sur la roue dentée à côté de « Sélectionner le type » → **Application Web**.
3. Remplissez :
   - Description : `Commandes du site`
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde**
4. Cliquez sur **Déployer**, puis **Autoriser l'accès** et choisissez votre compte Google.
   Si Google affiche « Google n'a pas validé cette application » : cliquez sur
   **Paramètres avancés → Accéder à … (non sécurisé)**. C'est normal : c'est votre propre script.
5. Copiez l'**URL de l'application Web** (elle se termine par `/exec`).

## 4. Brancher le site
1. Ouvrez le fichier `assets/js/main.js`.
2. Remplacez `COLLER_ICI_L_URL_APPS_SCRIPT` par l'URL copiée :
   ```js
   const ORDER_ENDPOINT = 'https://script.google.com/macros/s/XXXXXXXX/exec';
   ```
3. Enregistrez et publiez le site (ou envoyez-moi l'URL et je m'en occupe).

## 5. Tester
- Ouvrez l'URL `/exec` dans le navigateur : vous devez voir `"ok":true`.
- Passez une commande test sur le site : une ligne apparaît dans l'onglet **Commandes**.

## Utilisation au quotidien
- Chaque commande = une ligne, avec le statut **Nouvelle**.
- Changez le statut dans la liste déroulante : Confirmée, Livrée, Annulée.
- Pour être prévenu : dans Google Sheets, **Outils → Règles de notification → Une modification est apportée**
  pour recevoir un e-mail à chaque nouvelle commande.
- L'application Google Sheets sur téléphone permet de suivre les commandes partout.

## Si vous modifiez le script plus tard
Faites **Déployer → Gérer les déploiements → modifier (crayon) → Version : Nouvelle version → Déployer**.
L'URL reste la même.
