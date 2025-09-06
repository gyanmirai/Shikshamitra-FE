'use client';

import type { Division, Standards } from 'src/types/school';

import React, { useState } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import { Box, Card, Grid, Typography } from '@mui/material';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const SubjectAnalytics = () => {
  const [classes3, setClasses3] = useState<string>('');

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
          <Typography variant="subtitle1">Subject Analytics</Typography>
        </Box>
        <Box display="flex" alignItems="center" sx={{ mt: 2, gap: 1 }}>
          <CustomSelect
            label="Class"
            name="className"
            options={classData?.items || []}
            labelKey="name"
            valueKey="id"
            value={classes3}
            onChange={(val) => {
              const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
              setClasses3(val as string);
              setDivisionOptions(selectedClass?.divisions || []);
            }}
            formControlProps={{ sx: { width: '100%', maxWidth: '150px' } }}
          />
        </Box>
        <AnalyticsWebsiteVisits
          title=""
          chart={{
            categories: ['Math', 'Sci', 'ENG', 'GUJ'],
            series: [
              { name: '9-A', data: [43, 33, 22, 37] },
              { name: '9-B', data: [51, 70, 47, 67] },
              { name: '9-C', data: [51, 67, 47, 97] },
            ],
            colors: [
              alpha(theme.vars.palette.primary.dark, 0.8),
              alpha(theme.vars.palette.warning.main, 0.8),
              alpha(theme.vars.palette.error.main, 0.8),
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

export default SubjectAnalytics;
