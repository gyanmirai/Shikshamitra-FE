'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useRef, useMemo, useState } from 'react';
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
  const [lookup, { data: options = [], isFetching }] = useLazyGetFinanceAuditStudentLookupQuery();
  const previousSearchRef = useRef<string>('');

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

  // Single debounced effect for search - only call API when input actually changes
  useDebounceEffect(
    () => {
      if (!currentYear?.id) return;

      const trimmed = inputValue.trim();

      // Skip if search value hasn't changed
      if (trimmed === previousSearchRef.current) return;

      // Skip if input is too short and not a UUID
      if (trimmed.length < MIN_SEARCH_LENGTH && !/^[0-9a-f-]{36}$/i.test(trimmed)) return;

      previousSearchRef.current = trimmed;

      lookup({
        academicYearId: currentYear.id,
        search: trimmed,
        maxResultCount: 15,
      });
    },
    DEBOUNCE_MS,
    [inputValue, currentYear?.id, lookup]
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
      renderInput={(params) => (
        <TextField
          {...params}
          label="Student"
          helperText={
            inputValue.trim().length < MIN_SEARCH_LENGTH ? 'Type at least 2 characters' : ''
          }
          sx={{ '& .MuiInputBase-root': { height: 38 } }}
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
