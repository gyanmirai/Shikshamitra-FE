import { useAcademicDiscardGuard } from 'src/screens/academic/components/useAcademicDiscardGuard';

import { useAcademicSetupEmbedding } from './AcademicSetupEmbeddingProvider';

import type { AcademicSetupFormState } from './AcademicSetupEmbeddingProvider';

export function useLectureSlotsNavigation(
  { dirty, busy }: AcademicSetupFormState,
  push: (href: string) => void
) {
  const { embedded } = useAcademicSetupEmbedding();
  return useAcademicDiscardGuard(embedded && dirty, embedded && busy, embedded ? push : undefined);
}
