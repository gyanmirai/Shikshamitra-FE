import type { AdmissionCounsellorChoice } from 'src/redux/student/admissions/admission-inquiry-settings-api';

import { useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import { Alert, Stack, Button, TextField } from '@mui/material';
import { useGetAdmissionInquiryCounsellorsQuery } from 'src/redux/student/admissions/admission-inquiry-settings-api';

type Props = {
  value: string[];
  multiple?: boolean;
  disabled: boolean;
  available: boolean;
  label: string;
  onChange: (ids: string[]) => void;
};

export function InquiryCounsellorSelect({
  value,
  multiple = false,
  disabled,
  available,
  label,
  onChange,
}: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [saved, setSaved] = useState<AdmissionCounsellorChoice[]>([]);
  const query = useGetAdmissionInquiryCounsellorsQuery(filter, { skip: !available });
  const choices = query.currentData ?? [];
  const retained = value.filter((id) => !choices.some((choice) => choice.id === id));
  const options = [
    ...choices.map((choice) => ({
      value: choice.id,
      label: `${choice.name || choice.userName} (${choice.userName})`,
    })),
    ...retained.map((id) => ({
      value: id,
      label:
        saved.find((choice) => choice.id === id)?.name || 'Saved counsellor (not in these results)',
    })),
  ];
  return (
    <Stack spacing={1}>
      {!disabled && (
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            size="small"
            label="Find a counsellor"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            slotProps={{ htmlInput: { maxLength: 128 } }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                setFilter(search.trim());
              }
            }}
          />
          <Button size="small" variant="outlined" onClick={() => setFilter(search.trim())}>
            Search
          </Button>
        </Stack>
      )}
      {multiple ? (
        <CustomSelect
          multiple
          fullWidth
          size="small"
          label={label}
          value={value}
          options={options}
          disabled={disabled || query.isFetching}
          onChange={(ids) => {
            setSaved(choices);
            onChange(ids.map(String));
          }}
        />
      ) : (
        <CustomSelect
          fullWidth
          size="small"
          label={label}
          value={value[0] ?? ''}
          options={[{ value: '', label: 'Assign manually later' }, ...options]}
          disabled={disabled || query.isFetching}
          onChange={(id) => {
            setSaved(choices);
            onChange(id ? [String(id)] : []);
          }}
        />
      )}
      {query.isError && (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        >
          Counsellors could not be loaded. Saved selections are preserved.
        </Alert>
      )}
    </Stack>
  );
}
