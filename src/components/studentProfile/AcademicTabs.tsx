import React from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Grid, Button } from '@mui/material';

import AcademicTimetable from './academicTimetable';
import SubjectPerformance from './subjectPerformance';
// import HomeworkAssignment from './homeworkAssignment';
import ProfileExamination from './profileExamination';
import MyProfileSubmission from './studentProfileHomeworkAssignment';

const TABS = [
  {
    value: 'timetable',
    label: 'Timetable',
    icon: <Iconify icon="solar:calendar-date-outline" width={20} />,
  },
  {
    value: 'subjectPerformace',
    label: 'Subject Performance',
    icon: <Iconify icon="solar:chart-2-outline" width={20} />,
  },
  {
    value: 'homework/assignments',
    label: 'Homework/Assignments',
    icon: <Iconify icon="solar:notebook-outline" width={20} />,
  },
  {
    value: 'examination',
    label: 'Examination',
    icon: <Iconify icon="solar:document-outline" width={20} />,
  },
];

const AcademicTabs = () => {
  const tabs = useTabs('timetable');

  return (
    <Grid
      container
      spacing={1}
      sx={{
        mt: 0,
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 280px)',
        minHeight: '0',
      }}
    >
      {/* Left Section - Navigation List */}
      <Grid size={{ xs: 12, md: 4, lg: 2.3 }} sx={{ height: '100%' }}>
        <Card sx={{ height: '100%', p: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {TABS.map((tab) => {
              const isSelected = tabs.value === tab.value;
              return (
                <Button
                  key={tab.value}
                  onClick={(e) => tabs.onChange(e, tab.value)}
                  variant="text"
                  color="inherit"
                  startIcon={tab.icon}
                  sx={{
                    position: 'relative',
                    justifyContent: 'flex-start',
                    px: 2,
                    py: 1.5,
                    textAlign: 'left',
                    backgroundColor: (theme) =>
                      isSelected ? theme.palette.action.hover : 'transparent',
                    color: isSelected ? 'inherit' : 'text.secondary',
                    ...(isSelected
                      ? {
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: '2px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '4px',
                            height: '80%',
                            borderLeft: (theme) =>
                              isSelected ? `4px solid ${theme.palette.primary.main}` : 'none',
                          },
                        }
                      : {}),
                  }}
                >
                  {tab.label}
                </Button>
              );
            })}
          </Box>
        </Card>
      </Grid>

      {/* Right Section - Content */}
      <Grid size={{ xs: 12, md: 8, lg: 9.7 }} sx={{ height: '100%' }}>
        <Box
          sx={{
            gap: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '0',
          }}
        >
          <Card sx={{ p: 1, flexGrow: 1, height: '100%', overflow: 'hidden' }}>
            <Scrollbar sx={{ height: '100%' }}>
              <Box sx={{ p: 1, gap: 1, minWidth: 360, display: 'flex', flexDirection: 'column' }}>
                {tabs.value === 'timetable' && <AcademicTimetable />}
                {tabs.value === 'subjectPerformace' && <SubjectPerformance />}
                {tabs.value === 'homework/assignments' && <MyProfileSubmission />}
                {tabs.value === 'examination' && <ProfileExamination />}
              </Box>
            </Scrollbar>
          </Card>
        </Box>
      </Grid>
    </Grid>
  );
};

export default AcademicTabs;
