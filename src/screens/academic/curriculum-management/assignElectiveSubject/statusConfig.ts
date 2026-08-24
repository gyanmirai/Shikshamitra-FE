import type { AssignmentWorkflowStatus } from './types';

export const workflowStatusConfig: Record<
  AssignmentWorkflowStatus,
  { label: string; color: 'default' | 'info' | 'warning' | 'success' | 'error' }
> = {
  draft: { label: 'Draft', color: 'default' },
  saved: { label: 'Saved', color: 'info' },
  partiallyAssigned: { label: 'Partially Assigned', color: 'warning' },
  readyToLock: { label: 'Ready to Lock', color: 'success' },
  locked: { label: 'Locked', color: 'error' },
};
