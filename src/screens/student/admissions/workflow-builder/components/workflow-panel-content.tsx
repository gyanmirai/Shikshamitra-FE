import type {
  AdmissionWorkflow,
  AdmissionWorkflowStage,
  AdmissionWorkflowUsage,
  AdmissionWorkflowTransition,
  AdmissionWorkflowStageTypeMetadata,
  AdmissionWorkflowGovernanceHistory,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { StudentFeedback } from 'src/components/student-feedback';
import { Box, Card, Stack, Avatar, Button, Divider, Skeleton, Typography } from '@mui/material';

import { AdmissionQueryError } from '../../admission-query-error';
import { getTransitionSummary } from '../../workflow-builder-utils';
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
  stageTypes?: AdmissionWorkflowStageTypeMetadata[];
  versions?: AdmissionWorkflow[];
  versionsLoading?: boolean;
  versionsError?: boolean;
  onRetryVersions?: () => void;
  usage?: AdmissionWorkflowUsage;
  usageLoading: boolean;
  usageError?: boolean;
  onRetryUsage?: () => void;
  canCreateVersion: boolean;
  governanceHistory?: AdmissionWorkflowGovernanceHistory[];
  governanceLoading: boolean;
};

export function WorkflowPanelContent({
  panel,
  workflow,
  stages,
  transitions,
  stageTypes,
  versions,
  versionsLoading,
  versionsError,
  onRetryVersions,
  usage,
  usageLoading,
  usageError = false,
  onRetryUsage,
  canCreateVersion,
  governanceHistory,
  governanceLoading,
}: Props) {
  if (panel === 'preview')
    return <WorkflowPreview stages={stages} transitions={transitions} stageTypes={stageTypes} />;
  if (panel === 'simulation')
    return <WorkflowSimulationPanel stages={stages} transitions={transitions} />;
  if (panel === 'versions' && versionsLoading)
    return (
      <Stack spacing={2} aria-label="Loading Workflow Versions" role="status">
        <Skeleton height={56} />
        <Skeleton variant="rounded" height={160} />
      </Stack>
    );
  if (panel === 'versions' && versionsError)
    return <AdmissionQueryError onRetry={() => onRetryVersions?.()} />;
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
  if (panel === 'usage')
    return (
      <WorkflowUsage
        usage={usage}
        loading={usageLoading}
        error={usageError}
        onRetry={onRetryUsage}
      />
    );
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
  stageTypes = [],
}: {
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
  stageTypes?: AdmissionWorkflowStageTypeMetadata[];
}) {
  if (stages.length === 0)
    return (
      <StudentFeedback notificationKey="STU-0566" presentation="inline" severity="info">
        Add stages to preview the journey.
      </StudentFeedback>
    );
  const orderedStages = [...stages].sort((left, right) => left.displayOrder - right.displayOrder);
  const destinations = new Map(
    orderedStages.map(({ id, name }, index) => [id, { name, number: index + 1 }])
  );
  const metadataByType = new Map(stageTypes.map((metadata) => [metadata.type, metadata]));

  return (
    <Stack
      component="ol"
      role="list"
      aria-label="Journey Stage Sequence"
      spacing={1.5}
      sx={{ listStyle: 'none', m: 0, p: 0 }}
    >
      {orderedStages.map((stage, index) => {
        const metadata = metadataByType.get(stage.stageType);
        const outgoing = transitions
          .filter((transition) => transition.fromStageId === stage.id)
          .sort((left, right) => left.priority - right.priority);

        return (
          <Card
            key={stage.id}
            component="li"
            variant="outlined"
            sx={{ p: { xs: 1.25, sm: 1.5 }, minWidth: 0 }}
          >
            <Stack spacing={1.25}>
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <Avatar
                  aria-hidden="true"
                  sx={{
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                    typography: 'subtitle2',
                    bgcolor: 'background.neutral',
                    color: 'text.primary',
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  {index + 1}
                </Avatar>
                <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                  <Stack direction="row" flexWrap="wrap" alignItems="center" gap={0.75}>
                    <Typography
                      component="h3"
                      variant="subtitle1"
                      sx={{ overflowWrap: 'anywhere' }}
                    >
                      {stage.name}
                    </Typography>
                    {stage.isEntryStage && <Label color="info">Entry</Label>}
                    {stage.isTerminalStage && <Label>Final</Label>}
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
                    <Iconify
                      icon={metadata?.icon || GlobalIcons.admissionDetails}
                      width={16}
                      aria-hidden="true"
                      sx={{ flexShrink: 0 }}
                    />
                    <Typography variant="caption" sx={{ overflowWrap: 'anywhere' }}>
                      {metadata?.displayName || `Saved type ${stage.stageType}`}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
              {outgoing.length > 0 ? (
                <>
                  <Divider />
                  <Typography component="h4" variant="subtitle2">
                    Next Stages
                  </Typography>
                  <Stack
                    component="ul"
                    role="list"
                    aria-label="Next Stages"
                    spacing={0.75}
                    sx={{ listStyle: 'none', m: 0, p: 0 }}
                  >
                    {outgoing.map((transition) => {
                      const destination = destinations.get(transition.toStageId);
                      return (
                        <Stack
                          key={transition.id}
                          component="li"
                          direction="row"
                          spacing={1}
                          alignItems="flex-start"
                        >
                          <Iconify
                            icon="mdi:arrow-right"
                            color="text.secondary"
                            width={16}
                            aria-hidden="true"
                            sx={{ flexShrink: 0, mt: 0.25 }}
                          />
                          <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                            <Typography
                              variant="body2"
                              color={destination ? 'text.primary' : 'warning.main'}
                              fontWeight={600}
                            >
                              {destination
                                ? `To stage ${destination.number} · ${destination.name}`
                                : 'Missing stage'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {getTransitionSummary(transition)}
                            </Typography>
                          </Box>
                        </Stack>
                      );
                    })}
                  </Stack>
                </>
              ) : !stage.isTerminalStage ? (
                <StudentFeedback
                  notificationKey="STU-0567"
                  presentation="persistent"
                  severity="warning"
                  icon={false}
                  sx={{ py: 0.5 }}
                >
                  No onward route
                </StudentFeedback>
              ) : null}
            </Stack>
          </Card>
        );
      })}
    </Stack>
  );
}

function WorkflowUsage({
  usage,
  loading,
  error,
  onRetry,
}: {
  usage?: AdmissionWorkflowUsage;
  loading: boolean;
  error: boolean;
  onRetry?: () => void;
}) {
  if (loading) return <Skeleton variant="rounded" height={120} />;
  if (error && onRetry)
    return (
      <StudentFeedback
        notificationKey="STU-0568"
        presentation="inline"
        severity="error"
        role="alert"
        action={
          <Button size="small" color="inherit" onClick={onRetry}>
            Retry
          </Button>
        }
      >
        Workflow usage could not be loaded.
      </StudentFeedback>
    );
  if (error)
    return (
      <StudentFeedback notificationKey="STU-0568" presentation="toast" severity="error">
        Workflow usage could not be loaded. Refresh the page to try again.
      </StudentFeedback>
    );
  if (!usage) return null;
  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h4">{usage.offeringCount}</Typography>
          <Typography color="text.secondary">Admission Offerings</Typography>
        </Card>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h4">{usage.campusCount ?? 0}</Typography>
          <Typography color="text.secondary">Campus Scopes</Typography>
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
                {offering.admissionCycleName || 'Admission Cycle'}
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
