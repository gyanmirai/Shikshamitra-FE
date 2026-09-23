import type { ISubject } from './type';

export interface SubjectUsageData {
  canDelete?: boolean;
  subjectAllocations?: unknown[];
  electiveGroups?: unknown[];
  usage?: {
    subjectAllocations?: unknown[];
    classes?: unknown[];
    electiveGroups?: unknown[];
    chaptersCount?: number;
    timetablePeriodsCount?: number;
    examSchedulesCount?: number;
    lessonPlansCount?: number;
    homeworkCount?: number;
    teacherMappingsCount?: number;
  };
}

export interface SubjectUsageDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedSubject: ISubject | null;
  usageData?: SubjectUsageData | null;
  isLoading?: boolean;
  onArchive?: (subject: ISubject) => void;
  onRestore?: (subject: ISubject) => Promise<boolean>;
  canArchive?: boolean;
  isRestoring?: boolean;
}

export interface SubjectDependencyMetric {
  label: string;
  value: number;
}

export interface SubjectDependencyCounts {
  allocations: number;
  chapters: number;
  timetablePeriods: number;
  examinations: number;
  lessonPlans: number;
}
