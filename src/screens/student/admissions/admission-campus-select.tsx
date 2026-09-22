import type { ReactNode } from 'react';
import type { AdmissionCampus } from 'src/redux/student/admissions/admission-campuses-api';

import { useState } from 'react';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';

import type { AdmissionCampusFetcher } from './use-admission-campus-options';

type Props = {
  label: string;
  valueId: string | null;
  initialOption?: AdmissionCampus | null;
  fetchOptions: AdmissionCampusFetcher;
  onChange: (id: string | null) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: ReactNode;
};

export function AdmissionCampusSelect({
  label,
  valueId,
  initialOption,
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

  return (
    <PaginatedSearchSelect<AdmissionCampus>
      fullWidth
      size="small"
      label={label}
      loadingLabel={`Loading ${label.toLowerCase()}`}
      placeholder="Search campus name or code"
      value={value}
      fetchOptions={fetchOptions}
      minChars={0}
      debounceMs={300}
      getOptionLabel={(option) => (option.code ? `${option.name} · ${option.code}` : option.name)}
      getOptionKey={(option) => option.id}
      isOptionEqualToValue={(option, selectedOption) => option.id === selectedOption.id}
      onChange={(_, option) => {
        setSelected(option);
        onChange(option?.id ?? null);
      }}
      disabled={disabled}
      error={error}
      helperText={helperText}
      noOptionsText="No active campuses found"
    />
  );
}
