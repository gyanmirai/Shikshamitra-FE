import React, { useState } from 'react';

import { Box, Switch, Tooltip, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import ReadOnlyFeeStructureTable from 'src/screens/finance/settings/fee-structure/component/read-only-fee-structure-table';

import CustomDialog from 'src/components/customDialog';
import { Iconify } from 'src/components/iconify/iconify';
import { Scrollbar } from 'src/components/scrollbar/scrollbar';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type FeeStructureOverView from '../data/FeeStructure-interface';

interface FinanceFeeStructureOverviewComponentProps {
  data: FeeStructureOverView[];
}
const FinanceFeeStructureOverviewComponent: React.FC<FinanceFeeStructureOverviewComponentProps> = ({
  data,
}) => {
  const detaiFeeStructure = useBoolean();

  const initialData = [
    {
      id: 1,
      amount: 3000,
      discountAmount: 2000,
      grossFee: 5000,
      applicableGrade: '2',
      bookRecipt: 'CBSE',
      paymentDueDate: '20-12-2024',
      payableFees: 40000,
      feeSubCategoryList: [
        {
          feeHead: 'Admission',
          grossFee: 1000,
          payableFee: 1000,
          generalDiscount: 0,
          paymentMethod: ['cash'],
          lateFeeChargesType: 'fixed',
          lateFeeChargesAmount: '1000',
          isActive: true,
        },
        {
          feeHead: 'Tuition',
          grossFee: 5000,
          payableFee: 4500,
          generalDiscount: 500,
          paymentMethod: ['cash', 'online'],
          lateFeeChargesType: 'perDay',
          lateFeeChargesAmount: '1',
          isActive: true,
        },
        {
          feeHead: 'Sports',
          grossFee: 5000,
          payableFee: 4500,
          generalDiscount: 500,
          paymentMethod: ['cash'],
          lateFeeChargesType: 'perDay',
          lateFeeChargesAmount: '1',
          isActive: false,
        },
        {
          feeHead: 'Transport',
          grossFee: 5000,
          payableFee: 4500,
          generalDiscount: 500,
          paymentMethod: ['cash'],
          lateFeeChargesType: 'fixed',
          lateFeeChargesAmount: '1000',
          isActive: false,
        },
      ],
      isActive: true,
    },
  ];
  const [tableData, setTableData] = useState<any>(initialData);
  const [selectedFeeStructure, setSelectedFeeStructure] = useState<any>(null);
  return (
    <>
      <Box pb="10px">
        <CustomizableTable
          tableId="fee-structure-overview"
          columns={[
            {
              id: 'bookRecipt',
              label: 'Receipt Book',
            },
            { id: 'applicableGrade', label: 'Applicable Class' },

            {
              id: 'grossFee',
              label: 'Gross Fees',
              render(value, row) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>{formatNumber(value, 'INR')}</Typography>
                );
              },
            },
            {
              id: 'totaldiscountAmount',
              label: 'General Discount',
              render(value, row) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>{formatNumber(value, 'INR')}</Typography>
                );
              },
            },
            {
              id: 'payableFees',
              label: 'Payable Fees',
              render(value, row) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>{formatNumber(value, 'INR')}</Typography>
                );
              },
            },

            {
              id: 'paymentDueDate',
              label: 'Payment Due Date',
            },
            {
              id: 'statustoggle',
              label: 'InActive/Active',
              render(val: boolean, row: any) {
                return <Switch value={val} />;
              },
            },

            {
              id: 'action',
              label: 'Action',
              render(value, row: any) {
                return (
                  <ThreeDotsActions
                    showThreeDots={false}
                    showViewIcon
                    handleViewClick={() => {
                      setSelectedFeeStructure(row.feeSubCategoryList);
                      detaiFeeStructure.onTrue();
                    }}
                  />
                );
              },
            },
          ]}
          data={tableData}
        />
      </Box>

      <CustomDialog
        maxWidth="xl"
        title={
          <Box display="flex" flexDirection="row" gap={2} alignItems="center">
            <Typography variant="h5">Detail Fee Structure For 1st standard</Typography>
            <Tooltip
              arrow
              placement="right"
              title="This is the detailed fee structure for 1st standard, applicable to all students of that class except for specific scenarios."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </Tooltip>
          </Box>
        }
        open={detaiFeeStructure.value}
        handleClose={() => {
          detaiFeeStructure.onFalse();
        }}
      >
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '600px' }}>
          <ReadOnlyFeeStructureTable data={selectedFeeStructure} />
        </Scrollbar>
      </CustomDialog>
    </>
  );
};

export default FinanceFeeStructureOverviewComponent;
