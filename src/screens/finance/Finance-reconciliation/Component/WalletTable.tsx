import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useEffect } from 'react';
import { financePermissions } from 'src/constants/finance-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, MenuList, Typography, IconButton } from '@mui/material';
import {
  useGetReconciliationListQuery,
  useDownloadReconciliationReceiptPdfMutation,
} from 'src/redux/finance/reconciliation';
import {
  PamentMethodsStatusColor,
  PaymentMethodsStatusType,
  PaymentMethodsStatusOptions,
} from 'src/enums/finance-reconcilition-status';

import { ApproveRejectForm } from './DemandDraftTable';
import ReconciliationReceiptDialog from './ReconciliationReceiptDialog';

const WalletTable = ({
  queryParams,
}: {
  queryParams?: { academicYearId: string; month: number; year: number; paymentMethod: string };
}) => {
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isClearCheck, setIsClearCheck] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

  const isDialog = useBoolean(false);

  const { permissions } = useSelector((state: RootState) => state.auth);
  const canApproveReject = permissions.some(
    (perm: any) => perm.name === financePermissions.accounts.reconciliationAdd && perm.isGranted
  );

  const { data: listResponse, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetReconciliationListQuery,
    params: queryParams,
  });

  const [downloadReceiptPdf] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDownloadReconciliationReceiptPdfMutation,
    popupConfig: {
      error: true,
      errorMessage: 'Unable to load receipt',
      success: false,
    },
  });

  const data = listResponse?.items ?? [];

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'studentName',
        label: 'Student Name',
        minWidth: '150px',
        align: 'left',
        isFilter: true,
        filterType: 'string',
        sticky: true,
        render: (value, row) => (
          <Typography variant="caption" fontSize="13px">
            {value || '-'} ({row.grNumber})
          </Typography>
        ),
      },
      {
        id: 'board',
        label: 'Board/Medium',
        minWidth: '120px',
        align: 'left',
        isFilter: true,
        filterType: 'string',
        render: (value, row) => (
          <Typography variant="caption" fontSize="13px">
            {value || '-'}-{row.medium}
          </Typography>
        ),
      },
      {
        id: 'amount',
        label: 'Amount',
        minWidth: '120px',
        align: 'left',
        isFilter: true,
        filterType: 'string',
        render(value) {
          return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
        },
      },
      {
        id: 'walletProviderName',
        label: 'Wallet Provider Name',
        minWidth: '200px',
        align: 'left',
        isFilter: true,
        filterType: 'string',
      },
      {
        id: 'transactionId',
        label: 'Transaction ID',
        minWidth: '160px',
        align: 'left',
        isFilter: true,
        filterType: 'string',
      },
      {
        id: 'class',
        label: 'Class',
        minWidth: '80px',
        align: 'left',
        isFilter: true,
        filterType: 'string',
        render: (value, row) => (
          <Typography variant="caption" fontSize="13px">
            {value || '-'}-{row.division}
          </Typography>
        ),
      },
      {
        id: 'rollNumber',
        label: 'Roll No.',
        minWidth: '120px',
        align: 'left',
        isFilter: true,
        filterType: 'number',
      },
      {
        id: 'remarks',
        label: 'Remarks',
        minWidth: '180px',
        align: 'left',
        isFilter: true,
        filterType: 'string',
      },
      {
        id: 'status',
        sticky: true,
        label: 'Status',
        minWidth: '100px',
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
        id: 'action',
        label: 'Actions',
        isSort: false,
        isFilter: false,
        sticky: true,
        align: 'left',
        render(value, row: any) {
          const handleDownloadReceipt = async () => {
            setSelectedReceipt(row);
            setReceiptLoading(true);
            setReceiptBlobUrl(null);
            setReceiptDialogOpen(true);

            try {
              const blob = await downloadReceiptPdf({
                receiptId: row.id,
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
            <MenuList>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {row.status !== PaymentMethodsStatusType.Approved && canApproveReject && (
                  <IconButton
                    onClick={() => {
                      setIsClearCheck(false);
                      setSelectedEntry({ ...row, type: 'approve' });
                      isDialog.onTrue();
                    }}
                    sx={{
                      width: 36,
                      height: 36,
                      p: 0,
                    }}
                  >
                    <Iconify icon="mdi:check-decagram" sx={{ color: 'success.main' }} />
                  </IconButton>
                )}

                {row.status !== PaymentMethodsStatusType.Rejected && canApproveReject && (
                  <IconButton
                    onClick={() => {
                      setIsClearCheck(true);
                      setSelectedEntry({ ...row, type: 'reject' });
                      isDialog.onTrue();
                    }}
                    sx={{
                      width: 36,
                      height: 36,
                      p: 0,
                    }}
                  >
                    <Iconify icon="mdi:close-circle" sx={{ color: 'error.main' }} />
                  </IconButton>
                )}

                <CustomTooltip title="Download Receipt" arrow>
                  <IconButton
                    onClick={handleDownloadReceipt}
                    sx={{
                      width: 36,
                      height: 36,
                      p: 0,
                    }}
                  >
                    <Iconify icon="mdi:download" sx={{ color: 'primary.main' }} />
                  </IconButton>
                </CustomTooltip>
              </Box>
            </MenuList>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canApproveReject, downloadReceiptPdf]
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
    <>
      <CustomizableTable
        tableId="wallet-table"
        columns={columns}
        data={data}
        isLoading={isLoading}
        noDataText={<>No Wallet/Prepaid Card Data Found</>}
      />
      <CustomDialog
        open={isDialog.value}
        handleClose={isDialog.onFalse}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {isClearCheck ? 'Reject Wallet Payment' : 'Approve Wallet Payment'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                isClearCheck
                  ? 'Remarks are required to reject the wallet payment.'
                  : 'Review the payment and click Approve. Add remarks if you wish to include any additional info.'
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
    </>
  );
};

export default WalletTable;
