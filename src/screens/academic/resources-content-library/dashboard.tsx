import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import {
  Box,
  Card,
  Grid,
  List,
  alpha,
  Button,
  ListItem,
  useTheme,
  Typography,
  CardContent,
  ListItemText,
} from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const resourcesData = [
  {
    title: 'cricket player list',
    uploadDate: '01-01-2024',
    fileType: 'PDF',
    size: '2.5 MB',
    downloadLink: '/path/to/student-record.pdf',
  },
  {
    title: 'chess competition winner',
    uploadDate: '15-01-2024',
    fileType: 'XLSX',
    size: '1.2 MB',
    downloadLink: '/path/to/attendance-record.xlsx',
  },
];

const quickStatsData = [
  { label: 'Total resources uploaded', value: 30 },
  { label: 'Shared resources', value: 10 },
  { label: 'Favorites', value: 3 },
];

const Dashboard = (props: TabComponentType) => {
  const theme = useTheme();
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              display: 'flex',
              p: 1,
              width: '100%',
              height: '100%',
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ typography: 'subtitle2' }}>Recent Resources</Box>
              <Scrollbar sx={{ mt: 1.5 }}>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    padding: 0,
                    height: '150px',
                    m: 0.5,
                  }}
                >
                  {resourcesData.map((resource, index) => (
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{
                        justifyContent: 'start',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {resource.title}
                    </Button>
                  ))}
                </Box>
              </Scrollbar>
            </Box>{' '}
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <DataCard title="Quick Stats" data={quickStatsData} />
        </Grid>
        <Grid item xs={12}>
          <AnalyticsWebsiteVisits
            title="Categories Overview"
            //   subheader="(+43%) than last year"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
              series: [
                { name: 'Assignments', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                { name: 'Lectures', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
              ],
              colors: [
                alpha(theme.palette.primary.dark, 0.8),
                alpha(theme.palette.warning.main, 0.8),
              ],
            }}
            sx={{ height: '100%' }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
export default Dashboard;

function DataCard({ title, data, sx }: any) {
  return (
    <Card sx={sx}>
      <CardContent>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        <List>
          {data.map((item: any) => (
            <ListItem key={item.label}>
              <ListItemText
                primary={
                  <Typography>
                    {item.label}: {item.value}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
