'use client';

import type { RootState } from 'src/redux/store';
import type { AdmissionFormOption } from 'src/redux/student/admissions/admission-forms-api';

import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { uuidv4 } from 'src/utils/uuidv4';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetAdmissionFormOptionsQuery } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionRuntimeFieldProps } from './admission-runtime-field';

import { parseRuntimeOptionsSource } from './application-detail/application-runtime-options';
import { academicOptionsJson } from './admission-academic-options';

/** Reads Institute Setup records through the owning Student API; labels never become IDs. */
export function AdmissionMasterDataRuntimeField({
  field,
  value,
  disabled,
  error,
  formValues,
  onChange,
  onBlur,
  academicYearId,
  academicMediumId,
}: AdmissionRuntimeFieldProps) {
  const selectedYear = useSelector((state: RootState) => state.globalState.currentYear?.id);
  const source = parseRuntimeOptionsSource(academicOptionsJson(field))!;
  const yearId = academicYearId ?? selectedYear;
  const parentId = source.parentField
    ? formValues?.[source.parentField]
    : source.source === 'Standards'
      ? academicMediumId
      : undefined;
  const requiresParent = source.source !== 'Standards' || Boolean(source.parentField);
  const ready = Boolean(yearId && (!requiresParent || parentId));
  // Returning to a parent while its older request is pending needs a new check.
  // Keep this out of the HTTP contract; it only isolates the RTK cache entry.
  const queryScope = useMemo(
    () => ({
      sourceKey: source.source,
      parentId,
      academicYearId: yearId,
      optionsCheckId: parentId ? uuidv4() : undefined,
    }),
    [source.source, parentId, yearId]
  );
  const query: ReturnType<typeof useGetAdmissionFormOptionsQuery> = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAdmissionFormOptionsQuery,
    params: queryScope,
    options: { skip: !ready },
    popupConfig: { errorMessage: 'Could not load Institute Setup options.' },
  });
  const choices: AdmissionFormOption[] =
    ready && !query.isError
      ? [
          ...((query.currentData ?? []) as AdmissionFormOption[]).filter(
            (option) => option.isActive
          ),
        ]
      : [];
  const selected = field.fieldType === 7 ? readMultiple(value) : [value];
  selected.filter(Boolean).forEach((id) => {
    if (!choices.some((option) => option.value === id))
      choices.push({
        value: id,
        label: savedLabel(field.optionsJson, id) ?? (disabled ? id : 'Saved value unavailable'),
        displayOrder: choices.length,
        isActive: false,
      });
  });
  const loading = ready && (query.isFetching || query.isUninitialized);
  return (
    <ShakingTextField error={Boolean(error)}>
      <CustomSelect
        name={field.code}
        label={field.label}
        required={field.required}
        fullWidth
        size="small"
        isSearch
        multiple={field.fieldType === 7}
        value={field.fieldType === 7 ? selected : value}
        options={choices}
        labelKey="label"
        valueKey="value"
        isLoading={loading}
        disabled={disabled || !ready || query.isError || loading}
        disabledValues={choices.filter((option) => !option.isActive).map((option) => option.value)}
        disabledLabel="Unavailable"
        noOptionsMessage="No options configured in Institute Setup"
        error={Boolean(error)}
        helperText={
          error ||
          (!yearId
            ? 'Select an academic year.'
            : requiresParent && !parentId
              ? 'Select the parent academic field first.'
              : field.helpText || undefined)
        }
        onBlur={onBlur}
        onChange={(nextValue) =>
          onChange(Array.isArray(nextValue) ? JSON.stringify(nextValue) : String(nextValue))
        }
      />
    </ShakingTextField>
  );
}

function savedLabel(optionsJson: string | null | undefined, value: string): string | undefined {
  try {
    const options: unknown = JSON.parse(optionsJson || '[]');
    if (!Array.isArray(options)) return undefined;
    const option = options.find((item) =>
      typeof item === 'string' ? item === value : item?.value === value
    );
    return typeof option === 'string'
      ? option
      : typeof option?.label === 'string'
        ? option.label
        : undefined;
  } catch {
    return undefined;
  }
}

function readMultiple(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value || '[]');
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}
