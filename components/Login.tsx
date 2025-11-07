import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { CarIcon } from './icons/CarIcon';

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    // Check if identifier is a badge number (all digits) or an email
    const isBadge = /^\d+$/.test(identifier);
    const emailToLogin = isBadge ? `${identifier}@frota.app` : identifier;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailToLogin,
        password: password,
      });
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Conta não confirmada. Por favor, desative a "Confirmação de email" no painel do Supabase > Authentication > Providers > Email.');
        }
        throw error;
      }
      // The onAuthStateChange listener in App.tsx will handle navigation
    } catch (error: any) {
        console.error("Login error:", error);
        setError(error.message || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
            <CarIcon className="mx-auto h-12 w-auto text-blue-500" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Sistema de Frota
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Acesse sua conta para continuar
            </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <form className="p-8 space-y-6" onSubmit={handleLogin}>
                <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="Email ou Nº do Crachá" required className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" disabled={loading} />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" required className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" disabled={loading} />
                {error && <p className="text-red-400 text-sm font-semibold">{error}</p>}
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};