import type { Standards } from 'src/types/school';

import { useState, useEffect } from 'react';

import type { CopySelectionMode, SubjectCopyFormState, CopyConflictStrategy } from './types';

export function useSubjectCopyForm(open: boolean): SubjectCopyFormState {
  const [copyFromClass, setCopyFromClass] = useState<Standards | null>(null);
  const [selectionMode, setSelectionMode] = useState<CopySelectionMode>('ALL');
  const [includeDocuments, setIncludeDocuments] = useState(true);
  const [includeTeachers, setIncludeTeachers] = useState(false);
  const [conflictStrategy, setConflictStrategy] = useState<CopyConflictStrategy>('SKIP');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (open) return;
    setCopyFromClass(null);
    setSelectionMode('ALL');
    setIncludeDocuments(true);
    setIncludeTeachers(false);
    setConflictStrategy('SKIP');
    setConfirmOpen(false);
  }, [open]);

  return {
    copyFromClass,
    selectionMode,
    includeDocuments,
    includeTeachers,
    conflictStrategy,
    confirmOpen,
    setCopyFromClass,
    setSelectionMode,
    setIncludeDocuments,
    setIncludeTeachers,
    setConflictStrategy,
    setConfirmOpen,
    currentValues: {
      copyFromClass,
      selectionMode,
      includeDocuments,
      includeTeachers,
      conflictStrategy,
    },
  };
}
