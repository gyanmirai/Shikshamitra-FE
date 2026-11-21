import type { LibraryLoan } from 'src/redux/library/circulation-types';

import { useRef } from 'react';
import { fDate } from 'src/utils/format-time';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Alert, Button } from '@mui/material';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { LookupFeedback } from './LookupFeedback';
import { useRenewalDraft } from './useRenewalDraft';
import { SchoolDateContext } from './SchoolDateContext';
import { LoanRenewalFields } from './LoanRenewalFields';
import { useCirculationBusy } from './useCirculationBusy';
import { SubmissionFeedback } from './SubmissionFeedback';
import { LoanMaintenanceFacts } from './LoanMaintenanceFacts';
import { CirculationFormFooter } from './CirculationFormFooter';
import { useCirculationErrorFocus } from './useCirculationErrorFocus';

import type { ExactLoanSession } from './useExactLoanSession';

export function LoanRenewalForm({
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
  const draft = useRenewalDraft(loan, session, allowed, onClose);
  const { formik, command, preview, busy } = draft;
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
            {(!allowed || loan.canRenew !== true || session.latest?.canRenew === false) && (
              <Alert severity="info">
                The current saved record does not permit renewal under your current access.
              </Alert>
            )}
            {!loan.schoolContext && (
              <Alert severity="warning">
                School context could not be confirmed. Reload the saved record for review.
              </Alert>
            )}
            <LoanMaintenanceFacts loan={loan} accessionNo={accessionNo} />
            <FormBusyRegion
              busy={busy || command.uncertain}
              showOverlay={false}
              label="Renewing loan"
            >
              <Stack spacing={2}>
                <SchoolDateContext
                  context={session.latest?.schoolContext || undefined}
                  disabled={disabled}
                  onUse={(value) => formik.setFieldValue('schoolRenewalDate', value)}
                />
                <LoanRenewalFields
                  loan={loan}
                  formik={formik}
                  disabled={disabled}
                  plan={preview.plan}
                />
              </Stack>
            </FormBusyRegion>
            {preview.fetching && (
              <Alert severity="info">Loading the current renewal preview…</Alert>
            )}
            {preview.error && <Alert severity="error">{preview.error}</Alert>}
            {preview.changed && (
              <Alert severity="warning">
                The renewal preview changed. Your entries are retained; refresh the preview to
                review the current calculation.
              </Alert>
            )}
            {preview.plan && (
              <Alert severity={preview.plan.canRenew ? 'info' : 'warning'}>
                {preview.plan.canRenew
                  ? `Proposed new due date: ${fDate(preview.plan.newSchoolDueDate)}.`
                  : preview.plan.blockedReasons.join(' ') || 'The preview does not permit renewal.'}
                {preview.plan.requiresCalendarChangeAcknowledgment &&
                  ` Review the current calendar (${preview.plan.currentSchoolTimeZoneId || 'unavailable'}) and explain the change.`}
              </Alert>
            )}
            <Button
              type="button"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.refresh} />}
              disabled={busy || command.uncertain || !allowed || !preview.hasInput}
              onClick={preview.refresh}
            >
              Refresh preview
            </Button>
          </Stack>
        </DialogScrollContent>
        <CirculationFormFooter
          busy={busy}
          blockClose={command.uncertain}
          disabled={!draft.canSubmit || busy}
          label={command.uncertain ? 'Retry same submission' : 'Renew'}
          onCancel={() => onClose()}
        />
      </Box>
    </BackPopUpChecked>
  );
}
