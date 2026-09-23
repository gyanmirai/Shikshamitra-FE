'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { LateFeeWaiverApplication } from 'src/redux/feeCollection/lateFeeWaiver';

import { LoadingButton } from '@mui/lab';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { fDate, fDateTime } from 'src/utils/format-time';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { financePaths, financePermissions } from 'src/constants/finance-menu';
import {
  Box,
  Tab,
  Tabs,
  Button,
  Dialog,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  useGetLateFeeWaiversQuery,
  useRejectLateFeeWaiverMutation,
  useApproveLateFeeWaiverMutation,
} from 'src/redux/feeCollection/lateFeeWaiver';

type WaiverStatusFilter = '' | 'PendingApproval' | 'Applied' | 'Rejected';
type Decision = { type: 'approve' | 'reject'; waiver: LateFeeWaiverApplication } | null;

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const statusColor = {
  PendingApproval: 'warning',
  Applied: 'success',
  Rejected: 'error',
} as const;

export default function WaiverManagement() {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const academicYearId = useSelector((state: RootState) => state.globalState.currentYear?.id);
  const canApprove = hasGrantedPermission(
    permissions,
    financePermissions.fees.waiverActions.approve
  );
  const canReject = hasGrantedPermission(permissions, financePermissions.fees.waiverActions.reject);
  const [status, setStatus] = useState<WaiverStatusFilter>('PendingApproval');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [decision, setDecision] = useState<Decision>(null);
  const [rejectReason, setRejectReason] = useState('');
  const { data, isLoading, isFetching } = useGetLateFeeWaiversQuery(
    {
      academicYearId,
      status,
      search: search || undefined,
      skipCount: page * rowsPerPage,
      maxResultCount: rowsPerPage,
    },
    { skip: !academicYearId }
  );
  const [approveWaiver, { isLoading: isApproving }] = useApproveLateFeeWaiverMutation();
  const [rejectWaiver, { isLoading: isRejecting }] = useRejectLateFeeWaiverMutation();

  const closeDecision = () => {
    setDecision(null);
    setRejectReason('');
  };

  const submitDecision = async () => {
    if (!decision) return;
    if (decision.type === 'reject' && !rejectReason.trim()) {
      shikshaMitraToast.error({ message: 'Enter a reason for rejecting the waiver.' });
      return;
    }
    try {
      if (decision.type === 'approve') await approveWaiver(decision.waiver.id).unwrap();
      else await rejectWaiver({ id: decision.waiver.id, reason: rejectReason.trim() }).unwrap();
      shikshaMitraToast.success({
        message: `Waiver ${decision.type === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });
      closeDecision();
    } catch (error) {
      const problem = parseApiProblemDetail(error);
      shikshaMitraToast.error({
        message: problem.detail || `Unable to ${decision.type} the waiver.`,
      });
    }
  };

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'studentName',
        label: 'Student',
        minWidth: 190,
        sticky: true,
        render: (_value, row) => (
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.studentName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              GR No. {row.grNumber || '—'}
              {row.rollNo ? ` · Roll ${row.rollNo}` : ''}
            </Typography>
          </Box>
        ),
      },
      { id: 'feeHeadName', label: 'Fee head', minWidth: 150 },
      {
        id: 'dueDate',
        label: 'Due date',
        minWidth: 120,
        render: (value) => fDate(value) || '—',
      },
      {
        id: 'computedLateFeeAmount',
        label: 'Late fee',
        align: 'right',
        minWidth: 110,
        render: (value) => currency.format(Number(value || 0)),
      },
      {
        id: 'requestedAmount',
        label: 'Requested',
        align: 'right',
        minWidth: 110,
        render: (value) => currency.format(Number(value || 0)),
      },
      {
        id: 'effectiveAmount',
        label: 'Waiver amount',
        align: 'right',
        minWidth: 125,
        render: (value) => currency.format(Number(value || 0)),
      },
      { id: 'reason', label: 'Request reason', minWidth: 220 },
      {
        id: 'decisionReason',
        label: 'Decision reason',
        minWidth: 200,
        render: (value) => value || '—',
      },
      {
        id: 'creationTime',
        label: 'Requested on',
        minWidth: 165,
        render: (value) => fDateTime(value) || '—',
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: 130,
        render: (value) => (
          <Label color={statusColor[value as keyof typeof statusColor] || 'default'}>
            {value === 'PendingApproval' ? 'Pending approval' : value}
          </Label>
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        sticky: true,
        stickyPosition: 'right',
        minWidth: 90,
        isSort: false,
        isFilter: false,
        excludeFromExport: true,
        render: (_value, row) => {
          if (row.status !== 'PendingApproval') return '—';
          const waiver = row as LateFeeWaiverApplication;
          return (
            <ThreeDotsActions
              showThreeDots={false}
              directActions={[
                ...(canApprove
                  ? [
                      {
                        id: 'approve',
                        label: 'Approve waiver',
                        icon: 'solar:check-circle-bold',
                        onClick: () => setDecision({ type: 'approve', waiver }),
                      },
                    ]
                  : []),
                ...(canReject
                  ? [
                      {
                        id: 'reject',
                        label: 'Reject waiver',
                        icon: 'solar:close-circle-bold',
                        onClick: () => setDecision({ type: 'reject', waiver }),
                      },
                    ]
                  : []),
              ]}
            />
          );
        },
      },
    ],
    [canApprove, canReject]
  );

  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Waiver Management"
        description="Review late-fee waiver requests submitted from Fee Collection."
        links={[
          { name: 'Finance', href: financePaths.dashboard },
          { name: 'Fees', href: financePaths.fees.collections },
          { name: 'Waivers' },
        ]}
      />

      <Tabs
        value={status}
        onChange={(_event, value: WaiverStatusFilter) => {
          setStatus(value);
          setPage(0);
        }}
        sx={{ mb: 1 }}
      >
        <Tab value="PendingApproval" label="Pending" />
        <Tab value="Applied" label="Applied" />
        <Tab value="Rejected" label="Rejected" />
        <Tab value="" label="All" />
      </Tabs>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CustomizableTable
          tableId="late-fee-waiver-management-table"
          tableTitle="Waiver requests"
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading || isFetching}
          noDataText="No waiver requests found"
          serverSide
          serverSidePagination
          serverSideSearch
          totalCount={data?.totalCount ?? 0}
          page={page}
          rowsPerPage={rowsPerPage}
          onServerPagination={(nextPage, nextRowsPerPage) => {
            setPage(nextPage);
            setRowsPerPage(nextRowsPerPage);
          }}
          onServerSearch={(value) => {
            setSearch(value.trim());
            setPage(0);
          }}
          searchFieldProps={{ placeholder: 'Search student name or GR number…' }}
          wrapperProps={{ sx: { height: 1, minHeight: 0 } }}
          tableContainerProps={{ sx: { height: 1 } }}
        />
      </Box>

      <Dialog open={Boolean(decision)} onClose={closeDecision} fullWidth maxWidth="xs">
        <DialogTitle>
          {decision?.type === 'approve' ? 'Approve waiver' : 'Reject waiver'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {decision?.waiver.studentName} ·{' '}
            {currency.format(decision?.waiver.effectiveAmount || 0)}
          </Typography>
          {decision?.type === 'reject' && (
            <TextField
              autoFocus
              fullWidth
              multiline
              minRows={3}
              label="Rejection reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              required
            />
          )}
          {decision?.type === 'approve' && (
            <Typography variant="body2">
              Approving applies this waiver and immediately reduces the collectible late fee.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={closeDecision}>
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color={decision?.type === 'reject' ? 'error' : 'primary'}
            loading={isApproving || isRejecting}
            onClick={submitDecision}
          >
            {decision?.type === 'approve' ? 'Approve' : 'Reject'}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
