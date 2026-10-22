import type { RootState } from 'src/redux/store';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';

import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';

import { useMemo, useState, useEffect } from 'react';
import { financePermissions } from 'src/constants/finance-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Typography } from '@mui/material';
import { useGetReconciliationListQuery } from 'src/redux/finance/reconciliation';
import { useDownloadReceiptPdfMutation } from 'src/redux/feeCollection/feeCollection';
import {
  PamentMethodsStatusColor,
  PaymentMethodsStatusType,
  PaymentMethodsStatusOptions,
} from 'src/enums/finance-reconcilition-status';

import { ApproveRejectForm } from './DemandDraftTable';
import ReconciliationReceiptDialog from './ReconciliationReceiptDialog';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';

const ChequeDetailsForm = ({
  queryParams,
}: {
  queryParams?: { academicYearId: string; month: number; year: number; paymentMethod: string };
}) => {
  const [isClearCheck, setIsClearCheck] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const isDialog = useBoolean(false);

  const { permissions } = useSelector((state: RootState) => state.auth);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const canApproveReject = permissions.some(
    (perm: any) => perm.name === financePermissions.accounts.reconciliationAdd && perm.isGranted
  );

  const {
    data: listResponse,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetReconciliationListQuery,
    params: queryParams,
  });

  const [downloadReceiptPdf] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDownloadReceiptPdfMutation,
    popupConfig: {
      error: true,
      errorMessage: 'Unable to load receipt',
      success: false,
    },
  });

  const data = useMemo(
    () =>
      (listResponse?.items ?? []).map((item: any) => ({
        ...item,
        standardName: item.class,
        divisionName: item.division,
        chequeNo: item.instrumentDetails?.chequeNumber,
        bankName: item.instrumentDetails?.bankName,
        receivedChequeDate: item.instrumentDetails?.chequeDate,
      })),
    [listResponse?.items]
  );

  useEffect(() => {
    if (!isLoading && listResponse && (listResponse.items ?? []).length === 0) {
      const monthYear = queryParams
        ? dayjs(`${queryParams.year}-${String(queryParams.month).padStart(2, '0')}-01`).format(
            'MMM-YYYY'
          )
        : '';
      const academicYear = (currentYear as any)?.name ?? '';
      shikshaMitraToast.warning({
        message: `No Cheque records found for ${monthYear}${academicYear ? ` (${academicYear})` : ''}. Please change the month or academic year.`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, listResponse]);

  const columns: IColumn[] = useMemo(
    () => [
      {
        stickyPosition: 'left',
        id: 'studentName',
        label: 'Name(Gr No.)',
        width: 180,
        minWidth: 150,
        maxWidth: 220,
        align: 'left',
        isFilter: true,
        filterType: 'string',
        sticky: true,
        render: (value, row) => (
          <Typography variant="caption" fontSize="13px">
            {value || '-'} {row.grNumber && `(${row.grNumber})`}
          </Typography>
        ),
      },
      {
        id: 'board',
        label: 'Board/Medium',
        width: 120,
        minWidth: 100,
        maxWidth: 180,
        align: 'left',
        isFilter: true,
        filterType: 'string',
        render: (value, row) => (
          <Typography variant="caption" fontSize="13px">
            {value || '-'} {row.medium && `- (${row.medium})`}
          </Typography>
        ),
      },
      {
        id: 'standardName',
        label: 'Class/Div',
        align: 'left',
        width: 150,
        minWidth: 130,
        maxWidth: 180,
        render: (value, row) => (
          <Typography variant="caption" fontSize="13px">
            {value || '-'} {row.divisionName && `- (${row.divisionName})`}
          </Typography>
        ),
      },
      {
        id: 'chequeNo',
        label: 'Cheque No.',
        width: 140,
        minWidth: 120,
        maxWidth: 180,
        align: 'left',
        isFilter: true,
        filterType: 'number',
      },
      {
        id: 'bankName',
        label: 'Bank Name',
        width: 150,
        minWidth: 130,
        maxWidth: 190,
        align: 'left',
        isFilter: true,
        filterType: 'string',
      },
      {
        id: 'amount',
        label: 'Amount',
        width: 96,
        minWidth: 80,
        maxWidth: 120,
        align: 'left',
        isFilter: true,
        filterType: 'string',
        render(value) {
          return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
        },
      },
      {
        id: 'receivedChequeDate',
        label: 'Cheque Date',
        width: 160,
        minWidth: 140,
        maxWidth: 200,
        align: 'left',
        isFilter: true,
        filterType: 'date',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value ? dayjs(value).format('DD-MM-YYYY') : '-'}
          </Typography>
        ),
      },
      {
        id: 'remarks',
        label: 'Remarks',
        width: 220,
        minWidth: 180,
        maxWidth: 280,
        align: 'left',
        isFilter: true,
        filterType: 'string',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value || '-'}
          </Typography>
        ),
      },
      {
        stickyPosition: 'right',
        id: 'status',
        sticky: true,
        label: 'Status',
        width: 110,
        minWidth: 100,
        maxWidth: 140,
        align: 'left',
        isFilter: true,
        filterType: 'enum',
        enumOptions: PaymentMethodsStatusOptions,
        render(value, row) {
          const color = PamentMethodsStatusColor[value as PaymentMethodsStatusType] as LabelColor;
          return <Label color={color}>{PaymentMethodsStatusType[value]}</Label>;
        },
      },
      {
        stickyPosition: 'right',
        excludeFromExport: true,
        id: 'action',
        label: 'Actions',
        isSort: false,
        isFilter: false,
        sticky: true,
        align: 'left',
        width: 150,
        minWidth: 80,
        maxWidth: 150,
        render(value, row: any) {
          const handleDownloadReceipt = async () => {
            setSelectedReceipt(row);
            setReceiptLoading(true);
            setReceiptBlobUrl(null);
            setReceiptDialogOpen(true);

            try {
              const blob = await downloadReceiptPdf({
                receiptId:
                  row?.status === PaymentMethodsStatusType.Approved
                    ? row?.finalReceiptId
                    : row?.provisionalReceiptId,
              }).unwrap();
              const objectUrl = URL.createObjectURL(blob);
              setReceiptBlobUrl(objectUrl);
            } catch {
              setReceiptBlobUrl(null);
            } finally {
              setReceiptLoading(false);
            }
          };

          return (
            <AdaptiveThreeDotsActions
              directActionLimit={2}
              actions={[
                ...(row.status !== PaymentMethodsStatusType.Approved &&
                row.status !== PaymentMethodsStatusType.Rejected &&
                canApproveReject
                  ? [
                      {
                        id: 'approve',
                        label: 'Approve Cheque Entry',
                        icon: 'mdi:check-decagram',
                        color: 'success.main',
                        onClick: () => {
                          setIsClearCheck(false);
                          setSelectedEntry({ ...row, type: 'approve' });
                          isDialog.onTrue();
                        },
                      },
                    ]
                  : []),
                ...(row.status !== PaymentMethodsStatusType.Approved &&
                row.status !== PaymentMethodsStatusType.Rejected &&
                canApproveReject
                  ? [
                      {
                        id: 'reject',
                        label: 'Reject Cheque Entry',
                        icon: 'mdi:close-circle',
                        color: 'error.main',
                        onClick: () => {
                          setIsClearCheck(true);
                          setSelectedEntry({ ...row, type: 'reject' });
                          isDialog.onTrue();
                        },
                      },
                    ]
                  : []),
                {
                  id: 'download',
                  label: 'Download Receipt',
                  icon: 'mdi:download',
                  color: 'primary.main',
                  onClick: handleDownloadReceipt,
                },
              ]}
            />
          );
        },
      },
    ],
    [canApproveReject, isDialog, downloadReceiptPdf]
  );

  // Cleanup blob URLs on unmount
  useEffect(
    () => () => {
      if (receiptBlobUrl) URL.revokeObjectURL(receiptBlobUrl);
    },
    [receiptBlobUrl]
  );

  const handleDownloadReceiptFile = () => {
    if (!selectedReceipt || !receiptBlobUrl) return;
    const anchor = document.createElement('a');
    anchor.href = receiptBlobUrl;
    anchor.download = `receipt-${selectedReceipt.receiptNumber || selectedReceipt.id}.pdf`;
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleOpenReceiptInNewTab = () => {
    if (!receiptBlobUrl) return;
    window.open(receiptBlobUrl, '_blank', 'noopener,noreferrer');
  };

  const handleReceiptDialogClose = () => {
    setReceiptDialogOpen(false);
    if (receiptBlobUrl) {
      URL.revokeObjectURL(receiptBlobUrl);
      setReceiptBlobUrl(null);
    }
    setSelectedReceipt(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomizableTable
        isLoading={isLoading || isFetching}
        noDataText={<>No Cheque Data Found </>}
        tableId="cheque-details-table"
        columns={columns}
        data={data}
      />
      <CustomDialog
        open={isDialog.value}
        handleClose={isDialog.onFalse}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {isClearCheck ? 'Reject Cheque Entry' : 'Approve Cheque Entry'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                isClearCheck
                  ? 'Remarks are required to reject the cheque entry.'
                  : 'Review the cheque entry and click Approve. Add remarks if you wish to include any additional info.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ApproveRejectForm handleClose={isDialog.onFalse} editData={selectedEntry} />
      </CustomDialog>

      <ReconciliationReceiptDialog
        open={receiptDialogOpen}
        onClose={handleReceiptDialogClose}
        receiptData={selectedReceipt}
        receiptBlobUrl={receiptBlobUrl}
        isLoading={receiptLoading}
        onDownload={handleDownloadReceiptFile}
        onOpenInNewTab={handleOpenReceiptInNewTab}
      />
    </Box>
  );
};

export default ChequeDetailsForm;
