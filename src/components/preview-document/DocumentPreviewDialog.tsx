import React, { useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { useGetCurriculumFileByNameMutation } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

interface DocumentPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  /** The stored file path returned by the upload API, e.g. "/files/abc123.pdf" */
  url: string;
  documentName?: string;
}

const getFileNameFromUrl = (url: string): string => {
  if (!url) return '';
  const normalized = url.split('?')[0];
  const segments = normalized.split('/').filter(Boolean);
  return decodeURIComponent(segments[segments.length - 1] || '');
};

const DocumentPreviewDialog: React.FC<DocumentPreviewDialogProps> = ({
  open,
  onClose,
  url,
  documentName = 'Document Preview',
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');

  const [getFile, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useGetCurriculumFileByNameMutation,
    popupConfig: { error: true, errorMessage: 'Unable to load document preview.', success: false },
  });

  // Fetch file whenever dialog opens with a new URL
  useEffect(() => {
    if (!open || !url) return;

    let active = true;

    const load = async () => {
      const fileName = getFileNameFromUrl(url);
      if (!fileName) {
        shikshaMitraToast.error({ message: 'Unable to resolve file name for preview.' });
        return;
      }

      try {
        const blob = await getFile(fileName).unwrap();
        if (!active) return;
        const objectUrl = URL.createObjectURL(blob);
        setMimeType(blob.type || '');
        setPreviewUrl(objectUrl);
      } catch {
        if (active) setPreviewUrl(null);
      }
    };

    // Reset previous before loading
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setMimeType('');
    load();

    // eslint-disable-next-line consistent-return
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, url]);

  // Cleanup object URL on unmount
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const handleClose = () => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setMimeType('');
    onClose();
  };

  const isPdf = mimeType.includes('pdf');
  const isImage = mimeType.startsWith('image/');

  return (
    <CustomDialog
      open={open}
      handleClose={handleClose}
      title={documentName}
      maxWidth="md"
      hasForm={false}
      paperProps={{ sx: { maxHeight: '92vh' } }}
    >
      <Scrollbar
        sx={{ height: { xs: '48vh', sm: '58vh', md: '64vh' }, maxHeight: 'calc(100vh - 180px)' }}
      >
        {isLoading ? (
          <Box display="flex" flexDirection="column" alignItems="center" gap={1} py={6}>
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary">
              Loading preview...
            </Typography>
          </Box>
        ) : previewUrl ? (
          isPdf ? (
            <Box sx={{ height: { xs: '48vh', sm: '58vh', md: '64vh' }, p: 1 }}>
              <iframe
                title={documentName}
                src={previewUrl}
                style={{ border: 'none', width: '100%', height: '100%', display: 'block' }}
              />
            </Box>
          ) : isImage ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              p={2}
              minHeight={{ xs: '48vh', sm: '58vh', md: '64vh' }}
            >
              <img
                src={previewUrl}
                alt={documentName}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </Box>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              gap={1}
              py={6}
            >
              <Typography variant="body2" color="text.secondary" align="center">
                Preview is not supported for this file type.
              </Typography>
              <Button
                variant="outlined"
                component="a"
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open Document
              </Button>
            </Box>
          )
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" py={6}>
            <Typography variant="body2" color="text.secondary" align="center">
              Document preview is not available right now.
            </Typography>
          </Box>
        )}
      </Scrollbar>
    </CustomDialog>
  );
};

export default DocumentPreviewDialog;
