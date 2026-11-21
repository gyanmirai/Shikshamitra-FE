import type {
  StockCount,
  StockCountTransitionInput,
} from 'src/redux/library/stock-verification-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Alert, Stack, Button, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useTransitionStockCountMutation } from 'src/redux/library/stock-verification-api';

import { stockCountStatus } from './stock-verification-labels';
import { useCommandAttempt } from '../circulation/useCommandAttempt';

type CountAction = StockCountTransitionInput['action'];
type CountSnapshot = Pick<StockCount, 'id' | 'status' | 'observationCount'>;
type ReadCurrentCount = () => Promise<StockCount>;

const reasonSchema = Yup.object({
  reason: Yup.string().trim().required('Enter a cancellation reason.').max(500),
});

export function StockCountActions({
  session,
  readCurrent,
}: {
  session: StockCount;
  readCurrent: ReadCurrentCount;
}) {
  const [selected, setSelected] = useState<{ action: CountAction; count: CountSnapshot }>();
  return (
    <>
      <Stack direction="row" spacing={1}>
        {session.status === 1 && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon={GlobalIcons.prerequisites} />}
            onClick={() => setSelected({ action: 'review', count: session })}
          >
            Start review
          </Button>
        )}
        <Button
          size="small"
          variant="outlined"
          color="error"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => setSelected({ action: 'cancel', count: session })}
        >
          Cancel count
        </Button>
      </Stack>
      {selected && (
        <StockCountActionDialog
          action={selected.action}
          initial={selected.count}
          readCurrent={readCurrent}
          onClose={() => setSelected(undefined)}
        />
      )}
    </>
  );
}

function StockCountActionDialog({
  action,
  initial,
  readCurrent,
  onClose,
}: {
  action: CountAction;
  initial: CountSnapshot;
  readCurrent: ReadCurrentCount;
  onClose: () => void;
}) {
  const [snapshot, setSnapshot] = useState(initial);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const inFlight = useRef(false);
  const attempt = useCommandAttempt<StockCountTransitionInput>();
  const [transition, mutation] = useTransitionStockCountMutation();
  const cancelling = action === 'cancel';
  const form = useFormik({
    initialValues: { reason: '' },
    validationSchema: cancelling ? reasonSchema : undefined,
    onSubmit: async ({ reason }) => {
      if (inFlight.current || attempt.conflict) return;
      inFlight.current = true;
      setError('');
      const body = payload(reason);
      const key = JSON.stringify(body);
      try {
        await transition({
          id: snapshot.id,
          ...(attempt.retry(key) ?? attempt.prepare(key, body)),
        }).unwrap();
        onClose();
      } catch (cause) {
        attempt.failed(key, cause);
        if (!(cause && typeof cause === 'object' && 'status' in cause && cause.status === 409)) {
          setError(parseApiProblemDetail(cause).detail || 'The action could not be confirmed.');
        }
      } finally {
        inFlight.current = false;
      }
    },
  });

  const payload = (reason: string): StockCountTransitionInput => {
    const expectedObservationCount = snapshot.observationCount;
    return cancelling
      ? { action, expectedObservationCount, expectedStatus: snapshot.status, reason: reason.trim() }
      : { action, expectedObservationCount };
  };
  const retry = attempt.retry(JSON.stringify(payload(form.values.reason)));
  const busy = mutation.isLoading || refreshing;
  const guard = useUnsavedNavigation(form.dirty || Boolean(retry), {
    blockNavigation: busy,
    guardContextChanges: true,
    onNavigationApproved: onClose,
    onBeforeTraversal: onClose,
    description: retry
      ? 'This action may already be saved. You can retry here or check the current count after closing.'
      : undefined,
  });

  const reviewCurrent = async () => {
    setRefreshing(true);
    try {
      const current = await readCurrent();
      if (current.status !== 1 && (!cancelling || current.status !== 2)) {
        onClose();
        return;
      }
      setSnapshot(current);
      attempt.reviewed();
      setError('');
    } catch (cause) {
      setError(parseApiProblemDetail(cause).detail || 'Could not load the current count.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <ConfirmDialog
        open
        title={cancelling ? 'Cancel Stock Count?' : 'Start Stock Count Review?'}
        icon="warning"
        onClose={() => guard.requestNavigation(() => undefined)}
        cancelText="Close"
        bodyBusy={busy}
        busyLabel={refreshing ? 'Loading the current count' : 'Saving the stock count status'}
        content={
          <Stack spacing={2}>
            <span>
              {cancelling
                ? 'Cancelling closes this count and keeps its expected copies and scans on record.'
                : 'Starting review closes scanning so staff can work from the recorded observations.'}
            </span>
            <span>
              {stockCountStatus(snapshot.status)} · {snapshot.observationCount} recorded scans
            </span>
            {cancelling && (
              <ShakingTextField error={Boolean(form.touched.reason && form.errors.reason)}>
                <TextField
                  {...form.getFieldProps('reason')}
                  label="Cancellation reason"
                  required
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  disabled={busy || Boolean(retry)}
                  error={Boolean(form.touched.reason && form.errors.reason)}
                  helperText={
                    (form.touched.reason && form.errors.reason) ||
                    'The reason is saved with the count.'
                  }
                  slotProps={{ htmlInput: { maxLength: 500 } }}
                />
              </ShakingTextField>
            )}
            {attempt.conflict && (
              <Alert severity="warning">
                The count changed. Review the current count before confirming again.
              </Alert>
            )}
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        }
        action={
          <Button
            type="button"
            size="small"
            variant="contained"
            color={cancelling && !attempt.conflict ? 'error' : 'primary'}
            startIcon={
              <Iconify
                icon={
                  cancelling && !attempt.conflict ? GlobalIcons.cancel : GlobalIcons.prerequisites
                }
              />
            }
            disabled={busy || (!attempt.conflict && cancelling && !form.values.reason.trim())}
            onClick={attempt.conflict ? reviewCurrent : form.submitForm}
          >
            {attempt.conflict
              ? 'Review current count'
              : cancelling
                ? retry
                  ? 'Retry cancelling count'
                  : 'Cancel count'
                : retry
                  ? 'Retry starting review'
                  : 'Start review'}
          </Button>
        }
      />
      {guard.confirmation}
    </>
  );
}
