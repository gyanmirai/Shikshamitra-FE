'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';

import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AssignmentDrawer from './Components/AssignmentDrawer';
import FeeStructureAssignTable from './Components/FeeStructureAssignTable';

import type { IFeeStructureData } from './Components/type';

export default function FeeStructureAssign() {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [students, setStudents] = useState<IFeeStructureData[]>([]);
  const [editAssignedPolicies, setEditAssignedPolicies] = useState(false);
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
        heading="Fee Structure Assignment"

        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Fees', href: '/finance/fee-collection' },
          { name: 'Fee Structure Assignment' },
        ]}
      />
      <FeeStructureAssignTable
        onAssignStructure={(student) => openAssignment([student])}
        onEdit={(student) => openAssignment([student], true)}
        onBulkAssign={(selected) => openAssignment(selected)}
      />
      <AssignmentDrawer
        students={students}
        academicYearId={currentYear?.id ?? ''}
        academicYearName={currentYear?.name}
        editAssignedPolicies={editAssignedPolicies}
        onClose={close}
      />
    </Box>
  );
}
