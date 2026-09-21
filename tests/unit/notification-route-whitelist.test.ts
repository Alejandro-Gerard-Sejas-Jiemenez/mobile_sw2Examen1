/**
 * T041 (tasks.md) — Constitution Principle IV: a push payload's `route` is untrusted input. An
 * unrecognized or missing `route`, or one missing its required id, MUST resolve to `alerts-list`,
 * never to an arbitrary path.
 */
import { resolveNotificationRoute } from '../../src/services/notifications/handle-notification-response';

describe('resolveNotificationRoute', () => {
  it('resolves a valid finding-detail payload', () => {
    expect(resolveNotificationRoute({ route: 'finding-detail', findingId: 'f1' })).toEqual({
      screen: 'finding-detail',
      findingId: 'f1',
    });
  });

  it('resolves a valid audit-detail payload', () => {
    expect(resolveNotificationRoute({ route: 'audit-detail', auditId: 'a1' })).toEqual({
      screen: 'audit-detail',
      auditId: 'a1',
    });
  });

  it('falls back to alerts-list for an unrecognized route value', () => {
    expect(resolveNotificationRoute({ route: 'admin-panel', findingId: 'f1' })).toEqual({
      screen: 'alerts-list',
    });
  });

  it('falls back to alerts-list when route is missing entirely', () => {
    expect(resolveNotificationRoute({ findingId: 'f1' })).toEqual({ screen: 'alerts-list' });
  });

  it('falls back to alerts-list when finding-detail is missing its findingId', () => {
    expect(resolveNotificationRoute({ route: 'finding-detail' })).toEqual({ screen: 'alerts-list' });
  });

  it('falls back to alerts-list when audit-detail is missing its auditId', () => {
    expect(resolveNotificationRoute({ route: 'audit-detail' })).toEqual({ screen: 'alerts-list' });
  });

  it('falls back to alerts-list for a null or undefined payload', () => {
    expect(resolveNotificationRoute(undefined)).toEqual({ screen: 'alerts-list' });
    expect(resolveNotificationRoute(null)).toEqual({ screen: 'alerts-list' });
  });

  it('falls back to alerts-list when the id field has the wrong type', () => {
    expect(resolveNotificationRoute({ route: 'finding-detail', findingId: 123 })).toEqual({
      screen: 'alerts-list',
    });
  });

  it('falls back to alerts-list when the id field is an empty string', () => {
    expect(resolveNotificationRoute({ route: 'finding-detail', findingId: '' })).toEqual({
      screen: 'alerts-list',
    });
  });
});
