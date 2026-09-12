'use client';

import { useSelector } from 'react-redux';
import { Alert } from '@mui/material';
import type { RootState } from 'src/redux/store';
import AssignmentWorkflow from './AssignmentWorkflow';

interface Props {
  student: { studentId?: string; id?: string; standardId?: string; studentName?: string; isFeeStructureAssigned?: boolean } | null;
  handleClose: (event: unknown, isSubmit: boolean) => void;
}

export default function FeeStructureAssignmentForm({ student, handleClose }: Props) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const studentId = student?.studentId ?? student?.id;
  if (!studentId || !currentYear?.id) return <Alert severity="info">Select a student and academic year.</Alert>;
  return <AssignmentWorkflow key={`${studentId}-${currentYear.id}`} students={[{ ...student, studentId }]} academicYearId={currentYear.id} onClose={() => handleClose(undefined, true)} />;
}
