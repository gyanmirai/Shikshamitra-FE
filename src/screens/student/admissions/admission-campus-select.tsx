import type { ReactNode } from 'react';
import type { AdmissionCampus } from 'src/redux/student/admissions/admission-campuses-api';

import { useState, useCallback } from 'react';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';

import type { AdmissionCampusFetcher } from './use-admission-campus-options';

type Props = {
  label: string;
  valueId: string | null;
  initialOption?: AdmissionCampus | null;
  allOption?: AdmissionCampus;
  fetchOptions: AdmissionCampusFetcher;
  onChange: (id: string | null) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: ReactNode;
};

const optionLabel = (option: AdmissionCampus) =>
  option.code ? `${option.name} · ${option.code}` : option.name;

export function AdmissionCampusSelect({
  label,
  valueId,
  initialOption,
  allOption,
  fetchOptions,
  onChange,
  disabled,
  error,
  helperText,
}: Props) {
  const [selected, setSelected] = useState<AdmissionCampus | null>(
    initialOption?.id === valueId ? initialOption : null
  );
  const value =
    selected?.id === valueId ? selected : initialOption?.id === valueId ? initialOption : null;
  const fetchCampusOptions = useCallback<AdmissionCampusFetcher>(
    async (query, page) => {
      if (!allOption) return fetchOptions(query, page);

      // The shared control resets its input to the selected label after selection.
      const search = query === allOption.name || (value && query === optionLabel(value)) ? '' : query;
      const result = await fetchOptions(search, page);
      return page === 1 && (!search || allOption.name.toLowerCase().includes(search.toLowerCase()))
        ? { ...result, data: [allOption, ...result.data] }
        : result;
    },
    [allOption, fetchOptions, value]
  );

  return (
    <PaginatedSearchSelect<AdmissionCampus>
      fullWidth
      size="small"
      label={label}
      loadingLabel={`Loading ${label.toLowerCase()}`}
      placeholder="Search Campus Name or Code"
      value={value}
      fetchOptions={fetchCampusOptions}
      filterOptions={allOption ? (options) => options : undefined}
      minChars={0}
      debounceMs={300}
      getOptionLabel={optionLabel}
      getOptionKey={(option) => option.id}
      isOptionEqualToValue={(option, selectedOption) => option.id === selectedOption.id}
      onChange={(_, option) => {
        setSelected(option);
        onChange(option?.id ?? null);
      }}
      disabled={disabled}
      error={error}
      helperText={helperText}
      noOptionsText={allOption ? 'No matching active campuses' : 'No active campuses found'}
    />
  );
}
