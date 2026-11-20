import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { guardStudentNavigation } from 'src/hooks/academic-context-change';

import { notificationGroups } from './notification-display';

const positive = (value: string | null, fallback: number) =>
  /^\d+$/.test(value || '') && Number.isSafeInteger(Number(value)) && Number(value) > 0
    ? Number(value)
    : fallback;
export function useNotificationLocation() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const tab = params.get('tab') || '';
  const group = notificationGroups.find((item) => item.value === tab);
  const update = (values: Record<string, string | number>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(values).forEach(([key, value]) =>
      value === '' ? next.delete(key) : next.set(key, String(value))
    );
    const proceed = () => router.push(`${pathname}${next.size ? `?${next}` : ''}`);
    if (!guardStudentNavigation(proceed)) proceed();
  };
  return {
    tab: group?.value || '',
    eventGroup: group?.eventGroup,
    eventType: params.get('eventType') || '',
    channel: params.get('channel') || '',
    status: params.get('status') || '',
    page: positive(params.get('page'), 1),
    pageSize: Math.min(100, positive(params.get('pageSize'), 20)),
    update,
  };
}
