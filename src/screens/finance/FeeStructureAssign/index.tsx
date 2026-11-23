'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AssignmentDrawer from './Components/AssignmentDrawer';
import AssignmentHistoryDrawer from './Components/AssignmentHistoryDrawer';
import FeeStructureAssignTable from './Components/FeeStructureAssignTable';

import type { IFeeStructureData } from './Components/type';

const title = 'Structure Assignment';

export default function FeeStructureAssign() {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [students, setStudents] = useState<IFeeStructureData[]>([]);
  const [editAssignedPolicies, setEditAssignedPolicies] = useState(false);
  const [history, setHistory] = useState<{ student: IFeeStructureData; yearId: string }>();
  const openAssignment = (selected: IFeeStructureData[], edit = false) => {
    setEditAssignedPolicies(edit);
    setStudents(selected);
  };
  const close = () => openAssignment([]);
  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CustomBreadcrumbs
        description="Review each student's fee heads, service period and installment schedule before assigning."
        heading={title}

        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Fees', href: '/finance/fee-collection' },
          { name: title },
        ]}
      />
      <FeeStructureAssignTable
        onAssignStructure={(student) => openAssignment([student])}
        onEdit={(student) => openAssignment([student], true)}
        onHistory={(student) => {
          if (currentYear?.id) setHistory({ student, yearId: currentYear.id });
        }}
        onBulkAssign={(selected) =>
          openAssignment(
            selected,
            selected.every((student) => student.isFeeStructureAssigned)
          )
        }
      />
      <AssignmentDrawer
        students={students}
        academicYearId={currentYear?.id ?? ''}
        academicYearName={currentYear?.name}
        editAssignedPolicies={editAssignedPolicies}
        onClose={close}
      />
      {history && history.yearId === currentYear?.id && (
        <AssignmentHistoryDrawer
          key={`${history.yearId}:${history.student.studentId}`}
          student={history.student}
          academicYearId={history.yearId}
          academicYearName={currentYear.name}
          onClose={() => setHistory(undefined)}
        />
      )}
    </Box>
  );
}
