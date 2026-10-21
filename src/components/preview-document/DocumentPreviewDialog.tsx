import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography, CircularProgress } from '@mui/material';

import PdfPreview from './pdf-preview';
import { useDocumentPreview } from './use-document-preview';

interface DocumentPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  url: string;
  documentName?: string;
  /** Use the checked API origin and current session instead of the legacy curriculum client. */
  directUrl?: boolean;
}

export default function DocumentPreviewDialog({
  open,
  onClose,
  url,
  documentName = 'Document Preview',
  directUrl = false,
}: DocumentPreviewDialogProps) {
  const preview = useDocumentPreview(open, url, directUrl);
  const close = () => {
    preview.clear();
    onClose();
  };
  return (
    <CustomDialog
      open={open}
      handleClose={close}
      title={documentName}
      titleInfo="Preview this file. PDF pages can be enlarged and navigated individually."
      maxWidth="md"
      hasForm={false}
      guardUnsavedChanges={false}
      paperProps={{ sx: { maxHeight: '92vh' } }}
    >
      <Scrollbar
        sx={{ height: { xs: '48vh', sm: '58vh', md: '64vh' }, maxHeight: 'calc(100vh - 180px)' }}
      >
        {preview.isLoading ? (
          <Box display="flex" flexDirection="column" alignItems="center" gap={1} py={6}>
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary">
              Loading preview...
            </Typography>
          </Box>
        ) : preview.previewUrl ? (
          preview.mimeType.includes('pdf') ? (
            <Box sx={{ p: 1 }}>
              <PdfPreview url={preview.previewUrl} title={documentName} />
            </Box>
          ) : preview.mimeType.startsWith('image/') ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={2}>
              <Box
                component="img"
                src={preview.previewUrl}
                alt={documentName}
                sx={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }}
              />
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" alignItems="center" gap={1} py={6}>
              <Typography variant="body2" color="text.secondary">
                Preview is not supported for this file type.
              </Typography>
              <Button
                variant="outlined"
                component="a"
                href={preview.previewUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open Document
              </Button>
            </Box>
          )
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            gap={1}
            justifyContent="center"
            alignItems="center"
            py={6}
          >
            <Typography variant="body2" color="text.secondary">
              Document preview is not available right now.
            </Typography>
            <Button size="small" onClick={preview.retry}>
              Retry Preview
            </Button>
          </Box>
        )}
      </Scrollbar>
    </CustomDialog>
  );
}
