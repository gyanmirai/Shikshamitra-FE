import type { RootState } from 'src/redux/store';

import React from 'react';
import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsive-multi-select';

import { ReportForm } from './ReportForm';
import { useReportOptions } from '../hooks/useReportOptions';

export default function ClassroomAvailabilityReport() {
  const { roomOptions } = useReportOptions();

  const formik = useFormik({
    initialValues: {
      rooms: [] as string[],
      date: null,
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      console.info('Generate Classroom Availability Report', values);
    },
  });

  const allRoomIds = roomOptions;
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  return (
    <ReportForm onSubmit={formik.handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.rooms && formik.errors.rooms)}>
            <ResponsiveMultiSelect
              label="Select Rooms"
              options={[
                { id: 'all', name: 'All' },
                ...roomOptions.map((r) => ({ id: r, name: r })),
              ]}
              value={formik.values.rooms}
              getOptionLabel={(opt) => opt?.name}
              getOptionValue={(opt) => opt?.id}
              onChange={(selectedValues) => {
                const hasAllInSelection = selectedValues.includes('all');
                const wasAllPreviouslySelected = formik.values.rooms.includes('all');
                let finalValues: string[] = [];

                if (hasAllInSelection && !wasAllPreviouslySelected) {
                  finalValues = ['all', ...allRoomIds];
                } else if (!hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = [];
                } else if (hasAllInSelection && wasAllPreviouslySelected) {
                  finalValues = selectedValues.filter((id) => id !== 'all');
                } else {
                  const selectedRealIds = selectedValues.filter((id) => id !== 'all');
                  if (
                    selectedRealIds.length === allRoomIds.length &&
                    allRoomIds.every((id) => selectedRealIds.includes(id))
                  ) {
                    finalValues = ['all', ...allRoomIds];
                  } else {
                    finalValues = selectedRealIds;
                  }
                }
                formik.setFieldValue('rooms', finalValues);
              }}
              error={!!formik.errors.rooms && !!formik.touched.rooms}
              helperText={(formik.touched.rooms && formik.errors.rooms) as string}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.date && formik.errors.date)}>
            <DatePicker
              label="Select Date"
              minDate={dayjs(currentYear?.startDate)}
              maxDate={dayjs(currentYear?.endDate)}
              value={formik.values.date}
              onChange={(newValue) => formik.setFieldValue('date', newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                },
              }}
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </ReportForm>
  );
}
