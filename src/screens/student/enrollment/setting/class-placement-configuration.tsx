'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdmissionCrmPlacementOptionDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useState, useEffect } from 'react';
import { RouterLink } from 'src/routes/components';
import { shikshaMitraToast } from 'src/components/toast';
import CustomizableTable from 'src/components/customizabaleTable';
import { instituteSetupPaths } from 'src/constants/institute-setup';
import {
  AdmissionCrmPlacementTiming,
  useGetAdmissionCrmPlacementOptionsQuery,
} from 'src/redux/student/admissions-crm/admissions-crm-api';
import {
  Box,
  Chip,
  Stack,
  Alert,
  Button,
  Divider,
  Typography,
  LinearProgress,
} from '@mui/material';

import { useAdmissionYearDraft } from './use-admission-year-draft';
import { EnrollmentSettingsDecisionCards } from './enrollment-settings-decision-cards';
import { useEnrollmentSettingsDirtyState } from './enrollment-settings-dirty-state';
import {
  enrollmentTableWrapperSx,
  EnrollmentTableEmptyState,
  enrollmentTableContainerSx,
} from '../admissions-crm/workspace-table-patterns';

const getErrorMessage = (error: unknown) => {
  const response = error as {
    data?: { error?: { message?: string }; message?: string };
  };
  return (
    response.data?.error?.message ||
    response.data?.message ||
    'Class Placement settings could not be saved.'
  );
};

const capacityStatus = (row: AdmissionCrmPlacementOptionDto) => {
  if (!row.capacityConfigured || row.remainingCapacity == null) {
    return { label: 'Not configured', color: 'default' as const };
  }
  if (row.remainingCapacity === 0) {
    return { label: 'Full', color: 'error' as const };
  }
  if (row.remainingCapacity <= 5) {
    return { label: 'Nearly full', color: 'warning' as const };
  }
  return { label: 'Available', color: 'success' as const };
};

