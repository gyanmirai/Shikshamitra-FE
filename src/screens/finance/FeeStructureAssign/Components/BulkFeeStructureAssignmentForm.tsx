'use client';

import Box from '@mui/material/Box';

import { useSelector } from 'react-redux';

import type { RootState } from 'src/redux/store';
import AssignmentWorkflow from './AssignmentWorkflow';
import type { IFeeStructureData } from './type';

interface Props {
  students: IFeeStructureData[];
  handleClose: (event: unknown, isSubmit: boolean) => void;
}

export default function BulkFeeStructureAssignmentForm({ students, handleClose }: Props) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  if (!currentYear?.id || !students.length) return <Box>Select students and an academic year.</Box>;
  return (
    <AssignmentWorkflow
      key={`${currentYear.id}-${students.map((s) => s.studentId).join(',')}`}
      students={students}
      academicYearId={currentYear.id}
      onClose={() => handleClose(undefined, true)}
    />
  );
}
