import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import DialogActions from '@mui/material/DialogActions';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { usePreviewSchoolIdentityMutation } from 'src/redux/InstituteSetup/schoolIdentityApi';

import type { IdentityChoices, IdentityContext } from '../types';

export function IdentityPreviewButton({
  context,
  choices,
  disabled = false,
}: {
  context: IdentityContext;
  choices?: IdentityChoices;
  disabled?: boolean;
}) {
  const [preview, loading] = usePreviewSchoolIdentityMutation();
  const [file, setFile] = useState<Blob | null>(null);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (!file) {
      setUrl('');
      return undefined;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return (
    <>
      <Button
        disabled={disabled || loading.isLoading}
        onClick={async () => {
          setError('');
          try {
            setFile(await preview({ ...context, choices }).unwrap());
          } catch {
            setError(
              'Preview could not be generated. Complete the custom images and principal details, then retry.'
            );
          }
        }}
      >
        {loading.isLoading ? 'Preparing preview…' : 'Preview document'}
      </Button>
      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {file && (
        <CustomDialog
          open
          title="School Identity Preview"
          hasForm={false}
          hasUnsavedChanges={false}
          maxWidth="lg"
          handleClose={() => setFile(null)}
        >
          <DialogScrollContent>
            <FormSectionCard icon="mdi:file-document-outline" title="Generated document">
              {url && (
                <Box
                  component="iframe"
                  src={url}
                  title="School Identity PDF preview"
                  sx={{ width: 1, height: { xs: 400, md: 600 }, border: 0 }}
                />
              )}
            </FormSectionCard>
          </DialogScrollContent>
          <DialogActions>
            <Button component="a" href={url} download="school-identity-preview.pdf">
              Download preview
            </Button>
            <Button onClick={() => setFile(null)}>Close</Button>
          </DialogActions>
        </CustomDialog>
      )}
    </>
  );
}
