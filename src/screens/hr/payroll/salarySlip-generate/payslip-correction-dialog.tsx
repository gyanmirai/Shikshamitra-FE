'use client';

import type { PayslipDocument, PayslipCorrection, PayslipCorrectionAttendance } from 'src/redux/hr/payslip-api';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { getIn, useFormik } from 'formik';
import { useRouter } from 'src/routes/hooks';
import { useRef, useState, useEffect } from 'react';
import { formatPayrollCurrency } from 'src/utils/payroll-currency';
import { PAYROLL_ISSUE_LABELS } from 'src/constants/payroll-issues';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { focusFirstFormikError } from 'src/components/custom-stepper/formik-validation';
import { Alert, Stack, Table, Button, Skeleton, MenuItem, TableRow, TextField, TableBody, TableCell, TableHead, Typography, DialogActions, TableContainer } from '@mui/material';
import { useGetPayslipCorrectionsQuery, useStartPayslipCorrectionMutation, useApplyPayslipCorrectionMutation, useReviewPayslipCorrectionMutation, useCancelPayslipCorrectionMutation, useCalculatePayslipCorrectionMutation } from 'src/redux/hr/payslip-api';

import { payslipActionError } from './payslip-action-error';
import PayslipSettlementControls from './payslip-settlement-controls';
import { correctionAttendanceDraft, correctionAttendancePayload } from './payslip-correction-attendance';

import type { CorrectionAttendanceDraft } from './payslip-correction-attendance';

type Props = { document: PayslipDocument; canEdit: boolean; canReview: boolean; canApply: boolean; disabledReason?: string | null; onRetry?: () => void; onClose: () => void };
type Values = { reason: string; attendance: CorrectionAttendanceDraft[] };
const empty: Values = { reason: '', attendance: [] };
const activeStatuses = ['DRAFT', 'CALCULATED', 'REVIEWED'];
const statuses = { DRAFT: 'Draft', CALCULATED: 'Calculated', REVIEWED: 'Reviewed', APPLIED: 'Applied', CANCELLED: 'Cancelled' };

