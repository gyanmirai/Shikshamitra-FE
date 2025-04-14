import { Box, Grid, Card, alpha, useTheme, Typography } from '@mui/material';

import { SvgColor } from 'src/components/svg-color';
import { Chart, useChart } from 'src/components/chart';

import type { IAppWidgetProps, ICourseCardsGridProps } from '../type';

export default function CourseCardsGrid({ courses, handleCardDetails }: ICourseCardsGridProps) {
  return (
    <Grid container spacing={2} marginTop={2} marginBottom={4}>
      {courses.map((course) => (
        <Grid item xs={12} md={3} key={course.id}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              transform: 'scale(1)',
              '&:hover': {
                transform: 'scale(1.05)',
                zIndex: 2,
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
              },
              cursor: 'pointer',
            }}
            onClick={() => handleCardDetails(course)}
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
      ))}
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
        minHeight: 120,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Circular Progress Chart */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 80,
          height: 80,
          color: 'white',
        }}
      >
        <Chart
          type="radialBar"
          series={[chart.series]}
          options={chartOptions}
          width={80}
          height={80}
        />
      </Box>

      {/* Background SVG */}
      <SvgColor
        src="/assets/background/shape-circle-3.svg"
        sx={{
          width: 180,
          height: 180,
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
