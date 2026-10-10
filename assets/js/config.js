/* =========================================================
   SAKHO ÉLECTRONIC – configuration
   Remplissez SUPABASE_URL et SUPABASE_ANON_KEY avec les valeurs de
   votre projet Supabase (Project Settings → API). Voir supabase/INSTRUCTIONS.md.
   La clé « anon » est publique par nature : la sécurité est assurée
   par les règles (RLS) de la base, pas par le secret de cette clé.
   ========================================================= */
window.SAKHO_CONFIG = {
  SUPABASE_URL: 'https://byzylfpcxpiyakjavrlw.supabase.co',
  // Clé « publishable » (publique). Ne jamais mettre ici la clé secrète (sb_secret_…).
  SUPABASE_ANON_KEY: 'sb_publishable_F4Oafo0BfhSWUn7oM4KoyQ_oApdBMCj',

  // Compte administrateur créé dans Supabase (Authentication → Users).
  // Ce n'est pas forcément une vraie adresse : elle sert d'identifiant.
  // Le mot de passe, lui, n'est JAMAIS écrit dans le code.
  ADMIN_EMAIL: 'admin@sakho-electronic.sn',
};
