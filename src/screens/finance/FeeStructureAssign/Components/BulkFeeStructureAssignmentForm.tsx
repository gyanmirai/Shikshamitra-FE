'use client';

import { useSelector } from 'react-redux';
import { Alert } from '@mui/material';
import type { RootState } from 'src/redux/store';
import AssignmentWorkflow from './AssignmentWorkflow';
import type { IFeeStructureData } from './type';

interface Props {
  students: IFeeStructureData[];
  handleClose: (event: unknown, isSubmit: boolean) => void;
}

export default function BulkFeeStructureAssignmentForm({ students, handleClose }: Props) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  if (!currentYear?.id || !students.length) return <Alert severity="info">Select students and an academic year.</Alert>;
  return <AssignmentWorkflow key={`${currentYear.id}-${students.map((s) => s.studentId).join(',')}`} students={students} academicYearId={currentYear.id} onClose={() => handleClose(undefined, true)} />;
}
