/**
 * Notification Domain Types & Interfaces
 * Single source of truth for notification route resolution, payload shapes, and push token payloads.
 */

import type { NOTIFICATION_SCREENS } from '../../constants/api.constants';

export type NotificationScreen = (typeof NOTIFICATION_SCREENS)[keyof typeof NOTIFICATION_SCREENS];

export type NotificationRouteResolution =
  | { screen: 'finding-detail'; findingId: string }
  | { screen: 'audit-detail'; auditId: string }
  | { screen: 'alerts-list' };

export interface NotificationDataPayload {
  route?: unknown;
  findingId?: unknown;
  auditId?: unknown;
  [key: string]: unknown;
}

export interface PushTokenRegistrationPayload {
  pushToken: string;
  platform: string;
}
