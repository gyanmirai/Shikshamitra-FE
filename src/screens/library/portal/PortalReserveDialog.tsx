import type { PortalBook } from 'src/redux/library/library-portal-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Alert, Stack, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  usePortalLibraryPickupQuery,
  useSavePortalReservationMutation,
  usePreviewPortalReservationMutation,
} from 'src/redux/library/library-portal-api';

export default function PortalReserveDialog({
  studentId,
  book,
  onClose,
  onSaved,
}: {
  studentId: string;
  book: PortalBook;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<{ canRequest: boolean; reasons: string[] }>();
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const pickup = usePortalLibraryPickupQuery(studentId, { refetchOnMountOrArgChange: true });
  const sites = pickup.isError ? [] : (pickup.currentData ?? []);
  const formik = useFormik({
    initialValues: { pickupSectionId: '' },
    validationSchema: Yup.object({
      pickupSectionId: Yup.string().test(
        'location',
        'Choose a listed pickup location.',
        (value) => !value || sites.some((row) => row.sectionId === value)
      ),
    }),
    onSubmit: () => save(),
  });
  const section = formik.values.pickupSectionId;
  const [preview, reviewing] = usePreviewPortalReservationMutation();
  const [reserve, saving] = useSavePortalReservationMutation();
  const busy = reviewing.isLoading || saving.isLoading;
  const body = { bookId: book.id, pickupSectionId: section || null };
  const change = (value: string) => {
    formik.setFieldValue('pickupSectionId', value);
    setStatus(undefined);
    setError('');
  };
  const review = async () => {
    if (inFlight.current) return;
    await formik.setFieldTouched('pickupSectionId', true);
    if (Object.keys(await formik.validateForm()).length) return;
    inFlight.current = true;
    setStatus(undefined);
    setError('');
    try {
      setStatus(await preview({ studentId, body }).unwrap());
    } catch (problem) {
      setError(parseApiProblemDetail(problem).detail || 'Could not review this reservation.');
    } finally {
      inFlight.current = false;
    }
  };
  const save = async () => {
    if (inFlight.current || !status?.canRequest) return;
    inFlight.current = true;
    setError('');
    try {
      await reserve({ studentId, body }).unwrap();
      onSaved();
    } catch (problem) {
      setStatus(undefined);
      setError(
        parseApiProblemDetail(problem).detail ||
          'Could not confirm the reservation. Check Reservations before trying again.'
      );
    } finally {
      inFlight.current = false;
    }
  };
  return (
    <CustomDialog
      open
      hasForm={false}
      title="Reserve book"
      maxWidth="sm"
      handleClose={onClose}
      disableClose={busy}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          <Typography variant="subtitle1">{book.title}</Typography>
          {pickup.isError && (
            <Alert
              severity="warning"
              action={<Button onClick={() => pickup.refetch()}>Retry</Button>}
            >
              Pickup locations could not be loaded.
            </Alert>
          )}
          {(sites.length > 0 || section) && (
            <CustomSelect
              label="Pickup location"
              name="pickupSectionId"
              value={sites.some((row) => row.sectionId === section) ? section : ''}
              size="small"
              onChange={(value) => change(String(value))}
              disabled={busy}
              onBlur={() => formik.setFieldTouched('pickupSectionId', true)}
              error={Boolean(formik.touched.pickupSectionId && formik.errors.pickupSectionId)}
              helperText={
                formik.touched.pickupSectionId ? formik.errors.pickupSectionId : undefined
              }
              options={[
                { id: '', name: 'Any library location' },
                ...sites.map((row) => ({ id: row.sectionId, name: row.label })),
              ]}
            />
          )}
          {status && (
            <Alert severity={status.canRequest ? 'info' : 'warning'}>
              {status.canRequest
                ? 'You can submit this request. Reservations shows whether a copy is ready for pickup.'
                : status.reasons.join(' ')}
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button size="small" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button size="small" variant="outlined" onClick={review} disabled={busy}>
          Review request
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={() => formik.submitForm()}
          disabled={busy || !status?.canRequest}
        >
          Submit request
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
