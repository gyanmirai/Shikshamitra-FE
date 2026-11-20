import type { RootState } from 'src/redux/store';

import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Box, Alert, Stack } from '@mui/material';
import { hasGrantedPermission } from 'src/utils/permissions';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { DialogScrollContent } from 'src/components/customDialog';
import { FormSectionCard } from 'src/components/form-section-card';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { ScanField } from '../../../circulation/ScanField';
import { useReturnDraft } from '../../../circulation/useReturnDraft';
import { LookupFeedback } from '../../../circulation/LookupFeedback';
import { LoanBookDetails } from '../../../circulation/LoanBookDetails';
import { SchoolDateContext } from '../../../circulation/SchoolDateContext';
import { ReturnLoanDetails } from '../../../circulation/ReturnLoanDetails';
import { returnNeedsDateReason } from '../../../circulation/return-request';
import { useCirculationBusy } from '../../../circulation/useCirculationBusy';
import { SubmissionFeedback } from '../../../circulation/SubmissionFeedback';
import { UnknownLoanDatesField } from '../../../circulation/UnknownLoanDatesField';
import { ReturnConditionFields } from '../../../circulation/ReturnConditionFields';
import { CirculationFormFooter } from '../../../circulation/CirculationFormFooter';
import { ReturnAssessmentFields } from '../../../circulation/ReturnAssessmentFields';
import { useCirculationErrorFocus } from '../../../circulation/useCirculationErrorFocus';

import type { LibraryReturnTarget } from '../../../circulation/return-target';

export default function ReturnBookModal({
  onClose,
  accessionNo,
  onBusyChange,
  target,
}: {
  onClose: (event: unknown, submitted: boolean) => void;
  accessionNo?: string | null;
  onBusyChange?: (busy: boolean) => void;
  target?: LibraryReturnTarget;
}) {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canReturn =
    hasGrantedPermission(permissions, 'Library.IssueReturn.Return') &&
    hasGrantedPermission(permissions, 'Library.IssueReturn.View');
  const draft = useReturnDraft(accessionNo || '', canReturn, onClose, target);
  const { formik, lookup, busy, error, canSubmit, uncertain } = draft;
  const disabled = busy || uncertain || !canReturn;
  const item = lookup.currentData;
  const formRef = useRef<HTMLFormElement>(null);
  useCirculationErrorFocus(formik, formRef);
  useCirculationBusy(busy, onBusyChange);
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box
        component="form"
        ref={formRef}
        onSubmit={formik.handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}
      >
        <DialogScrollContent>
          <SubmissionFeedback
            uncertain={uncertain}
            needsReview={!draft.identityMismatch && (draft.conflict || lookup.changed)}
            busy={busy}
            onReview={draft.review}
          />
          <FormBusyRegion busy={busy || uncertain} showOverlay={false} label="Returning book">
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              {draft.identityMismatch && (
                <Alert severity="warning">
                  The scan resolves a different loan or copy from this draft. Your entries remain
                  bound to the original record. Retry an uncertain submission or open the current
                  loan in a fresh return.
                </Alert>
              )}
              {!canReturn && (
                <Alert severity="info">
                  Issue & Return view and return access are required for this workflow.
                </Alert>
              )}
              <FormSectionCard
                title="Active Loan Lookup"
                icon={GlobalIcons.search}
                descriptionTooltip="Scan an exact copy. The server resolves its stored loan and current revision within your transaction scope."
              >
                <ScanField
                  name="accessionNo"
                  readOnly={Boolean(target)}
                  value={formik.values.accessionNo}
                  disabled={disabled}
                  onChange={(value) =>
                    formik.setValues({ ...formik.initialValues, accessionNo: value })
                  }
                  onBlur={() => formik.setFieldTouched('accessionNo', true)}
                  error={formik.touched.accessionNo && formik.errors.accessionNo}
                />
                <LookupFeedback
                  label="active loan"
                  pending={lookup.pending}
                  error={lookup.error}
                  onRetry={lookup.refetch}
                />
              </FormSectionCard>
              {item && (
                <>
                  <LoanBookDetails book={item.copy} />
                  <ReturnLoanDetails item={item} />
                  <SchoolDateContext
                    context={item.schoolContext}
                    disabled={disabled}
                    onUse={(value) => formik.setFieldValue('returnDate', value)}
                  />
                  {returnNeedsDateReason(item) && (
                    <UnknownLoanDatesField formik={formik} disabled={disabled} />
                  )}
                </>
              )}
              <ReturnConditionFields formik={formik} disabled={disabled || !canSubmit} />
              {item && (
                <ReturnAssessmentFields
                  formik={formik}
                  lookup={item}
                  disabled={disabled || !canSubmit}
                />
              )}
            </Stack>
          </FormBusyRegion>
        </DialogScrollContent>
        <CirculationFormFooter
          busy={busy}
          disabled={!canSubmit}
          onCancel={() => onClose(null, false)}
          label={uncertain ? 'Retry same submission' : 'Return'}
        />
      </Box>
    </BackPopUpChecked>
  );
}
