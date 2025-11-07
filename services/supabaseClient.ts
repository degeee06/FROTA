import { createClient } from '@supabase/supabase-js';

// -----------------------------------------------------------------------------
// IMPORTANTE: Substitua pelos dados do seu projeto Supabase!
// Você pode encontrá-los em seu painel: Settings > API
// -----------------------------------------------------------------------------
const supabaseUrl = 'https://wcucsinjswrliioxaqtp.supabase.co'; // ex: 'https://xyz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjdWNzaW5qc3dybGlpb3hhcXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjgyNTcsImV4cCI6MjA3ODA0NDI1N30.B6LfHqRoD_V8qwZcjFvC6tkW79CWT_Vq4UI_Jt5U2rs'; // ex: 'eyJhbGci...'

// Em um projeto de produção, use variáveis de ambiente para armazenar estes valores.
if (!supabaseUrl || supabaseUrl === 'https://wcucsinjswrliioxaqtp.supabase.co') {
  const errorMessage = "A URL do Supabase não foi configurada. Adicione sua URL em services/supabaseClient.ts";
  alert(errorMessage);
  console.error(errorMessage);
}

if (!supabaseAnonKey || supabaseAnonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjdWNzaW5qc3dybGlpb3hhcXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NjgyNTcsImV4cCI6MjA3ODA0NDI1N30.B6LfHqRoD_V8qwZcjFvC6tkW79CWT_Vq4UI_Jt5U2rs') {
    const errorMessage = "A chave anônima (anon key) do Supabase não foi configurada. Adicione sua chave em services/supabaseClient.ts";
    alert(errorMessage);
    console.error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
