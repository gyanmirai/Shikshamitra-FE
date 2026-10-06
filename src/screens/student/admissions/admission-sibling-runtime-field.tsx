'use client';

import ShakingTextField from 'src/components/shaking-text-field';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { useLazyGetAdmissionFormOptionsQuery } from 'src/redux/student/admissions/admission-forms-api';

import type { AdmissionRuntimeFieldProps } from './admission-runtime-field';

const PAGE_SIZE = 20;
const MAX_SIBLINGS = 20;
type StudentOption = { id: string; label: string };

export function isAdmissionSiblingField(field: AdmissionRuntimeFieldProps['field']) {
  if (field.bindingKey === 'Family.SiblingStudentIds') return true;
  try {
    return JSON.parse(field.optionsJson || '{}').source === 'StudentSiblings';
  } catch {
    return false;
  }
}

function readSiblingIds(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value || '[]');
    return Array.isArray(parsed)
      ? [...new Set(parsed.filter((id): id is string => typeof id === 'string'))].slice(
          0,
          MAX_SIBLINGS
        )
      : [];
  } catch {
    return [];
  }
}

export function AdmissionSiblingRuntimeField({
  field,
  value,
  disabled,
  error,
  onChange,
  onBlur,
}: AdmissionRuntimeFieldProps) {
  const [loadOptions] = useLazyGetAdmissionFormOptionsQuery();
  const [labels, setLabels] = useState<Record<string, string>>({});
  const labelCache = useRef<Record<string, string>>({});
  const [hydrating, setHydrating] = useState(false);
  const [lookupError, setLookupError] = useState<string>();
  const selectedKey = JSON.stringify(readSiblingIds(value));
  const selectedIds = useMemo<string[]>(() => JSON.parse(selectedKey), [selectedKey]);
  const selectedOptionsKey = JSON.stringify(
    selectedIds.map((id) => ({
      id,
      label: labels[id] || (hydrating ? 'Loading student…' : 'Student unavailable'),
    }))
  );
  // Autocomplete resets its search when the controlled selection changes identity.
  // Search-result label updates must not recreate an unchanged selection.
  const selectedOptions = useMemo<StudentOption[]>(
    () => JSON.parse(selectedOptionsKey),
    [selectedOptionsKey]
  );

  const rememberOptions = useCallback((options: StudentOption[]) => {
    labelCache.current = {
      ...labelCache.current,
      ...Object.fromEntries(options.map((option) => [option.id, option.label])),
    };
    setLabels(labelCache.current);
  }, []);

  useEffect(() => {
    const missingIds = selectedIds.filter((id) => !labelCache.current[id]);
    if (!missingIds.length) {
      setHydrating(false);
      return undefined;
    }
    let cancelled = false;
    setHydrating(true);
    loadOptions({
      sourceKey: 'StudentSiblings',
      selectedIds: missingIds,
      maxResultCount: MAX_SIBLINGS,
    })
      .unwrap()
      .then((options) => {
        if (!cancelled) {
          rememberOptions(options.map((option) => ({ id: option.value, label: option.label })));
          setLookupError(undefined);
        }
      })
      .catch(() => {
        if (!cancelled)
          setLookupError('Selected students could not be loaded. Search again to retry.');
      })
      .finally(() => {
        if (!cancelled) setHydrating(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadOptions, rememberOptions, selectedIds]);

  const fetchOptions = useCallback(
    async (query: string, page: number) => {
      try {
        const options = await loadOptions({
          sourceKey: 'StudentSiblings',
          searchTerm: query.trim(),
          skipCount: (page - 1) * PAGE_SIZE,
          maxResultCount: PAGE_SIZE + 1,
        }).unwrap();
        const data = options.slice(0, PAGE_SIZE).map((option) => ({
          id: option.value,
          label: option.label,
        }));
        rememberOptions(data);
        setLookupError(undefined);
        return { data, hasMore: options.length > PAGE_SIZE };
      } catch (cause) {
        setLookupError('Student search could not be loaded. Try searching again.');
        throw cause;
      }
    },
    [loadOptions, rememberOptions]
  );

  return (
    <ShakingTextField error={Boolean(error || lookupError)}>
      <PaginatedSearchSelect<StudentOption, true>
        fullWidth
        size="small"
        multiple
        filterSelectedOptions
        disabled={disabled || hydrating}
        isLoading={hydrating}
        loadingLabel="Loading sibling students"
        label={`${field.label}${field.required ? ' *' : ''}`}
        placeholder={field.placeholder || 'Search students'}
        helperText={
          error ||
          lookupError ||
          field.helpText ||
          'Search by student name or GR number. Select up to 20 siblings.'
        }
        error={Boolean(error || lookupError)}
        value={selectedOptions}
        fetchOptions={fetchOptions}
        minChars={2}
        debounceMs={400}
        filterOptions={(options) => options}
        getOptionKey={(option) => option.id}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, selected) => option.id === selected.id}
        getOptionDisabled={(option) =>
          selectedIds.length >= MAX_SIBLINGS && !selectedIds.includes(option.id)
        }
        onBlur={onBlur}
        onChange={(_, selected) => {
          onChange(JSON.stringify(selected.map((option) => option.id)));
          onBlur?.();
        }}
      />
    </ShakingTextField>
  );
}
