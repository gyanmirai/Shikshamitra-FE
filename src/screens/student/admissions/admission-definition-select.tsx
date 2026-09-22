import type { ReactNode } from 'react';

import { useState } from 'react';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';

import type {
  AdmissionDefinitionOption,
  AdmissionDefinitionFetcher,
} from './use-admission-definition-options';

type Props = {
  label: string;
  valueId: string | null;
  initialOption?: AdmissionDefinitionOption | null;
  fetchOptions: AdmissionDefinitionFetcher;
  onChange: (id: string | null) => void;
  error?: boolean;
  helperText?: ReactNode;
  noOptionsText: string;
};

export const getAdmissionDefinitionLabel = (option: AdmissionDefinitionOption) => {
  const versionSuffix = new RegExp(`(?:^|\\s)v${option.version}$`, 'i');
  return versionSuffix.test(option.name) ? option.name : `${option.name} · v${option.version}`;
};

export function AdmissionDefinitionSelect({
  label,
  valueId,
  initialOption,
  fetchOptions,
  onChange,
  error,
  helperText,
  noOptionsText,
}: Props) {
  const [selected, setSelected] = useState<AdmissionDefinitionOption | null>(
    initialOption?.id === valueId ? initialOption : null
  );
  const value =
    selected?.id === valueId ? selected : initialOption?.id === valueId ? initialOption : null;

  return (
    <PaginatedSearchSelect<AdmissionDefinitionOption>
      fullWidth
      size="small"
      label={label}
      loadingLabel={`Loading ${label.toLowerCase()}`}
      value={value}
      fetchOptions={fetchOptions}
      minChars={0}
      debounceMs={300}
      getOptionLabel={getAdmissionDefinitionLabel}
      getOptionKey={(option) => option.id}
      isOptionEqualToValue={(option, selectedOption) => option.id === selectedOption.id}
      onChange={(_, option) => {
        setSelected(option);
        onChange(option?.id ?? null);
      }}
      error={error}
      helperText={helperText}
      noOptionsText={noOptionsText}
    />
  );
}
