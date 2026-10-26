import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useAddShiftMutation,
  useUpdateShiftMutation,
} from 'src/redux/shiftManagement/shift-management-api';

export interface ShiftRecord {
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
}

export function useShiftForm(handleClose: () => void, editData: ShiftRecord | null) {
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
  return { formik, busy: isAddLoading || isUpdateLoading || formik.isSubmitting };
}
