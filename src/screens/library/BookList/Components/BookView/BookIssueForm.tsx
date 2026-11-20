import type { RootState } from 'src/redux/store';
import type { IBookCopyWithBook } from 'src/screens/library/BookManagement/Components/type';

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
import { useIssueDraft } from '../../../circulation/useIssueDraft';
import { LookupFeedback } from '../../../circulation/LookupFeedback';
import { IssueDateFields } from '../../../circulation/IssueDateFields';
import { LoanBookDetails } from '../../../circulation/LoanBookDetails';
import { LoanMemberPicker } from '../../../circulation/LoanMemberPicker';
import { IssuePlanDetails } from '../../../circulation/IssuePlanDetails';
import { IssueMemberDetails } from '../../../circulation/IssueMemberDetails';
import { useCirculationBusy } from '../../../circulation/useCirculationBusy';
import { SubmissionFeedback } from '../../../circulation/SubmissionFeedback';
import { CirculationFormFooter } from '../../../circulation/CirculationFormFooter';
import { useCirculationErrorFocus } from '../../../circulation/useCirculationErrorFocus';

export interface IssueBookFormProps {
  onClose: (event: unknown, submitted: boolean) => void;
  editData: IBookCopyWithBook | null;
  onBusyChange?: (busy: boolean) => void;
}
export default function IssueBookModal({ onClose, editData, onBusyChange }: IssueBookFormProps) {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canIssue =
    hasGrantedPermission(permissions, 'Library.IssueReturn.Issue') &&
    hasGrantedPermission(permissions, 'Library.IssueReturn.View');
  const draft = useIssueDraft(editData, canIssue, onClose);
  const { formik, book, member, plan, busy, error, canSubmit, uncertain } = draft;
  const disabled = busy || uncertain || !canIssue;
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
            needsReview={draft.conflict}
            busy={busy}
            onReview={draft.review}
          />
          <FormBusyRegion busy={busy || uncertain} showOverlay={false} label="Issuing book">
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              {!canIssue && (
                <Alert severity="info">
                  Issue & Return view and issue access are required for this workflow.
                </Alert>
              )}
              <FormSectionCard
                title="Copy Selection"
                icon={GlobalIcons.bookIcon}
                descriptionTooltip="Look up the exact saved copy by its accession or scan token."
              >
                <ScanField
                  value={formik.values.accessionNumber}
                  onChange={(value) => formik.setFieldValue('accessionNumber', value)}
                  onBlur={() => formik.setFieldTouched('accessionNumber', true)}
                  readOnly={Boolean(editData)}
                  disabled={disabled}
                  error={formik.touched.accessionNumber && formik.errors.accessionNumber}
                />
                <LookupFeedback
                  label="book copy"
                  pending={book.pending}
                  error={book.error}
                  onRetry={() => book.refetch()}
                />
              </FormSectionCard>
              {book.currentData && <LoanBookDetails book={book.currentData} />}
              <LoanMemberPicker formik={formik} disabled={disabled} />
              <LookupFeedback
                label="member details"
                pending={member.isFetching}
                error={member.error}
                onRetry={() => member.refetch()}
              />
              {member.currentData && !member.isError && (
                <IssueMemberDetails member={member.currentData} />
              )}
              <IssueDateFields
                formik={formik}
                copy={book.currentData}
                member={member.currentData}
                manual={plan.manual}
                disabled={disabled}
              />
              <LookupFeedback
                label="checkout preview"
                pending={plan.isFetching}
                error={plan.error}
                onRetry={plan.refetch}
              />
              {plan.currentData && <IssuePlanDetails plan={plan.currentData} />}
            </Stack>
          </FormBusyRegion>
        </DialogScrollContent>
        <CirculationFormFooter
          busy={busy}
          disabled={!canSubmit}
          onCancel={() => onClose(null, false)}
          label={uncertain ? 'Retry same submission' : 'Issue'}
        />
      </Box>
    </BackPopUpChecked>
  );
}
