const notificationIdPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const dashboardUrl = new URL('/dashboard?openNotifications=1', self.location.origin).href;

function openExistingInbox(client) {
  return new Promise((resolve) => {
    const { port1, port2 } = new MessageChannel();
    const timer = setTimeout(() => finish(false), 500);
    function finish(opened) {
      clearTimeout(timer);
      port1.close();
      port2.close();
      resolve(opened);
    }
    port1.onmessage = ({ data }) => {
      if (data === 'NOTIFICATIONS_OPENED') finish(true);
    };
    try {
      client.postMessage({ type: 'OPEN_SCHOOL_NOTIFICATIONS' }, [port2]);
    } catch {
      finish(false);
    }
  });
}

self.addEventListener('push', (event) => {
  let notificationId;
  try {
    notificationId = event.data?.json()?.notificationId;
  } catch {
    return;
  }
  if (typeof notificationId !== 'string' || !notificationIdPattern.test(notificationId)) return;

  event.waitUntil(self.registration.showNotification('School update', {
    body: 'Open Shiksha Mitra to view your notifications.',
    icon: '/logo/notification-icon-192.png',
    tag: notificationId,
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const client = clients.find((windowClient) => {
      const url = new URL(windowClient.url);
      return url.origin === self.location.origin &&
        (url.pathname === '/dashboard' || url.pathname === '/academic/dashboard');
    });
    if (client && await openExistingInbox(client)) {
      try { await client.focus(); return; } catch { /* The tab closed while handling the click. */ }
    }
    await self.clients.openWindow(dashboardUrl);
  })());
});
