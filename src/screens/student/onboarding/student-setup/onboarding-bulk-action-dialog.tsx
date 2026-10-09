'use client';

import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Chip,
  Alert,
  Paper,
  Stack,
  Button,
  Divider,
  Typography,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  useActivateStudentOnboardingMutation,
  useRefreshStudentOnboardingReadinessMutation,
} from 'src/redux/student/onboarding/student-onboarding-api';

import type { StudentOnboardingItem } from './student-onboarding-model';

export type BulkOnboardingAction = 'review-readiness' | 'activate';

type ActionResult = { success: boolean; message: string };

type OnboardingBulkActionDialogProps = {
  action: BulkOnboardingAction | null;
  students: StudentOnboardingItem[];
  onClose: () => void;
};

export default function OnboardingBulkActionDialog({
  action,
  students,
  onClose,
}: OnboardingBulkActionDialogProps) {
  const [activate] = useActivateStudentOnboardingMutation();
  const [refresh] = useRefreshStudentOnboardingReadinessMutation();
  const [busy, setBusy] = useState(false);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, ActionResult>>({});
  const [runProgress, setRunProgress] = useState({ completed: 0, total: 0 });
  const isActivation = action === 'activate';
  const actionableStudents = isActivation
    ? students.filter(
        (student) => student.source === 'onboarding-case' && student.backendStatus === 2
      )
    : students;
  const skippedCount = students.length - actionableStudents.length;
  const completedCount = actionableStudents.filter(
    (student) => results[student.id]?.success
  ).length;
  const failedCount = actionableStudents.filter(
    (student) => results[student.id]?.success === false
  ).length;
  const processedCount = completedCount + failedCount;
  const allComplete = actionableStudents.length > 0 && completedCount === actionableStudents.length;
  const noActionableStudents = actionableStudents.length === 0;
  const actionableCountLabel = `${actionableStudents.length} ${actionableStudents.length === 1 ? 'student' : 'students'}`;

  useEffect(() => {
    setResults({});
    setActiveStudentId(null);
    setRunProgress({ completed: 0, total: 0 });
  }, [action]);

  const close = () => {
    if (busy) return;
    setResults({});
    onClose();
  };

  const run = async () => {
    if (!action || busy || !actionableStudents.length || allComplete) return;
    const pendingStudents = actionableStudents.filter((student) => !results[student.id]?.success);
    setRunProgress({ completed: 0, total: pendingStudents.length });
    setBusy(true);
    try {
      await pendingStudents.reduce(async (previous, student) => {
        await previous;
        setActiveStudentId(student.id);
        try {
          if (isActivation) {
            await activate({
              id: student.id,
              concurrencyStamp: student.concurrencyStamp,
              idempotencyKey: crypto.randomUUID(),
            }).unwrap();
          } else {
            await refresh({
              id: student.id,
              concurrencyStamp: student.concurrencyStamp,
            }).unwrap();
          }
          setResults((current) => ({
            ...current,
            [student.id]: {
              success: true,
              message: isActivation
                ? 'Enrollment activated. Required service handoffs continue separately.'
                : 'Readiness refreshed.',
            },
          }));
        } catch {
          setResults((current) => ({
            ...current,
            [student.id]: {
              success: false,
              message: 'Not saved. Open the latest case to resolve blockers or changed data.',
            },
          }));
        } finally {
          setRunProgress((current) => ({ ...current, completed: current.completed + 1 }));
        }
      }, Promise.resolve());
    } finally {
      setActiveStudentId(null);
      setBusy(false);
    }
  };

  let primaryLabel = `${isActivation ? 'Activate' : 'Refresh'} ${actionableCountLabel}`;
  if (failedCount > 0) {
    primaryLabel = `Retry ${failedCount} ${failedCount === 1 ? 'student' : 'students'}`;
  }
  if (busy) primaryLabel = isActivation ? 'Activating…' : 'Refreshing…';

  return (
    <CustomDialog
      open={Boolean(action)}
      handleClose={close}
      title={isActivation ? 'Activate Selected Students' : 'Refresh Selected Students'}
      maxWidth="sm"
      hasForm={false}
      disableClose={busy}
      aria-describedby={isActivation ? 'bulk-onboarding-action-description' : undefined}
    >
      <DialogScrollContent dividers>
        <Stack spacing={2}>
          {isActivation && (
            <Typography
              id="bulk-onboarding-action-description"
              variant="body2"
              color="text.secondary"
            >
              Activation commits placement and identifiers and creates the enrollment.
            </Typography>
          )}

          {isActivation && skippedCount > 0 && (
            <Alert severity="warning" variant="outlined">
              {actionableStudents.length === 0
                ? 'No selected students are ready to activate. Review their status in the list below.'
                : `${skippedCount} of ${students.length} selected ${students.length === 1 ? 'student is' : 'students are'} not ready and will be skipped.`}
            </Alert>
          )}

          {processedCount > 0 && !busy && (
            <Alert severity={failedCount > 0 ? 'warning' : 'success'}>
              {isActivation
                ? `${completedCount} of ${actionableStudents.length} ready ${actionableStudents.length === 1 ? 'student' : 'students'} activated.`
                : `${completedCount} of ${students.length} ${students.length === 1 ? 'student' : 'students'} refreshed.`}
              {failedCount > 0
                ? ` ${failedCount} ${failedCount === 1 ? 'student needs' : 'students need'} attention.`
                : ''}
            </Alert>
          )}

          {busy && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.75 }}
              >
                Processing {Math.min(runProgress.completed + 1, runProgress.total)} of{' '}
                {runProgress.total}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={runProgress.total ? (runProgress.completed / runProgress.total) * 100 : 0}
                aria-label="Student processing progress"
              />
            </Box>
          )}

          {students.length === 0 ? (
            <Alert severity="info">No students are selected.</Alert>
          ) : (
            <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 1.5 }}>
              <Stack divider={<Divider flexItem />}>
                {students.map((student) => {
                  const result = results[student.id];
                  const isProcessing = busy && activeStudentId === student.id;
                  const isSkipped =
                    isActivation &&
                    (student.source !== 'onboarding-case' || student.backendStatus !== 2);
                  let status = isActivation ? 'Ready to activate' : 'Pending';
                  let statusColor: 'default' | 'info' | 'success' | 'warning' = isActivation
                    ? 'success'
                    : 'default';
                  if (isSkipped) {
                    status =
                      student.backendStatus === 4
                        ? 'Already activated'
                        : student.backendStatus === 5
                          ? 'Cancelled'
                          : 'Not ready';
                    statusColor =
                      student.backendStatus === 4
                        ? 'success'
                        : student.backendStatus === 5
                          ? 'default'
                          : 'warning';
                  }
                  if (result) {
                    status = result.success
                      ? isActivation
                        ? 'Activated'
                        : 'Refreshed'
                      : 'Needs attention';
                    statusColor = result.success ? 'success' : 'warning';
                  }
                  if (isProcessing) {
                    status = isActivation ? 'Activating…' : 'Refreshing…';
                    statusColor = 'info';
                  }

                  return (
                    <Box key={student.id} sx={{ px: 1.5, py: 1.25 }}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle2">{student.studentName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {student.applicationNumber}
                          </Typography>
                        </Box>
                        <Chip label={status} color={statusColor} size="small" variant="outlined" />
                      </Stack>
                      {result && !result.success && !isProcessing && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 0.75 }}
                        >
                          {result.message}
                        </Typography>
                      )}
                      {isSkipped && student.backendStatus !== 4 && student.backendStatus !== 5 && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 0.75 }}
                        >
                          {student.primaryBlocker ||
                            'Complete the required readiness checks in this student case.'}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            </Paper>
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:close" width={16} />}
          disabled={busy}
          onClick={close}
        >
          {processedCount > 0 || noActionableStudents ? 'Close' : 'Cancel'}
        </Button>
        {!allComplete && !noActionableStudents && (
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon={isActivation ? 'mdi:check' : 'mdi:refresh'} width={16} />}
            loading={busy}
            disabled={busy}
            onClick={run}
          >
            {primaryLabel}
          </Button>
        )}
      </DialogActions>
    </CustomDialog>
  );
}
