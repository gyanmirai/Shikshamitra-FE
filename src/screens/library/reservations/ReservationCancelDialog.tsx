import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { Alert, Stack } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { shikshaMitraToast } from 'src/components/toast';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useFormikErrorFocus } from 'src/hooks/use-formik-error-focus';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useCancelLibraryReservationMutation } from 'src/redux/library/reservations-api';

import { ReservationReason } from './ReservationReason';
import { useReservationAccess } from './useReservationAccess';
import { ReservationLoadState } from './ReservationLoadState';
import { useReservationSession } from './useReservationSession';
import { ReservationFormFooter } from './ReservationFormFooter';

export function ReservationCancelDialog({
  reservationId,
  onClose,
}: {
  reservationId: string;
  onClose: () => void;
}) {
  const { academicYearId, canWrite } = useReservationAccess();
  const { snapshot, query, retry } = useReservationSession(reservationId, academicYearId, canWrite);
  const [save, result] = useCancelLibraryReservationMutation();
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const allowed = Boolean(canWrite && snapshot?.canCancel && snapshot.revision);
  const formik = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object({
      reason: Yup.string()
        .trim()
        .required('Explain why this request is being cancelled')
        .max(500, 'Use at most 500 characters'),
    }),
    onSubmit: async (values) => {
      if (inFlight.current || !allowed || !snapshot) return;
      inFlight.current = true;
      setError('');
      try {
        await save({
          reservationId,
          body: { academicYearId, reason: values.reason, revision: snapshot.revision },
        }).unwrap();
        formik.resetForm({ values });
        shikshaMitraToast.success({ message: 'Reservation request cancelled.' });
        onClose();
      } catch (cause) {
        setError(parseApiProblemDetail(cause).detail || 'Could not cancel this request.');
      } finally {
        inFlight.current = false;
      }
    },
  });
  const busy = formik.isSubmitting || result.isLoading;
  useFormikErrorFocus(formik);
  const guard = useUnsavedNavigation(formik.dirty, {
    guardContextChanges: true,
    blockNavigation: busy,
    onNavigationApproved: onClose,
    onBeforeTraversal: onClose,
  });
  const requestClose = () => guard.requestNavigation(() => undefined);
  return (
    <>
      <CustomDialog
        open
        title="Cancel Reservation"
        titleInfo="Cancelling releases this request and its active hold. The history remains recorded."
        handleClose={requestClose}
        guardUnsavedChanges={false}
        disableClose={busy}
        formProps={{
          noValidate: true,
          onSubmit: (event) => {
            event.preventDefault();
            formik.handleSubmit();
          },
        }}
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            {!canWrite && (
              <Alert severity="info">Catalogue view and Reserve permissions are required.</Alert>
            )}
            <ReservationLoadState
              fetching={query.isFetching}
              initial={!snapshot}
              error={query.error}
              onRetry={retry}
            />
            {snapshot && !allowed && (
              <Alert severity="warning">
                The server does not allow cancellation of this request in its current state.
              </Alert>
            )}
            {error && (
              <Alert severity="error">
                {error} Your reason is retained. Close and reopen to load the current request, then
                review before retrying.
              </Alert>
            )}
            <FormBusyRegion busy={busy} label="Cancelling reservation request">
              <FormSectionCard
                title="Cancellation Reason"
                icon={GlobalIcons.bookIcon}
                descriptionTooltip="The reason is saved with the immutable cancellation event."
              >
                <ReservationReason
                  value={formik.values.reason}
                  error={formik.touched.reason ? formik.errors.reason : undefined}
                  disabled={busy || !allowed}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </FormSectionCard>
            </FormBusyRegion>
          </Stack>
        </DialogScrollContent>
        <ReservationFormFooter busy={busy} disabled={!allowed} onCancel={requestClose} />
      </CustomDialog>
      {guard.confirmation}
    </>
  );
}
