export function preserveNotificationLaunch(path: string, search: string) {
  return new URLSearchParams(search).get('openNotifications') === '1'
    ? `${path}?openNotifications=1`
    : path;
}
