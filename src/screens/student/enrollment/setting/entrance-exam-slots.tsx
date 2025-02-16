import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { MobileTimePicker } from '@mui/x-date-pickers';
import { Box, Stack, Button, TextField, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

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
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const EntranceExamSlots = () => {
  const dialog = useBoolean();
  const confirm = useBoolean();
  const [editData, setEditData] = useState<any>(null);

  const { data: slots, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEntranceExamSlotQuery,
  });

  const [deleteSlot, { isLoading: isDeleteSlotLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteEntranceExamSlotMutation,
  });

  const tableData = slots?.items?.map((item: any) => ({
    ...item,
    startTime: dayjs(item.startDate).format('hh:mm A'),
    endTime: dayjs(item.endDate).format('hh:mm A'),
  }));

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
        content="Are you sure want to delete?"
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
            Delete
          </LoadingButton>
        }
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button variant="contained" startIcon={<Add />} onClick={dialog.onTrue}>
          Slot
        </Button>
      </Box>
      <CustomizableTable
        isLoading={isLoading}
        tableId="entrance-exam-slots"
        columns={[
          { label: 'Start Time', id: 'startTime' },
          { label: 'End Time', id: 'endTime' },
          { label: 'Student Limit', id: 'studentLimit' },
          { label: 'Room No', id: 'roomNo' },

          {
            label: 'Action',
            id: 'action',
            render(value, row) {
              return (
                <ThreeDotsActions
                  showDeleteIcon
                  showEditIcon
                  showThreeDots={false}
                  handleDeleteClick={() => {
                    setEditData(row as any);
                    confirm.onTrue();
                  }}
                  handleEditClick={() => {
                    dialog.onTrue();
                    setEditData(row as any);
                  }}
                />
              );
            },
          },
        ]}
        data={tableData || []}
      />

      <CustomDialog title="Slots" open={dialog.value} handleClose={handleClose}>
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
  editData: any;
}) => {
  const [addSlot, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddEntranceExamSlotMutation,
  });
  const [updateSlot, { isLoading: isUpdateSlotLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEntranceExamSlotMutation,
  });

  const formik = useFormik({
    initialValues: {
      startTime: editData?.startDate ? dayjs(editData?.startDate) : null,
      endTime: editData?.endDate ? dayjs(editData?.endDate) : null,
      studentLimit: editData?.studentLimit || null,
      roomNo: editData?.roomNo || null,
    },
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
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
      studentLimit: Yup.number().min(1, 'Student Limit must be greater than 0'),
      roomNo: Yup.string().required('Room No is required'),
    }),
    onSubmit: async (values, formikHelpers) => {
      try {
        if (editData) {
          await updateSlot({
            id: editData.id,
            body: {
              startDate: dateConvertor(dayjs(values.startTime, 'hh:mm A').format(dateFormat)),
              endDate: dateConvertor(dayjs(values.endTime, 'hh:mm A').format(dateFormat)),
              studentLimit: values.studentLimit,
              roomNo: values.roomNo,
            },
          }).unwrap();
        } else {
          await addSlot({
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
  console.log(formik);
  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
        <Stack spacing={2}>
          <MobileTimePicker
            label="Start Time"
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
          <MobileTimePicker
            label="End Time"
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

          <TextField
            name="studentLimit"
            label="Student Limit"
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
          <TextField
            name="roomNo"
            label="Room No"
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
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton loading={isLoading || isUpdateSlotLoading} type="submit" variant="contained">
          Save
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};
