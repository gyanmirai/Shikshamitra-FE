import React from 'react';

import { Switch, Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';

interface FinanceDetailFeeStructureViewProps {
  dialogValue: boolean;
  onClose: () => void;
  data: any;
}

const FinanceDetailFeeStructureView: React.FC<FinanceDetailFeeStructureViewProps> = ({
  onClose,
  data,
  dialogValue,
}) => {
  console.log('data', data);

  const dummyData = [
    {
      feeHead: 'Tuition',
      grossFee: 5000,
      payableFee: 4500,
      generalDiscount: 500,
    },
    {
      feeHead: 'Sports',
      grossFee: 5000,
      payableFee: 4500,
      generalDiscount: 500,
    },
    {
      feeHead: 'Transport',
      grossFee: 5000,
      payableFee: 4500,
      generalDiscount: 500,
    },
    {
      feeHead: 'Admission',
      grossFee: 1000,
      payableFee: 1000,
      generalDiscount: 0,
    },
  ];
  return (
    <CustomDialog
      maxWidth="xl"
      title="Detail Fee Structure"
      open={dialogValue}
      handleClose={onClose}
    >
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '450px' }}>
        <CustomizableTable
          tableId="fee-structure-detail"
          isSearch={false}
          isFilter={false}
          isPagination={false}
          isShowedDense={false}
          columns={[
            { id: 'feeHead', label: 'Fee Head' },
            {
              id: 'grossFee',
              label: 'Gross Fee',
              render(value, row) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>
                    {formatNumber(Number(value), 'INR')}
                  </Typography>
                );
              },
            },
            {
              id: 'generalDiscount',
              label: 'General Discount',
              render(value, row) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>
                    {formatNumber(Number(value), 'INR')}
                  </Typography>
                );
              },
            },
            {
              id: 'payableFee',
              label: 'Payable Fee',
              render(value, row) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>
                    {formatNumber(Number(value), 'INR')}
                  </Typography>
                );
              },
            },

            {
              id: 'monthly',
              label: 'Monthly Payable Fee',
              render(value, row) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>
                    {formatNumber(Number(row.payableFee / 12), 'INR')}
                  </Typography>
                );
              },
            },
            {
              id: 'quartly',
              label: 'Quartely Payable Fee',
              render(value, row) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>
                    {formatNumber(Number(row.payableFee / 4), 'INR')}
                  </Typography>
                );
              },
            },

            {
              id: 'bi-annual',
              label: 'Bi-Annually Payable Fee',
              render(value, row) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>
                    {formatNumber(Number(row.payableFee / 2), 'INR')}
                  </Typography>
                );
              },
            },
            {
              id: 'active',
              label: 'Active/In Active',
              render(value, row) {
                return <Switch name="creditcard" checked onChange={() => {}} />;
              },
            },
          ]}
          data={dummyData}
        />
      </Scrollbar>
    </CustomDialog>
  );
};

export default FinanceDetailFeeStructureView;
