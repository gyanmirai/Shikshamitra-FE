'use client';

import { alpha } from '@mui/material/styles';
import React, { memo, useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import { Visibility, AttachFile } from '@mui/icons-material';
import { Box, Tooltip, Typography, IconButton } from '@mui/material';

interface Props {
  attachment: File | string;
}

const AnnouncementAttachmentCard = ({ attachment }: Props) => {
  const isFile = attachment instanceof File;

  /**
   * Memoization Justification:
   * useCallback is used for handlers passed to IconButton which is a part of this memoized card.
   * This prevents re-creation of handlers on every parent render.
   */
  const handlePreview = useCallback(() => {
    const url = isFile ? URL.createObjectURL(attachment) : attachment;
    window.open(url, '_blank');
  }, [attachment, isFile]);

  const handleDownload = useCallback(() => {
    const url = isFile ? URL.createObjectURL(attachment) : attachment;
    const a = document.createElement('a');
    a.href = url;
    a.download = isFile ? attachment.name : (attachment as string).split('/').pop() || 'attachment';
    a.click();
    if (isFile) URL.revokeObjectURL(url);
  }, [attachment, isFile]);

  const fileName = isFile
    ? attachment.name
    : (attachment as string).split('/').pop() || 'attachment';
  const fileSize = isFile && attachment.size ? `${(attachment.size / 1024).toFixed(2)} KB` : '';

  return (
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
          {fileName}
        </Typography>
        {fileSize && (
          <Typography
            component="span"
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            {fileSize}
          </Typography>
        )}
      </Box>
      <Box display="flex" gap={1}>
        <Tooltip title="Preview">
          <IconButton
            size="small"
            aria-label="preview"
            onClick={handlePreview}
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
            onClick={handleDownload}
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
  );
};

/**
 * Memoization Justification:
 * Component is pure and receives a File or string. Memoizing prevents re-renders
 * unless the attachment reference changes.
 */
export default memo(AnnouncementAttachmentCard);
