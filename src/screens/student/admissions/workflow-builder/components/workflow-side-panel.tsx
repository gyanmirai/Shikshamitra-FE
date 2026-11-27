import type {
  AdmissionWorkflow,
  AdmissionWorkflowStage,
  AdmissionWorkflowUsage,
  AdmissionWorkflowTransition,
  AdmissionWorkflowStageTypeMetadata,
  AdmissionWorkflowGovernanceHistory,
} from 'src/redux/student/admissions/admission-workflows-api';

import { useId, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Stack, Drawer, Divider, IconButton, Typography } from '@mui/material';
import { useStudentDrawerExit } from 'src/screens/student/components/use-student-drawer-exit';

import { WorkflowPanelContent } from './workflow-panel-content';
import { AdmissionDialogTitle } from '../../admission-dialog-title';

import type { WorkflowSidePanel } from '../workflow-builder-types';

const TITLES: Record<Exclude<WorkflowSidePanel, null>, string> = {
  preview: 'Workflow Preview',
  simulation: 'Test Workflow Routes',
  versions: 'Version History',
  usage: 'Workflow Usage',
  governance: 'Governance History',
};

const DESCRIPTIONS: Record<Exclude<WorkflowSidePanel, null>, string> = {
  preview: 'Review the applicant journey and every configured onward route.',
  simulation: 'Try common admission outcomes before validating or publishing this workflow.',
  versions: 'Compare this workflow with its earlier and published versions.',
  usage: 'See where this workflow is currently connected and used.',
  governance: 'Review approval decisions and governance activity for this version.',
};

type Props = {
  panel: WorkflowSidePanel;
  workflow: AdmissionWorkflow;
  stages: AdmissionWorkflowStage[];
  stageTypes?: AdmissionWorkflowStageTypeMetadata[];
  transitions: AdmissionWorkflowTransition[];
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
  onClose: () => void;
};

export function WorkflowSidePanel({
  panel,
  workflow,
  stages,
  stageTypes,
  transitions,
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
  onClose,
}: Props) {
  const titleId = useId();
  const { closing, closeAfterExit, onExited, reopen } = useStudentDrawerExit();
  useEffect(() => {
    if (!panel) reopen();
  }, [panel, reopen]);
  const requestClose = () => closeAfterExit(onClose);

  return (
    <Drawer
      anchor="right"
      open={Boolean(panel) && !closing}
      onClose={requestClose}
      onTransitionExited={onExited}
      PaperProps={{
        'aria-labelledby': titleId,
        inert: closing,
        sx: {
          width: { xs: 1, sm: 560 },
          maxWidth: 1,
          height: '100dvh',
          display: 'flex',
          overflow: 'hidden',
          flexDirection: 'column',
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={2}
        sx={{ px: 2.5, py: 2 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography id={titleId} variant="h6" component="h2">
            {panel && (
              <AdmissionDialogTitle
                title={TITLES[panel]}
                helpText={DESCRIPTIONS[panel]}
                helpLabel={`${TITLES[panel]} information`}
              />
            )}
          </Typography>
          {panel === 'usage' && (
            <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
              {workflow.name} · Version {workflow.version}
            </Typography>
          )}
        </Box>
        <IconButton
          aria-label="Close Panel"
          onClick={requestClose}
          sx={{ width: 44, height: 44, flexShrink: 0 }}
        >
          <Iconify icon={GlobalIcons.cancel} />
        </IconButton>
      </Stack>
      <Divider />
      <Box
        component="section"
        aria-label={panel ? `${TITLES[panel]} Content` : 'Workflow Panel Content'}
        sx={{ display: 'flex', flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}
      >
        <Scrollbar sx={{ flex: 1 }}>
          <Stack spacing={1.5} sx={{ px: 2.5, py: 2 }}>
            <WorkflowPanelContent
              panel={panel}
              versionsLoading={versionsLoading}
              versionsError={versionsError}
              onRetryVersions={onRetryVersions}
              workflow={workflow}
              stages={stages}
              stageTypes={stageTypes}
              transitions={transitions}
              versions={versions}
              usage={usage}
              usageLoading={usageLoading}
              usageError={usageError}
              onRetryUsage={onRetryUsage}
              canCreateVersion={canCreateVersion}
              governanceHistory={governanceHistory}
              governanceLoading={governanceLoading}
            />
          </Stack>
        </Scrollbar>
      </Box>
    </Drawer>
  );
}
