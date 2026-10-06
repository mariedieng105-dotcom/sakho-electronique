# Produits en base de données (Supabase) + mode admin

Une fois installé :
- les produits sont enregistrés dans une base de données Supabase ;
- un ajout / une modification / une suppression apparaît **en temps réel** chez tous les visiteurs,
  sur tous les navigateurs et appareils ;
- l'admin se connecte avec un **mot de passe vérifié par Supabase** (il n'est jamais écrit dans le code).

Durée : environ 10 minutes, une seule fois. Gratuit (offre « Free » de Supabase).

> Conseil : faites tout dans une **fenêtre de navigation privée** avec un seul compte connecté.

## 1. Créer le projet Supabase
1. Allez sur https://supabase.com → **Start your project** → connectez-vous (avec GitHub ou un e-mail).
2. **New project** :
   - Name : `sakho-electronic`
   - Database Password : cliquez sur **Generate a password** (vous n'en aurez pas besoin ensuite)
   - Region : **West EU (Paris)** ou la plus proche
3. Cliquez sur **Create new project** et attendez 1 à 2 minutes.

## 2. Créer la base (copier-coller)
1. Menu de gauche → **SQL Editor** → **New query**.
2. Collez tout le contenu du fichier `supabase/setup.sql` (bouton « Copier » sur GitHub).
3. Cliquez sur **Run**. Le message doit être **Success. No rows returned**.

Cela crée la table des produits (avec les 12 produits actuels), les règles de sécurité,
le temps réel et l'espace de stockage des photos.

## 3. Créer le compte administrateur (le mot de passe)
1. Menu de gauche → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Remplissez :
   - Email : `admin@sakho-electronic.sn` (exactement celui-ci ; pas besoin que l'adresse existe)
   - Password : **votre mot de passe admin** (ex. `password123@` — un mot de passe plus long et unique est plus sûr)
   - Cochez **Auto Confirm User**
3. **Create user**.

## 4. Bloquer les inscriptions publiques (sécurité)
Menu de gauche → **Authentication** → **Sign In / Providers** (ou **Settings**) →
désactivez **Allow new users to sign up** → **Save**.

## 5. Récupérer les 2 clés et me les envoyer
Menu de gauche → **Project Settings** (roue dentée) → **API** (ou **Data API** / **API Keys**) :
- **Project URL** : `https://xxxxxxxx.supabase.co`
- **anon public** key (longue clé qui commence par `eyJ…`, ou la clé **publishable** `sb_publishable_…`)

Ces deux valeurs sont **publiques** (elles sont faites pour être dans un site web) : vous pouvez me les
envoyer. **N'envoyez jamais** la clé `service_role` / `secret`.

Je les mets dans `assets/js/config.js` et je republie le site.

## Utiliser le mode admin
- En bas de page, à droite du copyright, un **petit cadenas très discret**
  (ou ajoutez `#admin` à la fin de l'adresse du site).
- Entrez le mot de passe → une barre « Mode admin » apparaît en bas de l'écran.
- **Ajouter un produit** : nom, description, prix (vide = « Prix sur demande »), catégorie, photo.
- Sur chaque carte produit : ✏️ **Modifier** et 🗑️ **Supprimer**.
- **Se déconnecter** quand vous avez fini (surtout sur un ordinateur partagé).

## Changer le mot de passe admin
Supabase → **Authentication** → **Users** → sur la ligne `admin@sakho-electronic.sn`,
menu **⋯ → Delete user**, puis recréez-le (étape 3) avec le nouveau mot de passe.
Les produits ne sont pas touchés.

## Pour un autre vendeur
Refaites ces étapes avec un nouveau projet Supabase (de préférence sur un compte au nom de la boutique),
puis remplacez l'URL et la clé dans `assets/js/config.js`.
