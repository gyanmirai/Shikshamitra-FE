import type { IColumn } from 'src/components/customizabaleTable/types';
import type { StudentDashboardAttentionItem } from 'src/redux/student/dashboard/student-module-dashboard-types';

import Link from 'next/link';
import { useMemo } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { fDate, fDateTime } from 'src/utils/format-time';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Stack, Tooltip, Typography, IconButton } from '@mui/material';

import { AdminDashboardPanel, DashboardWorkspaceLink } from './admin-dashboard-panel';

import type { StudentSectionQuery } from '../hooks/use-student-dashboard-sections';

export function AdminDashboardAttention({ query }: { query: StudentSectionQuery }) {
  const data = !query.isError ? query.currentData : undefined;
  const rows = data?.attentionItems ?? [];
  const href = data?.metrics.find((metric) => metric.id === 'attention')?.href;
  const at = data?.generatedAt;
  const columns = useMemo<IColumn[]>(
    () => [
      {
        id: 'studentName',
        label: 'Student',
        isFilter: false,
        isSort: false,
        minWidth: 140,
        render: (value) => (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:account-school-outline" width={18} sx={{ color: 'primary.main' }} />
            <Typography variant="body2" fontWeight={600}>
              {value || 'Restricted student'}
            </Typography>
          </Stack>
        ),
      },
      { id: 'placement', label: 'Class / Division', isSort: false, isFilter: false, minWidth: 120 },
      { id: 'blocker', label: 'Pending work', isSort: false, isFilter: false, minWidth: 165 },
      { id: 'ownerName', label: 'Owner', isSort: false, isFilter: false, minWidth: 100 },
      {
        id: 'dueAt',
        label: 'Due',
        isFilter: false,
        isSort: false,
        minWidth: 120,
        render: (value: string | null) => {
          const overdue = Boolean(
            value && at && new Date(value).getTime() < new Date(at).getTime()
          );
          return value ? (
            <Tooltip title={fDateTime(value) ?? ''}>
              <Stack spacing={0.5} alignItems="flex-start">
                <Typography variant="caption">{fDate(value)}</Typography>
                {overdue && <Label color="warning">Overdue</Label>}
              </Stack>
            </Tooltip>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Not set
            </Typography>
          );
        },
      },
      {
        id: 'action',
        label: 'Action',
        isFilter: false,
        align: 'right',
        isSort: false,
        sticky: true,
        stickyPosition: 'right',
        width: 64,
        render: (_, dataRow) => {
          const row = dataRow as StudentDashboardAttentionItem;
          return (
            <Tooltip title={`Open setup for ${row.studentName}`}>
              <IconButton
                component={Link}
                href={row.href}
                prefetch={false}
                aria-label={`Open setup for ${row.studentName}`}
              >
                <Iconify icon="mdi:arrow-right" />
              </IconButton>
            </Tooltip>
          );
        },
      },
    ],
    [at]
  );
  return (
    <AdminDashboardPanel
      title="Students needing attention"
      description="Resolve the blocker with the right owner"
      action={<DashboardWorkspaceLink href={href}>View all</DashboardWorkspaceLink>}
    >
      {/* Bounded four-row preview inside a dashboard; it is not a full-height directory workspace. */}
      <Box data-testid="dashboard-attention-preview" sx={{ minWidth: 0 }}>
        <CustomizableTable
          tableId="student-dashboard-attention-preview"
          tableTitle="Students needing attention"
          columns={columns}
          data={rows.map((row) => ({
            ...row,
            id: row.caseId,
            placement: `${row.className || 'Unassigned class'} / ${row.divisionName || 'Unassigned'}`,
            blocker: row.blocker || 'Review setup',
            ownerName: row.ownerName || 'Not assigned',
          }))}
          isLoading={!data && !query.isError}
          showToolbar={false}
          isSearch={false}
          isFilter={false}
          isPagination={false}
          defaultRowsPerPage={4}
          isShowedDense={false}
          showCheckbox={false}
          errorContent={
            query.isError ? (
              <Stack alignItems="center" spacing={1}>
                <Typography>Student setup could not be loaded.</Typography>
                <DashboardRetry query={query} />
              </Stack>
            ) : undefined
          }
          noDataText={
            <Stack spacing={0.5} alignItems="center">
              <Typography variant="body2" fontWeight={600} color="text.primary">
                No setup cases need attention
              </Typography>
              <Typography variant="caption" color="text.secondary">
                No setup blockers in the selected scope.
              </Typography>
            </Stack>
          }
          wrapperProps={{ sx: { boxShadow: 'none', border: 0 } }}
          tableContainerProps={{ sx: { overflowX: 'auto' } }}
        />
        {data && rows.length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Showing {fNumber(rows.length)} of {fNumber(data.attentionTotalCount ?? 0)} setup cases
            needing attention
          </Typography>
        )}
      </Box>
    </AdminDashboardPanel>
  );
}

function DashboardRetry({ query }: { query: StudentSectionQuery }) {
  return (
    <IconButton aria-label="Retry student setup" onClick={query.refetch}>
      <Iconify icon="mdi:refresh" />
    </IconButton>
  );
}
