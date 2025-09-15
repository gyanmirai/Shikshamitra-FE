'use client';

import React from 'react';
import { Groups, Visibility, AttachFile } from '@mui/icons-material';
import { Box, Grid, Card, Stack, Button, Divider, Typography } from '@mui/material';

import type { IClassWiseAnnouncement } from '../../type';

export default function ClassWiseAnnouncementDetailCard({
  announcement,
}: {
  announcement: IClassWiseAnnouncement | null;
}) {
  return (
    <Card sx={{ p: 2, mb: 2, boxShadow: 3 }}>
      {/* Description */}
      <Typography variant="body2" color="text.secondary" mb={0.5}>
        Description
      </Typography>
      <Typography variant="body1" mb={2}>
        {announcement?.description || '—'}
      </Typography>

      {/* Audience, Class, Division, Viewed By */}
      <Grid container spacing={2} alignItems="center">
        {/* Target Audience */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Groups fontSize="small" color="action" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Target Audience
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {announcement?.audience?.join(', ') || '—'}
              </Typography>
            </Box>
          </Stack>
        </Grid>

        {/* Class */}
        {/* <Grid size={{ xs: 12, md: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <School fontSize="small" color="action" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Class
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {announcement?.classes?.join(', ') || '—'}
              </Typography>
            </Box>
          </Stack>
        </Grid> */}

        {/* Division */}
        {/* <Grid size={{ xs: 12, md: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Groups fontSize="small" color="action" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Division
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {announcement?.divisions?.join(', ') || '—'}
              </Typography>
            </Box>
          </Stack>
        </Grid> */}

        {/* Viewed By */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Visibility fontSize="small" color="action" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Viewed By
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {announcement?.viewedBy || 0}
              </Typography>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Attachment */}
      {announcement?.link && (
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
            <Typography variant="body2">Attachment: {announcement.link}</Typography>
          </Stack>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => window.open(announcement.link, '_blank')}
          >
            View
          </Button>
        </Stack>
      )}
    </Card>
  );
}
