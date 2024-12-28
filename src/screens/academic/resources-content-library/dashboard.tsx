'use client';

import type { CardProps } from '@mui/material';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';

import {
  Box,
  Card,
  Grid,
  List,
  alpha,
  Button,
  Tooltip,
  ListItem,
  useTheme,
  Typography,
  CardContent,
  ListItemText,
} from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

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
  const [hoveredResource, setHoveredResource] = useState<string | null>(null);
  const theme = useTheme();
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Dashboard"
        links={[
          { name: 'Academic and Assignment' },
          { name: 'Resource Content Library' },
          { name: 'Dashboard' },
        ]}
        sx={{ px: 1, mb: 6 }}
      />
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
              <Box sx={{ typography: 'subtitle1' }}>Recent Resources</Box>
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
                      key={index}
                      variant="outlined"
                      fullWidth
                      sx={{
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                        mb: 1,
                      }}
                      onMouseEnter={() => setHoveredResource(resource.title)}
                      onMouseLeave={() => setHoveredResource(null)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography>{resource.title}</Typography>
                        {hoveredResource === resource.title && (
                          <Typography
                            variant="caption"
                            sx={{
                              ml: 2,
                              color: 'text.secondary',
                            }}
                          >
                            Uploaded: {resource.uploadDate}
                          </Typography>
                        )}
                      </Box>
                      {hoveredResource === resource.title && (
                        <Tooltip title="Download">
                          <Iconify
                            icon="ic:baseline-download"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            sx={{
                              position: 'absolute',
                              right: 10,
                              top: '50%',
                              transform: 'translateY(-50%)',
                            }}
                          />
                        </Tooltip>
                      )}
                    </Button>
                  ))}
                </Box>
              </Scrollbar>
            </Box>{' '}
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <AnalyticsTrafficBySite list={quickStatsData} />
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

type Props = CardProps & {
  title?: string;
  subheader?: string;
  list: { value: number; label: string }[];
};

const icons: { [key: string]: JSX.Element } = {
  'Total resources uploaded': <Iconify icon="mdi:resource-description-framework" />,
  'Shared resources': <Iconify icon="mdi:share-variant" />,
  Favorites: <Iconify icon="mdi:star" />,
};

export function AnalyticsTrafficBySite({ title, subheader, list, ...other }: Props) {
  const theme = useTheme();

  return (
    <Card {...other}>
      <Box display="grid" gap={2} gridTemplateColumns="repeat(2, 1fr)" sx={{ p: 3 }}>
        {list.map((site) => (
          <Box
            key={site.label}
            sx={{
              py: 2.5,
              display: 'flex',
              borderRadius: 1.5,
              textAlign: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
            }}
          >
            {icons[site.label]}
            <Typography variant="h6" sx={{ mt: 1 }}>
              {site.value}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {site.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
