import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

const owner = 'school-a:guardian-a';
const key = new Uint8Array([4, 3, 2, 1]);

async function fixture() {
  vi.resetModules();
  const device = await import('./web-push-device');
  const client = await import('./web-push-client');
  const endpoint = 'https://push.example.test/registration';
  let current: unknown = null;
  const unsubscribe = vi.fn(async () => { current = null; return true; });
  const subscription = {
    endpoint,
    unsubscribe,
    toJSON: () => ({ keys: { p256dh: 'fixture-public-key', auth: 'fixture-auth' } }),
  };
  const subscribe = vi.fn(async () => { current = subscription; return subscription; });
  const getSubscription = vi.fn(async () => current);
  const registration = {
    active: { scriptURL: `${window.location.origin}/notification-sw.js` },
    pushManager: { subscribe, getSubscription },
  };
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: { getRegistration: vi.fn(async () => registration), register: vi.fn() },
  });
  const register = vi.fn(async () => ({ id: 'registration-id' }));
  await device.setWebPushOwner(owner);
  return { device, client, registration: registration as unknown as ServiceWorkerRegistration, subscribe, unsubscribe, register };
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('isSecureContext', true);
  vi.stubGlobal('PushManager', class PushManager {});
  vi.stubGlobal('Notification', { permission: 'default' });
});

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(navigator, 'serviceWorker');
});

describe('browser notification registration', () => {
  it('prepares the worker without prompting and subscribes from the explicit action', async () => {
    const { device, client, subscribe, register } = await fixture();
    const worker = await device.preparePushWorker();
    expect(subscribe).not.toHaveBeenCalled();

    await client.enableWebPush(worker, key, owner, 'v1', register);

    expect(subscribe).toHaveBeenCalledWith({ userVisibleOnly: true, applicationServerKey: key });
    expect(register).toHaveBeenCalledWith(expect.objectContaining({ vapidKeyVersion: 'v1' }));
    expect(device.readPushDevice()).toMatchObject({ owner, id: 'registration-id' });
    expect(JSON.stringify(device.readPushDevice())).not.toContain('fixture-auth');
  });

  it('handles a denied browser permission without registering', async () => {
    const { client, registration, subscribe, register } = await fixture();
    vi.stubGlobal('Notification', { permission: 'denied' });

    await expect(client.enableWebPush(registration, key, owner, 'v1', register)).rejects.toThrow(/blocked/);
    expect(subscribe).not.toHaveBeenCalled();
    expect(register).not.toHaveBeenCalled();
  });

  it('detaches a device on tenant or account change', async () => {
    const { device, client, registration, unsubscribe, register } = await fixture();
    await client.enableWebPush(registration, key, owner, 'v1', register);
    await device.setWebPushOwner(owner);
    expect(unsubscribe).not.toHaveBeenCalled();

    await device.setWebPushOwner('school-b:guardian-a');
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(device.readPushDevice()).toBeNull();
    await expect(client.enableWebPush(registration, key, owner, 'v1', register)).rejects.toThrow(/changed/);
    expect(register).toHaveBeenCalledOnce();
  });

  it('rejects late opt-in results after the owner changes', async () => {
    const { device, client, registration, subscribe, unsubscribe, register } = await fixture();
    const original = subscribe.getMockImplementation()!;
    let release!: () => void;
    subscribe.mockImplementationOnce(async () => {
      await new Promise<void>((resolve) => { release = resolve; });
      return original();
    });
    const enabling = client.enableWebPush(registration, key, owner, 'v1', register);
    await device.setWebPushOwner('school-a:guardian-b');
    release();

    await expect(enabling).rejects.toThrow(/changed/);
    expect(unsubscribe).toHaveBeenCalled();
    expect(device.readPushDevice()).toBeNull();
    expect(register).not.toHaveBeenCalled();
  });

  it('unsubscribes locally even when a server-side removal fails', async () => {
    const { device, client, registration, unsubscribe, register } = await fixture();
    await client.enableWebPush(registration, key, owner, 'v1', register);

    await device.removePushDevice(owner, async () => { throw new Error('Offline'); });
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(device.readPushDevice()).toBeNull();
  });

  it('allows session expiry to detach the browser while enrollment is awaiting the server', async () => {
    const { device, client, registration, unsubscribe } = await fixture();
    const expired = new Error('The session expired.');

    await expect(client.enableWebPush(registration, key, owner, 'v1', async () => {
      await device.setWebPushOwner(null);
      throw expired;
    })).rejects.toThrow(expired);

    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(device.readPushDevice()).toBeNull();
  });

  it.each([
    { account: 'the same account', nextOwner: owner, previousUnsubscriptions: 0 },
    { account: 'a new account', nextOwner: 'school-b:guardian-b', previousUnsubscriptions: 1 },
  ])('preserves enrollment for $account when the previous request fails late', async ({
    nextOwner,
    previousUnsubscriptions,
  }) => {
    const { device, client, registration, unsubscribe } = await fixture();
    let resolveStarted!: () => void;
    let rejectFirst!: (error: Error) => void;
    const started = new Promise<void>((resolve) => { resolveStarted = resolve; });
    const pending = new Promise<{ id: string }>((_, reject) => { rejectFirst = reject; });
    const first = client.enableWebPush(registration, key, owner, 'v1', () => {
      resolveStarted();
      return pending;
    });
    const firstResult = expect(first).rejects.toThrow('The old request failed.');
    await started;

    await device.setWebPushOwner(nextOwner);
    await client.enableWebPush(registration, key, nextOwner, 'v1', async () => ({ id: 'replacement' }));
    rejectFirst(new Error('The old request failed.'));
    await firstResult;

    expect(unsubscribe).toHaveBeenCalledTimes(previousUnsubscriptions);
    expect(device.readPushDevice()).toMatchObject({ owner: nextOwner, id: 'replacement' });
  });
});
