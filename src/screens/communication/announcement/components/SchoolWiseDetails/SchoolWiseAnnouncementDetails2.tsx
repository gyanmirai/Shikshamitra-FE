'use client';

import React from 'react';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Visibility, AttachFile } from '@mui/icons-material';
import { Box, Card, Tooltip, Typography, IconButton } from '@mui/material';

import type { ISchoolWiseAnnouncement } from '../../type';

export default function SchoolWiseAnnouncementDetailCard({
  announcement,
}: {
  announcement: ISchoolWiseAnnouncement | null;
}) {
  return (
    <Box>
      {announcement?.attachment ? (
        <Card
          sx={{
            p: 3,
            borderRadius: 2,
            border: (theme) => `1px dashed ${theme.palette.divider}`,
            boxShadow: 'none',
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
              border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AttachFile fontSize="medium" color="action" />
            </Box>
            <Box flexGrow={1}>
              <Typography variant="subtitle2" sx={{ color: 'text.primary', mb: 0.5 }}>
                {announcement.attachment.name}
              </Typography>
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                {announcement.attachment.size && `${announcement.attachment.size}`}
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Tooltip title="Preview">
                <IconButton
                  size="small"
                  aria-label="preview"
                  onClick={() => {
                    const url = URL.createObjectURL(announcement.attachment);
                    window.open(url, '_blank');
                  }}
                  sx={{
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
                    },
                  }}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download">
                <IconButton
                  size="small"
                  aria-label="download"
                  onClick={() => {
                    const url = URL.createObjectURL(announcement.attachment);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = announcement.attachment.name;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  sx={{
                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                    color: 'success.main',
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.success.main, 0.16),
                    },
                  }}
                >
                  <Iconify icon="mdi:download" width={20} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
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
}
