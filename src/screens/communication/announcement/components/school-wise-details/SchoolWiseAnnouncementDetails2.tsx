'use client';

import React, { memo } from 'react';
import { alpha } from '@mui/material/styles';
import { AttachFile } from '@mui/icons-material';
import { Box, Card, Typography } from '@mui/material';

import AnnouncementAttachmentCard from './AnnouncementAttachmentCard';

import type { ISchoolWiseAnnouncement } from '../../type';

interface Props {
  announcement: ISchoolWiseAnnouncement | null;
}

const SchoolWiseAnnouncementDetailCard = ({ announcement }: Props) => {
  const attachment = Array.isArray(announcement?.attachment)
    ? announcement.attachment[0]
    : announcement?.attachment;

  const hasAttachment = !!attachment;

  return (
    <Box>
      {hasAttachment ? (
        <Card
          sx={{
            p: 3,
            borderRadius: 2,
            border: (theme) => `1px dashed ${theme.palette.divider}`,
            boxShadow: 'none',
          }}
        >
          <AnnouncementAttachmentCard attachment={attachment} />
        </Card>
      ) : (
        <Card
          sx={{
            p: 4,
            borderRadius: 2,
            border: (theme) => `1px dashed ${theme.palette.divider}`,
            boxShadow: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          }}
        >
          <Box
            sx={{
              mb: 2,
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: (theme) => alpha(theme.palette.action.disabled, 0.12),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AttachFile sx={{ color: 'text.disabled' }} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            No attachment uploaded
          </Typography>
        </Card>
      )}
    </Box>
  );
};

/**
 * Memoization Justification:
 * Component displays detailed announcement information that only changes if the announcement
 * object reference changes. Wrapping in memo prevents re-renders when parent components
 * update for unrelated reasons.
 */
export default memo(SchoolWiseAnnouncementDetailCard);
