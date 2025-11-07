export enum Role {
  NONE,
  DRIVER,
  ADMIN,
}

export enum LogStatus {
  IN_PROGRESS = 'EM ANDAMENTO',
  COMPLETED = 'CONCLUÍDO',
}

export interface TripLog {
  id: string;
  driverName: string;
  vehicle: string;
  licensePlate: string;
  origin: string; // Campo adicionado para rastrear a origem
  destination: string;
  startKm: number;
  endKm?: number;
  startTime: Date;
  endTime?: Date;
  status: LogStatus;
}