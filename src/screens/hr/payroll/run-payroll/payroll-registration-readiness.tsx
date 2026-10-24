'use client';

import { useState } from 'react';
import { RouterLink } from 'src/routes/components';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CustomizableTable from 'src/components/customizabaleTable';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import { useGetPayrollRegistrationReadinessQuery } from 'src/redux/hr/statutory-profile-api';
import {
  Chip,
  Alert,
  Stack,
  Button,
  Accordion,
  Typography,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import { staffPayrollEditHref } from '../../employee/payroll-profile-utils';

export function PayrollRegistrationReadiness({ month }: { month: string | null }) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState({ number: 1, size: 25 });
  const query = useGetPayrollRegistrationReadinessQuery(
    { month: month ?? '', page: page.number, pageSize: page.size },
    { skip: !open || !month }
  );
  const exportTable = useHrTableExport('hr-payroll-registration-readiness', { month });
  const status = (apply: boolean, registered: boolean) => (
    <Chip
      size="small"
      variant="outlined"
      color={!apply || !registered ? 'warning' : 'default'}
      label={!apply ? 'Turned off' : registered ? 'Number recorded' : 'Number missing'}
    />
  );
  return (
    <Accordion
      expanded={open}
      onChange={(_, expanded) => setOpen(expanded)}
      disableGutters
      variant="outlined"
      sx={{ borderRadius: 1 }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="subtitle2">Registration review before payroll refresh</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            Editable staff payroll only. PF and ESIC are evaluated independently during calculation.
            Missing numbers or a turned-off scheme produce a warning and zero applied contributions
            when eligible.
          </Typography>
          {query.isError && (
            <Alert
              severity="error"
              action={
                <Button size="small" onClick={() => query.refetch()}>
                  Retry
                </Button>
              }
            >
              Registration review could not be loaded.
            </Alert>
          )}
          <CustomizableTable
            showColumns
            showExport
            showFullScreen
            exportScope="all"
            tableId="payroll-registration-review"
            onExport={exportTable}
            tableTitle="Staff registrations"
            variant="embedded"
            error={query.error}
            onRetry={query.refetch}
            data={query.currentData?.items.map((row) => ({ ...row, id: row.employeeId })) ?? []}
            columns={[
              { id: 'employeeCode', label: 'Staff code' },
              { id: 'employeeName', label: 'Staff name' },
              {
                id: 'applyPf',
                label: 'PF',
                render: (_, row) => status(row.applyPf, row.pfNumberPresent),
              },
              {
                id: 'applyEsic',
                label: 'ESIC',
                render: (_, row) => status(row.applyEsic, row.esicNumberPresent),
              },
              { id: 'effectiveMonth', label: 'Registration effective month' },
              {
                isSort: false,
                isFilter: false,
                excludeFromExport: true,
                id: 'action',
                label: '',
                render: (_, row) => (
                  <Button
                    component={RouterLink}
                    href={staffPayrollEditHref(row.employeeId)}
                    size="small"
                  >
                    Review staff
                  </Button>
                ),
              },
            ]}
            serverSidePagination
            totalCount={query.currentData?.totalCount ?? 0}
            isLoading={query.isFetching}
            isSearch={false}
            isFilter={false}
            noDataText="No editable staff payroll matches this month."
            onServerPagination={(number, size) => setPage({ number, size })}
            tableContainerProps={{ sx: { maxHeight: 400, overflow: 'auto' } }}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
