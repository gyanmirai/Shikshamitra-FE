'use client';

import type { Board } from 'src/types/school';

import { Box, Paper, Stack } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import LeaveRequests from './leave-requests';
import { useAttendanceContext } from '../setting/attendance-context';

const ALL_ORGANIZATIONS = 'All Organizations';
const ALL_CLASSES = 'All Classes';
const ALL_DIVISIONS = 'All Divisions';

export default function LeaveRequestsPage() {
  const context = useAttendanceContext();
  const boards: Board[] = context.currentYear?.boards ?? [];
  const board = boards.find((item) => item.id === context.params.get('board')) ?? boards[0];
  const mediums = board?.educationMediums ?? [];
  const medium = mediums.find((item) => item.id === context.params.get('medium')) ?? mediums[0];
  const organizations = medium?.educationMediumStages ?? [];
  const organization = organizations.find((item) => item.id === context.params.get('organization'));
  const standards = organization
    ? organization.standards
    : organizations.flatMap((item) => item.standards);
  const standard = standards.find((item) => item.id === context.params.get('class'));
  const divisions = standard?.divisions ?? [];
  const division = divisions.find((item) => item.id === context.params.get('division'));

  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        heading="Leave Requests"
        description="Create and review student leave requests. Pending requests can be edited before a decision."
        links={[
          { name: 'Student', href: '/student/dashboard' },
          { name: 'Attendance', href: '/student/attendance/take-attendance' },
          { name: 'Leave Requests' },
        ]}
      />
      <Paper variant="outlined" sx={{ p: 1, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
          <CustomSelect
            fullWidth
            size="small"
            label="Board"
            value={board?.id ?? ''}
            options={boards}
            labelKey="name"
            valueKey="id"
            disabled={!boards.length}
            onChange={(value) =>
              context.update({
                board: String(value),
                medium: undefined,
                organization: undefined,
                class: undefined,
                division: undefined,
                leavePage: undefined,
              })
            }
          />
          <CustomSelect
            fullWidth
            size="small"
            label="Medium"
            value={medium?.id ?? ''}
            options={mediums}
            labelKey="name"
            valueKey="id"
            disabled={!board}
            onChange={(value) =>
              context.update({
                medium: String(value),
                organization: undefined,
                class: undefined,
                division: undefined,
                leavePage: undefined,
              })
            }
          />
          <CustomSelect
            fullWidth
            size="small"
            label="Organization"
            value={organization?.id ?? ALL_ORGANIZATIONS}
            options={[
              { value: ALL_ORGANIZATIONS, label: ALL_ORGANIZATIONS },
              ...organizations.map((item) => ({
                value: item.id,
                label: item.name,
              })),
            ]}
            disabled={!medium}
            onChange={(value) =>
              context.update({
                organization: value === ALL_ORGANIZATIONS ? undefined : String(value),
                class: undefined,
                division: undefined,
                leavePage: undefined,
              })
            }
          />
          <CustomSelect
            fullWidth
            size="small"
            label="Class"
            value={standard?.id ?? ALL_CLASSES}
            options={[
              { value: ALL_CLASSES, label: ALL_CLASSES },
              ...standards.map((item) => ({
                value: item.id,
                label: item.name,
              })),
            ]}
            disabled={!medium}
            onChange={(value) =>
              context.update({
                class: value === ALL_CLASSES ? undefined : String(value),
                division: undefined,
                leavePage: undefined,
              })
            }
          />
          <CustomSelect
            fullWidth
            size="small"
            label="Division"
            value={division?.id ?? ALL_DIVISIONS}
            options={[
              { value: ALL_DIVISIONS, label: ALL_DIVISIONS },
              ...divisions.map((item) => ({
                value: item.id,
                label: item.name,
              })),
            ]}
            disabled={!standard}
            onChange={(value) =>
              context.update({
                division: value === ALL_DIVISIONS ? undefined : String(value),
                leavePage: undefined,
              })
            }
          />
        </Stack>
      </Paper>
      <LeaveRequests
        scope={{
          academicYearId: context.currentYear?.id,
          educationMediumId: medium?.id,
          organizationId: organization?.id,
          standardId: standard?.id,
          divisionId: division?.id,
        }}
        selectedMedium={medium}
        selectedOrganizationId={organization?.id}
        selectedStandardId={standard?.id}
        selectedDivisionId={division?.id}
      />
    </Box>
  );
}
