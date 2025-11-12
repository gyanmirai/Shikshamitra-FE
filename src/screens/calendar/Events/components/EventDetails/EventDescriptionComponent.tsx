import React from 'react';
import { Iconify } from 'src/components/iconify';
import { AttachFile, Visibility } from '@mui/icons-material';
import { Box, Card, Tooltip, IconButton, Typography } from '@mui/material';

import type { IEventAnnouncement } from '../../type';

const EventDescriptionComponent = ({ event }: { event: IEventAnnouncement | null }) => (
  <Box>
    {/* Attachment */}
    {event?.attachment ? (
      <Card sx={{ p: 2, mb: 2, boxShadow: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <AttachFile fontSize="small" color="action" />
          <Box flexGrow={1}>
            <Typography variant="body1">{event.attachment.name}</Typography>
            <Typography component="span" variant="body2" color="text.secondary">
              {event.attachment.size && ` • ${event.attachment.size}`}
            </Typography>
          </Box>
          <Box display="flex">
            <Tooltip title="Preview">
              <IconButton
                aria-label="preview"
                onClick={() => {
                  // const url = URL.createObjectURL(event.attachment);
                  // window.open(url, '_blank');
                }}
              >
                <Visibility />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton
                aria-label="download"
                // onClick={() => {
                //   const url = URL.createObjectURL(event.attachment);
                //   const a = document.createElement('a');
                //   a.href = url;
                //   a.download = event.attachment.name;
                //   a.click();
                //   URL.revokeObjectURL(url);
                // }}
              >
                <Iconify icon="mdi:download" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Card>
    ) : (
      <Card sx={{ p: 2, mb: 2, boxShadow: 3, display: 'flex', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No attachment uploaded
        </Typography>
      </Card>
    )}
  </Box>
);

export default EventDescriptionComponent;
