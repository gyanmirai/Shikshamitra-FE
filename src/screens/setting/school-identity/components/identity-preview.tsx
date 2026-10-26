import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import DialogActions from '@mui/material/DialogActions';
import { FormSectionCard } from 'src/components/form-section-card';
import PdfPreview from 'src/components/preview-document/pdf-preview';
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
        startIcon={<Iconify icon={GlobalIcons.eye} />}
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
          titleInfo="Review the generated document with the current identity choices before downloading."
          hasForm={false}
          hasUnsavedChanges={false}
          maxWidth="lg"
          handleClose={() => setFile(null)}
        >
          <DialogScrollContent>
            <FormSectionCard
              icon="mdi:file-document-outline"
              title="Generated Document"
              descriptionTooltip="This PDF shows the selected school images and signing details."
            >
              {url && <PdfPreview url={url} title="School Identity PDF preview" />}
            </FormSectionCard>
          </DialogScrollContent>
          <DialogActions>
            <Button
              component="a"
              href={url}
              download="school-identity-preview.pdf"
              startIcon={<Iconify icon={GlobalIcons.download} />}
            >
              Download preview
            </Button>
            <Button
              variant="outlined"
              onClick={() => setFile(null)}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Close
            </Button>
          </DialogActions>
        </CustomDialog>
      )}
    </>
  );
}
