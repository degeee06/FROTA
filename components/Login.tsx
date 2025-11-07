import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { CarIcon } from './icons/CarIcon';

type Mode = 'login' | 'signup';

export const Login: React.FC = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States for login
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // States for signup
  const [fullName, setFullName] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

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
        password: loginPassword,
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!fullName || !badgeNumber || !signupPassword) {
        setError("Todos os campos são obrigatórios para o cadastro.");
        setLoading(false);
        return;
    }

    try {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: `${badgeNumber}@frota.app`,
            password: signupPassword,
            options: {
                data: {
                    full_name: fullName,
                    badge_number: badgeNumber,
                }
            }
        });
        if (signUpError) throw signUpError;
        
        // CRITICAL STEP: Create a corresponding entry in the `drivers` table
        // This is necessary to satisfy the foreign key constraint on `trip_logs`
        if (signUpData.user) {
            const { error: driverError } = await supabase
                .from('drivers')
                .insert({ id: signUpData.user.id, name: fullName });
            
            if (driverError) {
                // If this fails, the user is created but the app will be broken for them.
                // In a real-world app, you might want to delete the auth user here.
                throw new Error(`A conta foi criada, mas falhou ao registrar o motorista: ${driverError.message}`);
            }
        } else {
             throw new Error("Não foi possível obter os dados do usuário após o cadastro.");
        }
        
        // The onAuthStateChange listener will pick up the new user and log them in
    } catch (error: any) {
        setError(error.message || "Ocorreu um erro ao criar a conta.");
    } finally {
        setLoading(false);
    }
  };

  const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`w-full py-3 text-sm font-bold transition-colors ${
        active ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
            <CarIcon className="mx-auto h-12 w-auto text-blue-500" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Sistema de Frota
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              {mode === 'login' ? 'Acesse sua conta para continuar' : 'Crie sua conta de motorista'}
            </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="flex">
                <TabButton active={mode === 'login'} onClick={() => { setMode('login'); setError(null); }}>Entrar</TabButton>
                <TabButton active={mode === 'signup'} onClick={() => { setMode('signup'); setError(null); }}>Cadastrar</TabButton>
            </div>

            {mode === 'login' ? (
                <form className="p-8 space-y-6" onSubmit={handleLogin}>
                    <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="Email ou Nº do Crachá" required className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" disabled={loading} />
                    <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Senha" required className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" disabled={loading} />
                    {error && <p className="text-red-400 text-sm font-semibold">{error}</p>}
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            ) : (
                <form className="p-8 space-y-6" onSubmit={handleSignUp}>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nome Completo" required className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" disabled={loading} />
                    <input type="text" value={badgeNumber} onChange={e => setBadgeNumber(e.target.value)} placeholder="Nº do Crachá" required className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" disabled={loading} />
                    <input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder="Senha" required className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" disabled={loading} />
                    {error && <p className="text-red-400 text-sm font-semibold">{error}</p>}
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed" disabled={loading}>
                        {loading ? 'Criando conta...' : 'Criar Conta'}
                    </button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};