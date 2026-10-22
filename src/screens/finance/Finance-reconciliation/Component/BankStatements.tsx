import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';

import React, { useMemo } from 'react';
import { Label } from 'src/components/label';

import { formatNumber } from 'src/utils/formate_number';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Typography } from '@mui/material';
import { useGetReconciliationListQuery } from 'src/redux/finance/reconciliation';
import {
  PamentMethodsStatusColor,
  PaymentMethodsStatusType,
  PaymentMethodsStatusOptions,
} from 'src/enums/finance-reconcilition-status';

const BankStatements = ({
  queryParams,
}: {
  queryParams?: { month: string; year: string; paymentMethod: string };
}) => {
  // API call to get bank statements data
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetReconciliationListQuery,
    params: queryParams,
  });

  // Extract data arrays from API response
  const bankStatements = data?.data || [];

  const columns: IColumn[] = useMemo(
    () => [
      {
        stickyPosition: 'left',
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
        id: 'medium',
        label: 'Medium',
        minWidth: '100px',
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
        id: 'chequeNo',
        label: 'Cheque No.',
        minWidth: '120px',
        align: 'left',
        isFilter: true,
        filterType: 'string',
      },
      {
        id: 'bankName',
        label: 'Bank Name',
        minWidth: '130px',
        align: 'left',
        isFilter: true,
        filterType: 'string',
      },
      {
        id: 'amount',
        label: 'Amount',
        minWidth: '80px',
        align: 'left',
        isFilter: true,
        filterType: 'string',
        render(value) {
          return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
        },
      },
      {
        id: 'chargesAmount',
        label: 'Charges Amount',
        minWidth: '160px',
        align: 'left',
        isFilter: true,
        filterType: 'string',
        render(value) {
          return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
        },
      },
      {
        id: 'receivedChequeDate',
        label: 'Received Cheque Date',
        minWidth: '200px',
        align: 'left',
        isFilter: true,
        filterType: 'date',
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
        stickyPosition: 'right',
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
        stickyPosition: 'right',
        excludeFromExport: true,
        id: 'actions',
        label: 'Actions',
        isFilter: false,
        isSort: false,
        sticky: true,
        align: 'left',
        minWidth: '60px',
        render(value, row) {
          return (
            <AdaptiveThreeDotsActions directActionLimit={2}
              actions={
                PaymentMethodsStatusType[row.status] === 'Bounced'
                  ? [
                      {
                        id: 'notify',
                        label: 'Send Notification',
                        icon: 'mdi:bell-ring',
                        onClick: () => {},
                      },
                    ]
                  : []
              }
              placement="right-top"
            />
          );
        },
      },
    ],

    []
  );

  return (
    <Box>
      <Box>
        <CustomizableTable
          isLoading={isLoading}
          noDataText={<>No Bank Statement Data Found </>}
          tableId="bank-statements-table"
          columns={columns}
          data={bankStatements || []}
        />
      </Box>
    </Box>
  );
};

export default BankStatements;
