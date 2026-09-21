import type { useRouter } from 'expo-router';

type ExpoRouter = ReturnType<typeof useRouter>;

export type NotificationRouteResolution =
  | { screen: 'finding-detail'; findingId: string }
  | { screen: 'audit-detail'; auditId: string }
  | { screen: 'alerts-list' };

/**
 * Resolves a push notification's `data` payload against the fixed route
 * whitelist in contracts/notifications.md. The payload is untrusted input —
 * an unrecognized `route`, or a recognized `route` missing its required id,
 * MUST resolve to `alerts-list` rather than navigating anywhere else
 * (Constitution Principle IV). Pure function, independent of navigation, so
 * it can be unit-tested on its own (tasks.md T041).
 */
export function resolveNotificationRoute(
  data: Record<string, unknown> | undefined | null,
): NotificationRouteResolution {
  const route = data?.route;

  if (route === 'finding-detail' && typeof data?.findingId === 'string' && data.findingId.length > 0) {
    return { screen: 'finding-detail', findingId: data.findingId };
  }

  if (route === 'audit-detail' && typeof data?.auditId === 'string' && data.auditId.length > 0) {
    return { screen: 'audit-detail', auditId: data.auditId };
  }

  return { screen: 'alerts-list' };
}

/**
 * Navigates for a resolved notification route. `finding-detail` opens
 * `src/app/(tabs)/findings/[findingId]` (T031); `audit-detail` opens the
 * findings list for that audit at `src/app/(tabs)/audits/[auditId]/findings`
 * (T030) — there is no separate "audit overview" screen, so the findings list
 * is the audit's detail view. Anything else (including the `alerts-list`
 * fallback) opens the alerts tab.
 */
export function navigateForNotification(
  router: ExpoRouter,
  data: Record<string, unknown> | undefined | null,
): void {
  const resolution = resolveNotificationRoute(data);

  switch (resolution.screen) {
    case 'finding-detail':
      router.push({
        pathname: '/(tabs)/findings/[findingId]',
        params: { findingId: resolution.findingId },
      });
      break;
    case 'audit-detail':
      router.push({
        pathname: '/(tabs)/audits/[auditId]/findings',
        params: { auditId: resolution.auditId },
      });
      break;
    case 'alerts-list':
    default:
      router.push('/(tabs)/alerts');
  }
}
