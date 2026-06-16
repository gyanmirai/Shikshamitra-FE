import type React from 'react';

import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Grid, Card, Stack, CardHeader, Typography } from '@mui/material';

import ClassDivisionFilter from './class-division-filter';

const renderInfoTooltip = (title: string, tooltipText: string) => (
  <Stack direction="row" alignItems="center" spacing={1}>
    <Box component="span">{title}</Box>
    <CustomTooltip title={tooltipText} arrow placement="top">
      <Iconify
        icon="eva:info-outline"
        width={18}
        sx={{ color: 'text.disabled', cursor: 'pointer' }}
      />
    </CustomTooltip>
  </Stack>
);

const EmptyChartCard = ({
  title,
  tooltip,
  action,
  emptyText,
}: {
  title: string;
  tooltip: string;
  action?: React.ReactNode;
  emptyText: string;
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          transition: 'all 0.3s ease-in-out',
        },
      }}
    >
      <CardHeader
        sx={{ ml: -1, mt: -1 }}
        title={renderInfoTooltip(title, tooltip)}
        action={action}
      />
      <Stack sx={{ p: 3, minHeight: 260, justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {emptyText}
        </Typography>
      </Stack>
    </Card>
  );
};

const PrincipalCharts = () => (
  <Grid container spacing={1}>
    <Grid size={{ xs: 12, md: 8 }}>
      <EmptyChartCard
        title="Monthly Attendance Trend"
        tooltip="Trend of attendance for the selected class and division."
        action={<ClassDivisionFilter />}
        emptyText="No monthly attendance trend found."
      />
    </Grid>

    <Grid size={{ xs: 12, md: 4 }}>
      <EmptyChartCard
        title="Performance Extremes"
        tooltip="Top and bottom performing classes based on assessment scores."
        emptyText="No class performance data found."
      />
    </Grid>

    <Grid size={{ xs: 12 }}>
      <EmptyChartCard
        title="Exam Pass/Fail Rate"
        tooltip="Student performance by exam for the selected class and division."
        action={<ClassDivisionFilter />}
        emptyText="No exam performance data found."
      />
    </Grid>
  </Grid>
);

export default PrincipalCharts;
