import { useRouter, type Href } from 'expo-router';

/**
 * Back navigation that falls back to a known route when there's nothing to
 * pop (e.g. the screen was entered directly via a push-notification deep
 * link or survived a Fast Refresh as the root of the stack) — otherwise
 * router.back() throws the unhandled GO_BACK navigator warning and no-ops.
 */
export function useSafeBack(fallback: Href) {
  const router = useRouter();

  return () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallback);
    }
  };
}
