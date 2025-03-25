import React, { useMemo, useState, useEffect } from 'react';

import { Box, Button, TextField, Typography, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import capitalizeWords from 'src/utils/capitalizeText';
import { formatNumber } from 'src/utils/formate_number';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import NumericFormatCustom from 'src/components/custom-numeric-format';

interface FinanceStudentAdditionalDiscountDialogProps {
  dialogValue: boolean;
  selectedData: any;
  onClose: () => void;
}

const FinanceStudentAdditionalDiscountDialog: React.FC<
  FinanceStudentAdditionalDiscountDialogProps
> = ({ dialogValue, selectedData, onClose }) => {
  const data = [
    {
      grNumber: '28877',
      studentName: 'JAY',
      paymentId: 'j878d',
      feeHead: 'Tuition',
      paidAmount: '10000',
      payableFee: '10000',
      generalDiscount: '0',
      refundAmount: '0',
      paidDate: '20-04-2024',
      status: 'Paid',
      totalFees: 60000,
      charges: 0,
      fees: [
        {
          feeHeadId: 198,
          feeHead: 'Tuition',
          totalFees: 60000,
          amount: 5000,
          paymentDates: [
            {
              month: 'June-2024',
              date: '15-01-2024',
              status: 'Unpaid',
              amount: 5000,
              paymentHistory: [
                {
                  paymentMode: 'Card',
                  amount: '2000',
                  paymentId: '54j8',
                  paymentStatus: 'Success',
                },
                { paymentMode: 'Cash', amount: '2000' },
                {
                  paymentMode: 'Online',
                  amount: '1000',
                  paymentId: 'h8749',
                  paymentStatus: 'Failed',
                },
                {
                  paymentMode: 'Online',
                  amount: '500',
                  paymentId: 'h8749',
                  paymentStatus: 'Success',
                },
                {
                  paymentMode: 'Check',
                  amount: '500',
                  paymentId: 'h8749',
                  paymentStatus: 'Not Clear',
                  charges: 500,
                },
              ],
            },
            {
              month: 'July-2024',
              date: '15-02-2024',
              status: 'Paid',
              amount: 5000,
              paymentHistory: [
                {
                  paymentMode: 'Bank Transfer',
                  amount: '3000',
                  paymentId: 'jh238',
                  paymentStatus: 'Success',
                },
                {
                  paymentMode: 'Card',
                  amount: '2000',
                  paymentId: 'aa123',
                  paymentStatus: 'Success',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      grNumber: '28877',
      studentName: 'JAY',
      paymentId: 'j878d',
      feeHead: 'Library',
      paidAmount: '4000',
      refundAmount: '0',
      payableFee: '4000',
      generalDiscount: '0',
      paidDate: '20-04-2024',
      status: 'Paid',
      totalFees: 60000,
      charges: 0,
      fees: [
        {
          feeHeadId: 198,
          feeHead: 'Tuition',
          totalFees: 60000,
          amount: 5000,
          paymentDates: [
            {
              month: 'July-2024',
              date: '15-02-2024',
              status: 'Paid',
              amount: 5000,
              paymentHistory: [
                {
                  paymentMode: 'Bank Transfer',
                  amount: '3000',
                  paymentId: 'jh238',
                  paymentStatus: 'Success',
                },
                {
                  paymentMode: 'Card',
                  amount: '2000',
                  paymentId: 'aa123',
                  paymentStatus: 'Success',
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  const dialog = useBoolean();
  // const [selectedEntry, setSelectedEntry] = useState(data);
  // const [isEdit, setIsEdit] = useState(false);

  const [paymentHistoryData, setPaymentHistoryData] = useState(data);

  const [discountValues, setDiscountValues] = useState<{ [key: string]: string }>({});
  const [remarkValues, setRemarkValues] = useState<{ [key: string]: string }>({});
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);

  const handleDiscountChange = (feeHead: string, value: string) => {
    setDiscountValues((prev) => {
      const updatedValues = {
        ...prev,
        [feeHead]: value.replace(/[^0-9.]/g, ''),
      };

      console.log(updatedValues, 'updatedValues'); // This will correctly show updated values

      return updatedValues;
    });
  };

  // ✅ Use useEffect to correctly update isSaveEnabled when discountValues change
  useEffect(() => {
    const canSave = Object.values(discountValues).some((val) => Number(val) > 0);
    const totalDiscount = calculateTotalDiscount();
    console.log(discountValues, 'Current Discount Values');
    console.log(canSave, 'Updated CanSave');

    console.log('Total Discount in handleDiscountChange:', totalDiscount); // ✅ Log total
    setIsSaveEnabled(canSave);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountValues]); // Depend on discountValues, so it updates correctly

  const calculateTotalDiscount = () => {
    const totalDiscount = Object.values(discountValues).reduce(
      (sum, value) => sum + (Number(value) || 0),
      0
    );

    console.log('Total Discount Calculated:', totalDiscount); // ✅ Log total discount
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
    console.log('Recalculating totalRow...');
    console.log('Current paymentHistoryData:', paymentHistoryData);
    console.log('Current discountValues:', discountValues);
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

  const handlerSave = () => {};

  return (
    <CustomDialog
      maxWidth="xl"
      title="Additional Discount"
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
              render: (value: any, row: any) => (
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
          onClick={handlerSave}
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
