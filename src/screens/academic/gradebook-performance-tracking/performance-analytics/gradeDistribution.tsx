'use client';

import type { Division, Standards } from 'src/types/school';

import React, { useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import { Box, Card, Grid, Typography } from '@mui/material';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { GradeDistribution } from '../performance-analytics';

const GradeDistributionChart = () => {
  const [classes2, setClasses2] = useState<string>('');
  const [division2, setDivision2] = useState<string>('');

  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  const { data: classData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1">Grade Distribution</Typography>
        </Box>
        <Box display="flex" alignItems="center" sx={{ mt: 2, gap: 1 }}>
          <CustomSelect
            label="Class"
            name="className"
            options={classData?.items || []}
            labelKey="name"
            valueKey="id"
            value={classes2}
            onChange={(val) => {
              const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
              setClasses2(val as string);
              setDivisionOptions(selectedClass?.divisions || []);
            }}
            formControlProps={{ sx: { width: '100%', maxWidth: '150px' } }}
          />
          <CustomSelect
            label="Division"
            disabled={!classes2}
            labelKey="name"
            valueKey="id"
            options={divisionOptions}
            value={division2}
            onChange={(val) => setDivision2(val as string)}
            formControlProps={{ sx: { width: '100%', maxWidth: '150px' } }}
          />
          <CustomSelect
            label="Subject"
            options={[
              { value: 'math', label: 'Math' },
              { value: 'science', label: 'Science' },
            ]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { width: '100%', maxWidth: '150px' } }}
          />
        </Box>
        <GradeDistribution
          title=""
          subheader=""
          selectSeries=""
          chart={{
            categories: ['A', 'B', 'C', 'D'],
            series: [
              { name: 'Quiz Grade', data: [12, 10, 18, 22] },
              { name: 'Other Grade', data: [12, 10, 18, 22] },
            ],
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

export default GradeDistributionChart;
