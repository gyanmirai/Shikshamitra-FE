import React, { useState } from 'react';

import { Box, Grid, Button, TextField, Autocomplete, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

import FormattedAmountInput from '../../common/input-for-finance';

interface FinanceFeeRefundRequestDialogProps {
  dialogValue: boolean;
  onClose: () => void;
}

const FeeRefundRequestDialog: React.FC<FinanceFeeRefundRequestDialogProps> = ({
  dialogValue,
  onClose,
}) => {
  const handleProceedRefund = () => {
    // Implement your refund logic here
  };

  const feeOptions = [
    { label: 'Tuition Fee', value: 'tuition' },
    { label: 'Transport Fee', value: 'transport' },
    { label: 'Lab Fee', value: 'lab' },
  ];

  const termOptions = [
    { label: 'Quarter 1', value: 'q1' },
    { label: 'Quarter 2', value: 'q2' },
    { label: 'Quarter 3', value: 'q3' },
  ];

  const handleTermSelection = (selectedValues: any) => {
    console.log(selectedValues);
  };

  const [amountDueState, setAmountDueState] = useState('');
  const [receivedAmountState, setReceivedAmountState] = useState('');
  function parseNumber(value: string): number {
    return parseFloat(value.replace(/,/g, ''));
  }

  const handleAmountDueChange = (formattedValue: string, numericValue: number) => {
    setAmountDueState(formattedValue);
  };
  const handleReceivedAmountChange = (formattedValue: string, numericValue: number) => {
    setReceivedAmountState(formattedValue);
  };

  return (
    <CustomDialog
      maxWidth="md"
      title="Request For Fee Refund"
      open={dialogValue}
      handleClose={onClose}
    >
      <Box>
        <form onSubmit={(e) => e.preventDefault()}>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
            <Grid container spacing={2}>
              {/* Class */}
              <Grid item xs={6}>
                <CustomSelect
                  label="Class"
                  name="class"
                  options={[
                    { label: '10', value: '10A' },
                    { label: '12', value: '10B' },
                    { label: '11', value: '10C' },
                  ]}
                  formControlProps={{ sx: { width: '100%' } }}
                  value=""
                  onChange={(value) => console.log(value)}
                />
              </Grid>

              {/* Division */}
              <Grid item xs={6}>
                <CustomSelect
                  label="Division"
                  name="division"
                  options={[
                    { label: 'A', value: 'A' },
                    { label: 'B', value: 'B' },
                    { label: 'C', value: 'C' },
                  ]}
                  formControlProps={{ sx: { width: '100%' } }}
                  value=""
                  onChange={(value) => console.log(value)}
                />
              </Grid>

              {/* Student Name */}
              <Grid item xs={6}>
                <Autocomplete
                  loading={false}
                  noOptionsText="No Student Found"
                  fullWidth
                  options={[
                    { id: 1, firstName: 'John Doe' },
                    { id: 2, firstName: 'Jane Smith' },
                  ]}
                  getOptionLabel={(option: any) => option?.firstName || ''}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Student Name"
                      placeholder="Search Student Name"
                      fullWidth
                    />
                  )}
                  renderOption={(props, option: any) => (
                    <li {...props} key={option.id}>
                      {option.firstName}
                    </li>
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Autocomplete
                  loading={false}
                  noOptionsText="No Student Found"
                  fullWidth
                  options={[
                    { id: 1, firstName: '987374' },
                    { id: 2, firstName: '838738' },
                  ]}
                  getOptionLabel={(option: any) => option?.firstName || ''}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Gr No"
                      placeholder="Search Gr No"
                      fullWidth
                    />
                  )}
                  renderOption={(props, option: any) => (
                    <li {...props} key={option.id}>
                      {option.firstName}
                    </li>
                  )}
                />
              </Grid>

              {/* Fee Type */}
              <Grid item xs={6}>
                <CustomSelect
                  multiple
                  label="Fee Type"
                  options={feeOptions}
                  value={[]}
                  onChange={(value) => console.log(value)}
                  formControlProps={{ sx: { width: '100%' } }}
                />
              </Grid>

              {/* Paid Terms */}
              <Grid item xs={6}>
                <CustomSelect
                  label="Paid Terms"
                  options={termOptions}
                  value={[]}
                  onChange={handleTermSelection}
                  formControlProps={{ sx: { width: '100%' } }}
                  multiple
                />
              </Grid>
              <Grid item xs={6}>
                <FormattedAmountInput
                  label="Amount Applicable For Refund"
                  value={amountDueState}
                  onChange={handleAmountDueChange}
                />
              </Grid>
              <Grid item xs={6}>
                <FormattedAmountInput
                  label="Ask For Refund"
                  value={receivedAmountState}
                  onChange={handleReceivedAmountChange}
                />
              </Grid>

              {/* Additional Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason"
                  name="notes"
                  variant="outlined"
                  size="small"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Scrollbar>

          <DialogActions>
            <Button type="submit" onClick={handleProceedRefund} variant="contained" size="small">
              Raise Refund Request
            </Button>
          </DialogActions>
        </form>
      </Box>
    </CustomDialog>
  );
};

export default FeeRefundRequestDialog;
