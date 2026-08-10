'use client';

import { LoadingButton } from 'src/components/loading-button';

import CustomizableTable from 'src/components/customizabaleTable';

import { Add } from '@mui/icons-material';

import {
  Box,
  Alert,
  Stack,
  Switch,
  Button,
  Divider,
  TextField,
  Typography,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';

import { EnrollmentSettingsEditorDrawer } from './enrollment-settings-editor-drawer';

import { EnrollmentSettingsDecisionCards } from './enrollment-settings-decision-cards';

import {
  enrollmentTableWrapperSx,
  enrollmentTableContainerSx,
} from '../admissions-crm/workspace-table-patterns';

import { useAdmissionsPlaybookWorkspace } from './admissions-playbook-configuration-context';

export function AdmissionsPlaybookSection1() {
  const { state: controllerState, actions, meta } = useAdmissionsPlaybookWorkspace();
  const {
    academicYearId,
    columns,
    createState,
    data,
    entranceExamMode,
    handleQuickSetup,
    isFetching,
    openNew,
    playbooksQuery,
    quickSetupHallTicket,
    quickSetupKind,
    quickSetupName,
    quickSetupOpen,
    setQuickSetupHallTicket,
    setQuickSetupKind,
    setQuickSetupName,
    setQuickSetupOpen,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      <Stack spacing={1.25} sx={{ flex: 1, minHeight: 0 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
          <Box>
            <Typography variant="subtitle1">
              {entranceExamMode ? 'Entrance exam policies' : 'Admission setups'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {data?.totalCount || 0} configured versions
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
            <Button
              size="small"
              variant="contained"
              startIcon={<Add />}
              disabled={!academicYearId}
              onClick={() => setQuickSetupOpen(true)}
            >
              {entranceExamMode ? 'Add exam policy' : 'Quick setup'}
            </Button>
            {!entranceExamMode ? (
              <Button size="small" variant="outlined" disabled={!academicYearId} onClick={openNew}>
                Advanced setup
              </Button>
            ) : null}
          </Stack>
        </Stack>
        {isFetching ? <LinearProgress /> : <Divider />}
        {playbooksQuery.isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => playbooksQuery.refetch()}>
                Retry
              </Button>
            }
          >
            {entranceExamMode
              ? 'Entrance exam policies could not be loaded.'
              : 'Admissions playbooks could not be loaded.'}
          </Alert>
        ) : null}
        <CustomizableTable
          tableId="student-enrollment-admissions-playbooks"
          tableTitle={entranceExamMode ? 'Entrance exam policies' : 'Admissions Playbooks'}
          columns={columns}
          data={data?.items || []}
          isLoading={isFetching}
          defaultRowsPerPage={10}
          noDataText={
            entranceExamMode
              ? 'No entrance exam policy is configured.'
              : 'No admission setup yet. Use Quick setup for the common school workflow.'
          }
          wrapperProps={{ sx: enrollmentTableWrapperSx }}
          tableContainerProps={{ sx: enrollmentTableContainerSx }}
        />
      </Stack>
      <EnrollmentSettingsEditorDrawer
        open={quickSetupOpen}
        onClose={() => setQuickSetupOpen(false)}
        title={entranceExamMode ? 'New Entrance Exam Policy' : 'Quick Admission Setup'}
        description={
          entranceExamMode
            ? 'Choose the assessment approach. The guided policy editor opens next.'
            : 'Create a safe starting draft, then refine advanced rules when needed.'
        }
        busy={createState.isLoading}
        width={520}
        actions={
          <>
            <Button disabled={createState.isLoading} onClick={() => setQuickSetupOpen(false)}>
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              loading={createState.isLoading}
              disabled={!quickSetupName.trim()}
              onClick={handleQuickSetup}
            >
              Create & Continue
            </LoadingButton>
          </>
        }
      >
        <Stack spacing={2}>
          <Alert severity="info">
            {entranceExamMode
              ? 'Choose the assessment mode, then configure applicability, pass rules, and schedules in 3 guided steps.'
              : 'This creates a safe draft with the usual school defaults. Advanced rules remain available later.'}
          </Alert>
          <TextField
            fullWidth
            size="small"
            label="Setup name"
            value={quickSetupName}
            onChange={(event) => setQuickSetupName(event.target.value)}
          />
          <EnrollmentSettingsDecisionCards
            label="Assessment process"
            value={quickSetupKind}
            onChange={setQuickSetupKind}
            options={[
              {
                value: 'exam',
                title: 'Written Entrance Exam',
                description:
                  'Configure assessment components, pass rules, hall tickets, and slots.',
                icon: 'mdi:clipboard-text-outline',
                recommended: true,
              },
              {
                value: 'interaction',
                title: 'Student Interaction',
                description: 'Use an interview, interaction, observation, or readiness assessment.',
                icon: 'mdi:account-voice',
              },
              ...(!entranceExamMode
                ? [
                    {
                      value: 'no-exam' as const,
                      title: 'No Entrance Assessment',
                      description: 'Move eligible applicants directly into registration.',
                      icon: 'mdi:clipboard-check-outline',
                    },
                  ]
                : []),
            ]}
          />
          {quickSetupKind === 'exam' ? (
            <FormControlLabel
              control={
                <Switch
                  checked={quickSetupHallTicket}
                  onChange={(event) => setQuickSetupHallTicket(event.target.checked)}
                />
              }
              label="Generate hall tickets for this exam"
            />
          ) : null}
          <Typography variant="body2" color="text.secondary">
            Exam dates and capacity are added from slot operations. Registration, Class Placement,
            and Activation keep their own settings.
          </Typography>
        </Stack>
      </EnrollmentSettingsEditorDrawer>
    </>
  );
}
