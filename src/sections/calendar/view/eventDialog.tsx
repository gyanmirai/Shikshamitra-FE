import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState, useEffect } from 'react';

import { TimePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, DialogActions } from '@mui/material';

// eslint-disable-next-line import/no-cycle
import { classRoomData } from 'src/screens/academic/timetable-schedule-management/new-timetable';

import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';

const validationSchema = Yup.object().shape({
  subject: Yup.string().required('Subject is required'),
  teacher: Yup.string().required('Teacher is required'),
  classRoom: Yup.string().required('Classroom is required'),
});

interface EventDialogProps {
  subjects: { id: string; name: string; color: string; teachers: string[] }[];
  teachers: { id: string; name: string }[];
  event?: {
    id: string;
    title: string;
    subjectId?: string;
    teacherId?: string;
    start?: string;
    end?: string;
    classRoomNumber?: string;
  } | null;
  onSave: (values: any) => void;
  onDelete?: () => void;
  isEdit?: boolean;
}

export const EventDialog: React.FC<EventDialogProps> = ({
  subjects,
  teachers,
  event,
  onSave,
  onDelete,
  isEdit,
}) => {
  const formik = useFormik({
    initialValues: {
      subject: event?.subjectId || '',
      teacher: event?.teacherId || '',
      classRoom: event?.classRoomNumber || '',
      start: event?.start ? dayjs(event.start) : null,
      end: event?.end ? dayjs(event.end) : null,
    },
    validationSchema,
    onSubmit: (values) => {
      onSave({
        ...values,
        id: event?.id || Date.now().toString(),
        start: values.start?.toISOString(),
        end: values.end?.toISOString(),
      });
    },
  });

  const [availableTeachers, setAvailableTeachers] = useState<any>([]);

  // Filter teachers based on selected subject
  useEffect(() => {
    if (formik.values.subject) {
      const selectedSubject = subjects.find((sub) => sub.id === formik.values.subject);
      const filteredTeachers = teachers.filter((teacher) =>
        selectedSubject?.teachers.includes(teacher.id)
      );
      setAvailableTeachers(filteredTeachers);

      // Reset teacher selection if current selection is not valid for new subject
      if (!filteredTeachers.find((t) => t.id === formik.values.teacher)) {
        formik.setFieldValue('teacher', '');
      }
    } else {
      setAvailableTeachers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.subject, subjects, teachers]);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '150px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <CustomSelect
                label="Subject"
                name="subject"
                options={subjects}
                valueKey="id"
                labelKey="name"
                value={formik.values.subject}
                onChange={(value) => {
                  formik.setFieldValue('subject', value);
                }}
                error={formik.touched.subject && Boolean(formik.errors.subject)}
                // helperText={formik.touched.subject && formik.errors.subject}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <CustomSelect
                label="Teacher"
                name="teacher"
                options={availableTeachers}
                valueKey="id"
                labelKey="name"
                value={formik.values.teacher}
                onChange={(value) => {
                  formik.setFieldValue('teacher', value);
                }}
                disabled={!formik.values.subject}
                error={formik.touched.teacher && Boolean(formik.errors.teacher)}
                // helperText={formik.touched.teacher && formik.errors.teacher}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <CustomSelect
                label="Classroom"
                name="classRoom"
                options={classRoomData}
                valueKey="name"
                labelKey="name"
                value={formik.values.classRoom}
                onChange={(value) => {
                  formik.setFieldValue('classRoom', value);
                }}
                error={formik.touched.classRoom && Boolean(formik.errors.classRoom)}
                // helperText={formik.touched.classRoom && formik.errors.classRoom}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TimePicker
                label="Start Time"
                format="HH:mm"
                name="start"
                value={formik.values.start}
                onChange={(newValue) => {
                  formik.setFieldValue('start', newValue);
                }}
                views={['hours', 'minutes']}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TimePicker
                label="End Time"
                format="HH:mm"
                name="end"
                value={formik.values.end}
                onChange={(newValue) => {
                  formik.setFieldValue('end', newValue);
                }}
                views={['hours', 'minutes']}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          {isEdit ? (
            <>
              <Button
                variant="contained"
                onClick={() => {
                  formik.handleSubmit();
                }}
              >
                Update
              </Button>
              {isEdit && onDelete && (
                <Button variant="outlined" color="error" onClick={onDelete}>
                  Delete
                </Button>
              )}
            </>
          ) : (
            <Button
              type="submit"
              variant="contained"
              onClick={() => {
                formik.handleSubmit();
              }}
            >
              Schedule Subject
            </Button>
          )}
        </DialogActions>
      </form>
    </Box>
  );
};
