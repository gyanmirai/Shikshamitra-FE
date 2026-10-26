import type { HrFailure } from './hr-failure';

export const HR_RECOVERY_EVENT = 'shikshamitra:hr-recovery';
let visibleRoute: string | null = null;
export function setHrRecoveryVisible(visible: boolean) {
  visibleRoute =
    visible && typeof window !== 'undefined'
      ? window.location.pathname + window.location.search
      : null;
}
export function isHrRecoveryVisible() {
  return (
    typeof window !== 'undefined' &&
    visibleRoute === window.location.pathname + window.location.search
  );
}
export type HrRecoveryEvent = {
  route: string;
  scope: string;
  endpoint: string;
  requestId: string;
  failure?: HrFailure;
};

export function hrRecoveryScope(auth: any): string {
  const profile = auth?.user?.profile ?? auth?.user;
  const user = profile?.sub;
  const tenant = profile?.tenantid ?? auth?.sessionContext?.tenantId;
  return user && tenant ? JSON.stringify([tenant, user, auth.initializationVersion ?? 0]) : '';
}

export function emitHrRecovery(event: HrRecoveryEvent) {
  if (typeof window !== 'undefined')
    window.dispatchEvent(new CustomEvent(HR_RECOVERY_EVENT, { detail: event }));
}
