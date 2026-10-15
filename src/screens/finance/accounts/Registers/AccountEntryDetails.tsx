import type { AccountsActivityRow } from 'src/redux/finance/accountsActivityApi';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { fDate, fDateTime } from 'src/utils/format-time';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { PaymentMethod, PaymentMethodLabels } from 'src/enums/finance-payment-method';
import { useGetAccountsActivityDetailQuery } from 'src/redux/finance/accountsActivityApi';
import {
  Box,
  Grid,
  Stack,
  Alert,
  Button,
  Skeleton,
  Typography,
  DialogActions,
} from '@mui/material';

function methodLabel(method?: string) {
  if (!method) return undefined;
  const names = ['Cash', 'Cheque', 'DemandDraft', 'BankTransfer', 'CreditCard', 'DebitCard', 'Upi'];
  const index = names.findIndex((name) => name.toLowerCase() === method.toLowerCase());
  return index >= 0 ? PaymentMethodLabels[index as PaymentMethod] : method;
}
function Fact({ label, value }: { label: string; value?: string | null }) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap', fontWeight: 500, mt: 0.5 }}
      >
        {value || '—'}
      </Typography>
    </Grid>
  );
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
      titleInfo="Review this entry and its available source, payment and allocation details."
      handleClose={onClose}
      maxWidth="md"
      hasForm={false}
      guardUnsavedChanges={false}
      paperProps={{ sx: { backgroundImage: 'none' } }}
    >
      <DialogScrollContent sx={{ bgcolor: 'background.neutral' }}>
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
            {data.sourceStatus === 'Awaiting payout' && (
              <Alert severity="warning">
                Approved refund awaiting payout confirmation. This amount is excluded from paid
                expenses.
              </Alert>
            )}
            <FormSectionCard icon="mdi:receipt-text-outline" title="Transaction details">
              <Grid container spacing={1.5}>
                <Fact
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
                <Fact label="Amount for this entry" value={formatNumber(data.amount, 'INR')} />
                <Fact
                  label={data.sourceStatus === 'Awaiting payout' ? 'Request date' : 'Payment date'}
                  value={fDateTime(data.occurredAt)}
                />
                <Fact label="Category" value={data.categoryName} />
                <Fact label="Academic year" value={data.academicYearName} />
                <Fact label="School bank account" value={data.bankLabel} />
                {data.counterparty && (
                  <Fact
                    label={data.source === 'Income' ? 'Received from' : 'Paid to'}
                    value={data.counterparty}
                  />
                )}
                {data.notes && <Fact label="Notes" value={data.notes} />}
              </Grid>
            </FormSectionCard>
            {data.studentId && (
              <FormSectionCard icon="mdi:account-school-outline" title="Student details">
                <Grid container spacing={1.5}>
                  <Fact label="Student" value={data.studentName} />
                  <Fact label="GR / admission number" value={data.grNumber} />
                  <Fact label="Class" value={data.className} />
                  <Fact label="Division" value={data.divisionName} />
                </Grid>
              </FormSectionCard>
            )}
            {data.source === 'Refund' && (
              <FormSectionCard icon="mdi:cash-refund" title="Refund details">
                <Grid container spacing={1.5}>
                  <Fact label="Original receipt" value={data.originalReceiptNumber} />
                  <Fact label="Refund status" value={data.refundStatus} />
                  <Fact label="Reason" value={data.refundReason} />
                  <Fact label="Approval notes" value={data.approvalNotes} />
                  <Fact
                    label="Approved payout method"
                    value={methodLabel(data.approvedPaymentMethod)}
                  />
                  {data.processedAt && (
                    <Fact label="Confirmed at" value={fDateTime(data.processedAt)} />
                  )}
                  {data.failureReason && (
                    <Fact label="Failure / return reason" value={data.failureReason} />
                  )}
                </Grid>
              </FormSectionCard>
            )}
            {data.categoryAmounts.length > 0 && (
              <FormSectionCard icon="mdi:shape-outline" title="Related category entries">
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
                    { id: 'category', label: 'Category', isFilter: false, isSort: false },
                    {
                      id: 'bankLabel',
                      label: 'School bank account',
                      isFilter: false,
                      isSort: false,
                    },
                    {
                      id: 'amount',
                      label: 'Amount',
                      align: 'right',
                      isFilter: false,
                      isSort: false,
                      render: (value: number) => formatNumber(value, 'INR'),
                    },
                  ]}
                  data={data.categoryAmounts}
                />
              </FormSectionCard>
            )}
            {data.allocations.length > 0 && (
              <FormSectionCard
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
                    { id: 'name', label: 'Fee head / charge', isFilter: false, isSort: false },
                    { id: 'period', label: 'Installment / period', isFilter: false, isSort: false },
                    {
                      id: 'coverage',
                      label: 'Coverage',
                      isFilter: false,
                      isSort: false,
                      render: (_, line) =>
                        line.coverageStartDate && line.coverageEndDate
                          ? `${fDate(line.coverageStartDate)} – ${fDate(line.coverageEndDate)}`
                          : '—',
                    },
                    {
                      id: 'amount',
                      label: 'Amount',
                      align: 'right',
                      isFilter: false,
                      isSort: false,
                      render: (value: number) => formatNumber(value, 'INR'),
                    },
                  ]}
                  data={data.allocations}
                />
              </FormSectionCard>
            )}
            {data.payments.length > 0 && (
              <FormSectionCard icon="mdi:bank-transfer" title="Payment details">
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
                      isFilter: false,
                      isSort: false,
                      render: (value: string) => methodLabel(value),
                    },
                    {
                      id: 'bankLabel',
                      label: 'School bank account',
                      isFilter: false,
                      isSort: false,
                    },
                    { id: 'reference', label: 'Payment reference', isFilter: false, isSort: false },
                    {
                      id: 'date',
                      label: 'Date',
                      isFilter: false,
                      isSort: false,
                      render: (value: string) => fDateTime(value),
                    },
                    {
                      id: 'amount',
                      label: 'Amount',
                      align: 'right',
                      isFilter: false,
                      isSort: false,
                      render: (value: number) => formatNumber(value, 'INR'),
                    },
                    { id: 'status', label: 'Status', isFilter: false, isSort: false },
                    {
                      id: 'evidenceReference',
                      label: 'Evidence reference',
                      isFilter: false,
                      isSort: false,
                    },
                  ]}
                  data={data.payments}
                />
              </FormSectionCard>
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
