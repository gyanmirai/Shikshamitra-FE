import { useEffect } from 'react';
import { Alert, Stack } from '@mui/material';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { useFormikErrorFocus } from 'src/hooks/use-formik-error-focus';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { useReservationDraft } from './useReservationDraft';
import { useReservationAccess } from './useReservationAccess';
import { ReservationDateFields } from './ReservationDateFields';
import { ReservationFormFooter } from './ReservationFormFooter';
import { ReservationPickupField } from './ReservationPickupField';
import { ReservationMemberPicker } from './ReservationMemberPicker';
import { ReservationPreviewFeedback } from './ReservationPreviewFeedback';

export function ReservationCreateDialog({
  book,
  onClose,
  onBusyChange,
}: {
  book: { id: string; title: string };
  onClose: (submitted: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const { academicYearId, canWrite } = useReservationAccess();
  const draft = useReservationDraft(book.id, academicYearId, canWrite, () => onClose(true));
  useFormikErrorFocus(draft.formik);
  const guard = useUnsavedNavigation(draft.formik.dirty, {
    guardContextChanges: true,
    blockNavigation: draft.busy,
    onNavigationApproved: () => onClose(false),
    onBeforeTraversal: () => onClose(false),
  });
  const requestClose = () => guard.requestNavigation(() => undefined);
  useEffect(() => {
    onBusyChange?.(draft.busy);
    return () => onBusyChange?.(false);
  }, [draft.busy, onBusyChange]);
  return (
    <>
      <CustomDialog
        open
        title={`Reserve Book — ${book.title}`}
        maxWidth="sm"
        titleInfo="Create a request for this book. Availability and pickup details are determined by the saved policy and allocation."
        handleClose={requestClose}
        disableClose={draft.busy}
        guardUnsavedChanges={false}
        formProps={{
          noValidate: true,
          onSubmit: (event) => {
            event.preventDefault();
            draft.formik.handleSubmit();
          },
        }}
      >
        <DialogScrollContent>
          <FormBusyRegion busy={draft.busy} label="Creating reservation request">
            <Stack spacing={2}>
              {!canWrite && (
                <Alert severity="info">Catalogue view and Reserve permissions are required.</Alert>
              )}
              {!academicYearId && (
                <Alert severity="info">Select an academic year before creating a request.</Alert>
              )}
              {draft.error && <Alert severity="error">{draft.error}</Alert>}
              <ReservationMemberPicker
                formik={draft.formik}
                selected={draft.selected}
                onSelect={draft.setSelected}
                academicYearId={academicYearId}
                disabled={!canWrite || !academicYearId || draft.busy}
              />
              <ReservationPickupField
                academicYearId={academicYearId}
                value={draft.formik.values.pickupSectionId || ''}
                onChange={(value) => draft.formik.setFieldValue('pickupSectionId', value)}
                enabled={canWrite}
                disabled={draft.busy}
              />
              <ReservationDateFields
                formik={draft.formik}
                requiresExpiry={Boolean(draft.preview.currentData?.requiresExplicitExpiry)}
                disabled={!canWrite || !academicYearId || draft.busy}
              />
              {draft.canPreview && (
                <ReservationPreviewFeedback
                  data={draft.preview.currentData}
                  fetching={draft.preview.isFetching}
                  error={draft.preview.error}
                  onRetry={() => draft.preview.refetch()}
                />
              )}
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
