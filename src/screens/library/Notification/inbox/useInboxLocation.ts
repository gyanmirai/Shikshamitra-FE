import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { guardStudentNavigation } from 'src/hooks/academic-context-change';

const positive = (value: string | null, fallback: number) =>
  /^\d+$/.test(value || '') && Number.isSafeInteger(Number(value)) && Number(value) > 0
    ? Number(value)
    : fallback;
export function useInboxLocation() {
  const params = useSearchParams();
  const path = usePathname();
  const router = useRouter();
  return {
    page: positive(params.get('page'), 1),
    pageSize: Math.min(100, positive(params.get('pageSize'), 20)),
    unreadOnly: params.get('unreadOnly') === 'true',
    update: (values: Record<string, string | number | boolean>) => {
      const next = new URLSearchParams(params.toString());
      Object.entries(values).forEach(([key, value]) => next.set(key, String(value)));
      const proceed = () => router.push(`${path}?${next}`);
      if (!guardStudentNavigation(proceed)) proceed();
    },
  };
}
