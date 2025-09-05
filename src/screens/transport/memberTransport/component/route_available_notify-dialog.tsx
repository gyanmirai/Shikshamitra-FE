import React from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { Grid, Button, TextField, DialogActions } from '@mui/material';

interface RouteAvailableNotifyDialogProps {
  dialogValue: boolean;
  onClose: () => void;
  selectedEntry: any;
}

const RouteAvailableNotifyDialog: React.FC<RouteAvailableNotifyDialogProps> = ({
  dialogValue,
  onClose,
  selectedEntry,
}) => (
    <CustomDialog maxWidth="sm" title="Notify" open={dialogValue} handleClose={onClose}>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 3, height: '400px' }}>
        {/* <Typography variant='body1' sx={{ pb: "15px" }}>
                    Are You Sure Want to Declined ?
                </Typography> */}
        <Grid container spacing={2}>
          {/* <Grid size={12}>
                        <CustomSelect
                            label="Select Reason"
                            options={[
                                { name: 'Route Not in Service', key: 'route_not_in_service' },
                                { name: 'Vehicle at Full Capacity', key: 'vehicle_full_capacity' },
                                { name: 'Stop Not in Service', key: 'stop_not_in_service' },

                            ]}

                            value=''
                            labelKey="name"
                            valueKey="key"
                            onChange={(val) => console.log("val", val)}
                            formControlProps={{ fullWidth: true, }}


                        />
                    </Grid>

                    <Grid size={12}>
                        <TextField
                            multiline

                            rows={3} name="Others"
                            label="Others"
                            value=''
                            onChange={() => { }}
                            size="small"
                            fullWidth
                        />


                    </Grid> */}
          <Grid size={12}>
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
          Send
        </Button>
      </DialogActions>
    </CustomDialog>
  );

export default RouteAvailableNotifyDialog;
