import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { it, vi, expect, describe } from 'vitest';

const source = readFileSync('public/notification-sw.js', 'utf8');
const origin = 'https://school.example.test';
type WorkerEvent = {
  data?: { json: () => unknown };
  notification?: { close: () => void; data?: unknown };
  waitUntil: (promise: Promise<unknown>) => void;
};

function fixture(windows: { url: string; focus: () => Promise<void>; postMessage: (value: unknown) => void }[] = []) {
  const listeners = new Map<string, (event: WorkerEvent) => void>();
  const show = vi.fn(async () => undefined);
  const open = vi.fn(async () => undefined);
  runInNewContext(source, {
    URL,
    self: {
      location: { origin },
      registration: { showNotification: show },
      clients: { openWindow: open, matchAll: async () => windows },
      addEventListener: (name: string, handler: (event: WorkerEvent) => void) => listeners.set(name, handler),
    },
  });
  const emit = async (name: string, event: Omit<WorkerEvent, 'waitUntil'>) => {
    let work: Promise<unknown> | undefined;
    listeners.get(name)?.({ ...event, waitUntil: (promise) => { work = promise; } });
    await work;
  };
  return { emit, listeners, show, open };
}

describe('the notification service worker', () => {
  it('shows one generic alert and never registers a fetch/cache handler', async () => {
    const { emit, show, listeners } = fixture();
    const notificationId = 'a12b345c-7890-45ab-81cd-abcd012345ef';
    await emit('push', { data: { json: () => ({ notificationId, body: 'Private message' }) } });
    await emit('push', { data: { json: () => ({ notificationId: 'invalid' }) } });

    expect(show).toHaveBeenCalledOnce();
    expect(show).toHaveBeenCalledWith('School update', {
      body: 'Open Shiksha Mitra to view your notifications.',
      icon: '/logo/notification-icon-192.png',
      tag: notificationId,
    });
    expect(listeners.has('fetch')).toBe(false);
  });

  it('focuses a matching origin and signals the notification drawer', async () => {
    const offsite = { url: 'https://outside.example/', focus: vi.fn(), postMessage: vi.fn() };
    const sameSite = { url: `${origin}/academic/dashboard`, focus: vi.fn(), postMessage: vi.fn() };
    const { emit, open } = fixture([offsite, sameSite]);
    const close = vi.fn();

    await emit('notificationclick', { notification: { close } });

    expect(close).toHaveBeenCalledOnce();
    expect(offsite.focus).not.toHaveBeenCalled();
    expect(sameSite.focus).toHaveBeenCalledOnce();
    expect(sameSite.postMessage).toHaveBeenCalledWith({ type: 'OPEN_SCHOOL_NOTIFICATIONS' });
    expect(open).not.toHaveBeenCalled();
  });

  it('uses the fixed dashboard URL when no school tab is open', async () => {
    const { emit, open } = fixture();
    await emit('notificationclick', { notification: { close: vi.fn(), data: { url: 'https://outside.example/' } } });

    expect(open).toHaveBeenCalledWith(`${origin}/dashboard?openNotifications=1`);
  });
});
