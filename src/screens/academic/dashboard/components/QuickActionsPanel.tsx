import Link from 'next/link';
import { Iconify } from 'src/components/iconify';
import { Grid, Button, Typography } from '@mui/material';
import { academicPaths } from 'src/constants/academic-menu';
import { DashboardWidgetWrapper } from 'src/screens/mainDashboard/component/dashboard-widget-wrapper';

const quickActions = [
  {
    id: 'qa-2',
    label: 'Upload Homework',
    icon: 'solar:notebook-bold',
    path: academicPaths.homework.learningTasks,
    color: 'success',
  },
  {
    id: 'qa-3',
    label: 'Add Assignment',
    icon: 'solar:clipboard-add-bold',
    path: academicPaths.homework.learningTasks,
    color: 'secondary',
  },
  {
    id: 'qa-4',
    label: 'Enter Grades',
    icon: 'solar:document-text-bold',
    path: academicPaths.examination.recordMarks,
    color: 'warning',
  },
  {
    id: 'qa-5',
    label: 'Open Timetable',
    icon: 'solar:calendar-bold',
    path: academicPaths.timetable.management,
    color: 'info',
  },
];

function QuickActionsPanel() {
  return (
    <DashboardWidgetWrapper
      title="Quick Actions Panel"
      subheader="One-click shortcuts for daily workflows"
    >
      <Grid container spacing={1}>
        {quickActions.map((action) => (
          <Grid size={{ xs: 6, sm: 4, md: 2 }} key={action.id}>
            <Button
              component={Link}
              href={action.path}
              color="inherit"
              sx={{
                width: '100%',
                px: 1,
                py: 1.25,
                borderRadius: 1.5,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.neutral',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
                '&:hover': {
                  bgcolor: 'background.paper',
                  boxShadow: (theme) => theme.shadows[3],
                },
              }}
            >
              <Iconify
                icon={action.icon}
                width={20}
                sx={{
                  color: `${action.color}.main`,
                }}
              />
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}
              >
                {action.label}
              </Typography>
            </Button>
          </Grid>
        ))}
      </Grid>
    </DashboardWidgetWrapper>
  );
}

export { QuickActionsPanel };
