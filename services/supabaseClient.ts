import { createClient } from '@supabase/supabase-js';

// Lê as variáveis de ambiente injetadas pelo Vercel (ou por um arquivo .env localmente)
// FIX: Cast `import.meta` to `any` to bypass a TypeScript error. This is necessary when Vite's client types are not available in the TS config.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = "Configuração do Supabase incompleta. Verifique se as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas.";
  console.error(errorMessage);
  // Você pode mostrar um erro mais amigável na UI aqui se desejar
  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);