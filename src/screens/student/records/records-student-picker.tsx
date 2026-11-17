import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';

import { useDebounceEffect } from 'src/hooks/use-debounce';
import { StudentFeedback } from 'src/components/student-feedback';
import { Stack, Button, TextField, Autocomplete } from '@mui/material';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useGetStudentRecordsDirectoryQuery } from 'src/redux/student/records/student-records-api';

export default function RecordsStudentPicker({
  onSelect,
  disabled = false,
  selectedId,
  includeActiveStudentList = false,
  toastRecovery = false,
  size = 'medium',
  helperText = 'Search across active and former records.',
  academicYearId,
  onSearchInput,
  label = 'Student',
  placeholder,
}: {
  onSelect: (student: StudentDirectoryItem | null) => void;
  disabled?: boolean;
  selectedId?: string;
  includeActiveStudentList?: boolean;
  toastRecovery?: boolean;
  size?: 'small' | 'medium';
  helperText?: string | null;
  academicYearId?: string;
  onSearchInput?: () => void;
  label?: string;
  placeholder?: string;
}) {
  const [localSelection, setLocalSelection] = useState<StudentDirectoryItem | null>(null);
  const [search, setSearch] = useState('');
  const [inputText, setInputText] = useState('');
  const typing = useRef(false);
  const displayedStudentId = useRef('');
  const [debounced, setDebounced] = useState('');
  const debounceSearch = useCallback(() => setDebounced(search), [search]);
  const debounceDeps = useMemo(() => [search], [search]);
  useDebounceEffect(debounceSearch, 350, debounceDeps);
  const query = useGetStudentRecordsDirectoryQuery({
    search: debounced,
    population: 'All',
    includeActiveStudentList,
    academicYearId,
    maxResultCount: 100,
  });
  const selectedQuery = useGetStudentRecordsDirectoryQuery(
    {
      studentId: selectedId,
      academicYearId,
      population: 'All',
      includeActiveStudentList,
      maxResultCount: 1,
    },
    { skip: !selectedId }
  );
  const selection =
    selectedId !== undefined
      ? (selectedQuery.currentData?.items.find((item) => item.studentId === selectedId) ??
        (selectedQuery.isFetching && localSelection?.studentId === selectedId
          ? localSelection
          : null))
      : localSelection;
  const studentLabel = (student: StudentDirectoryItem) =>
    `${[student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') || 'Restricted identity'}${student.grNumber ? ` · ${student.grNumber}` : ''}`;
  useEffect(() => {
    if (!selectedId) displayedStudentId.current = '';
    else if (onSearchInput && selection && displayedStudentId.current !== selectedId) {
      displayedStudentId.current = selectedId;
      typing.current = false;
      setInputText(studentLabel(selection));
    }
  }, [selectedId, selection, onSearchInput]);
  const selectedRecovery = (
    <Button color="inherit" onClick={() => selectedQuery.refetch()}>
      Retry
    </Button>
  );
  const choicesRecovery = (
    <Button color="inherit" onClick={() => query.refetch()}>
      Retry
    </Button>
  );
  return (
    <Stack spacing={1}>
      <Autocomplete
        size={size}
        value={selection}
        inputValue={onSearchInput ? inputText : undefined}
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
        getOptionLabel={studentLabel}
        getOptionKey={(student) => student.studentId}
        getOptionDisabled={(student) =>
          includeActiveStudentList && (student.maskedFields ?? []).includes('Identity')
        }
        onInputChange={(_event, value, reason) => {
          if (reason === 'input' || reason === 'clear') {
            typing.current = reason === 'input';
            setInputText(value);
            setSearch(value);
            onSearchInput?.();
          } else if (!typing.current) {
            setInputText(value);
          }
        }}
        onChange={(_event, value) => {
          typing.current = false;
          if (onSearchInput) setInputText(value ? studentLabel(value) : '');
          setLocalSelection(value);
          onSelect(value);
        }}
        renderOption={(props, student) => {
          const { key, ...optionProps } = props;
          return (
            <li key={key} {...optionProps}>
              <Stack>
                <span>
                  {[student.firstName, student.middleName, student.lastName]
                    .filter(Boolean)
                    .join(' ') || 'Restricted identity'}
                </span>
                <span>
                  {student.grNumber || student.grNo || '—'} ·{' '}
                  {[student.standardName, student.divisionName].filter(Boolean).join(' / ') || '—'}
                </span>
              </Stack>
            </li>
          );
        }}
        noOptionsText={
          query.isError
            ? toastRecovery
              ? 'Students could not be loaded. Use Retry in the notification.'
              : 'Students could not be loaded. Use Retry below.'
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
            label={label}
            helperText={helperText}
            placeholder={placeholder ?? (size === 'small' ? 'Search name or GR number' : undefined)}
          />
        )}
      />
      {selectedQuery.isError && (
        <StudentFeedback
          notificationKey="STU-0823"
          presentation="toast"
          severity="error"
          action={!toastRecovery ? selectedRecovery : undefined}
          toastAction={toastRecovery ? selectedRecovery : undefined}
        >
          The selected student could not be restored.
        </StudentFeedback>
      )}
      {query.isError && (
        <StudentFeedback
          notificationKey="STU-0824"
          presentation="toast"
          severity="error"
          action={!toastRecovery ? choicesRecovery : undefined}
          toastAction={toastRecovery ? choicesRecovery : undefined}
        >
          Student choices could not be loaded.
        </StudentFeedback>
      )}
    </Stack>
  );
}
