'use client';

import type { PayslipDocument, PayslipCorrection, PayslipCorrectionAttendance } from 'src/redux/hr/payslip-api';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRouter } from 'src/routes/hooks';
import { useRef, useState, useEffect } from 'react';
import { fCurrency } from 'src/utils/format-number';
import { PAYROLL_ISSUE_LABELS } from 'src/constants/payroll-issues';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Stack, Table, Button, Skeleton, MenuItem, TableRow, TextField, TableBody, TableCell, TableHead, Typography, DialogActions } from '@mui/material';
import { useGetPayslipCorrectionsQuery, useStartPayslipCorrectionMutation, useApplyPayslipCorrectionMutation, useReviewPayslipCorrectionMutation, useCancelPayslipCorrectionMutation, useCalculatePayslipCorrectionMutation } from 'src/redux/hr/payslip-api';

import PayslipSettlementControls from './payslip-settlement-controls';

type Props = { document: PayslipDocument; canEdit: boolean; canReview: boolean; canApply: boolean; onClose: () => void };
type Values = { reason: string; attendance: PayslipCorrectionAttendance[] };
const empty: Values = { reason: '', attendance: [] };
const activeStatuses = ['DRAFT', 'CALCULATED', 'REVIEWED'];
const statuses = { DRAFT: 'Draft', CALCULATED: 'Calculated', REVIEWED: 'Reviewed', APPLIED: 'Applied', CANCELLED: 'Cancelled' };

