import type { ReservationMember } from 'src/redux/library/reservation-types';

import { useRef, useState, useEffect } from 'react';
import { Stack, Alert, Button, TextField } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useLazyResolveReservationMemberQuery } from 'src/redux/library/reservations-api';

export function ReservationMemberScan({
  academicYearId,
  value,
  onChange,
  onSelect,
  disabled,
  error,
  onBlur,
}: {
  academicYearId: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (member: ReservationMember | null) => void;
  disabled: boolean;
  error?: string;
  onBlur: () => void;
}) {
  const [resolve, result] = useLazyResolveReservationMemberQuery();
  const sequence = useRef(0);
  const [failure, setFailure] = useState('');
  useEffect(
    () => () => {
      sequence.current += 1;
    },
    [academicYearId]
  );
  const lookup = async () => {
    if (disabled || !value.trim() || !academicYearId) return;
    sequence.current += 1;
    const request = sequence.current;
    onSelect(null);
    setFailure('');
    try {
      const member = await resolve({ academicYearId, identifier: value.trim() }, false).unwrap();
      if (request !== sequence.current) return;
      if (member.isEligibleForReservation) onSelect(member);
      else
        setFailure(member.ineligibilityReason || 'This member is not eligible to reserve a book.');
    } catch (cause) {
      if (request === sequence.current)
        setFailure(
          parseApiProblemDetail(cause).detail || 'Could not resolve this printed member ID.'
        );
    }
  };
  return (
    <Stack spacing={1}>
      <TextField
        label="Printed member ID"
        name="memberScan"
        required
        fullWidth
        size="small"
        value={value}
        disabled={disabled}
        inputProps={{ maxLength: 100 }}
        onChange={(event) => {
          sequence.current += 1;
          setFailure('');
          onSelect(null);
          onChange(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            lookup();
          }
        }}
        onBlur={onBlur}
        error={Boolean(error)}
        helperText={error || 'Scan or enter the exact printed ID, then press Enter.'}
      />
      <Button
        type="button"
        variant="outlined"
        color="inherit"
        disabled={disabled || !value.trim()}
        loading={result.isFetching}
        onClick={lookup}
      >
        Look up member
      </Button>
      {failure && <Alert severity="error">{failure}</Alert>}
    </Stack>
  );
}
