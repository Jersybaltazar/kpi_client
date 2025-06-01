import { useState, useEffect } from 'react';
import { Process } from '../types';
import { fetchProcesses } from '../api';

interface UseProcessesResult {
  processes: Process[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useProcesses = (): UseProcessesResult => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProcesses();
      setProcesses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al obtener procesos');
      console.error('Error fetching processes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { processes, loading, error, refetch: fetchData };
};