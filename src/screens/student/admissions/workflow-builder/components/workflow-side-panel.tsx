import type {
  AdmissionWorkflow,
  AdmissionWorkflowStage,
  AdmissionWorkflowUsage,
  AdmissionWorkflowValidationResult,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Iconify } from 'src/components/iconify';
import { Stack, Drawer, Divider, IconButton, Typography } from '@mui/material';

import { WorkflowPanelContent } from './workflow-panel-content';

import type { WorkflowSidePanel } from '../workflow-builder-types';

const TITLES: Record<Exclude<WorkflowSidePanel, null>, string> = {
  preview: 'Workflow preview',
  validation: 'Validation results',
  versions: 'Version history',
  usage: 'Workflow usage',
};

type Props = {
  panel: WorkflowSidePanel;
  stages: AdmissionWorkflowStage[];
  validation: AdmissionWorkflowValidationResult | null;
  versions?: AdmissionWorkflow[];
  usage?: AdmissionWorkflowUsage;
  usageLoading: boolean;
  onClose: () => void;
};

export function WorkflowSidePanel({ panel, stages, validation, versions, usage, usageLoading, onClose }: Props) {
  return (
    <Drawer anchor="right" open={Boolean(panel)} onClose={onClose} PaperProps={{ sx: { width: { xs: 1, sm: 520 }, maxWidth: 1 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
        <Typography variant="h6">{panel ? TITLES[panel] : ''}</Typography>
        <IconButton aria-label="Close panel" onClick={onClose}><Iconify icon="mdi:close" /></IconButton>
      </Stack>
      <Divider />
      <Stack spacing={1.5} sx={{ p: 2, overflowY: 'auto' }}>
        <WorkflowPanelContent panel={panel} stages={stages} validation={validation} versions={versions} usage={usage} usageLoading={usageLoading} />
      </Stack>
    </Drawer>
  );
}
