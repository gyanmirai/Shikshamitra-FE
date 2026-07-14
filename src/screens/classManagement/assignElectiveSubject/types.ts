export type AssignmentWorkflowStatus =
  | 'draft'
  | 'saved'
  | 'partiallyAssigned'
  | 'readyToLock'
  | 'locked';

export type AssignmentStatus = 'assigned' | 'unassigned' | 'changed';

export type PreferenceMatchStatus = 'matched' | 'mismatched' | 'noPreference';

export interface ElectiveSubjectOption {
  subjectId: string;
  subjectName: string;
  subjectColor?: string;
}

export interface StudentElectiveRow {
  studentId: string;
  studentName: string;
  rollNo: string;
  selectedSubjectId?: string;
  selectedSubjectName?: string;
  studentPreference?: string;
  selectableSubjects: ElectiveSubjectOption[];
}

export interface SubjectCapacityRow {
  subjectId: string;
  subjectName: string;
  subjectColor?: string;
  assignedCount: number;
}

export interface AssignmentValidationIssue {
  id: string;
  studentId: string;
  studentName: string;
  severity: 'error' | 'warning';
  title: string;
  description: string;
}

export type AssignmentFilterValue = 'all' | 'assigned' | 'unassigned' | 'preferenceMismatch';
