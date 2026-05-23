import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import React, { useRef, useState, useEffect } from 'react';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { Box, Card, Skeleton, IconButton, Typography, CircularProgress } from '@mui/material';

import type { IAppWidgetProps, ICourseCardsGridProps } from '../type';

export default function CourseCardsGrid({
  courses,
  handleCardDetails,
  layout = 'horizontal',
  isLoading = false,
}: ICourseCardsGridProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string | number | null>(null);

  useEffect(() => {
    if (courses?.length > 0 && selectedCourseId === null) {
      setSelectedCourseId(courses[0].id);
      handleCardDetails(courses[0]);
    }
  }, [courses, selectedCourseId, handleCardDetails]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      checkScroll();
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      // Wait for content to render and update dimensions
      const timer = setTimeout(checkScroll, 100);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [courses, layout]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 600;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const isVertical = layout === 'vertical';
  const showArrows = isVertical && courses && courses.length > 2;

  const content = isLoading ? (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isVertical ? 'row' : 'column',
        gap: isVertical ? 1 : 1,
        width: '100%',
      }}
    >
      {[1, 2, 3].map((i) => (
        <Card
          key={i}
          sx={{
            minWidth: isVertical ? 280 : undefined,
            width: isVertical ? undefined : '100%',
            p: 1.5,
            flexShrink: 0,
          }}
        >
          <Skeleton variant="text" width="60%" height={22} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 1, mb: 0.5 }} />
          <Skeleton variant="text" width="40%" height={18} />
        </Card>
      ))}
    </Box>
  ) : (
    <Box
      ref={isVertical ? scrollRef : undefined}
      sx={{
        display: 'flex',
        flexDirection: isVertical ? 'row' : 'column',
        flexWrap: isVertical ? 'nowrap' : undefined,
        overflowX: isVertical ? 'auto' : undefined,
        width: '100%',
        gap: isVertical ? 1 : 1,
        pr: isVertical ? 0 : 0,
        pl: isVertical ? 0 : undefined,
        pb: isVertical ? 0 : 0,
        scrollbarWidth: isVertical ? 'none' : undefined,
        msOverflowStyle: isVertical ? 'none' : undefined,
        '&::-webkit-scrollbar': isVertical ? { display: 'none' } : undefined,
      }}
    >
      {courses?.map((course, index) => {
        const isSelected = selectedCourseId === course.id;
        const courseColor = course.color || '#1976d2';

        return (
          <Card
            key={`${course.id}-${index}`}
            onClick={() => {
              if (selectedCourseId === course.id) return;
              setSelectedCourseId(course.id);
              handleCardDetails(course);
            }}
            sx={{
              minWidth: isVertical ? 280 : undefined,
              width: isVertical ? undefined : '100%',
              cursor: 'pointer',
              flexShrink: 0,
              borderRadius: 1,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: (theme) =>
                isSelected
                  ? `1.5px solid ${alpha(courseColor, 0.6)}`
                  : `1px solid ${theme.palette.divider}`,
              backgroundColor: (theme) =>
                isSelected ? alpha(courseColor, 0.04) : theme.vars.palette.background.paper,
              boxShadow: (theme) =>
                isSelected
                  ? `0 8px 20px -4px ${alpha(courseColor, 0.18)}`
                  : theme.customShadows.card,
              '&:hover': {
                transform: 'translateY(-2px)',
                borderColor: alpha(courseColor, 0.4),
              },
            }}
          >
            <AppWidget
              title={course.name}
              color={courseColor}
              chart={{ series: course.progress }}
              completedChapter={course.completedChapter}
              totalChapter={course.totalChapter}
            />
          </Card>
        );
      })}
    </Box>
  );

  const renderVertical = (
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
      {showArrows && (
        <IconButton
          onClick={() => handleScroll('left')}
          disabled={!canScrollLeft}
          sx={{
            position: 'absolute',
            left: -10,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 9,
            color: 'text.primary',
            bgcolor: 'transparent',
            '&:hover': { bgcolor: 'transparent', opacity: 0.7 },
          }}
        >
          <Iconify icon="eva:arrow-ios-back-fill" width={24} />
        </IconButton>
      )}

      {/* Constrain the scrolling box width strictly so the items do not slide underneath the absolute positioned arrows */}
      <Box
        sx={{
          width: showArrows ? 'calc(100% - 40px)' : '100%',
          mx: showArrows ? '20px' : 0,
          overflow: 'hidden',
        }}
      >
        {content}
      </Box>

      {showArrows && (
        <IconButton
          onClick={() => handleScroll('right')}
          disabled={!canScrollRight}
          sx={{
            position: 'absolute',
            right: -10,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 9,
            color: 'text.primary',
            bgcolor: 'transparent',
            '&:hover': { bgcolor: 'transparent', opacity: 0.7 },
          }}
        >
          <Iconify icon="eva:arrow-ios-forward-fill" width={24} />
        </IconButton>
      )}
    </Box>
  );

  return isVertical ? renderVertical : <Scrollbar sx={{ height: '100%' }}>{content}</Scrollbar>;
}

export const AppWidget: React.FC<IAppWidgetProps> = ({
  title,
  color,
  chart,
  completedChapter,
  totalChapter,
}: IAppWidgetProps) => {
  const progress = chart.series;
  const safeColor = color || '#1976d2';

  return (
    <Box
      sx={{
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
      }}
    >
      {/* Title row & Circular Progress */}
      <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
        <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 0, flex: 1 }}>
          <SubjectColorIndicator color={safeColor} />
          <Typography
            variant="subtitle2"
            fontWeight={700}
            noWrap
            sx={{ color: 'text.primary', letterSpacing: -0.2 }}
          >
            {title}
          </Typography>
        </Box>
        {/* Circular Progress */}
        <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
          {/* Background Track */}
          <CircularProgress
            variant="determinate"
            value={100}
            size={48}
            thickness={4}
            sx={{ color: alpha(safeColor, 0.16) }}
          />
          {/* Active Progress */}
          <CircularProgress
            variant="determinate"
            value={progress}
            size={48}
            thickness={4}
            sx={{
              position: 'absolute',
              left: 0,
              '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
            }}
          />
          {/* Percentage Text */}
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 700 }}>
              {progress}%
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
