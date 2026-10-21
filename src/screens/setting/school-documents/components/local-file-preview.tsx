import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Button, DialogActions } from '@mui/material';
import PdfPreview from 'src/components/preview-document/pdf-preview';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

export function LocalFilePreview({ file, onClose }: { file: File; onClose: () => void }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const value = URL.createObjectURL(file);
    setUrl(value);
    return () => URL.revokeObjectURL(value);
  }, [file]);
  return (
    <CustomDialog
      open
      hasForm={false}
      guardUnsavedChanges={false}
      maxWidth="md"
      title={file.name}
      titleInfo="Preview the selected file before submitting the document."
      handleClose={onClose}
    >
      <DialogScrollContent>
        {url &&
          (file.type === 'application/pdf' ? (
            <PdfPreview url={url} title={file.name} />
          ) : (
            <Box
              component="img"
              src={url}
              alt={file.name}
              sx={{ width: '100%', maxHeight: '60vh', objectFit: 'contain' }}
            />
          ))}
      </DialogScrollContent>
      <DialogActions>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
