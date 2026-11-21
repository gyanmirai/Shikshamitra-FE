import type { LibraryLoan } from 'src/redux/library/circulation-types';

import { useRef } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Box, Grid, Stack, Alert } from '@mui/material';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { DialogScrollContent } from 'src/components/customDialog';
import { FormSectionCard } from 'src/components/form-section-card';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { LookupFeedback } from './LookupFeedback';
import { useDateReviewDraft } from './useDateReviewDraft';
import { useCirculationBusy } from './useCirculationBusy';
import { SubmissionFeedback } from './SubmissionFeedback';
import { CirculationDateField } from './CirculationDateField';
import { LoanMaintenanceFacts } from './LoanMaintenanceFacts';
import { LoanMaintenanceReason } from './LoanMaintenanceReason';
import { CirculationFormFooter } from './CirculationFormFooter';
import { useCirculationErrorFocus } from './useCirculationErrorFocus';
import { reviewDateLabels, eligibleReviewFields } from './loan-review-fields';

import type { ExactLoanSession } from './useExactLoanSession';

export function LoanDateReviewForm({
  loan,
  session,
  allowed,
  accessionNo,
  onClose,
  onBusyChange,
  onReload,
}: {
  loan: LibraryLoan;
  session: ExactLoanSession;
  allowed: boolean;
  accessionNo: string;
  onClose: (event?: unknown, submitted?: boolean) => void;
  onBusyChange: (value: boolean) => void;
  onReload?: () => void;
}) {
  const draft = useDateReviewDraft(loan, session, allowed, onClose);
  const { formik, command, busy } = draft;
  const fields = eligibleReviewFields(loan);
  const root = useRef<HTMLFormElement>(null);
  useCirculationBusy(busy || command.uncertain, onBusyChange);
  useCirculationErrorFocus(formik, root);
  const disabled = busy || command.uncertain || !allowed || !draft.current;
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box
        component="form"
        ref={root}
        onSubmit={formik.handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            <SubmissionFeedback
              uncertain={command.uncertain}
              needsReview={command.conflict || session.changed}
              busy={busy}
              onReview={() => onReload?.()}
            />
            {command.error && <Alert severity="error">{command.error}</Alert>}
            <LookupFeedback
              label="current saved loan"
              pending={session.fetching}
              error={session.error}
              onRetry={session.retry}
              retryLabel="Retry current record"
              retryDisabled={!allowed || busy || command.uncertain || session.fetching}
            />
            <LoanMaintenanceFacts loan={loan} accessionNo={accessionNo} />
            {!fields.length || loan.canReviewDates !== true ? (
              <Alert severity="info">
                No school dates are available for review under your current access and this saved
                record.
              </Alert>
            ) : (
              <FormBusyRegion
                busy={busy || command.uncertain}
                showOverlay={false}
                label="Confirming school dates"
              >
                <FormSectionCard
                  title="School Date Evidence"
                  icon={GlobalIcons.calendar}
                  descriptionTooltip="Enter at least one offered date from school evidence. Explicit transaction dates and the saved original due date remain unchanged."
                >
                  <Grid container spacing={2}>
                    {fields.map((field) => (
                      <Grid key={field} size={{ xs: 12, sm: 6 }}>
                        <CirculationDateField
                          name={field}
                          label={reviewDateLabels[field]}
                          value={formik.values[field]}
                          disabled={disabled}
                          required={fields.length === 1}
                          error={formik.touched[field] && formik.errors[field]}
                          onChange={(value) => formik.setFieldValue(field, value)}
                          onBlur={() => formik.setFieldTouched(field, true)}
                        />
                      </Grid>
                    ))}
                    <Grid size={12}>
                      <LoanMaintenanceReason
                        name="reason"
                        label="Review reason"
                        required
                        value={formik.values.reason}
                        disabled={disabled}
                        error={formik.touched.reason && formik.errors.reason}
                        onChange={(value) => formik.setFieldValue('reason', value)}
                        onBlur={() => formik.setFieldTouched('reason', true)}
                      />
                    </Grid>
                  </Grid>
                </FormSectionCard>
              </FormBusyRegion>
            )}
          </Stack>
        </DialogScrollContent>
        <CirculationFormFooter
          busy={busy}
          blockClose={command.uncertain}
          disabled={!draft.canSubmit || busy}
          label={command.uncertain ? 'Retry same submission' : 'Confirm dates'}
          onCancel={() => onClose()}
        />
      </Box>
    </BackPopUpChecked>
  );
}
