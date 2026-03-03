import React from 'react';
import confetti from 'canvas-confetti';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CommonCalender from 'src/components/calender';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Chip, Stack, Button, Avatar, CardHeader, Typography } from '@mui/material';

const birthdays = [
  {
    id: 1,
    name: 'Arjun Sharma',
    class: '5A',
    date: 'Today',
    isToday: true,
    avatarUrl: '/assets/images/avatars/avatar_1.jpg',
  },
  {
    id: 2,
    name: 'Priya Patel',
    class: '5A',
    date: 'Tomorrow',
    isToday: false,
    avatarUrl: '/assets/images/avatars/avatar_2.jpg',
  },
  {
    id: 3,
    name: 'Raj Kumar',
    class: '4B',
    date: 'Dec 29',
    isToday: false,
    avatarUrl: '/assets/images/avatars/avatar_3.jpg',
  },
  {
    id: 4,
    name: 'Meera Singh',
    class: '3C',
    date: 'Dec 30',
    isToday: false,
    avatarUrl: '/assets/images/avatars/avatar_4.jpg',
  },
  {
    id: 5,
    name: 'Sohan Kumar',
    class: '6A',
    date: 'Dec 31',
    isToday: false,
    avatarUrl: '/assets/images/avatars/avatar_5.jpg',
  },
  {
    id: 6,
    name: 'Anita Roy',
    class: '7B',
    date: 'Jan 01',
    isToday: false,
    avatarUrl: '/assets/images/avatars/avatar_6.jpg',
  },
  {
    id: 7,
    name: 'Vikram Singh',
    class: '8C',
    date: 'Jan 02',
    isToday: false,
    avatarUrl: '/assets/images/avatars/avatar_7.jpg',
  },
  {
    id: 8,
    name: 'Rahul Gupta',
    class: '9A',
    date: 'Jan 03',
    isToday: false,
    avatarUrl: '/assets/images/avatars/avatar_8.jpg',
  },
  {
    id: 9,
    name: 'Pooja Sharma',
    class: '10B',
    date: 'Jan 04',
    isToday: false,
    avatarUrl: '/assets/images/avatars/avatar_9.jpg',
  },
  {
    id: 10,
    name: 'Karan Mehra',
    class: '11C',
    date: 'Jan 05',
    isToday: false,
    avatarUrl: '/assets/images/avatars/avatar_10.jpg',
  },
];

const Birthdays = () => {
  const viewCalendarDialog = useBoolean();
  const [wishedStudents, setWishedStudents] = React.useState<number[]>([]);

  const handleWish = (id: number) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    setWishedStudents((prev) => [...prev, id]);
  };

  return (
    <>
      <Card sx={{ height: 500, display: 'flex', flexDirection: 'column' }}>
        <CardHeader
          title={
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: -1, ml: -1 }}>
              <Iconify icon="mdi:cake-variant" width={24} color="primary.main" />
              <Typography variant="h6">Birthdays</Typography>
            </Stack>
          }
          subheaderTypographyProps={{
            sx: { color: (theme: any) => theme.vars?.palette?.text?.secondary || 'text.secondary' },
          }}
          action={
            <Button
              size="small"
              color="inherit"
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
              onClick={viewCalendarDialog.onTrue}
            >
              View Calendar
            </Button>
          }
          sx={{ flexShrink: 0 }}
        />

        <Scrollbar sx={{ flexGrow: 1 }}>
          <Stack spacing={1} sx={{ p: 1 }}>
            {birthdays.some((student) => student.isToday) && (
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, ml: 1 }}>
                  Today
                </Typography>
                <Stack spacing={1}>
                  {birthdays
                    .filter((student) => student.isToday)
                    .map((student) => {
                      const isWished = wishedStudents.includes(student.id);

                      return (
                        <Box
                          key={student.id}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            bgcolor: (theme: any) =>
                              varAlpha(
                                theme.vars?.palette?.primary?.mainChannel ||
                                  theme.palette.primary.mainChannel ||
                                  '',
                                0.16
                              ),
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: 'transparent',
                              bgcolor: 'background.neutral',
                              transform: 'scale(1.02)',
                              boxShadow: 'none',
                            },
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ position: 'relative' }}>
                              <Avatar
                                src={student.avatarUrl}
                                alt={student.name}
                                sx={{ width: 48, height: 48 }}
                              />
                              <Box
                                sx={{
                                  position: 'absolute',
                                  bottom: 0,
                                  right: 0,
                                  bgcolor: 'background.paper',
                                  borderRadius: '50%',
                                  width: 20,
                                  height: 20,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: 1,
                                }}
                              >
                                <Typography variant="caption">🎉</Typography>
                              </Box>
                            </Box>

                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {student.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Class {student.class}
                              </Typography>
                            </Box>
                          </Stack>

                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Button
                              size="small"
                              variant={isWished ? 'soft' : 'contained'}
                              color={isWished ? 'success' : 'primary'}
                              startIcon={
                                <Iconify
                                  icon={isWished ? 'mdi:check-circle-outline' : 'mdi:gift-outline'}
                                />
                              }
                              onClick={() => !isWished && handleWish(student.id)}
                              sx={{ borderRadius: 3, px: 2 }}
                            >
                              {isWished ? 'Wished!' : 'Wish'}
                            </Button>
                          </Stack>
                        </Box>
                      );
                    })}
                </Stack>
              </Box>
            )}

            {birthdays.some((student) => !student.isToday) && (
              <Box sx={{ mt: birthdays.some((student) => student.isToday) ? 2 : 0 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, ml: 1 }}>
                  Upcoming
                </Typography>
                <Stack spacing={1}>
                  {birthdays
                    .filter((student) => !student.isToday)
                    .map((student) => (
                      <Box
                        key={student.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: (theme) => `1px solid ${theme.palette.divider}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          bgcolor: 'transparent',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'transparent',
                            bgcolor: 'background.neutral',
                            transform: 'scale(1.02)',
                            boxShadow: 'none',
                          },
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box sx={{ position: 'relative' }}>
                            <Avatar
                              src={student.avatarUrl}
                              alt={student.name}
                              sx={{ width: 48, height: 48 }}
                            />
                          </Box>

                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {student.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Class {student.class}
                            </Typography>
                          </Box>
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip label={student.date} size="small" variant="soft" color="default" />
                        </Stack>
                      </Box>
                    ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Scrollbar>
      </Card>

      <CustomDialog
        maxWidth="md"
        open={viewCalendarDialog.value}
        handleClose={viewCalendarDialog.onFalse}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Student Birthdays</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="View and manage student birthdays for today and upcoming dates"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <CommonCalender data={undefined} />
      </CustomDialog>
    </>
  );
};

export default Birthdays;
