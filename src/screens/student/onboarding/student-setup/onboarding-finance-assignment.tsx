import type { RootState } from 'src/redux/store';
import type { StudentOnboardingCase } from 'src/redux/student/onboarding/student-onboarding-types';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Button } from '@mui/material';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import { useAssignmentContextsQuery } from 'src/redux/finance/studentFeeAssignment';
import AssignmentDrawer from 'src/screens/finance/FeeStructureAssign/Components/AssignmentDrawer';

export default function OnboardingFinanceAssignment({
  student,
  disabled,
}: {
  student: StudentOnboardingCase;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const permission = financePermissions.fees.structureAssign;
  const canView = hasGrantedPermission(permissions, `${permission}.View`);
  const canAssign = hasGrantedPermission(permissions, `${permission}.Add`);
  const { studentId, academicYearId } = student;
  const query = useAssignmentContextsQuery(
    { academicYearId, studentIds: [studentId], includeEditDetails: false },
    { skip: !canView || !studentId || !academicYearId, refetchOnMountOrArgChange: true }
  );
  const status = query.currentData?.find((item) => item.studentId === studentId)?.status;

  if (!open && status === 'Assigned') return <Label color="success">Assigned</Label>;
  if (!open && (!canAssign || (status !== 'Selected' && status !== 'Prepared'))) return null;

  return (
    <Box onSubmit={(event) => event.stopPropagation()}>
      <Button
        type="button"
        size="small"
        variant="outlined"
        disabled={disabled || query.isFetching || query.isError}
        startIcon={<Iconify icon="andrsrxn:plus-circle" />}
        onClick={() => setOpen(true)}
      >
        {status === 'Prepared' ? 'Complete fee assignment' : 'Assign fees'}
      </Button>
      {open && (
        <AssignmentDrawer
          academicYearId={academicYearId}
          academicYearName={student.academicYearName}
          students={[
            {
              id: studentId,
              studentId,
              studentName: student.studentName,
              grNumber: student.grNumber ?? undefined,
              rollNumber: student.rollNumber,
              isActive: true,
              isFeeStructureAssigned: status === 'Assigned',
              assignmentState: status,
              assignmentSource: 'Admission',
            },
          ]}
          onClose={() => setOpen(false)}
        />
      )}
    </Box>
  );
}
