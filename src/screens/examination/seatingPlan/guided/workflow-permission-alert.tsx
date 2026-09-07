import Alert from '@mui/material/Alert';

import type { GuidedWorkflowState } from './types';

export function WorkflowPermissionAlert({ workflow }: { workflow: GuidedWorkflowState }) {
  const { activeStep, permissions } = workflow;
  let message = '';
  if (activeStep <= 1 && !permissions.canAdd) {
    message = 'You need the Add seating allocation permission to create and save a plan.';
  } else if (activeStep === 2 && !permissions.canAutoAllocate) {
    message = 'You need the Auto Allocate permission to generate and apply a seating proposal.';
  } else if (activeStep === 3 && !workflow.isPublished && !permissions.canPublish) {
    message = 'You need the Publish permission to approve the complete examination seating.';
  }
  return message ? (
    <Alert severity="warning" sx={{ mx: { xs: 2, md: 3 }, mt: 2 }}>
      {message}
    </Alert>
  ) : null;
}
