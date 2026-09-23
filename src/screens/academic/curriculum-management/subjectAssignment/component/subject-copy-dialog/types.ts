import type { Standards } from 'src/types/school';

export type CopySelectionMode = 'ALL' | 'SPECIFIC';
export type CopyConflictStrategy = 'SKIP' | 'OVERWRITE';

export type CopySubjectItem = {
  id: string;
  name: string;
  code: string;
};

export interface CopySubjectPayload {
  sourceClassId: string;
  targetClassId: string;
  subjectIds: string[] | null;
  includeTeachers: boolean;
  includeDocuments: boolean;
  conflictStrategy: CopyConflictStrategy;
  targetStatus: number;
}

export interface SubjectCopyDialogProps {
  open: boolean;
  isLoading: boolean;
  allClass: Standards[];
  sourceClassId: string;
  sourceClassName?: string;
  onClose: () => void;
  onConfirm: (payload: CopySubjectPayload) => Promise<void>;
}

export type SubjectCopyFormState = {
  copyFromClass: Standards | null;
  selectionMode: CopySelectionMode;
  includeDocuments: boolean;
  includeTeachers: boolean;
  conflictStrategy: CopyConflictStrategy;
  confirmOpen: boolean;
  setCopyFromClass: (value: Standards | null) => void;
  setSelectionMode: (value: CopySelectionMode) => void;
  setIncludeDocuments: (value: boolean) => void;
  setIncludeTeachers: (value: boolean) => void;
  setConflictStrategy: (value: CopyConflictStrategy) => void;
  setConfirmOpen: (value: boolean) => void;
  currentValues: Record<string, unknown>;
};
