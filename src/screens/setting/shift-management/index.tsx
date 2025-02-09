'use client';

import React from 'react';
import { useFormik } from 'formik';

import { LoadingButton } from '@mui/lab';
import { Add, ArrowBack } from '@mui/icons-material';
import { MobileTimePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const ShiftManageMentScreen = () => {
  const open = useBoolean();

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Shift Management"
        links={[{ name: 'Institute Setup' }, { name: 'Shift Management' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            startIcon={open.value ? <ArrowBack /> : <Add />}
            size="small"
            variant="contained"
            onClick={open.onToggle}
          >
            {open.value ? 'back' : 'Shift'}
          </Button>
        }
      />
      {open.value ? (
        <ShiftManageMentForm handleClose={open.onFalse} />
      ) : (
        <CustomizableTable
          tableId="shift-management"
          columns={[
            { label: 'Name', id: 'name' },
            { label: 'Start Time', id: 'startTime' },
            { label: 'End Time', id: 'endTime' },
            {
              label: 'Action',
              id: 'action',
              render(value, row) {
                return <ThreeDotsActions showDeleteIcon showEditIcon showThreeDots={false} />;
              },
            },
          ]}
          data={[]}
        />
      )}
    </Box>
  );
};

export default ShiftManageMentScreen;

const ShiftManageMentForm = ({ handleClose }: any) => {
  const formik = useFormik({
    initialValues: {
      name: '',
      startTime: null,
      endTime: null,
    },
    // validationSchema:yup.object({
    //   name:yup.string().required("Name is required")
    // }),
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <Box sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MobileTimePicker
              label="Start Time"
              value={formik.values.startTime}
              format="hh:mm A"
              onChange={(date) => formik.setFieldValue('startTime', date)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  helperText: formik.touched.startTime && formik.errors.startTime,
                  error: !!formik.errors.startTime && formik.touched.startTime,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MobileTimePicker
              label="End Time"
              format="hh:mm A"
              value={formik.values.endTime}
              onChange={(date) => formik.setFieldValue('endTime', date)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  helperText: formik.touched.endTime && formik.errors.endTime,
                  error: !!formik.errors.endTime && formik.touched.endTime,
                },
              }}
            />
          </Grid>
        </Grid>
      </Box>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton type="submit" variant="contained">
          Save
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};
