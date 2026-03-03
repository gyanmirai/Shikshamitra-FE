import React from 'react';
import dayjs from 'dayjs';
import { Skeleton } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { useGetShiftsQuery } from 'src/redux/shiftManagement/shift-management-api';

const RenderShift = ({ formik, disabled }: any) => {
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetShiftsQuery,
  });

  const shiftValue = data?.items?.find((shift: any) => shift.id === formik.values.shift) || null;

  return (
    <ShakingTextField error={formik.touched.shift && Boolean(formik.errors.shift)}>
      {isLoading ? (
        <Skeleton variant="rounded" height={40} sx={{ width: '100%', minWidth: '200px' }} />
      ) : (
        <PaginatedSearchSelect
          label="Shift *"
          disabled={!!disabled}
          fetchOptions={async (searchQuery) => {
            const items = data?.items || [];
            const filtered = items.filter((item: any) =>
              item?.shiftName?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return {
              data: filtered.map((option: any) => {
                const startTime = dayjs(option.startTime, 'HH:mm:ss').format('hh:mm A');
                const endTime = dayjs(option.endTime, 'HH:mm:ss').format('hh:mm A');
                return {
                  label: `${option.shiftName} (${startTime}-${endTime})`,
                  id: option.id,
                };
              }),
              hasMore: false,
            };
          }}
          value={
            shiftValue
              ? {
                  label: `${shiftValue.shiftName} (${dayjs(shiftValue.startTime, 'HH:mm:ss').format('hh:mm A')}-${dayjs(shiftValue.endTime, 'HH:mm:ss').format('hh:mm A')})`,
                  id: shiftValue.id,
                }
              : null
          }
          isOptionEqualToValue={(option, value) => option.id === value?.id}
          getOptionLabel={(option: any) => option?.label || ''}
          renderOption={(props, option: any) => (
            <li {...props} key={option.id}>
              {option.label}
            </li>
          )}
          minChars={0}
          onChange={(_, value: any) => {
            formik.setFieldValue('shift', value?.id || null);
          }}
          error={formik.touched.shift && Boolean(formik.errors.shift)}
          helperText={formik.touched.shift && (formik.errors.shift as string)}
          size="small"
          noOptionsText="No results found"
          sx={{ width: '100%', minWidth: '200px' }}
        />
      )}
    </ShakingTextField>
  );
};

export default RenderShift;
