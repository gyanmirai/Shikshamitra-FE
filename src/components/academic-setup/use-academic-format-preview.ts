import type { InstituteFormattingScope } from 'src/redux/InstituteSetup/institute-field-formatting-api';

import { useGetAcademicNamePreviewQuery } from 'src/redux/InstituteSetup/academic-field-formatting-api';
import { useGetInstituteFieldPreviewQuery } from 'src/redux/InstituteSetup/institute-field-formatting-api';

import { formatAcademicName, requiresAcademicNamePreview } from './academic-field-formatting-model';

import type { AcademicTextCase } from './academic-field-formatting-model';

export function useAcademicFormatPreview(
  value: string,
  mode: AcademicTextCase,
  disabled = false,
  scope?: InstituteFormattingScope
): { value: string; isLoading: boolean; isError: boolean } {
  const needsServer = !disabled && requiresAcademicNamePreview(value, mode);
  const academic = useGetAcademicNamePreviewQuery(
    { value, textCase: mode },
    { skip: !needsServer || Boolean(scope) }
  );
  const institute = useGetInstituteFieldPreviewQuery(
    { scope: scope ?? 'buildings', value, textCase: mode },
    { skip: !needsServer || !scope }
  );
  const query = scope ? institute : academic;
  if (disabled) return { value: '', isLoading: false, isError: false };
  if (!needsServer)
    return { value: formatAcademicName(value, mode), isLoading: false, isError: false };
  return {
    value: query.isError ? '' : (query.currentData?.value ?? ''),
    isLoading: !query.currentData && !query.isError,
    isError: query.isError,
  };
}
