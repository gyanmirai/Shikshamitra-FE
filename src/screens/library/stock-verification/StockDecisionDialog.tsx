import type {
  StockDecisionInput,
  StockReconciliationRow,
  StockReconciliationSource,
} from 'src/redux/library/stock-verification-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useSaveStockDecisionMutation } from 'src/redux/library/stock-verification-api';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Button,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { useCommandAttempt } from '../circulation/useCommandAttempt';
import { stockFinding, stockCopyStatus, stockDecisionOutcomes } from './stock-verification-labels';

const schema = Yup.object({
  outcome: Yup.string().required('Choose a decision.'),
  reason: Yup.string().trim().required('Enter a reason.').max(500),
});

export function StockDecisionDialog({
  countId,
  source,
  initial,
  readFinding,
  onClose,
}: {
  countId: string;
  source: StockReconciliationSource;
  initial: StockReconciliationRow;
  readFinding: () => Promise<StockReconciliationRow | undefined>;
  onClose: () => void;
}) {
  const [finding, setFinding] = useState(initial);
  const [unavailable, setUnavailable] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const [save, mutation] = useSaveStockDecisionMutation();
  const attempt = useCommandAttempt<StockDecisionInput>();

  const payload = (values: { outcome: string; reason: string }): StockDecisionInput | undefined => {
    const outcome = stockDecisionOutcomes.find(
      (option) => String(option.value) === values.outcome
    )?.value;
    if (!outcome) return undefined;
    return {
      source,
      rowId: finding.id,
      evidenceRevision: finding.evidenceRevision,
      expectedDecisionId: finding.decision?.id ?? null,
      reason: values.reason.trim(),
      outcome,
    };
  };
  const form = useFormik({
    initialValues: {
      outcome: initial.decision ? String(initial.decision.outcome) : '',
      reason: initial.decision?.reason ?? '',
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const body = payload(values);
      if (inFlight.current || !body || attempt.conflict || unavailable) return;
      const fingerprint = JSON.stringify(body);
      inFlight.current = true;
      setError('');
      try {
        await save({
          id: countId,
          body: attempt.retry(fingerprint) ?? attempt.prepare(fingerprint, body),
        }).unwrap();
        onClose();
      } catch (cause) {
        attempt.failed(fingerprint, cause);
        if (!(cause && typeof cause === 'object' && 'status' in cause && cause.status === 409))
          setError(parseApiProblemDetail(cause).detail || 'Could not confirm the decision.');
      } finally {
        inFlight.current = false;
      }
    },
  });
  const pending = payload(form.values);
  const retry = pending ? attempt.retry(JSON.stringify(pending)) : undefined;
  const busy = refreshing || mutation.isLoading;
  const guard = useUnsavedNavigation(form.dirty || Boolean(retry), {
    blockNavigation: busy,
    guardContextChanges: true,
    onNavigationApproved: onClose,
    onBeforeTraversal: onClose,
  });
  const requestClose = () => guard.requestNavigation(() => undefined);

  const refreshFinding = async () => {
    setRefreshing(true);
    setError('');
    try {
      const latest = await readFinding();
      if (latest) setFinding(latest);
      setUnavailable(!latest?.requiresReview);
      attempt.reviewed();
    } catch (cause) {
      setError(parseApiProblemDetail(cause).detail || 'Could not load the current finding.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <CustomDialog
        open
        title="Review Finding"
        titleInfo="Review the evidence and record how the school will handle this discrepancy."
        hasForm={false}
        guardUnsavedChanges={false}
        disableClose={busy}
        disableEscapeKeyDown={busy}
        handleClose={requestClose}
      >
        <Box
          component="form"
          onSubmit={form.handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}
        >
          <DialogScrollContent>
            <FormBusyRegion busy={busy} showOverlay={false} label="Updating finding decision">
              <Stack spacing={2}>
                <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} alignItems="center">
                  <Typography variant="subtitle2">{finding.accessionNumber}</Typography>
                  <Chip
                    size="small"
                    label={stockFinding(finding.finding, finding.receivedAfterOpening)}
                  />
                  {finding.currentStatus != null && (
                    <Typography variant="body2">
                      Current status {stockCopyStatus(finding.currentStatus)}
                    </Typography>
                  )}
                </Stack>
                {attempt.conflict && (
                  <Alert
                    severity="warning"
                    action={
                      <Button size="small" onClick={refreshFinding} disabled={busy}>
                        Review current finding
                      </Button>
                    }
                  >
                    The evidence or a saved decision changed.
                  </Alert>
                )}
                {unavailable && (
                  <Alert severity="info">This finding no longer needs a decision.</Alert>
                )}
                {error && <Alert severity="error">{error}</Alert>}
                <FormSectionCard
                  title="Decision"
                  icon={GlobalIcons.prerequisites}
                  descriptionTooltip="The choice and reason become part of the count history."
                >
                  <Stack spacing={2}>
                    <ShakingTextField error={Boolean(form.touched.outcome && form.errors.outcome)}>
                      <TextField
                        {...form.getFieldProps('outcome')}
                        select
                        fullWidth
                        required
                        size="small"
                        label="Decision"
                        disabled={busy || Boolean(retry) || unavailable}
                        error={Boolean(form.touched.outcome && form.errors.outcome)}
                        helperText={form.touched.outcome && form.errors.outcome}
                      >
                        {stockDecisionOutcomes.map((option) => (
                          <MenuItem key={option.value} value={String(option.value)}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </ShakingTextField>
                    <ShakingTextField error={Boolean(form.touched.reason && form.errors.reason)}>
                      <TextField
                        {...form.getFieldProps('reason')}
                        fullWidth
                        required
                        size="small"
                        multiline
                        minRows={2}
                        label="Reason"
                        disabled={busy || Boolean(retry) || unavailable}
                        error={Boolean(form.touched.reason && form.errors.reason)}
                        helperText={form.touched.reason && form.errors.reason}
                        slotProps={{ htmlInput: { maxLength: 500 } }}
                      />
                    </ShakingTextField>
                  </Stack>
                </FormSectionCard>
              </Stack>
            </FormBusyRegion>
          </DialogScrollContent>
          <DialogActions>
            <Button
              type="button"
              size="small"
              variant="outlined"
              color="inherit"
              disabled={busy}
              onClick={requestClose}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="small"
              variant="contained"
              color="inherit"
              loading={busy}
              disabled={attempt.conflict || unavailable}
              startIcon={<Iconify icon={GlobalIcons.prerequisites} />}
            >
              {retry ? 'Retry saving decision' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </CustomDialog>
      {guard.confirmation}
    </>
  );
}
