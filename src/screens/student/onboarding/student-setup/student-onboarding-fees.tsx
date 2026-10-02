'use client';

import type { RootState } from 'src/redux/store';

import Link from 'next/link';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Alert, Stack, Button, Typography } from '@mui/material';
import { financePaths, financePermissions } from 'src/constants/finance-menu';
import AssignmentDrawer from 'src/screens/finance/FeeStructureAssign/Components/AssignmentDrawer';
import AdmissionFeeSelectionPanel from 'src/screens/student/admissions/fee-selection/admission-fee-selection-panel';
import {
  useGetStudentOnboardingCaseQuery,
  useRefreshStudentOnboardingReadinessMutation,
} from 'src/redux/student/onboarding/student-onboarding-api';

export default function StudentOnboardingFees({ caseId, canManage }: { caseId: string; canManage: boolean }) {
  const [assigning, setAssigning] = useState(false);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const query = useGetStudentOnboardingCaseQuery(caseId, { refetchOnMountOrArgChange: true });
  const [refreshReadiness, refreshState] = useRefreshStudentOnboardingReadinessMutation();
  const item = query.data;
  if (query.isError) return <Alert severity="error" action={
    <Button size="small" onClick={() => query.refetch()}>Retry</Button>
  }>Fee readiness could not be verified.</Alert>;
  if (!item) return <Typography variant="body2">Loading fee readiness…</Typography>;
  const canAssign = hasGrantedPermission(permissions, `${financePermissions.fees.structureAssign}.Add`);
  const canCollect = hasGrantedPermission(permissions, `${financePermissions.fees.collections}.Add`);
  return (
    <Stack spacing={1}>
      {item.applicationId && (
        <AdmissionFeeSelectionPanel
          applicationId={item.applicationId}
          mode="onboarding"
          canConfirm={canManage}
        />
      )}
      <Alert severity={item.firstPaymentConfirmed ? 'success' : 'info'}>
        {item.financeReadinessDetail ?? 'Fee assignment and the first installment must be verified in Finance.'}
      </Alert>
      <Typography variant="body2">
        {item.status === 4
          ? 'Onboarding is complete. Later installments remain managed in Finance; review the fee account for the current balance.'
          : item.studentEnrollmentId
          ? 'Assign the fee structure, collect the first installment, then refresh readiness to complete onboarding. Later installments can remain outstanding.'
          : 'Prepare and activate the enrollment first. Then assign fees and collect the first installment before completing onboarding.'}
      </Typography>
      {canCollect && item.feeAssignmentConfirmed && (
        <Typography variant="body2">
          In Finance, select academic year {item.academicYearName}, then find {item.studentName}
          {item.grNumber ? ` (GR ${item.grNumber})` : ''}. Confirm the student before collecting;
          the existing Finance screen does not preselect this onboarding case.
        </Typography>
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
        {canAssign && !item.feeAssignmentConfirmed && (
          <Button size="small" variant="outlined" startIcon={<Iconify icon="mdi:receipt-text-plus-outline" />}
            disabled={!item.studentEnrollmentId} onClick={() => setAssigning(true)}>
            Assign fee structure
          </Button>
        )}
        {canCollect && item.feeAssignmentConfirmed && (
          <Button size="small" variant="outlined" component={Link}
            href={financePaths.fees.collections}
            startIcon={<Iconify icon="mdi:cash-check" />}>
            Open Finance collections
          </Button>
        )}
        {item.studentEnrollmentId && item.status !== 4 && item.status !== 5 && (
          <Button size="small" startIcon={<Iconify icon="mdi:refresh" />}
            disabled={!canManage || query.isFetching || refreshState.isLoading}
            onClick={async () => {
              try {
                await refreshReadiness({ id: caseId, concurrencyStamp: item.concurrencyStamp }).unwrap();
                shikshaMitraToast.success({ message: 'Payment and onboarding readiness checked.' });
              } catch {
                shikshaMitraToast.error({ message: 'Readiness could not be refreshed. Reload this case and retry.' });
              }
            }}>
            {refreshState.isLoading ? 'Checking readiness…' : 'Recheck payment and onboarding'}
          </Button>
        )}
      </Stack>
      {item.studentEnrollmentId && item.status !== 4 && item.status !== 5 && !canManage && (
        <Typography variant="body2" color="text.secondary">
          An authorized Student Onboarding user must recheck readiness after payment.
        </Typography>
      )}
      {assigning && <AssignmentDrawer
        students={[{ id: item.studentId, studentId: item.studentId, studentName: item.studentName }]}
        academicYearId={item.academicYearId} academicYearName={item.academicYearName}
        onClose={() => { setAssigning(false); query.refetch(); }} />}
    </Stack>
  );
}
