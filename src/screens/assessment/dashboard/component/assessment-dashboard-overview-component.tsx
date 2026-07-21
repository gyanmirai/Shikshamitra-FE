import React from 'react';
import CustomSelect from 'src/components/custom-select';
import { CalendarView } from 'src/sections/calendar/view';
import ScrollableCard from 'src/screens/examination/dashboard/component/custom-scrollable-card';
import {
  Box,
  Grid,
  Card,
  List,
  Button,
  ListItem,
  Typography,
  ListItemText,
  CircularProgress,
} from '@mui/material';

const AssessmentDashboardOverviewComponent = () => {
  const completedAssessments: string[] = ['one', 'two', 'three'];
  // const pendingAssessments: string[] = ["one", "two", "three"];
  return (
    <Box>
      <Box
        sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end', mb: 1 }}
      >
        <Button color="secondary" variant="contained">
          Assessment
        </Button>
        <Button color="primary" variant="contained">
          Review Pending Assesment
        </Button>

        <Button color="warning" variant="contained">
          Upload Assesment Result
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          <ScrollableCard showFilter={false} title="Pending Exams" content={completedAssessments} />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          <ScrollableCard showFilter={false} title="Pending Exams" content={completedAssessments} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography component="span" variant="h6" gutterBottom>
              Average Grades per Assessment
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Box position="relative" display="inline-flex" mr={2}>
                <CircularProgress
                  variant="determinate"
                  value={73.9}
                  size={60}
                  thickness={4}
                  color="success"
                />
                <Box
                  top={0}
                  left={0}
                  bottom={0}
                  right={0}
                  position="absolute"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Typography variant="caption" component="div">
                    A+
                  </Typography>
                </Box>
              </Box>
              <Typography>Math Assessment</Typography>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 6 }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography component="span" variant="h6" gutterBottom>
              Top and Underperforming Students
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, lg: 6 }}>
                <List>
                  {['Top Performing Students', 1, 2, 3].map((value, index) => (
                    <ListItem key={value} disableGutters>
                      <ListItemText
                        sx={{ color: 'green' }}
                        primary={index === 0 ? value : `Line item ${value}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              <Grid size={{ xs: 12, lg: 6 }}>
                <List>
                  {['Underperforming Students', 1, 2, 3].map((value, index) => (
                    <ListItem key={value} disableGutters>
                      <ListItemText
                        sx={{ color: 'red' }}
                        primary={index === 0 ? value : `Line item ${value}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      <Box display="flex" flexDirection="row" gap={1} sx={{ pt: '20px', pb: '20px' }}>
        <CustomSelect
          label="Class"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 120 } }}
        />
        <CustomSelect
          label="Subject"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 120 } }}
        />
        <CustomSelect
          label="Teacher"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 120 } }}
        />
      </Box>
      <CalendarView />
    </Box>
  );
};

export default AssessmentDashboardOverviewComponent;
