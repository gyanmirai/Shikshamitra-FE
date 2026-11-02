import 'src/components/lightbox/styles.css';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Lightbox } from 'src/components/lightbox';
import { shikshaMitraToast } from 'src/components/toast';
import DocumentPreviewDialog from 'src/components/preview-document/DocumentPreviewDialog';
import { useDocumentPreview } from 'src/components/preview-document/use-document-preview';
import { fetchProtectedPreview } from 'src/components/preview-document/fetch-protected-preview';
import {
  Box,
  Stack,
  Button,
  Tooltip,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';

import type { SubmissionAttachment } from '../homeworkCreation/type';

export default function SubmissionAttachmentCard({ file }: { file: SubmissionAttachment }) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const isImage =
    file.contentType?.startsWith('image/') ||
    /\.(png|jpe?g|gif|webp)$/i.test(file.name) ||
    /\.(png|jpe?g|gif|webp)$/i.test(file.url.split('?')[0]);
  const thumbnail = useDocumentPreview(Boolean(isImage), file.url, true);

  const download = async () => {
    setDownloading(true);
    try {
      const blob = await fetchProtectedPreview(file.url, new AbortController().signal);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      shikshaMitraToast.error({ message: `Unable to download ${file.name}. Please try again.` });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Stack
      spacing={1}
      sx={{ minWidth: 0, border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5 }}
    >
      <Button
        size="small"
        color="inherit"
        aria-label={`Preview ${file.name}`}
        onClick={() => setOpen(true)}
        sx={{ height: 120, bgcolor: 'background.neutral' }}
      >
        {thumbnail.isLoading ? (
          <CircularProgress size={24} />
        ) : thumbnail.previewUrl ? (
          <Box
            component="img"
            src={thumbnail.previewUrl}
            alt={file.name}
            sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <Iconify icon={GlobalIcons.documentIcon} width={40} />
        )}
      </Button>
      <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
        {file.name}
      </Typography>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="caption" color="text.secondary">
          {file.size == null ? 'Size unavailable' : `${Math.ceil(file.size / 1024)} KB`}
        </Typography>
        <Tooltip title={`Download ${file.name}`}>
          <IconButton
            size="small"
            aria-label={`Download ${file.name}`}
            disabled={downloading}
            onClick={download}
          >
            {downloading ? (
              <CircularProgress size={18} />
            ) : (
              <Iconify icon={GlobalIcons.download} width={18} />
            )}
          </IconButton>
        </Tooltip>
      </Stack>
      {open &&
        (isImage && thumbnail.previewUrl ? (
          <Lightbox
            open
            close={() => setOpen(false)}
            slides={[{ src: thumbnail.previewUrl, alt: file.name }]}
            disableVideo
            disableSlideshow
            disableThumbnails
            disableCaptions
            disableTotal
          />
        ) : (
          <DocumentPreviewDialog
            open
            onClose={() => setOpen(false)}
            url={file.url}
            documentName={file.name}
            directUrl
          />
        ))}
    </Stack>
  );
}
