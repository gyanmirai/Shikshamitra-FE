import type { IColumn } from 'src/components/customizabaleTable/types';
import type { LibraryRolloverPreview } from 'src/redux/library/rollover-api';

import { GlobalIcons } from 'src/utils/icons';
import { formatDateOnly } from 'src/utils/date-only';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Grid, Alert, Stack, Typography } from '@mui/material';

const columns: IColumn[] = [
  { id: 'name', label: 'Policy', rowHeader: true, minWidth: 170 },
  { id: 'version', label: 'Version' },
  { id: 'role', label: 'Borrower', render: (value: number) => (value === 0 ? 'Student' : 'Staff') },
  {
    id: 'dueDateMode',
    label: 'Due dates',
    render: (value: number) => (value === 0 ? 'Manual' : 'Automatic'),
  },
  { id: 'effectiveFrom', label: 'Starts on', render: (value: string) => formatDateOnly(value) },
  {
    id: 'hasSelectors',
    label: 'Applies to',
    render: (value: boolean) =>
      value ? 'Matching targets' : 'All eligible borrowers in this role',
  },
];

export function RolloverPreviewResult({ result }: { result: LibraryRolloverPreview }) {
  const { calendar, loans } = result;
  return (
    <Stack spacing={2}>
      <Typography component="h3" variant="h6">
        {result.sourceYear.name} to {result.targetYear.name} on {formatDateOnly(result.schoolDate)}
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormSectionCard title="Target calendar" icon={GlobalIcons.calendar}>
            <Stack spacing={1}>
              <Typography variant="body2">
                {calendar.confirmedTimeZoneId
                  ? `Confirmed timezone ${calendar.confirmedTimeZoneId}`
                  : 'Library timezone needs confirmation.'}
              </Typography>
              <Typography variant="body2">
                {calendar.openWeekdays == null
                  ? 'Opening weekdays need review.'
                  : `${calendar.openWeekdays} configured opening weekdays`}
              </Typography>
              {calendar.hoursError && <Alert severity="warning">{calendar.hoursError}</Alert>}
              {calendar.canPublishAutomatic ? (
                <Typography variant="body2">
                  Calendar checks for automatic policies pass.
                </Typography>
              ) : (
                <Typography variant="body2">
                  Complete the calendar checks before publishing automatic dates. Manual dates are
                  available through the existing borrowing rules.
                </Typography>
              )}
            </Stack>
          </FormSectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormSectionCard title="Loans carried forward" icon={GlobalIcons.history}>
            <Stack spacing={1}>
              {loans.scope === 'Restricted' ? (
                <Typography variant="body2">
                  Issue and Return View is required to see loan counts.
                </Typography>
              ) : (
                <Typography variant="body2">
                  {loans.sourceYearOpenCount} {loans.scope === 'Assigned' ? 'visible ' : ''}open
                  loans from {result.sourceYear.name}
                </Typography>
              )}
              {loans.unassignedYearOpenCount != null && (
                <Typography variant="body2">
                  {loans.unassignedYearOpenCount} open loans with their academic year unconfirmed
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Returns continue against the original loans and recorded due dates.
              </Typography>
            </Stack>
          </FormSectionCard>
        </Grid>
      </Grid>
      {result.policyScope === 'Assigned' && (
        <Alert severity="info">Policies are shown for your assigned academic scope.</Alert>
      )}
      {(
        [
          ['effective', 'Policies effective on the selected date', result.effectivePolicies],
          ['draft', 'Drafts created for the target year', result.draftPolicies],
        ] as const
      ).map(([key, title, rows]) => (
        <FormSectionCard key={key} title={title} icon={GlobalIcons.documentIcon}>
          {rows.length ? (
            <Box sx={{ height: 320 }}>
              <CustomizableTable
                variant="embedded"
                tableId={`library-rollover-${key}-policies`}
                columns={columns}
                data={rows}
                showExport={false}
                isFilter={false}
                wrapperProps={{ sx: { height: 1 } }}
                tableContainerProps={{ sx: { height: 1 } }}
              />
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No {key === 'draft' ? 'drafts' : 'effective versions'} in this preview.
            </Typography>
          )}
        </FormSectionCard>
      ))}
      <Typography variant="body2" color="text.secondary">
        Review and publish versions on the Policies tab. Checkout applies the policy that matches
        the actual borrower and copy.
      </Typography>
    </Stack>
  );
}
