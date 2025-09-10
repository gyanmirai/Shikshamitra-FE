import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { CalendarView } from 'src/sections/calendar/view';
import { Box, Card, Stack, Button, Typography } from '@mui/material';

import ViewAllBirthday from './view-all-birthday';
import BirthdayCardProfile from './studentProfileBirthdayCard';

import type { BirthdaySectionProps } from './type';

const BirthdaySection = ({ todaysBirthdays, upcomingBirthdays, title }: BirthdaySectionProps) => {
  // Boolean state to control calendar dialog visibility
  const viewCalendarDialog = useBoolean();

  // Boolean state to control birthday list dialog visibility
  const viewAllBirthdayDialog = useBoolean();
  return (
    <Box height="100%">
      <Card sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <Iconify icon="mdi:cake-variant" width={32} height={32} sx={{ color: 'primary.main' }} />
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Scrollbar sx={{ height: '380px' }}>
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

          <Stack spacing={2} mt={1}>
            {upcomingBirthdays?.map((student: any, idx: any) => (
              <BirthdayCardProfile
                key={idx}
                name={student.name}
                age={student.age}
                className={student.className}
                division=""
                dateLabel={student.dateLabel}
                borderColor="#4CAF50"
              />
            ))}
          </Stack>
        </Scrollbar>
        <Button
          size="small"
          color="inherit"
          onClick={() => {
            viewCalendarDialog.onTrue();
          }}
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
        >
          View Calendar View
        </Button>
      </Card>

      <CustomDialog
        maxWidth="md"
        open={viewCalendarDialog.value}
        handleClose={() => {
          viewCalendarDialog.onFalse();
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
        open={viewCalendarDialog.value}
        handleClose={() => {
          viewCalendarDialog.onFalse();
        }}
        title=""
      >
        <CalendarView />
      </CustomDialog>
    </Box>
  );
};

export default BirthdaySection;
