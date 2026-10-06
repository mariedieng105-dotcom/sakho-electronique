/* =========================================================
   SAKHO ÉLECTRONIC – configuration
   Remplissez SUPABASE_URL et SUPABASE_ANON_KEY avec les valeurs de
   votre projet Supabase (Project Settings → API). Voir supabase/INSTRUCTIONS.md.
   La clé « anon » est publique par nature : la sécurité est assurée
   par les règles (RLS) de la base, pas par le secret de cette clé.
   ========================================================= */
window.SAKHO_CONFIG = {
  SUPABASE_URL: '',        // ex. 'https://abcdefgh.supabase.co'
  SUPABASE_ANON_KEY: '',   // ex. 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....'

  // Compte administrateur créé dans Supabase (Authentication → Users).
  // Ce n'est pas forcément une vraie adresse : elle sert d'identifiant.
  // Le mot de passe, lui, n'est JAMAIS écrit dans le code.
  ADMIN_EMAIL: 'admin@sakho-electronic.sn',
};
