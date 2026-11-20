import type { LibraryReservation } from 'src/redux/library/reservation-types';

import { GlobalIcons } from 'src/utils/icons';
import { Alert, Stack, Typography } from '@mui/material';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';
import { useFormikErrorFocus } from 'src/hooks/use-formik-error-focus';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { ReservationReason } from './ReservationReason';
import { reservationPerson } from './reservation-display';
import { useReservationAccess } from './useReservationAccess';
import { ReservationDateFields } from './ReservationDateFields';
import { ReservationFormFooter } from './ReservationFormFooter';
import { ReservationMemberPicker } from './ReservationMemberPicker';
import { useReservationReviewDraft } from './useReservationReviewDraft';
import { ReservationPreviewFeedback } from './ReservationPreviewFeedback';

export function ReservationReviewEditor({
  snapshot,
  onClose,
}: {
  snapshot: LibraryReservation;
  onClose: () => void;
}) {
  const { academicYearId, canWrite } = useReservationAccess();
  const draft = useReservationReviewDraft(snapshot, academicYearId, canWrite, onClose);
  useFormikErrorFocus(draft.formik);
  const guard = useUnsavedNavigation(draft.formik.dirty, {
    guardContextChanges: true,
    blockNavigation: draft.busy,
    onNavigationApproved: onClose,
    onBeforeTraversal: onClose,
  });
  const requestClose = () => guard.requestNavigation(() => undefined);
  return (
    <>
      <CustomDialog
        open
        title="Review Reservation"
        maxWidth="sm"
        titleInfo="Confirm the member and school dates. Original legacy values and the reason remain in the audit history."
        guardUnsavedChanges={false}
        disableClose={draft.busy}
        handleClose={requestClose}
        formProps={{
          noValidate: true,
          onSubmit: (event) => {
            event.preventDefault();
            draft.formik.handleSubmit();
          },
        }}
      >
        <DialogScrollContent>
          <FormBusyRegion busy={draft.busy} label="Saving reservation review">
            <Stack spacing={2}>
              {!canWrite && (
                <Alert severity="info">
                  Reserve access is no longer available. Your draft is retained for review.
                </Alert>
              )}
              <Alert severity="info">
                Saved member: {reservationPerson(snapshot)}. Resolve this member or select the
                correct replacement before saving. {snapshot.reviewReason}
              </Alert>
              {draft.error && (
                <Alert severity="error">
                  {draft.error} Your draft is retained. Close and reopen to load the current
                  request, then review before retrying.
                </Alert>
              )}
              <FormSectionCard
                title="Legacy Date Evidence"
                icon={GlobalIcons.history}
                descriptionTooltip="Original stored timestamps are evidence only. They are not prefilled as school dates."
              >
                <Stack spacing={1} sx={{ overflowWrap: 'anywhere' }}>
                  <Typography variant="body2">
                    Original requested timestamp: {snapshot.legacyRequestedDate || 'Not recorded'}
                  </Typography>
                  <Typography variant="body2">
                    Original expiry timestamp: {snapshot.legacyReserveDueDate || 'Not recorded'}
                  </Typography>
                </Stack>
              </FormSectionCard>
              <ReservationMemberPicker
                formik={draft.formik}
                selected={draft.selected}
                onSelect={draft.setSelected}
                academicYearId={academicYearId}
                defaultMethod="scan"
                disabled={draft.busy || !canWrite}
              />
              <ReservationDateFields
                formik={draft.formik}
                requiresExpiry={Boolean(draft.preview.currentData?.requiresExplicitExpiry)}
                disabled={draft.busy || !canWrite}
              />
              {draft.canPreview && (
                <ReservationPreviewFeedback
                  data={draft.preview.currentData}
                  fetching={draft.preview.isFetching}
                  error={draft.preview.error}
                  onRetry={() => draft.preview.refetch()}
                  mode="review"
                />
              )}
              <FormSectionCard
                title="Review Reason"
                icon={GlobalIcons.bookIcon}
                descriptionTooltip="Explain the confirmed member and school-date evidence. The reason is retained with this review."
              >
                <ReservationReason
                  value={draft.formik.values.reason}
                  error={draft.formik.touched.reason ? draft.formik.errors.reason : undefined}
                  disabled={draft.busy || !canWrite}
                  onChange={draft.formik.handleChange}
                  onBlur={draft.formik.handleBlur}
                />
              </FormSectionCard>
            </Stack>
          </FormBusyRegion>
        </DialogScrollContent>
        <ReservationFormFooter
          busy={draft.busy}
          disabled={!draft.canSubmit}
          onCancel={requestClose}
        />
      </CustomDialog>
      {guard.confirmation}
    </>
  );
}
