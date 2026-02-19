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
    setShowLeftArrow(scrollLeft > 5);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
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
      handleScroll();
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
    return undefined;
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        mx: -1,
        mt: -2,
        ml: -2,
      }}
    >
      {/* Left Arrow - Glassmorphism style */}
      {showLeftArrow && (
        <IconButton
          onClick={() => scroll('left')}
          sx={{
            position: 'absolute',
            left: 0,
            zIndex: 10,
            bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(4px)',
            boxShadow: (theme) => theme.customShadows.z8,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
              color: 'primary.main',
            },
            width: 40,
            height: 40,
            ml: 2,
          }}
        >
          <ArrowBackIos fontSize="small" sx={{ ml: 0.5 }} />
        </IconButton>
      )}

      {/* Scrollable Cards Container */}
      <Box
        ref={scrollContainerRef}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          gap: 2.5,
          p: 2,
          flexGrow: 1,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          pb: 3,
        }}
      >
        {courses?.map((course) => {
          const isSelected = selectedCourseId === course.id;

          return (
            <Box
              key={course.id}
              sx={{
                flex: '0 0 auto',
                width: { xs: '240px', sm: '260px' },
                perspective: '1000px',
              }}
            >
              <Card
                sx={{
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '135px',
                  borderRadius: 2,
                  border: (theme) =>
                    isSelected
                      ? `1px solid ${alpha(course.color, 0.5)}`
                      : `1px solid ${theme.palette.divider}`,
                  backgroundColor: (theme) =>
                    isSelected ? alpha(course.color, 0.04) : theme.palette.background.paper,
                  boxShadow: (theme) =>
                    isSelected
                      ? `0 12px 24px -4px ${alpha(course.color, 0.24)}`
                      : theme.customShadows.card,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) =>
                      isSelected
                        ? `0 16px 32px -4px ${alpha(course.color, 0.32)}`
                        : theme.customShadows.z12,
                    borderColor: alpha(course.color, 0.4),
                  },
                }}
                onClick={() => {
                  setSelectedCourseId(course.id);
                  handleCardDetails(course);
                }}
              >
                {/* Subtle selection indicator line */}
                {isSelected && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                    }}
                  />
                )}

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

      {/* Right Arrow - Glassmorphism style */}
      {showRightArrow && (
        <IconButton
          onClick={() => scroll('right')}
          sx={{
            position: 'absolute',
            right: 0,
            zIndex: 10,
            bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(4px)',
            boxShadow: (theme) => theme.customShadows.z8,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
              color: 'primary.main',
            },
            width: 40,
            height: 40,
            mr: 2,
          }}
        >
          <ArrowForwardIos fontSize="small" sx={{ ml: 0.5 }} />
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
        p: 2.5,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
      }}
    >
      <Box>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          noWrap
          sx={{
            color: 'text.primary',
            mb: 0.5,
            letterSpacing: -0.2,
          }}
        >
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
            {completedChapter}
          </Box>
          <Box component="span" sx={{ opacity: 0.6, mx: 0.5 }}>
            /
          </Box>
          {totalChapter} Chapters
        </Typography>
      </Box>

      <Box>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1 }}
        >
          <Typography
            variant="caption"
            sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase' }}
          >
            Progress
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              color,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'baseline',
            }}
          >
            {progress}
            <Typography variant="caption" sx={{ ml: 0.2, fontWeight: 700 }}>
              %
            </Typography>
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 8,
            backgroundColor: (theme) => alpha(theme.palette.divider, 0.4),
            '& .MuiLinearProgress-bar': {
              background: `linear-gradient(90deg, ${alpha(color, 0.7)} 0%, ${color} 100%)`,
              borderRadius: 8,
              boxShadow: `0 2px 8px ${alpha(color, 0.4)}`,
            },
          }}
        />
      </Box>
    </Box>
  );
};
