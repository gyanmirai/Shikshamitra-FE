'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useRouter } from 'src/routes/hooks';
import { useSearchParams } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import { RouterLink } from 'src/routes/components/router-link';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { useGetEmployeeByIdQuery } from 'src/redux/hr/employeeApi';
import { EmployeeStatusType } from 'src/enums/employee-status-type';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { Box, Alert, Paper, Button, Skeleton, Typography } from '@mui/material';

import { SalaryStructureBuilder } from './SalaryStructureBuilder';
import { useSalaryEditorPrefetch } from './use-salary-editor-prefetch';
import { salaryStructureHref, resolveSalaryReturnHref } from './salary-editor-navigation';

export default function SalaryEditorScreen({ employeeId }: { employeeId: string }) {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const router = useRouter();
  const { permissions, loading, permissionsInitialized } = useSelector(
    (state: RootState) => state.auth
  );
  const canReadSalary =
    permissionsInitialized &&
    !loading &&
    hasGrantedPermission(permissions, [
      hrPermissions.payroll.compensationRevisionActions.view,
      hrPermissions.payroll.compensationRevisionActions.manage,
    ]);
  const [editorState, setEditorState] = useState({ dirty: false, busy: false });
  const [returnHref, setReturnHref] = useState(salaryStructureHref(employeeId));
  useEffect(() => {
    setReturnHref(resolveSalaryReturnHref(employeeId, returnTo, window.location.origin));
  }, [employeeId, returnTo]);
  const { requestNavigation, confirmation } = useUnsavedNavigation(editorState.dirty, {
    push: router.push,
    blockNavigation: editorState.busy,
  });

  return (
    <Box
      data-testid="salary-editor-page"
      sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <CustomBreadcrumbs
        heading="Edit Salary"
        headingComponent="h1"
        layout="inline"
        description="Set recurring salary and when it takes effect."
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Payroll Structure', href: salaryStructureHref(employeeId) },
          { name: 'Edit Salary' },
        ]}
        sx={{ flexShrink: 0 }}
      />
      {loading || !permissionsInitialized ? (
        <Skeleton variant="rounded" height={240} />
      ) : canReadSalary ? (
        <SalaryEditorWorkspace
          key={employeeId}
          employeeId={employeeId}
          returnHref={returnHref}
          requestNavigation={requestNavigation}
          editorState={editorState}
          onEditorStateChange={setEditorState}
        />
      ) : (
        <Alert severity="error" action={<Button href={returnHref}>Back</Button>}>
          You do not have permission to view this salary.
        </Alert>
      )}
      {confirmation}
    </Box>
  );
}

function SalaryEditorWorkspace({
  employeeId,
  returnHref,
  requestNavigation,
  editorState,
  onEditorStateChange,
}: {
  employeeId: string;
  returnHref: string;
  requestNavigation: (proceed: () => void) => void;
  editorState: { dirty: boolean; busy: boolean };
  onEditorStateChange: (state: { dirty: boolean; busy: boolean }) => void;
}) {
  const router = useRouter();
  const prefetchSalaryEditor = useSalaryEditorPrefetch(employeeId);
  useEffect(() => prefetchSalaryEditor(), [prefetchSalaryEditor]);
  const {
    currentData: employee,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetEmployeeByIdQuery(employeeId);
  const [actionContainer, setActionContainer] = useState<HTMLDivElement | null>(null);
  const formik = useFormik({
    initialValues: {
      firstName: employee?.firstName,
      lastName: employee?.lastName,
      fullName: employee?.fullName,
      employeeIdentifier: employee?.employeeIdentifier,
    },
    enableReinitialize: true,
    onSubmit: () => undefined,
  });
  const status = employee?.employeeStatusType ?? employee?.status;
  const accessDenied = isError && !isFetching;

  return (
    <Paper
      variant="outlined"
      sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      <Box
        data-testid="salary-editor-content"
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          p: { xs: 2, md: 3 },
          overscrollBehavior: 'contain',
        }}
      >
        {isLoading ? (
          <Box display="grid" gap={2} aria-busy="true" aria-label="Loading staff details">
            <Skeleton width="50%" height={40} />
            <Skeleton variant="rounded" height={240} />
          </Box>
        ) : accessDenied || !employee ? (
          <Alert
            severity="error"
            action={
              <Button onClick={() => refetch()} disabled={isFetching}>
                Retry
              </Button>
            }
          >
            Unable to load staff details. Check your access and try again.
          </Alert>
        ) : (
          <Box display="grid" gap={2}>
            <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere' }}>
              {employee.fullName}
              {employee.employeeIdentifier ? ` · ${employee.employeeIdentifier}` : ''}
            </Typography>
            <SalaryStructureBuilder
              formik={formik}
              employeeId={employeeId}
              dateOfJoining={employee.dateOfJoining ?? employee.doj}
              employeeIsActive={
                status === EmployeeStatusType.Active || String(status).toLowerCase() === 'active'
              }
              actionContainer={actionContainer}
              onEditorStateChange={onEditorStateChange}
            />
            <Button
              component={RouterLink}
              href={hrPaths.payroll.runPayroll}
              size="small"
              sx={{ justifySelf: 'start', textAlign: 'left', minHeight: 44 }}
            >
              Manage one-time adjustments in monthly payroll
            </Button>
          </Box>
        )}
      </Box>
      <Box
        data-testid="salary-editor-footer"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          flexWrap: 'wrap',
          gap: 1,
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          '& button': { minHeight: 44 },
        }}
      >
        <Button
          onClick={() => requestNavigation(() => router.push(returnHref))}
          disabled={editorState.busy}
          color="inherit"
        >
          Back
        </Button>
        <Box ref={setActionContainer} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }} />
      </Box>
    </Paper>
  );
}
