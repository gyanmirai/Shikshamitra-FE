import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, MenuItem, MenuList } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetBankStatementsQuery } from 'src/redux/finance/reconciliation';
import {
  BankStatementsStatusType,
  BankStatementsStatusColor,
  BankStatementsStatusOptions,
} from 'src/enums/finance-reconcilition-bankstatements-status';

const BankStatements = () => {
  // API call to get bank statements data
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBankStatementsQuery,
  });

  // Extract data arrays from API response
  const bankStatements = data?.data || [];
  const bankOptions = data?.bankOptions || [];

  return (
    <Box>
      <Box>
        <CustomizableTable
          isLoading={isLoading}
          noDataText={<>No Bank Statement Data Found </>}
          tableId="bank-statements-table"
          columns={[
            {
              id: 'statementId',
              label: 'Statement ID',
              minWidth: '150px',
              align: 'left',
              sticky: true,
              isFilter: true,
              filterType: 'string',
            },
            {
              id: 'bankName',
              label: 'Bank Name',
              minWidth: '150px',
              align: 'left',
              isFilter: true,
              filterType: 'enum',
              enumOptions: bankOptions,
            },
            {
              id: 'accountNumber',
              label: 'Account Number',
              minWidth: '160px',
              align: 'left',
              isFilter: true,
              filterType: 'string',
            },
            {
              id: 'uploadDate',
              label: 'Upload Date',
              minWidth: '130px',
              align: 'left',
              isFilter: true,
              filterType: 'date',
            },
            {
              id: 'transactions',
              label: 'Transactions',
              minWidth: '120px',
              align: 'left',
              isFilter: true,
              filterType: 'number',
            },
            {
              id: 'status',
              label: 'Status',
              minWidth: '100px',
              align: 'left',
              isFilter: true,
              filterType: 'enum',
              enumOptions: BankStatementsStatusOptions,
              render(value, row) {
                const color = BankStatementsStatusColor[
                  value as BankStatementsStatusType
                ] as LabelColor;
                return <Label color={color}>{BankStatementsStatusType[value]}</Label>;
              },
            },
            {
              id: 'actions',
              label: 'Actions',
              isFilter: false,
              isSort: false,
              sticky: true,
              align: 'left',
              minWidth: '60px',
              render(value, row) {
                return (
                  <ThreeDotsActions
                    actions={({ popover }) => (
                      <MenuList>
                        <MenuItem
                          onClick={(e) => {
                            popover.onClose();
                          }}
                        >
                          <Iconify icon="mdi:download" />
                          Download Statement
                        </MenuItem>
                      </MenuList>
                    )}
                    placement="right-top"
                  />
                );
              },
            },
          ]}
          data={bankStatements || []}
        />
      </Box>
    </Box>
  );
};

export default BankStatements;
