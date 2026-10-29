'use client';

import type { RootState } from 'src/redux/store';
import type { CashDeposit } from 'src/redux/finance/cashManagementApi';

import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { Scrollbar } from 'src/components/scrollbar';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import CustomizableTable from 'src/components/customizabaleTable';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';
import { Box, Stack, Alert, Drawer, Button, Skeleton, Typography } from '@mui/material';
import FinancePolicyDrawerHeader from 'src/screens/finance/policies/components/FinancePolicyDrawerHeader';
import {
  useGetCashDetailQuery,
  useDownloadCashSupportingDocumentMutation,
} from 'src/redux/finance/cashManagementApi';

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
  const [downloadDocument, { isLoading: downloading }] =
    useDownloadCashSupportingDocumentMutation();
  const download = async () => {
    if (!data?.supportingDocumentName || downloading) return;
    try {
      const blob = await downloadDocument({ id, academicYearId }).unwrap();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.supportingDocumentName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      shikshaMitraToast.error({ message: parseApiProblemDetail(error).detail });
    }
  };
  const closeButton = useRef<HTMLButtonElement>(null);
  const [deposit, setDeposit] = useState<CashDeposit | null>(null);
  const auth = useSelector((state: RootState) => state.auth);
  const grants = auth.permissions as { name: string; isGranted: boolean }[];
  const permissions =
    auth.permissionsInitialized && !auth.loading
      ? grants.filter((item) => item.isGranted).map((item) => item.name)
      : [];
  const canConfirm = (item: CashDeposit) =>
    !query.isFetching &&
    !query.isError &&
    item.amount > item.creditedAmount &&
    cashActionAllowed('Reconcile', permissions, item.canConfirm);
  const latestDepositDate = data?.deposits.reduce<string | null>(
    (latest, item) =>
      !latest || new Date(item.depositDate) > new Date(latest) ? item.depositDate : latest,
    null
  );
  return (
    <Drawer
      anchor="right"
      open
      onClose={() => {
        if (!deposit) onClose();
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
        helpText="Collection, cash expenses, and recorded bank deposits for this cash source. Deposit Cash on the cash register uses available cash for the selected academic year."
        onClose={onClose}
        disabled={Boolean(deposit)}
      />
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        <Stack spacing={2} sx={{ p: { xs: 2, sm: 3 } }}>
          {query.isFetching && !data && (
            <Stack role="status" aria-label="Loading cash details">
              <Skeleton height={120} />
              <Skeleton height={160} />
            </Stack>
          )}
          {query.isError && (
            <Alert
              severity="error"
              action={
                <Button
                  size="small"
                  startIcon={<Iconify icon={GlobalIcons.refresh} width={18} />}
                  onClick={() => query.refetch()}
                >
                  Retry
                </Button>
              }
            >
              Cash details could not be loaded.
            </Alert>
          )}
          {data && !query.isError && (
            <>
              <DetailSection
                title="Collection Details"
                icon={GlobalIcons.paymentSummary}
                helpText="Original collection evidence, receiving school bank account, and latest recorded deposit date."
              >
                <DetailGrid>
                  <DetailField label="Payer" value={data.payerName} />
                  <DetailField label="Collected at" value={fDateTime(data.collectedAt)} />
                  <DetailField
                    label="Receiving school bank account"
                    value={data.bankLabel ?? 'Not deposited'}
                  />
                  <DetailField
                    label="Latest deposit date"
                    value={latestDepositDate ? fDateTime(latestDepositDate) : 'Not deposited'}
                  />
                  {data.notes && <DetailField label="Notes" value={data.notes} />}
                </DetailGrid>
              </DetailSection>
              {data.supportingDocumentName && (
                <DetailSection
                  title="Attachments"
                  icon={GlobalIcons.documentIcon}
                  helpText="Supporting document saved with the academic-year cash deposit."
                >
                  <Stack spacing={1} alignItems="flex-start">
                    <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                      {data.supportingDocumentName}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      disabled={downloading || query.isFetching}
                      startIcon={<Iconify icon={GlobalIcons.download} />}
                      onClick={download}
                    >
                      Download supporting document
                    </Button>
                  </Stack>
                </DetailSection>
              )}
              <DetailSection
                title="Cash Balance"
                icon={GlobalIcons.paymentSummary}
                helpText="Original collected cash equals paid expenses, confirmed deposits, any legacy cash in transit, and cash remaining."
              >
                <DetailGrid>
                  {(
                    [
                      ['amount', 'Original collected cash'],
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
              <DetailSection
                title="Bank Deposits"
                icon={GlobalIcons.bankAccount}
                helpText="Recorded deposit evidence. Legacy deposits still in transit retain independent confirmation of actual bank credit by an authorized reconciler."
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
                          {item.bankLabel && (
                            <Typography variant="body2">
                              Receiving bank: {item.bankLabel}
                            </Typography>
                          )}
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
                          {canConfirm(item) && (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Iconify icon={GlobalIcons.tick} width={18} />}
                              onClick={() => setDeposit(item)}
                            >
                              Confirm bank credit
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
                icon={GlobalIcons.paymentSummary}
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
      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        useFlexGap
        flexWrap="wrap"
        sx={{ px: { xs: 2, sm: 3 }, py: 1.75, borderTop: 1, borderColor: 'divider' }}
      >
        <Button
          size="small"
          variant="outlined"
          disabled={Boolean(deposit) || query.isFetching}
          startIcon={<Iconify icon={GlobalIcons.refresh} width={18} />}
          onClick={() => query.refetch()}
        >
          Refresh details
        </Button>
        <Button
          ref={closeButton}
          variant="outlined"
          size="small"
          disabled={Boolean(deposit)}
          startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
          onClick={onClose}
        >
          Close
        </Button>
      </Stack>
      {deposit && data && (
        <CashCommandDialog
          key={deposit.id}
          action="confirm"
          data={data}
          deposit={deposit}
          academicYearId={academicYearId}
          onClose={() => setDeposit(null)}
          onRefresh={() => query.refetch().unwrap()}
          onSaved={async () => {
            setDeposit(null);
            await query.refetch();
            requestAnimationFrame(() => closeButton.current?.focus());
          }}
        />
      )}
    </Drawer>
  );
}
