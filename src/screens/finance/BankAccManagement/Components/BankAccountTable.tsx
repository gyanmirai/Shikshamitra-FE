import React from 'react';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetBankAccountsQuery } from 'src/redux/finance/BankAccountManage/bankAccountApi';

import type { IBankAccount, IBankAccountTableProps } from './type';

const BankAccountTable: React.FC<IBankAccountTableProps> = ({
  data,
  onAddBankAccount,
  editData,
  open,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
}) => {
  const { data: bankAccountData, isLoading: bankAccountsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBankAccountsQuery,
  });
  return (
    <CustomizableTable
      isLoading={bankAccountsLoading}
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
      columns={[
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
          id: 'accountName',
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
              {value}
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
          id: 'accountPurpose',
          label: 'Purpose',
          align: 'left',
          minWidth: 100,
          render: (value) => (
            <Typography variant="caption" fontSize="13px">
              {value || '-'}
            </Typography>
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
      ]}
      data={bankAccountData || []}
    />
  );
};

export default BankAccountTable;
