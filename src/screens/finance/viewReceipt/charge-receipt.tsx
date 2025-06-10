import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

import { Box, Grid, Button, Divider, Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';

interface ViewReceiptProps {
  dialogValue: boolean;
  onClose: () => void;
}

const ViewReceipt: React.FC<ViewReceiptProps> = ({ dialogValue, onClose }) => {
  const paymentDetails = [
    { feeHead: 'Library Fee', month: 'January', amount: 1000, paymentMode: 'Cash' },
    { feeHead: 'Library Fee', month: 'February', amount: 1000, paymentMode: 'Cash' },
    { feeHead: 'Library Fee', month: 'March', amount: 1000, paymentMode: 'Cash' },
    // Add more rows as required
  ];

  const subTotal = paymentDetails.reduce((acc, item) => acc + item.amount, 0);
  const tax = subTotal * 0.05; // Example: 5% tax
  const total = subTotal + tax;

  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  } as any);

  return (
    <CustomDialog fullScreen title="Fee Receipt" handleClose={onClose} open={dialogValue}>
      <Box p={4} ref={componentRef} display="flex" flexDirection="column" height="100%">
        {/* Top Section */}
        <Box flexGrow={1}>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={6}>
              <Box>
                <Typography variant="h6">From</Typography>
                <Typography>School Name</Typography>
                <Typography>Building No./Flat/House No.</Typography>
                <Typography>Area/Locality/Road Name</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box>
                <Typography variant="h6">To</Typography>
                <Typography>Student Name</Typography>
                <Typography>Class & Section</Typography>
                <Typography>Address</Typography>
              </Box>
            </Grid>
          </Grid>
          <Box display="flex" justifyContent="flex-end" pb="10px">
            <Typography>Date: 12/10/2025</Typography>
          </Box>
          <Divider />

          {/* Payment Details Table */}
          <Box mt={3}>
            <CustomizableTable
              tableId="payment-details-table"
              isSearch={false}
              isFilter={false}
              isShowedDense={false}
              columns={[
                {
                  id: 'feeHead',
                  label: 'Fee Head',
                },
                {
                  id: 'month',
                  label: 'Month',
                },
                {
                  id: 'amount',
                  label: 'Amount',
                },
                {
                  id: 'paymentMode',
                  label: 'Payment Mode',
                },
              ]}
              data={paymentDetails}
            />
          </Box>
        </Box>

        {/* Summary Section */}
        <Box mt={3} display="flex" justifyContent="flex-end">
          <Box>
            {/* <Typography>Subtotal: {subTotal.toFixed(2)}</Typography>
            <Typography>Tax: {tax.toFixed(2)}</Typography> */}
            <Typography variant="h6">Total: {formatNumber(total, 'INR')}</Typography>
          </Box>
        </Box>

        {/* Print Button */}
        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button variant="contained" color="primary" onClick={() => handlePrint()}>
            Print Receipt
          </Button>
        </Box>
      </Box>
    </CustomDialog>
  );
};

export default ViewReceipt;
