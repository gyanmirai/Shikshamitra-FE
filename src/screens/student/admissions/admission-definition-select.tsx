import type { ReactNode } from 'react';

import { useState } from 'react';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';

import type {
  AdmissionDefinitionOption,
  AdmissionDefinitionFetcher,
} from './use-admission-definition-options';

type Props = {
  label: string;
  name?: string;
  required?: boolean;
  valueId: string | null;
  initialOption?: AdmissionDefinitionOption | null;
  fetchOptions: AdmissionDefinitionFetcher;
  onChange: (id: string | null) => void;
  onBlur?: () => void;
  disabled?: boolean;
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
  name,
  required,
  valueId,
  initialOption,
  fetchOptions,
  onChange,
  onBlur,
  disabled,
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
      name={name}
      required={required}
      loadingLabel={`Loading ${label.toLowerCase()}`}
      value={value}
      disabled={disabled}
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
      onBlur={onBlur}
      helperText={helperText}
      noOptionsText={noOptionsText}
    />
  );
}
