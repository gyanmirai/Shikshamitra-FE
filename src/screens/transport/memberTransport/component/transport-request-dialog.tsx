import React from 'react';

import { Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

interface TransportRequestDialogProps {
  dialogValue: boolean;
  onClose: () => void;
  selectedEntry: any;
}

const TransportRequestDialog: React.FC<TransportRequestDialogProps> = ({
  dialogValue,
  onClose,
  selectedEntry,
}) => {
  const data = [];
  return (
    <CustomDialog maxWidth="sm" title="Declined" open={dialogValue} handleClose={onClose}>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 3, height: '400px' }}>
        <Typography variant="body1" sx={{ pb: '15px' }}>
          Are You Sure Want to Declined ?
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <CustomSelect
              label="Select Reason"
              options={[
                { name: 'Route Not in Service', key: 'route_not_in_service' },
                { name: 'Vehicle at Full Capacity', key: 'vehicle_full_capacity' },
                { name: 'Stop Not in Service', key: 'stop_not_in_service' },
              ]}
              value=""
              labelKey="name"
              valueKey="key"
              onChange={(val) => console.log('val', val)}
              formControlProps={{ fullWidth: true }}
            />
          </Grid>

          <Grid item xs={12} md={12}>
            <TextField
              multiline
              rows={3}
              name="Others"
              label="Others"
              value=""
              onChange={() => {}}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <TextField
              multiline
              rows={3}
              name="notified message"
              label="Message Sent to Student"
              value=""
              onChange={() => {}}
              size="small"
              fullWidth
            />
          </Grid>
        </Grid>
      </Scrollbar>
      <DialogActions>
        <Button size="small" variant="contained" type="submit">
          Declined
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default TransportRequestDialog;
