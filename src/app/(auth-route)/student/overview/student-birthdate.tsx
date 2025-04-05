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

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import UserHoverProfile from 'src/components/student-popover';
import {
  Carousel,
  useCarousel,
  CarouselDotButtons,
  CarouselArrowBasicButtons,
} from 'src/components/carousel';

import ViewAllBirthday from './view-all-birthday';

const StudentBirthDate = () => {
  const carousel = useCarousel({ loop: true }, [
    Autoplay({ playOnInit: true, delay: 2000, stopOnMouseEnter: true }),
  ]);

  const viewAllBirthdayDialog = useBoolean();
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
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Iconify
                icon="mdi:cake-variant"
                width={32}
                height={32}
                sx={{ color: 'primary.main' }}
              />
              <Typography variant="h5" sx={{ ml: 2, fontWeight: 'bold' }}>
                Student Birthdays
              </Typography>
            </Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 'bold', cursor: 'pointer', '&:hover': { opacity: 0.7 } }}
              onClick={viewAllBirthdayDialog.onTrue}
            >
              View All
            </Typography>
          </Box>
        </Box>

        {viewAllBirthdayDialog.value && (
          <CustomDialog
            maxWidth="md"
            open={viewAllBirthdayDialog.value}
            handleClose={() => {
              viewAllBirthdayDialog.onFalse();
            }}
            title="Student Birthdays"
          >
            <ViewAllBirthday />
          </CustomDialog>
        )}
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
                <UserHoverProfile
                  avatarComp={
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        mr: 2,
                        width: 38,
                        height: 38,
                        cursor: 'pointer',
                      }}
                    >
                      JD
                    </Avatar>
                  }
                  user={{
                    name: 'John Doe',
                    avatarUrl: '/assets/images/avatars/avatar_1.jpg',
                    role: 'Student',
                    email: 'john.doe@example.com',
                    class: '10th',
                    division: 'A',
                    board: 'CBSE',
                    medium: 'English',
                    organization: 'Higher Secondary',
                  }}
                />

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
                <UserHoverProfile
                  avatarComp={
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                      JD
                    </Avatar>
                  }
                  user={{
                    name: 'John Doe',
                    avatarUrl: '/assets/images/avatars/avatar_1.jpg',
                    role: 'Student',
                    email: 'john.doe@example.com',
                    class: '10th',
                    division: 'A',
                    board: 'CBSE',
                    medium: 'English',
                    organization: 'Higher Secondary',
                  }}
                />

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

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            Upcoming Birthdays
          </Typography>
          <Scrollbar sx={{ height: 150 }}>
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
                    p: 1,
                    boxShadow: 2,
                    my: 1,
                  }}
                >
                  <ListItemAvatar>
                    <UserHoverProfile
                      avatarComp={
                        <Avatar
                          sx={{
                            bgcolor: 'secondary.main',
                            width: 36,
                            height: 36,
                            cursor: 'pointer',
                          }}
                        >
                          {student.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </Avatar>
                      }
                      user={{
                        name: student.name,
                        avatarUrl: '/assets/images/avatars/avatar_1.jpg',
                        role: 'Student',
                        email: 'john.doe@example.com',
                        class: '10th',
                        division: 'A',
                        board: 'CBSE',
                        medium: 'English',
                        organization: 'Higher Secondary',
                      }}
                    />
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
          </Scrollbar>
        </Box>
      </Card>
    </Grid2>
  );
};

export default StudentBirthDate;
