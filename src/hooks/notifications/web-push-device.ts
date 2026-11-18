const deviceKey = 'shikshamitra:website-push:device';
const ownerKey = 'shikshamitra:website-push:owner';
const workerPath = '/notification-sw.js';

export type BrowserPushDevice = {
  owner: string;
  id: string | null;
  installationId: string;
  version: string;
};

let activeOwner: string | null | undefined;
let pending: Promise<unknown> = Promise.resolve();

export const isWebPushSupported = () =>
  typeof window !== 'undefined' &&
  window.isSecureContext &&
  'serviceWorker' in navigator &&
  'Notification' in window &&
  'PushManager' in window;

export const webPushOwner = (tenant?: string | null, user?: string | null) =>
  tenant && user ? `${tenant}:${user}` : null;

export function readPushDevice(): BrowserPushDevice | null {
  const raw = window.localStorage.getItem(deviceKey);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<BrowserPushDevice> | null;
    return typeof value?.owner === 'string' &&
      typeof value.installationId === 'string' &&
      typeof value.version === 'string' &&
      (typeof value.id === 'string' || value.id === null)
      ? (value as BrowserPushDevice)
      : null;
  } catch {
    return null;
  }
}

export const savePushDevice = (device: BrowserPushDevice) =>
  window.localStorage.setItem(deviceKey, JSON.stringify(device));

export function isCurrentPushOwner(owner: string) {
  return activeOwner === owner && window.localStorage.getItem(ownerKey) === owner;
}

function isNotificationWorker(registration?: ServiceWorkerRegistration) {
  const worker = registration?.active ?? registration?.waiting ?? registration?.installing;
  return worker?.scriptURL === new URL(workerPath, window.location.origin).href;
}

export async function preparePushWorker() {
  const current = await navigator.serviceWorker.getRegistration('/');
  if (current && !isNotificationWorker(current)) throw new Error('The notification worker is unavailable.');
  const registration = current ?? await navigator.serviceWorker.register(workerPath, {
    scope: '/',
    updateViaCache: 'none',
  });
  if (registration.active) return registration;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const ready = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error('The notification worker did not start.')), 5000);
      }),
    ]);
    if (!isNotificationWorker(ready)) throw new Error('The notification worker is unavailable.');
    return ready;
  } finally {
    clearTimeout(timeout);
  }
}

export function withPushDevice<T>(action: () => Promise<T>): Promise<T> {
  if (navigator.locks) return navigator.locks.request(deviceKey, action);
  const next = pending.then(action);
  pending = next.catch(() => undefined);
  return next;
}

export async function removePushDevice(owner?: string, disable?: (device: BrowserPushDevice) => Promise<unknown>) {
  if (!isWebPushSupported()) return;
  const removed = await withPushDevice(async () => {
    const device = readPushDevice();
    if (owner !== undefined && device?.owner !== owner) return null;
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (registration && isNotificationWorker(registration)) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) await subscription.unsubscribe();
    }
    window.localStorage.removeItem(deviceKey);
    return device;
  });
  // Browser revocation also works after the previous account's session expires.
  if (removed?.id && disable) await disable(removed).catch(() => undefined);
}

export async function setWebPushOwner(owner: string | null) {
  if (!isWebPushSupported() || activeOwner === owner) return;
  activeOwner = owner;
  if (owner) window.localStorage.setItem(ownerKey, owner);
  else window.localStorage.removeItem(ownerKey);
  await withPushDevice(async () => {
    if (activeOwner !== owner || window.localStorage.getItem(ownerKey) !== owner) return;
    const device = readPushDevice();
    if (device?.owner === owner) return;
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (registration && isNotificationWorker(registration)) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) await subscription.unsubscribe();
    }
    window.localStorage.removeItem(deviceKey);
  });
}

export async function endWebPushSession(owner: string) {
  if (isWebPushSupported() && isCurrentPushOwner(owner)) await setWebPushOwner(null);
}
