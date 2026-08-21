import type {
  AdmissionApplication,
  AdmissionApplicationStage,
  AdmissionApplicationWorkflow,
} from 'src/redux/student/admissions/admission-applications-api';

import { Iconify } from 'src/components/iconify';
import { Card, Chip, Alert, Stack, Button, Typography, CardContent } from '@mui/material';

const STAGE_STATUS: Record<number, string> = { 0: 'Pending', 1: 'Active', 2: 'Completed', 3: 'Skipped', 4: 'Failed', 5: 'Cancelled' };

type Props = {
  application: AdmissionApplication;
  workflow?: AdmissionApplicationWorkflow;
  currentStage?: AdmissionApplicationStage;
  canAdvance: boolean;
  canSkip: boolean;
  canOverride: boolean;
  advancing: boolean;
  onAdvance: () => void;
  onSkip: () => void;
  onOverride: () => void;
};

export function ApplicationProgressCard({ application, workflow, currentStage, canAdvance, canSkip, canOverride, advancing, onAdvance, onSkip, onOverride }: Props) {
  const active = application.status === 1 && workflow?.status === 0 && workflow.currentStageInstanceId;
  return (
    <Card><CardContent>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h6">Application progress</Typography>
        <Chip size="small" label={['Draft', 'Submitted', 'Withdrawn', 'Rejected'][application.status]} />
      </Stack>
      {currentStage && workflow?.status === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Current stage: {currentStage.name}</Typography>
          <Typography variant="body2">Next required action: {workflow.nextRequiredAction ?? 'Complete the current workflow stage'}</Typography>
          <Typography variant="caption" color="text.secondary">
            Entered: {currentStage.enteredAt ? new Date(currentStage.enteredAt).toLocaleString() : 'Not recorded'}
            {currentStage.completionReason ? ` · Reason: ${currentStage.completionReason}` : ''}
          </Typography>
        </Alert>
      )}
      <Stack direction="row" spacing={1} sx={{ mt: 2, overflowX: 'auto' }}>
        {(workflow?.stages ?? []).map((stage) => (
          <Chip key={stage.id} size="small" label={`${stage.name} · ${STAGE_STATUS[stage.status] ?? 'Unknown'}`} color={stage.status === 1 ? 'primary' : stage.status === 2 ? 'success' : stage.status === 3 ? 'warning' : 'default'} variant={stage.status === 1 ? 'filled' : 'outlined'} />
        ))}
      </Stack>
      {active && (canAdvance || canSkip || canOverride) && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
          {canAdvance && <Button size="small" variant="contained" disabled={advancing} startIcon={<Iconify icon="mdi:arrow-right-circle-outline" />} onClick={onAdvance}>Complete current stage</Button>}
          {canSkip && currentStage?.allowManualSkip && <Button size="small" variant="outlined" color="warning" startIcon={<Iconify icon="mdi:skip-next-outline" />} onClick={onSkip}>Skip stage</Button>}
          {canOverride && Boolean(workflow?.availableTransitions.length) && <Button size="small" variant="outlined" color="warning" startIcon={<Iconify icon="mdi:shield-alert-outline" />} onClick={onOverride}>Override transition</Button>}
        </Stack>
      )}
      {workflow?.status === 1 && <Alert severity="success" sx={{ mt: 2 }}>Admission workflow completed.</Alert>}
    </CardContent></Card>
  );
}
