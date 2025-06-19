import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { MobileTimePicker } from '@mui/x-date-pickers';
import { Box, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetEntranceExamSlotQuery,
  useAddEntranceExamSlotMutation,
  useUpdateEntranceExamSlotMutation,
  useDeleteEntranceExamSlotMutation,
} from 'src/redux/student/entrance-exam-slot/entrance-exam-slot-api';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import SubmitButton from 'src/components/submit-button';
import { Iconify } from 'src/components/iconify/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';

import type { ISlot } from './type';

const EntranceExamSlots = () => {
  // Dialog state for opening/closing modal
  const dialog = useBoolean();
  // Dialog state for confirmation modal
  const confirm = useBoolean();
  // State to store data being edited
  const [editData, setEditData] = useState<ISlot | null>(null);

  // Fetch entrance exam slots data
  const { data: slots, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEntranceExamSlotQuery,
  });

  // Delete slot mutation hook
  const [deleteSlot, { isLoading: isDeleteSlotLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteEntranceExamSlotMutation,
  });

  // Transform slots data to include formatted time strings
  const tableData = slots?.items?.map((item: ISlot) => ({
    ...item,
    startTime: dayjs(item.startDate).format('hh:mm A'),
    endTime: dayjs(item.endDate).format('hh:mm A'),
  }));

  // Handle closing of dialog and reset edit data
  const handleClose = () => {
    dialog.onFalse();
    setEditData(null);
  };
  return (
    <Box>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
          setEditData(null);
        }}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <LoadingButton
            loading={isDeleteSlotLoading}
            variant="contained"
            color="error"
            onClick={async () => {
              await deleteSlot(editData?.id);
              confirm.onFalse();
              setEditData(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />

      <CustomizableTable
        isLoading={isLoading}
        tableId="entrance-exam-slots"
        noDataText={
          <>
            No Entrance Exam Slots Data Found{' '}
            <Box
              onClick={() => {
                dialog.onTrue();
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
              Add Slot
            </Box>
          </>
        }
        columns={[
          { label: 'Slot Name', id: 'slotName' },
          { label: 'Start Time', id: 'startTime', filterType: 'date' },
          { label: 'End Time', id: 'endTime', filterType: 'date' },
          { label: 'Student Limit', id: 'studentLimit', filterType: 'number' },
          { label: 'Room No', id: 'roomNo', filterType: 'number' },
          {
            label: 'Action',
            id: 'action',
            isSort: false,
            minWidth: 50,
            sticky: true,
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  showDeleteIcon
                  showEditIcon
                  showThreeDots={false}
                  handleDeleteClick={() => {
                    setEditData(row as ISlot);
                    confirm.onTrue();
                  }}
                  handleEditClick={() => {
                    dialog.onTrue();
                    setEditData(row as ISlot);
                  }}
                />
              );
            },
          },
        ]}
        data={tableData || []}
      />
      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Slots</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="This is the Exam Slots section, where you can create slots for the entrance exam by configuring the student limit, room number, and other necessary parameters."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={dialog.value}
        handleClose={handleClose}
      >
        <SlotsForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};

export default EntranceExamSlots;

export const SlotsForm = ({
  handleClose,
  editData,
}: {
  handleClose?: () => void;
  editData: ISlot | null;
}) => {
  // Hook for adding a new entrance exam slot
  const [addSlot, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddEntranceExamSlotMutation,
  });

  // Hook for updating an existing entrance exam slot
  const [updateSlot, { isLoading: isUpdateSlotLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEntranceExamSlotMutation,
  });
  const formik = useFormik({
    initialValues: {
      slotName: editData?.slotName || null,
      startTime: editData?.startDate ? dayjs(editData?.startDate) : null,
      endTime: editData?.endDate ? dayjs(editData?.endDate) : null,
      studentLimit: editData?.studentLimit || null,
      roomNo: editData?.roomNo || null,
    },
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      slotName: Yup.string().required('Slot Name is required'),
      startTime: Yup.date()
        .test('startTime', 'Start time must be before end time', (value, context) => {
          if (context.parent.endTime && dayjs(context.parent.endTime).isBefore(dayjs(value))) {
            return false;
          }
          return true;
        })
        .required('Start Time is required'),
      endTime: Yup.date()
        .test('endtime', 'End time must be after start time', (value, context) => {
          if (dayjs(context.parent.startTime).isAfter(dayjs(value))) {
            return false;
          }
          return true;
        })
        .required('End Time is required'),
      studentLimit: Yup.number()
        .min(1, 'Student Limit must be greater than 0')
        .required('Student Limit is required'),
      roomNo: Yup.string().required('Room No is required'),
    }),
    onSubmit: async (values, formikHelpers) => {
      try {
        if (editData) {
          await updateSlot({
            id: editData.id,
            body: {
              slotName: values.slotName,
              startDate: dateConvertor(dayjs(values.startTime, 'hh:mm A').format(dateFormat)),
              endDate: dateConvertor(dayjs(values.endTime, 'hh:mm A').format(dateFormat)),
              studentLimit: values.studentLimit,
              roomNo: values.roomNo,
            },
          }).unwrap();
        } else {
          await addSlot({
            slotName: values.slotName,
            startDate: dateConvertor(dayjs(values.startTime, 'hh:mm A').format(dateFormat)),
            endDate: dateConvertor(dayjs(values.endTime, 'hh:mm A').format(dateFormat)),
            studentLimit: values.studentLimit,
            roomNo: values.roomNo,
          }).unwrap();
        }
        handleClose?.();
      } catch (error) {
        console.log(error);
      }
    },
  });
  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
        <Stack spacing={3}>
          <ShakingTextField error={!!(formik.touched.slotName && formik.errors.slotName) || false}>
            <TextField
              name="slotName"
              label="Slot Name *"
              value={formik.values.slotName}
              onChange={(e) => formik.setFieldValue('slotName', e.target.value)}
              onBlur={formik.handleBlur}
              size="small"
              fullWidth
              error={formik.touched.slotName && Boolean(formik.errors.slotName)}
              helperText={
                formik.touched.slotName && formik.errors.slotName
                  ? String(formik.errors.slotName)
                  : ''
              }
            />
          </ShakingTextField>

          <ShakingTextField
            error={!!(formik.touched.startTime && formik.errors.startTime) || false}
          >
            <MobileTimePicker
              label="Start Time *"
              value={formik.values.startTime}
              format="hh:mm A"
              onChange={(date) => formik.setFieldValue('startTime', date)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  name: 'startTime',
                  helperText:
                    formik.touched.startTime && formik.errors.startTime
                      ? String(formik.errors.startTime)
                      : undefined,
                  error: !!formik.errors.startTime && formik.touched.startTime,
                },
              }}
            />
          </ShakingTextField>

          <ShakingTextField error={!!(formik.touched.endTime && formik.errors.endTime) || false}>
            <MobileTimePicker
              label="End Time *"
              format="hh:mm A"
              value={formik.values.endTime}
              onChange={(date) => formik.setFieldValue('endTime', date)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  name: 'endTime',
                  helperText:
                    formik.touched.endTime && formik.errors.endTime
                      ? String(formik.errors.endTime)
                      : undefined,
                  error: !!formik.errors.endTime && formik.touched.endTime,
                },
              }}
            />
          </ShakingTextField>

          <ShakingTextField
            error={!!(formik.touched.studentLimit && formik.errors.studentLimit) || false}
          >
            <TextField
              name="studentLimit"
              label="Student Limit *"
              type="number"
              value={formik.values.studentLimit}
              onChange={(e) => formik.setFieldValue('studentLimit', e.target.value)}
              onBlur={formik.handleBlur}
              size="small"
              fullWidth
              helperText={
                formik.touched.studentLimit && formik.errors.studentLimit
                  ? String(formik.errors.studentLimit)
                  : ''
              }
              error={formik.touched.studentLimit && Boolean(formik.errors.studentLimit)}
            />
          </ShakingTextField>

          <ShakingTextField error={!!(formik.touched.roomNo && formik.errors.roomNo) || false}>
            <TextField
              name="roomNo"
              label="Room No *"
              type="number"
              onBlur={formik.handleBlur}
              value={formik.values.roomNo}
              onChange={(e) => formik.setFieldValue('roomNo', e.target.value)}
              size="small"
              fullWidth
              helperText={
                formik.touched.roomNo && formik.errors.roomNo ? String(formik.errors.roomNo) : ''
              }
              error={formik.touched.roomNo && !!formik.errors.roomNo}
            />
          </ShakingTextField>
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
          onClick={handleClose}
          size="small"
        >
          Cancel
        </Button>
        <SubmitButton loading={isLoading || isUpdateSlotLoading} />
      </DialogActions>
    </Box>
  );
};
