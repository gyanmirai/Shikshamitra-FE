import type { AdmissionReviewerChoice } from 'src/redux/student/admissions/admission-review-settings-api';

import { useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import { Stack, Button, TextField } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';
import { useGetAdmissionReviewersQuery } from 'src/redux/student/admissions/admission-review-settings-api';

export function ReviewAssigneeSelect({
  value,
  role,
  disabled,
  available,
  onChange,
  label = 'Default assigned reviewer (optional)',
  emptyLabel = 'Assign when reviewing the applicant',
  savedName,
}: {
  value: string | null;
  role: string | null;
  disabled: boolean;
  available: boolean;
  label?: string;
  emptyLabel?: string;
  savedName?: string | null;
  onChange: (id: string | null) => void;
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<AdmissionReviewerChoice | null>(null);
  const query = useGetAdmissionReviewersQuery(
    { filter, role: role || undefined },
    { skip: !available }
  );
  const options = query.currentData ?? [];
  const selectedOption =
    options.find((item) => item.id === value) ?? (selected?.id === value ? selected : null);
  return (
    <Stack spacing={1}>
      {!disabled && (
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            size="small"
            label="Find a reviewer"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            slotProps={{ htmlInput: { maxLength: 128 } }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              event.stopPropagation();
              setFilter(search.trim());
            }}
          />
          <Button size="small" variant="outlined" onClick={() => setFilter(search.trim())}>
            Search
          </Button>
        </Stack>
      )}
      <CustomSelect
        fullWidth
        size="small"
        label={label}
        value={value ?? ''}
        disabled={disabled || query.isFetching}
        options={[
          { value: '', label: emptyLabel },
          ...options.map((item) => ({
            value: item.id,
            label: `${item.name || item.userName} (${item.userName})`,
          })),
          ...(value && !options.some((item) => item.id === value)
            ? [
                {
                  value,
                  label: selectedOption
                    ? `${selectedOption.name || selectedOption.userName} (${selectedOption.userName})`
                    : savedName || 'Saved reviewer (not in these results)',
                },
              ]
            : []),
        ]}
        onChange={(id) => {
          setSelected(options.find((item) => item.id === id) ?? null);
          onChange(id ? String(id) : null);
        }}
        helperText={
          query.isFetching
            ? 'Loading reviewers…'
            : 'The assigned reviewer must have access to each applicant and match the selected role.'
        }
      />
      {query.isError && (
        <StudentFeedback
          notificationKey="STU-0526"
          presentation="toast"
          severity="error"
          action={
            <Button size="small" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        >
          Reviewer choices could not be loaded. Your saved selection is preserved.
        </StudentFeedback>
      )}
      {available && !query.isFetching && !query.isError && !options.length && (
        <StudentFeedback notificationKey="STU-0527" presentation="inline" severity="info">
          No reviewers match these choices. Try another search or assign a reviewer later.
        </StudentFeedback>
      )}
    </Stack>
  );
}
