import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import CustomTooltip from 'src/components/custom-tooltip';
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

const BankTransferTable = ({
  queryParams,
}: {
  queryParams?: { month: string; year: string; paymentMethod: string };
}) => {
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isClearCheck, setIsClearCheck] = useState(false);

  const isDialog = useBoolean(false);
  const { data: bankTransferData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetReconciliationListQuery,
    params: queryParams,
  });

  return (
    <>
      <CustomizableTable
        tableId="bank-transfer-table"
        isLoading={isLoading}
        noDataText={<>No Bank Transfer Data Found</>}
        columns={[
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
            id: 'transactionId',
            label: 'Transaction ID / UTR Number',
            minWidth: '250px',
            align: 'left',
            isFilter: true,
            filterType: 'string',
          },
          {
            id: 'transferDate',
            label: 'Transfer Date',
            minWidth: '140px',
            align: 'left',
            isFilter: true,
            filterType: 'date',
          },
          {
            id: 'accountHolderName',
            label: 'Account Holder Name',
            minWidth: '200px',
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
            minWidth: '200px',
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
              const color = PamentMethodsStatusColor[
                value as PaymentMethodsStatusType
              ] as LabelColor;
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
              return (
                <MenuList>
                  <Box sx={{ display: 'flex' }}>
                    {row.status !== PaymentMethodsStatusType.Approved && (
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

                    {row.status !== PaymentMethodsStatusType.Rejected && (
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
                  </Box>
                </MenuList>
              );
            },
          },
        ]}
        data={bankTransferData || []}
      />
      <CustomDialog
        open={isDialog.value}
        handleClose={isDialog.onFalse}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {isClearCheck ? 'Reject Bank Transfer' : 'Approve Bank Transfer'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                isClearCheck
                  ? 'Remarks are required to reject the bank transfer.'
                  : 'Review the bank transfer and click Approve. Add remarks if you wish to include any additional info.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ApproveRejectForm handleClose={isDialog.onFalse} editData={selectedEntry} />
      </CustomDialog>
    </>
  );
};

export default BankTransferTable;
