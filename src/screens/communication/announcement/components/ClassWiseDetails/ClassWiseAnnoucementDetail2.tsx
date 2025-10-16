'use client';

import React from 'react';
import { Visibility, AttachFile } from '@mui/icons-material';
import { Box, Card, Stack, Button, Typography } from '@mui/material';

import type { IClassWiseAnnouncement } from '../../type';

export default function ClassWiseAnnouncementDetailCard({
  announcement,
}: {
  announcement: IClassWiseAnnouncement | null;
}) {
  return (
    <Box>
      <Card sx={{ p: 2, mb: 2, boxShadow: 3 }}>
        {/* Description */}
        <Typography variant="body2" color="text.secondary" mb={0.5}>
          Description
        </Typography>
        <Typography variant="body1">{announcement?.description || '—'}</Typography>
      </Card>
      {/* Attachment */}
      {announcement?.attachment && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            p: 1.5,
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            mt: 1,
            bgcolor: 'grey.50',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <AttachFile fontSize="small" color="action" />
            <Typography variant="body2">Attachment: {announcement.attachment.name}</Typography>
          </Stack>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => {
              const url = announcement.attachment
                ? URL.createObjectURL(announcement.attachment)
                : '';
              window.open(url, '_blank');
            }}
          >
            View
          </Button>
        </Stack>
      )}
    </Box>
  );
}
