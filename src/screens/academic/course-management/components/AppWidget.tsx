import React from 'react';
import { CONFIG } from 'src/config-global';
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import { fNumber } from 'src/utils/format-number';
import { SvgColor } from 'src/components/svg-color';
import { Chart, useChart } from 'src/components/chart';

import type { AppWidgetProps } from '../type';

const AppWidget: React.FC<AppWidgetProps> = ({ title, total, icon, chart }) => {
  const theme = useTheme();

  const chartColors = chart.colors ?? [theme.palette.primary.light, theme.palette.primary.main];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    stroke: { width: 0 },
    fill: { type: 'solid', colors: chartColors },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 6,
            color: 'black',
            fontSize: theme.typography.subtitle2.fontSize as string,
          },
        },
      },
    },
    ...chart.options,
  });

  return (
    <Box
      sx={{
        p: 1.5,
        gap: 2,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'common.white',
        color: 'common.black',
        width: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Chart
          type="radialBar"
          series={[chart.series]}
          options={chartOptions}
          width={80}
          height={80}
          sx={{ zIndex: 1 }}
        />
        <SvgColor
          src={`${CONFIG.site.basePath}/assets/background/shape-circle-3.svg`}
          sx={{
            width: 200,
            height: 200,
            opacity: 0.08,
            position: 'absolute',
            color: 'primary.light',
          }}
        />
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        {total && <Typography variant="h3">{fNumber(total)}</Typography>}
        <Typography
          variant="subtitle2"
          sx={{
            mt: 1,
            color: 'text.secondary',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          }}
        >
          {title}
        </Typography>
      </Box>
    </Box>
  );
};

export default AppWidget;
