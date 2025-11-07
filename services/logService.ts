import { TripLog, LogStatus } from '../types';
import { supabase } from './supabaseClient';

// Helper para encontrar ou criar um motorista, retornando seu ID.
const getOrCreateDriver = async (driverName: string): Promise<string> => {
    const cleanName = driverName.trim();
    let { data: driver, error: selectError } = await supabase
        .from('drivers')
        .select('id')
        .eq('name', cleanName)
        .single();
    
    if (selectError && selectError.code !== 'PGRST116') { // PGRST116: "0 rows found"
        throw selectError;
    }
    
    if (driver) return driver.id;

    const { data: newDriver, error: insertError } = await supabase
        .from('drivers')
        .insert({ name: cleanName })
        .select('id')
        .single();
    
    if (insertError) throw insertError;
    return newDriver!.id;
};

// Helper para encontrar ou criar um veículo, retornando seu ID.
const getOrCreateVehicle = async (model: string, licensePlate: string): Promise<string> => {
    const cleanPlate = licensePlate.trim().toUpperCase();
    let { data: vehicle, error: selectError } = await supabase
        .from('vehicles')
        .select('id')
        .eq('license_plate', cleanPlate)
        .single();

    if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
    }
    
    if (vehicle) return vehicle.id;

    const { data: newVehicle, error: insertError } = await supabase
        .from('vehicles')
        .insert({ model: model.trim(), license_plate: cleanPlate })
        .select('id')
        .single();
        
    if (insertError) throw insertError;
    return newVehicle!.id;
};

// Busca os logs do Supabase com paginação
export const getLogs = async (page?: number, limit?: number): Promise<{ logs: TripLog[], totalCount: number }> => {
  let query = supabase
    .from('trip_logs')
    .select(`
      id, origin, destination, start_km, end_km, start_time, end_time, status,
      driver:drivers(name),
      vehicle:vehicles(model, license_plate)
    `, { count: 'exact' })
    .order('start_time', { ascending: false });

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
    driverName: log.driver.name,
    vehicle: log.vehicle.model,
    licensePlate: log.vehicle.license_plate,
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

// Adiciona um novo log, criando motorista/veículo se necessário
export const addLog = async (data: Omit<TripLog, 'id' | 'startTime' | 'status' | 'endTime' | 'endKm'>): Promise<TripLog> => {
  const driverId = await getOrCreateDriver(data.driverName);
  const vehicleId = await getOrCreateVehicle(data.vehicle, data.licensePlate);

  const newLogData = {
    driver_id: driverId,
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
  
  return {
    ...data,
    id: insertedLog.id,
    startTime: new Date(insertedLog.start_time),
    status: LogStatus.IN_PROGRESS
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
        id, origin, destination, start_km, end_km, start_time, end_time, status,
        driver:drivers(name),
        vehicle:vehicles(model, license_plate)
    `)
    .single();

  if (error) {
    console.error('Error completing log in Supabase:', error);
    throw new Error('Falha ao completar o registro.');
  }

  const formattedLog: TripLog = {
    id: updatedLogData.id,
    // FIX: The Supabase client's type inference incorrectly suggests an array for what should be a single object relationship.
    // Casting to `any` to bypass the type error and align with the expected runtime object structure, consistent with the `getLogs` function.
    driverName: (updatedLogData.driver as any).name,
    vehicle: (updatedLogData.vehicle as any).model,
    licensePlate: (updatedLogData.vehicle as any).license_plate,
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