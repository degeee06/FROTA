import React, { useMemo } from 'react';
import { TripLog, LogStatus } from '../types';

interface AnalyticsDashboardProps {
  logs: TripLog[];
}

const AnalyticsCard: React.FC<{ title: string; value: string | number; description?: string }> = ({ title, value, description }) => (
    <div className="bg-gray-700/50 p-6 rounded-xl">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        {description && <p className="text-sm text-gray-500 mt-2">{description}</p>}
    </div>
);


export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ logs }) => {
    
    const analytics = useMemo(() => {
        const completedLogs = logs.filter(log => log.status === LogStatus.COMPLETED && log.endKm);

        if (completedLogs.length === 0) {
            return {
                totalTrips: 0,
                totalDistance: 0,
                avgDistance: 0,
                mostActiveDriver: 'N/A',
                mostUsedVehicle: 'N/A',
            };
        }

        const totalDistance = completedLogs.reduce((acc, log) => acc + (log.endKm! - log.startKm), 0);
        
        const driverCounts = completedLogs.reduce((acc, log) => {
            acc[log.driverName] = (acc[log.driverName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const mostActiveDriver = Object.keys(driverCounts).reduce((a, b) => driverCounts[a] > driverCounts[b] ? a : b, 'N/A');
        
        const vehicleCounts = completedLogs.reduce((acc, log) => {
            const vehicleId = `${log.vehicle} (${log.licensePlate})`;
            acc[vehicleId] = (acc[vehicleId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const mostUsedVehicle = Object.keys(vehicleCounts).reduce((a, b) => vehicleCounts[a] > vehicleCounts[b] ? a : b, 'N/A');

        return {
            totalTrips: completedLogs.length,
            totalDistance: totalDistance.toLocaleString('pt-BR'),
            avgDistance: (totalDistance / completedLogs.length).toFixed(1),
            mostActiveDriver,
            mostUsedVehicle,
        };
    }, [logs]);

    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Visão Geral</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <AnalyticsCard title="Viagens Concluídas" value={analytics.totalTrips} />
                <AnalyticsCard title="Distância Total (KM)" value={analytics.totalDistance} />
                <AnalyticsCard title="Distância Média (KM)" value={analytics.avgDistance} description="Por viagem" />
                <AnalyticsCard title="Motorista Mais Ativo" value={analytics.mostActiveDriver} />
                <AnalyticsCard title="Veículo Mais Utilizado" value={analytics.mostUsedVehicle} />
            </div>
        </div>
    );
};
