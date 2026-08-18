import { Box, Card } from '@mui/material';
import { alpha } from '@mui/material/styles';
import React, { useState, useEffect } from 'react';
import { AppWidget } from 'src/screens/academic/courseProgress/components/courseCardsGrid';
import {
  Carousel,
  useCarousel,
  CarouselDotButtons,
  CarouselArrowFloatButtons,
} from 'src/components/carousel';

type Course = {
  id: number;
  name: string;
  color: string;
  progress: number;
  totalChapter: number;
  completedChapter: number;
};

type Props = {
  data: Course[];
  handleCardDetails?: (course: Course) => void;
};

export function CarouselDotsNumber({ data, handleCardDetails }: Props) {
  const carousel = useCarousel({
    loop: false,
    dragFree: true,
    slideSpacing: '20px',
    slidesToShow: { xs: 1, sm: 2, md: 3 },
  });

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  // Auto-select first card
  useEffect(() => {
    if (data.length > 0 && selectedCourseId === null) {
      setSelectedCourseId(data[0].id);
      handleCardDetails?.(data[0]);
    }
  }, [data, selectedCourseId, handleCardDetails]);

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <Carousel carousel={carousel}>
          {data.map((item, index) => (
            <CarouselItem
              key={item.id}
              item={item}
              selected={selectedCourseId === item.id}
              onClick={() => {
                setSelectedCourseId(item.id);
                handleCardDetails?.(item);
              }}
            />
          ))}
        </Carousel>

        <CarouselArrowFloatButtons {...carousel.arrows} options={carousel.options} />
      </Box>

      <CarouselDotButtons
        variant="number"
        scrollSnaps={carousel.dots.scrollSnaps}
        selectedIndex={carousel.dots.selectedIndex}
        onClickDot={carousel.dots.onClickDot}
        sx={{ mt: 5, mb: 2, width: 1, justifyContent: 'center' }}
      />
    </>
  );
}

type CarouselItemProps = {
  item: Course;
  selected: boolean;
  onClick: () => void;
};

function CarouselItem({ item, selected, onClick }: CarouselItemProps) {
  return (
    <Box sx={{ px: 1, width: '100%' }}>
      <Card
        onClick={onClick}
        sx={{
          maxWidth: 260, // 🔹 reduce width
          width: '100%',
          mx: 'auto',
          display: 'flex',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          boxShadow: selected
            ? `0 2px 12px ${alpha(item.color, 0.4)}`
            : '0 1px 6px rgba(0,0,0,0.10)',
          cursor: 'pointer',
          backgroundColor: 'transparent',
          borderRadius: 2,
          height: '100%',
        }}
      >
        <AppWidget
          title={item.name}
          color={item.color}
          chart={{ series: item.progress }}
          completedChapter={item.completedChapter}
          totalChapter={item.totalChapter}
        />
      </Card>
    </Box>
  );
}
