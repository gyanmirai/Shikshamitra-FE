'use client';

import React, { useState, useEffect } from 'react';

import { Button, Typography, DialogActions, DialogContent } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import CustomDialog from 'src/components/customDialog';

interface FeeConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    studentName: string;
    amount: number;
  }
const FeeConfirmationDialog: React.FC<FeeConfirmationDialogProps> = ({ open, onClose, onConfirm, studentName, amount }) => {
    const [isConfirmEnabled, setConfirmEnabled] = useState(false);
    // eslint-disable-next-line consistent-return
    useEffect(() => {
        if (open) {
          setConfirmEnabled(false);
          const timer = setTimeout(() => setConfirmEnabled(true), 3000); 
          return () => clearTimeout(timer); 
        }
      }, [open]);
    return(
    
    
    <CustomDialog maxWidth="sm" title="Confirm Fee Payment" open={open} handleClose={onClose}>
      {/* <DialogTitle id="fee-confirmation-dialog-title">
        Confirm Fee Payment
      </DialogTitle> */}
      <DialogContent>
        <Typography>
          Are you sure you want to collect a fee payment of 
          <strong> {formatNumber(amount, "INR")}</strong> for <strong>{studentName}</strong>?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button  onClick={onClose} variant="outlined" size="small">
          Cancel
        </Button>
        <Button disabled={!isConfirmEnabled} onClick={onConfirm} variant="contained" size="small">
          Confirm
        </Button>
      </DialogActions>
    </CustomDialog>
  )};

export default FeeConfirmationDialog;
