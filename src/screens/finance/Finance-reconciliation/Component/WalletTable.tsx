import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, MenuList, MenuItem, Typography } from '@mui/material';
import { useGetWalletQuery } from 'src/redux/finance/reconciliation';
import {
  PamentMethodsStatusColor,
  PaymentMethodsStatusType,
  PaymentMethodsStatusOptions,
} from 'src/enums/finance-reconcilition-status';

import { ApproveRejectForm } from './DemandDraftTable';

const WalletTable = () => {
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isClearCheck, setIsClearCheck] = useState(false);
  const isDialog = useBoolean(false);
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetWalletQuery,
  });

  return (
    <Box>
      <CustomizableTable
        tableId="wallet-table"
        columns={[
          {
            id: 'studentName',
            label: 'Student Name',
            minWidth: '150px',
            align: 'left',
            isFilter: true,
            filterType: 'string',
            sticky: true,
          },
          {
            id: 'class',
            label: 'Class',
            minWidth: '80px',
            align: 'left',
            isFilter: true,
            filterType: 'string',
          },
          {
            id: 'division',
            label: 'Division',
            minWidth: '100px',
            align: 'left',
            isFilter: true,
            filterType: 'string',
          },
          {
            id: 'grNumber',
            label: 'GR No.',
            minWidth: '120px',
            align: 'left',
            isFilter: true,
            filterType: 'number',
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
                <ThreeDotsActions
                  placement="right-top"
                  actions={({ popover }: any) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          setIsClearCheck(false);
                          setSelectedEntry({ ...row, type: 'approve' });
                          isDialog.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="mdi:check-decagram" sx={{ color: 'success.main', mr: 1 }} />
                        <Typography fontWeight={500} color="success.main">
                          Approve
                        </Typography>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setIsClearCheck(true);
                          setSelectedEntry({ ...row, type: 'reject' });
                          isDialog.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="mdi:close-circle" sx={{ color: 'error.main', mr: 1 }} />
                        <Typography fontWeight={500} color="error.main">
                          Reject
                        </Typography>
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={data || []}
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
        maxWidth="sm"
      >
        <ApproveRejectForm handleClose={isDialog.onFalse} editData={selectedEntry} />
      </CustomDialog>
    </Box>
  );
};

export default WalletTable;
