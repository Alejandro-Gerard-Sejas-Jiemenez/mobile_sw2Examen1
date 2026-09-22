/**
 * Types for the INJECTION backend (backend_genvulnai). Field names mirror the
 * Django serializers (AttackTurnSerializer, AttackSession*Serializer) 1:1 — do
 * not rename; these are the wire contract.
 */

export type EstadoAtaque =
  | 'pendiente'
  | 'en_proceso'
  | 'exito'
  | 'exito_persistido'
  | 'max_turnos'
  | 'fallido';

export type CategoriaAtaque =
  | 'inyeccion_directa'
  | 'fuga_instrucciones'
  | 'confusion_delimitadores'
  | 'suplantacion_rol'
  | 'inyeccion_oculta'
  | 'evasion_restricciones'
  | 'desconocida';

export type ClasificacionResultado =
  | 'resistido'
  | 'parcial'
  | 'exito'
  | 'error_sistema'
  | 'inconcluso';

/** One A1 → D1 → J1 turn. GET /api/ataques/{id}/turnos/ returns AttackTurn[]. */
export interface AttackTurn {
  id: string;
  numero_turno: number;
  prompt_a1: string;
  tactica_usada: string;
  respuesta_d1: string;
  status_code_d1: number | null;
  latencia_d1_ms: number | null;
  puntaje_j1: number | null;
  justificacion_j1: string;
  fuga_detectada: boolean;
  fragmentos_fuga: string[];
  fue_reset: boolean;
  es_persistencia: boolean;
  vector_persistencia: number | null;
  categoria_ataque: CategoriaAtaque;
  clasificacion_resultado: ClasificacionResultado;
  formato_preservado: boolean;
  tarea_preservada: boolean;
  instruccion_adversaria_seguida: boolean;
  confianza_evaluacion: number;
  created_at: string;
}

/** POST /api/ataques/ response + GET /api/ataques/ (list). */
export interface AttackSession {
  id: string;
  scan_id: string;
  objetivo: string;
  max_turnos: number;
  turnos_ejecutados: number;
  status: EstadoAtaque;
  puntaje_maximo: number;
  exito: boolean;
  persistencia_habilitada: boolean;
  persistencia_verificada: boolean;
  modelo_a1: string;
  modelo_j1: string;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

/** POST /api/descubrimientos/ response. */
export interface DescubrimientoCreated {
  id: string;
  target_url: string;
  status: string;
  mensaje?: string;
}

/** Display labels mirroring `EstadoEscaneo` (backend_genvulnai/domain/enums.py). */
export const ESTADO_ESCANEO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En Progreso',
  completado: 'Completado',
  fallido: 'Fallido',
};

/** Display labels mirroring `EstadoAtaque` (backend_genvulnai/domain/enums.py). */
export const ESTADO_ATAQUE_LABELS: Record<EstadoAtaque, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  exito: 'Éxito (Meta Cumplida)',
  exito_persistido: 'Éxito con Persistencia Verificada',
  max_turnos: 'Límite de Turnos Alcanzado',
  fallido: 'Fallido por Error',
};
