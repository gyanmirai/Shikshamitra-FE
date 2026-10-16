import type {
  AdmissionWorkflow,
  AdmissionWorkflowStage,
  AdmissionWorkflowUsage,
  AdmissionWorkflowTransition,
  AdmissionWorkflowGovernanceHistory,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Alert, Stack, Skeleton, Typography } from '@mui/material';

import { WorkflowVersionHistory } from './workflow-version-history';
import { WorkflowSimulationPanel } from './workflow-simulation-panel';
import { WorkflowRuntimeAnalytics } from './workflow-runtime-analytics';
import { WorkflowGovernanceHistory } from './workflow-governance-history';

import type { WorkflowSidePanel } from '../workflow-builder-types';

type Props = {
  panel: WorkflowSidePanel;
  workflow: AdmissionWorkflow;
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
  versions?: AdmissionWorkflow[];
  usage?: AdmissionWorkflowUsage;
  usageLoading: boolean;
  canCreateVersion: boolean;
  governanceHistory?: AdmissionWorkflowGovernanceHistory[];
  governanceLoading: boolean;
};

export function WorkflowPanelContent({
  panel,
  workflow,
  stages,
  transitions,
  versions,
  usage,
  usageLoading,
  canCreateVersion,
  governanceHistory,
  governanceLoading,
}: Props) {
  if (panel === 'preview') return <WorkflowPreview stages={stages} transitions={transitions} />;
  if (panel === 'simulation')
    return <WorkflowSimulationPanel stages={stages} transitions={transitions} />;
  if (panel === 'versions')
    return (
      <WorkflowVersionHistory
        workflow={workflow}
        stages={stages}
        transitions={transitions}
        versions={versions ?? []}
        canCreateVersion={canCreateVersion}
      />
    );
  if (panel === 'usage') return <WorkflowUsage usage={usage} loading={usageLoading} />;
  if (panel === 'governance')
    return (
      <WorkflowGovernanceHistory
        workflow={workflow}
        history={governanceHistory}
        loading={governanceLoading}
      />
    );
  return null;
}

function WorkflowPreview({
  stages,
  transitions,
}: {
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
}) {
  const stageById = new Map(stages.map((stage) => [stage.id, stage]));
  if (stages.length === 0) return <Alert severity="info">Add stages to preview the journey.</Alert>;
  return stages.map((stage) => {
    const outgoing = transitions
      .filter((transition) => transition.fromStageId === stage.id)
      .sort((left, right) => left.priority - right.priority);
    return (
      <Card key={stage.id} variant="outlined" sx={{ p: 1.5 }}>
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify
              icon={stage.isTerminalStage ? 'mdi:flag-checkered' : 'mdi:circle-slice-8'}
              color={
                stage.isEntryStage
                  ? 'info.main'
                  : stage.isTerminalStage
                    ? 'success.main'
                    : 'text.secondary'
              }
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={600}>{stage.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {stage.isEntryStage
                  ? 'Journey starts here'
                  : stage.isTerminalStage
                    ? 'Journey ends here'
                    : stage.code}
              </Typography>
            </Box>
          </Stack>
          {outgoing.length > 0 ? (
            <Stack spacing={0.75} sx={{ pl: 3.5 }}>
              {outgoing.map((transition) => (
                <Stack key={transition.id} direction="row" spacing={1} alignItems="center">
                  <Iconify icon="mdi:arrow-right" color="text.secondary" />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {transition.isDefault ? 'Otherwise' : 'When the route condition matches'}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} textAlign="right">
                    {stageById.get(transition.toStageId)?.name ?? 'Missing stage'}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          ) : !stage.isTerminalStage ? (
            <Alert severity="warning" icon={false} sx={{ py: 0.5 }}>
              No onward route
            </Alert>
          ) : null}
        </Stack>
      </Card>
    );
  });
}

function WorkflowUsage({ usage, loading }: { usage?: AdmissionWorkflowUsage; loading: boolean }) {
  if (loading) return <Skeleton variant="rounded" height={120} />;
  if (!usage) return null;
  return (
    <>
      <Alert severity={usage.canDelete ? 'info' : 'warning'}>
        {usage.canDelete
          ? 'This draft is not in use.'
          : 'This workflow is in use and cannot be deleted.'}
      </Alert>
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h4">{usage.offeringCount}</Typography>
          <Typography color="text.secondary">Admission offerings</Typography>
        </Card>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h4">{usage.campusCount ?? 0}</Typography>
          <Typography color="text.secondary">Campus scopes</Typography>
        </Card>
        <Card variant="outlined" sx={{ p: 2, gridColumn: { sm: '1 / -1' } }}>
          <Typography variant="h4">{usage.applicationCount}</Typography>
          <Typography color="text.secondary">Applications</Typography>
        </Card>
      </Box>
      <WorkflowRuntimeAnalytics analytics={usage.runtimeAnalytics} />
      {usage.offerings.map((offering) => (
        <Card key={offering.id} variant="outlined" sx={{ p: 1.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography fontWeight={600}>{offering.code}</Typography>
              <Typography variant="caption" color="text.secondary">
                {offering.admissionCycleName || 'Admission cycle'}
              </Typography>
            </Box>
            <Label color={offering.isActive ? 'success' : 'default'}>
              {offering.isActive ? 'Active' : 'Inactive'}
            </Label>
          </Stack>
        </Card>
      ))}
    </>
  );
}
