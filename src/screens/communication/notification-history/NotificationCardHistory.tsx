import React from 'react';
import dayjs from 'dayjs';
import { useTheme } from '@mui/material/styles';
import { Box, Card, Grid, Paper, Divider, Typography, CardContent } from '@mui/material';

import type { INotification } from './type';

const NotificationCard: React.FC<{ data: INotification | null }> = ({ data }) => {
  const theme = useTheme();
  return (
    <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
      <CardContent sx={{ p: 0 }}>
        <Grid container spacing={3}>
          {/* BASIC INFO */}
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}
          >
            <Typography variant="h6" mb={2} color="primary.main">
              Basic Information
            </Typography>

            <Grid container spacing={2}>
              <Grid size={6}>
                <Typography color="text.secondary">Title</Typography>
                <Typography sx={{ fontWeight: 300 }} variant="body2">
                  {data?.title}
                </Typography>
              </Grid>

              {/* <Grid size={6}>
                <Typography color="text.secondary">Category</Typography>
                <Box sx={{ fontWeight: 300, display: 'inline-block' }}>
                  <Chip label={data?.category || ''} color="primary" size="small" />
                </Box>
              </Grid> */}

              <Grid size={6}>
                <Typography color="text.secondary">Sent by</Typography>
                <Typography sx={{ fontWeight: 300 }} variant="body2">
                  {data?.sentBy || ''}
                </Typography>
              </Grid>

              <Grid size={6}>
                <Typography color="text.secondary">Date</Typography>
                <Typography sx={{ fontWeight: 300 }} variant="body2">
                  {dayjs(data?.dateTime).format('DD-MM-YYYY hh:mm')}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* DELIVERY STATS */}

          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}
          >
            <Typography variant="h6" mb={2} color="primary.main">
              Delivery Status
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: theme.palette.info.lighter }}>
                  <Typography variant="caption">TOTAL RECIPIENTS</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {data?.totalRecipients || ''}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: theme.palette.success.lighter }}>
                  <Typography variant="caption">DELIVERED</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {data?.delivered || ''}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: theme.palette.success.lighter }}>
                  <Typography variant="caption">OPENED</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {data?.opened}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: theme.palette.error.lighter }}>
                  <Typography variant="caption">FAILED</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {data?.failed || ''}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 1 }} />

        {/* MESSAGE CONTENT */}
        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}>
          <Typography variant="h6" mb={2} color="primary.main">
            Message Content
          </Typography>
          <Paper sx={{ p: 2, bgcolor: theme.palette.secondary.lighter }}>
            <Typography variant="body2">
              <strong>Subject:</strong> {data?.subject || ''}
            </Typography>
            <Typography variant="body2" mt={1}>
              {data?.body || ''}
            </Typography>
          </Paper>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
