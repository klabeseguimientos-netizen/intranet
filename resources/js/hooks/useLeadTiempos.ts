// resources/js/hooks/useLeadTiempos.ts
import { useState, useEffect, useCallback } from 'react';

interface TiempoEstado {
  desde: string;
  hasta: string;
  dias: number;
  horas: number;
  minutos: number;
  fecha_cambio: string;
  razon?: string;
}

interface EstadisticasTiempos {
  totalCambios: number;
  totalDias: number;
  promedioDias: number;
  minimoDias: number;
  maximoDias: number;
}

export const useLeadTiempos = (leadId: number, puedeVer: boolean) => {
  const [tiempos, setTiempos] = useState<TiempoEstado[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTiempos | null>(null);

  const cargarTiempos = useCallback(async () => {
    if (!leadId || !puedeVer) return;
    
    setCargando(true);
    setError(null);
    
    try {
      // Usar fetch normal, NO Inertia
      const response = await fetch(`/comercial/leads/${leadId}/tiempos-estados`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTiempos(data || []);
      
      if (data && data.length > 0) {
        setEstadisticas(calcularEstadisticas(data));
      } else {
        setEstadisticas(null);
      }
    } catch (err) {
      console.error('Error cargando tiempos:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      setTiempos([]);
      setEstadisticas(null);
    } finally {
      setCargando(false);
    }
  }, [leadId, puedeVer]);

  const calcularEstadisticas = (data: TiempoEstado[]): EstadisticasTiempos => {
    const totalCambios = data.length;
    const totalDias = data.reduce((sum, item) => sum + item.dias, 0);
    const promedioDias = totalCambios > 0 ? totalDias / totalCambios : 0;
    const minimoDias = Math.min(...data.map(item => item.dias));
    const maximoDias = Math.max(...data.map(item => item.dias));
    
    return {
      totalCambios,
      totalDias,
      promedioDias: Number(promedioDias.toFixed(1)),
      minimoDias,
      maximoDias
    };
  };

  // Cargar automáticamente cuando se active
  useEffect(() => {
    if (puedeVer) {
      cargarTiempos();
    }
  }, [puedeVer, leadId, cargarTiempos]); // Dependencias correctas

  return {
    tiempos,
    cargando,
    error,
    estadisticas,
    recargar: cargarTiempos
  };
};