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
import { Box, Card, Link, Alert, Button, Skeleton } from '@mui/material';

import { SalaryStructureBuilder } from './SalaryStructureBuilder';
import { useSalaryEditorPrefetch } from './use-salary-editor-prefetch';
import { salaryStructureHref, resolveSalaryReturnHref } from './salary-editor-navigation';

export default function SalaryEditorScreen({ employeeId }: { employeeId: string }) {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const initialMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(searchParams.get('month') || '')
    ? searchParams.get('month')!
    : undefined;
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
      sx={{
        height: 1,
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <CustomBreadcrumbs
        heading="Set Up Staff Salary"
        headingComponent="h1"
        layout="inline"
        description="Choose salary details, confirm statutory treatment, then preview and save."
        links={[
          { name: 'Payroll Management', href: hrPaths.payroll.root },
          { name: 'Staff Salaries', href: salaryStructureHref(employeeId) },
          { name: 'Set Up Salary' },
        ]}
        sx={{ flexShrink: 0 }}
      />
      {loading || !permissionsInitialized ? (
        <Skeleton variant="rounded" height={240} />
      ) : canReadSalary ? (
        <SalaryEditorWorkspace
          key={employeeId}
          employeeId={employeeId}
          initialMonth={initialMonth}
          returnHref={returnHref}
          requestNavigation={requestNavigation}
          editorState={editorState}
          onEditorStateChange={setEditorState}
        />
      ) : (
        <Alert
          severity="error"
          action={
            <Button size="small" href={returnHref}>
              Back
            </Button>
          }
        >
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
  initialMonth,
  requestNavigation,
  editorState,
  onEditorStateChange,
}: {
  employeeId: string;
  initialMonth?: string;
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
  const [effectiveMonth, setEffectiveMonth] = useState(initialMonth);
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
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        data-testid="salary-editor-content"
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflowY: 'auto',
          p: 0.5,
          scrollbarGutter: 'stable',
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
              <Button size="small" onClick={() => refetch()} disabled={isFetching}>
                Retry
              </Button>
            }
          >
            Unable to load staff details. Check your access and try again.
          </Alert>
        ) : (
          <Box display="grid" gap={2}>
            <SalaryStructureBuilder
              guided
              formik={formik}
              initialMonth={initialMonth}
              onEffectiveMonthChange={setEffectiveMonth}
              employeeId={employeeId}
              dateOfJoining={employee.dateOfJoining ?? employee.doj}
              employeeIsActive={
                status === EmployeeStatusType.Active || String(status).toLowerCase() === 'active'
              }
              actionContainer={actionContainer}
              onEditorStateChange={onEditorStateChange}
            />
            <Link
              component={RouterLink}
              href={`${hrPaths.payroll.runPayroll}${effectiveMonth ? `?${new URLSearchParams({ month: effectiveMonth })}` : ''}`}
              variant="body2"
              underline="hover"
              sx={{ justifySelf: 'start' }}
            >
              Manage one-time adjustments in monthly payroll
            </Link>
          </Box>
        )}
      </Box>
      <Card
        data-testid="salary-editor-footer"
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr) auto',
            sm: 'auto minmax(0, 1fr) auto auto auto',
          },
          alignItems: 'center',
          flexShrink: 0,
          gap: 1,
          px: 2,
          py: 1.5,
          bgcolor: 'background.paper',
        }}
      >
        <Button
          size="small"
          onClick={() => requestNavigation(() => router.push(returnHref))}
          disabled={editorState.busy}
          color="inherit"
          sx={{ gridColumn: 1, gridRow: 1, justifySelf: 'start' }}
        >
          Cancel
        </Button>
        <Box ref={setActionContainer} sx={{ display: 'contents' }} />
      </Card>
    </Box>
  );
}
