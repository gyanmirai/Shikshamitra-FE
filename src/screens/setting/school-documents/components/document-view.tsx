import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { FormSectionCard } from 'src/components/form-section-card';
import { Stack, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { documentCategories } from '../types';
import { DocumentFileList } from './document-file-list';

import type { SchoolDocument } from '../types';

function DocumentFact({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
        {value}
      </Typography>
    </Stack>
  );
}

export function DocumentView({
  document,
  onClose,
}: {
  document: SchoolDocument;
  onClose: () => void;
}) {
  return (
    <CustomDialog
      open
      hasForm={false}
      guardUnsavedChanges={false}
      maxWidth="sm"
      title="School Document"
      titleInfo="View the saved document details and preview or download its attachments."
      handleClose={onClose}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          <FormSectionCard
            title="Document Details"
            icon={GlobalIcons.doc}
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
            descriptionTooltip="These details identify this school document and who uploaded it."
          >
            <DocumentFact label="Document name" value={document.name} />
            <DocumentFact
              label="Category"
              value={
                documentCategories.find((item) => item.value === document.category)?.label ??
                'Other'
              }
            />
            <DocumentFact label="Notes" value={document.notes || 'No notes added.'} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <DocumentFact label="Uploaded by" value={document.uploadedBy} />
              <DocumentFact label="Uploaded on" value={fDateTime(document.creationTime) ?? ''} />
            </Stack>
          </FormSectionCard>
          <FormSectionCard
            title="Attachments"
            icon={GlobalIcons.upload}
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
            descriptionTooltip="Open individual files to preview them or download a copy."
          >
            <DocumentFileList documentId={document.id} files={document.files} />
          </FormSectionCard>
        </Stack>
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
