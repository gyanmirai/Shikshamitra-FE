'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useMemo, useState, useCallback } from 'react';
import { useDebounceEffect } from 'src/hooks/use-debounce';
import { TextField, Autocomplete, CircularProgress } from '@mui/material';
import { useLazyGetFinanceAuditStudentLookupQuery } from 'src/redux/finance/audit/financeAuditApi';

import type { FinanceAuditStudentLookup } from '../types/financeAudit.types';

const MIN_SEARCH_LENGTH = 2;
const DEBOUNCE_MS = 300;

interface AuditStudentAutocompleteProps {
  studentId: string;
  selectedLabel: string;
  onSelect: (student: FinanceAuditStudentLookup | null) => void;
}

const AuditStudentAutocomplete = ({
  studentId,
  selectedLabel,
  onSelect,
}: AuditStudentAutocompleteProps) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [inputValue, setInputValue] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');
  const [lookup, { data: options = [], isFetching }] = useLazyGetFinanceAuditStudentLookupQuery();

  const selectedOption = useMemo<FinanceAuditStudentLookup | null>(() => {
    if (!studentId) return null;
    const fromOptions = options.find((o) => o.studentId === studentId);
    if (fromOptions) return fromOptions;
    if (selectedLabel) {
      return {
        studentId,
        displayName: selectedLabel.split(' · ')[0] ?? selectedLabel,
        label: selectedLabel,
      };
    }
    return null;
  }, [studentId, selectedLabel, options]);

  useDebounceEffect(
    () => {
      setDebouncedInput(inputValue);
    },
    DEBOUNCE_MS,
    [inputValue]
  );

  const runLookup = useCallback(
    (search: string) => {
      if (!currentYear?.id) return;
      const trimmed = search.trim();
      if (trimmed.length < MIN_SEARCH_LENGTH && !/^[0-9a-f-]{36}$/i.test(trimmed)) return;
      lookup({
        academicYearId: currentYear.id,
        search: trimmed,
        maxResultCount: 15,
      });
    },
    [currentYear?.id, lookup]
  );

  useDebounceEffect(
    () => {
      runLookup(debouncedInput);
    },
    DEBOUNCE_MS,
    [debouncedInput, runLookup]
  );

  return (
    <Autocomplete
      fullWidth
      size="small"
      value={selectedOption}
      inputValue={inputValue}
      onInputChange={(_e, value, reason) => {
        if (reason === 'reset' && selectedOption) {
          setInputValue(selectedOption.label);
          return;
        }
        setInputValue(value);
      }}
      onChange={(_e, value) => {
        onSelect(value);
        setInputValue(value?.label ?? '');
      }}
      options={options}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.studentId === value.studentId}
      loading={isFetching}
      noOptionsText={
        debouncedInput.trim().length < MIN_SEARCH_LENGTH
          ? 'Type at least 2 characters (name, GR, or roll)'
          : 'No students found — check spelling or try GR number'
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Student"
          placeholder="Search by name, GR, or roll"
          helperText="Student name? Use this field — not keyword search below."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isFetching ? <CircularProgress color="inherit" size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default AuditStudentAutocomplete;
