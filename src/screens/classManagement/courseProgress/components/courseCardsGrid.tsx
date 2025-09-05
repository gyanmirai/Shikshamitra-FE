import { alpha } from '@mui/material/styles';
import { useRef, useState, useEffect } from 'react';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { Box, Card, Typography, IconButton, LinearProgress } from '@mui/material';

import type { IAppWidgetProps, ICourseCardsGridProps } from '../type';

export default function CourseCardsGrid({ courses, handleCardDetails }: ICourseCardsGridProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Scroll Left/Right
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;

    // Add some tolerance (1-2px)
    setShowLeftArrow(scrollLeft > 1);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    if (courses?.length > 0 && selectedCourseId === null) {
      setSelectedCourseId(courses[0].id);
      handleCardDetails(courses[0]);
    }
  }, [courses, selectedCourseId, handleCardDetails]);

  useEffect((): (() => void) | undefined => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }

    return undefined; // Explicitly return undefined when no scrollContainer
  }, []);

  return (
    <Box display="flex" alignItems="center">
      {/* Left Arrow */}
      {showLeftArrow && (
        <IconButton onClick={() => scroll('left')} sx={{ mx: 1, color: 'primary.main' }}>
          <ArrowBackIos fontSize="small" />
        </IconButton>
      )}

      {/* Scrollable Cards */}
      <Box
        ref={scrollContainerRef}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          gap: 2,
          px: 2, // ✅ Increased to prevent shadow cut
          flexGrow: 1,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {courses?.map((course) => {
          const isSelected = selectedCourseId === course.id;

          return (
            <Box
              key={course.id}
              sx={{
                flex: '0 0 auto',
                width: '220px', // Adjust width for consistent card size
                mb: 2,
                mt: 2,
              }}
            >
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
                  chart={{ series: course.progress }}
                  completedChapter={course.completedChapter}
                  totalChapter={course.totalChapter}
                />
              </Card>
            </Box>
          );
        })}
      </Box>

      {/* Right Arrow */}
      {showRightArrow && (
        <IconButton onClick={() => scroll('right')} sx={{ mx: 1, color: 'primary.main' }}>
          <ArrowForwardIos fontSize="small" />
        </IconButton>
      )}
    </Box>
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
        <Typography variant="subtitle2" fontWeight={700} color="text.primary">
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
