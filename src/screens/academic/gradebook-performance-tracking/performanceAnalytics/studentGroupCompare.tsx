'use client';

import type { Division, Standards } from 'src/types/school';

import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import { Box, Card, Grid, Typography } from '@mui/material';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

const StudentGroupCompare = () => {
  const [classes4, setClasses4] = useState<string>('');
  const [division4, setDivision4] = useState<string>('');

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
          <Typography variant="subtitle1">Student Group Comparisons</Typography>
        </Box>
        <Box display="flex" alignItems="center" sx={{ mt: 2, gap: 1 }}>
          <CustomSelect
            label="Class"
            name="className"
            options={classData?.items || []}
            labelKey="name"
            valueKey="id"
            value={classes4}
            onChange={(val) => {
              const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
              setClasses4(val as string);
              setDivisionOptions(selectedClass?.divisions || []);
            }}
            formControlProps={{ sx: { width: '100%', maxWidth: '150px' } }}
          />
          <CustomSelect
            label="Division"
            disabled={!classes4}
            labelKey="name"
            valueKey="id"
            options={divisionOptions}
            value={division4}
            onChange={(val) => setDivision4(val as string)}
            formControlProps={{ sx: { width: '100%', maxWidth: '150px' } }}
          />
          <CustomSelect
            label="Subject"
            options={[
              { value: 'Math', label: 'Math' },
              { value: 'Science', label: 'Science' },
            ]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { width: '100%', maxWidth: '150px' } }}
          />
        </Box>
        <AnalyticsCurrentVisits
          title=""
          chart={{
            series: [
              { label: 'Top 10%', value: 44 },
              { label: 'Middle 10%', value: 55 },
              { label: 'Bottom 10%', value: 41 },
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

export default StudentGroupCompare;
