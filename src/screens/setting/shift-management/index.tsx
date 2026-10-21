'use client';

import type { Dayjs } from 'dayjs';
import type { StepIconProps } from '@mui/material/StepIcon';

import dayjs from 'dayjs';
import * as yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { useBoolean } from 'src/hooks/use-boolean';
import { MobileTimePicker } from '@mui/x-date-pickers';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { capitalizeFirstLetter } from 'src/utils/input-format';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Step,
  Button,
  Stepper,
  StepLabel,
  TextField,
  StepContent,
  DialogActions,
} from '@mui/material';
import {
  useGetShiftsQuery,
  useAddShiftMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
} from 'src/redux/shiftManagement/shift-management-api';

const NumberStepIcon = ({ completed, icon }: StepIconProps) => (
  <Box
    aria-hidden="true"
    sx={{
      width: 24,
      height: 24,
      minWidth: 24,
      minHeight: 24,
      flexShrink: 0,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      bgcolor: completed ? 'success.main' : 'grey.500',
      color: 'common.white',
      fontSize: 12,
      fontWeight: 700,
      lineHeight: 1,
    }}
  >
    {icon}
  </Box>
);

const ShiftManageMentScreen = () => {
  const open = useBoolean();
  const confirm = useBoolean(false);

  const [editData, setEditData] = useState<any>(null);
  const closeShiftForm = () => {
    setEditData(null);
    open.onFalse();
  };

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
        disableBackdropClick
        onClose={() => {
          setEditData(null);
          confirm.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete <b>{editData?.shiftName}</b> shift ?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            loading={isDeleteLoading}
            color="error"
            onClick={async () => {
              await deleteShift(editData?.id || '').unwrap();
              shikshaMitraToast.success({ message: 'Shift deleted successfully.' });

              confirm.onFalse();
              setEditData(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
      <CustomBreadcrumbs
        heading="Shift Management"
        description="Create and manage named shifts with start and end times for the school's daily schedule."
        links={[{ name: 'Institute Setup' }, { name: 'Shift Management' }]}
        action={
          <Button startIcon={<Add />} size="small" variant="contained" onClick={open.onTrue}>
            Shift
          </Button>
        }
      />
      <CustomizableTable
        noDataText={
          <>
            No shifts have been added yet.{' '}
            <Box
              onClick={() => {
                open.onTrue();
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Add Shift
            </Box>
          </>
        }
        tableId="shift-management"
        isLoading={isLoading}
        columns={[
          { label: 'Name', id: 'shiftName' },
          { label: 'Start Time', id: 'startTime' },
          { label: 'End Time', id: 'endTime' },
          {
            label: 'Action',
            id: 'action',
            isFilter: false,
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
      <CustomDialog
        open={open.value}
        handleClose={closeShiftForm}
        title={editData ? 'Edit Shift' : 'Add Shift'}
        maxWidth="sm"
        paperProps={{ sx: { maxWidth: 540 } }}
      >
        {open.value && <ShiftManageMentForm handleClose={closeShiftForm} editData={editData} />}
      </CustomDialog>
    </Box>
  );
};

export default ShiftManageMentScreen;

const ShiftManageMentForm = ({ handleClose, editData }: any) => {
  const [addShift, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddShiftMutation,
  });

  const [updateShift, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateShiftMutation,
  });
  const formik = useFormik<{ name: string; startTime: Dayjs | null; endTime: Dayjs | null }>({
    initialValues: {
      name: editData?.shiftName || '',
      startTime: editData?.startTime ? dayjs(editData?.startTime, 'HH:mm:ss') : null,
      endTime: editData?.endTime ? dayjs(editData?.endTime, 'HH:mm:ss') : null,
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
          shikshaMitraToast.success({ message: 'Shift updated successfully.' });
        } else {
          await addShift({
            shiftName: values.name,
            startTime: values.startTime?.format('HH:mm:ss'),
            endTime: values.endTime?.format('HH:mm:ss'),
          }).unwrap();
          shikshaMitraToast.success({ message: 'Shift added successfully.' });
        }
        handleClose();
      } catch (error) {
        console.error(error);
      }
    },
  });
  const steps = [
    {
      label: 'Shift Name',
      content: () => (
        <TextField
          fullWidth
          label="Shift Name"
          required
          name="name"
          value={formik.values.name}
          onChange={(e) => {
            const newName = capitalizeFirstLetter(e.target.value);
            formik.setFieldValue('name', newName);
          }}
          onBlur={formik.handleBlur}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
          size="small"
        />
      ),
    },
    {
      label: 'Shift Start Time',
      content: () => (
        <MobileTimePicker
          label="Start Time"
          value={formik.values.startTime}
          format="hh:mm A"
          onChange={(date) => formik.setFieldValue('startTime', date)}
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true,
              required: true,
              onBlur: () => formik.setFieldTouched('startTime', true),
              error: Boolean(formik.touched.startTime && formik.errors.startTime),
              helperText: formik.touched.startTime && formik.errors.startTime,
            },
          }}
        />
      ),
    },
    {
      label: 'Shift End Time',
      content: () => (
        <MobileTimePicker
          label="End Time"
          format="hh:mm A"
          value={formik.values.endTime}
          onChange={(date) => formik.setFieldValue('endTime', date)}
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true,
              required: true,
              onBlur: () => formik.setFieldTouched('endTime', true),
              error: Boolean(formik.touched.endTime && formik.errors.endTime),
              helperText: formik.touched.endTime && formik.errors.endTime,
            },
          }}
        />
      ),
    },
  ];
  const completedSteps = [
    Boolean(formik.values.name.trim()) && !formik.errors.name,
    Boolean(formik.values.startTime?.isValid()) && !formik.errors.startTime,
    Boolean(formik.values.endTime?.isValid()) && !formik.errors.endTime,
  ];

  return (
    <>
      <DialogScrollContent sx={{ pt: 2, pb: 2 }}>
        <Stepper
          orientation="vertical"
          activeStep={-1}
          sx={{
            '& .MuiStep-root': { pb: 1 },
            '& .MuiStepConnector-root': { display: 'none' },
            '& .MuiStepContent-root': { mt: 0.5, pb: 1, ml: 0, pl: 4, borderLeft: 0 },
          }}
        >
          {steps.map((step, index) => (
            <Step key={index} expanded completed={completedSteps[index]}>
              <StepLabel StepIconComponent={NumberStepIcon}>{step.label}</StepLabel>
              <StepContent>{step.content()}</StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <CancelButton onClick={handleClose} />
        <SubmitButton
          loading={isAddLoading || isUpdateLoading}
          onClick={() => formik.handleSubmit()}
        />
      </DialogActions>
    </>
  );
};
