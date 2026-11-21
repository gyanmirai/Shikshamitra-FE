import type { ReservationMember } from 'src/redux/library/reservation-types';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { Stack, Alert, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';

import { ReservationMemberScan } from './ReservationMemberScan';
import { reservationMemberLabel, ReservationMemberSearch } from './ReservationMemberSearch';

import type { ReservationFieldState } from './reservation-form';

export function ReservationMemberPicker({
  formik,
  selected,
  onSelect,
  academicYearId,
  disabled,
  defaultMethod = 'search',
}: {
  formik: ReservationFieldState;
  selected: ReservationMember | null;
  onSelect: (member: ReservationMember | null) => void;
  academicYearId: string;
  disabled: boolean;
  defaultMethod?: 'search' | 'scan';
}) {
  const [method, setMethod] = useState<'search' | 'scan'>(defaultMethod);
  const error = formik.touched.memberId ? formik.errors.memberId : undefined;
  const choose = (member: ReservationMember | null) => {
    onSelect(member);
    formik.setFieldValue('memberId', member?.id || '');
  };
  return (
    <FormSectionCard
      title="Member Selection"
      icon={GlobalIcons.studentProfile}
      descriptionTooltip="Choose a current eligible library member. Searching and scanning do not create a reservation."
    >
      <Stack spacing={1.5}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={method}
          disabled={disabled}
          aria-label="Reservation member lookup method"
          onChange={(_, value: 'search' | 'scan' | null) => {
            if (value) {
              setMethod(value);
              choose(null);
              formik.setFieldValue('memberScan', '');
            }
          }}
        >
          <ToggleButton value="search">Search</ToggleButton>
          <ToggleButton value="scan">Scan ID</ToggleButton>
        </ToggleButtonGroup>
        <ShakingTextField error={Boolean(error)}>
          {method === 'search' ? (
            <ReservationMemberSearch
              academicYearId={academicYearId}
              selected={selected}
              onSelect={choose}
              disabled={disabled}
              error={error}
              onBlur={() => formik.setFieldTouched('memberId', true)}
            />
          ) : (
            <ReservationMemberScan
              academicYearId={academicYearId}
              value={formik.values.memberScan}
              onChange={(value) => formik.setFieldValue('memberScan', value)}
              onSelect={choose}
              disabled={disabled}
              error={error}
              onBlur={() => formik.setFieldTouched('memberId', true)}
            />
          )}
        </ShakingTextField>
        {selected && (
          <Typography variant="body2">Selected: {reservationMemberLabel(selected)}</Typography>
        )}
        {selected && !selected.isEligibleForReservation && (
          <Alert severity="warning">
            {selected.ineligibilityReason || 'This member cannot reserve a book.'}
          </Alert>
        )}
      </Stack>
    </FormSectionCard>
  );
}
