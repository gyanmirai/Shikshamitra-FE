const deviceKey = 'shikshamitra:website-push:device';
const ownerKey = 'shikshamitra:website-push:owner';
const workerPath = '/notification-sw.js';

export type BrowserPushDevice = {
  owner: string;
  id: string | null;
  installationId: string;
  version: string;
  revision?: string;
};

let activeOwner: string | null | undefined;
let pending: Promise<unknown> = Promise.resolve();

export const isWebPushSupported = () =>
  typeof window !== 'undefined' &&
  window.isSecureContext &&
  'serviceWorker' in navigator &&
  'Notification' in window &&
  'PushManager' in window;

export function needsPushHomeScreenInstallation() {
  if (typeof window === 'undefined' || !window.isSecureContext) return false;
  const appleMobile = navigator as Navigator & { standalone?: boolean };
  const isAppleMobile = /iPad|iPhone|iPod/.test(appleMobile.userAgent) ||
    (appleMobile.platform === 'MacIntel' && appleMobile.maxTouchPoints > 1);
  return isAppleMobile && !appleMobile.standalone && !window.matchMedia('(display-mode: standalone)').matches;
}

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
      (value.revision === undefined || typeof value.revision === 'string') &&
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

async function detachBrowserSubscription(requireConfirmation = false) {
  const registration = await navigator.serviceWorker.getRegistration('/');
  if (!registration || !isNotificationWorker(registration)) return;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription && !(await subscription.unsubscribe()) && requireConfirmation &&
      await registration.pushManager.getSubscription()) {
    throw new Error('The browser subscription could not be removed.');
  }
}

export async function disableWebPushDevice(owner: string, disable: (id: string) => Promise<unknown>) {
  const device = readPushDevice();
  if (!device?.id || device.owner !== owner || !isCurrentPushOwner(owner)) {
    throw new Error('The browser registration changed.');
  }
  // Make the server change outside the lock. Session recovery can detach the device.
  await disable(device.id);
  await withPushDevice(async () => {
    const current = readPushDevice();
    if (!current || !isCurrentPushOwner(owner) || current.owner !== owner ||
        current.installationId !== device.installationId || current.id !== device.id ||
        current.revision !== device.revision) return;
    await detachBrowserSubscription(true);
    window.localStorage.removeItem(deviceKey);
  });
}

export async function removePushDevice(owner?: string, disable?: (device: BrowserPushDevice) => Promise<unknown>) {
  if (!isWebPushSupported()) return;
  const removed = await withPushDevice(async () => {
    const device = readPushDevice();
    if (owner !== undefined && device?.owner !== owner) return null;
    await detachBrowserSubscription();
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
    await detachBrowserSubscription();
    window.localStorage.removeItem(deviceKey);
  });
}

export async function endWebPushSession(owner: string) {
  if (isWebPushSupported() && isCurrentPushOwner(owner)) await setWebPushOwner(null);
}
