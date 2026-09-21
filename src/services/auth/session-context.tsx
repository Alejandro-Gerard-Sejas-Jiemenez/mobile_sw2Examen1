import { useSyncExternalStore } from 'react';
import type { AuditorIdentity, AuditorSession, UseAuditorSessionReturn } from './types';

export type { AuditorIdentity, AuditorSession, UseAuditorSessionReturn };


type Listener = () => void;

// Module-level variable, not React state and never persisted: this is the ONLY
// place the access token is held (Constitution Principle I — "in memory only").
let currentSession: AuditorSession | null = null;
const listeners = new Set<Listener>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

/** Sets (or clears, with null) the in-memory session. */
export function setAuditorSession(session: AuditorSession | null): void {
  currentSession = session;
  emit();
}

export function clearAuditorSession(): void {
  setAuditorSession(null);
}

export function getAuditorSession(): AuditorSession | null {
  return currentSession;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** React hook: re-renders whenever the in-memory session changes. */
export function useAuditorSession(): UseAuditorSessionReturn {
  const session = useSyncExternalStore(subscribe, getAuditorSession, getAuditorSession);
  return { session, isAuthenticated: session !== null };
}
