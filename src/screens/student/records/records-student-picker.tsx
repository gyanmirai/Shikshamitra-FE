import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';

import { useMemo, useState, useCallback } from 'react';
import { useDebounceEffect } from 'src/hooks/use-debounce';
import { Alert, Stack, Button, TextField, Autocomplete } from '@mui/material';
import { useGetStudentRecordsDirectoryQuery } from 'src/redux/student/records/student-records-api';

export default function RecordsStudentPicker({
  onSelect,
  disabled = false,
  selectedId,
  size = 'medium',
  helperText = 'Search across active and former records.',
}: {
  onSelect: (student: StudentDirectoryItem | null) => void;
  disabled?: boolean;
  selectedId?: string;
  size?: 'small' | 'medium';
  helperText?: string | null;
}) {
  const [localSelection, setLocalSelection] = useState<StudentDirectoryItem | null>(null);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const debounceSearch = useCallback(() => setDebounced(search), [search]);
  const debounceDeps = useMemo(() => [search], [search]);
  useDebounceEffect(debounceSearch, 350, debounceDeps);
  const query = useGetStudentRecordsDirectoryQuery({
    search: debounced,
    population: 'All',
    maxResultCount: 100,
  });
  const selectedQuery = useGetStudentRecordsDirectoryQuery(
    { studentId: selectedId, population: 'All', maxResultCount: 1 },
    { skip: !selectedId }
  );
  const selection =
    selectedId !== undefined
      ? (selectedQuery.currentData?.items.find((item) => item.studentId === selectedId) ??
        (selectedQuery.isFetching && localSelection?.studentId === selectedId
          ? localSelection
          : null))
      : localSelection;
  return (
    <Stack spacing={1}>
      <Autocomplete
        size={size}
        value={selection}
        options={query.currentData?.items ?? []}
        loading={query.isFetching || selectedQuery.isFetching}
        disabled={disabled}
        filterOptions={(options) => options}
        isOptionEqualToValue={(left, right) => left.studentId === right.studentId}
        getOptionLabel={(student) =>
          `${[student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') || 'Restricted identity'}${student.grNumber ? ` · ${student.grNumber}` : ''}`
        }
        onInputChange={(_event, value, reason) => {
          if (reason === 'input' || reason === 'clear') setSearch(value);
        }}
        onChange={(_event, value) => {
          setLocalSelection(value);
          onSelect(value);
        }}
        noOptionsText="No eligible students match. Search by name or GR number."
        renderInput={(params) => (
          <TextField
            {...params}
            label="Student"
            helperText={helperText}
            placeholder={size === 'small' ? 'Search name or GR number' : undefined}
          />
        )}
      />
      {selectedQuery.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => selectedQuery.refetch()}>
              Retry
            </Button>
          }
        >
          The selected student could not be restored.
        </Alert>
      )}
      {query.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        >
          Student choices could not be loaded.
        </Alert>
      )}
    </Stack>
  );
}
