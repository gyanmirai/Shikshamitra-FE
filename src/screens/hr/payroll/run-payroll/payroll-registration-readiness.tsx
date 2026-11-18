'use client';

import { useState, useEffect } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { HrSetupLink } from 'src/screens/hr/recovery/hr-setup-controls';
import { useHrTableQuery } from 'src/screens/hr/hooks/use-hr-table-query';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import { useGetPayrollRegistrationReadinessQuery } from 'src/redux/hr/statutory-profile-api';
import { Box, Stack, Button, Drawer, Divider, Typography, LinearProgress } from '@mui/material';

import { DrawerHeader } from '../../policies/components/HRPolicySharedUI';

export function PayrollRegistrationReadiness({ month }: { month: string | null }) {
  const [openMonth, setOpenMonth] = useState<string | null>(null);
  const open = Boolean(month && openMonth === month);
  const close = () => setOpenMonth(null);
  const [page, setPage] = useState({ number: 1, size: 25, search: '' });
  useEffect(() => {
    setPage({ number: 1, size: 25, search: '' });
    setOpenMonth(null);
  }, [month]);
  const query = useHrTableQuery(
    {
      table: 'hr-payroll-registration-readiness',
      query: { month: month ?? '', search: page.search },
      page: page.number - 1,
      size: page.size,
      resetPage: () => setPage((current) => ({ ...current, number: 1 })),
      skip: !open || !month,
    },
    useGetPayrollRegistrationReadinessQuery(
      { month: month ?? '', page: page.number, pageSize: page.size, search: page.search },
      { skip: !open || !month }
    )
  );
  const exportTable = useHrTableExport('hr-payroll-registration-readiness', {
    month,
    search: page.search,
  });
  const status = (apply: boolean, registered: boolean) => (
    <Label variant="soft" color={apply && !registered ? 'warning' : 'default'}>
      {!apply ? 'Turned off' : registered ? 'Number recorded' : 'Number missing'}
    </Label>
  );
  return (
    <>
      <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} alignItems="center">
        <Box sx={{ flex: '1 1 230px' }}>
          <Typography variant="subtitle2">PF and ESIC Registration</Typography>
          <Typography variant="caption" color="text.secondary">
            Missing numbers can be added later. Contributions still apply when eligible.
          </Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          disabled={!month}
          startIcon={<Iconify icon="mdi:card-account-details-outline" />}
          aria-haspopup="dialog"
          onClick={() => setOpenMonth(month)}
        >
          View registrations
        </Button>
      </Stack>
      <Drawer
        anchor="right"
        open={open}
        onClose={close}
        slotProps={{
          paper: {
            role: 'dialog',
            'aria-modal': true,
            'aria-label': 'PF and ESIC Registration',
            sx: { width: { xs: '100%', sm: 'min(760px, 92vw)' } },
          },
        }}
      >
        <DrawerHeader
          title="PF and ESIC Registration"
          subtitle={month ?? undefined}
          helpText="Registration numbers can be added after payroll. PF and ESIC are evaluated independently."
          onClose={close}
        />
        <Divider />
        <Stack spacing={1.5} sx={{ minHeight: 0, flex: 1, overflow: 'auto', p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Missing numbers can be added later. Contributions still apply when eligible. A scheme
            that is turned off has no contributions.
          </Typography>
          <Box sx={{ height: 2 }}>
            {query.isFetching && !query.isLoading && (
              <LinearProgress aria-label="Refreshing registrations" />
            )}
          </Box>
          <CustomizableTable
            showColumns
            showExport
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
                filterType: 'enum',
                enumOptions: ['Number recorded', 'Number missing', 'Turned off'].map((value) => ({
                  value,
                  label: value,
                })),
                label: 'PF',
                render: (_, row) => status(row.applyPf, row.pfNumberPresent),
              },
              {
                id: 'applyEsic',
                filterType: 'enum',
                enumOptions: ['Number recorded', 'Number missing', 'Turned off'].map((value) => ({
                  value,
                  label: value,
                })),
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
                  <HrSetupLink setup="staffPayroll" employeeId={row.employeeId} />
                ),
              },
            ]}
            serverSidePagination
            totalCount={query.currentData?.totalCount ?? 0}
            isLoading={query.isLoading}
            serverSideSearch
            searchTerm={page.search}
            page={page.number - 1}
            rowsPerPage={page.size}
            onServerSearch={(search) => setPage((current) => ({ ...current, number: 1, search }))}
            isFilter={false}
            noDataText="No editable staff payroll matches this month."
            onServerPagination={(number, size) =>
              setPage((current) => ({ ...current, number, size }))
            }
            tableContainerProps={{ sx: { maxHeight: 400, overflow: 'auto' } }}
            {...query.tableProps}
          />
        </Stack>
      </Drawer>
    </>
  );
}
