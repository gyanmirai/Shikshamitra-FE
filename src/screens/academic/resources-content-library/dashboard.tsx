import React from 'react';

import { InsertDriveFile } from '@mui/icons-material';
import {
  Box,
  Card,
  Grid,
  List,
  alpha,
  ListItem,
  useTheme,
  Typography,
  CardContent,
  ListItemText,
} from '@mui/material';

import CustomSelect from 'src/components/custom-select';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const recentUploadsData = [
  { label: 'Thumbnail', value: 'PDF', icon: InsertDriveFile },
  { label: 'File Name', value: 'Book' },
  { label: 'Upload Date', value: '01-01-2024' },
  { label: 'File Type', value: 'PDF' },
];
const quickStatsData = [
  { label: 'Total resources uploaded', value: 30 },
  { label: 'Shared resources', value: 10 },
  { label: 'Favorites', value: 3 },
  {
    label: 'Most downloaded',
    value: 'Book PDF, XYZ PDF, ABC BOOK',
  },
];

const Dashboard = () => {
  const theme = useTheme();
  return (
    <Box>
      <Box display="flex" gap={2} mb={2}>
        <CustomSelect
          label="Organization"
          options={[
            { value: 'org1', label: 'Organization 1' },
            { value: 'org2', label: 'Organization 2' },
            { value: 'org3', label: 'Organization 3' },
          ]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />
        <CustomSelect
          label="Class"
          options={[
            { value: 'class1', label: 'Class A' },
            { value: 'class2', label: 'Class B' },
            { value: 'class3', label: 'Class C' },
          ]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />{' '}
        <CustomSelect
          label="Sort by"
          options={[
            { value: 'uploadDate', label: 'Upload date' },
            { value: 'fileType', label: 'File type' },
            { value: 'popularity', label: 'Popularity' },
          ]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />{' '}
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <DataCard title="Recent Uploads" data={recentUploadsData} />
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
