import type { WebPushRegistration } from 'src/redux/communication/notification/web-push-api';

import { readPushDevice, savePushDevice, withPushDevice, isCurrentPushOwner } from './web-push-device';

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
  const subscription = await worker.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });

  return withPushDevice(async () => {
    const current = readPushDevice();
    if (!isCurrentPushOwner(owner)) {
      if (!current?.id) await subscription.unsubscribe();
      throw new Error('The account changed.');
    }
    const live = await worker.pushManager.getSubscription();
    const json = subscription.toJSON();
    if (live?.endpoint !== subscription.endpoint || !json.keys?.p256dh || !json.keys.auth)
      throw new Error('Browser registration expired.');
    const installationId = current?.owner === owner ? current.installationId : crypto.randomUUID();
    const draft = { owner, id: null, installationId, version, revision: crypto.randomUUID() };
    savePushDevice(draft);
    try {
      const { id } = await register({
        browserInstallationId: installationId,
        endpoint: subscription.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        vapidKeyVersion: version,
      });
      if (!id) throw new Error('Registration was not confirmed.');
      if (!isCurrentPushOwner(owner)) {
        await subscription.unsubscribe();
        throw new Error('The account changed.');
      }
      savePushDevice({ ...draft, id });
      return id;
    } catch (error) {
      await subscription.unsubscribe().catch(() => undefined);
      throw error;
    }
  });
}
