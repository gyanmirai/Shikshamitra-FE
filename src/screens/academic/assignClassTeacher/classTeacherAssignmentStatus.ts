import type { LabelColor } from 'src/components/label';

export const getClassTeacherAssignmentStatusColor = (status: string): LabelColor => {
  switch (status.trim().toLowerCase()) {
    case 'active':
    case 'assigned':
      return 'success';
    case 'conflict':
      return 'error';
    case 'changed':
    case 'draft':
    case 'pending':
      return 'info';
    case 'unassigned':
      return 'warning';
    default:
      return 'default';
  }
};
