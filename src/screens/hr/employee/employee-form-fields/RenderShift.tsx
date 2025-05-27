import React from 'react';
import dayjs from 'dayjs';

import { TextField, Autocomplete } from '@mui/material';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetShiftsQuery } from 'src/redux/shiftManagement/shift-management-api';

import ShakingTextField from 'src/components/shaking-text-field';

const RenderShift = ({ formik, disabled }: any) => {
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetShiftsQuery,
  });

  const shiftValue = data?.items?.find((shift: any) => shift.id === formik.values.shift) || null;

  return (
    <ShakingTextField error={formik.touched.shift && Boolean(formik.errors.shift)}>
      <Autocomplete
        disabled={isLoading || !!disabled}
        options={data?.items || []}
        value={shiftValue}
        getOptionLabel={(option: any) => {
          const startTime = dayjs(option.startTime, 'HH:mm:ss').format('hh:mm A');
          const endTime = dayjs(option.endTime, 'HH:mm:ss').format('hh:mm A');
          return `${option.shiftName} (${startTime}-${endTime})`;
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Shift *"
            placeholder="Search Shift *"
            size="small"
            fullWidth
            sx={{ width: '100%', minWidth: '200px' }}
            error={formik.touched.shift && Boolean(formik.errors.shift)}
            helperText={formik.touched.shift && formik.errors.shift}
          />
        )}
        onChange={(e, value) => {
          formik.setFieldValue('shift', value?.id);
        }}
      />
    </ShakingTextField>
  );
};

export default RenderShift;
