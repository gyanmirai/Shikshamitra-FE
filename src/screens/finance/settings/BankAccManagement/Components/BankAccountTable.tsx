import type { IColumn } from 'src/components/customizabaleTable/types';

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import { BankAccountType, type IBankAccount, type IBankAccountTableProps } from './type';

const BankAccountTable: React.FC<IBankAccountTableProps> = ({
  data,
  onAddBankAccount,
  editData,
  open,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
  isLoading,
}) => {
  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'bankName',
        label: 'Bank Name',
        minWidth: 120,
        sticky: true,
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'branchName',
        label: 'Branch Name',
        minWidth: 130,
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'branchAddress',
        label: 'Branch Address',
        minWidth: 150,
        align: 'left',
        render: (value) => (
          <Typography
            variant="caption"
            fontSize="13px"
            sx={{
              maxWidth: 300,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            {value || '-'}
          </Typography>
        ),
      },
      {
        id: 'accountHolderName',
        label: 'Account Holder Name',
        minWidth: 190,
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'accountType',
        label: 'Type',
        align: 'left',
        minWidth: 80,
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value === BankAccountType.Saving ? 'Saving' : 'Current'}
          </Typography>
        ),
      },
      {
        id: 'accountNumber',
        label: 'Account Number',
        align: 'left',
        minWidth: 160,
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'purpose',
        label: 'Purpose',
        align: 'left',
        minWidth: 100,
        render: (value, row) => (
          <CustomTooltip title={value} arrow sx={{ textAlign: 'justify' }}>
            <Typography
              variant="inherit"
              noWrap
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
                maxWidth: 0,
                minWidth: '100%',
              }}
            >
              {value}
            </Typography>
          </CustomTooltip>
        ),
      },
      {
        id: 'ifscCode',
        label: 'IFSC Code',
        minWidth: 120,
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'upiId',
        label: 'UPI ID',
        align: 'left',
        minWidth: 90,
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value || '-'}
          </Typography>
        ),
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 50,
        align: 'left',
        isSort: false,
        sticky: true,
        isFilter: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              showThreeDots={false}
              placement="right-top"
              showDeleteIcon
              showEditIcon
              handleDeleteClick={() => {
                onDelete(row as IBankAccount);
              }}
              handleEditClick={() => {
                onEdit(row as IBankAccount);
              }}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <CustomizableTable
      tableId="bank-account-data-table"
      noDataText={
        <>
          Bank Account Data Not Found{' '}
          <Box
            onClick={() => {
              onAddBankAccount.onTrue();
              setOpenDialog(true);
              setEditData(null);
            }}
            color="primary.main"
            fontWeight={600}
            sx={{
              '&:hover': {
                cursor: 'pointer',
                textDecoration: 'underline',
              },
            }}
          >
            Add Bank Account
          </Box>
        </>
      }
      columns={columns}
      data={data || []}
      isLoading={isLoading}
    />
  );
};

export default BankAccountTable;
