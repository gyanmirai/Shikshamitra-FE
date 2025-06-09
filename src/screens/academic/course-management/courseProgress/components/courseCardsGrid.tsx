import { useState, useEffect } from 'react';

import { Box, Grid, Card, alpha, Typography, LinearProgress } from '@mui/material';

import type { IAppWidgetProps, ICourseCardsGridProps } from '../type';

export default function CourseCardsGrid({ courses, handleCardDetails }: ICourseCardsGridProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  // Select first course by default
  useEffect(() => {
    if (courses.length > 0 && selectedCourseId === null) {
      setSelectedCourseId(courses[0].id);
      handleCardDetails(courses[0]);
    }
  }, [courses, selectedCourseId, handleCardDetails]);

  return (
    <Grid container spacing={2} marginTop={2} marginBottom={4} gap={1}>
      {courses.map((course) => {
        const isSelected = selectedCourseId === course.id;

        return (
          <Grid item xs={12} md={6} lg={2} key={course.id}>
            <Card
              sx={{
                display: 'flex',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                transform: isSelected ? 'scale(1)' : 'scale(1)',
                boxShadow: isSelected
                  ? `0 2px 10px ${alpha(course.color, 0.4)}`
                  : '0 1px 6px rgba(0,0,0,0.10)',
                cursor: 'pointer',
                zIndex: isSelected ? 2 : 1,
                backgroundColor: 'transparent',
                height: '100%',
              }}
              onClick={() => {
                setSelectedCourseId(course.id);
                handleCardDetails(course);
              }}
            >
              <AppWidget
                title={course.name}
                color={course.color}
                // icon="solar:user-rounded-bold"
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
  color,
  chart,
  completedChapter,
  totalChapter,
}: IAppWidgetProps) => {
  const progress = chart.series;

  return (
    <Box
      sx={{
        px: 2,
        py: 2,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Typography variant="h6" fontWeight={700} color="text.primary">
          {title}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" mt={0.5}>
          {completedChapter}/{totalChapter} Chapters
        </Typography>
      </Box>

      <Box mt={2}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: alpha('#000', 0.08),
            '& .MuiLinearProgress-bar': {
              background: `linear-gradient(90deg, ${alpha(color, 0.8)} 0%, ${color} 100%)`,
              borderRadius: 5,
              boxShadow: `0 0 10px ${alpha(color, 0.4)}`,
            },
          }}
        />

        <Typography variant="body2" color="text.secondary" mt={1} textAlign="right">
          {progress}% completed
        </Typography>
      </Box>
    </Box>
  );
};
