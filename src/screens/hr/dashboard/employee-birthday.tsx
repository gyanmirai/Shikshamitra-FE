import Autoplay from 'embla-carousel-autoplay';

import {
  Box,
  Card,
  List,
  Grid,
  Avatar,
  Divider,
  Tooltip,
  ListItem,
  Typography,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import UserHoverProfile from 'src/components/student-popover';
import {
  Carousel,
  useCarousel,
  CarouselDotButtons,
  CarouselArrowBasicButtons,
} from 'src/components/carousel';

const EmployeeBirthDay = () => {
  // Initialize carousel with autoplay functionality
  // - loop: true enables continuous looping of carousel items
  // - autoplay with 2 second delay between slides
  // - stops autoplay when mouse hovers over carousel
  const carousel = useCarousel({ loop: true }, [
    Autoplay({ playOnInit: true, delay: 2000, stopOnMouseEnter: true }),
  ]);
  return (
    <Grid item xs={12} md={6}>
      <Card
        sx={{
          p: 3,
          // height: '100%',
          display: 'flex',
          flexDirection: 'column',

          borderRadius: '16px',
          height: '100%',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Iconify icon="mdi:cake-variant" width={32} height={32} sx={{ color: 'primary.main' }} />
          <Typography variant="h5" sx={{ ml: 2, fontWeight: 'bold' }}>
            Employee Birthdays & Anniversary
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            Todays Birthday & Anniversary
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
                        width: 56,
                        height: 56,
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

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
            Upcoming Birthdays & Anniversary
          </Typography>
          <Scrollbar sx={{ height: 300 }}>
            <List>
              {[
                { name: 'Jane Smith', date: 'May 15', age: 19, type: 'Birthday' },
                { name: 'Mike Johnson', date: 'May 18', age: 21, type: 'Anniversary' },
                { name: 'Sarah Brown', date: 'May 20', age: 20, type: 'New Join' },
              ].map((student, index) => (
                <Tooltip title={student.type} key={index}>
                  <ListItem
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
                      <UserHoverProfile
                        avatarComp={
                          <Avatar
                            sx={{
                              bgcolor: 'secondary.main',
                              width: 48,
                              height: 48,
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
                    <ListItemIcon sx={{ minWidth: 'auto' }}>
                      {student.type === 'Birthday' && (
                        <Iconify icon="mdi:cake" color="secondary.main" height={25} width={25} />
                      )}
                      {student.type === 'Anniversary' && (
                        <Iconify
                          icon="mingcute:anniversary-fill"
                          color="error.main"
                          height={25}
                          width={25}
                        />
                      )}
                      {student.type === 'New Join' && (
                        <Iconify
                          icon="mdi:celebration"
                          color="success.main"
                          height={25}
                          width={25}
                        />
                      )}
                    </ListItemIcon>{' '}
                  </ListItem>
                </Tooltip>
              ))}
            </List>{' '}
          </Scrollbar>
        </Box>
      </Card>
    </Grid>
  );
};

export default EmployeeBirthDay;
