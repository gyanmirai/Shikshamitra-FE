'use client';

import type { RootState } from 'src/redux/store';
import type { RecordsOutcome } from 'src/redux/student/records/student-records-types';
import type { StudentTransition, TransitionRow } from 'src/redux/student/records/student-record-transitions-api';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { Box, Stack, Alert, Button, Skeleton, TextField, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { formatNumber } from 'src/utils/formate_number';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';
import { shikshaMitraToast } from 'src/components/toast';
import {
  useGetSchoolExitSummaryQuery,
  useGetStudentRecordTransitionQuery,
  usePreviewStudentRecordTransitionsMutation,
  useSubmitStudentRecordTransitionsMutation,
  useDecideStudentRecordTransitionMutation,
} from 'src/redux/student/records/student-record-transitions-api';

import StudentAssignmentDrawer from '../onboarding/student-setup/student-assignment-drawer';

const exitTypes = [
  { value: 'Withdraw', label: 'Withdrawal' },
  { value: 'Transfer', label: 'Transfer' },
  { value: 'Graduate', label: 'Graduation' },
];
const schema = Yup.object({
  outcome: Yup.string().oneOf(exitTypes.map((x) => x.value)).required('Choose an exit type.'),
  date: Yup.string().required('Choose a leaving date.').test('date', 'Choose a valid leaving date.', (value) => Boolean(value && dayjs(value).isValid())),
  reason: Yup.string().trim().min(3, 'Explain the exit.').max(1000).required('Enter a reason.'),
});
type Submission = { academicYearId: string; idempotencyKey: string; items: TransitionRow[] };
type Props = {
  studentId: string;
  academicYearId: string;
  studentName?: string;
  grNumber?: string;
  className?: string;
  status?: number | string;
  transition?: StudentTransition;
  onClose: () => void;
  onSaved?: () => void;
};

export default function SchoolExitDrawer({ studentId, academicYearId, studentName, grNumber, className, status, transition, onClose, onSaved }: Props) {
  const router = useRouter();
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear?.id);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(permissions, 'Students.Records.Transitions.View');
  const canWrite = canView && hasGrantedPermission(permissions, 'Students.Records.Transitions.Add');
  const initialYear = useRef(currentYear);
  const yearChanged = currentYear !== initialYear.current;
  const [discard, setDiscard] = useState(false);
  const [approvalReason, setApprovalReason] = useState('');
  const [approvalTouched, setApprovalTouched] = useState(false);
  const [rejectReasonRequired, setRejectReasonRequired] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [uncertain, setUncertain] = useState<Submission | null>(null);
  const key = useRef(crypto.randomUUID());
  const inFlight = useRef(false);
  const [preview, previewState] = usePreviewStudentRecordTransitionsMutation();
  const [submit, submitState] = useSubmitStudentRecordTransitionsMutation();
  const [decide, decideState] = useDecideStudentRecordTransitionMutation();
  const form = useFormik({ initialValues: { outcome: 'Withdraw', date: dayjs().format('YYYY-MM-DD'), reason: '' }, validationSchema: schema, onSubmit: () => requestExit() });
  const read = useGetStudentRecordTransitionQuery(transition?.id ?? '', { skip: !transition || !canView });
  // Never use the captured table row as current decision authority.
  const saved = transition && canView && !read.isError ? read.currentData : undefined;
  const outcome = saved?.outcome ?? transition?.outcome ?? form.values.outcome as RecordsOutcome;
  const validDate = Boolean(form.values.date && dayjs(form.values.date).isValid());
  const effectiveDate = saved?.effectiveDate ?? transition?.effectiveDate ?? (validDate ? dayjs(form.values.date).toISOString() : undefined);
  const summary = useGetSchoolExitSummaryQuery({ studentId, academicYearId, outcome, effectiveDate }, { skip: yearChanged || !academicYearId || !canView || !effectiveDate });
  const data = canView ? summary.currentData : undefined;
  const pending = !transition && data?.pendingTransitions.length;
  const busy = previewState.isLoading || submitState.isLoading || decideState.isLoading || form.isSubmitting;
  const loading = summary.isFetching || Boolean(transition && read.isFetching);
  const missing = !data || Boolean(transition && !saved);
  const requiresReason = Boolean(saved?.outstandingOverrideRequired || data?.fees.status === 'Pending' || data?.library.status === 'Pending');
  const approvalError = approvalTouched && (requiresReason || rejectReasonRequired) && approvalReason.trim().length < 3;
  const failedRead = summary.isError || Boolean(transition && read.isError);
  const locked = busy || yearChanged || loading || missing || failedRead || !canWrite || Boolean(uncertain);
  const editLocked = busy || yearChanged || !canWrite || Boolean(uncertain);
  const navigation = useUnsavedNavigation(Boolean(form.dirty || approvalReason || uncertain), { push: router.push, blockNavigation: busy });
  const currentAuthority = useRef({ canWrite, yearChanged });
  currentAuthority.current = { canWrite, yearChanged };
  const close = () => {
    if (busy) return;
    if (form.dirty || approvalReason || uncertain) setDiscard(true);
    else onClose();
  };
  const success = (message: string) => {
    shikshaMitraToast.success({ message });
    onSaved?.();
    onClose();
  };
  async function requestExit() {
    if (inFlight.current || !data?.canSubmit || !canWrite || failedRead || !validDate || yearChanged || pending || transition) return;
    inFlight.current = true;
    setFailure(null);
    try {
      let body = uncertain;
      if (!body) {
        const row: TransitionRow = { studentId, outcome: form.values.outcome as RecordsOutcome, effectiveDate: dayjs(form.values.date).toISOString(), reason: form.values.reason.trim(), studentConcurrencyStamp: data.studentConcurrencyStamp, enrollmentConcurrencyStamp: data.enrollmentConcurrencyStamp };
        const result = await preview({ academicYearId, items: [row] }).unwrap();
        if (!result.canSubmit || !result.items[0]?.ready || result.items[0]?.issues.length) {
          setFailure(result.items[0]?.issues.map((issue) => issue.message).join(' ') || 'This exit cannot be submitted. Refresh the summary and review the school rules.');
          return;
        }
        if (!currentAuthority.current.canWrite || currentAuthority.current.yearChanged) return;
        body = { academicYearId, idempotencyKey: key.current, items: [{ ...row, studentConcurrencyStamp: result.items[0].studentConcurrencyStamp, enrollmentConcurrencyStamp: result.items[0].enrollmentConcurrencyStamp }] };
        setUncertain(body);
      }
      const result = await submit(body).unwrap();
      if (!result.items.length) { setUncertain(null); setFailure(result.exceptions.flatMap((item) => item.issues.map((issue) => issue.message)).join(' ') || 'The exit was not submitted. Refresh and retry.'); return; }
      success('School exit submitted under school approval rules.');
    } catch {
      setFailure('The request could not be confirmed. Your details are kept. Retry the same submission to safely check its result.');
    } finally {
      inFlight.current = false;
    }
  }
  const decision = async (command: 'approve' | 'reject') => {
    if (inFlight.current || !saved?.canApprove || locked) return;
    setApprovalTouched(true);
    setRejectReasonRequired(command === 'reject');
    if ((requiresReason || command === 'reject') && approvalReason.trim().length < 3) return;
    inFlight.current = true;
    setFailure(null);
    try {
      await decide({ id: saved.id, command, concurrencyStamp: saved.concurrencyStamp, remarks: approvalReason.trim(), ...(command === 'approve' ? { outstandingReason: approvalReason.trim() } : {}) }).unwrap();
      success(command === 'approve' ? 'School exit approval recorded.' : 'School exit rejected.');
    } catch {
      setFailure('The decision could not be confirmed. Your reason is kept. Refresh to check the current stage before retrying.');
    } finally {
      inFlight.current = false;
    }
  };
  const errorFor = (name: keyof typeof form.values) => Boolean(form.touched[name] && form.errors[name]);
  return (
    <>
      <StudentAssignmentDrawer title="School Exit" titleInfo="Request or independently review a school exit. Attendance, financial, library and document history is retained." busy={busy} onClose={close}
        actions={<Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ p: 2 }}>
          <Button size="small" variant="outlined" color="inherit" disabled={busy} startIcon={<Iconify icon={GlobalIcons.cancel} />} onClick={close}>{transition ? 'Close' : 'Cancel'}</Button>
          {transition && canWrite && saved?.canApprove && <Button size="small" color="error" disabled={locked} onClick={() => decision('reject')}>Reject</Button>}
          {transition ? canWrite && saved?.canApprove && <Button size="small" variant="contained" color="inherit" disabled={locked} startIcon={<Iconify icon={GlobalIcons.approveDecision} />} onClick={() => decision('approve')}>Approve Exit</Button> : <Button size="small" variant="contained" color="inherit" disabled={busy || yearChanged || loading || missing || failedRead || !canWrite || !validDate || !data?.canSubmit || Boolean(pending)} startIcon={<Iconify icon={GlobalIcons.submit} />} onClick={() => uncertain ? requestExit() : form.submitForm()}>{uncertain ? 'Retry Submission' : 'Submit for Approval'}</Button>}
        </Stack>}>
        <FormBusyRegion busy={busy} label="Saving school exit…">
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" spacing={1}>
              <Box><Typography variant="subtitle1">{!canView ? 'Restricted student identity' : failedRead ? 'Unverified student identity' : data ? data.studentName ?? 'Restricted student identity' : studentName ?? 'Student'}</Typography><Typography variant="body2" color="text.secondary">{canView && !failedRead && data?.studentName ? [grNumber, className].filter(Boolean).join(' · ') : ''}</Typography></Box>
              <Label color="warning">{saved?.status ?? (transition ? 'Loading request' : 'New Request')}</Label>
            </Stack>
            {canView && status !== undefined && <Typography variant="caption" color="text.secondary">Student status: {({ '6': 'Active', '7': 'Inactive', '8': 'Left' } as Record<string, string>)[String(status)] ?? (status === 'Enrolled' ? 'Active' : status)}</Typography>}
            {!canView && <Alert severity="warning">You no longer have permission to view school exits.</Alert>}
            {yearChanged && <Alert severity="warning">Academic year changed. Close and reopen School Exit in the required year.</Alert>}
            {(summary.isError || read.isError) && <Alert severity="error" action={canView && !yearChanged && effectiveDate ? <Button color="inherit" onClick={() => { summary.refetch(); if (transition) read.refetch(); }}>Retry</Button> : undefined}>School exit information could not be loaded. Clearance is unverified.</Alert>}
            {loading && <Stack spacing={1}><Skeleton height={60} /><Skeleton height={60} /><Skeleton height={60} /></Stack>}
            {data && canView && !summary.isError && <FormSectionCard title="Exit Summary" icon={GlobalIcons.admissionDetails} descriptionTooltip="Current owner-backed evidence for the chosen exit type and leaving date. Expanding a row shows its available details." contentSpacing={1}>
              {[
                { title: 'Fees', icon: GlobalIcons.receiptIcon, status: data.fees.status === 'Clear' ? 'Clear' : data.fees.outstandingAmount !== null ? `${formatNumber(data.fees.outstandingAmount, 'INR')} outstanding` : data.fees.status, detail: data.fees.detail },
                { title: 'Library', icon: GlobalIcons.issueBook, status: data.library.pendingCount > 0 ? `${data.library.pendingCount} books pending` : data.library.status, detail: data.library.detail },
                { title: 'Documents', icon: GlobalIcons.documentIcon, status: data.documents.status === 'NotApplicable' ? 'No uploaded documents' : data.documents.status, detail: data.documents.detail },
              ].map((item) => <Accordion key={item.title} disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: 1, borderColor: 'divider' }}><AccordionSummary expandIcon={<Iconify icon={GlobalIcons.moveDown} />} aria-label={`${item.title}: ${item.status}`}><Stack direction="row" spacing={1} alignItems="center" sx={{ width: 1 }}><Iconify icon={item.icon} /><Typography variant="subtitle2" sx={{ flex: 1 }}>{item.title}</Typography><Label color={item.status === 'Clear' ? 'success' : /pending|outstanding/i.test(item.status) ? 'warning' : 'default'}>{item.status}</Label></Stack></AccordionSummary><AccordionDetails><Typography variant="body2">{item.detail}</Typography>{item.title === 'Documents' && data.documents.items.map((doc, i) => <Typography key={`${doc.name}-${i}`} variant="body2">{doc.name}: {doc.status}</Typography>)}</AccordionDetails></Accordion>)}
            </FormSectionCard>}
            {Boolean(pending) && <Alert severity="info">An exit request is already pending. Review it in Year-End &amp; Transitions.</Alert>}
            <FormSectionCard title="Exit Details" icon={GlobalIcons.transfer} descriptionTooltip="The submitted exit type, leaving date and reason are reviewed under the school's transition rules.">
              {transition ? <Stack spacing={1}><Typography variant="body2">Exit type: {exitTypes.find((x) => x.value === outcome)?.label ?? outcome}</Typography><Typography variant="body2">Leaving date: {dayjs(effectiveDate).format('DD MMM YYYY')}</Typography><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>Reason: {saved?.reason ?? 'Loading submitted reason…'}</Typography></Stack> : <Stack spacing={2}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <ShakingTextField error={errorFor('outcome')}><CustomSelect label="Exit type" required value={form.values.outcome} options={exitTypes} onChange={(value) => form.setFieldValue('outcome', value)} disabled={editLocked} error={errorFor('outcome')} helperText={form.touched.outcome ? form.errors.outcome : undefined} /></ShakingTextField>
                  <ShakingTextField error={errorFor('date')}><TextField fullWidth size="small" required type="date" name="date" label="Leaving date" value={form.values.date} onChange={form.handleChange} onBlur={form.handleBlur} disabled={editLocked} error={errorFor('date')} helperText={form.touched.date ? form.errors.date : undefined} slotProps={{ inputLabel: { shrink: true } }} /></ShakingTextField>
                </Box>
                <ShakingTextField error={errorFor('reason')}><TextField fullWidth size="small" required multiline minRows={3} name="reason" label="Reason" value={form.values.reason} onChange={form.handleChange} onBlur={form.handleBlur} disabled={editLocked} error={errorFor('reason')} helperText={form.touched.reason ? form.errors.reason : undefined} /></ShakingTextField>
              </Stack>}
            </FormSectionCard>
            {transition && saved?.canApprove && <FormSectionCard title="Approval" icon={GlobalIcons.approveDecision} descriptionTooltip="Only the current authorized independent approval stage can decide this request. Pending fees and books require a recorded reason.">
              {requiresReason && <Alert severity="warning">Pending fees or books need an approval reason.</Alert>}
              
              <ShakingTextField error={approvalError}><TextField fullWidth size="small" multiline minRows={2} label="Approval reason" required={requiresReason || rejectReasonRequired} value={approvalReason} onChange={(event) => setApprovalReason(event.target.value)} disabled={locked} error={approvalError} helperText={approvalError ? 'Enter an approval reason for pending fees or books.' : 'A reason is also required when rejecting the exit.'} /></ShakingTextField>
            </FormSectionCard>}
            {!transition && requiresReason && <Alert severity="warning">Pending items need independent approval.</Alert>}
            {requiresReason && <Typography variant="body2" color="text.secondary">Fees and books remain pending after exit.</Typography>}
            {!transition && <Typography variant="body2" color="text.secondary">Student remains active while the request is pending.</Typography>}
            {failure && <Alert severity="error" action={transition && canView && !yearChanged && effectiveDate ? <Button color="inherit" onClick={() => { read.refetch(); summary.refetch(); }}>Refresh</Button> : undefined}>{failure}</Alert>}
          </Stack>
        </FormBusyRegion>
      </StudentAssignmentDrawer>
      <ConfirmDialog open={discard} onClose={() => setDiscard(false)} title="Discard Unsaved Changes?" content={uncertain ? 'A submission may already be recorded. Check Year-End & Transitions before starting another request.' : 'Your unsaved school exit details will be discarded.'} cancelText="Keep editing" action={<Button color="error" variant="contained" onClick={onClose}>Discard changes</Button>} />
      {navigation.confirmation}
    </>
  );
}
