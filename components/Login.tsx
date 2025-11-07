import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { LogIcon } from './icons/LogIcon';

export const Login: React.FC = () => {
    const [identifier, setIdentifier] = useState(''); // Can be badge number or email
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Se o identificador não for um email, formate-o como um.
        // Isso permite o login unificado com crachá ou email.
        const email = identifier.includes('@')
            ? identifier
            : `${identifier}@frota.app`;

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError('Credenciais inválidas. Verifique seu crachá/email e senha.');
        }
        
        // O App.tsx irá detectar a mudança de estado e redirecionar.
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <LogIcon className="mx-auto h-12 w-12 text-blue-400 mb-4" />
                    <h1 className="text-4xl font-bold text-white tracking-tight">Controle de Frota</h1>
                    <p className="mt-2 text-lg text-gray-400">Acesse sua conta</p>
                </div>
                
                <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-xl shadow-lg space-y-6">
                    <div>
                        <label htmlFor="identifier" className="block text-sm font-medium text-gray-300 mb-2">
                            Email ou Nº do Crachá
                        </label>
                        <input
                            id="identifier"
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="seu.email@exemplo.com ou 12345"
                            required
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="password"  className="block text-sm font-medium text-gray-300 mb-2">
                            Senha
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm font-semibold p-2 bg-red-500/10 rounded-md">{error}</p>}
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};
