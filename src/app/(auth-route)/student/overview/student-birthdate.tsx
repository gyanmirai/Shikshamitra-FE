import { Box, Card, Stack, Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';

import ViewAllBirthday from './view-all-birthday';
import BirthdayCardProfile from './studentProfileBirthdayCard';
import ViewAllBirthdayWithDate from './view-all-birthday-date';

const BirthdaySection = ({ todaysBirthdays, upcomingBirthdays, title }: any) => {
  const viewAllBirthdayDialog = useBoolean();
  const viewAllBirthdayUpcomingDialog = useBoolean();
  return (
    <Box height="100%">
      <Card sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <Iconify icon="mdi:cake-variant" width={32} height={32} sx={{ color: 'primary.main' }} />
          <Typography variant="h6" mt={1}>
            {title}
          </Typography>
        </Box>
        <Scrollbar sx={{ height: '300px' }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="subtitle2">Today’s Birthdays</Typography>
            <Button
              size="small"
              color="inherit"
              onClick={() => {
                viewAllBirthdayDialog.onTrue();
              }}
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
            >
              View All Today&apos;s Birthday
            </Button>
          </Box>
          <Stack spacing={2} mt={1} mb={3}>
            {todaysBirthdays?.map((student: any, idx: any) => (
              <BirthdayCardProfile
                key={idx}
                name={student.name}
                age={student.age}
                className={student.className}
                division=""
                borderColor="#4CAF50"
              />
            ))}
          </Stack>

          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="subtitle2">Upcoming Birthdays</Typography>
            <Button
              size="small"
              color="inherit"
              onClick={() => {
                viewAllBirthdayUpcomingDialog.onTrue();
              }}
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
            >
              View All Upcoming&apos;s Birthday
            </Button>
          </Box>
          <Stack spacing={2} mt={1}>
            {upcomingBirthdays?.map((student: any, idx: any) => (
              <BirthdayCardProfile
                key={idx}
                name={student.name}
                age={student.age}
                className={student.className}
                division=""
                dateLabel={student.dateLabel}
                borderColor="#2196F3"
              />
            ))}
          </Stack>
        </Scrollbar>
      </Card>

      <CustomDialog
        maxWidth="md"
        open={viewAllBirthdayDialog.value}
        handleClose={() => {
          viewAllBirthdayDialog.onFalse();
        }}
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
        <ViewAllBirthday />
      </CustomDialog>

      <CustomDialog
        maxWidth="md"
        open={viewAllBirthdayUpcomingDialog.value}
        handleClose={() => {
          viewAllBirthdayUpcomingDialog.onFalse();
        }}
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
        <ViewAllBirthdayWithDate />
      </CustomDialog>
    </Box>
  );
};

export default BirthdaySection;
