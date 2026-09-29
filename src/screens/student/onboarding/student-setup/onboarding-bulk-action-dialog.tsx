'use client';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Alert, Stack, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useActivateStudentOnboardingMutation, useRefreshStudentOnboardingReadinessMutation } from 'src/redux/student/onboarding/student-onboarding-api';

import type { StudentOnboardingItem } from './student-onboarding-model';

export type BulkOnboardingAction = 'review-readiness' | 'activate';

export default function OnboardingBulkActionDialog({ action, students, onClose }: {
  action: BulkOnboardingAction | null; students: StudentOnboardingItem[]; onClose: () => void;
}) {
  const [activate] = useActivateStudentOnboardingMutation();
  const [refresh] = useRefreshStudentOnboardingReadinessMutation();
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const close = () => { if (!busy) { setResults({}); onClose(); } };
  const run = async () => {
    if (!action || busy) return;
    setBusy(true);
    try {
      await students.filter(item => !results[item.id]?.success).reduce(async (previous, student) => {
        await previous;
        try {
          if (action === 'activate') {
            await activate({ id: student.id, concurrencyStamp: student.concurrencyStamp, idempotencyKey: crypto.randomUUID() }).unwrap();
          } else {
            await refresh({ id: student.id, concurrencyStamp: student.concurrencyStamp }).unwrap();
          }
          setResults(current => ({ ...current, [student.id]: { success: true, message: action === 'activate' ? 'Enrollment saved; required handoffs still determine completion.' : 'Readiness refreshed.' } }));
        } catch {
          setResults(current => ({ ...current, [student.id]: { success: false, message: 'Not saved. Open the latest case to resolve blockers or changed data.' } }));
        }
      }, Promise.resolve());
    } finally { setBusy(false); }
  };
  return <CustomDialog open={Boolean(action)} handleClose={close} title={action === 'activate' ? 'Activate selected students?' : 'Refresh selected students'} maxWidth="sm" hasForm={false}>
    <DialogScrollContent>
      <Stack spacing={1}>
        <Alert severity="info">Each student is validated and saved independently. Successful students are not repeated on retry.</Alert>
        {students.map(student => <Stack key={student.id} spacing={0.5}>
          <Typography variant="subtitle2">{student.studentName}</Typography>
          <Typography variant="caption" color={results[student.id]?.success ? 'success.main' : 'text.secondary'}>
            {results[student.id]?.message ?? `${student.applicationNumber} · Awaiting confirmation`}
          </Typography>
        </Stack>)}
      </Stack>
    </DialogScrollContent>
    <DialogActions>
      <Button size="small" disabled={busy} onClick={close}>Close</Button>
      <Button size="small" variant="contained" startIcon={<Iconify icon="mdi:check" />} onClick={run}
        disabled={busy || students.length === 0 || students.every(s => results[s.id]?.success)}>
        {busy ? 'Saving…' : 'Confirm'}
      </Button>
    </DialogActions>
  </CustomDialog>;
}
