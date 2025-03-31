'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add, ArrowBack } from '@mui/icons-material';
import { MobileTimePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetShiftsQuery,
  useAddShiftMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
} from 'src/redux/shiftManagement/shift-management-api';

import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const ShiftManageMentScreen = () => {
  const open = useBoolean();
  const confirm = useBoolean(false);

  const [editData, setEditData] = useState<any>(null);

  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetShiftsQuery,
  });

  const [deleteShift, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteShiftMutation,
  });

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          setEditData(null);
          confirm.onFalse();
        }}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <LoadingButton
            variant="contained"
            loading={isDeleteLoading}
            color="error"
            onClick={async () => {
              await deleteShift(editData?.id || '');
              confirm.onFalse();
              setEditData(null);
            }}
          >
            Delete
          </LoadingButton>
        }
      />
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
        <ShiftManageMentForm
          handleClose={() => {
            setEditData(null);
            open.onFalse();
          }}
          editData={editData}
        />
      ) : (
        <CustomizableTable
          tableId="shift-management"
          isLoading={isLoading}
          columns={[
            { label: 'Name', id: 'shiftName' },
            { label: 'Start Time', id: 'startTime' },
            { label: 'End Time', id: 'endTime' },
            {
              label: 'Action',
              id: 'action',
              render(value, row) {
                return (
                  <ThreeDotsActions
                    showDeleteIcon
                    showEditIcon
                    handleEditClick={() => {
                      setEditData(row as any);
                      open.onTrue();
                    }}
                    handleDeleteClick={() => {
                      setEditData(row as any);
                      confirm.onTrue();
                    }}
                    showThreeDots={false}
                  />
                );
              },
            },
          ]}
          data={data?.items || []}
        />
      )}
    </Box>
  );
};

export default ShiftManageMentScreen;

const ShiftManageMentForm = ({ handleClose, editData }: any) => {
  const [addShift, { isLaoding: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddShiftMutation,
  });

  const [updateShift, { isLoading: isUpdateLoiading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateShiftMutation,
  });
  const formik = useFormik<{
    name: string;
    startTime: Dayjs | null;
    endTime: Dayjs | null;
  }>({
    initialValues: {
      name: editData?.name || '',
      startTime: editData?.startTime || null,
      endTime: editData?.endTime || null,
    },
    validationSchema: yup.object({
      name: yup.string().required('Name is required'),
      startTime: yup
        .date()
        .test('startTime', 'Start time must be before end time', (value, context) => {
          if (context.parent.endTime && dayjs(context.parent.endTime).isBefore(dayjs(value))) {
            return false;
          }
          return true;
        })
        .required('Start Time is required'),
      endTime: yup
        .date()
        .test('endtime', 'End time must be after start time', (value, context) => {
          if (dayjs(context.parent.startTime).isAfter(dayjs(value))) {
            return false;
          }
          return true;
        })
        .required('End Time is required'),
    }),
    onSubmit: async (values) => {
      console.log('🚀 ~ onSubmit:async ~ values:', values);

      try {
        if (editData) {
          await updateShift({
            id: editData.id,
            body: {
              shiftName: values.name,
              startTime: values.startTime?.format('HH:mm:ss'),
              endTime: values.endTime?.format('HH:mm:ss'),
            },
          }).unwrap();
        } else {
          await addShift({
            shiftName: values.name,
            startTime: values.startTime?.format('HH:mm:ss'),
            endTime: values.endTime?.format('HH:mm:ss'),
          }).unwrap();
        }
        handleClose();
      } catch (error) {
        console.log('🚀 ~ onSubmit:async ~ error:', error);
      }
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
        <LoadingButton type="submit" variant="contained" loading={isAddLoading || isUpdateLoiading}>
          Save
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};
