import React, { useMemo, useState, useEffect } from 'react';

import { Box, Button, Tooltip, TextField, Typography, DialogActions } from '@mui/material';

import capitalizeWords from 'src/utils/capitalizeText';
import { formatNumber } from 'src/utils/formate_number';

import AutoFocus from 'src/components/autofocus';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { Iconify } from 'src/components/iconify/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { additionalDiscountData } from '../student-fee-data/student-additional-discount-data';

import type { AdditionalDiscount } from '../student-fee-data/student-additional-discount-data';

interface FinanceStudentAdditionalDiscountDialogProps {
  dialogValue: boolean;
  selectedData: any;
  onClose: () => void;
}

const FinanceStudentAdditionalDiscountDialog: React.FC<
  FinanceStudentAdditionalDiscountDialogProps
> = ({ dialogValue, selectedData, onClose }) => {
  // State to store payment history data from additionalDiscountData
  const [paymentHistoryData] = useState<AdditionalDiscount[]>(additionalDiscountData);

  // State to store discount values for each fee head as key-value pairs
  const [discountValues, setDiscountValues] = useState<{ [key: string]: string }>({});

  // State to store remarks/comments for each fee head
  const [remarkValues, setRemarkValues] = useState<{ [key: string]: string }>({});

  // State to control whether save button should be enabled based on discount values
  const [isSaveEnabled, setIsSaveEnabled] = useState<boolean>(false);

  // Handler to update discount values when user enters amount
  // Removes any non-numeric characters except decimal point
  const handleDiscountChange = (feeHead: string, value: string) => {
    setDiscountValues((prev) => {
      const updatedValues = {
        ...prev,
        [feeHead]: value.replace(/[^0-9.]/g, ''),
      };

      return updatedValues;
    });
  };
  // ✅ Use useEffect to correctly update isSaveEnabled when discountValues change
  useEffect(() => {
    const canSave = Object.values(discountValues).some((val) => Number(val) > 0);
    const totalDiscount = calculateTotalDiscount();

    setIsSaveEnabled(canSave);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountValues]); // Depend on discountValues, so it updates correctly

  const calculateTotalDiscount = () => {
    const totalDiscount = Object.values(discountValues).reduce(
      (sum, value) => sum + (Number(value) || 0),
      0
    );

    return totalDiscount;
  };

  // Handle Remark Change
  const handleRemarkChange = (feeHead: string, value: string) => {
    setRemarkValues((prev) => ({
      ...prev,
      [feeHead]: capitalizeWords(value), // Store remark per feeHead dynamically
    }));
  };

  const calculateTotal = (key: keyof (typeof paymentHistoryData)[0]) =>
    paymentHistoryData.reduce((total, item) => {
      const value = Number(item[key]) || 0;
      return total + value;
    }, 0);

  const totalRow = useMemo(() => {
    const totalDiscount = Object.values(discountValues).reduce(
      (acc, value) => acc + Number(value || 0),
      0
    );
    return {
      paymentId: '',
      feeHead: 'Total',
      paidAmount: calculateTotal('paidAmount'),
      generalDiscount: calculateTotal('generalDiscount'),
      payableFee: calculateTotal('payableFee'),
      refundAmount: totalDiscount,
      paidDate: '',
      status: '',
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentHistoryData, discountValues]); // ✅ Ensure dependencies are tracked correctly

  return (
    <CustomDialog
      maxWidth="xl"
      title={
        <Box display="flex" flexDirection="row" gap={2} alignItems="center">
          <Typography variant="h5">Additional Discount</Typography>
          <Tooltip
            arrow
            placement="right"
            title="This is the Additional Discount dialog, where the discount is applied only to this specific student and is applicable to the payable fee."
          >
            <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
          </Tooltip>
        </Box>
      }
      open={dialogValue}
      handleClose={onClose}
    >
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
        <Box display="flex" flexDirection="row" gap={2} py="12px">
          <Typography>
            <strong>Name:</strong> Vishal RameshBhai Patel
          </Typography>
          <Typography>
            <strong>Standard:</strong> 10/B
          </Typography>
          <Typography>
            <strong>Gr Number:</strong> 89866
          </Typography>
          <Typography>
            <strong>Roll Number:</strong> 1
          </Typography>
        </Box>

        <CustomizableTable
          tableId="student-fee-details-table"
          isFilter={false}
          isShowedDense={false}
          isPagination={false}
          isScrollbar={false}
          isSearch={false}
          columns={[
            { id: 'feeHead', label: 'Fee Head' },
            {
              id: 'paidAmount',
              label: 'Gross Fee',
              render(value, row) {
                if (row.paidAmount === 'Total') {
                  return (
                    <Typography fontSize="12px" fontWeight="bold">
                      Total
                    </Typography>
                  );
                }
                return (
                  <Typography fontSize="12px">{formatNumber(row.paidAmount, 'INR')}</Typography>
                );
              },
            },
            {
              id: 'generalDiscount',
              label: 'General Discount',
              render(value, row) {
                return (
                  <Typography fontSize="12px">
                    {formatNumber(row.generalDiscount, 'INR')}
                  </Typography>
                );
              },
            },
            {
              id: 'payableFee',
              label: 'Payable Fee',
              render(value, row) {
                return (
                  <Typography fontSize="12px">{formatNumber(row.payableFee, 'INR')}</Typography>
                );
              },
            },
            {
              id: 'refundAmount',
              label: 'Discount Amount',
              render: (value: any, row: any) =>
                row.feeHead === paymentHistoryData[0].feeHead ? (
                  <AutoFocus>
                    <NumericFormatCustom
                      size="small"
                      label={`${row.feeHead} Discount`}
                      name={`${row.feeHead.toLowerCase()}Discount`}
                      value={discountValues[row.feeHead] || ''}
                      onChange={(e) => handleDiscountChange(row.feeHead, e.target.value)}
                    />
                  </AutoFocus>
                ) : (
                  <NumericFormatCustom
                    size="small"
                    label={`${row.feeHead} Discount`}
                    name={`${row.feeHead.toLowerCase()}Discount`}
                    value={discountValues[row.feeHead] || ''}
                    onChange={(e) => handleDiscountChange(row.feeHead, e.target.value)}
                  />
                ),
            },
            {
              id: 'remark',
              label: 'Remark',
              render: (value: any, row: any) => {
                if (row.feeHead === 'Total') {
                  return <Box />; // Return an empty Box for "Total" row
                }
                return (
                  <TextField
                    size="small"
                    label={`${row.feeHead} Remark`}
                    value={remarkValues[row.feeHead] || ''}
                    onChange={(e) => handleRemarkChange(row.feeHead, e.target.value)}
                    sx={{ width: '100%' }}
                  />
                );
              },
            },
          ]}
          data={[...paymentHistoryData, totalRow]}
        />
      </Scrollbar>
      <DialogActions>
        <Button
          disabled={!isSaveEnabled}
          onClick={() => {}}
          type="submit"
          variant="contained"
          size="small"
        >
          Save
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default FinanceStudentAdditionalDiscountDialog;
