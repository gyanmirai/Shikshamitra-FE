import { useState } from 'react';
import { TextField, CircularProgress } from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';

import { useFormInheritance } from '../hooks/use-form-inheritance';
import { getAdmissionDefinitionLabel } from '../../admission-definition-select';

import type { AdmissionDefinitionOption } from '../../use-admission-definition-options';

type SourceOption = AdmissionDefinitionOption & { savedLabel?: string };
const labelFor = (option: SourceOption) => option.savedLabel ?? getAdmissionDefinitionLabel(option);
const filterSources = createFilterOptions<SourceOption>({ stringify: labelFor });

/** One identity-based picker for saved versions, retained connections and published choices. */
export function InquirySourcePicker() {
  const inheritance = useFormInheritance()!;
  const [selected, setSelected] = useState<SourceOption | null>(null);
  const saved = (inheritance.formik.values.inheritance?.sources ?? []).map((source, index) => ({
    id: source.inquiryFormDefinitionId,
    name: '',
    version: 0,
    savedLabel: `Saved Inquiry ${index + 1}`,
  }));
  const retained: SourceOption[] = inheritance.canViewSources
    ? inheritance.connected.map((source) => ({
        id: source.inquiryFormDefinitionId,
        name: source.name,
        version: source.version,
      }))
    : [];
  const current = inheritance.canViewSources ? inheritance.source : undefined;
  const available = new Map<string, SourceOption>([
    ...saved.map((source) => [source.id, source] as const),
    ...retained.map((source) => [source.id, source] as const),
    ...(selected && inheritance.canViewSources ? [[selected.id, selected] as const] : []),
    ...(current ? [[current.id, current] as const] : []),
  ]);
  const value = inheritance.sourceId ? (available.get(inheritance.sourceId) ?? null) : null;

  // Mount the remote picker only when its controller supplies the real source loader.
  // Its initial empty-query request must not consume the provider's placeholder callback.
  if (inheritance.initializingSources) {
    return (
      <TextField
        label="Preview using Inquiry form"
        fullWidth
        size="small"
        disabled
        slotProps={{
          input: {
            endAdornment: <CircularProgress size={20} aria-label="Loading Inquiry forms" />,
          },
        }}
      />
    );
  }

  return (
    <PaginatedSearchSelect<SourceOption>
      label="Preview using Inquiry form"
      name="inquiryPreviewSource"
      fullWidth
      size="small"
      minChars={0}
      debounceMs={300}
      value={value}
      disabled={inheritance.formik.isSubmitting}
      isLoading={inheritance.sourceLoading}
      loadingLabel="Loading Inquiry forms"
      fetchOptions={
        inheritance.canViewSources
          ? inheritance.fetchSources
          : async () => ({ data: [], hasMore: false })
      }
      getOptionLabel={labelFor}
      getOptionKey={(option) => option.id}
      isOptionEqualToValue={(option, selectedOption) => option.id === selectedOption.id}
      filterOptions={(options, state) =>
        filterSources(
          [
            ...new Map([
              ...available,
              ...(inheritance.canViewSources
                ? options.map((option) => [option.id, option] as const)
                : []),
            ]).values(),
          ],
          state
        )
      }
      onChange={(_, option) => {
        setSelected(option);
        inheritance.selectSource(option?.id ?? null);
      }}
      error={inheritance.sourceFailed}
      helperText={
        inheritance.sourceFailed
          ? 'Inquiry information is unavailable. Your question adjustments are preserved.'
          : undefined
      }
      noOptionsText={
        inheritance.canViewSources ? 'No matching Inquiry forms found' : 'No saved Inquiry forms'
      }
    />
  );
}
