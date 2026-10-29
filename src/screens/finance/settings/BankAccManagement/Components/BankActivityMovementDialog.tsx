import type { BankActivityRow } from 'src/redux/finance/BankAccountManage/bankAccountActivityApi';

import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { formatNumber } from 'src/utils/formate_number';
import { DetailGrid } from 'src/components/detail-view';
import { financePaths } from 'src/constants/finance-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Stack, Button, Skeleton, Typography, DialogActions } from '@mui/material';
import { useDownloadCashSupportingDocumentMutation } from 'src/redux/finance/cashManagementApi';
import { useGetBankAccountActivityDetailQuery } from 'src/redux/finance/BankAccountManage/bankAccountActivityApi';

import {
  sourceLabels,
  ActivityField,
  ActivitySection,
  activityReturnUrl,
  recognitionLabels,
  confirmationLabels,
  downloadActivityBlob,
} from './bankActivityPresentation';

export default function BankActivityMovementDialog({
  row,
  bankAccountId,
  academicYearId,
  onClose,
}: {
  row: BankActivityRow;
  bankAccountId: string;
  academicYearId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const detail = useGetBankAccountActivityDetailQuery(
    { bankAccountId, academicYearId, movementKey: row.key },
    { skip: !row.canOpenSource, refetchOnMountOrArgChange: true }
  );
  const [download, downloadState] = useDownloadCashSupportingDocumentMutation();
  const data = detail.currentData;
  const canOpenRegister =
    data &&
    (Boolean(data.cashSourceId) ||
      (data.recognitionStatus !== 1 &&
        !(data.source === 'refund' && data.recognitionStatus === 3 && data.paymentMethod === 0)));
  const openRegister = () => {
    if (!data) return;
    const cashId = data.cashSourceId;
    const path = cashId
      ? financePaths.accounts.cashManagement
      : data.source === 'expense' || data.source === 'refund'
        ? financePaths.expenseTracking
        : financePaths.incomeTracking;
    const params = new URLSearchParams({
      academicYearId,
      returnTo: activityReturnUrl(bankAccountId),
      ...(cashId ? { cashId } : { search: data.reference }),
    });
    router.push(`${path}?${params}`);
  };
  return (
    <CustomDialog
      open
      handleClose={onClose}
      title="Movement Details"
      titleInfo="Authorized source evidence for this bank movement. Recorded status is independent of bank confirmation."
      maxWidth="md"
      hasForm={false}
      guardUnsavedChanges={false}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          {!row.canOpenSource ? (
            <Alert severity="info">Source details are not accessible.</Alert>
          ) : detail.isError ? (
            <Alert
              severity="error"
              action={
                <Button size="small" onClick={() => detail.refetch()}>
                  Retry
                </Button>
              }
            >
              Unable to load source details. Your access may have changed.
            </Alert>
          ) : !data ? (
            <Skeleton aria-label="Loading source details" variant="rounded" height={120} />
          ) : (
            <>
              <ActivitySection
                title="Movement Evidence"
                help="Recorded amounts and dates belong to this movement; source allocations explain attribution without adding new movements."
              >
                <DetailGrid>
                  <ActivityField label="Reference" value={data.reference} />
                  <ActivityField label="Source" value={sourceLabels[data.source]} />
                  <ActivityField label="Payer / payee" value={data.counterparty} />
                  <ActivityField label="Activity date" value={fDateTime(data.occurredAt)} />
                  <ActivityField
                    label="Original payment date"
                    value={data.originalPaymentAt ? fDateTime(data.originalPaymentAt) : null}
                  />
                  <ActivityField
                    label="Bank credit date"
                    value={data.bankCreditAt ? fDateTime(data.bankCreditAt) : null}
                  />
                  <ActivityField label="Incoming" value={formatNumber(data.incoming, 'INR')} />
                  <ActivityField label="Outgoing" value={formatNumber(data.outgoing, 'INR')} />
                  <ActivityField label="Pending" value={formatNumber(data.pendingAmount, 'INR')} />
                  <ActivityField
                    label="Recognition"
                    value={recognitionLabels[data.recognitionStatus]}
                  />
                  <ActivityField
                    label="Bank confirmation"
                    value={confirmationLabels[data.bankConfirmationStatus]}
                  />
                  <ActivityField label="Payment reference" value={data.paymentReference} />
                  <ActivityField label="Notes" value={data.notes} />
                </DetailGrid>
                {data.correctsKey && (
                  <Typography variant="body2" color="text.secondary">
                    This is a linked correction of an earlier movement.
                  </Typography>
                )}
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {canOpenRegister ? (
                    <Button
                      size="small"
                      startIcon={<Iconify icon={GlobalIcons.eye} />}
                      onClick={openRegister}
                    >
                      Open source register
                    </Button>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      The authorized source evidence is available here. This movement has no
                      recorded register entry to open.
                    </Typography>
                  )}
                  {data.canDownloadEvidence && data.cashSourceId && (
                    <Button
                      size="small"
                      disabled={downloadState.isLoading}
                      startIcon={<Iconify icon={GlobalIcons.download} />}
                      onClick={async () => {
                        try {
                          const blob = await download({
                            id: data.cashSourceId!,
                            academicYearId,
                          }).unwrap();
                          downloadActivityBlob(
                            blob,
                            data.supportingDocumentName || 'deposit-evidence'
                          );
                        } catch {
                          /* Shared API feedback. */
                        }
                      }}
                    >
                      Download evidence
                    </Button>
                  )}
                </Stack>
              </ActivitySection>
              <ActivitySection
                title="Category Allocations"
                help="Only the authorized category shares of this source are shown."
              >
                <CustomizableTable
                  tableId="bank-movement-allocations"
                  tableTitle="Movement category allocations"
                  variant="embedded"
                  columns={[
                    { id: 'category', label: 'Category' },
                    {
                      id: 'amount',
                      label: 'Amount',
                      render: (value: number) => formatNumber(value, 'INR'),
                    },
                  ]}
                  data={data.allocations}
                  isPagination={false}
                  isSearch={false}
                  showExport={false}
                  showFullScreen={false}
                />
              </ActivitySection>
              <ActivitySection
                title="Bank Credit Events"
                help="Actual recorded bank-credit events. Missing bank confirmation does not establish settlement."
              >
                <CustomizableTable
                  tableId="bank-movement-credits"
                  tableTitle="Movement bank credit events"
                  variant="embedded"
                  columns={[
                    {
                      id: 'date',
                      label: 'Credit date',
                      render: (value: string) => fDateTime(value),
                    },
                    { id: 'reference', label: 'Reference' },
                    {
                      id: 'amount',
                      label: 'Amount',
                      render: (value: number) => formatNumber(value, 'INR'),
                    },
                  ]}
                  data={data.credits}
                  isPagination={false}
                  isSearch={false}
                  showExport={false}
                  showFullScreen={false}
                />
              </ActivitySection>
            </>
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions>
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
