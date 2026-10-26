import type { RootState } from 'src/redux/store';
import type { InstituteFormattingScope } from 'src/redux/InstituteSetup/institute-field-formatting-api';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { AcademicTextCase } from 'src/components/academic-setup/academic-field-formatting-model';
import { useAcademicFormatPreview } from 'src/components/academic-setup/use-academic-format-preview';
import { useGetInstituteFieldFormattingQuery } from 'src/redux/InstituteSetup/institute-field-formatting-api';

import { INSTITUTE_FORMATTING_CONFIG } from './formatting-config';

export function useInstituteFieldPreview(
  scope: InstituteFormattingScope,
  field: string,
  value: string,
  isEditing = false
): string | undefined {
  const canView = useSelector(
    (state: RootState) =>
      state.auth?.permissionsInitialized &&
      hasGrantedPermission(
        state.auth.permissions,
        INSTITUTE_FORMATTING_CONFIG[scope].viewPermission
      )
  );
  const disabled = isEditing || !value.trim() || !canView;
  const query = useGetInstituteFieldFormattingQuery(scope, { skip: disabled });
  const mode = query.data?.fields[field] ?? AcademicTextCase.Default;
  const preview = useAcademicFormatPreview(
    value,
    mode,
    disabled || !query.data || query.isError,
    scope
  );
  if (disabled) return undefined;
  if (query.isLoading) return 'Loading field format…';
  if (query.isError) return 'School formatting will be applied when saved.';
  if (mode === AcademicTextCase.Default) return undefined;
  if (preview.isLoading) return 'Loading field format…';
  if (preview.isError)
    return 'Preview is unavailable. School formatting will be applied when saved.';
  const label =
    INSTITUTE_FORMATTING_CONFIG[scope].fields.find((item) => item.key === field)?.previewLabel ??
    'Will be saved as';
  return `${label}: ${preview.value}`;
}
