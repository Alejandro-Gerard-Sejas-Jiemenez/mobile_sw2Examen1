import type { useRouter } from 'expo-router';
import type { NotificationRouteResolution, NotificationDataPayload } from './types';
import { NOTIFICATION_SCREENS, NOTIFICATION_ROUTES } from '../../constants/api.constants';

type ExpoRouter = ReturnType<typeof useRouter>;

export type { NotificationRouteResolution };

/**
 * Resolves a push notification's `data` payload against the fixed route
 * whitelist in contracts/notifications.md. The payload is untrusted input —
 * an unrecognized `route`, or a recognized `route` missing its required id,
 * MUST resolve to `alerts-list` rather than navigating anywhere else
 * (Constitution Principle IV). Pure function, independent of navigation, so
 * it can be unit-tested on its own (tasks.md T041).
 */
export function resolveNotificationRoute(
  data: NotificationDataPayload | Record<string, unknown> | undefined | null,
): NotificationRouteResolution {
  const route = data?.route;

  if (
    route === NOTIFICATION_SCREENS.FINDING_DETAIL &&
    typeof data?.findingId === 'string' &&
    data.findingId.length > 0
  ) {
    return { screen: NOTIFICATION_SCREENS.FINDING_DETAIL, findingId: data.findingId };
  }

  if (
    route === NOTIFICATION_SCREENS.AUDIT_DETAIL &&
    typeof data?.auditId === 'string' &&
    data.auditId.length > 0
  ) {
    return { screen: NOTIFICATION_SCREENS.AUDIT_DETAIL, auditId: data.auditId };
  }

  if (
    route === NOTIFICATION_SCREENS.REPORT_READY &&
    typeof data?.auditId === 'string' &&
    data.auditId.length > 0
  ) {
    return { screen: NOTIFICATION_SCREENS.REPORT_READY, auditId: data.auditId };
  }

  return { screen: NOTIFICATION_SCREENS.ALERTS_LIST };
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
  data: NotificationDataPayload | Record<string, unknown> | undefined | null,
): void {
  const resolution = resolveNotificationRoute(data);

  switch (resolution.screen) {
    case NOTIFICATION_SCREENS.FINDING_DETAIL:
      router.push({
        pathname: NOTIFICATION_ROUTES.FINDING_DETAIL,
        params: { findingId: resolution.findingId },
      });
      break;
    case NOTIFICATION_SCREENS.AUDIT_DETAIL:
      router.push({
        pathname: NOTIFICATION_ROUTES.AUDIT_DETAIL,
        params: { auditId: resolution.auditId },
      });
      break;
    case NOTIFICATION_SCREENS.REPORT_READY:
      router.push({
        pathname: NOTIFICATION_ROUTES.REPORT_READY,
        params: { auditId: resolution.auditId },
      });
      break;
    case NOTIFICATION_SCREENS.ALERTS_LIST:
    default:
      router.push(NOTIFICATION_ROUTES.ALERTS_LIST);
  }
}

