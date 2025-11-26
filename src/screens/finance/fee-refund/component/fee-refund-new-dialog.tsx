import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Button,
  Select,
  MenuItem,
  Checkbox,
  TextField,
  Typography,
  InputLabel,
  DialogTitle,
  FormControl,
  ListItemText,
  DialogActions,
  DialogContent,
} from '@mui/material';

interface RefundDialogProps {
  studentData: any;
  onClose: () => void;
}

const RefundDialog: React.FC<RefundDialogProps> = ({ studentData, onClose }) => {
  const [selectedFees, setSelectedFees] = useState<any>([]);
  const [refundMethod, setRefundMethod] = useState<'original' | 'bank'>('original');
  const [bankDetails, setBankDetails] = useState<any>('');
  const [totalPaid, setTotalPaid] = useState<any>(0);
  const [error, setError] = useState<any>('');

  useEffect(() => {
    // Calculate total paid amount based on selected fees
    const total = selectedFees.reduce((sum: any, fee: any) => sum + fee.amountPaid, 0);
    setTotalPaid(total);
  }, [selectedFees]);

  const handleRefundMethodChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setRefundMethod(event.target.value as 'original' | 'bank');
  };

  const handleFeeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedIds = event.target.value as string[];
    const fees = studentData.paidFees.filter((fee: any) => selectedIds.includes(fee.id));
    setSelectedFees(fees);
  };

  const handleBankDetailsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBankDetails(event.target.value);
  };

  const handleProceedRefund = () => {
    if (refundMethod === 'original' && selectedFees.length === 0) {
      setError('Please select the fees to refund.');
      return;
    }

    if (refundMethod === 'bank' && !bankDetails) {
      setError('Please enter bank details for transfer.');
      return;
    }

    // Proceed with refund initiation based on refund method
    initiateRefund();
  };

  const initiateRefund = () => {
    if (refundMethod === 'original') {
      // API call to handle original payment method refund
    } else {
      // API call to handle bank transfer refund
    }

    // Reset error state and proceed with closing the dialog
    setError('');
    onClose();
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Fee Refund</DialogTitle>
      <DialogContent>
        <Typography variant="h6">{studentData.studentName}</Typography>
        <Typography variant="body2">Requested On: {studentData.requestedOn}</Typography>
        <Typography variant="body2">Reason: {studentData.reason}</Typography>

        {/* Multi-select Dropdown for selecting fees to refund */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Select Fees to Refund</InputLabel>
          <Select
            multiple
            value={selectedFees.map((fee: any) => fee.id)}
            onChange={(e: any) => {
              handleFeeChange(e);
            }}
            renderValue={(selected: any) =>
              (selected as string[])
                .map((id) => {
                  const fee = studentData.paidFees.find((f: any) => f.id === id);
                  return fee ? fee.feeHead : '';
                })
                .join(', ')
            }
          >
            {studentData.paidFees.map((fee: any) => (
              <MenuItem key={fee.id} value={fee.id}>
                <Checkbox checked={selectedFees.some((f: any) => f.id === fee.id)} />
                <ListItemText primary={fee.feeHead} secondary={`Amount Paid: ₹${fee.amountPaid}`} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Displaying total amount selected for refund */}
        <Typography variant="body1">Total Amount Selected for Refund: ₹{totalPaid}</Typography>

        {/* Refund Method Selector */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Refund Method</InputLabel>
          <Select
            value={refundMethod}
            onChange={(e: any) => {
              handleRefundMethodChange(e);
            }}
          >
            <MenuItem value="original">Original Payment Method</MenuItem>
            <MenuItem value="bank">Bank Transfer</MenuItem>
          </Select>
        </FormControl>

        {/* Bank Transfer Details if selected */}
        {refundMethod === 'bank' && (
          <TextField
            label="Enter Bank Account Details"
            fullWidth
            margin="normal"
            value={bankDetails}
            onChange={handleBankDetailsChange}
            placeholder="Bank Account Number, IFSC Code, etc."
          />
        )}

        {/* Display any errors */}
        {error && <Typography color="error">{error}</Typography>}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleProceedRefund} color="primary">
          Proceed for Refund
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RefundDialog;
