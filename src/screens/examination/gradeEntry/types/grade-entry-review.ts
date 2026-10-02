export interface GradeEntryValidationIssue {
  code: string;
  message: string;
  studentId?: string;
  studentName?: string;
}

export interface GradeEntryReviewStats {
  totalCount: number;
  gradedCount: number;
  pendingCount: number;
  passCount: number;
  failCount: number;
  averageMarks: number;
  highestMarks: number;
  lowestMarks: number;
}

export interface GradeEntryReviewValidationResult {
  isValid: boolean;
  blockers: GradeEntryValidationIssue[];
  warnings: GradeEntryValidationIssue[];
}

export interface GradeEntryReviewDialogProps {
  open: boolean;
  onClose: () => void;
  stats: GradeEntryReviewStats;
  validation: GradeEntryReviewValidationResult;
  onFix: (studentId: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  isSubmitLoading?: boolean;
  isPreparing?: boolean;
  preparationError?: string;
  onRetry?: () => void;
}
