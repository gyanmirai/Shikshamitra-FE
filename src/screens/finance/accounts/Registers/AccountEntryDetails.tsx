import type { AccountsActivityRow } from 'src/redux/finance/accountsActivityApi';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { fDate, fDateTime } from 'src/utils/format-time';
import CustomizableTable from 'src/components/customizabaleTable';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Alert, Button, Skeleton, DialogActions } from '@mui/material';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';
import { PaymentMethod, PaymentMethodLabels } from 'src/enums/finance-payment-method';
import { useGetAccountsActivityDetailQuery } from 'src/redux/finance/accountsActivityApi';

function methodLabel(method?: string) {
  if (!method) return undefined;
  const names = ['Cash', 'Cheque', 'DemandDraft', 'BankTransfer', 'CreditCard', 'DebitCard', 'Upi'];
  const index = names.findIndex((name) => name.toLowerCase() === method.toLowerCase());
  return index >= 0 ? PaymentMethodLabels[index as PaymentMethod] : method;
}
export default function AccountEntryDetails({
  row,
  academicYearId,
  onClose,
}: {
  row: AccountsActivityRow;
  academicYearId: string;
  onClose: () => void;
}) {
  const query = useGetAccountsActivityDetailQuery(
    { academicYearId, source: row.source, id: row.id },
    { refetchOnMountOrArgChange: true }
  );
  const data = query.currentData;
  return (
    <CustomDialog
      titleInfo="Review this entry and its available source, payment and allocation details."
      open
      title={
        <Stack
          component="span"
          direction="row"
          alignItems="center"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
        >
          <Box component="span" sx={{ overflowWrap: 'anywhere' }}>
            {row.reference}
          </Box>
          <Label
            color={
              (data?.sourceStatus ?? row.sourceStatus) === 'Awaiting payout' ? 'warning' : 'default'
            }
          >
            {data?.sourceStatus ?? row.sourceStatus}
          </Label>
        </Stack>
      }

      handleClose={onClose}
      maxWidth="md"
      hasForm={false}
      guardUnsavedChanges={false}
      paperProps={{ sx: { backgroundImage: 'none' } }}
    >
      <DialogScrollContent>
        {query.isFetching && !data && (
          <Stack spacing={1} role="status" aria-label="Loading transaction details">
            {[1, 2, 3, 4].map((value) => (
              <Skeleton key={value} height={56} />
            ))}
          </Stack>
        )}
        {query.isError && (
          <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
            Transaction details could not be loaded.
          </Alert>
        )}
        {data && !query.isError && (
          <Stack spacing={1.5}>
            <DetailSection icon="mdi:receipt-text-outline" title="Transaction details">
              <DetailGrid>
                <DetailField
                  label="Source"
                  value={
                    {
                      Collection: 'Student payment',
                      Income: 'Other income',
                      Expense: 'School expense',
                      Refund: 'Student refund',
                    }[data.source]
                  }
                />
                <DetailField
                  label="Amount for this entry"
                  value={formatNumber(data.amount, 'INR')}
                />
                <DetailField
                  label={data.sourceStatus === 'Awaiting payout' ? 'Request date' : 'Payment date'}
                  value={fDateTime(data.occurredAt)}
                />
                <DetailField label="Category" value={data.categoryName} />
                <DetailField label="Academic year" value={data.academicYearName} />
                <DetailField label="School bank account" value={data.bankLabel} />
                {data.counterparty && (
                  <DetailField
                    label={data.source === 'Income' ? 'Received from' : 'Paid to'}
                    value={data.counterparty}
                  />
                )}
                {data.notes && <DetailField fullWidth label="Notes" value={data.notes} />}
              </DetailGrid>
            </DetailSection>
            {data.studentId && (
              <DetailSection icon="mdi:account-school-outline" title="Student details">
                <DetailGrid>
                  <DetailField label="Student" value={data.studentName} />
                  <DetailField label="GR / admission number" value={data.grNumber} />
                  <DetailField
                    label="Class / division"
                    value={[data.className, data.divisionName].filter(Boolean).join(' / ')}
                  />
                </DetailGrid>
              </DetailSection>
            )}
            {data.source === 'Refund' && (
              <DetailSection icon="mdi:cash-refund" title="Refund details">
                <DetailGrid>
                  <DetailField label="Original receipt" value={data.originalReceiptNumber} />
                  <DetailField label="Refund status" value={data.refundStatus} />
                  <DetailField fullWidth label="Reason" value={data.refundReason} />
                  <DetailField fullWidth label="Approval notes" value={data.approvalNotes} />
                  <DetailField
                    label="Approved payout method"
                    value={methodLabel(data.approvedPaymentMethod)}
                  />
                  {data.processedAt && (
                    <DetailField label="Confirmed at" value={fDateTime(data.processedAt)} />
                  )}
                  {data.failureReason && (
                    <DetailField
                      fullWidth
                      label="Failure / return reason"
                      value={data.failureReason}
                    />
                  )}
                </DetailGrid>
              </DetailSection>
            )}
            {data.categoryAmounts.length > 0 && (
              <DetailSection icon="mdi:shape-outline" title="Related category entries">
                <CustomizableTable
                  wrapperProps={{ sx: { height: 'auto', flex: 'unset' } }}
                  tableContainerProps={{ sx: { height: 'auto' } }}
                  tableId="accounts-detail-categories"
                  tableTitle="Related category entries"
                  isSearch={false}
                  isFilter={false}
                  isPagination={false}
                  showToolbar={false}
                  isShowedDense={false}
                  columns={[
                    {
                      id: 'category',
                      label: 'Category',
                      filterType: 'string' as const,
                      isFilter: true,
                      isSort: false,
                    },
                    {
                      id: 'bankLabel',
                      label: 'School bank account',
                      filterType: 'string' as const,
                      isFilter: true,
                      isSort: false,
                    },
                    {
                      cellSx: { textAlign: 'right' as const },
                      id: 'amount',
                      label: 'Amount',
                      filterType: 'number' as const,
                      align: 'left',
                      isFilter: true,
                      isSort: false,
                      render: (value: number) => formatNumber(value, 'INR'),
                    },
                  ]}
                  data={data.categoryAmounts}
                />
              </DetailSection>
            )}
            {data.allocations.length > 0 && (
              <DetailSection
                icon="mdi:format-list-bulleted"
                title={
                  data.source === 'Refund'
                    ? 'Approved refund breakdown'
                    : 'Fee and charge breakdown'
                }
              >
                <CustomizableTable
                  wrapperProps={{ sx: { height: 'auto', flex: 'unset' } }}
                  tableContainerProps={{ sx: { height: 'auto' } }}
                  tableId="accounts-detail-allocations"
                  tableTitle={
                    data.source === 'Refund'
                      ? 'Approved refund breakdown'
                      : 'Fee and charge breakdown'
                  }
                  isSearch={false}
                  isFilter={false}
                  isPagination={false}
                  showToolbar={false}
                  isShowedDense={false}
                  columns={[
                    {
                      id: 'name',
                      label: 'Fee head / charge',
                      filterType: 'string' as const,
                      isFilter: true,
                      isSort: false,
                    },
                    {
                      id: 'period',
                      label: 'Installment / period',
                      filterType: 'string' as const,
                      isFilter: true,
                      isSort: false,
                    },
                    {
                      id: 'coverage',
                      label: 'Coverage',
                      filterType: 'string' as const,
                      isFilter: true,
                      isSort: false,
                      render: (_, line) =>
                        line.coverageStartDate && line.coverageEndDate
                          ? `${fDate(line.coverageStartDate)} – ${fDate(line.coverageEndDate)}`
                          : '—',
                    },
                    {
                      cellSx: { textAlign: 'right' as const },
                      id: 'amount',
                      label: 'Amount',
                      filterType: 'number' as const,
                      align: 'left',
                      isFilter: true,
                      isSort: false,
                      render: (value: number) => formatNumber(value, 'INR'),
                    },
                  ]}
                  data={data.allocations}
                />
              </DetailSection>
            )}
            {data.payments.length > 0 && (
              <DetailSection icon="mdi:bank-transfer" title="Payment details">
                <CustomizableTable
                  wrapperProps={{ sx: { height: 'auto', flex: 'unset' } }}
                  tableContainerProps={{ sx: { height: 'auto' } }}
                  tableId="accounts-detail-payments"
                  tableTitle="Payment details"
                  isSearch={false}
                  isFilter={false}
                  isPagination={false}
                  showToolbar={false}
                  isShowedDense={false}
                  columns={[
                    {
                      id: 'method',
                      label: 'Method',
                      filterType: 'string' as const,
                      isFilter: true,
                      isSort: false,
                      render: (value: string) => methodLabel(value),
                    },
                    {
                      id: 'bankLabel',
                      label: 'School bank account',
                      filterType: 'string' as const,
                      isFilter: true,
                      isSort: false,
                    },
                    {
                      id: 'reference',
                      label: 'Payment reference',
                      filterType: 'string' as const,
                      isFilter: true,
                      isSort: false,
                    },
                    {
                      id: 'date',
                      label: 'Date',
                      filterType: 'date' as const,
                      isFilter: true,
                      isSort: false,
                      render: (value: string) => fDateTime(value),
                    },
                    {
                      cellSx: { textAlign: 'right' as const },
                      id: 'amount',
                      label: 'Amount',
                      filterType: 'number' as const,
                      align: 'left',
                      isFilter: true,
                      isSort: false,
                      render: (value: number) => formatNumber(value, 'INR'),
                    },
                    {
                      id: 'status',
                      label: 'Status',
                      filterType: 'string' as const,
                      isFilter: true,
                      isSort: false,
                    },
                    {
                      id: 'evidenceReference',
                      label: 'Evidence reference',
                      filterType: 'string' as const,
                      isFilter: true,
                      isSort: false,
                    },
                  ]}
                  data={data.payments}
                />
              </DetailSection>
            )}
          </Stack>
        )}
      </DialogScrollContent>
      <DialogActions sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
