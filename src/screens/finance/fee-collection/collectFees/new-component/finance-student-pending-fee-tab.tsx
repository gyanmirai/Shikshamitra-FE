import type { LabelColor } from 'src/components/label';

import React from 'react';

import { Box, Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import studentPendingFeeData from 'src/json/finance/fee-collection/studentPendingFeeData.json';
import {
  FinancePendingFeeStatusType,
  FinancePendingFeeStatusTypeColors,
  FinancePendingFeeStatusTypeOptions,
} from 'src/enums/finance-pending-fee-status';

import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';

const FinanceStudentPendingFeeTab = () => (
  <>
    <CustomizableTable
      noDataText={
        <>
          No pending fees. All dues have been cleared. Great job staying up to date with your
          payments.
        </>
      }
      tableId="finance-student-overdue-payment-table"
      columns={[
        { id: 'dueDate', label: 'Due Date', filterType: 'date' },
        { id: 'feeName', label: 'Fee Name' },
        // { id: 'statusId', label: 'Status Id' },
        {
          id: 'amountDue',
          label: 'Amount Due',
          filterType: 'formattedNumber',
          align: 'right',
          render(value, row) {
            return <Typography fontSize="12px">{formatNumber(row.amountDue, 'INR')}</Typography>;
          },
        },

        {
          id: 'status',
          label: 'Status',
          filterType: 'enum',
          enumOptions: FinancePendingFeeStatusTypeOptions,
          minWidth: '180px',
          align: 'left',
          isSort: false,
          render(value, row) {
            const color = FinancePendingFeeStatusTypeColors[
              value as FinancePendingFeeStatusType
            ] as LabelColor;

            return (
              <Label color={color}>
                {FinancePendingFeeStatusType[value as FinancePendingFeeStatusType]}
              </Label>
            );
          },
        },
        // {
        //   id: 'action',
        //   label: 'Action',
        //   isFilter: false,
        //   isSort: false,
        //   align: 'right',
        //   sticky: true,
        //   render: (data, popover) => (
        //     <ThreeDotsActions
        //       placement="right-top"
        //       actions={() => (
        //         <MenuList>
        //           <MenuItem
        //             onClick={() => {
        //               popover.onClose();
        //             }}
        //           >
        //             <Iconify icon="mdi:check" />
        //             Mark As Paid
        //           </MenuItem>
        //         </MenuList>
        //       )}
        //     />
        //   ),
        // },
      ]}
      data={studentPendingFeeData}
    />

    <Box pb="20px" />
  </>
);

export default FinanceStudentPendingFeeTab;
