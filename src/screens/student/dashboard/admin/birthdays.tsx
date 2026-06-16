import React from 'react';
import confetti from 'canvas-confetti';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CommonCalender from 'src/components/calender';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { useGetStudentDashboardSummaryQuery } from 'src/redux/student';
import { Box, Card, Chip, Stack, Button, Avatar, CardHeader, Typography } from '@mui/material';

const Birthdays = () => {
  const viewCalendarDialog = useBoolean();
  const { data: summary } = useGetStudentDashboardSummaryQuery(undefined);
  const [wishedStudents, setWishedStudents] = React.useState<string[]>([]);

  const birthdayRows = [
    ...(summary?.todaysBirthdays || []).map((student: any) => ({
      ...student,
      id: `${student.name}-today`,
      date: 'Today',
      isToday: true,
    })),
    ...(summary?.upcomingBirthdays || []).map((student: any) => ({
      ...student,
      id: `${student.name}-${student.dateLabel || 'upcoming'}`,
      date: student.dateLabel || '-',
      isToday: false,
    })),
  ];

  const handleWish = (id: string) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    setWishedStudents((prev) => [...prev, id]);
  };
  const theme = useTheme();

  return (
    <>
      <Card
        sx={{
          height: 500,
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
            transition: 'all 0.3s ease-in-out',
          },
        }}
      >
        <CardHeader
          title={
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: -1, ml: -1 }}>
              <Iconify icon="mdi:cake-variant" width={24} color="primary.main" />
              <Typography variant="h6">Birthdays</Typography>
            </Stack>
          }
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
            {birthdayRows.length === 0 && (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 8 }}>
                No birthdays found.
              </Typography>
            )}

            {birthdayRows.some((student) => student.isToday) && (
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, ml: 1 }}>
                  Today
                </Typography>
                <Stack spacing={1}>
                  {birthdayRows
                    .filter((student) => student.isToday)
                    .map((student) => {
                      const isWished = wishedStudents.includes(student.id);

                      return (
                        <Box
                          key={student.id}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: () => `1px solid ${theme.palette.divider}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            bgcolor: () =>
                              varAlpha(
                                theme.vars?.palette?.primary?.mainChannel ||
                                  theme.palette.primary.mainChannel ||
                                  '',
                                0.16
                              ),
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ width: 48, height: 48 }}>
                              {student.name?.[0] || 'S'}
                            </Avatar>

                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {student.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {student.className || '-'}
                              </Typography>
                            </Box>
                          </Stack>

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
                        </Box>
                      );
                    })}
                </Stack>
              </Box>
            )}

            {birthdayRows.some((student) => !student.isToday) && (
              <Box sx={{ mt: birthdayRows.some((student) => student.isToday) ? 2 : 0 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, ml: 1 }}>
                  Upcoming
                </Typography>
                <Stack spacing={1}>
                  {birthdayRows
                    .filter((student) => !student.isToday)
                    .map((student) => (
                      <Box
                        key={student.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: () => `1px solid ${theme.palette.divider}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ width: 48, height: 48 }}>{student.name?.[0] || 'S'}</Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {student.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {student.className || '-'}
                            </Typography>
                          </Box>
                        </Stack>

                        <Chip label={student.date} size="small" variant="soft" color="default" />
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
