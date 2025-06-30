'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { capitalize } from 'lodash';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add, ArrowBack } from '@mui/icons-material';
import { MobileTimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Step,
  Paper,
  styled,
  Button,
  Stepper,
  StepLabel,
  TextField,
  Typography,
  StepContent,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetShiftsQuery,
  useAddShiftMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
} from 'src/redux/shiftManagement/shift-management-api';

import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import { shikshaMitraToast } from 'src/components/toast';
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
              shikshaMitraToast.success({ message: 'Shift deleted successfully' });

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
        links={[{ name: 'Institute Setup' }, { name: 'Shift Management' }]}
        sx={{ px: 1, mb: 2 }}
        isBack={open.value}
        onBack={() => {
          setEditData(null);
          open.onFalse();
        }}
        action={
          !open.value && (
            <Button
              startIcon={open.value ? <ArrowBack /> : <Add />}
              size="small"
              variant="contained"
              onClick={open.onToggle}
            >
              {open.value ? 'back' : 'Shift'}
            </Button>
          )
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

const CustomStepLabel = styled(StepLabel)(({ theme, error }) => ({
  '& .MuiStepLabel-iconContainer': {
    color: error ? theme.palette.error.main : theme.palette.primary.main,
  },
  '& .MuiStepLabel-label': {
    color: error ? theme.palette.error.main : theme.palette.text.primary,
    fontWeight: error ? 'bold' : 'normal',
  },
}));

const ShiftManageMentForm = ({ handleClose, editData }: any) => {
  console.log('🚀 ~ ShiftManageMentForm ~ editData:', editData);

  const [addShift, { isLaoding: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddShiftMutation,
  });

  const [updateShift, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateShiftMutation,
  });
  const formik = useFormik<{
    name: string;
    startTime: Dayjs | null;
    endTime: Dayjs | null;
  }>({
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
          shikshaMitraToast.success({ message: 'Shift updated successfully' });
        } else {
          await addShift({
            shiftName: values.name,
            startTime: values.startTime?.format('HH:mm:ss'),
            endTime: values.endTime?.format('HH:mm:ss'),
          }).unwrap();
          shikshaMitraToast.success({ message: 'Shift added successfully' });
        }
        handleClose();
      } catch (error) {
        console.log('🚀 ~ onSubmit:async ~ error:', error);
      }
    },
  });
  const steps = [
    {
      label: 'Shift Name',
      content: () => (
        <TextField
          label="Name"
          name="name"
          value={formik.values.name}
          onChange={(e) => {
            const newName = capitalize(e.target.value);
            formik.setFieldValue('name', newName);
          }}
          error={formik.touched.name && Boolean(formik.errors.name)}
          // helperText={formik.touched.name && formik.errors.name}
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

              // helperText: formik.touched.startTime && formik.errors.startTime,
              error: !!formik.errors.startTime && formik.touched.startTime,
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

              // helperText: formik.touched.endTime && formik.errors.endTime,
              error: !!formik.errors.endTime && formik.touched.endTime,
            },
          }}
        />
      ),
    },
  ];

  const validation = (index: number) => {
    if (index === 0 && formik.errors.name && formik.touched.name) {
      return {
        msg: formik.errors.name,
        value: true,
      };
    }
    if (index === 1 && formik.errors.startTime && formik.touched.startTime) {
      return {
        msg: formik.errors.startTime,
        value: true,
      };
    }
    if (index === 2 && formik.errors.endTime && formik.touched.endTime) {
      return {
        msg: formik.errors.endTime,
        value: true,
      };
    }
    return {
      msg: '',
      value: false,
    };
  };
  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      height="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Paper
        elevation={2}
        sx={{
          p: 2,
          // height: '100%',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Stepper orientation="vertical" sx={{ ' & .MuiStepConnector-line': { display: 'none' } }}>
          {steps.map((step, index) => (
            <Step key={index} expanded>
              <CustomStepLabel
                error={validation(index).value}
                sx={{ '& svg': { color: 'primary.main' } }}
              >
                {step.label}{' '}
                <small>{validation(index).value && `(${validation(index).msg})`}</small>
              </CustomStepLabel>
              <StepContent>
                <Typography>{step.content()}</Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        <Box display="flex" justifyContent="space-between">
          <CancelButton onClick={handleClose} />
          <SubmitButton loading={isAddLoading || isUpdateLoading} />
        </Box>
      </Paper>
    </Box>
  );
};
