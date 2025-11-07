import React, { useState, useEffect, useCallback } from 'react';
import { getLogs } from '../services/logService';
import { TripLog, LogStatus } from '../types';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { DownloadIcon } from './icons/DownloadIcon';
import { LogoutIcon } from './icons/LogoutIcon';

// Declaração para o TypeScript reconhecer as bibliotecas globais do jspdf
declare const jspdf: any;

const StatusBadge: React.FC<{ status: LogStatus }> = ({ status }) => {
  const baseClasses = 'px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap';
  const statusClasses =
    status === LogStatus.COMPLETED
      ? 'bg-green-500/20 text-green-300'
      : 'bg-yellow-500/20 text-yellow-300';
  return <span className={`${baseClasses} ${statusClasses}`}>{status}</span>;
};

const LOGS_PER_PAGE = 10;

export const AdminPanel: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [paginatedLogs, setPaginatedLogs] = useState<TripLog[]>([]);
  const [allLogs, setAllLogs] = useState<TripLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchPaginatedLogs = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const { logs, totalCount } = await getLogs({ page, limit: LOGS_PER_PAGE });
      setPaginatedLogs(logs);
      setTotalPages(Math.ceil(totalCount / LOGS_PER_PAGE));
    } catch (err) {
      setError('Falha ao carregar os registros.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch all logs once for analytics and PDF export
  useEffect(() => {
    const fetchAllLogsForAnalytics = async () => {
        try {
            const { logs } = await getLogs({}); // No params fetches all
            setAllLogs(logs);
        } catch (err) {
            console.error("Failed to fetch all logs for analytics");
        }
    };
    fetchAllLogsForAnalytics();
  }, []);

  useEffect(() => {
    fetchPaginatedLogs(currentPage);
  }, [currentPage, fetchPaginatedLogs]);

  const handleDownloadPdf = () => {
    const doc = new jspdf.jsPDF();
    
    doc.text("Relatório de Frota", 14, 16);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 22);

    const tableColumn = ["Motorista", "Veículo", "Placa", "Rota", "Saída", "Chegada", "Distância (KM)", "Status"];
    const tableRows: (string | number)[][] = [];

    allLogs.forEach(log => {
        const logData = [
            log.driverName,
            log.vehicle,
            log.licensePlate,
            `${log.origin} → ${log.destination}`,
            log.startTime.toLocaleString('pt-BR'),
            log.endTime ? log.endTime.toLocaleString('pt-BR') : 'N/A',
            log.endKm ? log.endKm - log.startKm : '-',
            log.status
        ];
        tableRows.push(logData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'striped',
        headStyles: { fillColor: [38, 50, 56] }
    });

    doc.save(`relatorio_frota_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const formatDate = (date?: Date) => date ? date.toLocaleString('pt-BR') : 'N/A';
  
  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex-grow">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Painel Administrativo</h1>
            <p className="text-gray-400">Análises e histórico completo de viagens.</p>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={handleDownloadPdf} title="Baixar relatório em PDF" className="bg-gray-700 hover:bg-gray-600 text-white font-bold p-2 rounded-lg transition-colors">
                <DownloadIcon className="h-6 w-6" />
            </button>
            <button onClick={onLogout} title="Sair" className="flex items-center gap-2 bg-gray-700 hover:bg-red-600/50 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              <LogoutIcon className="h-5 w-5" />
              Sair
            </button>
        </div>
      </div>
      
      {!loading && !error && <AnalyticsDashboard logs={allLogs} />}

      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading && <p className="text-center p-8 text-gray-300">Carregando registros...</p>}
          {error && <p className="text-center p-8 text-red-400">{error}</p>}
          {!loading && !error && (
            <>
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                <tr>
                  <th scope="col" className="px-6 py-3">Motorista</th>
                  <th scope="col" className="px-6 py-3">Veículo / Placa</th>
                  <th scope="col" className="px-6 py-3">Rota</th>
                  <th scope="col" className="px-6 py-3">Saída (KM/Hora)</th>
                  <th scope="col" className="px-6 py-3">Chegada (KM/Hora)</th>
                  <th scope="col" className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{log.driverName}</td>
                    <td className="px-6 py-4">
                        <div>{log.vehicle}</div>
                        <div className="text-gray-400">{log.licensePlate}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{log.origin} → {log.destination || 'N/A'}</td>
                    <td className="px-6 py-4">
                        <div>{log.startKm} km</div>
                        <div className="text-gray-400">{formatDate(log.startTime)}</div>
                    </td>
                    <td className="px-6 py-4">
                        <div>{log.endKm ? `${log.endKm} km` : '-'}</div>
                        <div className="text-gray-400">{formatDate(log.endTime)}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={log.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
                <div className="flex justify-between items-center p-4 bg-gray-700/50">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-800 disabled:cursor-not-allowed"
                    >
                        Anterior
                    </button>
                    <span className="text-sm font-semibold text-gray-300">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-800 disabled:cursor-not-allowed"
                    >
                        Próxima
                    </button>
                </div>
            )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
