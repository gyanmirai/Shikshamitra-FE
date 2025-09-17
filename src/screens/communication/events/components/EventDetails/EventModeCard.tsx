import React from 'react';
import { Box, Card, Grid, Stack, Typography } from '@mui/material';
import { Notifications, Link as LinkIcon } from '@mui/icons-material';

import type { IEventAnnouncement } from '../../type';

const EventModeCard = ({ event }: { event: IEventAnnouncement | null }) => (
  <Grid size={{ xs: 12, md: 6 }}>
    <Card
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <Box>
        <Typography variant="body2" color="success.main" mb={1}>
          Event Mode
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Notifications fontSize="small" color="action" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Event Mode
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {event?.eventMode === 'online' ? 'Online' : 'Offline'}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {event?.eventMode === 'online' && event?.onlineLink && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <LinkIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Online Link
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="600"
                    sx={{ cursor: 'pointer', color: 'primary.main' }}
                    onClick={() => window.open(event.onlineLink, '_blank')}
                  >
                    Join Meeting
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          )}

          {event?.eventMode === 'offline' && event?.venue && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <LinkIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Venue
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {event?.venue}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          )}
        </Grid>
      </Box>
    </Card>
  </Grid>
);

export default EventModeCard;
