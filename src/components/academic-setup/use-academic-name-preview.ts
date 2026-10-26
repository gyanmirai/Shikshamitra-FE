import { useGetAcademicFieldFormattingQuery } from 'src/redux/InstituteSetup/academic-field-formatting-api';

import { AcademicTextCase } from './academic-field-formatting-model';
import { useAcademicFormatPreview } from './use-academic-format-preview';

import type { AcademicFieldFormatting } from './academic-field-formatting-model';

export function useAcademicNamePreview(
  field: keyof AcademicFieldFormatting,
  value: string,
  isEditing = false
): string | undefined {
  const query = useGetAcademicFieldFormattingQuery(undefined, {
    skip: isEditing || !value.trim(),
  });
  const mode = query.data?.[field] ?? AcademicTextCase.Default;
  const preview = useAcademicFormatPreview(
    value,
    mode,
    isEditing || !value.trim() || !query.data || query.isError
  );
  if (isEditing || !value.trim()) return undefined;
  if (query.isLoading) return 'Loading name format…';
  if (query.isError) return 'School formatting will be applied when saved.';
  if (mode === AcademicTextCase.Default) return undefined;
  if (preview.isLoading) return 'Loading name format…';
  if (preview.isError)
    return 'Name preview is unavailable. School formatting will be applied when saved.';
  return `Will be saved as: ${preview.value}`;
}
