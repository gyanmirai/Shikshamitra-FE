import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { red, blue, grey, green, yellow } from '@mui/material/colors';
import {
  Box,
  Grid,
  Card,
  List,
  Paper,
  Avatar,
  Divider,
  Checkbox,
  ListItem,
  useTheme,
  Typography,
  CardContent,
} from '@mui/material';

import CustomSelect from 'src/components/custom-select';

const Dashboard = (props: TabComponentType) => {
  const theme = useTheme();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box display="flex" gap={2} alignItems="center">
        <CustomSelect options={[]} value="" onChange={() => {}} label="Organization" />
        <CustomSelect options={[]} value="" onChange={() => {}} label="Class" />
      </Box>
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Header Section */}
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom color="text.primary">
            Welcome, [John Doe]
          </Typography>
        </Grid>

        {/* Total Assignments */}
        <Grid item xs={3}>
          <Card sx={{ backgroundColor: blue[50], borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" color={blue[800]} gutterBottom>
                Total Assignments
              </Typography>
              <Typography variant="body1" color="black">
                35 Assignments
              </Typography>
              <Typography variant="body2" color="black">
                Active: 10
              </Typography>
              <Typography variant="body2" color="black">
                Pending: 15
              </Typography>
              <Typography variant="body2" color="black">
                Overdue: 10
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Submissions Pending */}
        <Grid item xs={3}>
          <Card sx={{ backgroundColor: yellow[50], borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                color={theme.palette.mode === 'dark' ? yellow[200] : yellow[800]}
                gutterBottom
              >
                Submissions Pending
              </Typography>
              <Typography variant="body1" color="black">
                7 Pending Submissions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Grading Queue */}
        <Grid item xs={3}>
          <Card sx={{ backgroundColor: green[50], borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                color={theme.palette.mode === 'dark' ? green[200] : green[800]}
                gutterBottom
              >
                Grading Queue
              </Typography>
              <Typography variant="body1" color="black">
                12 Assignments to Grade
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Deadlines */}
        <Grid item xs={3}>
          <Card sx={{ backgroundColor: red[50], borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                color={theme.palette.mode === 'dark' ? red[200] : red[800]}
                gutterBottom
              >
                Upcoming Deadlines
              </Typography>
              <Typography variant="body2" color="black">
                Math Assignment - Due Oct 5
              </Typography>
              <Typography variant="body2" color="black">
                Science Assignment - Due Oct 10
              </Typography>
              <Typography variant="body2" color="black">
                English Assignment - Due Oct 15
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Submission Status */}
        <Grid item xs={6}>
          <Card sx={{ backgroundColor: grey[50], borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Submission Status
              </Typography>
              <List>
                <ListItem>
                  <Avatar sx={{ bgcolor: green[500], mr: 2 }} />
                  <Typography color="black">Math Assignment 1 - Due 10-10-2024</Typography>
                </ListItem>
                <Divider />
                <ListItem>
                  <Avatar sx={{ bgcolor: yellow[500], mr: 2 }} />
                  <Typography color="black">Math Assignment 2 - Due 02-10-2024</Typography>
                </ListItem>
                <Divider />
                <ListItem>
                  <Avatar sx={{ bgcolor: red[500], mr: 2 }} />
                  <Typography color="black">Math Assignment 3 - Due 30-09-2024</Typography>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* To-Do List */}
        <Grid item xs={6}>
          <Card sx={{ backgroundColor: blue[50], borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                color={theme.palette.mode === 'dark' ? blue[200] : blue[800]}
                gutterBottom
              >
                To-Do List
              </Typography>
              <List>
                <ListItem>
                  <Checkbox />
                  <Typography color="black">Complete Math Assignment Before 10-10-2024</Typography>
                </ListItem>
                <Divider />
                <ListItem>
                  <Checkbox />
                  <Typography color="black">
                    Complete Science Assignment Before 10-10-2024
                  </Typography>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Parent Dashboard */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              Parent Dashboard
            </Typography>
            <Typography variant="body1">Welcome, [Parents Name]</Typography>
            <Typography variant="body2">John Doe Grade 05</Typography>
          </Paper>
        </Grid>

        {/* Assignment Overview */}
        <Grid item xs={6}>
          <Card sx={{ backgroundColor: grey[50], borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" color="black" gutterBottom>
                Assignment Overview
              </Typography>
              <List>
                <ListItem>
                  <Avatar sx={{ bgcolor: green[500], mr: 2 }} />
                  <Typography color="black">Math Assignment 1 - Due 10-10-2024</Typography>
                </ListItem>
                <Divider />
                <ListItem>
                  <Avatar sx={{ bgcolor: yellow[500], mr: 2 }} />
                  <Typography color="black">Math Assignment 2 - Due 02-10-2024</Typography>
                </ListItem>
                <Divider />
                <ListItem>
                  <Avatar sx={{ bgcolor: red[500], mr: 2 }} />
                  <Typography color="black">Math Assignment 3 - Due 30-09-2024</Typography>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Deadlines */}
        <Grid item xs={6}>
          <Card sx={{ backgroundColor: red[50], borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                color={theme.palette.mode === 'dark' ? red[200] : red[800]}
                gutterBottom
              >
                Upcoming Deadlines
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Math Assignment 1 - Due in 10 days
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Math Assignment 2 - Due in 3 days
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Math Assignment 3 - Due in 3 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
