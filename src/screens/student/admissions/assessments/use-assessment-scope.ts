import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function useAssessmentScope() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const setScope = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set('assessmentScope', value);
    else next.delete('assessmentScope');
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };
  return { scopeKey: params.get('assessmentScope') ?? '', setScope };
}
