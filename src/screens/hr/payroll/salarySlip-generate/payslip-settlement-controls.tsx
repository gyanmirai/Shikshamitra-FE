import type { RootState } from 'src/redux/store';
import type { PayslipCorrection } from 'src/redux/hr/payslip-api';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { Alert, Stack, Button, TextField, Typography } from '@mui/material';
import { useSettlePayslipCorrectionMutation } from 'src/redux/hr/payslip-api';
import { usePayrollPreviewStatusQuery, useStartPayrollPreviewMutation } from 'src/redux/runPayroll/payroll-preview-run-api';

import { payslipActionError } from './payslip-action-error';

type Props = {
  correction: PayslipCorrection; disabled: boolean; onSettled: () => void;
  onBusy: (busy: boolean) => void; onDirty: (dirty: boolean) => void;
};

export default function PayslipSettlementControls({ correction, disabled, onSettled, onBusy, onDirty }: Props) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const defaultMonth = dayjs(`${correction.sourceMonth}-01`).add(1, 'month').format('YYYY-MM');
  const [month, setMonth] = useState(defaultMonth);
  const [run, setRun] = useState<{ id: string; month: string; year: string } | null>(null);
  const selection = `${currentYear?.id}:${month}`;
  const currentSelection = useRef(selection);
  currentSelection.current = selection;
  const [start, starting] = useStartPayrollPreviewMutation();
  const [settle, settling] = useSettlePayslipCorrectionMutation();
  const [error, setError] = useState<string | null>(null);
  const matches = run?.month === month && run?.year === currentYear?.id;
  const query = usePayrollPreviewStatusQuery(run?.id ?? '', { skip: !matches,
    pollingInterval: 2000, refetchOnMountOrArgChange: true });
  const status = matches ? query.currentData : undefined;
  const busy = starting.isLoading || settling.isLoading;
  useEffect(() => { onBusy(busy); return () => onBusy(false); }, [busy, onBusy]);
  useEffect(() => { onDirty(month !== defaultMonth); return () => onDirty(false); }, [month, defaultMonth, onDirty]);
  const validMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(month) && month > correction.sourceMonth;
  const prepare = async () => {
    if (!validMonth || !currentYear?.id || disabled || busy) return;
    const requested = selection;
    setError(null);
    try {
      const result = await start({ month, academicYearId: currentYear.id, refresh: false }).unwrap();
      if (currentSelection.current === requested) setRun({ id: result.id, month, year: currentYear.id });
    } catch (failure) {
      if (currentSelection.current === requested) setError(payslipActionError(failure, 'Target payroll could not be calculated.'));
    }
  };
  const apply = async () => {
    if (!run || !matches || !status?.isCurrent || status.status !== 'SUCCEEDED' || disabled || busy) return;
    setError(null);
    try {
      await settle({ id: correction.id, concurrencyStamp: correction.concurrencyStamp, targetMonth: month, previewRunId: run.id }).unwrap();
      onSettled();
    } catch (failure) { setError(payslipActionError(failure, 'Settlement could not be applied.')); }
  };
  return <Stack spacing={1}>
    <Typography variant="subtitle2">Settle in later payroll</Typography>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      <TextField label="Settlement month" type="month" size="small" value={month} disabled={disabled || busy}
        onChange={(event) => { setMonth(event.target.value); setRun(null); setError(null); }}
        slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: defaultMonth } }} />
      <Button size="small" disabled={disabled || busy || !validMonth || !currentYear?.id} onClick={prepare}>Calculate target payroll</Button>
      <Button size="small" variant="contained" disabled={disabled || busy || query.isFetching || query.isError || !status?.isCurrent || status.status !== 'SUCCEEDED'}
        onClick={apply}>Apply settlement</Button>
    </Stack>
    {status && <Typography variant="body2">Target payroll: {status.status.toLowerCase()}{!status.isCurrent && status.status === 'SUCCEEDED' ? ' (stale)' : ''}</Typography>}
    {(error || query.isError || status?.status === 'FAILED') && <Alert severity="error" action={<Button size="small" disabled={disabled || busy} onClick={prepare}>Retry</Button>}>
      {error || status?.errorMessage || 'Target payroll could not be loaded.'}</Alert>}
  </Stack>;
}
