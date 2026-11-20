import type { ObserveStock, StockObservation } from 'src/redux/library/stock-verification-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useRouter } from 'src/routes/hooks';
import { Box, Grid, Alert, Stack, TextField } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { toDateOnly, parseDateOnly, formatDateOnly } from 'src/utils/date-only';
import {
  useGetStockCountOptionsQuery,
  useRecordStockObservationMutation,
} from 'src/redux/library/stock-verification-api';

import { StockLocationFields } from './StockLocationFields';
import { useCommandAttempt } from '../circulation/useCommandAttempt';
import { useStockVerificationAccess } from './useStockVerificationAccess';
import { CirculationDateField } from '../circulation/CirculationDateField';

const requestFields = (values: {
  scan: string;
  sectionId: string;
  shelfId: string;
  schoolDate: string;
}) => ({
  scan: values.scan.trim(),
  sectionId: values.sectionId || null,
  shelfId: values.shelfId || null,
  schoolDate: values.schoolDate || null,
});

export function RecordStockScan({ id }: { id: string }) {
  const access = useStockVerificationAccess();
  const router = useRouter();
  const options = useGetStockCountOptionsQuery(undefined, { skip: !access.canRecord });
  const [record, mutation] = useRecordStockObservationMutation();
  const attempt = useCommandAttempt<Omit<ObserveStock, 'idempotencyKey'>>();
  const [operation, setOperation] = useState(() => crypto.randomUUID());
  const [last, setLast] = useState<StockObservation>();
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const scanField = useRef<HTMLInputElement>(null);
  const formik = useFormik({
    initialValues: { scan: '', sectionId: '', shelfId: '', schoolDate: '' },
    validationSchema: Yup.object({
      scan: Yup.string().trim().required('Enter or scan an accession.').max(50),
      schoolDate: options.data?.schoolDate
        ? Yup.string()
        : Yup.string().required('Choose the school date.'),
    }),
    onSubmit: async (values, helpers) => {
      if (inFlight.current || !access.canRecord || !options.data) return;
      const payload = requestFields(values);
      const key = `${operation}:${JSON.stringify(payload)}`;
      const body = attempt.retry(key) ?? attempt.prepare(key, payload);
      inFlight.current = true;
      setError('');
      try {
        const saved = await record({ id, body }).unwrap();
        setLast(saved);
        setOperation(crypto.randomUUID());
        helpers.resetForm({ values: { ...values, scan: '' } });
        scanField.current?.focus();
      } catch (cause) {
        attempt.failed(key, cause);
        setError(
          parseApiProblemDetail(cause).detail ||
            'The scan could not be confirmed. Try the same scan again.'
        );
      } finally {
        inFlight.current = false;
      }
    },
  });
  const retry = attempt.retry(`${operation}:${JSON.stringify(requestFields(formik.values))}`);
  const busy = mutation.isLoading;
  const locked = busy || Boolean(retry) || !options.data;
  const guard = useUnsavedNavigation(access.canRecord && formik.dirty, {
    push: router.push,
    blockNavigation: access.canRecord && busy,
    description: retry
      ? 'The scan may already be recorded. Retry here or check the scan history before scanning it again.'
      : undefined,
  });
  if (!access.canRecord) return null;
  return (
    <Box component="form" onSubmit={formik.handleSubmit} aria-busy={busy} sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        {options.isError && (
          <Alert severity="error">
            Could not load scan locations. Reload this count to try again.
          </Alert>
        )}
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              {...formik.getFieldProps('scan')}
              label="Accession or barcode"
              inputRef={scanField}
              fullWidth
              size="small"
              required
              slotProps={{ input: { readOnly: locked } }}
              error={Boolean(formik.touched.scan && formik.errors.scan)}
              helperText={formik.touched.scan && formik.errors.scan}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <CirculationDateField
              value={parseDateOnly(formik.values.schoolDate)}
              name="schoolDate"
              label="Scan date"
              disabled={locked}
              required={!options.data?.schoolDate}
              helperText={
                options.data?.schoolDate
                  ? `Default school date: ${formatDateOnly(options.data.schoolDate)}`
                  : undefined
              }
              error={Boolean(formik.touched.schoolDate) && formik.errors.schoolDate}
              onChange={(value) => formik.setFieldValue('schoolDate', toDateOnly(value))}
              onBlur={() => formik.setFieldTouched('schoolDate')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <LoadingButton
              type="submit"
              fullWidth
              size="small"
              variant="contained"
              loading={busy}
              disabled={!options.data}
            >
              {retry ? 'Retry scan' : 'Record scan'}
            </LoadingButton>
          </Grid>
        </Grid>
        <StockLocationFields
          locations={options.data?.sections ?? []}
          sectionId={formik.values.sectionId}
          shelfId={formik.values.shelfId}
          blankSection="Unknown section"
          blankShelf="Unknown shelf"
          disabled={locked}
          onChange={(sectionId, shelfId) =>
            formik.setValues({ ...formik.values, sectionId, shelfId })
          }
        />
        {error && <Alert severity="error">{error}</Alert>}
        {last && !error && (
          <Alert severity={last.copyId ? 'success' : 'warning'} role="status">
            {last.accessionNumber} ·{' '}
            {last.copyId ? 'Scan recorded' : 'Unknown accession recorded for review'}
          </Alert>
        )}
      </Stack>
      {guard.confirmation}
    </Box>
  );
}
