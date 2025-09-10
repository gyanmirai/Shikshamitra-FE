import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import SubmitButton from 'src/components/submit-button';
import { Box, Grid, TextField, Typography, DialogActions } from '@mui/material';

import type {
  IFormikValue,
  ITransportAddNewMaintenanceDialogProps,
} from '../../newVehicleManagement/vehicle-management-interface';

const TransportMaintenanceDialog: React.FC<ITransportAddNewMaintenanceDialogProps> = ({
  data,
  allData,
  dialogValue,
  isEdit,
  onSave,
  onClose,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);

  const formik = useFormik<IFormikValue>({
    initialValues: {
      dateOfMaintenance: isEdit ? (dayjs(data.maintenanceDate, 'DD-MM-YYYY') ?? null) : null,
      nextScheduleMaintenance: isEdit
        ? (dayjs(data.nextScheduledMaintenance, 'DD-MM-YYYY') ?? null)
        : null,
      serviceDetails: isEdit ? (data.serviceDetails ?? '') : '',
      id: isEdit
        ? (data.id ?? Math.floor(Math.random() * 1000000000))
        : Math.floor(Math.random() * 1000000000),
    },
    onSubmit: (values) => {
      const existingEntryIndex = allData.findIndex((val: any) => val.id === values.id);
      if (!isEdit) {
        if (existingEntryIndex === -1) {
          setShowExistingEntryMessage(false);
          onSave(values);
        } else {
          setShowExistingEntryMessage(true);
        }
      } else {
        onSave(values);
      }
      console.log('Form Submitted type', values);
    },
  });

  return (
    <CustomDialog
      title={`${isEdit ? 'Edit' : 'Add New'} Maintenance Record`}
      open={dialogValue}
      handleClose={onClose}
      maxWidth="md"
    >
      <Scrollbar sx={{ p: 3, bgcolor: 'background.neutral', height: '500px' }}>
        <form onSubmit={formik.handleSubmit}>
          <Box pt="10px" display="flex" flexDirection="column" gap={3}>
            <Grid container spacing={2}>
              <Grid size={6}>
                <DatePicker
                  name="dateOfMaintenance"
                  label="Date Of Maintenance"
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  format="DD-MM-YYYY"
                  value={formik.values.dateOfMaintenance}
                  onChange={(date) => {
                    formik.setFieldValue('dateOfMaintenance', date);
                  }}
                />
              </Grid>
              <Grid size={6}>
                <DatePicker
                  name="nextScheduleMaintenance"
                  label="Next Schedule Maintenance"
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  format="DD-MM-YYYY"
                  value={formik.values.nextScheduleMaintenance}
                  onChange={(date) => {
                    formik.setFieldValue('nextScheduleMaintenance', date);
                  }}
                />
              </Grid>
            </Grid>
            <TextField
              rows={4}
              multiline
              name="serviceDetails"
              label="Service Details"
              value={formik.values.serviceDetails}
              onChange={formik.handleChange}
              size="small"
              fullWidth
            />
            <UploadBox
              onDrop={() => {}}
              placeholder={
                <Box
                  sx={{
                    gap: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.disabled',
                    flexDirection: 'column',
                  }}
                >
                  <Iconify icon="eva:cloud-upload-fill" width={40} />
                  <Typography variant="body2">upload file</Typography>
                </Box>
              }
              sx={{
                py: 2.5,
                width: '100%',
                height: 'auto',
                borderRadius: 1.5,
              }}
            />
          </Box>
        </form>
      </Scrollbar>
      <DialogActions>
        {/* <Button onClick={onClose} variant="contained" size="small">
              Cancel
            </Button> */}
        <SubmitButton onClick={() => {}} />
      </DialogActions>
    </CustomDialog>
  );
};

export default TransportMaintenanceDialog;
