import { useState, useEffect } from 'react';
import { fetchCtqById , fetchCtqs } from '../api';
import { CTQResponse } from '../types';

export const useCtqById = (ctqId: string) => {
  const [ctq, setCtq] = useState<CTQResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchCtqById(ctqId);
        setCtq(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido al obtener el CTQ');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ctqId]);

  return { ctq, loading, error };
};
export const useCtqs = () => {
    const [ctqs, setCtqs] = useState<CTQResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          const data = await fetchCtqs();
          setCtqs(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error desconocido al obtener los CTQs');
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);
  
    return { ctqs, loading, error };
  };

