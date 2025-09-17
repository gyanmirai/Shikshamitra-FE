import React from 'react';
import { AttachFile, Visibility } from '@mui/icons-material';
import { Box, Card, Stack, Button, Typography } from '@mui/material';

import type { IEventAnnouncement } from '../../type';

const EventDescriptionComponent = ({ event }: { event: IEventAnnouncement | null }) => (
  <Box>
    <Card sx={{ p: 2, mb: 2, boxShadow: 3 }}>
      {/* Description */}
      <Typography variant="body2" color="text.secondary" mb={0.5}>
        Description
      </Typography>
      <Typography variant="body1" mb={2}>
        {event?.description || '—'}
      </Typography>
    </Card>
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
  </Box>
);

export default EventDescriptionComponent;
