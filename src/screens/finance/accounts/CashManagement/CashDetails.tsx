'use client';

import type { RootState } from 'src/redux/store';
import type { CashDetail, CashDeposit } from 'src/redux/finance/cashManagementApi';

import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { fDateTime } from 'src/utils/format-time';
import { Scrollbar } from 'src/components/scrollbar';
import { formatNumber } from 'src/utils/formate_number';
import CustomizableTable from 'src/components/customizabaleTable';
import { useGetCashDetailQuery } from 'src/redux/finance/cashManagementApi';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';
import { Box, Stack, Alert, Drawer, Button, Skeleton, Typography } from '@mui/material';
import FinancePolicyDrawerHeader from 'src/screens/finance/policies/components/FinancePolicyDrawerHeader';

import CashCommandDialog from './CashCommandDialog';
import { cashActionAllowed } from '../cashManagementRules';

export default function CashDetails({
  id,
  academicYearId,
  onClose,
}: {
  id: string;
  academicYearId: string;
  onClose: () => void;
}) {
  const query = useGetCashDetailQuery({ id, academicYearId }, { refetchOnMountOrArgChange: true });
  const data = query.currentData;
  const closeButton = useRef<HTMLButtonElement>(null);
  const [command, setCommand] = useState<'approve' | 'deposit' | 'confirm' | null>(null);
  const [deposit, setDeposit] = useState<CashDeposit | undefined>();
  const auth = useSelector((state: RootState) => state.auth);
  const grants = auth.permissions as { name: string; isGranted: boolean }[];
  const permissions =
    auth.permissionsInitialized && !auth.loading
      ? grants.filter((item) => item.isGranted).map((item) => item.name)
      : [];
  const allowed = (action: 'Approve' | 'Deposit' | 'Reconcile', eligible: boolean) =>
    !query.isFetching && !query.isError && cashActionAllowed(action, permissions, eligible);
  const approvalBlockedReason =
    query.isFetching || !auth.permissionsInitialized || auth.loading
      ? 'Checking approval availability…'
      : !cashActionAllowed('Approve', permissions, true)
        ? 'You do not have cash approval permission. An authorized reviewer must approve this cash.'
        : data?.creatorId === auth.user?.sub && data?.canApprove === false
          ? 'You collected this cash. Another user with cash approval permission must approve it.'
          : !data?.canApprove
            ? 'Cash approval is unavailable. Refresh details to check its current availability.'
            : '';
  return (
    <Drawer
      anchor="right"
      open
      onClose={() => {
        if (!command) onClose();
      }}
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': 'cash-detail-title',
        sx: {
          width: { xs: '100%', sm: 'min(760px,92vw)' },
          maxWidth: '100%',
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <FinancePolicyDrawerHeader
        title={data?.reference ?? 'Cash Details'}
        titleId="cash-detail-title"
        helpText="Pending cash can pay expenses. Approval finalizes the remaining bank deposit as Income while keeping the original collection and expenses visible."
        onClose={onClose}
        disabled={Boolean(command)}
        badges={
          data && (
            <Label color={data.status === 1 ? 'success' : 'warning'}>
              {data.status === 1 ? 'Approved' : 'Pending approval'}
            </Label>
          )
        }
      />
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        <Stack spacing={1.5} sx={{ p: 2 }}>
          {query.isFetching && !data && (
            <Stack role="status" aria-label="Loading cash details">
              <Skeleton height={120} />
              <Skeleton height={160} />
            </Stack>
          )}
          {query.isError && (
            <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
              Cash details could not be loaded.
            </Alert>
          )}
          {data && !query.isError && (
            <>
              <DetailSection
                title="Collection Details"
                icon="mdi:receipt-text-outline"
                helpText="Original collection evidence and the receiving bank selected at final approval."
              >
                <DetailGrid>
                  <DetailField label="Payer" value={data.payerName} />
                  <DetailField label="Collected at" value={fDateTime(data.collectedAt)} />
                  <DetailField
                    label="Receiving school bank account"
                    value={data.bankLabel ?? 'Awaiting approval'}
                  />
                  <DetailField
                    label="Approved at"
                    value={data.approvedAt ? fDateTime(data.approvedAt) : 'Awaiting approval'}
                  />
                  {data.notes && <DetailField label="Notes" value={data.notes} />}
                </DetailGrid>
              </DetailSection>
              <DetailSection
                title="Cash Balance"
                icon="mdi:cash-multiple"
                helpText="Collected cash equals paid expenses, confirmed deposits, legacy cash in transit, and cash remaining. Pending cash may fund expenses before final deposit approval."
              >
                <DetailGrid>
                  {(
                    [
                      ['amount', 'Collected'],
                      ['spentAmount', 'Expenses paid'],
                      ['depositedAmount', 'Deposited (confirmed bank credit)'],
                      ['inTransitAmount', 'In transit'],
                      ['remainingAmount', 'Remaining cash'],
                    ] as const
                  ).map(([key, label]) => (
                    <DetailField key={key} label={label} value={formatNumber(data[key], 'INR')} />
                  ))}
                </DetailGrid>
              </DetailSection>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {data.status === 0 && (
                  <Button
                    size="small"
                    variant="contained"
                    disabled={!allowed('Approve', data.canApprove)}
                    aria-describedby="cash-approval-help"
                    onClick={() => setCommand('approve')}
                  >
                    Approve Cash
                  </Button>
                )}
                {allowed('Deposit', data.canDeposit) && (
                  <Button size="small" variant="contained" onClick={() => setCommand('deposit')}>
                    Record Bank Deposit
                  </Button>
                )}
              </Stack>
              {data.status === 0 && (
                <Alert id="cash-approval-help" severity="info">
                  {approvalBlockedReason ||
                    'Select Approve Cash to choose the receiving school bank account and confirm the remaining counted cash. Approval confirms only this final deposit as Income.'}
                </Alert>
              )}
              <DetailSection
                title="Bank Deposits"
                icon="mdi:bank-transfer"
                helpText="Final approval records the remaining deposit directly. Legacy dispatched deposits retain independent confirmation of actual bank credit."
              >
                <Stack spacing={1.5}>
                  {data.deposits.length === 0 ? (
                    <Typography variant="body2">No bank deposits recorded.</Typography>
                  ) : (
                    data.deposits.map((item) => (
                      <Box
                        key={item.id}
                        sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}
                      >
                        <Stack spacing={0.75}>
                          <Typography variant="subtitle2">{item.reference}</Typography>
                          <Typography variant="body2">
                            Dispatched {formatNumber(item.amount, 'INR')} · Credited{' '}
                            {formatNumber(item.creditedAmount, 'INR')} · In transit{' '}
                            {formatNumber(item.amount - item.creditedAmount, 'INR')}
                          </Typography>
                          <Typography variant="body2">
                            Deposit date: {fDateTime(item.depositDate)}
                          </Typography>
                          {item.creditDate && (
                            <Typography variant="body2">
                              Last credit: {fDateTime(item.creditDate)}
                            </Typography>
                          )}
                          <Label color={item.status === 1 ? 'success' : 'warning'}>
                            {item.status === 1 ? 'Credit confirmed' : 'In transit'}
                          </Label>
                          {allowed('Reconcile', item.canConfirm) && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setDeposit(item);
                                setCommand('confirm');
                              }}
                            >
                              Confirm Bank Credit
                            </Button>
                          )}
                        </Stack>
                      </Box>
                    ))
                  )}
                </Stack>
              </DetailSection>
              <DetailSection
                title="Actual Cash Expenses"
                icon="mdi:cash-minus"
                helpText="Paid expenses funded by this collection. These amounts already reduce remaining cash."
              >
                <CustomizableTable
                  variant="embedded"
                  tableId="cash-source-expenses"
                  columns={[
                    { id: 'name', label: 'Purpose' },
                    {
                      id: 'amount',
                      label: 'Paid',
                      render: (value: number) => formatNumber(value, 'INR'),
                    },
                    {
                      id: 'paymentDate',
                      label: 'Payment date',
                      render: (value: string) => fDateTime(value),
                    },
                  ]}
                  data={data.expenses}
                  showExport={false}
                  showToolbar={false}
                  isPagination={false}
                  noDataText="No cash expenses recorded."
                />
              </DetailSection>
            </>
          )}
        </Stack>
      </Scrollbar>
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          ref={closeButton}
          variant="outlined"
          size="small"
          disabled={Boolean(command)}
          onClick={onClose}
        >
          Close
        </Button>
        <Button
          size="small"
          disabled={Boolean(command) || query.isFetching}
          onClick={() => query.refetch()}
        >
          Refresh details
        </Button>
      </Box>
      {command && data && (
        <CashCommandDialog
          key={`${command}:${deposit?.id ?? ''}`}
          action={command}
          data={data as CashDetail}
          deposit={deposit}
          academicYearId={academicYearId}
          onClose={() => setCommand(null)}
          onRefresh={() => query.refetch().unwrap()}
          onSaved={async () => {
            setCommand(null);
            await query.refetch();
            requestAnimationFrame(() => closeButton.current?.focus());
          }}
        />
      )}
    </Drawer>
  );
}
