'use client';

import React, { useState, useEffect } from 'react';
import CustomDialog from 'src/components/customDialog';
import { Box, Typography, DialogContent } from '@mui/material';

interface ReceivedAmountWarningDialogProps {
  open: boolean;
  onClose: () => void;

  title: string;
}
const ReceivedAmountWarning: React.FC<ReceivedAmountWarningDialogProps> = ({
  open,
  onClose,
  title,
}) => {
  const [, setConfirmEnabled] = useState(false);
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (open) {
      setConfirmEnabled(false);
      const timer = setTimeout(() => setConfirmEnabled(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [open]);
  return (
    <CustomDialog maxWidth="sm" title="Error !" open={open} handleClose={onClose}>
      <Box height="100px">
        {/* <DialogTitle id="fee-confirmation-dialog-title">
        Confirm Fee Payment
      </DialogTitle> */}
        <DialogContent>
          <Typography>{title}</Typography>
        </DialogContent>
        {/* <DialogActions>
        <Button  onClick={onClose} variant="outlined" size="small">
          Cancel
        </Button>
        <Button disabled={!isConfirmEnabled} onClick={onConfirm} variant="contained" size="small">
          Confirm
        </Button>
      </DialogActions> */}
      </Box>
    </CustomDialog>
  );
};

export default ReceivedAmountWarning;
