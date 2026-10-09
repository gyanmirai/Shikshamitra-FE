'use client';

import type { EsiEmployeeImpact, EsiStatutoryOverride } from 'src/redux/hr/statutory-scheme-api';

import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import {
  useGetEsiOverridesQuery,
  useCreateEsiOverrideMutation,
} from 'src/redux/hr/statutory-scheme-api';
import {
  Box,
  Chip,
  Grid,
  Alert,
  Button,
  Dialog,
  Select,
  Divider,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  DialogTitle,
  FormControl,
  DialogActions,
  DialogContent,
} from '@mui/material';

type OverrideType = EsiStatutoryOverride['overrideType'];

const overrideLabels: Record<OverrideType, string> = {
  ForceCovered: 'Force Covered',
  ForceNotCovered: 'Force Not Covered',
  EmployeeAmount: 'Staff Amount',
  EmployerAmount: 'Employer Amount',
};

const getMonthEnd = (month: string) => {
  const [year, monthNumber] = month.split('-').map(Number);
  return `${month}-${String(new Date(year, monthNumber, 0).getDate()).padStart(2, '0')}`;
};

export default function EsiOverrideDialog({
  employee,
  month,
  open,
  onClose,
  onSaved,
}: {
  employee: EsiEmployeeImpact | null;
  month: string;
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const {
    data: overrides = [],
    isFetching,
    isError,
  } = useGetEsiOverridesQuery(employee?.employeeId || '', { skip: !employee || !open });
  const [createOverride, createState] = useCreateEsiOverrideMutation();
  const [overrideType, setOverrideType] = useState<OverrideType>('ForceNotCovered');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [evidenceReference, setEvidenceReference] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(month);
  const [effectiveTo, setEffectiveTo] = useState(month);

  useEffect(() => {
    if (!open) return;
    setOverrideType('ForceNotCovered');
    setAmount('');
    setReason('');
    setEvidenceReference('');
    setEffectiveFrom(month);
    setEffectiveTo(month);
  }, [employee?.employeeId, month, open]);

  const needsAmount = overrideType === 'EmployeeAmount' || overrideType === 'EmployerAmount';
  const amountValue = amount === '' ? null : Number(amount);
  const formInvalid =
    !reason.trim() ||
    !effectiveFrom ||
    !effectiveTo ||
    effectiveTo < effectiveFrom ||
    (needsAmount && (amountValue === null || !Number.isFinite(amountValue) || amountValue < 0));

  const save = async () => {
    if (!employee || formInvalid) return;
    try {
      await createOverride({
        employeeId: employee.employeeId,
        body: {
          overrideType,
          amount: needsAmount ? amountValue : null,
          reason: reason.trim(),
          evidenceReference: evidenceReference.trim() || null,
          effectiveFrom: `${effectiveFrom}-01`,
          effectiveTo: getMonthEnd(effectiveTo),
        },
      }).unwrap();
      shikshaMitraToast.success({ message: 'Audited ESI exception added.' });
      await onSaved();
      onClose();
    } catch {
      shikshaMitraToast.error({
        message: 'Unable to add the ESI exception. Review the dates and evidence, then try again.',
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={createState.isLoading ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>Add Audited ESI Exception</DialogTitle>
      <DialogContent sx={{ overscrollBehavior: 'contain' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {employee?.employeeName}{' '}
          {employee?.employeeIdentifier ? `(${employee.employeeIdentifier})` : ''}
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Exceptions change a statutory payroll result. Add a clear reason and evidence reference.
          Records are immutable, and a newer overlapping exception becomes authoritative.
        </Alert>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Exception Type</InputLabel>
              <Select
                label="Exception Type"
                value={overrideType}
                onChange={(event) => setOverrideType(event.target.value as OverrideType)}
              >
                {Object.entries(overrideLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {needsAmount ? (
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                type="number"
                name="overrideAmount"
                label="Override Amount"
                value={amount}
                slotProps={{ htmlInput: { min: 0, step: '0.01', inputMode: 'decimal' } }}
                onChange={(event) => setAmount(event.target.value)}
              />
            </Grid>
          ) : null}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              type="month"
              name="overrideEffectiveFrom"
              label="Start month"
              value={effectiveFrom}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={(event) => setEffectiveFrom(event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              type="month"
              name="overrideEffectiveTo"
              label="End month"
              value={effectiveTo}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={(event) => setEffectiveTo(event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              multiline
              minRows={2}
              name="overrideReason"
              label="Reason"
              autoComplete="off"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              name="overrideEvidence"
              label="Evidence Reference"
              autoComplete="off"
              value={evidenceReference}
              helperText="Document number, portal reference, or controlled file location."
              onChange={(event) => setEvidenceReference(event.target.value)}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2.5 }} />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Exception History
        </Typography>
        {isFetching ? (
          <Typography variant="body2" color="text.secondary">
            Loading exception history…
          </Typography>
        ) : null}
        {isError ? <Alert severity="error">Exception history could not be loaded.</Alert> : null}
        {!isFetching && !isError && overrides.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No exceptions recorded for this staff member.
          </Typography>
        ) : null}
        <Box display="grid" gap={1}>
          {overrides.map((item) => (
            <Box
              key={item.id}
              sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, p: 1.5 }}
            >
              <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                <Chip size="small" label={overrideLabels[item.overrideType]} />
                {item.amount != null ? <Chip size="small" label={`₹${item.amount}`} /> : null}
                <Typography variant="caption" color="text.secondary">
                  {item.effectiveFrom.slice(0, 10)} to {item.effectiveTo.slice(0, 10)}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 0.75 }}>
                {item.reason}
              </Typography>
              {item.evidenceReference ? (
                <Typography variant="caption" color="text.secondary">
                  Evidence: {item.evidenceReference}
                </Typography>
              ) : null}
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:close" />}
          onClick={onClose}
          disabled={createState.isLoading}
        >
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<Iconify icon="mdi:plus" />}
          onClick={save}
          disabled={formInvalid || createState.isLoading}
        >
          {createState.isLoading ? 'Adding…' : 'Add Exception'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
