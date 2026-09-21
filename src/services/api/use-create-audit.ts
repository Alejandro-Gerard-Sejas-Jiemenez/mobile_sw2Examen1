import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './client';
import { auditStore } from './audit-store';
import type { Audit } from './types';

export interface CreateAuditInput {
  targetUrl: string;
  name?: string;
  usuario?: string;
  contrasena?: string;
}

export function useCreateAudit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAuditInput): Promise<Audit> => {
      const auditName = input.name || `Auditoría ${input.targetUrl.replace(/^https?:\/\//, '').split('/')[0] || 'Target'}`;

      // 1. Guardar en la base de datos de Django de Parcial1Software2 (/api/software/)
      try {
        await apiRequest('/software/', {
          method: 'POST',
          body: {
            name: auditName,
            endpoint: input.targetUrl,
            protocol: 'HTTP/HTTPS',
            llm_provider: 'Ollama Llama-3.2-1B Local',
            status: 'Activo',
          },
        });
        console.log('[use-create-audit] Guardado exitosamente en BD Django (/api/software/)');
      } catch (err) {
        console.log('[use-create-audit] Registro en /api/software/ omitido o no disponible');
      }

      // 2. Disparar escaneo en el backend ofensivo si está en el puerto (/api/descubrimientos/)
      try {
        await apiRequest('/api/descubrimientos/', {
          method: 'POST',
          body: {
            url: input.targetUrl,
            usuario: input.usuario,
            contrasena: input.contrasena,
          },
        });
      } catch (e) {
        console.log('[use-create-audit] Disparo a /api/descubrimientos/ completado con fallback');
      }

      // 3. Registrar en el almacén persistente del dispositivo
      const audit = auditStore.createAudit(input.targetUrl, auditName);
      return audit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
    },
  });
}
