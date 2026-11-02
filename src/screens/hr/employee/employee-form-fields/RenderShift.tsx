import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetWorkShiftOptionsQuery } from 'src/redux/hr/work-shifts-api';
import { Stack, Alert, Button , TextField, Autocomplete } from '@mui/material';

import {
  STALE_SHIFT_ERROR,
  isStaleSelectedShift,
  resolveSelectedShiftOption,
} from './employee-shift-utils';

const RenderShift = ({ formik, disabled }: any) => {
  const { data, isLoading, error, refetch } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetWorkShiftOptionsQuery,
  });

  useEffect(() => {
    if (!data?.today || formik.values.shiftEffectiveFrom) return;
    const joining = formik.values.dateOfJoining?.format?.('YYYY-MM-DD');
    formik.setFieldValue(
      'shiftEffectiveFrom',
      joining && joining > data.today ? joining : data.today,
      false
    );
  }, [data?.today, formik]);
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
    <Stack spacing={2}>
      {error && (
        <Alert severity="error" action={<Button onClick={() => refetch()}>Retry</Button>}>
          Could not load work shifts.
        </Alert>
      )}
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
              label="Work shift *"
              size="small"
              fullWidth
              sx={{
                width: '100%',
                minWidth: '200px',
                ...(formik?.errors?.shift?.length > 40
                  ? {
                      '& .MuiFormHelperText-root': {
                        bottom: '-30px',
                      },
                    }
                  : {}),
              }}
              error={formik.touched.shift && Boolean(formik.errors.shift)}
              helperText={formik.touched.shift && formik.errors.shift}
            />
          )}
          onChange={(e, value) => {
            formik.setFieldValue('shift', value?.id || '');
          }}
        />
      </ShakingTextField>
      <DatePicker
        label="Shift effective from"
        value={formik.values.shiftEffectiveFrom ? dayjs(formik.values.shiftEffectiveFrom) : null}
        minDate={dayjs(data?.today).startOf('day')}
        onChange={(value) =>
          formik.setFieldValue('shiftEffectiveFrom', value?.format('YYYY-MM-DD') || '')
        }
        slotProps={{
          textField: {
            size: 'small',
            required: true,
            helperText: 'Today or a future date, no earlier than joining.',
          },
        }}
      />
    </Stack>
  );
};

export default RenderShift;
