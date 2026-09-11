import type {
  AdmissionWorkflow,
  AdmissionWorkflowStage,
  AdmissionWorkflowUsage,
  AdmissionWorkflowValidationResult,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Alert, Stack, Skeleton, Typography, AlertTitle } from '@mui/material';

import { WORKFLOW_STATUS_COLORS, WORKFLOW_STATUS_LABELS } from '../workflow-builder-types';

import type { WorkflowSidePanel } from '../workflow-builder-types';

type Props = {
  panel: WorkflowSidePanel;
  stages: AdmissionWorkflowStage[];
  validation: AdmissionWorkflowValidationResult | null;
  versions?: AdmissionWorkflow[];
  usage?: AdmissionWorkflowUsage;
  usageLoading: boolean;
};

export function WorkflowPanelContent({ panel, stages, validation, versions, usage, usageLoading }: Props) {
  if (panel === 'preview') return <WorkflowPreview stages={stages} />;
  if (panel === 'validation') return <ValidationResults validation={validation} />;
  if (panel === 'versions') return <VersionHistory versions={versions ?? []} />;
  if (panel === 'usage') return <WorkflowUsage usage={usage} loading={usageLoading} />;
  return null;
}

function WorkflowPreview({ stages }: { stages: AdmissionWorkflowStage[] }) {
  return stages.map((stage, index) => (
    <Stack key={stage.id} direction="row" spacing={1.5}>
      <Stack alignItems="center">
        <Iconify icon={stage.isTerminalStage ? 'mdi:flag-checkered' : 'mdi:circle-slice-8'} color={stage.isEntryStage ? 'info.main' : stage.isTerminalStage ? 'success.main' : 'primary.main'} />
        {index < stages.length - 1 && <Box sx={{ width: 2, minHeight: 30, bgcolor: 'divider' }} />}
      </Stack>
      <Box>
        <Typography fontWeight={600}>{stage.name}</Typography>
        <Typography variant="caption" color="text.secondary">{stage.isEntryStage ? 'Entry stage' : stage.isTerminalStage ? 'Terminal stage' : stage.code}</Typography>
      </Box>
    </Stack>
  ));
}

function ValidationResults({ validation }: { validation: AdmissionWorkflowValidationResult | null }) {
  if (validation?.issues.length === 0) return <Alert severity="success">No validation issues found.</Alert>;
  return validation?.issues.map((issue) => (
    <Alert
      key={`${issue.code}-${issue.stageId}-${issue.transitionId}`}
      severity={issue.severity === 0 ? 'error' : 'warning'}
      onClick={() => issue.stageId && document.getElementById(`workflow-stage-${issue.stageId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
      sx={{ cursor: issue.stageId ? 'pointer' : 'default' }}
    >
      <AlertTitle>{issue.code}</AlertTitle>{issue.message}
    </Alert>
  ));
}

function VersionHistory({ versions }: { versions: AdmissionWorkflow[] }) {
  return versions.map((version) => (
    <Card key={version.id} variant="outlined" sx={{ p: 1.5 }}>
      <Stack direction="row" justifyContent="space-between">
        <Box><Typography fontWeight={600}>Version {version.version}</Typography><Typography variant="caption" color="text.secondary">{version.code}</Typography></Box>
        <Label color={WORKFLOW_STATUS_COLORS[version.status]}>{WORKFLOW_STATUS_LABELS[version.status]}</Label>
      </Stack>
    </Card>
  ));
}

function WorkflowUsage({ usage, loading }: { usage?: AdmissionWorkflowUsage; loading: boolean }) {
  if (loading) return <Skeleton variant="rounded" height={120} />;
  if (!usage) return null;
  return <><Alert severity={usage.canDelete ? 'info' : 'warning'}>{usage.canDelete ? 'This draft is not in use.' : 'This workflow is in use and cannot be deleted.'}</Alert><Card variant="outlined" sx={{ p: 2 }}><Typography variant="h4">{usage.offeringCount}</Typography><Typography color="text.secondary">Admission offerings</Typography></Card><Card variant="outlined" sx={{ p: 2 }}><Typography variant="h4">{usage.applicationCount}</Typography><Typography color="text.secondary">Applications</Typography></Card>{usage.offerings.map((offering) => <Card key={offering.id} variant="outlined" sx={{ p: 1.5 }}><Stack direction="row" alignItems="center" justifyContent="space-between"><Box><Typography fontWeight={600}>{offering.code}</Typography><Typography variant="caption" color="text.secondary">{offering.admissionCycleName || 'Admission cycle'}</Typography></Box><Label color={offering.isActive ? 'success' : 'default'}>{offering.isActive ? 'Active' : 'Inactive'}</Label></Stack></Card>)}</>;
}
