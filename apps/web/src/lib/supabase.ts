import { createClient } from '@supabase/supabase-js';

// Clé publique (annonce). C'est le seul jeton servi au navigateur.
// Les clés secrètes (service_role) n'entrent JAMAIS dans ce fichier.
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseKey);

let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };
