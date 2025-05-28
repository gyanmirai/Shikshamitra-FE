import { useState } from 'react';

import { Box, Grid, Card, alpha, useTheme, Typography } from '@mui/material';

import { SvgColor } from 'src/components/svg-color';
import { Chart, useChart } from 'src/components/chart';

import type { IAppWidgetProps, ICourseCardsGridProps } from '../type';

export default function CourseCardsGrid({ courses, handleCardDetails }: ICourseCardsGridProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  return (
    <Grid container spacing={2} marginTop={2} marginBottom={4}>
      {courses.map((course) => {
        const isSelected = selectedCourseId === course.id;

        return (
          <Grid item xs={12} md={2} key={course.id}>
            <Card
              sx={{
                display: 'flex',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                transform: isSelected ? 'scale(1.07)' : 'scale(1)',
                boxShadow: isSelected
                  ? '0 6px 20px rgba(0, 171, 85, 0.2)'
                  : '0 1px 6px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                zIndex: isSelected ? 2 : 1,
              }}
              onClick={() => {
                setSelectedCourseId(course.id);
                handleCardDetails(course);
              }}
            >
              <AppWidget
                title={course.name}
                color={course.color}
                icon="solar:user-rounded-bold"
                chart={{ series: course.progress }}
                completedChapter={course.completedChapter}
                totalChapter={course.totalChapter}
              />
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}

export const AppWidget: React.FC<IAppWidgetProps> = ({
  title,
  total,
  color,
  icon,
  chart,
  totalChapter,
  completedChapter,
}: IAppWidgetProps) => {
  const theme = useTheme();

  const chartColors = chart.colors ?? [theme.palette.primary.light, theme.palette.primary.main];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    stroke: { width: 0 },
    fill: {
      type: 'solid',
      colors: chartColors,
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 6,
            color: 'white',
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
        p: 2,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: color, // rich green background
        color: 'common.white',
        width: '100%',
        minHeight: 40,
        position: 'relative',
        overflow: 'hidden',
        opacity: 0.8,
      }}
    >
      {/* Circular Progress Chart */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 50,
          height: 50,
          color: 'white',
        }}
      >
        <Chart
          type="radialBar"
          series={[chart.series]}
          options={chartOptions}
          width={65}
          height={65}
          sx={{
            borderRadius: 0.1,
            borderWidth: 2,
          }}
        />
      </Box>

      {/* Background SVG */}
      <SvgColor
        src="/assets/background/shape-circle-3.svg"
        sx={{
          width: 50,
          height: 50,
          position: 'absolute',
          opacity: 0.06,
          right: 0,
          top: 0,
          zIndex: 0,
        }}
      />

      {/* Textual Content */}
      <Box sx={{ ml: 2, zIndex: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'common.white' }}>
          {completedChapter}/{totalChapter}
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{
            mt: 0.5,
            color: alpha('#ffffff', 0.8),
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>
      </Box>
    </Box>
  );
};
