import { useMemo, useState, useEffect, useCallback } from 'react';

import type {
  StudentElectiveRow,
  SubjectCapacityRow,
  AssignmentFilterValue,
  AssignmentWorkflowStatus,
  AssignmentValidationIssue,
} from '../types';

interface UseElectiveAssignmentStateArgs {
  students: StudentElectiveRow[];
  serverRecords: StudentElectiveRow[] | undefined;
  isLocked: boolean;
}

const buildSelectionMap = (records: StudentElectiveRow[] | undefined) => {
  const selections: Record<string, string> = {};
  records?.forEach((student) => {
    if (student.selectedSubjectId) selections[student.studentId] = student.selectedSubjectId;
  });
  return selections;
};

export default function useElectiveAssignmentState({
  students,
  serverRecords,
  isLocked,
}: UseElectiveAssignmentStateArgs) {
  const [studentSelections, setStudentSelections] = useState<Record<string, string>>({});
  const [serverSelections, setServerSelections] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssignmentFilterValue>('all');
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // Reset selections whenever server data changes (new context loaded / refetch after save)
  useEffect(() => {
    if (!serverRecords) return undefined;
    const initial = buildSelectionMap(serverRecords);
    const frame = requestAnimationFrame(() => {
      setStudentSelections(initial);
      setServerSelections(initial);
      setSelectedRowIds(new Set());
    });
    return () => cancelAnimationFrame(frame);
  }, [serverRecords]);

  // Keep the row callback stable because it is passed to every subject-pill control in the table.
  const toggleSubject = useCallback(
    (studentId: string, subjectId: string) => {
      if (isLocked) return;
      setStudentSelections((prev) => {
        const next = { ...prev };
        if (next[studentId] === subjectId) delete next[studentId];
        else next[studentId] = subjectId;
        return next;
      });
    },
    [isLocked]
  );

  const bulkAssignSubject = useCallback(
    (studentIds: string[], subjectId: string) => {
      if (isLocked) return;
      setStudentSelections((prev) => {
        const next = { ...prev };
        studentIds.forEach((id) => {
          next[id] = subjectId;
        });
        return next;
      });
    },
    [isLocked]
  );

  const clearSelections = useCallback((studentIds?: string[]) => {
    if (!studentIds) {
      setStudentSelections({});
      return;
    }
    setStudentSelections((prev) => {
      const next = { ...prev };
      studentIds.forEach((id) => delete next[id]);
      return next;
    });
  }, []);

  const resetSelections = useCallback(() => {
    setStudentSelections(serverSelections);
  }, [serverSelections]);

  const toggleRowSelected = useCallback((studentId: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  }, []);

  const toggleAllRowsSelected = useCallback((studentIds: string[], checked: boolean) => {
    setSelectedRowIds(checked ? new Set(studentIds) : new Set());
  }, []);

  const clearRowSelection = useCallback(() => setSelectedRowIds(new Set()), []);

  const preferenceMatch = useCallback(
    (row: StudentElectiveRow): 'matched' | 'mismatched' | 'noPreference' => {
      const selectedId = studentSelections[row.studentId];
      if (!row.studentPreference) return 'noPreference';
      if (!selectedId) return 'mismatched';
      const selectedSubject = row.selectableSubjects.find((s) => s.subjectId === selectedId);
      if (!selectedSubject) return 'mismatched';
      return selectedSubject.subjectName.trim().toLowerCase() ===
        row.studentPreference.trim().toLowerCase()
        ? 'matched'
        : 'mismatched';
    },
    [studentSelections]
  );

  const rowStatus = useCallback(
    (row: StudentElectiveRow) => {
      const selectedId = studentSelections[row.studentId];
      if (!selectedId) return 'unassigned' as const;
      const original = serverSelections[row.studentId];
      if (original !== selectedId) return 'changed' as const;
      return 'assigned' as const;
    },
    [studentSelections, serverSelections]
  );

  const filteredStudents = useMemo(() => {
    let list = students;

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.studentName.toLowerCase().includes(term) ||
          s.rollNo.toLowerCase().includes(term) ||
          (s.grNo && s.grNo.toLowerCase().includes(term))
      );
    }

    if (statusFilter === 'assigned') {
      list = list.filter((s) => !!studentSelections[s.studentId]);
    } else if (statusFilter === 'unassigned') {
      list = list.filter((s) => !studentSelections[s.studentId]);
    } else if (statusFilter === 'preferenceMismatch') {
      list = list.filter((s) => preferenceMatch(s) === 'mismatched');
    }

    return list;
  }, [students, searchTerm, statusFilter, studentSelections, preferenceMatch]);

  const summary = useMemo(() => {
    const total = students.length;
    const assigned = students.filter((s) => !!studentSelections[s.studentId]).length;
    const unassigned = total - assigned;
    const withPreference = students.filter((s) => !!s.studentPreference);
    const matched = withPreference.filter((s) => preferenceMatch(s) === 'matched').length;
    const preferenceMatchPct =
      withPreference.length > 0 ? Math.round((matched / withPreference.length) * 100) : null;
    const issues = unassigned;

    return { total, assigned, unassigned, issues, preferenceMatchPct, capacityUsed: assigned };
  }, [students, studentSelections, preferenceMatch]);

  const subjectCapacity: SubjectCapacityRow[] = useMemo(() => {
    const subjectMap = new Map<string, SubjectCapacityRow>();
    students.forEach((s) => {
      s.selectableSubjects.forEach((opt) => {
        if (!subjectMap.has(opt.subjectId)) {
          subjectMap.set(opt.subjectId, {
            subjectId: opt.subjectId,
            subjectName: opt.subjectName,
            subjectColor: opt.subjectColor,
            assignedCount: 0,
          });
        }
      });
    });
    Object.values(studentSelections).forEach((subjectId) => {
      const entry = subjectMap.get(subjectId);
      if (entry) entry.assignedCount += 1;
    });
    return Array.from(subjectMap.values());
  }, [students, studentSelections]);

  const validationIssues: AssignmentValidationIssue[] = useMemo(
    () =>
      students
        .filter((s) => !studentSelections[s.studentId])
        .map((s) => ({
          id: s.studentId,
          studentId: s.studentId,
          studentName: s.studentName,
          severity: 'error' as const,
          title: 'No elective assigned',
          description: `${s.studentName} (Roll No. ${s.rollNo}) has not been assigned an elective subject.`,
        })),
    [students, studentSelections]
  );

  const unsavedChangesCount = useMemo(
    () =>
      students.filter(
        (st) => (studentSelections[st.studentId] ?? '') !== (serverSelections[st.studentId] ?? '')
      ).length,
    [studentSelections, serverSelections, students]
  );

  const hasUnsavedChanges = unsavedChangesCount > 0;

  const allStudentsAssigned = useMemo(
    () => students.length > 0 && students.every((st) => !!studentSelections[st.studentId]),
    [studentSelections, students]
  );

  const hasSelections = Object.keys(studentSelections).length > 0;

  const workflowStatus: AssignmentWorkflowStatus = useMemo(() => {
    if (isLocked) return 'locked';
    if (hasUnsavedChanges) {
      return 'draft';
    }
    if (!hasSelections) return 'draft';
    return allStudentsAssigned ? 'readyToLock' : 'partiallyAssigned';
  }, [isLocked, hasUnsavedChanges, hasSelections, allStudentsAssigned]);

  return {
    studentSelections,
    setStudentSelections,
    toggleSubject,
    bulkAssignSubject,
    clearSelections,
    resetSelections,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedRowIds,
    toggleRowSelected,
    toggleAllRowsSelected,
    clearRowSelection,
    filteredStudents,
    summary,
    subjectCapacity,
    validationIssues,
    preferenceMatch,
    rowStatus,
    hasUnsavedChanges,
    unsavedChangesCount,
    allStudentsAssigned,
    hasSelections,
    workflowStatus,
  };
}
