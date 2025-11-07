import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { CarIcon } from './icons/CarIcon';

type View = 'login' | 'register';

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('login');

  // State for Login
  const [identifier, setIdentifier] = useState(''); // Can be email or badge number
  const [password, setPassword] = useState('');

  // State for Register
  const [fullName, setFullName] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');


  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (view === 'login') {
      // Logic for Login
      const isBadge = /^\d+$/.test(identifier);
      const email = isBadge ? `${identifier}@frota.app` : identifier;

      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            if (error.message === 'Invalid login credentials') {
                setError('Crachá/Email ou senha inválidos.');
            } else {
                setError('Ocorreu um erro ao tentar fazer login.');
            }
        }
        // On success, onAuthStateChange in App.tsx handles navigation
      } catch (err) {
        setError('Ocorreu um erro inesperado. Verifique sua conexão.');
      }

    } else {
      // Logic for Register
      if (!fullName || !badgeNumber || !registerPassword) {
        setError("Todos os campos são obrigatórios.");
        setLoading(false);
        return;
      }
      try {
        const { error } = await supabase.auth.signUp({
          email: `${badgeNumber}@frota.app`,
          password: registerPassword,
          options: {
            data: {
              full_name: fullName,
              badge_number: badgeNumber,
            }
          }
        });
        if (error) {
            if (error.message.includes('unique constraint')) {
                 setError('Este número de crachá já está cadastrado.');
            } else if (error.message.includes('should be a valid email')) {
                 setError('Número de crachá inválido.');
            } else if (error.message.includes('Password should be at least 6 characters')) {
                 setError('A senha deve ter no mínimo 6 caracteres.');
            }
            else {
                setError('Ocorreu um erro ao criar a conta.');
            }
        }
        // On success, onAuthStateChange will log the user in.
      } catch (err) {
        setError('Ocorreu um erro inesperado. Verifique sua conexão.');
      }
    }

    setLoading(false);
  };
  
  const renderLoginForm = () => (
     <form className="mt-8 space-y-6" onSubmit={handleAuthAction}>
        <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="identifier" className="sr-only">Email ou Nº do Crachá</label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm rounded-t-md"
                placeholder="Email ou Nº do Crachá"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password-login" className="sr-only">Senha</label>
              <input
                id="password-login"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm rounded-b-md"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
        </div>
        <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
        </div>
     </form>
  );

  const renderRegisterForm = () => (
    <form className="mt-8 space-y-6" onSubmit={handleAuthAction}>
        <div className="rounded-md shadow-sm space-y-3">
            <input name="fullName" type="text" required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                placeholder="Nome Completo" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <input name="badgeNumber" type="text" required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                placeholder="Nº do Crachá" value={badgeNumber} onChange={(e) => setBadgeNumber(e.target.value)} />
            <input name="password-register" type="password" required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                placeholder="Senha" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} />
        </div>
        <div>
            <button type="submit" disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 disabled:bg-green-800 disabled:cursor-not-allowed">
              {loading ? 'Criando conta...' : 'Cadastrar'}
            </button>
        </div>
     </form>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg">
        <div className="text-center">
            <CarIcon className="w-16 h-16 mx-auto text-blue-500" />
            <h1 className="mt-4 text-3xl font-extrabold text-white">Controle de Frota</h1>
            <p className="mt-2 text-sm text-gray-400">
                {view === 'login' ? 'Acesse sua conta para continuar' : 'Crie sua conta de motorista'}
            </p>
        </div>

        <div>
            <div className="flex border-b border-gray-700">
                <button onClick={() => setView('login')} className={`w-1/2 py-3 text-sm font-medium text-center transition-colors ${view === 'login' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}>
                    Entrar
                </button>
                <button onClick={() => setView('register')} className={`w-1/2 py-3 text-sm font-medium text-center transition-colors ${view === 'register' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}>
                    Cadastrar
                </button>
            </div>
        </div>

        {error && (
            <div className="p-3 mt-4 text-sm text-red-400 bg-red-500/10 rounded-md">
                <p>{error}</p>
            </div>
        )}

        {view === 'login' ? renderLoginForm() : renderRegisterForm()}
        
      </div>
    </div>
  );
};
