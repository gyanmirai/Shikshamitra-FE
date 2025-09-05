import { useFormik } from 'formik';
import React, { useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

const assignedRoutesList = [
  { value: 'R101', label: 'R101' },
  { value: 'R102', label: 'R102' },
  { value: 'R103', label: 'R103' },
  { value: 'R104', label: 'R104' },
];

const driverList = [
  { value: 'John Doe', label: 'John Doe' },
  { value: 'Jane Smith', label: 'Jane Smith' },
  { value: 'Emily Davis', label: 'Emily Davis' },
  { value: 'David Wilson', label: 'David Wilson' },
  { value: 'Michael Johnson', label: 'Michael Johnson' },
];

interface TransportAddNewVehicleDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}

interface FormikValue {
  vehicleNumber: string;
  capacity: string;
  model: string;
  assignedRoutes: string;
  driver: string;
  id: number;
}
const TransportAddNewVehicleDialog: React.FC<TransportAddNewVehicleDialogProps> = ({
  dialogValue,
  data,
  onSave,
  onClose,
  isEdit,
  allData,
}) => {
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);
  console.log('data', allData);
  console.log('seldata', data);

  const formik = useFormik<FormikValue>({
    initialValues: {
      vehicleNumber: isEdit ? (data.vehicleNumber ?? '') : '',
      capacity: isEdit ? (data.capacity ?? '') : '',
      model: isEdit ? (data.model ?? '') : '',
      assignedRoutes: isEdit ? (data.assignedRoutes ?? '') : '',
      driver: isEdit ? (data.driver ?? '') : '',
      id: isEdit
        ? (data.id ?? Math.floor(Math.random() * 1000000000))
        : Math.floor(Math.random() * 1000000000),
    },

    // validationSchema: validationSchema,  // Uncomment this if you have validation schema
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
      title={`${isEdit ? 'Edit' : 'Add New'} Vehicle`}
      open={dialogValue}
      handleClose={onClose}
    >
      <Box px="20px">
        {showExistingEntryMessage ? (
          <Typography component="span" fontSize="14" color="red">
            This Vehicle Already Exists
          </Typography>
        ) : (
          <Box height="25px" />
        )}
      </Box>
      <Scrollbar>
        <Box px="15px">
          <form onSubmit={formik.handleSubmit}>
            <Box pt="10px" display="flex" flexDirection="column" gap={3}>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField
                    disabled={isEdit}
                    name="vehicleNumber"
                    label="Vehicle Number"
                    value={formik.values.vehicleNumber}
                    onChange={formik.handleChange}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    type="number"
                    name="capacity"
                    label="Capacity"
                    value={formik.values.capacity}
                    onChange={formik.handleChange}
                    size="small"
                    fullWidth
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField
                    disabled={isEdit}
                    name="model"
                    label="Model"
                    value={formik.values.model}
                    onChange={formik.handleChange}
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid size={6}>
                  <CustomSelect
                    label="Driver"
                    options={driverList}
                    value={formik.values.driver}
                    onChange={(e) => formik.setFieldValue('driver', e)}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <CustomSelect
                    label="Route Assigned"
                    options={assignedRoutesList}
                    value={formik.values.assignedRoutes}
                    onChange={(e) => formik.setFieldValue('assignedRoutes', e)}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>
            <DialogActions>
              <Button onClick={onClose} variant="contained" size="small">
                Cancel
              </Button>
              <Button type="submit" variant="contained" size="small">
                Save
              </Button>
            </DialogActions>
          </form>
        </Box>
      </Scrollbar>
    </CustomDialog>
  );
};

export default TransportAddNewVehicleDialog;
