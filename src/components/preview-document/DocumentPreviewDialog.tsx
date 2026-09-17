import React, { useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { getCachedAuthSession } from 'src/redux/session-cache';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { useGetCurriculumFileByNameMutation } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

interface DocumentPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  /** The stored file path returned by the upload API, e.g. "/files/abc123.pdf" */
  url: string;
  documentName?: string;
  /** Fetch the complete API URL instead of resolving it through the curriculum file client. */
  directUrl?: boolean;
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
  directUrl = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [isDirectLoading, setIsDirectLoading] = useState(false);

  const [getFile, { isLoading: isLegacyLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useGetCurriculumFileByNameMutation,
    popupConfig: { error: true, errorMessage: 'Unable to load document preview.', success: false },
  });

  // Fetch file whenever dialog opens with a new URL
  useEffect(() => {
    if (!open || !url) return;

    let active = true;
    const abortController = new AbortController();

    const load = async () => {
      try {
        let blob: Blob;
        if (directUrl) {
          setIsDirectLoading(true);
          const apiRoot = process.env.NEXT_PUBLIC_API_URL || '';
          const requestUrl = /^(https?:)?\/\//i.test(url)
            ? url
            : `${apiRoot}${url.startsWith('/') ? '' : '/'}${url}`;
          const requestOrigin = new URL(requestUrl, window.location.origin).origin;
          const allowedOrigin = new URL(apiRoot || window.location.origin, window.location.origin)
            .origin;
          if (requestOrigin !== allowedOrigin) throw new Error('Document URL is outside the API.');
          const session = await getCachedAuthSession();
          const headers = new Headers();
          if (session?.accessToken) headers.set('Authorization', `Bearer ${session.accessToken}`);
          const response = await fetch(requestUrl, {
            credentials: 'include',
            headers,
            signal: abortController.signal,
          });
          if (!response.ok) throw new Error(`Document request failed with ${response.status}`);
          blob = await response.blob();
        } else {
          const fileName = getFileNameFromUrl(url);
          if (!fileName) {
            shikshaMitraToast.error({ message: 'Unable to resolve file name for preview.' });
            return;
          }
          blob = await getFile(fileName).unwrap();
        }
        if (!active) return;
        const objectUrl = URL.createObjectURL(blob);
        setMimeType(blob.type || '');
        setPreviewUrl(objectUrl);
      } catch (error) {
        if (active && !(error instanceof DOMException && error.name === 'AbortError')) {
          setPreviewUrl(null);
          if (directUrl) {
            shikshaMitraToast.error({ message: 'Unable to load document preview.' });
          }
        }
      } finally {
        if (active) setIsDirectLoading(false);
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
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [directUrl, open, url]);

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
  const isLoading = directUrl ? isDirectLoading : isLegacyLoading;

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
