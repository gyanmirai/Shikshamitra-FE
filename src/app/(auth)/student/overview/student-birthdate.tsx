import React from 'react';
import Autoplay from 'embla-carousel-autoplay';

import Grid2 from '@mui/material/Unstable_Grid2';
import {
  Box,
  Card,
  List,
  Avatar,
  Divider,
  ListItem,
  Typography,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import {
  Carousel,
  useCarousel,
  CarouselDotButtons,
  CarouselArrowBasicButtons,
} from 'src/components/carousel';

const StudentBirthDate = () => {
  const carousel = useCarousel({ loop: true }, [Autoplay({ playOnInit: true, delay: 2000 })]);
  return (
    <Grid2 xs={12} md={6}>
      <Card
        sx={{
          p: 3,
          // height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadows-4)',
          borderRadius: '16px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Iconify icon="mdi:cake-variant" width={32} height={32} sx={{ color: 'primary.main' }} />
          <Typography variant="h5" sx={{ ml: 2, fontWeight: 'bold' }}>
            Student Birthdays
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            Todays Birthday
          </Typography>

          <Card sx={{ bgcolor: 'background.neutral' }}>
            <CarouselDotButtons
              scrollSnaps={carousel.dots.scrollSnaps}
              selectedIndex={carousel.dots.selectedIndex}
              onClickDot={carousel.dots.onClickDot}
              sx={{
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                position: 'absolute',
                color: 'primary.dark',
              }}
            />

            <CarouselArrowBasicButtons
              {...carousel.arrows}
              options={carousel.options}
              sx={{ top: 8, right: 8, position: 'absolute', color: 'common.black' }}
            />

            <Carousel carousel={carousel}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'primary.lighter',
                  p: 2,
                  borderRadius: '8px',
                }}
              >
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>JD</Avatar>
                <Box>
                  <Typography color="primary" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    John Doe
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Turning 20 today
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'primary.lighter',
                  p: 2,
                  borderRadius: '8px',
                }}
              >
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>JD</Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    John Doe
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Turning 30 today
                  </Typography>
                </Box>
              </Box>
            </Carousel>
          </Card>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            Upcoming Birthdays
          </Typography>
          <List>
            {[
              { name: 'Jane Smith', date: 'May 15', age: 19 },
              { name: 'Mike Johnson', date: 'May 18', age: 21 },
              { name: 'Sarah Brown', date: 'May 20', age: 20 },
            ].map((student, index) => (
              <ListItem
                key={index}
                disablePadding
                sx={{
                  backgroundColor: 'background.paper',
                  borderRadius: '8px',
                  p: 2,
                  boxShadow: 2,
                  my: 1,
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
                    {student.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {student.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2">{`${student.date} (Turning ${student.age})`}</Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Card>
    </Grid2>
  );
};

export default StudentBirthDate;
