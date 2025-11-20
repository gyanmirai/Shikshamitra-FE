import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { MenuItem, MenuList, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import studentPendingFeeData from 'src/json/finance/fee-collection/studentPendingFeeData.json';
import {
  FinancePendingFeeStatusType,
  FinancePendingFeeStatusTypeColors,
  FinancePendingFeeStatusTypeOptions,
} from 'src/enums/finance-pending-fee-status';

const HostelPendingFeeTab = () => {
  // State to store the selected amount
  const [, setSelectedAmount] = useState<number | null>(null);
  return (
    <CustomizableTable
      noDataText={
        <>
          No pending fees. All dues have been cleared. Great job staying up to date with your
          payments.
        </>
      }
      tableId="hostel-pending-fee"
      isShowedDense={false}
      isSearch={false}
      columns={[
        { id: 'feeName', label: 'Fee Name' },
        // { id: 'statusId', label: 'Status Id' },
        {
          id: 'amountDue',
          label: 'Amount Due',
          filterType: 'formattedNumber',
          render(value, row) {
            return <Typography fontSize="12px">{formatNumber(row.amountDue, 'INR')}</Typography>;
          },
        },
        { id: 'dueDate', label: 'Due Date', filterType: 'date' },
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
        {
          id: 'action',
          label: 'Action',
          isFilter: false,
          isSort: false,
          align: 'right',
          sticky: true,
          minWidth: 40,
          render: (data, popover) => (
            <ThreeDotsActions
              placement="right-top"
              actions={() => (
                <MenuList>
                  <MenuItem
                    onClick={() => {
                      //   popover.onClose();
                      setSelectedAmount(data);
                    }}
                  >
                    <Iconify icon="mdi:payment" />
                    Pay Fee
                  </MenuItem>
                </MenuList>
              )}
            />
          ),
        },
      ]}
      data={studentPendingFeeData}
    />
  );
};

export default HostelPendingFeeTab;
