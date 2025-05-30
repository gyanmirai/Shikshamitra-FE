import type { IconButtonProps } from '@mui/material/IconButton';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from '../../iconify';

import type { SingleFilePreviewProps } from '../types';

// ----------------------------------------------------------------------

export function SingleFilePreview({ file }: SingleFilePreviewProps) {
  const fileName = typeof file === 'string' ? file : file.name;
  const previewUrl = typeof file === 'string' ? file : URL.createObjectURL(file);

  const getFileType = () => {
    if (typeof file === 'string') {
      return file.split('.').pop()?.toLowerCase() || '';
    }
    return file.type.split('/')[0];
  };

  const fileType = getFileType();

  const renderPreview = () => {
    if (fileType === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
      return (
        <Box
          component="img"
          alt={fileName}
          src={previewUrl}
          sx={{
            width: 1,
            height: 1,
            borderRadius: 1,
            objectFit: 'cover',
          }}
        />
      );
    }

    // For PDF files
    if (fileType === 'application' || /\.pdf$/i.test(fileName)) {
      return (
        <Box
          component="object"
          data={previewUrl}
          type="application/pdf"
          sx={{
            width: 1,
            height: 1,
            borderRadius: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 1,
              height: 1,
              bgcolor: 'background.neutral',
              borderRadius: 1,
            }}
          >
            <Iconify icon="eva:file-text-fill" width={48} />
          </Box>
        </Box>
      );
    }

    // For video files
    if (fileType === 'video' || /\.(mp4|webm|ogg)$/i.test(fileName)) {
      return (
        <Box
          component="video"
          // alt={fileName}
          src={previewUrl}
          controls
          sx={{
            width: 1,
            height: 1,
            borderRadius: 1,
            objectFit: 'cover',
          }}
        />
      );
    }

    // Default preview for other file types
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 1,
          height: 1,
          bgcolor: 'background.neutral',
          borderRadius: 1,
        }}
      >
        <Iconify icon="eva:file-fill" width={48} />
      </Box>
    );
  };

  return (
    <Box
      sx={{
        p: 1,
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        position: 'absolute',
      }}
    >
      {renderPreview()}
    </Box>
  );
}

// ----------------------------------------------------------------------

export function DeleteButton({ sx, ...other }: IconButtonProps) {
  return (
    <IconButton
      size="small"
      sx={{
        top: 16,
        right: 16,
        zIndex: 9,
        position: 'absolute',
        color: (theme) => varAlpha(theme.vars.palette.common.whiteChannel, 0.8),
        bgcolor: (theme) => varAlpha(theme.vars.palette.grey['900Channel'], 0.72),
        '&:hover': { bgcolor: (theme) => varAlpha(theme.vars.palette.grey['900Channel'], 0.48) },
        ...sx,
      }}
      {...other}
    >
      <Iconify icon="mingcute:close-line" width={18} />
    </IconButton>
  );
}
