import { useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

/**
 * Tracks whether the app is currently in the foreground, so polling hooks can
 * pause while backgrounded and resume on foreground (shared by `useAudits`
 * and `useSyncRemoteAudits`).
 */
export function useIsAppForegrounded(): boolean {
  const [isForegrounded, setIsForegrounded] = useState(AppState.currentState === 'active');

  useEffect(() => {
    const handleChange = (state: AppStateStatus) => setIsForegrounded(state === 'active');
    const subscription = AppState.addEventListener('change', handleChange);
    return () => subscription.remove();
  }, []);

  return isForegrounded;
}
