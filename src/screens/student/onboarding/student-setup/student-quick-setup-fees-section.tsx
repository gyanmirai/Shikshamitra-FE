'use client';

import type { ReactNode } from 'react';

import { useState, useEffect } from 'react';
import { Label } from 'src/components/label';
import { Stack, Skeleton, Typography } from '@mui/material';

import StudentQuickSetupSection from './student-quick-setup-section';

import type { StudentOnboardingFeesState } from './student-onboarding-fees';

export default function StudentQuickSetupFeesSection({
  caseId,
  state,
  disabled,
  initiallyExpanded = false,
  children,
}: {
  caseId: string;
  state: StudentOnboardingFeesState;
  disabled: boolean;
  initiallyExpanded?: boolean;
  children: ReactNode;
}) {
  const [opened, setOpened] = useState(initiallyExpanded);
  useEffect(() => setOpened(initiallyExpanded), [caseId, initiallyExpanded]);
  useEffect(() => {
    if (state.hasError || state.dirty) setOpened(true);
  }, [caseId, state.dirty, state.hasError]);
  return (
    <StudentQuickSetupSection
      title="Fees"
      icon="mdi:receipt-text-outline"
      help="Fee assignment and payment are optional for activation. Review fees and receipts here."
      expanded={opened}
      onExpandedChange={setOpened}
      disabled={disabled}
      toggleName="fees"
      summary={
        state.loading && !state.hasError ? (
          <Skeleton width="80%" sx={{ maxWidth: 240 }} />
        ) : (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="flex-end"
            useFlexGap
            flexWrap="wrap"
          >
            {!state.hasError && (
              <Label color={state.confirmed ? 'success' : 'warning'}>
                {state.confirmed ? 'Confirmed' : 'Fees pending'}
              </Label>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
              {state.hasError
                ? 'Review fees'
                : state.collectionDeferred
                  ? 'Collection deferred from Admissions'
                  : state.structureName || 'Not assigned'}
            </Typography>
          </Stack>
        )
      }
    >
      {children}
    </StudentQuickSetupSection>
  );
}