export default function PayslipCorrectionDialog({ document, canEdit, canReview, canApply, disabledReason, onRetry, onClose }: Props) {
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
  const latestHistory = useRef(history.currentData);
  latestHistory.current = history.currentData;
  const latestReadRequestId = useRef(history.requestId);
  latestReadRequestId.current = history.requestId;
  const ignoredReadRequestId = useRef<string | undefined>(undefined);
  const request = useRef<{ payload: string; key: string } | null>(null);
  const baseline = useRef<Values>(empty);
  const focusedSubmit = useRef(0);
  const current = history.currentData?.find((item) => activeStatuses.includes(item.status));
  // An acknowledged write is usable even if its follow-up history refresh fails.
  const correction = saved && (!current || saved.id === current.id) ? saved : current;
  const form = useFormik<Values>({
    initialValues: empty,
    validationSchema: Yup.object({
      reason: Yup.string().trim().required('Enter a correction reason.').max(1000),
      attendance: Yup.array().of(Yup.object({
        timeIn: Yup.string().matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Enter a valid time.', excludeEmptyString: true }),
        timeOut: Yup.string().matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Enter a valid time.', excludeEmptyString: true })
          .test('after-time-in', 'Time out must be after time in.', (value, context) => {
            const { timeIn, status } = context.parent;
            if (!value || !timeIn || (status === 2 && value === '00:00' && timeIn === '00:00')) return true;
            const punches = correctionAttendancePayload([context.parent], correction?.attendance ?? [])[0];
            // Validate the submitted timestamps, including seconds retained on untouched punches.
            return dayjs(punches.timeOut).isAfter(dayjs(punches.timeIn));
          }),
      })),
    }),
    onSubmit: async (values) => {
      if (!canEdit || disabledReason) return;
      setError(null);
      if (newDate || newStatus !== '') { setError('Add or clear the new attendance entry before recalculating.'); return; }
      try {
        let result: PayslipCorrection;
        if (correction) result = await calculate({ id: correction.id, concurrencyStamp: correction.concurrencyStamp,
          attendance: correctionAttendancePayload(values.attendance, correction.attendance) }).unwrap();
        else {
          const payload = JSON.stringify({ documentId: document.id, reason: values.reason.trim() });
          if (request.current?.payload !== payload) request.current = { payload, key: crypto.randomUUID() };
          result = await start({ documentId: document.id, reason: values.reason.trim(), idempotencyKey: request.current.key }).unwrap();
        }
        accept(result);
      } catch (problem) { setError(payslipActionError(problem, 'The correction could not be saved.')); }
    },
  });
  function accept(result: PayslipCorrection) {
    setSaved(result);
    observed.current = latestHistory.current;
    // An already-started read cannot replace the calculation or review just acknowledged.
    ignoredReadRequestId.current = latestReadRequestId.current;
    baseline.current = { reason: result.reason, attendance: correctionAttendanceDraft(result.attendance) };
    form.resetForm({ values: baseline.current });
  }
  const { isSubmitting, dirty, resetForm } = form;
  useEffect(() => {
    if (!form.submitCount) focusedSubmit.current = 0;
    else if (!isSubmitting && !form.isValidating && form.submitCount > focusedSubmit.current) {
      focusedSubmit.current = form.submitCount;
      focusFirstFormikError(form.errors);
    }
  }, [form.submitCount, form.isValidating, form.errors, isSubmitting]);
  useEffect(() => {
    if (!history.currentData || history.currentData === observed.current || busy || isSubmitting || history.isFetching || history.isError) return;
    observed.current = history.currentData;
    if (history.requestId && history.requestId === ignoredReadRequestId.current) return;
    baseline.current = current ? { reason: current.reason, attendance: correctionAttendanceDraft(current.attendance) } : empty;
    if (!dirty) { setSaved(current ?? null); resetForm({ values: baseline.current }); }
  }, [current, history.currentData, history.requestId, history.isFetching, history.isError, busy, isSubmitting, dirty, resetForm]);
  const saving = busy || form.isSubmitting || settlementBusy;
  const pendingAttendance = !!newDate || newStatus !== '';
  const blockingHistoryLoad = history.isLoading || (!saved && history.isFetching && !form.dirty);
  const { requestNavigation, confirmation } = useUnsavedNavigation(form.dirty || pendingAttendance || settlementDirty,
    { push: router.push });
  const close = () => { if (!saving && !blockingHistoryLoad) requestNavigation(onClose); };
  const action = async (mode: 'review' | 'cancel' | 'apply') => {
    if (!correction || saving || !canEdit || disabledReason || (mode === 'review' && !canReview) || (mode === 'apply' && !canApply)) return;
    setBusy(true); setError(null);
    try {
      const args = { id: correction.id, concurrencyStamp: correction.concurrencyStamp };
      const result = await (mode === 'review' ? review(args) : mode === 'cancel' ? cancel(args) : apply(args)).unwrap();
      accept(result);
      if (mode !== 'review') onClose();
    } catch (problem) { setError(payslipActionError(problem, 'The correction could not be saved.')); }
    finally { setBusy(false); }
  };
  const candidate = correction?.candidate;
  const attentionIssues = candidate?.issueCodes.filter((code) => PAYROLL_ISSUE_LABELS[code]?.severity !== 'INFO') ?? [];
  const blocked = !canEdit || !!disabledReason || saving || blockingHistoryLoad || (!saved && history.isError);
  const addAttendance = () => {
    if (!correction || !newDate || newStatus === '' || blocked) return;
    if (dayjs(newDate).format('YYYY-MM-DD') !== newDate || newDate.slice(0, 7) !== correction.sourceMonth ||
      form.values.attendance.some((record) => record.date === newDate)) {
      setError('Choose an unrecorded date in the original pay period.'); return;
    }
    form.setFieldValue('attendance', [...form.values.attendance, { date: newDate, status: newStatus, timeIn: '', timeOut: '' }]
      .sort((first, second) => first.date.localeCompare(second.date)));
    setNewDate(''); setNewStatus(''); setError(null);
  };
  return <>
    <CustomDialog open title="Correct payroll" maxWidth="md" handleClose={close} disableClose={saving || blockingHistoryLoad}
      guardUnsavedChanges={false} hasForm={false}>
      <form onSubmit={form.handleSubmit}>
        <DialogScrollContent><Stack spacing={2}>
          {disabledReason && <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" role="status">{disabledReason}</Typography>
            {onRetry && <Button size="small" disabled={saving} onClick={onRetry}>Retry</Button>}
          </Stack>}
          {blockingHistoryLoad && <Stack aria-label="Loading correction"><Skeleton height={48} /><Skeleton height={180} /></Stack>}
          {history.isError && <Alert severity="error" action={<Button size="small" disabled={saving} onClick={() => history.refetch()}>Retry</Button>}>Correction history could not be refreshed.</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          {!blockingHistoryLoad && (!history.isError || saved || form.dirty) && <>
            <TextField label="Correction reason" size="small" name="reason" multiline minRows={2}
              value={form.values.reason} onChange={form.handleChange} onBlur={form.handleBlur} disabled={blocked || !!correction}
              error={!!(form.touched.reason && form.errors.reason)} helperText={form.touched.reason && form.errors.reason} />
            {correction && <>
              <Typography variant="body2">{statuses[correction.status]} · Original revision {document.revision} {paid ? 'remains paid and unchanged.' : 'remains issued until reissue.'}</Typography>
              <Stack spacing={1}>
                {form.values.attendance.map((record, index) => <Stack key={record.date} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField select size="small" label={dayjs(record.date).format('DD MMM')}
                    value={record.status} disabled={blocked} sx={{ flex: 1, minWidth: 0 }}
                    onChange={(event) => form.setFieldValue(`attendance.${index}.status`, Number(event.target.value))}>
                    <MenuItem value={0}>Present</MenuItem><MenuItem value={1}>Half-day leave</MenuItem><MenuItem value={2}>Full-day leave</MenuItem>
                  </TextField>
                  <Stack direction="row" spacing={1} sx={{ flex: 2, minWidth: 0 }}>
                    {(['timeIn', 'timeOut'] as const).map((field) => {
                      const name = `attendance[${index}].${field}`;
                      const fieldError = getIn(form.touched, name) && getIn(form.errors, name);
                      return <TextField key={field} type="time" size="small" fullWidth
                        label={`${field === 'timeIn' ? 'Time in' : 'Time out'} (${dayjs(record.date).format('DD MMM')})`}
                        name={name} value={record[field]} disabled={blocked} onChange={form.handleChange} onBlur={form.handleBlur}
                        error={!!fieldError} helperText={fieldError || undefined} sx={{ minWidth: 0 }}
                        slotProps={{ inputLabel: { shrink: true } }} />;
                    })}
                  </Stack>
                </Stack>)}
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
                <TableContainer role="region" aria-label="Correction comparison" tabIndex={0} sx={{ minWidth: 0 }}>
                <Table size="small" aria-label="Correction comparison" sx={{ '& .MuiTableCell-root': { px: { xs: 1, sm: 2 } } }}><TableHead><TableRow><TableCell>Amount</TableCell><TableCell align="right">Issued</TableCell><TableCell align="right">Recalculated</TableCell></TableRow></TableHead>
                  <TableBody>{[
                    ['Earned gross', correction.originalEarnings, candidate.totalEarnings],
                    ['Employee deductions', correction.originalDeductions, candidate.totalDeduction],
                    ['Net pay', correction.originalNetPay, candidate.netPay],
                    ['School cost', correction.originalEmployerCost, candidate.employerCost],
                  ].map(([label, before, after]) => <TableRow key={label}><TableCell>{label}</TableCell><TableCell align="right">{formatPayrollCurrency(before)}</TableCell><TableCell align="right">{formatPayrollCurrency(after)}</TableCell></TableRow>)}</TableBody>
                </Table>
                </TableContainer>
                {form.dirty && <Typography variant="body2">Recalculate to include your attendance changes.</Typography>}
                {!!attentionIssues.length && <Alert severity={attentionIssues.some((code) => PAYROLL_ISSUE_LABELS[code]?.severity === 'CRITICAL') ? 'error' : 'warning'}
                  sx={{ overflowWrap: 'anywhere' }}>Payroll issues: {attentionIssues.map((code) => PAYROLL_ISSUE_LABELS[code]?.label || code).join(', ')}</Alert>}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  {[['Earnings', candidate.earningComponents], ['Employee deductions', candidate.deductionComponents], ['Employer contributions', candidate.employerContributions]]
                    .filter(([, components]) => (components as { name: string; amount: number }[]).length > 0).map(([label, components]) =>
                    <Stack key={label as string} spacing={0.5} flex={1}><Typography variant="subtitle2">{label as string}</Typography>
                      {(components as { name: string; amount: number }[]).map((item, index) => <Typography key={`${item.name}-${index}`} variant="body2">{item.name}: {formatPayrollCurrency(item.amount)}</Typography>)}
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
          <Button size="small" onClick={close} disabled={saving || blockingHistoryLoad}>Close</Button>
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
