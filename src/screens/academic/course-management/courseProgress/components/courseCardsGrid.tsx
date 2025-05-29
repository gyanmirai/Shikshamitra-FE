import { useState } from 'react';

import { Box, Grid, Card, alpha, useTheme, Typography } from '@mui/material';

import { SvgColor } from 'src/components/svg-color';
import { Chart, useChart } from 'src/components/chart';

import type { IAppWidgetProps, ICourseCardsGridProps } from '../type';

export default function CourseCardsGrid({ courses, handleCardDetails }: ICourseCardsGridProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  return (
    <Grid container spacing={2} marginTop={2} marginBottom={4} gap={1}>
      {courses.map((course) => {
        const isSelected = selectedCourseId === course.id;

        return (
          <Grid item xs={12} md={2} key={course.id}>
            <Card
              sx={{
                display: 'flex',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                transform: isSelected ? 'scale(1.09)' : 'scale(1)',
                boxShadow: isSelected
                  ? `0 8px 25px ${alpha(course.color, 0.4)}`
                  : '0 1px 6px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                zIndex: isSelected ? 2 : 1,
                backgroundColor: 'transparent',
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

  // Progress bar uses full course color (no opacity)
  const chartColors = [color, color];

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    stroke: { width: 0 },
    fill: {
      type: 'solid',
      colors: chartColors,
      opacity: 1, // Full opacity for progress bar
    },
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 0,
          size: '70%', // Reduced from 70% to make progress bar thicker
        },
        track: {
          background: alpha('#ffffff', 0.2), // Lighter white track
          opacity: 1,
          margin: 0, // Remove margin for thicker progress
        },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 6,
            color, // Use course color for text
            fontSize: theme.typography.subtitle2.fontSize as string,
            fontWeight: 'bold',
          },
        },
      },
    },
    ...chart.options,
  });

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: alpha(color, 0.1), // Light background with course color
        color, // Text color matches course color
        width: '100%',
        minHeight: { xs: 80, sm: 100, md: 120 },
        position: 'relative',
        overflow: 'hidden',
        // Removed opacity: 0.5 to make colors vibrant
      }}
    >
      {/* Circular Progress Chart */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: { xs: 40, sm: 50, md: 90 }, // Responsive width
          height: { xs: 40, sm: 50, md: 70 }, // Responsive height
          color,
        }}
      >
        <Chart
          type="radialBar"
          series={[chart.series]}
          options={chartOptions}
          width={60} // You can also make these dynamic like: width={isSmallScreen ? 50 : 70}
          height={60}
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
            color,
          }}
        >
          {completedChapter}/{totalChapter}
        </Typography>

        <Typography
          variant="subtitle2"
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
            color: alpha(color, 0.7),
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>
      </Box>
    </Box>
  );
};
