import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiRequest } from './client';

export interface DescubrimientoResultado {
  objetivo?: { url: string; accesible: boolean };
  interfaz?: { tipo: string; selector_entrada: string; selector_envio: string; metodo_envio: string };
  canal?: { protocolo: string; transporte: string; url: string; metodo: string; content_type: string; entrada: any; respuesta: any };
  autenticacion?: { requerida: boolean; tipos: string[]; cookies: string[]; headers: string[] };
  confianza?: number;
  marcador_utilizado?: string;
  observaciones_registradas?: number;
}

export interface DescubrimientoItem {
  id: string;
  target_url: string;
  status: 'pendiente' | 'en_progreso' | 'completado' | 'fallido';
  marcador?: string;
  resultado?: DescubrimientoResultado;
  error_message?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  created_at: string;
}

export function useDescubrimientos(): UseQueryResult<DescubrimientoItem[]> {
  return useQuery({
    queryKey: ['descubrimientos'],
    queryFn: () => apiRequest<DescubrimientoItem[]>('/api/descubrimientos/'),
    refetchInterval: 5000,
  });
}