export default function PayslipCorrectionDialog({ document, canEdit, canReview, canApply, onClose }: Props) {
  const router = useRouter();
  const history = useGetPayslipCorrectionsQuery(document.id);
  const [start] = useStartPayslipCorrectionMutation();
  const [calculate] = useCalculatePayslipCorrectionMutation();
  const [review] = useReviewPayslipCorrectionMutation();
  const [cancel] = useCancelPayslipCorrectionMutation();
  const [apply] = useApplyPayslipCorrectionMutation();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [settlementBusy, setSettlementBusy] = useState(false);
  const [settlementDirty, setSettlementDirty] = useState(false);
  const paid = document.paymentStatus === 'Paid';
  const [newDate, setNewDate] = useState('');
  const [newStatus, setNewStatus] = useState<'' | PayslipCorrectionAttendance['status']>('');
  const [saved, setSaved] = useState<PayslipCorrection | null>(null);
  const observed = useRef<PayslipCorrection[] | undefined>(undefined);
  const request = useRef<{ payload: string; key: string } | null>(null);
  const baseline = useRef<Values>(empty);
  const current = history.currentData?.find((item) => activeStatuses.includes(item.status));
  // An acknowledged write is usable even if its follow-up history refresh fails.
  const correction = saved && (!current || saved.id === current.id) ? saved : current;
  const form = useFormik<Values>({
    initialValues: empty,
    validationSchema: Yup.object({ reason: Yup.string().trim().required('Enter a correction reason.').max(1000) }),
    onSubmit: async (values) => {
      setError(null);
      if (newDate || newStatus !== '') { setError('Add or clear the new attendance entry before recalculating.'); return; }
      try {
        let result: PayslipCorrection;
        if (correction) result = await calculate({ id: correction.id, concurrencyStamp: correction.concurrencyStamp, attendance: values.attendance }).unwrap();
        else {
          const payload = JSON.stringify({ documentId: document.id, reason: values.reason.trim() });
          if (request.current?.payload !== payload) request.current = { payload, key: crypto.randomUUID() };
          result = await start({ documentId: document.id, reason: values.reason.trim(), idempotencyKey: request.current.key }).unwrap();
        }
        accept(result);
      } catch (problem) { setError(parseApiProblemDetail(problem).detail || 'The correction could not be saved.'); }
    },
  });
  function accept(result: PayslipCorrection) {
    setSaved(result);
    observed.current = history.currentData;
    baseline.current = { reason: result.reason, attendance: result.attendance };
    form.resetForm({ values: baseline.current });
  }
  const { isSubmitting, dirty, resetForm } = form;
  useEffect(() => {
    if (!history.currentData || history.currentData === observed.current || busy || isSubmitting) return;
    observed.current = history.currentData;
    baseline.current = current ? { reason: current.reason, attendance: current.attendance } : empty;
    if (!dirty) { setSaved(current ?? null); resetForm({ values: baseline.current }); }
  }, [current, history.currentData, busy, isSubmitting, dirty, resetForm]);
  const saving = busy || form.isSubmitting || settlementBusy;
  const pendingAttendance = !!newDate || newStatus !== '';
  const { requestNavigation, confirmation } = useUnsavedNavigation(form.dirty || pendingAttendance || settlementDirty,
    { push: router.push });
  const close = () => { if (!saving && !history.isLoading) requestNavigation(onClose); };
  const action = async (mode: 'review' | 'cancel' | 'apply') => {
    if (!correction || saving) return;
    setBusy(true); setError(null);
    try {
      const args = { id: correction.id, concurrencyStamp: correction.concurrencyStamp };
      const result = await (mode === 'review' ? review(args) : mode === 'cancel' ? cancel(args) : apply(args)).unwrap();
      accept(result);
      if (mode !== 'review') onClose();
    } catch (problem) { setError(parseApiProblemDetail(problem).detail || 'The correction could not be saved.'); }
    finally { setBusy(false); }
  };
  const candidate = correction?.candidate;
  const attentionIssues = candidate?.issueCodes.filter((code) => PAYROLL_ISSUE_LABELS[code]?.severity !== 'INFO') ?? [];
  const blocked = !canEdit || saving || history.isLoading || (!correction && history.isError);
  const addAttendance = () => {
    if (!correction || !newDate || newStatus === '' || blocked) return;
    if (dayjs(newDate).format('YYYY-MM-DD') !== newDate || newDate.slice(0, 7) !== correction.sourceMonth ||
      form.values.attendance.some((record) => record.date === newDate)) {
      setError('Choose an unrecorded date in the original pay period.'); return;
    }
    form.setFieldValue('attendance', [...form.values.attendance, { date: newDate, status: newStatus, timeIn: null, timeOut: null }]
      .sort((first, second) => first.date.localeCompare(second.date)));
    setNewDate(''); setNewStatus(''); setError(null);
  };
  return <>
    <CustomDialog open title="Correct payroll" maxWidth="md" handleClose={close} disableClose={saving || history.isLoading}
      guardUnsavedChanges={false} hasForm={false}>
      <form onSubmit={form.handleSubmit}>
        <DialogScrollContent><Stack spacing={2}>
          {history.isLoading && <Stack aria-label="Loading correction"><Skeleton height={48} /><Skeleton height={180} /></Stack>}
          {history.isError && <Alert severity="error" action={<Button size="small" disabled={saving} onClick={() => history.refetch()}>Retry</Button>}>Correction history could not be refreshed.</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          {!history.isLoading && <>
            <TextField label="Correction reason" size="small" name="reason" multiline minRows={2}
              value={form.values.reason} onChange={form.handleChange} onBlur={form.handleBlur} disabled={blocked || !!correction}
              error={!!(form.touched.reason && form.errors.reason)} helperText={form.touched.reason && form.errors.reason} />
            {correction && <>
              <Typography variant="body2">{statuses[correction.status]} · Original revision {document.revision} {paid ? 'remains paid and unchanged.' : 'remains issued until reissue.'}</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap">
                {form.values.attendance.map((record, index) => <TextField key={record.date} select size="small" label={dayjs(record.date).format('DD MMM')}
                  value={record.status} disabled={blocked} sx={{ minWidth: 170 }}
                  onChange={(event) => form.setFieldValue(`attendance.${index}.status`, Number(event.target.value))}>
                  <MenuItem value={0}>Present</MenuItem><MenuItem value={1}>Half-day leave</MenuItem><MenuItem value={2}>Full-day leave</MenuItem>
                </TextField>)}
              </Stack>
              {!form.values.attendance.length && <Typography variant="body2">No recorded attendance. Recalculation uses the existing payroll rules for missing attendance.</Typography>}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField label="Attendance date" type="date" size="small" value={newDate} disabled={blocked}
                  onChange={(event) => setNewDate(event.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: {
                    min: `${correction.sourceMonth}-01`, max: dayjs(`${correction.sourceMonth}-01`).endOf('month').format('YYYY-MM-DD') } }} />
                <TextField label="Attendance" select size="small" value={newStatus} disabled={blocked} sx={{ minWidth: 170 }}
                  onChange={(event) => setNewStatus(Number(event.target.value) as PayslipCorrectionAttendance['status'])}>
                  <MenuItem value="" disabled>Select attendance</MenuItem><MenuItem value={0}>Present</MenuItem>
                  <MenuItem value={1}>Half-day leave</MenuItem><MenuItem value={2}>Full-day leave</MenuItem>
                </TextField>
                <Button size="small" disabled={blocked || !newDate || newStatus === ''} onClick={addAttendance}>Add attendance</Button>
              </Stack>
              {candidate && <>
                <Table size="small" aria-label="Correction comparison"><TableHead><TableRow><TableCell>Amount</TableCell><TableCell align="right">Issued</TableCell><TableCell align="right">Recalculated</TableCell></TableRow></TableHead>
                  <TableBody>{[
                    ['Earned gross', correction.originalEarnings, candidate.totalEarnings],
                    ['Employee deductions', correction.originalDeductions, candidate.totalDeduction],
                    ['Net pay', correction.originalNetPay, candidate.netPay],
                    ['School cost', correction.originalEmployerCost, candidate.employerCost],
                  ].map(([label, before, after]) => <TableRow key={label}><TableCell>{label}</TableCell><TableCell align="right">{fCurrency(before)}</TableCell><TableCell align="right">{fCurrency(after)}</TableCell></TableRow>)}</TableBody>
                </Table>
                {form.dirty && <Typography variant="body2">Recalculate to include your attendance changes.</Typography>}
                {!!attentionIssues.length && <Alert severity={attentionIssues.some((code) => PAYROLL_ISSUE_LABELS[code]?.severity === 'CRITICAL') ? 'error' : 'warning'}
                  sx={{ overflowWrap: 'anywhere' }}>Payroll issues: {attentionIssues.map((code) => PAYROLL_ISSUE_LABELS[code]?.label || code).join(', ')}</Alert>}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  {[['Earnings', candidate.earningComponents], ['Employee deductions', candidate.deductionComponents], ['Employer contributions', candidate.employerContributions]].map(([label, components]) =>
                    <Stack key={label as string} spacing={0.5} flex={1}><Typography variant="subtitle2">{label as string}</Typography>
                      {(components as { name: string; amount: number }[]).map((item, index) => <Typography key={`${item.name}-${index}`} variant="body2">{item.name}: {fCurrency(item.amount)}</Typography>)}
                    </Stack>)}
                </Stack>
              </>}
            </>}
            {paid && correction?.status === 'REVIEWED' && <PayslipSettlementControls correction={correction}
              disabled={blocked || !canApply || form.dirty || pendingAttendance} onSettled={onClose}
              onBusy={setSettlementBusy} onDirty={setSettlementDirty} />}
            {!!history.currentData?.some((item) => !activeStatuses.includes(item.status)) && <Stack spacing={1}>
              <Typography variant="subtitle2">Previous corrections</Typography>
              {history.currentData.filter((item) => !activeStatuses.includes(item.status)).map((item) => <Typography key={item.id} variant="body2">{statuses[item.status]} · {item.reason}</Typography>)}
            </Stack>}
          </>}
        </Stack></DialogScrollContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button size="small" onClick={close} disabled={saving || history.isLoading}>Close</Button>
          {correction && <Button size="small" disabled={blocked} onClick={() => requestNavigation(() => { action('cancel'); })}>Cancel correction</Button>}
          <Button size="small" variant="outlined" type="submit" disabled={blocked || pendingAttendance}>{correction ? 'Recalculate' : 'Start correction'}</Button>
          {correction?.status === 'CALCULATED' && <Button size="small" disabled={blocked || !canReview || form.dirty || pendingAttendance} onClick={() => action('review')}>Mark reviewed</Button>}
          {!paid && correction?.status === 'REVIEWED' && <Button size="small" variant="contained" disabled={blocked || !canApply || form.dirty || pendingAttendance} onClick={() => action('apply')}>Reissue payslip</Button>}
        </DialogActions>
      </form>
    </CustomDialog>
    {confirmation}
  </>;
}
