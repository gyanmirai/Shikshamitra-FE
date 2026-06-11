'use client';

import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import FeeStructureAssignmentForm from 'src/screens/student/enrollment/admission/FeeStructureAssignmentForm';

import FeeStructureAssignTable from './Components/FeeStructureAssignTable';
import BulkFeeStructureAssignmentForm from './Components/BulkFeeStructureAssignmentForm';

import type { IFeeStructureData } from './Components/type';

const FeeStructureAssign = () => {
  const assignDialog = useBoolean();
  const bulkAssignDialog = useBoolean();
  const [selectedStudent, setSelectedStudent] = useState<IFeeStructureData | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<IFeeStructureData[]>([]);

  const handleAssignClose = () => {
    assignDialog.onFalse();
    setSelectedStudent(null);
  };

  const handleBulkAssignClose = () => {
    bulkAssignDialog.onFalse();
    setSelectedStudents([]);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Fee Structure Assignment"
        description="Select class and division to view students. Assign fee structures to students to define their fee breakdown."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Fees', href: '/finance/fee-collection' },
          { name: 'Fee Structure Assign' },
        ]}
      />

      <FeeStructureAssignTable
        onAssignStructure={(row) => {
          assignDialog.onTrue();
          setSelectedStudent(row);
        }}
        onBulkAssign={(rows) => {
          bulkAssignDialog.onTrue();
          setSelectedStudents(rows);
        }}
      />

      <CustomDialog
        open={assignDialog.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Assign/Update Fee Structure</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Assign a fee structure to the student based on their selected class for accurate fee management and billing."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="sm"
        transitionDuration={{ enter: 0, exit: 0 }}
        handleClose={() => {
          handleAssignClose();
        }}
      >
        {selectedStudent && (
          <FeeStructureAssignmentForm
            student={selectedStudent as any}
            handleClose={handleAssignClose}
          />
        )}
      </CustomDialog>

      <CustomDialog
        open={bulkAssignDialog.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              Bulk Assign Fee Structure ({selectedStudents.length} students)
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Assign the same fee structure to multiple students at once based on their class for efficient bulk fee management."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="sm"
        transitionDuration={{ enter: 0, exit: 0 }}
        handleClose={() => {
          handleBulkAssignClose();
        }}
      >
        {selectedStudents.length > 0 && (
          <BulkFeeStructureAssignmentForm
            students={selectedStudents}
            handleClose={handleBulkAssignClose}
          />
        )}
      </CustomDialog>
    </Box>
  );
};

export default FeeStructureAssign;
