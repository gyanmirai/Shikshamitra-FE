import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { SchoolShiftType } from 'src/enums/academic-calendar';
import { useAcademicDiscardGuard } from 'src/screens/academic/components/useAcademicDiscardGuard';
import {
  useGetWorkingHoursQuery,
  useCreateWorkingHourMutation,
  useUpdateWorkingHourMutation,
  useDeleteWorkingHourMutation,
} from 'src/redux/academicAPI/AcademicCalendarApi/academic-calendar-api';

import type { WorkingHour, WorkingHourRow, WorkingHourValues } from './working-hour-types';

export function useWorkingHourSettings(calendarId: string) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WorkingHour | null>(null);
  const [deletingHour, setDeletingHour] = useState<WorkingHour | null>(null);
  const medium = useSelector((state: RootState) => state.globalState.currentMedium) as
    Medium | undefined;
  const classes = medium?.educationMediumStages?.flatMap((stage) => stage.standards || []) || [];
  const { data, isLoading } = useGetWorkingHoursQuery(calendarId, { skip: !calendarId });
  const hours: WorkingHour[] = data?.items ?? data ?? [];
  const rows: WorkingHourRow[] = classes.map((cls) => ({
    id: cls.id,
    className: cls.name,
    shift: hours.find((hour) => hour.standardId === cls.id),
  }));
  const [create, { isLoading: creating }] = useCreateWorkingHourMutation();
  const [update, { isLoading: updating }] = useUpdateWorkingHourMutation();
  const [remove, { isLoading: deleting }] = useDeleteWorkingHourMutation();
  const busy = creating || updating;
  const initialValues: WorkingHourValues = {
    standardId: '',
    shiftType: SchoolShiftType.FullDay,
    startTime: '08:00',
    endTime: '14:30',
    recessStartTime: '',
    recessEndTime: '',
    isDefault: false,
  };
  const formik = useFormik<WorkingHourValues>({
    initialValues,
    validationSchema: Yup.object({
      standardId: Yup.string().required('Class is required'),
      shiftType: Yup.number().required('Shift type is required'),
      startTime: Yup.string().required('Start time is required'),
      endTime: Yup.string().required('End time is required'),
    }),
    onSubmit: async (values) => {
      if (busy) return;
      const time = (value: string) => (value.length === 5 ? `${value}:00` : value);
      const body = {
        ...values,
        startTime: time(values.startTime),
        endTime: time(values.endTime),
        recessStartTime: values.recessStartTime ? time(values.recessStartTime) : null,
        recessEndTime: values.recessEndTime ? time(values.recessEndTime) : null,
      };
      try {
        if (editing) await update({ id: editing.id, body }).unwrap();
        else await create({ calendarId, body }).unwrap();
        shikshaMitraToast.success({ message: 'Working hours saved' });
        setOpen(false);
        setEditing(null);
        formik.resetForm();
      } catch {
        shikshaMitraToast.error({ message: 'Failed to save working hours' });
      }
    },
  });
  const guard = useAcademicDiscardGuard(open && formik.dirty);
  const close = () => {
    if (busy) return;
    guard.requestNavigation(() => {
      setOpen(false);
      setEditing(null);
      formik.resetForm();
    });
  };
  const start = (hour: WorkingHour | null, standardId = '') => {
    setEditing(hour);
    formik.resetForm({
      values: hour
        ? {
            ...hour,
            startTime: hour.startTime.slice(0, 5),
            endTime: hour.endTime.slice(0, 5),
            recessStartTime: hour.recessStartTime?.slice(0, 5) || '',
            recessEndTime: hour.recessEndTime?.slice(0, 5) || '',
          }
        : { ...initialValues, standardId },
    });
    setOpen(true);
  };
  const confirmDelete = async () => {
    if (!deletingHour || deleting) return;
    try {
      await remove(deletingHour.id).unwrap();
      setDeletingHour(null);
      shikshaMitraToast.success({ message: 'Working hours deleted' });
    } catch {
      shikshaMitraToast.error({ message: 'Failed to delete working hours' });
    }
  };
  return {
    classes,
    rows,
    isLoading,
    formik,
    open,
    editing,
    busy,
    close,
    start,
    deleting,
    deletingHour,
    setDeletingHour,
    confirmDelete,
    confirmation: guard.confirmation,
  };
}