export function ClassPlacementConfiguration({ academicYearId }: { academicYearId: string }) {
  const admissionYear = useAdmissionYearDraft(academicYearId);
  const optionsQuery = useGetAdmissionCrmPlacementOptionsQuery({ academicYearId });
  const effectiveTiming =
    admissionYear.effective?.placementTiming ??
    AdmissionCrmPlacementTiming.StandardBeforeActivation;
  const [timing, setTiming] = useState(effectiveTiming);
  const isDirty = timing !== effectiveTiming;

  useEffect(() => {
    setTiming(effectiveTiming);
  }, [effectiveTiming]);

  useEnrollmentSettingsDirtyState({
    source: 'class-placement-settings',
    dirty: isDirty,
    onDiscard: () => setTiming(effectiveTiming),
  });

  const save = async () => {
    if (admissionYear.versionsQuery.isError) return;
    try {
      await admissionYear.savePatch({ placementTiming: timing }, admissionYear.draft);
      shikshaMitraToast.success({
        message: 'Class Placement timing saved in the Admission Year draft.',
      });
    } catch (error) {
      shikshaMitraToast.error({ message: getErrorMessage(error) });
    }
  };

  const columns: IColumn[] = [
    {
      id: 'boardName',
      label: 'Board',
      minWidth: 120,
      isSort: true,
    },
    {
      id: 'mediumName',
      label: 'Medium',
      minWidth: 130,
      isSort: true,
    },
    {
      id: 'standardName',
      label: 'Standard',
      minWidth: 130,
      isSort: true,
    },
    {
      id: 'divisionName',
      label: 'Division',
      minWidth: 120,
      isSort: true,
    },
    {
      id: 'divisionStrength',
      label: 'Capacity',
      minWidth: 100,
      align: 'right',
      isSort: true,
      filterType: 'number',
      render: (value, row) =>
        (row as AdmissionCrmPlacementOptionDto).capacityConfigured ? value : 'Unknown',
    },
    {
      id: 'activeStudentCount',
      label: 'Active students',
      minWidth: 130,
      align: 'right',
      isSort: true,
      filterType: 'number',
    },
    {
      id: 'pendingActivationCount',
      label: 'Pending activation',
      minWidth: 145,
      align: 'right',
      isSort: true,
      filterType: 'number',
    },
    {
      id: 'remainingCapacity',
      label: 'Remaining',
      minWidth: 110,
      align: 'right',
      isSort: true,
      filterType: 'number',
      render: (value, row) =>
        (row as AdmissionCrmPlacementOptionDto).capacityConfigured ? value : 'Unknown',
    },
    {
      id: 'capacityStatus',
      label: 'Status',
      minWidth: 125,
      render: (_value, row) => {
        const status = capacityStatus(row as AdmissionCrmPlacementOptionDto);
        return <Chip size="small" variant="outlined" color={status.color} label={status.label} />;
      },
    },
  ];

  if (admissionYear.versionsQuery.isLoading) {
    return <LinearProgress aria-label="Loading Class Placement settings" />;
  }

  if (admissionYear.versionsQuery.isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => admissionYear.versionsQuery.refetch()}
          >
            Retry
          </Button>
        }
      >
        Admission Year placement rules could not be loaded. Editing is unavailable until they are
        restored.
      </Alert>
    );
  }

  return (
    <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
      <Box>
        <Typography component="h2" variant="subtitle1">
          Placement Decision
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
          Choose how much placement detail must be confirmed before a student can be activated.
        </Typography>
        <EnrollmentSettingsDecisionCards
          label="Division assignment timing"
          value={timing}
          onChange={setTiming}
          disabled={admissionYear.isCreating || admissionYear.isSaving}
          options={[
            {
              value: AdmissionCrmPlacementTiming.StandardBeforeActivation,
              title: 'Confirm Standard First',
              description:
                'Activate after board, medium, and standard are confirmed. Assign the division later when the timetable is ready.',
              icon: 'mdi:school-outline',
              recommended: true,
              meta: 'Best for schools that finalize divisions close to opening day.',
            },
            {
              value: AdmissionCrmPlacementTiming.DivisionBeforeActivation,
              title: 'Confirm Full Class Placement',
              description:
                'Require board, medium, standard, and division before activation can finish.',
              icon: 'mdi:account-group-outline',
              meta: 'Best when class capacity is finalized during admissions.',
            },
          ]}
        />
      </Box>

      <Stack direction="row" gap={1} flexWrap="wrap">
        <Button
          variant="contained"
          disabled={!isDirty || admissionYear.isCreating || admissionYear.isSaving}
          onClick={save}
        >
          Save draft
        </Button>
        <Button component={RouterLink} href={instituteSetupPaths.academicSetup} variant="outlined">
          Open Academic Setup
        </Button>
      </Stack>

      {admissionYear.draft ? (
        <Alert severity="warning">
          Publish the Admission Year draft before the new placement timing applies to new
          applicants.
        </Alert>
      ) : null}

      <Divider />

      <Box>
        <Typography variant="subtitle1">Current class capacity</Typography>
        <Typography variant="body2" color="text.secondary">
          Capacity comes from Institute Setup. Active counts come from Student Records, and pending
          counts include applicants already moving through activation.
        </Typography>
      </Box>

      {optionsQuery.isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => optionsQuery.refetch()}>
              Retry
            </Button>
          }
        >
          Class capacity could not be loaded.
        </Alert>
      ) : (
        <CustomizableTable
          tableId="student-enrollment-class-placement-capacity"
          tableTitle="Class capacity"
          columns={columns}
          data={optionsQuery.data || []}
          isLoading={optionsQuery.isLoading || optionsQuery.isFetching}
          defaultRowsPerPage={25}
          rowsPerPageOptions={[10, 25, 50, 100]}
          noDataText={
            <EnrollmentTableEmptyState
              title="No divisions are configured"
              description="Add board, medium, standard, and division structure in Academic Setup."
            />
          }
          wrapperProps={{ sx: enrollmentTableWrapperSx }}
          tableContainerProps={{ sx: enrollmentTableContainerSx }}
        />
      )}

      <Alert severity="info">
        Over-capacity placement is blocked unless the user has the capacity-override permission and
        records a reason. A missing capacity is shown as unknown.
      </Alert>
    </Stack>
  );
}
