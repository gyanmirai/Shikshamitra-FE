import type { WebPushRegistration } from 'src/redux/communication/notification/web-push-api';

import { readPushDevice, savePushDevice, withPushDevice, isCurrentPushOwner } from './web-push-device';

export class WebPushEnrollmentTimeoutError extends Error {
  constructor() {
    super('Browser enrollment did not finish. Check the notification permission in this browser, then try again.');
    this.name = 'WebPushEnrollmentTimeoutError';
  }
}

export function decodeVapidKey(key: string) {
  const base64 = key.replace(/-/g, '+').replace(/_/g, '/');
  const decoded = window.atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

export async function enableWebPush(
  worker: ServiceWorkerRegistration,
  key: Uint8Array,
  owner: string,
  version: string,
  register: (registration: WebPushRegistration) => Promise<{ id: string }>
) {
  if (!isCurrentPushOwner(owner)) throw new Error('The account changed.');
  if (Notification.permission === 'denied') throw new Error('Browser permission is blocked.');
  // Subscribe immediately from the click so mobile browsers can show the permission prompt.
  const nativeEnrollment = worker.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let subscription: PushSubscription;
  try {
    subscription = await Promise.race([
      nativeEnrollment,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new WebPushEnrollmentTimeoutError()), 15_000);
      }),
    ]);
  } catch (error) {
    if (error instanceof WebPushEnrollmentTimeoutError) {
      // A native prompt may settle after the session that opened it has ended.
      nativeEnrollment.then((late) => withPushDevice(async () => {
        if (isCurrentPushOwner(owner) || readPushDevice()) return;
        const live = await worker.pushManager.getSubscription();
        if (live?.endpoint === late.endpoint) await live.unsubscribe();
      })).catch(() => undefined);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  const { draft, input } = await withPushDevice(async () => {
    const live = await worker.pushManager.getSubscription();
    const current = readPushDevice();
    if (!isCurrentPushOwner(owner)) {
      if (!current && live?.endpoint === subscription.endpoint) await live.unsubscribe();
      throw new Error('The account changed.');
    }
    const json = subscription.toJSON();
    if (live?.endpoint !== subscription.endpoint || !json.keys?.p256dh || !json.keys.auth)
      throw new Error('Browser registration expired.');
    const installationId = current?.owner === owner ? current.installationId : crypto.randomUUID();
    const pendingDevice = { owner, id: null, installationId, version, revision: crypto.randomUUID() };
    savePushDevice(pendingDevice);
    return {
      draft: pendingDevice,
      input: {
        browserInstallationId: installationId,
        endpoint: subscription.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        vapidKeyVersion: version,
      },
    };
  });

  const ownsDraft = () => isCurrentPushOwner(owner) && readPushDevice()?.revision === draft.revision;
  try {
    // Session recovery can unsubscribe this device while the request is pending.
    const { id } = await register(input);
    if (!id) throw new Error('Registration was not confirmed.');
    await withPushDevice(async () => {
      const live = await worker.pushManager.getSubscription();
      if (!ownsDraft()) throw new Error('Browser registration changed.');
      if (live?.endpoint !== subscription.endpoint) throw new Error('Browser registration expired.');
      savePushDevice({ ...draft, id });
    });
    return id;
  } catch (error) {
    await withPushDevice(async () => {
      if (!ownsDraft()) return;
      const live = await worker.pushManager.getSubscription();
      if (ownsDraft() && live?.endpoint === subscription.endpoint) await live.unsubscribe();
    }).catch(() => undefined);
    throw error;
  }
}
