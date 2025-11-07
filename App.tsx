
import React, { useState } from 'react';
import { Role } from './types';
import { DriverPanel } from './components/DriverPanel';
import { AdminPanel } from './components/AdminPanel';
import { CarIcon } from './components/icons/CarIcon';
import { AdminIcon } from './components/icons/AdminIcon';
import { LogIcon } from './components/icons/LogIcon';

const RoleSelector: React.FC<{ onSelect: (role: Role) => void }> = ({ onSelect }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4">
    <div className="text-center mb-12">
      <LogIcon className="mx-auto h-12 w-12 text-blue-400 mb-4" />
      <h1 className="text-4xl font-bold text-white tracking-tight">Controle de Frota</h1>
      <p className="mt-2 text-lg text-gray-400">Selecione seu perfil para continuar</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
      <button
        onClick={() => onSelect(Role.DRIVER)}
        className="group bg-gray-800 p-8 rounded-xl shadow-lg hover:bg-blue-600/20 hover:ring-2 hover:ring-blue-500 transition-all duration-300 transform hover:-translate-y-1"
      >
        <CarIcon className="mx-auto h-16 w-16 text-gray-400 group-hover:text-blue-400 transition-colors" />
        <h2 className="mt-6 text-2xl font-semibold text-white">Sou Motorista</h2>
        <p className="mt-1 text-gray-400">Registrar minhas viagens</p>
      </button>
      <button
        onClick={() => onSelect(Role.ADMIN)}
        className="group bg-gray-800 p-8 rounded-xl shadow-lg hover:bg-purple-600/20 hover:ring-2 hover:ring-purple-500 transition-all duration-300 transform hover:-translate-y-1"
      >
        <AdminIcon className="mx-auto h-16 w-16 text-gray-400 group-hover:text-purple-400 transition-colors" />
        <h2 className="mt-6 text-2xl font-semibold text-white">Sou Admin</h2>
        <p className="mt-1 text-gray-400">Ver todos os registros</p>
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [role, setRole] = useState<Role>(Role.NONE);

  const renderContent = () => {
    switch (role) {
      case Role.DRIVER:
        return <DriverPanel onBack={() => setRole(Role.NONE)} />;
      case Role.ADMIN:
        return <AdminPanel onBack={() => setRole(Role.NONE)} />;
      default:
        return <RoleSelector onSelect={setRole} />;
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
