import { TripLog, LogStatus } from '../types';
import { supabase } from './supabaseClient';

// Helper para encontrar ou criar um veículo, retornando seu ID.
const getOrCreateVehicle = async (model: string, licensePlate: string): Promise<string> => {
    const cleanPlate = licensePlate.trim().toUpperCase();
    let { data: vehicle, error: selectError } = await supabase
        .from('vehicles')
        .select('id')
        .eq('license_plate', cleanPlate)
        .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine
        throw selectError;
    }
    
    if (vehicle) return vehicle.id;

    const { data: newVehicle, error: insertError } = await supabase
        .from('vehicles')
        .insert({ model: model.trim(), license_plate: cleanPlate })
        .select('id')
        .single();
        
    if (insertError) throw insertError;
    if (!newVehicle) throw new Error("Failed to create vehicle.");
    return newVehicle.id;
};

// Busca os logs do Supabase com opções de paginação e filtro por motorista
export const getLogs = async (options: { page?: number, limit?: number, driverId?: string } = {}): Promise<{ logs: TripLog[], totalCount: number }> => {
  const { page, limit, driverId } = options;
  
  let query = supabase
    .from('trip_logs')
    .select(`
      *,
      drivers ( name ),
      vehicles ( model, license_plate )
    `, { count: 'exact' })
    .order('start_time', { ascending: false });

  if (driverId) {
    query = query.eq('driver_id', driverId);
  }

  if (page && limit) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching logs from Supabase:', error);
    throw new Error('Falha ao buscar registros do banco de dados.');
  }

  const formattedLogs: TripLog[] = data.map((log: any) => ({
    id: log.id,
    driverName: log.drivers?.name || 'Motorista não encontrado',
    vehicle: log.vehicles?.model || 'Veículo não encontrado',
    licensePlate: log.vehicles?.license_plate || 'N/A',
    origin: log.origin,
    destination: log.destination,
    startKm: log.start_km,
    endKm: log.end_km,
    startTime: new Date(log.start_time),
    endTime: log.end_time ? new Date(log.end_time) : undefined,
    status: log.status === 'COMPLETED' ? LogStatus.COMPLETED : LogStatus.IN_PROGRESS,
  }));
  
  return { logs: formattedLogs, totalCount: count ?? 0 };
};

export interface AddLogPayload {
  driverId: string;
  driverName: string;
  vehicle: string;
  licensePlate: string;
  origin: string;
  destination: string;
  startKm: number;
}

// Adiciona um novo log usando o ID do motorista logado
export const addLog = async (data: AddLogPayload): Promise<TripLog> => {
  const vehicleId = await getOrCreateVehicle(data.vehicle, data.licensePlate);

  const newLogData = {
    driver_id: data.driverId,
    vehicle_id: vehicleId,
    origin: data.origin,
    destination: data.destination,
    start_km: data.startKm,
    status: 'IN_PROGRESS',
  };

  const { data: insertedLog, error } = await supabase
    .from('trip_logs')
    .insert(newLogData)
    .select()
    .single();

  if (error) {
    console.error('Error adding log to Supabase:', error);
    throw new Error('Falha ao adicionar novo registro.');
  }
  
  // Retorna um objeto TripLog completo para atualizar a UI imediatamente
  return {
    id: insertedLog.id,
    driverName: data.driverName,
    vehicle: data.vehicle,
    licensePlate: data.licensePlate,
    origin: data.origin,
    destination: data.destination,
    startKm: data.startKm,
    startTime: new Date(insertedLog.start_time),
    status: LogStatus.IN_PROGRESS,
  };
};

// Completa um log existente no banco de dados
export const completeLog = async (id: string, endKm: number): Promise<TripLog> => {
  const updatedData = {
    end_km: endKm,
    end_time: new Date().toISOString(),
    status: 'COMPLETED',
  };

  const { data: updatedLogData, error } = await supabase
    .from('trip_logs')
    .update(updatedData)
    .eq('id', id)
    .select(`
        *,
        drivers ( name ),
        vehicles ( model, license_plate )
    `)
    .single();

  if (error) {
    console.error('Error completing log in Supabase:', error);
    throw new Error('Falha ao completar o registro.');
  }

  const drivers = updatedLogData.drivers as any;
  const vehicles = updatedLogData.vehicles as any;

  const formattedLog: TripLog = {
    id: updatedLogData.id,
    driverName: drivers?.name || 'Motorista não encontrado',
    vehicle: vehicles?.model || 'Veículo não encontrado',
    licensePlate: vehicles?.license_plate || 'N/A',
    origin: updatedLogData.origin,
    destination: updatedLogData.destination,
    startKm: updatedLogData.start_km,
    endKm: updatedLogData.end_km,
    startTime: new Date(updatedLogData.start_time),
    endTime: updatedLogData.end_time ? new Date(updatedLogData.end_time) : undefined,
    status: LogStatus.COMPLETED,
  };

  return formattedLog;
};