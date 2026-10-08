'use client';

import { useFormik } from 'formik';
import { useState, useEffect } from 'react';
import { useRouter } from 'src/routes/hooks';
import { hrPaths } from 'src/constants/hr-menus';
import { LoadingScreen } from 'src/components/loading-screen';
import { useGetEmployeeByIdQuery } from 'src/redux/hr/employeeApi';
import { EmployeeStatusType } from 'src/enums/employee-status-type';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { Box, Alert, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { SalaryStructureBuilder } from './SalaryStructureBuilder';
import { useSalaryEditorPrefetch } from './use-salary-editor-prefetch';

export function SalaryEditorDialog({
  employeeId,
  handleClose,
}: {
  employeeId: string;
  handleClose: () => void;
}) {
  const prefetchSalaryEditor = useSalaryEditorPrefetch(employeeId);
  // Start independent editor reads while staff details load, without initializing an incomplete form.
  useEffect(() => prefetchSalaryEditor(), [prefetchSalaryEditor]);
  const {
    currentData: employee,
    isLoading,
    isError,
    refetch,
  } = useGetEmployeeByIdQuery(employeeId);
  const [editorState, setEditorState] = useState({ dirty: false, busy: false });
  const [actionContainer, setActionContainer] = useState<HTMLDivElement | null>(null);
  const router = useRouter();
  const { requestNavigation, confirmation } = useUnsavedNavigation(editorState.dirty, {
    push: router.push,
    blockNavigation: editorState.busy,
  });
  const close = () => requestNavigation(handleClose);
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
  return (
    <>
      <CustomDialog
        open
        handleClose={close}
        title="Edit salary"
        maxWidth="lg"
        hasForm={false}
        guardUnsavedChanges={false}
        disableClose={editorState.busy}
        paperProps={{
          sx: {
            maxHeight: '90dvh',
            width: { xs: '100%', sm: 'calc(100% - 64px)' },
            m: { xs: 0, sm: 4 },
          },
        }}
      >
        <DialogScrollContent>
          {isLoading ? (
            <LoadingScreen />
          ) : isError && !employee ? (
            <Alert severity="error" action={<Button onClick={() => refetch()}>Retry</Button>}>
              Unable to load staff details.
            </Alert>
          ) : employee ? (
            <Box display="grid" gap={2}>
              <Box>
                <Typography variant="subtitle1">
                  {employee.fullName}
                  {employee.employeeIdentifier ? ` · ${employee.employeeIdentifier}` : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Set recurring salary and when it takes effect.
                </Typography>
              </Box>
              <SalaryStructureBuilder
                formik={formik}
                employeeId={employeeId}
                dateOfJoining={employee.dateOfJoining ?? employee.doj}
                employeeIsActive={
                  status === EmployeeStatusType.Active || String(status).toLowerCase() === 'active'
                }
                actionContainer={actionContainer}
                onEditorStateChange={setEditorState}
              />
              <Button
                component="a"
                href={hrPaths.payroll.runPayroll}
                size="small"
                sx={{ justifySelf: 'start', textAlign: 'left' }}
              >
                Manage one-time adjustments in monthly payroll
              </Button>
            </Box>
          ) : null}
        </DialogScrollContent>
        <DialogActions
          sx={{
            flexWrap: 'wrap',
            gap: 1,
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            '& > :not(style) ~ :not(style)': { ml: 0 },
          }}
        >
          <Button onClick={close} disabled={editorState.busy} color="inherit">
            Close
          </Button>
          <Box ref={setActionContainer} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }} />
        </DialogActions>
      </CustomDialog>
      {confirmation}
    </>
  );
}
