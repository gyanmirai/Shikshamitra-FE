'use client';

import type { Dayjs } from 'dayjs';
import type { IssuedPayslip } from 'src/redux/hr/payslip-api';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import { Stack, Button, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { useGetIssuedPayslipsQuery } from 'src/redux/hr/payslip-api';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import PayslipViewer from '../salarySlip-generate/salarySlipGenerate';

const formatPeriod = (monthYear: string) => dayjs(`${monthYear}-01`).format('MMM YYYY');

export default function MonthlyPayslipsWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const monthParam = params.get('month');
  const monthYear = monthParam && /^\d{4}-(0[1-9]|1[0-2])$/.test(monthParam) ? monthParam : null;
  const [detail, setDetail] = useState<IssuedPayslip | 'lookup' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [search, setSearch] = useState('');
  const [paging, setPaging] = useState({ scope: '', page: 0, size: 25 });
  const querySearch = search.trim();
  const scope = JSON.stringify([monthYear, querySearch]);
  const page = paging.scope === scope ? paging.page : 0;
  const issued = useGetIssuedPayslipsQuery(
    {
      monthYear: monthYear ?? undefined,
      search: querySearch || undefined,
      skipCount: page * paging.size,
      maxResultCount: paging.size,
    },
    { refetchOnMountOrArgChange: 15, refetchOnFocus: true }
  );
  const changePeriod = (value: Dayjs | null) => {
    if (value && !value.isValid()) return;
    const next = new URLSearchParams(params.toString());
    if (value) next.set('month', value.format('YYYY-MM'));
    else next.delete('month');
    router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false });
  };
  const columns = useMemo<IColumn[]>(
    () => [
      {
        id: 'employeeName',
        label: 'Staff member',
        minWidth: 200,
        isSort: false,
        render: (name, row) => (
          <Stack>
            <Typography variant="subtitle2">{name}</Typography>
            {row.employeeCode && (
              <Typography variant="caption" color="text.secondary">
                {row.employeeCode}
              </Typography>
            )}
          </Stack>
        ),
      },
      {
        id: 'monthYear',
        label: 'Pay period',
        minWidth: 115,
        isSort: false,
        render: (value) => formatPeriod(value),
      },
      {
        id: 'issuedAt',
        label: 'Issued on',
        minWidth: 115,
        isSort: false,
        render: (value) => fDate(value),
      },
      {
        id: 'isPaid',
        label: 'Status',
        minWidth: 95,
        isSort: false,
        render: (value) => (
          <Label color={value ? 'success' : 'info'}>{value ? 'Paid' : 'Issued'}</Label>
        ),
      },
      {
        id: 'action',
        label: 'Action',
        align: 'right',
        sticky: true,
        stickyPosition: 'right',
        minWidth: 76,
        isSort: false,
        excludeFromExport: true,
        render: (_, row) => (
          <ThreeDotsActions
            showViewIcon
            showThreeDots={false}
            viewLabel={`View payslip for ${row.employeeName}, ${formatPeriod(row.monthYear)}`}
            handleViewClick={() => setDetail(row as IssuedPayslip)}
          />
        ),
      },
    ],
    []
  );
  if (detail) {
    const selection = detail === 'lookup' ? undefined : detail;
    return (
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0, minWidth: 0, overflowY: 'auto', pb: 2 }}>
        <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1} sx={{ px: 1 }}>
          <Button
            size="small"
            color="inherit"
            startIcon={<Iconify icon="mdi:arrow-left" />}
            onClick={() => setDetail(null)}
          >
            Back to payslips
          </Button>
          <Typography component="h2" variant="subtitle1">
            {selection
              ? `${selection.employeeName} · ${formatPeriod(selection.monthYear)}`
              : 'Find by employee'}
          </Typography>
        </Stack>
        <PayslipViewer hideHeading issuedSelection={selection} />
      </Stack>
    );
  }
  return (
    <CustomizableTable
      tableId="issued-monthly-payslips"
      tableTitle="Issued payslips"
      headerContent={
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          gap={1}
          sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
        >
          <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
            <DatePicker
              label="Pay period"
              value={monthYear ? dayjs(`${monthYear}-01`) : null}
              views={['month', 'year']}
              onChange={(value) => {
                if (value) changePeriod(value);
              }}
              slotProps={{ textField: { size: 'small' } }}
              sx={{ width: { xs: '100%', sm: 210 } }}
            />
            {monthYear ? (
              <Button color="inherit" size="small" onClick={() => changePeriod(null)}>
                Show all periods
              </Button>
            ) : (
              <Typography variant="body2" color="text.secondary">
                All periods
              </Typography>
            )}
          </Stack>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:account-search-outline" />}
            onClick={() => setDetail('lookup')}
            sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, flexShrink: 0 }}
          >
            Find by employee
          </Button>
        </Stack>
      }
      columns={columns}
      data={issued.isError ? [] : (issued.currentData?.items ?? [])}
      isLoading={issued.isFetching && !issued.currentData}
      isRefreshing={issued.isFetching && Boolean(issued.currentData)}
      error={issued.error}
      onRetry={issued.refetch}
      noDataText={
        monthYear ? 'No issued payslips for this period.' : 'No issued payslips to show.'
      }
      isFilter={false}
      showFullScreen={false}
      serverSideSearch
      searchTerm={searchTerm}
      onSearchInputChange={setSearchTerm}
      onServerSearch={setSearch}
      searchFieldProps={{
        placeholder: 'Search staff name or code',
        inputProps: { maxLength: 100 },
      }}
      serverSidePagination
      totalCount={issued.isError ? 0 : (issued.currentData?.totalCount ?? 0)}
      page={page}
      rowsPerPage={paging.size}
      rowsPerPageOptions={[10, 25, 50]}
      onServerPagination={(nextPage, size) => setPaging({ scope, page: nextPage - 1, size })}
      wrapperProps={{ sx: { minWidth: 0, overflow: 'hidden' } }}
      tableContainerProps={{ sx: { height: 1 } }}
    />
  );
}
