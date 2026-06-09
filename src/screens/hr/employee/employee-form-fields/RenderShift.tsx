import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { TextField, Autocomplete } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetShiftsQuery } from 'src/redux/shiftManagement/shift-management-api';

import {
  STALE_SHIFT_ERROR,
  isStaleSelectedShift,
  resolveSelectedShiftOption,
} from './employee-shift-utils';

const RenderShift = ({ formik, disabled }: any) => {
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetShiftsQuery,
  });

  const shiftOptions = data?.items || [];
  const shiftValue = resolveSelectedShiftOption(shiftOptions, formik.values.shift);
  const staleShift = isStaleSelectedShift(shiftOptions, formik.values.shift, isLoading);

  useEffect(() => {
    if (!staleShift) return;
    formik.setFieldValue('shift', '', false);
    formik.setFieldTouched('shift', true, false);
    formik.setFieldError('shift', STALE_SHIFT_ERROR);
  }, [formik, staleShift]);

  return (
    <ShakingTextField error={formik.touched.shift && Boolean(formik.errors.shift)}>
      <Autocomplete
        disabled={isLoading || !!disabled}
        options={shiftOptions}
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
            size="small"
            fullWidth
            sx={{ width: '100%', minWidth: '200px' }}
            error={formik.touched.shift && Boolean(formik.errors.shift)}
            helperText={formik.touched.shift && formik.errors.shift}
          />
        )}
        onChange={(e, value) => {
          formik.setFieldValue('shift', value?.id || '');
        }}
      />
    </ShakingTextField>
  );
};

export default RenderShift;
