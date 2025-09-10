'use client';

import type { Division, Standards } from 'src/types/school';

import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import { Box, Card, Grid, Typography } from '@mui/material';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { PerformanceOverTime } from '../progress-report';

const ClassPerformance = () => {
  const [classes1, setClasses1] = useState<string>('');
  const [division1, setDivision1] = useState<string>('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const theme = useTheme();
  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1">Class Performance</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
          <CustomSelect
            label="Class"
            name="className"
            options={classData?.items || []}
            labelKey="name"
            valueKey="id"
            value={classes1}
            onChange={(val) => {
              const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
              setClasses1(val as string);
              setDivisionOptions(selectedClass?.divisions || []);
            }}
            formControlProps={{ sx: { width: '100%', maxWidth: '150px' } }}
          />
          <CustomSelect
            label="Division"
            disabled={!classes1}
            labelKey="name"
            valueKey="id"
            options={divisionOptions}
            value={division1}
            onChange={(val) => {
              const selectedDivision = divisionOptions.find((i: Division) =>
                (val as string).includes(i.id)
              );
              setDivision1(val as string);
            }}
            formControlProps={{ sx: { width: '100%', maxWidth: '150px' } }}
          />
        </Box>
        <PerformanceOverTime
          chart={{
            categories: [
              'Jan',
              'Feb',
              'Mar',
              'Apr',
              'May',
              'Jun',
              'Jul',
              'Aug',
              'Sep',
              'Oct',
              'Nov',
              'Dec',
            ],
            series: [{ name: '', data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49] }],
            options: {
              chart: {
                toolbar: {
                  show: true,
                  offsetX: 0,
                  offsetY: 0,
                  tools: {
                    download: true,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    customIcons: [],
                  },
                },
              },
            },
          }}
          sx={{ height: '100%', boxShadow: 'none' }}
        />
      </Card>
    </Grid>
  );
};

export default ClassPerformance;
