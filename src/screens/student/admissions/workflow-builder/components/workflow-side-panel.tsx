import type {
  AdmissionWorkflow,
  AdmissionWorkflowStage,
  AdmissionWorkflowUsage,
  AdmissionWorkflowTransition,
  AdmissionWorkflowGovernanceHistory,
} from 'src/redux/student/admissions/admission-workflows-api';

import { useId } from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Drawer, Button, Divider, IconButton, Typography } from '@mui/material';

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
  transitions: AdmissionWorkflowTransition[];
  versions?: AdmissionWorkflow[];
  usage?: AdmissionWorkflowUsage;
  usageLoading: boolean;
  usageError?: boolean;
  canCreateVersion: boolean;
  governanceHistory?: AdmissionWorkflowGovernanceHistory[];
  governanceLoading: boolean;
  onClose: () => void;
};

export function WorkflowSidePanel({
  panel,
  workflow,
  stages,
  transitions,
  versions,
  usage,
  usageLoading,
  usageError = false,
  canCreateVersion,
  governanceHistory,
  governanceLoading,
  onClose,
}: Props) {
  const titleId = useId();
  const readOnlyPanel = Boolean(panel && panel !== 'simulation');
  return (
    <Drawer
      anchor="right"
      open={Boolean(panel)}
      onClose={onClose}
      PaperProps={{
        'aria-labelledby': titleId,
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
        </Box>
        <IconButton
          aria-label="Close Panel"
          onClick={onClose}
          sx={{ width: 44, height: 44, flexShrink: 0 }}
        >
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>
      <Divider />
      <Box
        component="section"
        aria-label={panel ? `${TITLES[panel]} Content` : 'Workflow Panel Content'}
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2.5, py: 2 }}
      >
        <Stack spacing={1.5}>
          <WorkflowPanelContent
            panel={panel}
            workflow={workflow}
            stages={stages}
            transitions={transitions}
            versions={versions}
            usage={usage}
            usageLoading={usageLoading}
            usageError={usageError}
            canCreateVersion={canCreateVersion}
            governanceHistory={governanceHistory}
            governanceLoading={governanceLoading}
          />
        </Stack>
      </Box>
      {readOnlyPanel && (
        <Stack
          direction="row"
          justifyContent="flex-end"
          sx={{ p: 2, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}
        >
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="mdi:close" />}
            onClick={onClose}
          >
            Close
          </Button>
        </Stack>
      )}
    </Drawer>
  );
}
