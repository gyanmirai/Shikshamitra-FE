import React from 'react';
import { Box, Grid, Card, Stack, Button, Divider, Typography } from '@mui/material';
import { Groups, People, School, AttachFile, Visibility } from '@mui/icons-material';

import type { IEventAnnouncement } from '../../type';

const EventDescriptionComponent = ({ event }: { event: IEventAnnouncement | null }) => (
  <Card sx={{ p: 2, mb: 2, boxShadow: 3 }}>
    {/* Description */}
    <Typography variant="body2" color="text.secondary" mb={0.5}>
      Description
    </Typography>
    <Typography variant="body1" mb={2}>
      {event?.description || '—'}
    </Typography>

    {/* Audience, Class, Division */}
    <Grid container spacing={2} alignItems="center">
      <Grid size={{ xs: 12, md: 4 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Groups fontSize="small" color="action" />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Target Audience
            </Typography>
            <Typography variant="body1" fontWeight="600">
              {event?.audience?.join(', ') || '—'}
            </Typography>
          </Box>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <School fontSize="small" color="action" />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Class
            </Typography>
            <Typography variant="body1" fontWeight="600">
              {event?.classes?.join(', ') || '—'}
            </Typography>
          </Box>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <People fontSize="small" color="action" />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Division
            </Typography>
            <Typography variant="body1" fontWeight="600">
              {event?.divisions?.join(', ') || '—'}
            </Typography>
          </Box>
        </Stack>
      </Grid>
    </Grid>

    <Divider sx={{ my: 2 }} />

    {/* Attachment */}
    {event?.link && (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          p: 1.5,
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          mt: 2,
          bgcolor: 'grey.50',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <AttachFile fontSize="small" color="action" />
          <Typography variant="body2">Attachment: {event.link}</Typography>
        </Stack>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Visibility />}
          onClick={() => window.open(event.link, '_blank')}
        >
          View
        </Button>
      </Stack>
    )}
  </Card>
);

export default EventDescriptionComponent;
