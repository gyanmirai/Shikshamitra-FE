'use client';

import React, { useState } from 'react';

import { color } from '@mui/system';
import Grid2 from '@mui/material/Unstable_Grid2';
import { Box, Card, useTheme, Typography } from '@mui/material';

import { CONFIG } from 'src/config-global';
import { varAlpha, bgGradient } from 'src/theme/styles';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { SvgColor } from 'src/components/svg-color';
import CustomSelect from 'src/components/custom-select';

const StudentPerformance = () => {
  const theme = useTheme();
  const [classes1, setClasses1] = useState<string>('All');
  const [classes2, setClasses2] = useState<string>('All');

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const classOptions = React.useMemo(() => {
    const allOption = { name: 'All', value: 'all' };
    return [allOption, ...(classData?.items || [])];
  }, [classData]);

  return (
    <Grid2 container spacing={2} mt={2}>
      <Grid2 xs={12} md={4}>
        <Card
          sx={{
            ...bgGradient({
              color: `135deg, ${varAlpha(theme.vars.palette.secondary.lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette.secondary.lightChannel, 0.48)}`,
            }),
            p: 3,
            boxShadow: 'none',
            position: 'relative',
            color: `${color}.darker`,
            backgroundColor: 'common.white',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: 'var(--shadows-8)',
              scale: 1.03,
            },
            cursor: 'pointer',
            height: '100%',
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography component="span" sx={{ fontSize: '18px', fontWeight: '600' }} gutterBottom>
              Total Courses
            </Typography>
            <CustomSelect
              label="Class"
              name="className"
              options={classOptions}
              labelKey="name"
              valueKey="name"
              value={classes1}
              onChange={(value) => setClasses1(value as string)}
              formControlProps={{ sx: { minWidth: 120 } }}
            />
          </Box>
          <Box display="flex" alignItems="flex-start" mt={2}>
            <Typography variant="h4" gutterBottom>
              56
            </Typography>
          </Box>

          <SvgColor
            src={`${CONFIG.site.basePath}/assets/background/shape-square.svg`}
            sx={{
              top: 0,
              left: -20,
              width: 240,
              zIndex: -1,
              height: 240,
              opacity: 0.24,
              position: 'absolute',
              color: `${color}.main`,
            }}
          />
        </Card>
      </Grid2>
      <Grid2 xs={12} md={4}>
        <Card
          sx={{
            ...bgGradient({
              color: `135deg, ${varAlpha(theme.vars.palette.primary.lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette.primary.lightChannel, 0.48)}`,
            }),
            p: 3,
            boxShadow: 'none',
            position: 'relative',
            color: `${color}.darker`,
            backgroundColor: 'common.white',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: 'var(--shadows-8)',
              scale: 1.03,
            },
            cursor: 'pointer',
            height: '100%',
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography component="span" sx={{ fontSize: '18px', fontWeight: '600' }} gutterBottom>
              Total Chapters
            </Typography>
            <CustomSelect
              label="Class"
              name="className"
              options={classOptions}
              labelKey="name"
              valueKey="name"
              value={classes2}
              onChange={(value) => setClasses2(value as string)}
              formControlProps={{ sx: { minWidth: 120 } }}
            />
          </Box>
          <Box display="flex" alignItems="flex-start" mt={2}>
            <Typography variant="h4" gutterBottom>
              30
            </Typography>
          </Box>

          <SvgColor
            src={`${CONFIG.site.basePath}/assets/background/shape-square.svg`}
            sx={{
              top: 0,
              left: -20,
              width: 240,
              zIndex: -1,
              height: 240,
              opacity: 0.24,
              position: 'absolute',
              color: `${color}.main`,
            }}
          />
        </Card>
      </Grid2>
      <Grid2 xs={12} md={4}>
        <Card
          sx={{
            ...bgGradient({
              color: `135deg, ${varAlpha(theme.vars.palette.warning.lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette.warning.lightChannel, 0.48)}`,
            }),
            p: 3,
            boxShadow: 'none',
            position: 'relative',
            color: `${color}.darker`,
            backgroundColor: 'common.white',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: 'var(--shadows-8)',
              scale: 1.03,
            },
            cursor: 'pointer',
            height: '100%',
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography component="span" sx={{ fontSize: '18px', fontWeight: '600' }} gutterBottom>
              Total Learning Resources
            </Typography>
            <CustomSelect
              label="Class"
              name="className"
              options={classOptions}
              labelKey="name"
              valueKey="name"
              value={classes2}
              onChange={(value) => setClasses2(value as string)}
              formControlProps={{ sx: { minWidth: 120 } }}
            />
          </Box>
          <Box display="flex" alignItems="flex-start" mt={2}>
            <Typography variant="h4" gutterBottom>
              45
            </Typography>
          </Box>

          <SvgColor
            src={`${CONFIG.site.basePath}/assets/background/shape-square.svg`}
            sx={{
              top: 0,
              left: -20,
              width: 240,
              zIndex: -1,
              height: 240,
              opacity: 0.24,
              position: 'absolute',
              color: `${color}.main`,
            }}
          />
        </Card>
      </Grid2>
    </Grid2>
  );
};

export default StudentPerformance;
