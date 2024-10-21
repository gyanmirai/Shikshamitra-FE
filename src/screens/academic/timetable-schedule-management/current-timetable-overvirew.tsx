import React, { useState } from 'react';

import { Box } from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';

import { SchoolTimetableCalendar } from 'src/sections/calendar/view';

const CurrentTimetableOverview = () => {
  const [classes, setClasses] = useState<string>('');

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end">
        <CustomSelect
          label="class"
          options={classData?.items || []}
          value={classes}
          isLoading={isLoading}
          labelKey="name"
          valueKey="id"
          onChange={(val) => {
            setClasses(val as string);
          }}
          formControlProps={{ sx: { maxWidth: '300px', width: '100%' } }}
        />
      </Box>
      {/* <CustomizableTable
        columns={[
          {
            label: 'days of the week',
            id: 'daysOfTheWeek',
          },
          {
            label: 'Period 1',
            id: 'period1',
            render(value, row) {
              return (
                <>
                  <Label
                    color={
                      value === 'Math'
                        ? 'success'
                        : value === 'Science'
                          ? 'primary'
                          : value === 'English'
                            ? 'error'
                            : value === 'History'
                              ? 'secondary'
                              : value === 'Geography'
                                ? 'info'
                                : 'default'
                    }
                  >
                    {value}
                  </Label>
                  <Typography variant="subtitle2" sx={{ opacity: 0.84 }}>
                    Mr.Smith
                  </Typography>
                </>
              );
            },
          },
          {
            label: 'Period 2',
            id: 'period2',
            render(value, row) {
              return (
                <>
                  <Label
                    color={
                      value === 'Math'
                        ? 'success'
                        : value === 'Science'
                          ? 'primary'
                          : value === 'English'
                            ? 'error'
                            : value === 'History'
                              ? 'secondary'
                              : value === 'Geography'
                                ? 'info'
                                : 'default'
                    }
                  >
                    {value}
                  </Label>
                  <Typography variant="subtitle2" sx={{ opacity: 0.84 }}>
                    Mr.Smith
                  </Typography>
                </>
              );
            },
          },
          {
            label: 'Period 3',
            id: 'period3',
            render(value, row) {
              return (
                <>
                  <Label
                    color={
                      value === 'Math'
                        ? 'success'
                        : value === 'Science'
                          ? 'primary'
                          : value === 'English'
                            ? 'error'
                            : value === 'History'
                              ? 'secondary'
                              : value === 'Geography'
                                ? 'info'
                                : 'default'
                    }
                  >
                    {value}
                  </Label>
                  <Typography variant="subtitle2" sx={{ opacity: 0.84 }}>
                    Mr.Smith
                  </Typography>
                </>
              );
            },
          },
          {
            label: 'Period 4',
            id: 'period4',
            render(value, row) {
              return (
                <>
                  <Label
                    color={
                      value === 'Math'
                        ? 'success'
                        : value === 'Science'
                          ? 'primary'
                          : value === 'English'
                            ? 'error'
                            : value === 'History'
                              ? 'secondary'
                              : value === 'Geography'
                                ? 'info'
                                : 'default'
                    }
                  >
                    {value}
                  </Label>
                  <Typography variant="subtitle2" sx={{ opacity: 0.84 }}>
                    Mr.Smith
                  </Typography>
                </>
              );
            },
          },
        ]}
        data={[
          {
            daysOfTheWeek: 'Monday',
            period1: 'Math',
            period2: 'English',
            period3: 'Science',
            period4: 'History',
          },
          {
            daysOfTheWeek: 'Tuesday',
            period1: 'Geography',
            period2: 'Math',
            period3: 'English',
            period4: 'Physical Education',
          },
          {
            daysOfTheWeek: 'Wednesday',
            period1: 'Science',
            period2: 'History',
            period3: 'Math',
            period4: 'English',
          },
          {
            daysOfTheWeek: 'Thursday',
            period1: 'Physical Education',
            period2: 'Geography',
            period3: 'Science',
            period4: 'Math',
          },
          {
            daysOfTheWeek: 'Friday',
            period1: 'History',
            period2: 'Math',
            period3: 'English',
            period4: 'Science',
          },
        ]}
      /> */}
      <SchoolTimetableCalendar />
    </Box>
  );
};

export default CurrentTimetableOverview;
