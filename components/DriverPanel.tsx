import React, { useState, useEffect, useCallback } from 'react';
import { getLogs, addLog, completeLog } from '../services/logService';
import { TripLog, LogStatus, UserProfile } from '../types';
import { LogoutIcon } from './icons/LogoutIcon';

const DRIVER_DATA_KEY = 'driverVehicleData';

// A form to start a new trip
const NewLogForm: React.FC<{ 
    onLogAdded: (log: TripLog) => void;
    allLogs: TripLog[];
    userProfile: UserProfile;
}> = ({ onLogAdded, allLogs, userProfile }) => {
  
  const [formData, setFormData] = useState({
    vehicle: '',
    licensePlate: '',
    origin: 'Sede Central',
    destination: '',
    startKm: '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isKmEditable, setIsKmEditable] = useState(true);

  // Load saved vehicle data from localStorage on initial render
  useEffect(() => {
    try {
        const savedData = localStorage.getItem(DRIVER_DATA_KEY);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            setFormData(prev => ({
                ...prev,
                vehicle: parsedData.vehicle || '',
                licensePlate: parsedData.licensePlate || '',
                origin: parsedData.origin || 'Sede Central',
            }));
        }
    } catch (e) {
        console.error("Failed to parse vehicle data from localStorage", e);
    }
  }, []);

  // Auto-save vehicle data to localStorage whenever it changes
  useEffect(() => {
    const dataToSave = {
        vehicle: formData.vehicle,
        licensePlate: formData.licensePlate,
        origin: formData.origin,
    };
    localStorage.setItem(DRIVER_DATA_KEY, JSON.stringify(dataToSave));
  }, [formData.vehicle, formData.licensePlate, formData.origin]);

  // Pre-fill and lock startKm based on the last trip for the current license plate
  useEffect(() => {
      if(formData.licensePlate) {
          const lastLogForVehicle = allLogs
              .filter(log => log.licensePlate.trim().toLowerCase() === formData.licensePlate.trim().toLowerCase() && log.status === LogStatus.COMPLETED && log.endKm)
              .sort((a, b) => b.endTime!.getTime() - a.endTime!.getTime())[0];
          
          if(lastLogForVehicle && lastLogForVehicle.endKm) {
              setFormData(prev => ({ ...prev, startKm: lastLogForVehicle.endKm!.toString() }));
              setIsKmEditable(false);
          } else {
              setFormData(prev => ({ ...prev, startKm: ''}));
              setIsKmEditable(true);
          }
      } else {
        setFormData(prev => ({...prev, startKm: ''}));
        setIsKmEditable(true);
      }
  }, [formData.licensePlate, allLogs]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
     if (error) setError(null); // Clear error on new input
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { vehicle, licensePlate, origin, destination, startKm } = formData;

    if (!vehicle || !licensePlate || !origin || !destination || !startKm) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
        setError('A origem e o destino não podem ser iguais.');
        return;
    }

    const startKmValue = parseInt(startKm, 10);
    if (isNaN(startKmValue) || startKmValue < 0) {
        setError('Quilometragem inicial inválida.');
        return;
    }

    const lastLogForVehicle = allLogs
        .filter(log => log.licensePlate.toLowerCase() === licensePlate.toLowerCase() && log.status === LogStatus.COMPLETED && log.endKm)
        .sort((a, b) => b.endTime!.getTime() - a.endTime!.getTime())[0];

    if (lastLogForVehicle && startKmValue < lastLogForVehicle.endKm!) {
        setError(`O KM inicial não pode ser menor que o último KM final registrado (${lastLogForVehicle.endKm} km).`);
        return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const newLog = await addLog({
        driverId: userProfile.id,
        driverName: userProfile.fullName || 'Motorista',
        vehicle,
        licensePlate,
        origin,
        destination,
        startKm: startKmValue,
      });
      onLogAdded(newLog);
      setFormData(prev => ({...prev, destination: '' }));
    } catch (err) {
      setError('Falha ao iniciar a viagem. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Iniciar Nova Viagem</h2>
      <div className="bg-gray-700/50 p-3 rounded-lg mb-4">
        <p className="text-sm text-gray-400">Motorista</p>
        <p className="font-bold text-white text-lg">{userProfile.fullName || 'Nome não definido'}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="vehicle" placeholder="Veículo" value={formData.vehicle} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
        <input type="text" name="licensePlate" placeholder="Placa" value={formData.licensePlate} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
        <select name="origin" value={formData.origin} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" required>
            <option value="Sede Central">Sede Central</option>
            <option value="Sede Campestre">Sede Campestre</option>
        </select>
        <input type="text" name="destination" placeholder="Destino" value={formData.destination} onChange={handleChange} className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
        <input 
          type="number" 
          name="startKm" 
          placeholder={isKmEditable ? "KM Inicial" : "KM preenchido automaticamente"}
          value={formData.startKm} 
          onChange={handleChange} 
          className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed" 
          required 
          disabled={!isKmEditable}
        />
        
        {error && <p className="text-red-400 text-sm font-semibold p-2 bg-red-500/10 rounded-md">{error}</p>}

        <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed">
          {submitting ? 'Iniciando...' : 'Iniciar Viagem'}
        </button>
      </form>
    </div>
  );
};


// A section to complete an ongoing trip
const ActiveLog: React.FC<{ log: TripLog; onLogCompleted: (log: TripLog) => void }> = ({ log, onLogCompleted }) => {
  const [endKm, setEndKm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!endKm) {
        setError('O KM final é obrigatório.');
        return;
    }
    const endKmValue = parseInt(endKm, 10);
    if (endKmValue <= log.startKm) {
        setError('O KM final deve ser maior que o KM inicial.');
        return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const updatedLog = await completeLog(log.id, endKmValue);
      onLogCompleted(updatedLog);
    } catch (err) {
      setError('Falha ao finalizar a viagem. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border-2 border-yellow-500">
        <h2 className="text-xl font-bold text-white mb-4">Viagem em Andamento</h2>
        <div className="text-gray-300 space-y-2 mb-4">
            <p><strong>Motorista:</strong> {log.driverName}</p>
            <p><strong>Veículo:</strong> {log.vehicle} ({log.licensePlate})</p>
            <p><strong>Origem:</strong> {log.origin}</p>
            <p><strong>KM Inicial:</strong> {log.startKm} km</p>
        </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="number" placeholder="KM Final" value={endKm} onChange={e => setEndKm(e.target.value)} className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none" />
        {error && <p className="text-red-400 text-sm font-semibold p-2 bg-red-500/10 rounded-md">{error}</p>}
        <button type="submit" disabled={submitting} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-green-800 disabled:cursor-not-allowed">
          {submitting ? 'Finalizando...' : 'Finalizar Viagem'}
        </button>
      </form>
    </div>
  );
};


export const DriverPanel: React.FC<{ userProfile: UserProfile; onLogout: () => void }> = ({ userProfile, onLogout }) => {
  const [logs, setLogs] = useState<TripLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { logs: data } = await getLogs({ driverId: userProfile.id });
      setLogs(data);
    } catch (err) {
      setError('Falha ao carregar os registros.');
    } finally {
      setLoading(false);
    }
  }, [userProfile.id]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleLogChange = () => {
    fetchLogs();
  }

  const activeLog = logs.find(log => log.status === LogStatus.IN_PROGRESS);
  const recentLogs = logs.filter(log => log.status === LogStatus.COMPLETED).slice(0, 5);
  
  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Painel do Motorista</h1>
            <p className="text-gray-400">Gerencie suas viagens.</p>
        </div>
        <button onClick={onLogout} title="Sair" className="flex items-center gap-2 bg-gray-700 hover:bg-red-600/50 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          <LogoutIcon className="h-5 w-5" />
          Sair
        </button>
      </div>

      {loading && <p className="text-center p-8 text-gray-300">Carregando...</p>}
      {error && <p className="text-center p-8 text-red-400">{error}</p>}

      {!loading && !error && (
        <>
            {activeLog ? (
                <ActiveLog log={activeLog} onLogCompleted={handleLogChange} />
            ) : (
                <NewLogForm onLogAdded={handleLogChange} allLogs={logs} userProfile={userProfile} />
            )}
        </>
      )}

      {!loading && !error && recentLogs.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-white mb-4">Últimas Viagens Concluídas</h2>
              <ul className="space-y-4">
                  {recentLogs.map(log => (
                      <li key={log.id} className="p-4 bg-gray-700/50 rounded-lg">
                          <div className="flex justify-between items-start">
                              <div>
                                  <p className="font-semibold text-white">{log.origin} → {log.destination || 'N/A'}</p>
                                  <p className="text-sm text-gray-400">{log.vehicle} ({log.licensePlate})</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                  <p className="font-bold text-white">{log.endKm && (log.endKm - log.startKm)} km</p>
                                  <p className="text-sm text-gray-400">{log.endTime?.toLocaleString('pt-BR')}</p>
                              </div>
                          </div>
                      </li>
                  ))}
              </ul>
          </div>
      )}

    </div>
  );
};