import { examScheduledStatus } from 'src/enums/exam-scheduled-status';

export type ScheduleExamPrimaryAction = {
  kind: 'complete' | 'publish';
  label: 'Complete setup' | 'Publish exam';
  icon: 'mdi:pencil-outline' | 'mdi:cloud-upload-outline';
};

export function getScheduleExamPrimaryAction(
  status: examScheduledStatus,
  issueCount: number
): ScheduleExamPrimaryAction | null {
  if (status !== examScheduledStatus.Pending) return null;

  if (issueCount > 0) {
    return {
      kind: 'complete',
      label: 'Complete setup',
      icon: 'mdi:pencil-outline',
    };
  }

  return {
    kind: 'publish',
    label: 'Publish exam',
    icon: 'mdi:cloud-upload-outline',
  };
}
