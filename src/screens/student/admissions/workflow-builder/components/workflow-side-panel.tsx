import type {
  AdmissionWorkflow,
  AdmissionWorkflowStage,
  AdmissionWorkflowUsage,
  AdmissionWorkflowTransition,
  AdmissionWorkflowValidationResult,
  AdmissionWorkflowGovernanceHistory,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Iconify } from 'src/components/iconify';
import { Box, Stack, Drawer, Divider, IconButton, Typography } from '@mui/material';

import { WorkflowPanelContent } from './workflow-panel-content';

import type { WorkflowSidePanel } from '../workflow-builder-types';

const TITLES: Record<Exclude<WorkflowSidePanel, null>, string> = {
  preview: 'Workflow preview',
  simulation: 'Test workflow routes',
  validation: 'Validation results',
  versions: 'Version history',
  usage: 'Workflow usage',
  governance: 'Governance history',
};

const DESCRIPTIONS: Record<Exclude<WorkflowSidePanel, null>, string> = {
  preview: 'Review the applicant journey and every configured onward route.',
  simulation: 'Try common admission outcomes before validating or publishing this workflow.',
  validation: 'Review configuration issues that affect workflow publication.',
  versions: 'Compare this workflow with its earlier and published versions.',
  usage: 'See where this workflow is currently connected and used.',
  governance: 'Review approval decisions and governance activity for this version.',
};

type Props = {
  panel: WorkflowSidePanel;
  workflow: AdmissionWorkflow;
  stages: AdmissionWorkflowStage[];
  transitions: AdmissionWorkflowTransition[];
  validation: AdmissionWorkflowValidationResult | null;
  versions?: AdmissionWorkflow[];
  usage?: AdmissionWorkflowUsage;
  usageLoading: boolean;
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
  validation,
  versions,
  usage,
  usageLoading,
  canCreateVersion,
  governanceHistory,
  governanceLoading,
  onClose,
}: Props) {
  return (
    <Drawer
      anchor="right"
      open={Boolean(panel)}
      onClose={onClose}
      PaperProps={{
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
          <Typography variant="h6">{panel ? TITLES[panel] : ''}</Typography>
          {panel && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {DESCRIPTIONS[panel]}
            </Typography>
          )}
        </Box>
        <IconButton
          aria-label="Close panel"
          onClick={onClose}
          sx={{ width: 44, height: 44, flexShrink: 0 }}
        >
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>
      <Divider />
      <Box
        component="section"
        aria-label={panel ? `${TITLES[panel]} content` : 'Workflow panel content'}
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2.5, py: 2 }}
      >
        <Stack spacing={1.5}>
          <WorkflowPanelContent
            panel={panel}
            workflow={workflow}
            stages={stages}
            transitions={transitions}
            validation={validation}
            versions={versions}
            usage={usage}
            usageLoading={usageLoading}
            canCreateVersion={canCreateVersion}
            governanceHistory={governanceHistory}
            governanceLoading={governanceLoading}
          />
        </Stack>
      </Box>
    </Drawer>
  );
}
