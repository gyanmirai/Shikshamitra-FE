import { useRouter, usePathname, useSearchParams } from 'src/routes/hooks';
import { guardStudentNavigation } from 'src/hooks/academic-context-change';

export function useWorkspaceQuery() {
  const pathname = usePathname();
  const query = useSearchParams();
  const router = useRouter();
  const update = (values: Record<string, string | number>) => {
    const next = new URLSearchParams(query.toString());
    Object.entries(values).forEach(([key, value]) => next.set(key, String(value)));
    if (!guardStudentNavigation(() => router.replace(`${pathname}?${next}`)))
      router.replace(`${pathname}?${next}`);
  };
  return { query, update };
}
