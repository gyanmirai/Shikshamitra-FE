// @ts-nocheck

'use client';

import type { CardProps } from '@mui/material';
import type { ColorType } from 'src/theme/core/palette';
import type { ChartOptions } from 'src/components/chart';

import React from 'react';
import dayjs from 'dayjs';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Card, useTheme } from '@mui/material';

import { fPercent, fShortenNumber } from 'src/utils/format-number';

import { CONFIG } from 'src/config-global';
import { varAlpha, bgGradient } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';
import { Chart, useChart } from 'src/components/chart';

const Overview = () => (
  <Box>
    <DatePicker
      label="Year"
      value={dayjs(new Date())}
      // onChange={(value) => formik.setFieldValue('dob', value)}
      views={['year']}
      slotProps={{
        textField: {
          // fullWidth: true,
        },
      }}
    />
    <Box display="flex" flexWrap="wrap" width="100%" gap={2} mt={2}>
      <Box>
        <AnalyticsWidgetSummary
          title="Total Students"
          percent={2.6}
          total={714000}
          icon={
            <img alt="icon" src={`${CONFIG.site.basePath}/assets/icons/glass/ic-glass-bag.svg`} />
          }
          chart={{
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
            series: [22, 8, 35, 50, 82, 84, 77, 12],
          }}
          sx={{ maxWidth: '320px', width: '100%' }}
        />
      </Box>
      <Box>
        <AnalyticsWidgetSummary
          title="Total Male Students"
          percent={2.6}
          total={714000}
          color="warning"
          icon={
            <img alt="icon" src={`${CONFIG.site.basePath}/assets/icons/glass/ic-glass-bag.svg`} />
          }
          chart={{
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
            series: [22, 8, 35, 50, 82, 84, 77, 12],
          }}
          sx={{ maxWidth: '320px', width: '100%' }}
        />
      </Box>
      <Box>
        <AnalyticsWidgetSummary
          title="Total Female Students"
          percent={2.6}
          total={714000}
          color="error"
          icon={
            <img alt="icon" src={`${CONFIG.site.basePath}/assets/icons/glass/ic-glass-bag.svg`} />
          }
          chart={{
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
            series: [22, 8, 35, 50, 82, 84, 77, 12],
          }}
          sx={{ maxWidth: '320px', width: '100%' }}
        />
      </Box>
    </Box>
  </Box>
);

export default Overview;
type Props = CardProps & {
  title: string;
  total: number;
  percent?: number;
  color?: ColorType;
  icon: React.ReactNode;
  chart: {
    series: number[];
    categories: string[];
    options?: ChartOptions;
  };
};
function AnalyticsWidgetSummary({
  icon,
  title,
  total,
  chart,
  percent,
  color = 'success',
  sx,
  ...other
}: Props) {
  const theme: any = useTheme();

  const chartColors = [theme.palette[color].dark];

  const chartOptions: any = useChart({
    chart: { sparkline: { enabled: true } },
    colors: chartColors,
    xaxis: { categories: chart.categories },
    grid: {
      padding: {
        top: 6,
        left: 6,
        right: 6,
        bottom: 6,
      },
    },
    tooltip: {
      y: { formatter: (value) => value, title: { formatter: () => '' } },
    },
    ...chart.options,
  });

  const renderTrending = (
    <Box
      sx={{
        top: 16,
        gap: 0.5,
        right: 16,
        display: 'flex',
        position: 'absolute',
        alignItems: 'center',
      }}
    >
      {percent && (
        <Iconify
          width={20}
          icon={percent < 0 ? 'eva:trending-down-fill' : 'eva:trending-up-fill'}
        />
      )}
      {percent && (
        <Box component="span" sx={{ typography: 'subtitle2' }}>
          {percent > 0 && '+'}
          {fPercent(percent)}
        </Box>
      )}
    </Box>
  );

  return (
    <Card
      sx={{
        ...bgGradient({
          color: `135deg, ${varAlpha(theme.vars.palette[color].lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette[color].lightChannel, 0.48)}`,
        }),
        p: 3,
        boxShadow: 'none',
        position: 'relative',
        color: `${color}.darker`,
        backgroundColor: 'common.white',
        ...sx,
      }}
      {...other}
    >
      <Box sx={{ width: 48, height: 48, mb: 3 }}>{icon}</Box>

      {renderTrending}

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
        }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 112 }}>
          <Box sx={{ mb: 1, typography: 'subtitle2' }}>{title}</Box>
          <Box sx={{ typography: 'h4' }}>{fShortenNumber(total)}</Box>
        </Box>

        <Chart
          type="line"
          series={[{ data: chart.series }]}
          options={chartOptions}
          width={84}
          height={56}
        />
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
  );
}
