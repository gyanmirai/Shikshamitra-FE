import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';

import { useMemo, useState, useCallback } from 'react';
import { useDebounceEffect } from 'src/hooks/use-debounce';
import { StudentFeedback } from 'src/components/student-feedback';
import { Stack, Button, TextField, Autocomplete } from '@mui/material';
import { useGetStudentRecordsDirectoryQuery } from 'src/redux/student/records/student-records-api';

export default function RecordsStudentPicker({
  onSelect,
  disabled = false,
  selectedId,
  includeActiveStudentList = false,
  size = 'medium',
  helperText = 'Search across active and former records.',
}: {
  onSelect: (student: StudentDirectoryItem | null) => void;
  disabled?: boolean;
  selectedId?: string;
  includeActiveStudentList?: boolean;
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
    includeActiveStudentList,
    maxResultCount: 100,
  });
  const selectedQuery = useGetStudentRecordsDirectoryQuery(
    { studentId: selectedId, population: 'All', includeActiveStudentList, maxResultCount: 1 },
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
        loadingText="Loading students…"
        openOnFocus
        onOpen={() => {
          if (!query.isUninitialized && !query.isFetching) query.refetch();
        }}
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
        noOptionsText={
          query.isError
            ? 'Students could not be loaded. Use Retry below.'
            : includeActiveStudentList
              ? debounced
                ? 'No matching active or records-eligible student found.'
                : 'No active or records-eligible students are available.'
              : debounced
                ? 'No eligible student matches. Students in Student List may need onboarding or historical entry approval.'
                : 'No eligible student records are available. Complete onboarding or approve a historical entry first.'
        }
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
        <StudentFeedback
          notificationKey="STU-0823"
          presentation="toast"
          severity="error"
          action={
            <Button color="inherit" onClick={() => selectedQuery.refetch()}>
              Retry
            </Button>
          }
        >
          The selected student could not be restored.
        </StudentFeedback>
      )}
      {query.isError && (
        <StudentFeedback
          notificationKey="STU-0824"
          presentation="toast"
          severity="error"
          action={
            <Button color="inherit" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        >
          Student choices could not be loaded.
        </StudentFeedback>
      )}
    </Stack>
  );
}
