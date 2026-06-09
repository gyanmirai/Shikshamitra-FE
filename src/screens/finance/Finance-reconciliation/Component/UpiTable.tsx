import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useEffect } from 'react';
import { financePermissions } from 'src/constants/finance-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, MenuList, Typography, IconButton } from '@mui/material';
import { useGetReconciliationListQuery } from 'src/redux/finance/reconciliation';
import {
  PamentMethodsStatusColor,
  PaymentMethodsStatusType,
  PaymentMethodsStatusOptions,
} from 'src/enums/finance-reconcilition-status';

import { ApproveRejectForm } from './DemandDraftTable';

const UpiTable = ({
  queryParams,
}: {
  queryParams?: { academicYearId: string; month: number; year: number; paymentMethod: string };
}) => {
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  const [isClearCheck, setIsClearCheck] = useState(false);
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
  const data = listResponse?.items ?? [];

  useEffect(() => {
    if (!isLoading && listResponse && (listResponse.items ?? []).length === 0) {
      const monthYear = queryParams
        ? dayjs(`${queryParams.year}-${String(queryParams.month).padStart(2, '0')}-01`).format(
            'MMM-YYYY'
          )
        : '';
      const academicYear = (currentYear as any)?.name ?? '';
      shikshaMitraToast.warning({
        message: `No UPI records found for ${monthYear}${academicYear ? ` (${academicYear})` : ''}. Please change the month or academic year.`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, listResponse]);

  const columns: IColumn[] = useMemo(
    () => [
      {
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
        id: 'receiptNumber',
        label: 'Receipt No.',
        width: 180,
        minWidth: 150,
        maxWidth: 220,
        align: 'left',
        isFilter: true,
        filterType: 'string',
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
        id: 'class',
        label: 'Class/Div',
        align: 'left',
        width: 150,
        minWidth: 130,
        maxWidth: 180,
        render: (value, row) => (
          <Typography variant="caption" fontSize="13px">
            {value || '-'} {row.division && `- (${row.division})`}
          </Typography>
        ),
      },
      {
        id: 'amount',
        label: 'Amount',
        width: 140,
        minWidth: 120,
        maxWidth: 180,
        align: 'left',
        isFilter: true,
        filterType: 'string',
        render(value) {
          return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
        },
      },
      {
        id: 'upiId',
        label: 'UPI ID/VPA',
        width: 200,
        minWidth: 180,
        maxWidth: 240,
        align: 'left',
        isFilter: true,
        filterType: 'string',
        render: (value, row) => (
          <Typography variant="caption" fontSize="13px">
            {row.instrumentDetails?.upiId || '-'}
          </Typography>
        ),
      },
      {
        id: 'upiTransactionId',
        label: 'Transaction ID',
        width: 160,
        minWidth: 140,
        maxWidth: 200,
        align: 'left',
        isFilter: true,
        filterType: 'string',
        render: (value, row) => (
          <Typography variant="caption" fontSize="13px">
            {row.instrumentDetails?.upiTransactionId || '-'}
          </Typography>
        ),
      },
      {
        id: 'receiptDate',
        label: 'Payment Date',
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
        id: 'action',
        label: 'Actions',
        isSort: false,
        isFilter: false,
        sticky: true,
        align: 'left',
        width: 100,
        minWidth: 80,
        maxWidth: 120,
        render(value, row: any) {
          const handleDownloadReceipt = () => {
            shikshaMitraToast.info({
              message: 'Downloading receipt...',
            });
          };

          return (
            <MenuList>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {row.status !== PaymentMethodsStatusType.Approved &&
                  row.status !== PaymentMethodsStatusType.Rejected &&
                  canApproveReject && (
                    <>
                      <CustomTooltip title="Approve UPI Payment" arrow>
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
                      </CustomTooltip>

                      <CustomTooltip title="Reject UPI Payment" arrow>
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
                      </CustomTooltip>
                    </>
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
    [canApproveReject]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomizableTable
        tableId="upi-table"
        columns={columns}
        data={data}
        isLoading={isLoading || isFetching}
        noDataText={<>No UPI Data Found</>}
      />
      <CustomDialog
        open={isDialog.value}
        handleClose={isDialog.onFalse}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {isClearCheck ? 'Reject UPI Payment' : 'Approve UPI Payment'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                isClearCheck
                  ? 'Remarks are required to reject the UPI payment.'
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
    </Box>
  );
};

export default UpiTable;
