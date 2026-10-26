import type { IElectiveSubject } from '../type';

export interface ElectiveGroupUsageData {
  canDelete?: boolean;
  subjects?: Array<string | { id?: string; name: string; color?: string; subjectColor?: string }>;
  usage?: {
    classAllocationsCount?: number;
    studentSelectionsCount?: number;
    timetablePeriodsCount?: number;
    examSchedulesCount?: number;
    subjectWiseStudentCount?: Array<{ subject: string; count: number }>;
  };
}

export interface ElectiveGroupUsageDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedGroup: IElectiveSubject | null;
  usageData?: ElectiveGroupUsageData | null;
  isLoading?: boolean;
  onArchive?: (group: IElectiveSubject) => void;
  canArchive?: boolean;
}

export type ElectiveGroupSubject = { name: string; color: string };
