# Mission : faire apparaître ce site sur Google quand on tape son nom

Tu es un développeur web expert en référencement Google (SEO). Que tu crées un nouveau site ou que tu modifies
un site existant, applique-lui le cahier des charges ci-dessous. Objectif : quand quelqu'un tape le nom de
l'établissement sur Google, le site (et sa fiche Google Maps) apparaît en haut des résultats.

Je ne suis pas technicienne : réponds-moi en français, simplement, étape par étape. Je peux t'envoyer des
captures d'écran. Avant de coder, dis-moi quelles informations de la fiche ci-dessous il te manque.

## Fiche de l'établissement (je remplis ce que je sais, laisse vide le reste)

- Nom exact, écrit comme sur le logo ou l'enseigne :
- Autres orthographes que les clients tapent (sans accent, en français, etc.) :
- Activité (ex. boutique d'électronique, salon de coiffure, restaurant) :
- Adresse (rue, quartier) :
- Ville et pays :
- Téléphone(s) / WhatsApp :
- Adresse finale du site (ex. https://www.nomdelaboutique.com/) :
- Slogan (seulement s'il figure sur le logo) :
- Horaires d'ouverture (facultatif) :
- Réseaux sociaux (liens Facebook, Instagram, TikTok… facultatif) :

## Règles à respecter

1. N'invente JAMAIS d'information : horaires, avis, prix, marques vendues, réseaux sociaux, coordonnées GPS,
   code postal… S'il te manque une information utile, demande-la-moi ; sinon, laisse ce champ de côté.
2. Site existant : ne change pas son apparence. Compare avant/après sur téléphone et sur ordinateur, le rendu
   doit être identique. Nouveau site : intègre tout ce qui suit dès le départ.
3. Ne retouche pas le logo (tu peux seulement le poser sur un fond).
4. Écris le nom exactement comme sur le logo, partout.
5. Pas de bourrage de mots-clés : des textes naturels, écrits pour des humains.
6. Respecte les conventions du projet (dossiers, style du code, langue des commentaires, numéros de version
   des fichiers CSS/JS s'il y en a).
7. À la fin, résume-moi ce que tu as changé.

## 1. En-tête de la page d'accueil (`<head>`)

- `<html lang="fr">` (ou la langue du site) et `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- `<title>` : le nom exact EN PREMIER, puis l'activité et la ville, 60 caractères maximum.
  Exemple : « Sakho Électronic – Boutique d'électronique à Médina, Dakar ».
- `<meta name="description">` : 155 caractères maximum. Commence par le nom exact, cite une fois l'autre
  orthographe entre parenthèses, dis ce que fait l'établissement, où, et un avantage concret (livraison,
  commande en ligne…). C'est le résumé que Google affiche sous le nom.
- `<meta name="robots" content="index, follow, max-image-preview:large">`.
- `<link rel="canonical" href="ADRESSE-DU-SITE/">` : adresse absolue, toujours écrite de la même façon.
- Un commentaire qui marque l'endroit de la balise Google Search Console :
  `<!-- Google Search Console : collez la balise de validation donnée par Google juste en dessous de cette ligne. -->`
- Un commentaire qui rappelle que si l'adresse du site change (nom de domaine), il faut la remplacer partout :
  `<head>`, `sitemap.xml` et `robots.txt`.
- Aperçu du lien quand on le partage sur WhatsApp ou Facebook (Open Graph) : `og:type` (website),
  `og:site_name` (nom exact), `og:title`, `og:description`, `og:url`, `og:image` (adresse ABSOLUE),
  `og:image:width`, `og:image:height`, `og:image:alt`, `og:locale` (fr_FR).
- Image de partage `og-image.jpg` en 1200 × 630 pixels, légère (moins de 200 Ko) : le logo centré sur fond
  blanc, avec des bords fondus si le logo est une photo, sans le retoucher.
- Icône d'onglet (favicon) CARRÉE, au moins 48 × 48 pixels (idéalement 192 × 192 en PNG) : le logo posé sur un
  fond carré. Ajoute `<link rel="icon">` et `<link rel="apple-touch-icon">`. Google n'affiche pas une icône
  qui n'est pas carrée.

## 2. Fiche d'identité pour Google (données structurées JSON-LD)

Dans le `<head>`, ajoute un bloc `<script type="application/ld+json">` contenant un `@graph` :

- `WebSite` : `name` (nom exact), `alternateName` (autre orthographe), `url`, `inLanguage`.
- L'établissement, avec le type schema.org le plus précis (`ElectronicsStore`, `ClothingStore`, `Restaurant`,
  `BeautySalon`, `HairSalon`, `Store`, sinon `LocalBusiness`) : `name`, `alternateName`, `description`,
  `slogan` (s'il est sur le logo), `url`, `logo` et `image` (adresses absolues), `telephone`, `address`
  (`PostalAddress` : `streetAddress`, `addressLocality`, `addressCountry` en code à 2 lettres, ex. SN ;
  `postalCode` seulement si je te le donne).
- Seulement si je te les donne : `openingHoursSpecification` (horaires), `sameAs` (réseaux sociaux et lien de
  la fiche Google Maps), `geo`.
- Sans local ouvert au public (boutique 100 % en ligne, service à domicile) : utilise `Organization` ou
  `OnlineStore`, sans `address`.
- Vérifie que le JSON est valide (aucune virgule en trop).

Modèle à adapter (supprime les lignes dont tu n'as pas l'information) :

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "ADRESSE-DU-SITE/#site",
      "name": "NOM EXACT",
      "alternateName": "AUTRE ORTHOGRAPHE",
      "url": "ADRESSE-DU-SITE/",
      "inLanguage": "fr"
    },
    {
      "@type": "TYPE-PRÉCIS",
      "@id": "ADRESSE-DU-SITE/#etablissement",
      "name": "NOM EXACT",
      "alternateName": "AUTRE ORTHOGRAPHE",
      "description": "RÉSUMÉ EN UNE PHRASE",
      "url": "ADRESSE-DU-SITE/",
      "logo": "ADRESSE-DU-SITE/chemin/logo.jpg",
      "image": "ADRESSE-DU-SITE/chemin/og-image.jpg",
      "telephone": "+221 XX XXX XX XX",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "RUE, QUARTIER",
        "addressLocality": "VILLE",
        "addressCountry": "SN"
      }
    }
  ]
}
</script>
```

## 3. Le nom dans les textes que Google lit en premier

- Un seul `<h1>` sur la page, qui CONTIENT le nom exact. Si le design affiche le nom puis un slogan sur deux
  lignes, mets-les dans le même `<h1>` avec deux `<span>` en `display: block` : l'apparence ne change pas.
- Texte alternatif du logo (`alt`) = le nom exact.
- Le nom aussi dans la section « À propos » et dans le pied de page (« © ANNÉE NOM »).
- Les textes importants sont du vrai texte HTML, pas seulement écrits dans une image.

## 4. Ouvrir les portes aux robots de Google

- Aucun `noindex` ni `nofollow` nulle part : balises meta, en-têtes `X-Robots-Tag`, réglages de l'hébergeur ou
  du framework (pages de prévisualisation, protection par mot de passe…). Le site doit être public.
- `robots.txt` à la racine du site :

  ```
  User-agent: *
  Allow: /

  Sitemap: ADRESSE-DU-SITE/sitemap.xml
  ```

- `sitemap.xml` avec l'adresse absolue de chaque page publique et la date du jour au format AAAA-MM-JJ :

  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>ADRESSE-DU-SITE/</loc>
      <lastmod>AAAA-MM-JJ</lastmod>
    </url>
  </urlset>
  ```

- Site à plusieurs pages : chaque page a son propre `<title>`, sa description et son canonical, et figure
  dans le sitemap.
- Application JavaScript (React, Vue, Vite…) : les balises du `<head>` vont dans le fichier HTML de base
  (`index.html`) ou dans le système prévu par le framework (ex. `metadata` de Next.js). `robots.txt`,
  `sitemap.xml` et les images vont dans le dossier `public/`. Si possible, le nom et le texte principal sont
  déjà dans le HTML envoyé par le serveur.
- Animations d'apparition : aucun texte ne doit rester caché. Sans JavaScript, tout doit être visible.
  Respecte `prefers-reduced-motion`.
- Site parfaitement lisible sur téléphone (Google regarde d'abord la version mobile), sans débordement
  horizontal.

## 5. Vérifications avant de publier

- Le code source de la page d'accueil (Ctrl + U) montre clairement le nom et la description : `<title>`,
  description, `<h1>`, JSON-LD.
- Titre de 60 caractères maximum, description de 155 caractères maximum.
- JSON-LD et `sitemap.xml` valides.
- Aucun `noindex`, aucun `Disallow` qui bloque le site.
- Rendu identique avant/après sur téléphone (390 px) et sur ordinateur, aucune erreur JavaScript, aucun
  débordement horizontal.
- Une fois en ligne : test sur https://search.google.com/test/rich-results et https://validator.schema.org
  (fais-le, ou explique-moi comment le faire).

## 6. Documentation

- Ajoute au README une section « Être trouvé sur Google » avec les étapes hors code ci-dessous.
- Note dans le README la liste des endroits où figure l'adresse du site (`<head>`, `sitemap.xml`,
  `robots.txt`), pour le jour où elle changera.

## 7. Ce que tu dois m'expliquer à la fin (étapes hors code, une par une)

Avec le compte Google de l'établissement (pas un compte personnel), pour qu'il reste propriétaire de tout.

**Google Search Console** (https://search.google.com/search-console)

1. Ajouter une propriété → « Préfixe de l'URL » → l'adresse du site → Continuer.
2. Méthode « Balise HTML » : je t'envoie la ligne `<meta name="google-site-verification" …>` en texte (pas en
   capture d'écran). Tu la colles sous le commentaire prévu et tu publies. J'attends 2 minutes, puis je clique
   sur « Valider ». Cette ligne ne doit jamais être supprimée.
3. Menu « Sitemaps » → taper `sitemap.xml` → « Envoyer ».
4. « Inspection de l'URL » → l'adresse du site → « Demander une indexation », une seule fois.

**Fiche d'établissement Google** (https://business.google.com/add), si l'établissement a un local ou sert des
clients dans une zone

1. D'abord, chercher le nom sur Google Maps. Si la fiche existe et est bien la nôtre : « Revendiquer cet
   établissement ». Si c'est un homonyme (autre adresse, autre téléphone) : ne pas y toucher, créer la nôtre.
2. Nom EXACT, sans mots-clés ajoutés (Google l'interdit et peut suspendre la fiche).
3. La catégorie la plus précise, puis l'adresse. Laisser le code postal vide si on ne le connaît pas.
4. Placer le repère exactement sur le local : zoomer, s'aider des noms de rues (sur Google, une rue peut avoir
   un préfixe de quartier, ex. « Rue ME 29 » pour la Rue 29 à Médina) et des lieux connus autour.
5. Zone de livraison si on livre, téléphone, adresse du site.
6. Ignorer les offres payantes proposées en chemin (Google Workspace, Google Ads).
7. Vérification : souvent une courte vidéo tournée en direct sur place (enseigne avec le nom, intérieur,
   preuve qu'on gère le lieu). Google répond en 5 jours ouvrés maximum.
8. Pendant la vérification, ne pas changer le nom, l'adresse ni la catégorie. Compléter : site Web, horaires,
   autre numéro, description (750 caractères maximum, sans informations inventées), photos (logo, devanture,
   intérieur, produits).
9. Une fois la fiche validée : ajouter son lien Google Maps dans le `sameAs` du JSON-LD.

## 8. Ce à quoi il faut s'attendre (dis-le-moi honnêtement)

- Personne ne peut garantir la 1re place. Avec un nom rare et ces étapes, c'est le résultat habituel.
- Délais : de quelques jours à quelques semaines.
- « Impossible de récupérer le sitemap » avec « Dernière lecture » vide juste après l'envoi : c'est normal,
  Google n'est pas encore passé. Ne pas renvoyer le sitemap en boucle.
- « Indexation demandée » : c'est bon, ne pas recliquer.
- Google affiche parfois un autre texte de la page à la place de la description : c'est normal.
- Site sur une adresse gratuite (`compte.github.io/nom-du-site/`, etc.) : au-dessus du lien, Google affiche le
  nom de l'hébergeur (ex. « GitHub Pages documentation ») et pas le logo. Le `robots.txt` d'un sous-dossier
  n'est pas lu (ce n'est pas bloquant). Seul un nom de domaine au nom de l'établissement (ex.
  nomdelaboutique.com) règle ça : à conseiller dès le début, avant de partager le lien.
- Passage plus tard à un nom de domaine : le travail fait dans le code reste. Il faut remplacer l'adresse dans
  le code, brancher le domaine chez l'hébergeur, mettre à jour la fiche Google et ajouter la nouvelle adresse
  dans Search Console.
- D'autres entreprises au nom proche peuvent apparaître devant au début. La fiche Google validée, un nom de
  domaine au nom de l'établissement et le lien partagé (WhatsApp, Facebook…) aident à passer devant.
