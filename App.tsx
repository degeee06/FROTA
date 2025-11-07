import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { DriverPanel } from './components/DriverPanel';
import { AdminPanel } from './components/AdminPanel';
import { Login } from './components/Login';
import { UserProfile } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an existing session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, full_name, badge_number')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    } else if (data) {
      setUserProfile({
        id: data.id,
        role: data.role,
        fullName: data.full_name,
        badgeNumber: data.badge_number,
      });
    }
    setLoading(false);
  };


  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUserProfile(null); // Explicitly clear profile on logout
    setLoading(false);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen text-gray-400">
            <p>Carregando sessão...</p>
        </div>
      );
    }

    if (!session || !userProfile) {
      return <Login />;
    }

    switch (userProfile.role) {
      case 'DRIVER':
        return <DriverPanel userProfile={userProfile} onLogout={handleLogout} />;
      case 'ADMIN':
        return <AdminPanel onLogout={handleLogout} />;
      default:
        // Renderiza o login se a função for desconhecida ou houver um erro
        return <Login />;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
